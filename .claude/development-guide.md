# Development Guide

## Running the App

### Development Mode
```bash
bun run tauri:dev
# OR
npm run tauri:dev
```

This starts:
- Vite dev server on `http://localhost:1420`
- Tauri app with hot-reload
- Rust backend compiler watching for changes

### What Auto-Reloads?

✅ **Frontend (React/TS/SASS)**: Auto-reloads instantly
✅ **Rust Backend**: Auto-recompiles on save
⚠️ **After Rust recompile**: Refresh the window with `Ctrl+R` or `F5`

### Opening DevTools

- Right-click in the app → "Inspect Element"
- OR press `F12`
- Same as Chrome/Edge DevTools

## Building for Production

```bash
bun run tauri:build
# OR
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/`

## Common Issues

### Rust changes not reflecting
1. Wait for "Finished" in terminal (Rust recompile)
2. Refresh app window: `Ctrl+R` or `F5`

### Port 1420 already in use
Kill the Vite server:
```bash
# Windows
taskkill /F /IM node.exe
# Then restart
bun run tauri:dev
```

### Build fails with icon error
Ensure `src-tauri/icons/icon.ico` is a valid Windows ICO file (32x32 minimum)

## Project Structure

```
.
├── src/                    # React frontend
│   ├── App.tsx            # Main component
│   ├── main.tsx           # Entry point
│   └── styles/            # SASS files
├── src-tauri/             # Rust backend
│   ├── src/main.rs        # Tauri commands
│   └── tauri.conf.json    # App configuration
└── package.json           # Dependencies & scripts
```

## Key Files

- `src/App.tsx` - Frontend UI
- `src-tauri/src/main.rs` - Backend Rust commands
- `src-tauri/tauri.conf.json` - Window settings, permissions
- `src/styles/main.scss` - Global styles
