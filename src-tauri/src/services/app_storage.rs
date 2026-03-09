use std::{fs, path::PathBuf};

use anyhow::{Context, Result};
use tauri::{AppHandle, Manager, Runtime};

const COMPANY_DIR: &str = "Matrix Republic";
const APP_DIR: &str = "Note";

pub fn app_storage_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf> {
    let base_dir = app
        .path()
        .local_data_dir()
        .context("failed to resolve local app data directory")?;

    let storage_dir = base_dir.join(COMPANY_DIR).join(APP_DIR);
    fs::create_dir_all(&storage_dir).context("failed to create app storage directory")?;
    Ok(storage_dir)
}
