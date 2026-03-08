use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub category_id: Option<i64>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteCategory {
    pub id: i64,
    pub name: String,
    pub parent_id: Option<i64>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub is_expanded: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExportedFiles {
    pub files: Vec<String>,
}
