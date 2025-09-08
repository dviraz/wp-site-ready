// Smart Cart System for MarketBoost Platform
class ShoppingCart {
    constructor() {
        this.items = [];
        this.storageKey = 'marketboost_cart';
        this.apiBaseUrl = 'http://localhost:8080/wordpress-api/?rest_route=/wc/v3';
        this.eventListeners = new Map();
        
        // Load cart from localStorage on init
        this.loadFromStorage();
        
        // Setup periodic sync with backend (every 30 seconds if items exist)
        setInterval(() => {
            if (this.items.length > 0) {
                this.syncWithBackend();
            }
        }, 30000);
    }

    // Event system for cart updates
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in cart event listener for ${event}:`, error);
                }
            });
        }
    }

    // Add item to cart
    addItem(product, quantity = 1) {
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            // Item already exists, update quantity
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // New item
            this.items.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price) || 0,
                image: product.images?.[0]?.src || '',
                slug: product.slug,
                quantity: quantity,
                sku: product.sku || '',
                categories: product.categories || [],
                addedAt: Date.now()
            });
        }

        this.saveToStorage();
        this.emit('itemAdded', { product, quantity, totalItems: this.getTotalItems() });
        this.emit('cartUpdated', this.getCartSummary());

        // Track analytics event
        this.trackEvent('add_to_cart', {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: quantity
        });

        return true;
    }

    // Remove item from cart
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const removedItem = this.items.splice(itemIndex, 1)[0];
            this.saveToStorage();
            this.emit('itemRemoved', { item: removedItem, totalItems: this.getTotalItems() });
            this.emit('cartUpdated', this.getCartSummary());

            // Track analytics event
            this.trackEvent('remove_from_cart', {
                item_id: removedItem.id,
                item_name: removedItem.name,
                price: removedItem.price,
                quantity: removedItem.quantity
            });

            return removedItem;
        }
        
        return null;
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item && quantity > 0) {
            const oldQuantity = item.quantity;
            item.quantity = quantity;
            this.saveToStorage();
            this.emit('quantityUpdated', { productId, oldQuantity, newQuantity: quantity });
            this.emit('cartUpdated', this.getCartSummary());
            return true;
        } else if (quantity === 0) {
            // Remove item if quantity is 0
            return this.removeItem(productId);
        }
        
        return false;
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart summary
    getCartSummary() {
        return {
            items: this.items,
            totalItems: this.getTotalItems(),
            subtotal: this.getTotal(),
            isEmpty: this.items.length === 0
        };
    }

    // Clear cart
    clearCart() {
        const wasEmpty = this.items.length === 0;
        this.items = [];
        this.saveToStorage();
        
        if (!wasEmpty) {
            this.emit('cartCleared');
            this.emit('cartUpdated', this.getCartSummary());
        }
    }

    // Check if product is in cart
    isInCart(productId) {
        return this.items.some(item => item.id === productId);
    }

    // Get item quantity in cart
    getItemQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                items: this.items,
                lastUpdated: Date.now()
            }));
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.items = data.items || [];
                
                // Clean up old items (older than 7 days)
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                this.items = this.items.filter(item => 
                    item.addedAt && item.addedAt > weekAgo
                );
                
                if (this.items.length > 0) {
                    this.emit('cartLoaded', this.getCartSummary());
                }
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
            this.items = [];
        }
    }

    // Sync with WooCommerce backend (future enhancement)
    async syncWithBackend() {
        // TODO: Implement when user authentication is added
        // This will sync cart with WooCommerce cart API
        console.log('Cart sync with backend - not implemented yet');
    }

    // Get recommended products based on cart contents
    getRecommendations() {
        if (this.items.length === 0) return [];
        
        // Get categories of items in cart
        const cartCategories = new Set();
        this.items.forEach(item => {
            item.categories.forEach(cat => cartCategories.add(cat.id));
        });

        // This will be enhanced to call the WooCommerce API
        return Array.from(cartCategories);
    }

    // Bundle suggestions
    getBundleSuggestions() {
        // Predefined bundles based on common service combinations
        const bundles = [
            {
                id: 'seo-content',
                name: 'SEO + Content Bundle',
                description: 'Save 15% when combining SEO optimization with content creation',
                discount: 0.15,
                requiredCategories: ['SEO', 'Content'],
                suggestedProducts: []
            },
            {
                id: 'social-email',
                name: 'Social + Email Bundle', 
                description: 'Complete engagement package with 20% savings',
                discount: 0.20,
                requiredCategories: ['Social Media', 'Email Marketing'],
                suggestedProducts: []
            },
            {
                id: 'ppc-seo',
                name: 'PPC + SEO Combo',
                description: 'Dominate search results with 10% bundle discount',
                discount: 0.10,
                requiredCategories: ['PPC', 'SEO'],
                suggestedProducts: []
            }
        ];

        const cartCategories = new Set();
        this.items.forEach(item => {
            item.categories.forEach(cat => cartCategories.add(cat.name));
        });

        return bundles.filter(bundle => {
            // Check if any required categories are in cart
            return bundle.requiredCategories.some(cat => cartCategories.has(cat));
        });
    }

    // Track analytics events
    trackEvent(eventName, data) {
        // Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                currency: 'USD',
                value: data.price * data.quantity,
                ...data
            });
        }

        // Console log for debugging
        console.log(`Cart Event: ${eventName}`, data);
    }

    // Format price for display
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    // Export cart for checkout
    exportForCheckout() {
        return {
            items: this.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total: this.getTotal(),
            currency: 'USD',
            timestamp: Date.now()
        };
    }
}

// Create global cart instance
window.marketBoostCart = new ShoppingCart();

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('MarketBoost Cart initialized with', marketBoostCart.getTotalItems(), 'items');
});