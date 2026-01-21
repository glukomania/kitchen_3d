#!/bin/bash
# Script to create a DMG file for MineTime.app distribution
# This creates a properly formatted DMG with the app ready for distribution

set -e

APP_NAME="MineTime.app"
DMG_NAME="MineTime.dmg"
VOLUME_NAME="MineTime"
TEMP_DMG="temp_${DMG_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Creating DMG for MineTime ==="
echo ""

# Check if app exists
if [ ! -d "$APP_NAME" ]; then
    echo -e "${RED}Error: $APP_NAME not found in current directory${NC}"
    echo "Please run this script from the directory containing $APP_NAME"
    exit 1
fi

# Step 1: Verify and staple notarization (if needed)
echo "Step 1: Checking notarization..."
if xcrun stapler validate "$APP_NAME" 2>&1 | grep -q "validated"; then
    echo -e "${GREEN}✓ Notarization ticket is already stapled${NC}"
else
    echo "Attempting to staple notarization ticket..."
    if xcrun stapler staple "$APP_NAME" 2>&1 | grep -q "stapled\|already stapled"; then
        echo -e "${GREEN}✓ Notarization ticket stapled${NC}"
    else
        echo -e "${YELLOW}⚠ Warning: Could not staple ticket. App may not be notarized yet.${NC}"
        echo "DMG will be created anyway, but app may have issues after download."
    fi
fi
echo ""

# Step 2: Remove quarantine (just in case)
echo "Step 2: Removing quarantine attribute..."
xattr -dr com.apple.quarantine "$APP_NAME" 2>/dev/null || true
echo -e "${GREEN}✓ Quarantine removed${NC}"
echo ""

# Step 3: Remove old DMG if exists
if [ -f "$DMG_NAME" ]; then
    echo "Removing existing $DMG_NAME..."
    rm "$DMG_NAME"
fi

# Step 4: Create DMG
echo "Step 3: Creating DMG file..."
hdiutil create -volname "$VOLUME_NAME" \
    -srcfolder "$APP_NAME" \
    -ov \
    -format UDZO \
    "$TEMP_DMG"

if [ ! -f "$TEMP_DMG" ]; then
    echo -e "${RED}✗ Failed to create DMG${NC}"
    exit 1
fi

# Step 5: Rename to final name
mv "$TEMP_DMG" "$DMG_NAME"
echo -e "${GREEN}✓ DMG created: $DMG_NAME${NC}"
ls -lh "$DMG_NAME"
echo ""

# Step 6: Sign DMG (if Developer ID is available)
echo "Step 4: Signing DMG..."
if security find-identity -v -p codesigning | grep -q "Developer ID Application"; then
    IDENTITY=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | sed 's/.*"\(.*\)".*/\1/')
    echo "Signing with: $IDENTITY"
    
    if codesign --sign "$IDENTITY" "$DMG_NAME" 2>&1; then
        echo -e "${GREEN}✓ DMG signed successfully${NC}"
        
        # Verify signature
        if codesign -dv --verbose=4 "$DMG_NAME" 2>&1 | grep -q "valid"; then
            echo -e "${GREEN}✓ DMG signature verified${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Warning: Failed to sign DMG, but DMG is still usable${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No Developer ID Application certificate found. DMG created but not signed.${NC}"
fi
echo ""

# Step 7: Verify DMG
echo "Step 5: Verifying DMG..."
if hdiutil verify "$DMG_NAME" 2>&1 | grep -q "checksum\|verified"; then
    echo -e "${GREEN}✓ DMG verified successfully${NC}"
else
    echo -e "${YELLOW}⚠ DMG verification had warnings, but DMG should still work${NC}"
fi
echo ""

echo -e "${GREEN}=== DMG Creation Complete ===${NC}"
echo ""
echo "DMG file: $DMG_NAME"
echo "Size: $(du -h "$DMG_NAME" | cut -f1)"
echo ""
echo "Next steps:"
echo "  1. Test the DMG by double-clicking it"
echo "  2. Verify the app opens correctly after mounting"
echo "  3. Upload $DMG_NAME to your web server"
echo ""
echo "Note: Users will need to:"
echo "  1. Download the DMG"
echo "  2. Double-click to mount it"
echo "  3. Drag MineTime.app to Applications folder (or run from DMG)"
