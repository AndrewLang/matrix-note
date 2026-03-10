use tauri::{Builder, Runtime};

mod note;
mod system;

pub fn register<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder.invoke_handler(tauri::generate_handler![
        note::get_categories,
        note::get_category,
        note::save_category,
        note::update_category,
        note::delete_category,
        note::get_notes,
        note::get_note,
        note::search_notes,
        note::save_note,
        note::update_note,
        note::delete_note,
        note::export_note,
        note::export_category_notes,
        system::open_link
    ])
}
