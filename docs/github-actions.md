# GitHub Actions CI/CD Guide

## Overview

Our CI/CD pipeline runs on every push/PR to `master` and performs:
1. **Rust tests** - Verify backend logic
2. **Build app** - Compile for Windows/Linux/macOS
3. **Create artifacts** - Upload build files
4. **Release** (commented) - Publish releases when ready

## Workflow File

Location: `.github/workflows/ci-cd.yml`

## Pipeline Stages

### Stage 1: Test Rust

Runs on `windows-latest` (fastest for our setup).

```yaml
test-rust:
  runs-on: windows-latest
  steps:
    - Checkout code
    - Setup Rust toolchain
    - Cache dependencies (speeds up builds)
    - Run: cargo test --verbose
```

**What it does:**
- Runs all tests in `src-tauri/tests/`
- Fails the pipeline if any test fails
- Uses caching to avoid re-downloading dependencies

### Stage 2: Build App

Runs on **3 platforms** in parallel (after tests pass):
- `windows-latest` → `.exe` / `.msi`
- `ubuntu-latest` → `.deb` / `.AppImage`
- `macos-latest` → `.dmg` / `.app`

```yaml
build:
  needs: test-rust  # Waits for tests to pass
  strategy:
    matrix:
      os: [windows-latest, ubuntu-latest, macos-latest]
  steps:
    - Setup Node.js 20
    - Setup Bun (faster than npm)
    - Setup Rust
    - Install system dependencies (Linux only)
    - Cache dependencies
    - bun install
    - bun run tauri:build
    - Upload artifacts
```

**Build outputs:**
- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- Linux: `src-tauri/target/release/bundle/deb/*.deb`, `.AppImage`
- macOS: `src-tauri/target/release/bundle/dmg/*.dmg`, `.app`

**Artifacts retention:** 7 days (configurable)

### Stage 3: Release (COMMENTED)

Creates GitHub releases with build artifacts.

**Currently disabled because:**
- Requires GitHub Actions minutes (costs money for private repos)
- Only needed when publishing releases

**To enable:**
1. Uncomment the `release` job in `ci-cd.yml`
2. Create a GitHub release (tag `v1.0.0`, etc.)
3. Workflow auto-uploads build files to release

```yaml
# Uncomment this section when ready
release:
  needs: build
  if: github.event_name == 'release'
  steps:
    - Download artifacts from build job
    - Upload to GitHub release
```

## Triggers

### On Push/PR
```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

Runs tests + build on every commit to master.

### On Release (commented)
```yaml
# release:
#   types: [created]
```

Runs full pipeline + publishes artifacts when you create a release.

## Caching Strategy

**What's cached:**
- `src-tauri/target/` - Compiled Rust artifacts
- `~/.cargo/registry/` - Downloaded Rust crates
- `~/.cargo/git/` - Git dependencies

**Why:** Speeds up builds from ~15min → ~5min

**Cache key:** Based on `Cargo.lock` hash
- Changes when dependencies update
- Ensures fresh cache for new deps

## Platform-Specific Setup

### Ubuntu
Needs system libraries for WebKit:
```bash
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.0-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

### Windows
No extra setup needed (uses Edge WebView2).

### macOS
No extra setup needed (uses Safari WebView).

## Running Locally

**Test what CI will run:**

```bash
# Rust tests
cd src-tauri
cargo test

# Full build
bun run tauri:build
```

## Artifacts

**Where to find:**
1. Go to GitHub repo → Actions tab
2. Click on a workflow run
3. Scroll down to "Artifacts" section
4. Download `tauri-app-windows-latest` (or ubuntu/macos)

**What's inside:**
```
tauri-app-windows-latest/
└── msi/
    └── tauri-whisper-app_0.0.1_x64_en-US.msi
```

**Retention:** 7 days (free tier limit)

## Cost Considerations

### Free Tier (Public Repos)
- ✅ Unlimited minutes
- ✅ All features available

### Free Tier (Private Repos)
- ⚠️ 2,000 minutes/month
- ⚠️ Windows = 2x multiplier (1 min = 2 min)
- ⚠️ macOS = 10x multiplier (1 min = 10 min)

**Our pipeline:**
- Rust tests: ~2 min (Windows) = 4 min charged
- Build Windows: ~10 min = 20 min charged
- Build Ubuntu: ~12 min = 12 min charged
- Build macOS: ~15 min = 150 min charged
- **Total per run: ~186 minutes**

**Why release job is commented:**
- Each release would use ~200 minutes
- 2,000 min / 200 = max 10 releases/month
- Better to enable only when needed

## Enabling Releases

**When you're ready to publish:**

1. **Uncomment release job** in `ci-cd.yml`:
```yaml
release:
  name: Create Release
  needs: build
  runs-on: ubuntu-latest
  if: github.event_name == 'release'
  # ... rest of job
```

2. **Create a release on GitHub:**
```bash
git tag v1.0.0
git push origin v1.0.0
```
Then create release via GitHub UI.

3. **Workflow auto-uploads build files** to release.

## Troubleshooting

### Build fails on Ubuntu
**Issue:** Missing system dependencies
**Fix:** Verify `apt-get install` command includes all required libs

### Build fails on macOS
**Issue:** Code signing (requires Apple Developer account)
**Fix:** Add `tauri.bundle.macOS.signingIdentity: null` to skip signing

### Tests fail but pass locally
**Issue:** Different environment (paths, permissions)
**Fix:** Use temp directories in tests, avoid hardcoded paths

### Artifacts not uploading
**Issue:** Wrong path in `upload-artifact`
**Fix:** Check `src-tauri/target/release/bundle/` structure

### Cache not working
**Issue:** Cache key mismatch
**Fix:** Ensure `Cargo.lock` is committed to repo

## Status Badge

Add to README.md:
```markdown
![CI/CD](https://github.com/YOUR_USERNAME/tauri-whisper-app/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Future Improvements

- [ ] Add frontend tests (Vitest)
- [ ] Add linting step (Biome)
- [ ] Add code coverage reporting
- [ ] Auto-version bumping
- [ ] Changelog generation
- [ ] Nightly builds
- [ ] Performance benchmarks

## Commands Reference

```bash
# Test workflow locally (requires act)
act -j test-rust

# Validate workflow syntax
gh workflow view ci-cd.yml

# Manually trigger workflow
gh workflow run ci-cd.yml

# Check workflow status
gh run list
```

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Tauri CI Guide](https://tauri.app/v1/guides/building/ci/)
- [Action: tauri-action](https://github.com/tauri-apps/tauri-action) (alternative approach)
