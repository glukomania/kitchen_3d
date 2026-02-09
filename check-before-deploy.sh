#!/bin/bash
echo "=== Checking widget files before deploy ==="
if [ ! -f "dist/configurator-widget.iife.js" ]; then
  echo "❌ ERROR: configurator-widget.iife.js not found in dist/"
  exit 1
fi
if [ ! -f "dist/configurator-widget.css" ]; then
  echo "❌ ERROR: configurator-widget.css not found in dist/"
  exit 1
fi
echo "✅ Widget files found:"
ls -lh dist/configurator-widget.*
echo ""
echo "✅ Ready to deploy!"
