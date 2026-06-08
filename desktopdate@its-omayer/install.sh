#!/bin/bash

EXT_UUID="desktopdate@its-omayer"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"
FONT_DIR="$HOME/.local/share/fonts"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  DesktopDate — Installer"
echo "────────────────────────────"

# ── Check GNOME Shell ────────────────────────────────────────────
if ! command -v gnome-shell &> /dev/null; then
    echo "  ❌ GNOME Shell not found. Are you on GNOME?"
    exit 1
fi

# ── 1. Install font ──────────────────────────────────────────────
echo ""
echo "  [1/3] Installing Researcher font..."
mkdir -p "$FONT_DIR"
cp "$SCRIPT_DIR/fonts/Researcher-Regular.ttf" "$FONT_DIR/"
fc-cache -fv > /dev/null 2>&1
echo "  ✅ Font installed → $FONT_DIR"

# ── 2. Install extension ─────────────────────────────────────────
echo ""
echo "  [2/3] Installing extension..."
mkdir -p "$EXT_DIR"
cp "$SCRIPT_DIR/extension.js" "$EXT_DIR/"
cp "$SCRIPT_DIR/metadata.json" "$EXT_DIR/"
echo "  ✅ Extension installed → $EXT_DIR"

# ── 3. Enable extension ──────────────────────────────────────────
echo ""
echo "  [3/3] Enabling extension..."
gnome-extensions enable "$EXT_UUID" > /dev/null 2>&1
echo "  ✅ Extension enabled"

echo ""
echo "────────────────────────────"
echo "  ✅ Done!"
echo ""
echo "  👉 Log out and back in to see DesktopDate."
echo "  📝 To customize: nano $EXT_DIR/extension.js"
echo ""
