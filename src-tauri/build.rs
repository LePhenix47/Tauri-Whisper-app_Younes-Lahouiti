use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    // Get the manifest directory (src-tauri folder)
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let src_tauri_dir = PathBuf::from(&manifest_dir);
    let lib_dir = src_tauri_dir.join("lib");

    // Tell cargo where to find libvosk.lib during linking (Windows)
    println!("cargo:rustc-link-search=native={}", lib_dir.display());

    let profile = env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap();

    // Handle custom CARGO_TARGET_DIR (e.g., C:\t in CI/CD)
    let target_dir = if let Ok(custom_target) = env::var("CARGO_TARGET_DIR") {
        PathBuf::from(custom_target).join(&profile)
    } else {
        src_tauri_dir.join("target").join(&profile)
    };

    // Platform-specific library bundling
    match target_os.as_str() {
        "windows" => {
            // Copy Windows DLLs from lib/ directory
            let libs = vec![
                "libvosk.dll",
                "libgcc_s_seh-1.dll",
                "libstdc++-6.dll",
                "vulkan-1.dll",
            ];

            for lib_name in libs {
                let lib_source = lib_dir.join(lib_name);
                let lib_dest = target_dir.join(lib_name);

                if lib_source.exists() {
                    fs::create_dir_all(&target_dir).ok();
                    fs::copy(&lib_source, &lib_dest).ok();
                    println!("cargo:warning=Copied {} to {}", lib_name, lib_dest.display());
                }
                println!("cargo:rerun-if-changed={}", lib_source.display());
            }

            // Copy Windows DLLs from src-tauri root to target for bundling
            let root_libs = vec!["vulkan-1.dll", "libvosk.dll", "libgcc_s_seh-1.dll", "libstdc++-6.dll"];
            for lib_name in root_libs {
                let lib_source = src_tauri_dir.join(lib_name);
                let lib_dest = target_dir.join(lib_name);

                if lib_source.exists() {
                    fs::copy(&lib_source, &lib_dest).ok();
                }
            }
        }
        "linux" => {
            // Copy only libvosk.so for Linux
            let lib_source = src_tauri_dir.join("libvosk.so");
            let lib_dest = target_dir.join("libvosk.so");

            if lib_source.exists() {
                fs::create_dir_all(&target_dir).ok();
                fs::copy(&lib_source, &lib_dest).ok();
                println!("cargo:warning=Copied libvosk.so to {}", lib_dest.display());
            }
            println!("cargo:rerun-if-changed={}", lib_source.display());
        }
        _ => {
            // macOS or other platforms - no vosk bundling
            println!("cargo:warning=No platform-specific libraries to bundle for {}", target_os);
        }
    }

    tauri_build::build()
}
