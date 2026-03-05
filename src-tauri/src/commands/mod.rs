use tauri::{Builder, Runtime};

/// Attach custom commands here once they exist.
pub fn register<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder.invoke_handler(tauri::generate_handler![])
}
