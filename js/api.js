// WooCommerce API Service
class WooCommerceAPI {
    constructor() {
        // Use local proxy in dev, direct API with auth in prod
        const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : '';
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        this.baseURL = isLocal
            ? 'http://localhost:8080/wordpress-api/?rest_route=/wc/v3'
            : 'https://synergyx.digital/wp-json/wc/v3';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Authentication for production API
        this.credentials = {
            consumerKey: 'ck_e6497143989e4699742151e2a82873652cbf8b96',
            consumerSecret: 'cs_d87ab450959241ec7fac88f7aaa1dc005801102d'
        };
        this.authHeader = btoa(`${this.credentials.consumerKey}:${this.credentials.consumerSecret}`);
    }

    async fetchProducts(options = {}) {
        const cacheKey = 'products';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            // Add Basic Auth for production API
            const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : '';
            const isLocal = host === 'localhost' || host === '127.0.0.1';
            if (!isLocal) {
                headers['Authorization'] = `Basic ${this.authHeader}`;
            }
            
            const fetchOptions = {
                method: 'GET',
                headers,
                ...options
            };
            
            const response = await fetch(`${this.baseURL}/products`, fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const products = await response.json();
            
            // Validate the response
            if (!Array.isArray(products)) {
                throw new Error('Invalid API response format: expected array of products');
            }
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: products,
                timestamp: Date.now()
            });
            
            console.log(`Successfully fetched ${products.length} products from API`);
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            
            // Check if it's a network error or timeout
            if (error.name === 'AbortError') {
                throw new Error('API request timed out');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error - unable to connect to API');
            }
            
            throw error;
        }
    }

    async fetchProduct(id) {
        const cacheKey = `product-${id}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            // Add Basic Auth for production API
            const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : '';
            const isLocal = host === 'localhost' || host === '127.0.0.1';
            if (!isLocal) {
                headers['Authorization'] = `Basic ${this.authHeader}`;
            }
            
            const response = await fetch(`${this.baseURL}/products/${id}`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const product = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: product,
                timestamp: Date.now()
            });
            
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    async fetchCategories() {
        const cacheKey = 'categories';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/products/categories`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const categories = await response.json();
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: categories,
                timestamp: Date.now()
            });
            
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Helper method to format price
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    // Helper method to strip HTML from descriptions
    stripHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
}

// Create global instance
window.wooAPI = new WooCommerceAPI();
