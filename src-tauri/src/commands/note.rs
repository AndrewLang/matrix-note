use tauri::State;

use crate::{
    models::note::{ExportedFiles, Note, NoteCategory},
    services::note_repository::NoteRepository,
};

#[tauri::command]
pub fn get_categories(repository: State<'_, NoteRepository>) -> Result<Vec<NoteCategory>, String> {
    repository
        .get_categories()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_category(
    category_id: i64,
    repository: State<'_, NoteRepository>,
) -> Result<Option<NoteCategory>, String> {
    repository
        .get_category(category_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_category(
    category: NoteCategory,
    repository: State<'_, NoteRepository>,
) -> Result<NoteCategory, String> {
    repository
        .save_category(category)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn update_category(
    category: NoteCategory,
    repository: State<'_, NoteRepository>,
) -> Result<NoteCategory, String> {
    repository
        .update_category(category)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_category(
    category_id: i64,
    repository: State<'_, NoteRepository>,
) -> Result<(), String> {
    repository
        .delete_category(category_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_notes(
    category_id: Option<i64>,
    repository: State<'_, NoteRepository>,
) -> Result<Vec<Note>, String> {
    repository
        .get_notes(category_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_note(
    note_id: i64,
    repository: State<'_, NoteRepository>,
) -> Result<Option<Note>, String> {
    repository
        .get_note(note_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn search_notes(
    keyword: String,
    repository: State<'_, NoteRepository>,
) -> Result<Vec<Note>, String> {
    repository
        .search_notes(&keyword)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_note(note: Note, repository: State<'_, NoteRepository>) -> Result<Note, String> {
    repository
        .save_note(note)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn update_note(note: Note, repository: State<'_, NoteRepository>) -> Result<Note, String> {
    repository
        .update_note(note)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_note(note_id: i64, repository: State<'_, NoteRepository>) -> Result<(), String> {
    repository
        .delete_note(note_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn export_note(
    note_id: i64,
    destination_path: String,
    repository: State<'_, NoteRepository>,
) -> Result<String, String> {
    repository
        .export_note(note_id, destination_path)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn export_category_notes(
    category_id: i64,
    destination_dir: String,
    recursive: Option<bool>,
    repository: State<'_, NoteRepository>,
) -> Result<ExportedFiles, String> {
    repository
        .export_category_notes(category_id, destination_dir, recursive.unwrap_or(true))
        .map_err(|error| error.to_string())
}
