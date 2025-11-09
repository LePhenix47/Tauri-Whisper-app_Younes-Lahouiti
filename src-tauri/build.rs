use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    // Get the manifest directory (src-tauri folder)
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let lib_dir = PathBuf::from(&manifest_dir).join("lib");

    // Tell cargo where to find libvosk.lib during linking
    println!("cargo:rustc-link-search=native={}", lib_dir.display());

    // Copy libvosk.dll to target directory for runtime
    let profile = env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());

    // Handle custom CARGO_TARGET_DIR (e.g., C:\t in CI/CD)
    let target_dir = if let Ok(custom_target) = env::var("CARGO_TARGET_DIR") {
        PathBuf::from(custom_target).join(&profile)
    } else {
        PathBuf::from(&manifest_dir).join("target").join(&profile)
    };

    let dll_source = lib_dir.join("libvosk.dll");

    // Copy to target directory (for running the binary directly)
    let dll_dest = target_dir.join("libvosk.dll");
    if dll_source.exists() {
        fs::create_dir_all(&target_dir).ok();
        fs::copy(&dll_source, &dll_dest).ok();
        println!("cargo:warning=Copied libvosk.dll to {}", dll_dest.display());
    }

    // Tell Tauri to include the DLL in the bundle by setting cargo:rerun-if-changed
    println!("cargo:rerun-if-changed={}", dll_source.display());

    tauri_build::build()
}
