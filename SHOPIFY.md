# Embedding in Shopify

## Step-by-step guide

### 1. Add the widget to your Shopify theme

In your Shopify theme editor, add a custom HTML block with the following code:

```html
<!-- Load widget CSS (add to <head> if possible) -->
<link rel="stylesheet" href="https://glukomania.github.io/kitchen_3d/configurator-widget.css">

<!-- Load widget script -->
<script src="https://glukomania.github.io/kitchen_3d/configurator-widget.iife.js"></script>

<!-- Widget element -->
<sk-configurator id="kitchen-configurator"></sk-configurator>

<script>
  // Example catalog data
  const catalog = {
    products: [
      {
        id: "kitchen",
        title: "Kitchen",
        subtitle: "Kitchen Configurator",
        basePrice: { amount: 50000, currency: "CZK" },
        optionGroups: [
          {
            id: "color",
            kind: "swatches",
            label: "Color",
            options: [
              { id: "white", label: "White", color: "#FFFFFF" },
              { id: "light-gray", label: "Light Gray", color: "#F3F4F6" },
              { id: "beige", label: "Beige", color: "#F5F5DC" }
            ],
            defaultOptionId: "white"
          },
          {
            id: "top-cabinets",
            kind: "select",
            label: "Upper Cabinets",
            options: [
              { id: "top-40", label: "40 cm" },
              { id: "top-60", label: "60 cm" }
            ],
            defaultOptionId: "top-40"
          },
          {
            id: "bottom-cabinets",
            kind: "select",
            label: "Lower Cabinets",
            options: [
              { id: "bottom-40", label: "40 cm" },
              { id: "bottom-60", label: "60 cm" }
            ],
            defaultOptionId: "bottom-40"
          }
        ]
      }
    ]
  };
  
  // Wait for widget to load and set catalog
  if (typeof customElements !== 'undefined') {
    customElements.whenDefined('sk-configurator').then(() => {
      const element = document.getElementById('kitchen-configurator');
      if (element) {
        element.setAttribute('data-catalog', JSON.stringify(catalog));
      }
    });
  }
</script>
```

### 2. Common issues and solutions

#### Images not loading (404 errors)
- **Fixed**: The widget now uses absolute URLs for images from GitHub Pages
- Images are automatically loaded from `https://glukomania.github.io/kitchen_3d/`

#### React Error #185 (setState during render)
- **Fixed**: Widget now uses `queueMicrotask` to defer state updates
- This prevents setState calls during the render phase

#### Autofocus warnings in cross-origin iframe
- These are browser security warnings and can be safely ignored
- They don't affect widget functionality

#### Styling conflicts
- **Fixed**: Widget styles are now isolated with `sk-configurator` scoping
- Tailwind preflight is disabled to prevent conflicts with host page
- Widget has its own reset styles that don't affect the host page

### 3. Testing

After adding the widget:
1. Save and publish your theme
2. Visit the page where you added the widget
3. Open browser console to check for errors
4. Verify images load correctly
5. Test configurator functionality

### 4. Customization

To customize the catalog data:
- Replace the `catalog` object in the script
- Add/remove products, options, colors, etc.
- Adjust prices and labels as needed

### 5. Support

If you encounter issues:
1. Check browser console for errors
2. Verify widget files are loading from GitHub Pages
3. Ensure catalog data is valid JSON
4. Check that CSS is loaded before the script
