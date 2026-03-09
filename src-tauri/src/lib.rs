pub mod commands;
pub mod models;
pub mod note_repository;

use note_repository::NoteRepository;
use tauri::{Builder, Manager};

pub struct AppBuilder;

impl Default for AppBuilder {
    fn default() -> Self {
        Self
    }
}

impl AppBuilder {
    pub fn run(self) {
        self.builder()
            .run(tauri::generate_context!())
            .expect("failed to run Matrix Notebook");
    }

    fn builder(&self) -> Builder<tauri::Wry> {
        let builder = Builder::default()
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .setup(|app| {
                let repository = NoteRepository::new(&app.handle())?;
                app.manage(repository);
                Ok(())
            });
        commands::register(builder)
    }
}
