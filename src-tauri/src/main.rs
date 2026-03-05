#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use matrix_notebook::AppBuilder;

fn main() {
    AppBuilder::default().run();
}
