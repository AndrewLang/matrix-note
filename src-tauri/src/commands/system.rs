use tauri::{AppHandle, Runtime};
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub fn open_link<R: Runtime>(url: String, app: AppHandle<R>) -> Result<(), String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Err("URL must not be empty.".into());
    }

    #[allow(deprecated)]
    app.shell()
        .open(trimmed, None)
        .map_err(|error| error.to_string())
}
