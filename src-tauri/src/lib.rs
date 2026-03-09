pub mod commands;
pub mod models;
pub mod services;

use services::{note_repository::NoteRepository, window_state::WindowStateService};
use tauri::{Builder, Manager, RunEvent};

pub struct AppBuilder;

impl Default for AppBuilder {
    fn default() -> Self {
        Self
    }
}

impl AppBuilder {
    pub fn run(self) {
        let app = self
            .builder()
            .build(tauri::generate_context!())
            .expect("failed to build Matrix Notebook");

        app.run(|app, event| {
            if let RunEvent::Exit = event {
                let window_state = app.state::<WindowStateService>();
                let _ = window_state.persist_all();
            }
        });
    }

    fn builder(&self) -> Builder<tauri::Wry> {
        let builder = Builder::default()
            .plugin(tauri_plugin_shell::init())
            .setup(|app| {
                let repository = NoteRepository::new(&app.handle())?;
                let window_state = WindowStateService::new(&app.handle())?;
                app.manage(repository);
                app.manage(window_state.clone());
                window_state.setup_main_window(&app.handle())?;
                Ok(())
            });
        commands::register(builder)
    }
}
