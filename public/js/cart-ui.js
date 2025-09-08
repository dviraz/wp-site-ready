// Cart UI Components for MarketBoost Platform
class CartUI {
    constructor(cart) {
        this.cart = cart;
        this.isDrawerOpen = false;
        this.cartIconElement = null;
        this.cartCountElement = null;
        this.cartDrawerElement = null;
        
        // Initialize after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.createCartIcon();
        this.createCartDrawer();
        this.setupEventListeners();
        this.updateCartCounter();
    }

    // Create cart icon in header
    createCartIcon() {
        const headerActions = document.querySelector('header .flex.items-center.gap-4');
        
        if (headerActions) {
            const cartButton = document.createElement('button');
            cartButton.className = 'relative p-2 rounded-full hover:bg-gray-100 transition-colors';
            cartButton.innerHTML = `
                <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-6 3h.01M9 16h.01" />
                </svg>
                <span class="cart-count absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
            `;
            
            cartButton.addEventListener('click', () => this.toggleCartDrawer());
            
            // Insert before user avatar
            const userAvatar = headerActions.querySelector('.aspect-square.rounded-full');
            if (userAvatar) {
                headerActions.insertBefore(cartButton, userAvatar);
            } else {
                headerActions.appendChild(cartButton);
            }
            
            this.cartIconElement = cartButton;
            this.cartCountElement = cartButton.querySelector('.cart-count');
        }
    }

    // Create sliding cart drawer
    createCartDrawer() {
        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-50';
        drawer.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-lg font-semibold">Shopping Cart</h3>
                    <button class="cart-close p-1 rounded-full hover:bg-gray-100">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <!-- Cart Items -->
                <div class="flex-1 overflow-y-auto p-4">
                    <div class="cart-items-container">
                        <!-- Items will be inserted here -->
                    </div>
                    
                    <!-- Empty cart message -->
                    <div class="cart-empty text-center py-8 hidden">
                        <svg class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-6 3h.01M9 16h.01" />
                        </svg>
                        <p class="text-gray-500 mb-4">Your cart is empty</p>
                        <button class="btn-primary cart-continue-shopping">Continue Shopping</button>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="cart-footer border-t p-4 space-y-4">
                    <!-- Bundle suggestions -->
                    <div class="bundle-suggestions hidden">
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div class="flex items-center mb-2">
                                <svg class="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                                <span class="font-medium text-yellow-800">Bundle & Save!</span>
                            </div>
                            <div class="bundle-content">
                                <!-- Bundle suggestions will be inserted here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Totals -->
                    <div class="cart-totals">
                        <div class="flex justify-between items-center text-lg font-semibold">
                            <span>Total:</span>
                            <span class="cart-total">$0</span>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="space-y-2">
                        <button class="btn-primary w-full cart-checkout">
                            Proceed to Checkout
                        </button>
                        <button class="btn-secondary w-full cart-continue-shopping">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(drawer);
        this.cartDrawerElement = drawer;
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay fixed inset-0 bg-black bg-opacity-50 z-40 hidden';
        overlay.addEventListener('click', () => this.closeCartDrawer());
        document.body.appendChild(overlay);
        this.cartOverlayElement = overlay;
    }

    // Setup event listeners
    setupEventListeners() {
        // Cart events
        this.cart.on('itemAdded', (data) => {
            this.updateCartCounter();
            this.renderCartItems();
            this.showAddedToCartNotification(data.product);
        });

        this.cart.on('itemRemoved', () => {
            this.updateCartCounter();
            this.renderCartItems();
        });

        this.cart.on('cartUpdated', () => {
            this.updateCartCounter();
            this.renderCartItems();
        });

        this.cart.on('cartLoaded', () => {
            this.updateCartCounter();
            this.renderCartItems();
        });

        // UI event listeners
        const closeButton = this.cartDrawerElement.querySelector('.cart-close');
        closeButton.addEventListener('click', () => this.closeCartDrawer());

        const continueButtons = this.cartDrawerElement.querySelectorAll('.cart-continue-shopping');
        continueButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeCartDrawer());
        });

        const checkoutButton = this.cartDrawerElement.querySelector('.cart-checkout');
        checkoutButton.addEventListener('click', () => this.goToCheckout());
    }

    // Toggle cart drawer
    toggleCartDrawer() {
        if (this.isDrawerOpen) {
            this.closeCartDrawer();
        } else {
            this.openCartDrawer();
        }
    }

    // Open cart drawer
    openCartDrawer() {
        this.renderCartItems();
        this.cartDrawerElement.classList.remove('translate-x-full');
        this.cartOverlayElement.classList.remove('hidden');
        this.isDrawerOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close cart drawer
    closeCartDrawer() {
        this.cartDrawerElement.classList.add('translate-x-full');
        this.cartOverlayElement.classList.add('hidden');
        this.isDrawerOpen = false;
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Update cart counter
    updateCartCounter() {
        if (!this.cartCountElement) return;
        
        const totalItems = this.cart.getTotalItems();
        
        if (totalItems > 0) {
            this.cartCountElement.textContent = totalItems;
            this.cartCountElement.classList.remove('hidden');
            
            // Add bounce animation
            this.cartCountElement.classList.add('animate-bounce');
            setTimeout(() => {
                this.cartCountElement.classList.remove('animate-bounce');
            }, 600);
        } else {
            this.cartCountElement.classList.add('hidden');
        }
    }

    // Render cart items in drawer
    renderCartItems() {
        if (!this.cartDrawerElement) return;
        
        const container = this.cartDrawerElement.querySelector('.cart-items-container');
        const emptyMessage = this.cartDrawerElement.querySelector('.cart-empty');
        const footer = this.cartDrawerElement.querySelector('.cart-footer');
        const totalElement = this.cartDrawerElement.querySelector('.cart-total');
        
        const cartSummary = this.cart.getCartSummary();
        
        if (cartSummary.isEmpty) {
            container.innerHTML = '';
            emptyMessage.classList.remove('hidden');
            footer.classList.add('hidden');
        } else {
            emptyMessage.classList.add('hidden');
            footer.classList.remove('hidden');
            
            container.innerHTML = cartSummary.items.map(item => this.renderCartItem(item)).join('');
            totalElement.textContent = this.cart.formatPrice(cartSummary.subtotal);
            
            this.renderBundleSuggestions();
            this.setupItemEventListeners();
        }
    }

    // Render individual cart item
    renderCartItem(item) {
        return `
            <div class="cart-item flex items-center gap-3 p-3 border-b" data-product-id="${item.id}">
                <div class="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-md">` :
                        `<svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>`
                    }
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-sm">${item.name}</h4>
                    <p class="text-gray-500 text-xs">${item.categories.map(cat => cat.name).join(', ')}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <button class="quantity-decrease bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">-</button>
                        <span class="quantity-display text-sm font-medium">${item.quantity}</span>
                        <button class="quantity-increase bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-semibold">${this.cart.formatPrice(item.price * item.quantity)}</div>
                    <div class="text-xs text-gray-500">${this.cart.formatPrice(item.price)} each</div>
                    <button class="remove-item text-red-500 text-xs mt-1 hover:text-red-700">Remove</button>
                </div>
            </div>
        `;
    }

    // Setup event listeners for cart items
    setupItemEventListeners() {
        const cartItems = this.cartDrawerElement.querySelectorAll('.cart-item');
        
        cartItems.forEach(item => {
            const productId = parseInt(item.dataset.productId);
            
            // Quantity controls
            const decreaseBtn = item.querySelector('.quantity-decrease');
            const increaseBtn = item.querySelector('.quantity-increase');
            const removeBtn = item.querySelector('.remove-item');
            
            decreaseBtn.addEventListener('click', () => {
                const currentQty = this.cart.getItemQuantity(productId);
                if (currentQty > 1) {
                    this.cart.updateQuantity(productId, currentQty - 1);
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                const currentQty = this.cart.getItemQuantity(productId);
                this.cart.updateQuantity(productId, currentQty + 1);
            });
            
            removeBtn.addEventListener('click', () => {
                this.cart.removeItem(productId);
            });
        });
    }

    // Render bundle suggestions
    renderBundleSuggestions() {
        const bundleContainer = this.cartDrawerElement.querySelector('.bundle-suggestions');
        const bundleContent = bundleContainer.querySelector('.bundle-content');
        const suggestions = this.cart.getBundleSuggestions();
        
        if (suggestions.length > 0) {
            bundleContent.innerHTML = suggestions.map(bundle => `
                <div class="bundle-suggestion mb-2 last:mb-0">
                    <p class="text-sm text-yellow-800 mb-1">
                        <strong>${bundle.name}</strong>
                    </p>
                    <p class="text-xs text-yellow-700 mb-2">${bundle.description}</p>
                    <button class="bg-yellow-600 text-white text-xs px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                        Add Bundle
                    </button>
                </div>
            `).join('');
            
            bundleContainer.classList.remove('hidden');
        } else {
            bundleContainer.classList.add('hidden');
        }
    }

    // Show "Added to Cart" notification
    showAddedToCartNotification(product) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60] transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm font-medium">Added ${product.name} to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Go to checkout
    goToCheckout() {
        const cartData = this.cart.exportForCheckout();
        
        // TODO: Implement actual checkout flow
        // For now, show alert with cart contents
        alert(`Checkout functionality coming soon!\n\nCart Total: ${this.cart.formatPrice(cartData.total)}\nItems: ${cartData.items.length}`);
        
        console.log('Checkout data:', cartData);
    }
}

// Initialize cart UI when cart is available
document.addEventListener('DOMContentLoaded', function() {
    if (window.marketBoostCart) {
        window.cartUI = new CartUI(window.marketBoostCart);
    }
});