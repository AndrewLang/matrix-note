use std::{
    fs,
    path::PathBuf,
    sync::{Mutex, MutexGuard},
};

use anyhow::{Context, Result};
use rusqlite::{params, Connection, OptionalExtension, Row, Transaction};
use tauri::AppHandle;

use crate::{
    models::note::{ExportedFiles, Note, NoteCategory},
    services::app_storage::app_storage_dir,
};

pub struct NoteRepository {
    connection: Mutex<Connection>,
}

impl NoteRepository {
    pub fn new(app: &AppHandle) -> Result<Self> {
        let database_path = app_storage_dir(app)?.join("matrix-note.db");
        let connection = Connection::open(database_path).context("failed to open note database")?;
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .context("failed to enable foreign keys")?;

        let database = Self {
            connection: Mutex::new(connection),
        };

        database.initialize_schema()?;
        database.seed_default_content()?;
        Ok(database)
    }

    pub fn get_categories(&self) -> Result<Vec<NoteCategory>> {
        let connection = self.connection()?;
        let mut statement = connection.prepare(
            "
            SELECT id, name, parent_id, description, icon, color, is_expanded
            FROM note_categories
            ORDER BY COALESCE(parent_id, 0), name COLLATE NOCASE, id
            ",
        )?;

        let rows = statement.query_map([], Self::map_category)?;
        Self::collect_rows(rows)
    }

    pub fn get_category(&self, category_id: i64) -> Result<Option<NoteCategory>> {
        let connection = self.connection()?;
        connection
            .query_row(
                "
                SELECT id, name, parent_id, description, icon, color, is_expanded
                FROM note_categories
                WHERE id = ?1
                ",
                [category_id],
                Self::map_category,
            )
            .optional()
            .map_err(Into::into)
    }

    pub fn save_category(&self, category: NoteCategory) -> Result<NoteCategory> {
        let connection = self.connection()?;
        connection.execute(
            "
            INSERT INTO note_categories (id, name, parent_id, description, icon, color, is_expanded)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              parent_id = excluded.parent_id,
              description = excluded.description,
              icon = excluded.icon,
              color = excluded.color,
              is_expanded = excluded.is_expanded
            ",
            params![
                category.id,
                category.name,
                category.parent_id,
                category.description,
                category.icon,
                category.color,
                category.is_expanded
            ],
        )?;

        drop(connection);
        self.get_category(category.id)?
            .context(format!("saved category {} was not found", category.id))
    }

    pub fn update_category(&self, category: NoteCategory) -> Result<NoteCategory> {
        let connection = self.connection()?;
        connection.execute(
            "
            UPDATE note_categories
            SET name = ?2,
                parent_id = ?3,
                description = ?4,
                icon = ?5,
                color = ?6,
                is_expanded = ?7
            WHERE id = ?1
            ",
            params![
                category.id,
                category.name,
                category.parent_id,
                category.description,
                category.icon,
                category.color,
                category.is_expanded
            ],
        )?;

        drop(connection);
        self.get_category(category.id)?.context(format!(
            "category {} was not found after update",
            category.id
        ))
    }

    pub fn delete_category(&self, category_id: i64) -> Result<()> {
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;

        transaction.execute(
            "UPDATE notes SET category_id = NULL WHERE category_id = ?1",
            [category_id],
        )?;
        transaction.execute(
            "UPDATE note_categories SET parent_id = NULL WHERE parent_id = ?1",
            [category_id],
        )?;
        transaction.execute("DELETE FROM note_categories WHERE id = ?1", [category_id])?;
        transaction.commit()?;
        Ok(())
    }

    pub fn get_notes(&self, category_id: Option<i64>) -> Result<Vec<Note>> {
        let connection = self.connection()?;
        if let Some(category_id) = category_id {
            let mut statement = connection.prepare(
                "
                SELECT id, title, content, category_id, description, icon, color, created_at, updated_at, tags
                FROM notes
                WHERE category_id = ?1
                ORDER BY updated_at DESC, id DESC
                ",
            )?;
            let rows = statement.query_map([category_id], Self::map_note)?;
            return Self::collect_rows(rows);
        }

        let mut statement = connection.prepare(
            "
            SELECT id, title, content, category_id, description, icon, color, created_at, updated_at, tags
            FROM notes
            ORDER BY updated_at DESC, id DESC
            ",
        )?;
        let rows = statement.query_map([], Self::map_note)?;
        Self::collect_rows(rows)
    }

    pub fn get_note(&self, note_id: i64) -> Result<Option<Note>> {
        let connection = self.connection()?;
        connection
            .query_row(
                "
                SELECT id, title, content, category_id, description, icon, color, created_at, updated_at, tags
                FROM notes
                WHERE id = ?1
                ",
                [note_id],
                Self::map_note,
            )
            .optional()
            .map_err(Into::into)
    }

    pub fn save_note(&self, note: Note) -> Result<Note> {
        let connection = self.connection()?;
        let tags = Self::serialize_tags(&note.tags)?;

        connection.execute(
            "
            INSERT INTO notes (
              id, title, content, category_id, description, icon, color, created_at, updated_at, tags
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              content = excluded.content,
              category_id = excluded.category_id,
              description = excluded.description,
              icon = excluded.icon,
              color = excluded.color,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              tags = excluded.tags
            ",
            params![
                note.id,
                note.title,
                note.content,
                note.category_id,
                note.description,
                note.icon,
                note.color,
                note.created_at,
                note.updated_at,
                tags
            ],
        )?;

        drop(connection);
        self.get_note(note.id)?
            .context(format!("saved note {} was not found", note.id))
    }

    pub fn update_note(&self, note: Note) -> Result<Note> {
        let connection = self.connection()?;
        let tags = Self::serialize_tags(&note.tags)?;

        connection.execute(
            "
            UPDATE notes
            SET title = ?2,
                content = ?3,
                category_id = ?4,
                description = ?5,
                icon = ?6,
                color = ?7,
                updated_at = ?8,
                tags = ?9
            WHERE id = ?1
            ",
            params![
                note.id,
                note.title,
                note.content,
                note.category_id,
                note.description,
                note.icon,
                note.color,
                note.updated_at,
                tags
            ],
        )?;

        drop(connection);
        self.get_note(note.id)?
            .context(format!("note {} was not found after update", note.id))
    }

    pub fn delete_note(&self, note_id: i64) -> Result<()> {
        let connection = self.connection()?;
        connection.execute("DELETE FROM notes WHERE id = ?1", [note_id])?;
        Ok(())
    }

    pub fn export_note(&self, note_id: i64, destination_path: String) -> Result<String> {
        let note = self
            .get_note(note_id)?
            .context(format!("note {note_id} was not found"))?;

        let output_path = PathBuf::from(destination_path);
        if let Some(parent) = output_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(&output_path, note.content).with_context(|| {
            format!(
                "failed to write note {} to {}",
                note_id,
                output_path.display()
            )
        })?;

        Ok(output_path.to_string_lossy().into_owned())
    }

    pub fn export_category_notes(
        &self,
        category_id: i64,
        destination_dir: String,
        recursive: bool,
    ) -> Result<ExportedFiles> {
        let mut connection = self.connection()?;
        let transaction = connection.transaction()?;
        let category = Self::query_category(&transaction, category_id)?
            .context(format!("category {category_id} was not found"))?;

        let category_ids = if recursive {
            Self::collect_descendant_category_ids(&transaction, category_id)?
        } else {
            vec![category_id]
        };

        let notes = Self::query_notes_for_categories(&transaction, &category_ids)?;
        transaction.commit()?;
        drop(connection);

        let base_dir = PathBuf::from(destination_dir).join(Self::sanitize_filename(&category.name));
        fs::create_dir_all(&base_dir)?;

        let mut files = Vec::with_capacity(notes.len());
        for note in notes {
            let file_path = base_dir.join(Self::note_file_name(&note.title));
            fs::write(&file_path, note.content)?;
            files.push(file_path.to_string_lossy().into_owned());
        }

        Ok(ExportedFiles { files })
    }

    fn initialize_schema(&self) -> Result<()> {
        let connection = self.connection()?;
        connection.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS note_categories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              parent_id INTEGER NULL REFERENCES note_categories(id) ON DELETE SET NULL,
              description TEXT NULL,
              icon TEXT NULL,
              color TEXT NULL,
              is_expanded INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              content TEXT NOT NULL DEFAULT '',
              category_id INTEGER NULL REFERENCES note_categories(id) ON DELETE SET NULL,
              description TEXT NULL,
              icon TEXT NULL,
              color TEXT NULL,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL,
              tags TEXT NOT NULL DEFAULT '[]'
            );
            ",
        )?;

        Ok(())
    }

    fn seed_default_content(&self) -> Result<()> {
        let connection = self.connection()?;
        let existing_category_count: i64 =
            connection.query_row("SELECT COUNT(*) FROM note_categories", [], |row| row.get(0))?;
        if existing_category_count > 0 {
            return Ok(());
        }

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_millis() as i64)
            .unwrap_or(0);

        connection.execute(
            "
            INSERT INTO note_categories (name, parent_id, description, icon, color, is_expanded)
            VALUES (?1, NULL, ?2, ?3, ?4, 1)
            ",
            params![
                "Matrix Note",
                "Default workspace",
                "folderOutline",
                "text-sky-500"
            ],
        )?;

        let category_id = connection.last_insert_rowid();
        connection.execute(
            "
            INSERT INTO notes (title, content, category_id, description, icon, color, created_at, updated_at, tags)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            ",
            params![
                "Features",
                Self::default_features_note_content(),
                category_id,
                "Overview of Matrix Note",
                "document",
                "text-blue-500",
                now,
                now,
                "[]"
            ],
        )?;

        Ok(())
    }

    fn connection(&self) -> Result<MutexGuard<'_, Connection>> {
        self.connection
            .lock()
            .map_err(|_| anyhow::anyhow!("failed to acquire note database lock"))
    }

    fn collect_rows<T>(
        rows: rusqlite::MappedRows<'_, impl FnMut(&Row<'_>) -> rusqlite::Result<T>>,
    ) -> Result<Vec<T>> {
        rows.collect::<rusqlite::Result<Vec<T>>>()
            .map_err(Into::into)
    }

    fn serialize_tags(tags: &[String]) -> Result<String> {
        serde_json::to_string(tags).context("failed to serialize note tags")
    }

    fn default_features_note_content() -> &'static str {
        "# Features\n\n- Local-first notes stored on your device\n- Folder-based organization with nested categories\n- Markdown editing with live preview\n- Window size and position persistence\n- Settings for theme, autosave, and AI provider\n"
    }

    fn query_category(
        transaction: &Transaction<'_>,
        category_id: i64,
    ) -> Result<Option<NoteCategory>> {
        transaction
            .query_row(
                "
                SELECT id, name, parent_id, description, icon, color, is_expanded
                FROM note_categories
                WHERE id = ?1
                ",
                [category_id],
                Self::map_category,
            )
            .optional()
            .map_err(Into::into)
    }

    fn collect_descendant_category_ids(
        transaction: &Transaction<'_>,
        root_category_id: i64,
    ) -> Result<Vec<i64>> {
        let mut ids = vec![root_category_id];
        let mut cursor = 0;

        while cursor < ids.len() {
            let parent_id = ids[cursor];
            cursor += 1;

            let mut statement = transaction
                .prepare("SELECT id FROM note_categories WHERE parent_id = ?1 ORDER BY id")?;
            let child_rows = statement.query_map([parent_id], |row| row.get::<_, i64>(0))?;
            for child_id in child_rows {
                ids.push(child_id?);
            }
        }

        Ok(ids)
    }

    fn query_notes_for_categories(
        transaction: &Transaction<'_>,
        category_ids: &[i64],
    ) -> Result<Vec<Note>> {
        let mut notes = Vec::new();
        let mut statement = transaction.prepare(
            "
            SELECT id, title, content, category_id, description, icon, color, created_at, updated_at, tags
            FROM notes
            WHERE category_id = ?1
            ORDER BY updated_at DESC, id DESC
            ",
        )?;

        for category_id in category_ids {
            let rows = statement.query_map([category_id], Self::map_note)?;
            notes.extend(rows.collect::<rusqlite::Result<Vec<_>>>()?);
        }

        Ok(notes)
    }

    fn note_file_name(title: &str) -> String {
        let sanitized = Self::sanitize_filename(title);
        if sanitized.to_ascii_lowercase().ends_with(".md") {
            sanitized
        } else {
            format!("{sanitized}.md")
        }
    }

    fn sanitize_filename(value: &str) -> String {
        let sanitized: String = value
            .chars()
            .map(|character| match character {
                '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
                _ => character,
            })
            .collect::<String>()
            .trim()
            .to_string();

        if sanitized.is_empty() {
            "untitled".to_string()
        } else {
            sanitized
        }
    }

    fn map_note(row: &Row<'_>) -> rusqlite::Result<Note> {
        let tags_json: String = row.get("tags")?;
        let tags = serde_json::from_str::<Vec<String>>(&tags_json).unwrap_or_default();

        Ok(Note {
            id: row.get("id")?,
            title: row.get("title")?,
            content: row.get("content")?,
            category_id: row.get("category_id")?,
            description: row.get("description")?,
            icon: row.get("icon")?,
            color: row.get("color")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
            tags,
        })
    }

    fn map_category(row: &Row<'_>) -> rusqlite::Result<NoteCategory> {
        Ok(NoteCategory {
            id: row.get("id")?,
            name: row.get("name")?,
            parent_id: row.get("parent_id")?,
            description: row.get("description")?,
            icon: row.get("icon")?,
            color: row.get("color")?,
            is_expanded: row.get("is_expanded")?,
        })
    }
}
