# MarketBoost Platform Architecture Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Key Components](#key-components)
4. [How It Works - Step by Step](#how-it-works---step-by-step)
5. [API Integration](#api-integration)
6. [Development vs Production](#development-vs-production)
7. [Setup Guide](#setup-guide)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

## System Overview

MarketBoost is a **headless e-commerce platform** that combines:
- A **static frontend** (beautiful, fast HTML/CSS/JS site)
- A **WordPress/WooCommerce backend** (powerful content management and e-commerce)
- **Smart API integration** that connects them seamlessly

This architecture gives us the best of both worlds:
- ⚡ **Fast Performance**: Static site loads instantly
- 🛒 **Full E-commerce**: Complete WooCommerce shopping functionality
- 📱 **Mobile First**: Responsive design that works everywhere
- 🔧 **Easy Management**: WordPress admin for content and products

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                             │
├─────────────────────────────────────────────────────────────────────────┤
│  https://wp-marketng-store2.vercel.app                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │   index.html    │  │  services.html  │  │   roi-calculator.html   │ │
│  │   (Homepage)    │  │   (Products)    │  │     (ROI Tool)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
│                                 │                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    JavaScript Files                             │   │
│  │  • js/api.js (WooCommerce API client)                         │   │
│  │  • js/cart.js (Shopping cart logic)                           │   │
│  │  • js/cart-ui.js (Cart interface)                             │   │
│  │  • js/services-dynamic.js (Product rendering)                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                               VERCEL CDN                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Routing & Proxying (vercel.json):                                     │
│  • /shop → https://synergyx.digital                                    │
│  • /wp-json/* → https://synergyx.digital/wp-json/*                     │
│  • /wp-content/* → https://synergyx.digital/wp-content/*               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Proxied Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SYNERGYX.DIGITAL                              │
├─────────────────────────────────────────────────────────────────────────┤
│  WordPress + WooCommerce Backend                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │   WordPress     │  │   WooCommerce   │  │      MySQL Database    │ │
│  │   (CMS)         │  │   (E-commerce)  │  │     (Product Data)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
│                                 │                                       │
│  API Endpoints:                                                         │
│  • /wp-json/wc/v3/products (Get all products)                         │
│  • /wp-json/wc/v3/products/{id} (Get single product)                   │
│  • /wp-json/wc/v3/products/categories (Get categories)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Frontend (Vercel Static Site)
**Location**: `https://wp-marketng-store2.vercel.app`

- **Static HTML Pages**: Fast-loading, SEO-friendly pages
- **Vanilla JavaScript**: No heavy frameworks, pure performance
- **Tailwind CSS**: Beautiful, responsive design
- **Smart Caching**: 5-minute API cache for better performance

### 2. Backend (SynergyX.digital WordPress)
**Location**: `https://synergyx.digital`

- **WordPress CMS**: Easy content management
- **WooCommerce**: Full e-commerce functionality
- **MySQL Database**: Stores all product data, orders, customers
- **REST API**: Exposes data to the frontend via `/wp-json/wc/v3/`

### 3. API Integration Layer
**Files**: `js/api.js`, `js/services-dynamic.js`

- **WooCommerceAPI Class**: Handles all API communication
- **Authentication**: Uses consumer key/secret for secure access
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Caching**: Reduces API calls and improves performance

### 4. Shopping Cart System
**Files**: `js/cart.js`, `js/cart-ui.js`

- **Local Storage**: Cart persists between sessions
- **Real-time Updates**: Instant feedback when adding items
- **Bundle Suggestions**: Smart recommendations
- **Checkout Integration**: Links to WooCommerce checkout

## How It Works - Step by Step

### User Journey: Browsing Products

1. **User visits homepage**: `wp-marketng-store2.vercel.app`
   - Static HTML loads instantly from Vercel CDN
   - Hero section, navigation, and styling load

2. **User clicks "Services"**: Link points to `/shop`
   - Vercel intercepts the request (via `vercel.json`)
   - Redirects internally to `synergyx.digital`
   - User sees WooCommerce shop page

3. **Alternative: Direct services page**: `wp-marketng-store2.vercel.app/services.html`
   - Static HTML loads
   - JavaScript `services-dynamic.js` initializes
   - Makes API call to `synergyx.digital/wp-json/wc/v3/products`

### API Data Flow

```
1. services.html loads
2. services-dynamic.js initializes
3. wooAPI.fetchProducts() called
4. Request goes to synergyx.digital API
5. WordPress returns JSON product data
6. JavaScript renders products as HTML cards
7. User sees beautiful product grid
```

### Adding to Cart

```
1. User clicks "Add to Cart" on product
2. addToCartFromCard() function called
3. Product added to localStorage cart
4. Cart UI updates (count badge, drawer)
5. Cart persists across page reloads
```

## API Integration

### Authentication System

The WooCommerce REST API uses **Consumer Key/Secret** authentication:

```javascript
// In js/api.js
this.credentials = {
  consumerKey: 'ck_e6497143989e4699742151e2a82873652cbf8b96',
  consumerSecret: 'cs_d87ab450959241ec7fac88f7aaa1dc005801102d'
};

// Creates Basic Auth header
this.authHeader = btoa(`${consumerKey}:${consumerSecret}`);
```

### Environment Detection

The API automatically switches between development and production:

```javascript
const isLocal = host === 'localhost' || host === '127.0.0.1';
this.baseURL = isLocal
  ? 'http://localhost:8080/wordpress-api/?rest_route=/wc/v3'  // Local XAMPP
  : 'https://synergyx.digital/wp-json/wc/v3';                // Production
```

### Caching Strategy

- **5-minute cache**: API responses cached in browser memory
- **Faster loading**: Subsequent requests serve from cache
- **Automatic refresh**: Cache expires and refetches when needed

## Development vs Production

### Local Development Environment

**Frontend**: `http://localhost:3000` (live-server)
**Backend**: `http://localhost:8080/wordpress-api` (XAMPP)

```bash
# Start local development
npm start  # Starts frontend server

# XAMPP must be running separately
# - Apache on port 8080
# - MySQL database
# - WordPress at C:\xampp\htdocs\wordpress-api
```

### Production Environment

**Frontend**: `https://wp-marketng-store2.vercel.app` (Vercel CDN)
**Backend**: `https://synergyx.digital` (WordPress hosting)

**Key Differences**:
- Production uses HTTPS and authentication
- Vercel handles routing and proxying
- CDN caching for better global performance

## Setup Guide

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Git** for version control
3. **Text editor** (VS Code recommended)

### For Frontend Development Only

```bash
# Clone the repository
git clone [repository-url]
cd wp-marketng-store2

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
```

### For Full Local Development (Frontend + Backend)

1. **Install XAMPP**
   - Download from apachefriends.org
   - Start Apache (port 8080) and MySQL

2. **Setup WordPress**
   ```bash
   # Create WordPress directory
   C:\xampp\htdocs\wordpress-api
   
   # Download and install WordPress
   # Create database: wordpress_headless
   ```

3. **Install WooCommerce**
   - Through WordPress admin
   - Import products from `marketing-services-products.csv`

4. **Configure API Access**
   - Generate WooCommerce API keys
   - Update `js/api.js` with your keys
   - Configure CORS in `wp-config.php`

### Testing the Integration

```bash
# Test API connection in browser console
wooAPI.fetchProducts().then(console.log)

# Should return array of product objects
# If error, check XAMPP and WordPress setup
```

## API Reference

### Base URLs

- **Local**: `http://localhost:8080/wordpress-api/?rest_route=/wc/v3`
- **Production**: `https://synergyx.digital/wp-json/wc/v3`

### Authentication

All production API requests require Basic Auth header:

```
Authorization: Basic [base64(consumerKey:consumerSecret)]
```

### Endpoints

#### Get All Products
```
GET /products
```
**Response**: Array of product objects
```json
[
  {
    "id": 123,
    "name": "SEO Optimization Package",
    "price": "1299",
    "short_description": "Improve your search rankings...",
    "categories": [{"id": 15, "name": "SEO"}]
  }
]
```

#### Get Single Product
```
GET /products/{id}
```
**Response**: Single product object with full details

#### Get Categories
```
GET /products/categories
```
**Response**: Array of category objects

### Error Handling

The API includes comprehensive error handling:

- **Network errors**: Graceful fallback to static content
- **API timeouts**: 2-second timeout with fallback
- **Invalid responses**: Validation and error messages
- **CORS issues**: Automatic detection and guidance

## Troubleshooting

### Common Issues

#### 1. "Products not loading"
**Symptoms**: Empty product grid, loading spinners forever
**Causes**:
- API credentials incorrect
- CORS not configured
- WordPress/WooCommerce not running

**Solutions**:
```bash
# Check API directly in browser
https://synergyx.digital/wp-json/wc/v3/products

# Check browser console for errors
# Look for CORS or 401 authentication errors
```

#### 2. "Cart not working"
**Symptoms**: Add to cart button doesn't respond
**Causes**:
- JavaScript errors
- localStorage blocked
- Cart UI not initialized

**Solutions**:
```javascript
// Check if cart is initialized
console.log(window.marketBoostCart);

// Check localStorage
console.log(localStorage.getItem('marketboost_cart'));
```

#### 3. "Local development not working"
**Symptoms**: Can't access localhost:3000
**Causes**:
- Live-server not installed
- Port already in use
- Node.js not installed

**Solutions**:
```bash
# Install dependencies
npm install

# Check if port is free
netstat -an | find "3000"

# Try different port
npm start -- --port=3001
```

### Performance Optimization

1. **Enable caching**: API responses cached for 5 minutes
2. **Lazy loading**: Products load as needed
3. **Image optimization**: Use WebP when possible
4. **CDN benefits**: Vercel provides global CDN automatically

### Security Considerations

1. **API keys**: Never commit real keys to public repos
2. **CORS**: Properly configured for domain security
3. **HTTPS**: Always use HTTPS in production
4. **Input validation**: Sanitize user inputs

---

## Quick Reference

### Key Files
- `js/api.js` - WooCommerce API integration
- `js/services-dynamic.js` - Product rendering
- `vercel.json` - Routing and proxy configuration
- `CLAUDE.md` - Detailed project documentation

### Important URLs
- **Production**: https://wp-marketng-store2.vercel.app
- **API**: https://synergyx.digital/wp-json/wc/v3
- **Local**: http://localhost:3000

### Commands
```bash
npm start          # Start development server
npm run build      # Build for production  
npm run test:e2e   # Run end-to-end tests
node scripts/verify.mjs  # Run all verification checks
```

This architecture provides a robust, scalable, and maintainable solution that combines the performance benefits of static sites with the power of WordPress e-commerce.