#!/usr/bin/env bash
# Cherri shortcut build pipeline: compile → patch base64 → binary plist → sign.
#
# Usage:  ./build.sh <name-without-extension>
# Example: ./build.sh update-now
#
# Inputs:  <name>.cherri
# Output:  <Display Name>.shortcut  (signed, AEA-wrapped, ready to AirDrop)

set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: $0 <name-without-extension>"
    echo "Example: $0 update-now"
    exit 1
fi

cd "$(dirname "$0")"
NAME="$1"
SOURCE="${NAME}.cherri"

if [ ! -f "$SOURCE" ]; then
    echo "Error: $SOURCE not found"
    exit 1
fi

# Extract display name from #define name directive
DISPLAY_NAME=$(grep -E '^#define name' "$SOURCE" | sed 's/^#define name //')
if [ -z "$DISPLAY_NAME" ]; then
    echo "Error: no '#define name' directive found in $SOURCE"
    exit 1
fi

PLIST="${DISPLAY_NAME}.plist"
PATCHED="${DISPLAY_NAME}_patched.shortcut"
UNSIGNED="${DISPLAY_NAME}_unsigned.shortcut"
PROCESSED="${NAME}_processed.cherri"
FINAL="${DISPLAY_NAME}.shortcut"

echo "==> Cleaning previous build artifacts"
rm -f "$PLIST" "$PATCHED" "$UNSIGNED" "$PROCESSED" "$FINAL"

echo "==> Compiling $SOURCE with cherri"
cherri "$SOURCE" -d --skip-sign > /dev/null

if [ ! -f "$PLIST" ]; then
    echo "Error: cherri did not produce $PLIST"
    exit 1
fi

# Count base64encode actions to know how many to patch
BASE64_COUNT=$(grep -c "<string>Encode</string>" "$PLIST" || true)
if [ "$BASE64_COUNT" -gt 0 ]; then
    echo "==> Patching $BASE64_COUNT base64encode action(s) with WFBase64LineBreakMode=None"
    # Use python for in-place patching (sed multiline is fragile)
    python3 - <<EOF
import re
with open("$PLIST", "r") as f:
    content = f.read()
old = '<key>input</key>\n\t\t\t\t\t<string>Encode</string>\n\t\t\t\t</dict>'
new = '<key>WFBase64LineBreakMode</key>\n\t\t\t\t\t<string>None</string>\n\t\t\t\t\t<key>input</key>\n\t\t\t\t\t<string>Encode</string>\n\t\t\t\t</dict>'
patched = content.replace(old, new)
with open("$PLIST", "w") as f:
    f.write(patched)
print(f"Replaced {patched.count('WFBase64LineBreakMode')} occurrences")
EOF

    PATCH_COUNT=$(grep -c "WFBase64LineBreakMode" "$PLIST" || true)
    if [ "$PATCH_COUNT" -ne "$BASE64_COUNT" ]; then
        echo "Error: patched $PATCH_COUNT but expected $BASE64_COUNT"
        exit 1
    fi
fi

echo "==> Converting plist to binary"
plutil -convert binary1 "$PLIST" -o "$PATCHED"

echo "==> Signing with --mode people-who-know-me"
# (--mode anyone often fails with "hostname not found"; people-who-know-me works reliably)
shortcuts sign --mode people-who-know-me --input "$PATCHED" --output "$FINAL" 2>&1 | grep -v "Unrecognized attribute" || true

if [ ! -f "$FINAL" ]; then
    echo "Error: signing produced no output. Try again, or check iCloud signin status."
    exit 1
fi

SIZE=$(stat -f%z "$FINAL")
echo ""
echo "✓ Built: $FINAL ($SIZE bytes)"
echo "  AirDrop this file to your iPhone to install."
