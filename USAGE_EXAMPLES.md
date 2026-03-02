# Usage Examples

Quick reference for integrating the Kitchen Configurator widget with different e-commerce platforms.

## Shopify Integration

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="configurator-widget.css">
</head>
<body>
  <!-- Configuration -->
  <script>
    window.kitchenConfiguratorConfig = {
      platform: {
        type: 'shopify',
        domain: 'your-store.myshopify.com',
        storefrontAccessToken: 'your-storefront-access-token'
      }
    };
  </script>
  
  <!-- Widget -->
  <script src="configurator-widget.iife.js"></script>
  <kitchen-configurator-widget></kitchen-configurator-widget>
</body>
</html>
```

### Product Requirements

1. Tag products with `kitchen-configurator`
2. Use naming convention: `kitchen-cabinet-[upper|bottom]-[size]cm`
   - Example: `kitchen-cabinet-upper-40cm`
   - Example: `kitchen-cabinet-bottom-60cm`

---

## Shoptet Integration

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="configurator-widget.css">
</head>
<body>
  <!-- Configuration -->
  <script>
    window.kitchenConfiguratorConfig = {
      platform: {
        type: 'shoptet',
        apiUrl: 'https://your-store.shoptet.cz/api',
        apiKey: 'your-api-key'
      }
    };
  </script>
  
  <!-- Widget -->
  <script src="configurator-widget.iife.js"></script>
  <kitchen-configurator-widget></kitchen-configurator-widget>
</body>
</html>
```

### Product Requirements

1. Tag products with `kitchen-configurator`
2. Use product codes: `kitchen-cabinet-[upper|bottom]-[size]cm`
   - Example: `kitchen-cabinet-upper-40cm`
   - Example: `kitchen-cabinet-bottom-60cm`

---

## Static Catalog (No E-commerce)

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="configurator-widget.css">
</head>
<body>
  <!-- Configuration -->
  <script>
    window.kitchenConfiguratorConfig = {
      catalog: {
        products: [
          {
            id: 'cabinet-upper-40',
            title: 'Upper Cabinet 40cm',
            subtitle: 'Kitchen Cabinet',
            basePrice: { amount: 2500, currency: 'CZK' },
            imageUrl: '/images/cabinet-upper-40.png',
            optionGroups: [
              {
                id: 'color',
                kind: 'swatches',
                label: 'Color',
                options: [
                  { id: 'white', label: 'White', color: '#FFFFFF' },
                  { id: 'gray', label: 'Gray', color: '#F3F4F6' }
                ],
                defaultOptionId: 'white'
              }
            ]
          }
          // ... more products
        ]
      }
    };
  </script>
  
  <!-- Widget -->
  <script src="configurator-widget.iife.js"></script>
  <kitchen-configurator-widget></kitchen-configurator-widget>
</body>
</html>
```

---

## Loading from CDN (GitHub Pages)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://your-username.github.io/kitchen_3d/configurator-widget.css">
</head>
<body>
  <script>
    window.kitchenConfiguratorConfig = {
      platform: {
        type: 'shopify',
        domain: 'your-store.myshopify.com',
        storefrontAccessToken: 'your-token'
      }
    };
  </script>
  
  <script src="https://your-username.github.io/kitchen_3d/configurator-widget.iife.js"></script>
  <kitchen-configurator-widget></kitchen-configurator-widget>
</body>
</html>
```

---

## Advanced: Multiple Widgets on One Page

Each widget instance maintains its own state:

```html
<div class="container">
  <h2>Kitchen Design A</h2>
  <kitchen-configurator-widget id="widget-a"></kitchen-configurator-widget>
</div>

<div class="container">
  <h2>Kitchen Design B</h2>
  <kitchen-configurator-widget id="widget-b"></kitchen-configurator-widget>
</div>

<script>
  // Both widgets will use the same platform config
  window.kitchenConfiguratorConfig = {
    platform: {
      type: 'shopify',
      domain: 'your-store.myshopify.com',
      storefrontAccessToken: 'your-token'
    }
  };
</script>
```

---

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Ensure CSS is loaded before JS
3. Verify configuration object is set before widget script loads

### Products Not Showing

1. Verify products are tagged with `kitchen-configurator`
2. Check product naming convention
3. Check API credentials
4. Open browser console and look for error messages

### Add to Cart Not Working

1. Verify platform credentials
2. Check that products have variants
3. Ensure at least one cabinet is placed in the configurator
4. Check browser console for detailed error messages

---

## See Also

- [PLATFORM_INTEGRATION.md](./PLATFORM_INTEGRATION.md) - Detailed integration guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migrating from old format
- [README.md](./README.md) - General documentation
