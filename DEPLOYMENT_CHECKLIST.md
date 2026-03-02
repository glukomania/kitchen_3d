# Deployment Checklist

## Before Deploying

### 1. Code Quality

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run format` - code is formatted
- [ ] All tests pass (if applicable)

### 2. Build

- [ ] Run `npm run build:widget` successfully
- [ ] Check `dist/` folder contains:
  - `configurator-widget.iife.js`
  - `configurator-widget.css`
  - Asset files (images, etc.)

### 3. Testing

- [ ] Test widget locally with `embed-example.html`
- [ ] Test Shopify integration with `embed-example-shopify.html`
- [ ] Test Shoptet integration with `embed-example-shoptet.html`
- [ ] Verify "Add to cart" functionality works
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

## Shopify Deployment

### Setup

1. [ ] Create Storefront API Access Token
   - Go to: Shopify Admin → Settings → Apps and sales channels → Develop apps
   - Create new app or use existing
   - Enable Storefront API
   - Copy access token

2. [ ] Tag Products
   - Tag all kitchen cabinet products with `kitchen-configurator`
   - Ensure product handles follow naming convention:
     - `kitchen-cabinet-upper-40cm`
     - `kitchen-cabinet-bottom-60cm`

3. [ ] Upload Widget Files
   - Upload `configurator-widget.iife.js` to Shopify Files
   - Upload `configurator-widget.css` to Shopify Files
   - Upload asset files (images) to Shopify Files
   - Note down the URLs

### Integration

4. [ ] Add to Product Page Template
   ```liquid
   <!-- Add to theme.liquid or product template -->
   <link rel="stylesheet" href="URL_TO_CSS">
   
   <script>
     window.kitchenConfiguratorConfig = {
       platform: {
         type: 'shopify',
         domain: '{{ shop.permanent_domain }}',
         storefrontAccessToken: 'YOUR_TOKEN_HERE'
       }
     };
   </script>
   
   <script src="URL_TO_JS"></script>
   <kitchen-configurator-widget></kitchen-configurator-widget>
   ```

5. [ ] Test in Shopify Preview
6. [ ] Test checkout flow end-to-end

## Shoptet Deployment

### Setup

1. [ ] Generate API Key
   - Go to: Shoptet Admin → Settings → API
   - Create new API key
   - Copy API key and API URL

2. [ ] Tag Products
   - Tag all kitchen cabinet products with `kitchen-configurator`
   - Ensure product codes follow naming convention:
     - `kitchen-cabinet-upper-40cm`
     - `kitchen-cabinet-bottom-60cm`

3. [ ] Upload Widget Files
   - Upload files to your hosting or CDN
   - Note down the URLs

### Integration

4. [ ] Add to Product Page
   ```html
   <!-- Add to product template -->
   <link rel="stylesheet" href="URL_TO_CSS">
   
   <script>
     window.kitchenConfiguratorConfig = {
       platform: {
         type: 'shoptet',
         apiUrl: 'https://your-store.shoptet.cz/api',
         apiKey: 'YOUR_API_KEY_HERE'
       }
     };
   </script>
   
   <script src="URL_TO_JS"></script>
   <kitchen-configurator-widget></kitchen-configurator-widget>
   ```

5. [ ] Test in Shoptet Preview
6. [ ] Test checkout flow end-to-end

## GitHub Pages Deployment (Optional)

1. [ ] Run `npm run build:all`
2. [ ] Commit changes
3. [ ] Run `npm run deploy` or push to main branch
4. [ ] Wait for GitHub Actions to complete
5. [ ] Verify widget is accessible at `https://username.github.io/kitchen_3d/`

## Post-Deployment

### Verification

- [ ] Widget loads without errors
- [ ] Products are displayed correctly
- [ ] 3D/2D rendering works
- [ ] Cabinet placement works
- [ ] "Add to cart" redirects to checkout
- [ ] Checkout contains correct items
- [ ] Mobile responsiveness works
- [ ] No console errors

### Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor browser console for errors
- [ ] Check analytics for usage patterns
- [ ] Gather user feedback

### Documentation

- [ ] Update internal documentation with:
  - Widget URLs
  - API credentials (securely stored)
  - Integration instructions
  - Support contact

## Rollback Plan

If issues occur:

1. [ ] Remove widget script tag from templates
2. [ ] Revert to previous version
3. [ ] Investigate issue in development
4. [ ] Fix and redeploy

## Security Notes

- ⚠️ Never commit API keys or tokens to Git
- ⚠️ Use environment variables for sensitive data
- ⚠️ Regularly rotate API keys
- ⚠️ Monitor API usage for anomalies

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (if exists)
- Review [PLATFORM_INTEGRATION.md](./PLATFORM_INTEGRATION.md)
- Check browser console for error messages
- Review [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
