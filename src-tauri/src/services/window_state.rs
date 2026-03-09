use std::{
    collections::HashMap,
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::{
    AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize, Runtime, WebviewWindow,
    WindowEvent,
};

use crate::services::app_storage::app_storage_dir;

const WINDOW_STATE_FILE: &str = "window-state.json";
const MAIN_WINDOW_LABEL: &str = "main";

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
struct PersistedWindowState {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
    maximized: bool,
    fullscreen: bool,
}

#[derive(Clone)]
pub struct WindowStateService {
    path: PathBuf,
    states: Arc<Mutex<HashMap<String, PersistedWindowState>>>,
}

impl WindowStateService {
    pub fn new<R: Runtime>(app: &AppHandle<R>) -> Result<Self> {
        let path = app_storage_dir(app)?.join(WINDOW_STATE_FILE);
        let states = fs::read_to_string(&path)
            .ok()
            .and_then(|content| serde_json::from_str::<HashMap<String, PersistedWindowState>>(&content).ok())
            .unwrap_or_default();

        Ok(Self {
            path,
            states: Arc::new(Mutex::new(states)),
        })
    }

    pub fn setup_main_window<R: Runtime>(&self, app: &AppHandle<R>) -> Result<()> {
        let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
            return Ok(());
        };

        self.restore_window(&window)?;
        self.track_window(window);
        Ok(())
    }

    pub fn persist_all(&self) -> Result<()> {
        let states = self.states.lock().unwrap();
        fs::write(&self.path, serde_json::to_vec_pretty(&*states)?)?;
        Ok(())
    }

    fn restore_window<R: Runtime>(&self, window: &WebviewWindow<R>) -> Result<()> {
        let label = window.label().to_string();
        if let Some(state) = self.states.lock().unwrap().get(&label).cloned() {
            if state.width > 0 && state.height > 0 {
                window.set_size(PhysicalSize::new(state.width, state.height))?;
            }

            let position = PhysicalPosition::new(state.x, state.y);
            let size = PhysicalSize::new(state.width, state.height);
            if self.window_fits_any_monitor(window, position, size)? {
                window.set_position(position)?;
            }

            if state.fullscreen {
                window.set_fullscreen(true)?;
            } else if state.maximized {
                window.maximize()?;
            }
        }

        window.show()?;
        window.set_focus()?;
        Ok(())
    }

    fn track_window<R: Runtime>(&self, window: WebviewWindow<R>) {
        let service = self.clone();
        let label = window.label().to_string();

        {
            let mut states = service.states.lock().unwrap();
            states
                .entry(label.clone())
                .or_insert_with(PersistedWindowState::default);
        }

        let tracked_window = window.clone();
        window.on_window_event(move |event| match event {
            WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
                let _ = service.capture_window_state(&tracked_window);
            }
            WindowEvent::CloseRequested { .. } | WindowEvent::Destroyed => {
                let _ = service.capture_window_state(&tracked_window);
                let _ = service.persist_all();
            }
            _ => {}
        });
    }

    fn capture_window_state<R: Runtime>(&self, window: &WebviewWindow<R>) -> Result<()> {
        let label = window.label().to_string();
        let is_minimized = window.is_minimized().unwrap_or(false);
        let is_maximized = window.is_maximized().unwrap_or(false);
        let is_fullscreen = window.is_fullscreen().unwrap_or(false);

        let mut states = self.states.lock().unwrap();
        let state = states.entry(label).or_default();
        state.maximized = is_maximized;
        state.fullscreen = is_fullscreen;

        if !is_minimized && !is_maximized && !is_fullscreen {
            let size = window.inner_size()?;
            let position = window.outer_position()?;
            if size.width > 0 && size.height > 0 {
                state.width = size.width;
                state.height = size.height;
                state.x = position.x;
                state.y = position.y;
            }
        }

        Ok(())
    }

    fn window_fits_any_monitor<R: Runtime>(
        &self,
        window: &WebviewWindow<R>,
        position: PhysicalPosition<i32>,
        size: PhysicalSize<u32>,
    ) -> Result<bool> {
        Ok(window
            .available_monitors()?
            .into_iter()
            .any(|monitor| monitor.intersects(position, size)))
    }
}

trait MonitorExt {
    fn intersects(&self, position: PhysicalPosition<i32>, size: PhysicalSize<u32>) -> bool;
}

impl MonitorExt for Monitor {
    fn intersects(&self, position: PhysicalPosition<i32>, size: PhysicalSize<u32>) -> bool {
        let PhysicalPosition { x, y } = *self.position();
        let PhysicalSize { width, height } = *self.size();

        let left = x;
        let right = x + width as i32;
        let top = y;
        let bottom = y + height as i32;

        [
            (position.x, position.y),
            (position.x + size.width as i32, position.y),
            (position.x, position.y + size.height as i32),
            (
                position.x + size.width as i32,
                position.y + size.height as i32,
            ),
        ]
        .into_iter()
        .any(|(point_x, point_y)| {
            point_x >= left && point_x < right && point_y >= top && point_y < bottom
        })
    }
}
