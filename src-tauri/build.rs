use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let src_tauri_dir = PathBuf::from(&manifest_dir);
    let lib_dir = src_tauri_dir.join("lib");
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap();

    // Tell cargo where to find libvosk.lib during linking (Windows only)
    if target_os == "windows" {
        println!("cargo:rustc-link-search=native={}", lib_dir.display());
    }

    // Platform-specific library copying for dev builds (cargo run)
    // Production builds use tauri.{platform}.conf.json resources
    let profile = env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());
    let target_dir = if let Ok(custom_target) = env::var("CARGO_TARGET_DIR") {
        PathBuf::from(custom_target).join(&profile)
    } else {
        src_tauri_dir.join("target").join(&profile)
    };

    let libs_to_copy = match target_os.as_str() {
        "windows" => vec!["libvosk.dll", "libgcc_s_seh-1.dll", "libstdc++-6.dll", "vulkan-1.dll"],
        "linux" => vec!["libvosk.so"],
        _ => vec![],
    };

    for lib_name in libs_to_copy {
        // Try lib/ directory first (Windows), then src-tauri root (all platforms)
        let lib_source = if lib_dir.join(lib_name).exists() {
            lib_dir.join(lib_name)
        } else {
            src_tauri_dir.join(lib_name)
        };

        if lib_source.exists() {
            let lib_dest = target_dir.join(lib_name);
            fs::create_dir_all(&target_dir).ok();
            if let Err(e) = fs::copy(&lib_source, &lib_dest) {
                eprintln!("Warning: Failed to copy {}: {}", lib_name, e);
            }
        }

        println!("cargo:rerun-if-changed={}", lib_source.display());
    }

    tauri_build::build()
}
