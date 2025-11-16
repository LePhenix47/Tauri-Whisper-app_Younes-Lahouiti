#!/bin/bash

# sync-windows-dlls.sh
# Syncs Windows DLL files from lib/ to src-tauri/ and updates build configs

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LIB_DIR="$PROJECT_ROOT/src-tauri/lib"
SRC_TAURI_DIR="$PROJECT_ROOT/src-tauri"

echo "🔄 Syncing Windows DLL files..."
echo "   From: $LIB_DIR"
echo "   To:   $SRC_TAURI_DIR"
echo ""

# Check if lib directory exists
if [ ! -d "$LIB_DIR" ]; then
    echo "❌ Error: lib/ directory not found at $LIB_DIR"
    exit 1
fi

# Find all DLL files in lib/
DLL_FILES=($(find "$LIB_DIR" -maxdepth 1 -name "*.dll" -type f -printf "%f\n"))

if [ ${#DLL_FILES[@]} -eq 0 ]; then
    echo "⚠️  No DLL files found in lib/"
    exit 0
fi

echo "📦 Found ${#DLL_FILES[@]} DLL file(s):"
for dll in "${DLL_FILES[@]}"; do
    echo "   - $dll"
done
echo ""

# Copy DLLs to src-tauri/
echo "📋 Copying DLLs to src-tauri/..."
for dll in "${DLL_FILES[@]}"; do
    cp "$LIB_DIR/$dll" "$SRC_TAURI_DIR/$dll"
    echo "   ✓ Copied $dll"
done
echo ""

# Update build.rs
echo "🔧 Updating build.rs..."
BUILD_RS="$SRC_TAURI_DIR/build.rs"

# Create DLL list for build.rs (Rust vec syntax)
DLL_LIST=""
for dll in "${DLL_FILES[@]}"; do
    DLL_LIST="${DLL_LIST}\"$dll\", "
done
DLL_LIST="${DLL_LIST%, }"  # Remove trailing comma and space

# Update build.rs windows section
sed -i.bak "s/\"windows\" => vec!\[.*\],/\"windows\" => vec![$DLL_LIST],/" "$BUILD_RS"
rm -f "$BUILD_RS.bak"
echo "   ✓ Updated build.rs"
echo ""

# Update tauri.windows.conf.json
echo "🔧 Updating tauri.windows.conf.json..."
WINDOWS_CONF="$SRC_TAURI_DIR/tauri.windows.conf.json"

# Create JSON array
JSON_ARRAY=""
for dll in "${DLL_FILES[@]}"; do
    JSON_ARRAY="${JSON_ARRAY}      \"$dll\",\n"
done
JSON_ARRAY="${JSON_ARRAY%,\\n}"  # Remove trailing comma

# Update config file
cat > "$WINDOWS_CONF" <<EOF
{
  "bundle": {
    "resources": [
$(echo -e "$JSON_ARRAY")
    ]
  }
}
EOF

echo "   ✓ Updated tauri.windows.conf.json"
echo ""

echo "✅ Sync complete!"
echo ""
echo "📝 Summary:"
echo "   - Copied ${#DLL_FILES[@]} DLL files to src-tauri/"
echo "   - Updated build.rs"
echo "   - Updated tauri.windows.conf.json"
echo ""
echo "💡 Next steps:"
echo "   1. Review the changes with: git diff"
echo "   2. Test the build with: bun run tauri:build"
echo "   3. Commit if everything looks good!"