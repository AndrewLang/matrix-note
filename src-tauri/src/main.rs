#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use matrix_notebook_core::AppBuilder;

fn main() {
    AppBuilder::default().run();
}
