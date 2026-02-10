# Web Component Development Guide for External Embedding

## Prompt for AI Assistant

When building a web component (custom element) that will be embedded on external platforms like Shopify, WordPress, or other third-party sites, follow these critical guidelines:

---

## 1. Build Configuration

### Vite Configuration for Widget

```typescript
// vite.widget.config.ts
export default defineConfig({
  base: "/your-project/", // GitHub Pages base path
  plugins: [react()],
  define: {
    // CRITICAL: Define process.env for browser compatibility
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // Don't clear dist before build (if main app builds first)
    lib: {
      entry: "src/widget/entry.ts",
      name: "YourWidgetName",
      formats: ["iife"], // IIFE for drop-in usage
      fileName: () => "widget.iife.js"
    },
    sourcemap: true,
    cssCodeSplit: false, // Single CSS file
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'widget.css'; // Fixed CSS filename
          }
          return assetInfo.name || 'asset';
        }
      }
    }
  }
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "build": "vite build",
    "build:widget": "vite build --config vite.widget.config.ts",
    "build:all": "npm run build && npm run build:widget"
  }
}
```

---

## 2. Critical Issues to Avoid

### ❌ NEVER: Use `process.env` without defining it

**Problem:** 
```
Uncaught ReferenceError: process is not defined
```

**Solution:**
```typescript
// In vite.widget.config.ts
define: {
  'process.env.NODE_ENV': JSON.stringify('production')
}
```

### ❌ NEVER: Call setState during render

**Problem:**
```
React Error #185: Cannot update during render
```

**Solution:**
```typescript
// BAD
useEffect(() => {
  dispatch.setCatalog(catalog);
}, [catalog, dispatch]);

// GOOD
useEffect(() => {
  queueMicrotask(() => {
    dispatch.setCatalog(catalog);
  });
}, [catalog, dispatch]);
```

### ❌ NEVER: Use relative paths for assets

**Problem:**
```
404 Not Found: /kitchen_3d/image.png
// Tries to load from host domain, not your GitHub Pages
```

**Solution:**
```typescript
// Use absolute URLs for external embedding
const getImagePath = () => {
  const base = import.meta.env.BASE_URL || '/project/';
  return `https://your-domain.github.io${base}image.png`;
};
```

---

## 3. CSS Styling Isolation

### Problem: Host Page Styles Override Widget

When embedding on Shopify/WordPress, host page CSS can break your widget layout.

### Solution 1: Disable Tailwind Preflight (Recommended)

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false // Don't reset host page styles
  }
}
```

### Solution 2: Add !important to Critical Styles

For layout-critical properties that host pages often override:

```tsx
// Add !important to grid/flex layouts
<div className="!grid !grid-cols-2 gap-4">
  {/* Grid items */}
</div>

<div className="!flex !items-center !justify-between">
  {/* Flex items */}
</div>

<div className="!min-h-[450px]">
  {/* Height constraints */}
</div>
```

### Critical Properties to Protect

Always use `!important` for:
- `display: grid` → `!grid`
- `display: flex` → `!flex`
- `grid-template-columns` → `!grid-cols-*`
- `flex-direction` → `!flex-col`, `!flex-row`
- `min-height` → `!min-h-*`
- `flex: 1` → `!flex-1`

### CSS Structure

```css
/* src/styles/index.css */
@tailwind components;
@tailwind utilities;

/* Minimal widget container styles */
your-widget-name {
  display: block;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #0f172a;
}
```

---

## 4. Custom Element Definition

### Widget Entry Point

```typescript
// src/widget/entry.ts
import "@/styles/index.css";
import { defineYourElement } from "@/widget/defineElement";

if (typeof window !== "undefined") {
  defineYourElement();
}

export { defineYourElement };
```

### Custom Element Class

```typescript
// src/widget/defineElement.tsx
export function defineYourElement(options = {}) {
  const tagName = options.tagName ?? "your-widget";
  
  if (customElements.get(tagName)) return;

  class YourWidgetElement extends HTMLElement {
    static observedAttributes = ["data-config"];
    private _root: Root | null = null;

    connectedCallback() {
      if (!this._root) this._root = createRoot(this);
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    disconnectedCallback() {
      this._root?.unmount();
      this._root = null;
    }

    private render() {
      if (!this._root) return;
      
      const config = parseJsonAttribute(
        this.getAttribute("data-config")
      );

      this._root.render(
        createElement(AppProvider, {}, 
          createElement(WidgetRoot, { config })
        )
      );
    }
  }

  customElements.define(tagName, YourWidgetElement);
}
```

---

## 5. Deployment to GitHub Pages

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:all  # Build both app and widget
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### Main Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  base: "/your-project/",
  build: {
    emptyOutDir: false // Don't clear dist if widget builds after
  }
});
```

---

## 6. Embedding Instructions

### For Shopify

```html
<!-- In Custom Liquid block or theme.liquid -->
<link rel="stylesheet" href="https://your-domain.github.io/project/widget.css?v=1">
<script src="https://your-domain.github.io/project/widget.iife.js?v=1"></script>

<your-widget id="widget-instance"></your-widget>

<script>
  const config = {
    // Your configuration
  };
  
  customElements.whenDefined('your-widget').then(() => {
    const element = document.getElementById('widget-instance');
    if (element) {
      element.setAttribute('data-config', JSON.stringify(config));
    }
  });
</script>
```

### Cache Busting

Always add version query parameter when updating:
```html
<script src="widget.iife.js?v=2"></script>
```

---

## 7. Common Platform Issues

### Shopify Specific

**Issue:** Content Security Policy errors
```
Framing 'https://shop.app/' violates CSP
```
**Solution:** These are Shopify internal warnings, ignore them.

**Issue:** Grid/Flex layouts breaking
**Solution:** Use `!important` on display properties.

**Issue:** Widget too narrow/short
**Solution:** Use `!min-h-[...]` and check parent container.

### WordPress Specific

**Issue:** Theme CSS conflicts
**Solution:** Same as Shopify - use `!important` and disable preflight.

### General Third-Party Sites

**Issue:** Different base font sizes (16px vs 14px vs 10px)
**Solution:** Set explicit `font-size: 16px` on widget root.

**Issue:** box-sizing: content-box on host
**Solution:** Set `box-sizing: border-box` on all widget elements.

---

## 8. Testing Checklist

Before deploying widget:

- [ ] Test `process.env` is defined (check browser console)
- [ ] Test on clean HTML page (no host styles)
- [ ] Test on Shopify/WordPress with their default themes
- [ ] Test with browser cache disabled
- [ ] Test all breakpoints (mobile, tablet, desktop)
- [ ] Test with different zoom levels (80%, 100%, 150%)
- [ ] Check Network tab: all assets load from correct URLs
- [ ] Check Console: no errors, no warnings
- [ ] Test drag-and-drop (if applicable)
- [ ] Test all interactive features
- [ ] Test with slow 3G network (asset loading)

---

## 9. Debugging in Production

### Check if widget loaded:

```javascript
// In browser console on host page
console.log('Element registered:', customElements.get('your-widget'));
console.log('Widget global:', typeof window.YourWidgetName);
console.log('Element exists:', document.querySelector('your-widget'));
```

### Check asset loading:

```javascript
// Check last-modified date
fetch('https://your-domain.github.io/project/widget.iife.js', {method: 'HEAD'})
  .then(r => console.log('Last-Modified:', r.headers.get('last-modified')));
```

### Force reload without cache:

```html
<script src="widget.iife.js?v=<?= time() ?>"></script>
```

---

## 10. Architecture Best Practices

### File Structure

```
src/
  widget/
    entry.ts          # Widget entry point
    defineElement.tsx # Custom element definition
    WidgetRoot.tsx    # Root component with state init
  features/
    your-feature/
      ui/             # UI components
      state/          # State management
      model/          # Types
  shared/
    ui/               # Reusable UI components
  styles/
    index.css         # Global styles (scoped to widget)
```

### State Management

- Use Zustand/Redux with proper initialization
- Avoid setState in useEffect without queueMicrotask
- Keep widget state isolated (don't pollute global scope)

### Styling

- Use Tailwind with preflight disabled
- Add `!important` to layout properties
- Use BEM-style classes for debugging: `widget-container`, `widget-button`
- Keep specificity low, rely on `!important` only for critical styles

---

## 11. Performance Optimization

### Bundle Size

- Widget should be < 1MB total (JS + CSS)
- Use code splitting if needed
- Compress images, use WebP
- Use CDN for heavy assets (fonts, icons)

### Loading Strategy

```html
<!-- Async loading (doesn't block page) -->
<script src="widget.iife.js" async></script>

<!-- Defer loading (loads after page parse) -->
<script src="widget.iife.js" defer></script>

<!-- Blocking (not recommended) -->
<script src="widget.iife.js"></script>
```

---

## 12. Documentation Template

Create `EMBEDDING.md`:

```markdown
# Embedding Instructions

## Quick Start

1. Add CSS to `<head>`:
   <link rel="stylesheet" href="https://your-domain.github.io/project/widget.css">

2. Add script before `</body>`:
   <script src="https://your-domain.github.io/project/widget.iife.js"></script>

3. Add widget element:
   <your-widget id="widget"></your-widget>

4. Configure widget:
   <script>
     customElements.whenDefined('your-widget').then(() => {
       document.getElementById('widget')
         .setAttribute('data-config', JSON.stringify({...}));
     });
   </script>

## Configuration Options

- `data-config`: JSON string with configuration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

[Include common issues and solutions]
```

---

## Summary: Critical Rules

1. ✅ Define `process.env.NODE_ENV` in build config
2. ✅ Use `queueMicrotask` for setState in effects
3. ✅ Use absolute URLs for all assets
4. ✅ Disable Tailwind preflight
5. ✅ Add `!important` to layout properties
6. ✅ Build with IIFE format
7. ✅ Test on actual target platforms (Shopify, WordPress)
8. ✅ Use cache-busting query params
9. ✅ Isolate widget state and styles
10. ✅ Provide clear embedding documentation

---

## AI Assistant Prompt Template

When starting a new web component project:

> "Create a React web component that can be embedded on external sites like Shopify and WordPress. 
> 
> Requirements:
> - Build as IIFE format custom element
> - Use Vite for bundling
> - Use Tailwind CSS with preflight DISABLED
> - Define process.env.NODE_ENV in build config
> - Use absolute URLs for all assets
> - Add !important to all grid/flex display properties
> - Use queueMicrotask for any setState in useEffect
> - Deploy to GitHub Pages via GitHub Actions
> - Create embedding documentation
> 
> Follow the guidelines in WEB_COMPONENT_GUIDE.md for all implementation details."

---

**Last Updated:** 2026-02-09  
**Based on:** kitchen_3d project Shopify integration experience
