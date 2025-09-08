// Dynamic Services Loader
class ServicesRenderer {
    constructor() {
        this.productsContainer = null;
        this.originalFilters = null;
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadServices());
        } else {
            await this.loadServices();
        }
    }

    async loadServices() {
        try {
            console.log('Loading services from WooCommerce API...');
            
            // Find the products grid container - look for any grid container
            this.productsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2') || document.querySelector('.grid');
            if (!this.productsContainer) {
                console.error('Products container not found - using static content');
                return;
            }

            // Show loading state
            this.showLoading();

            try {
                // Attempt to fetch products from API with timeout (fast fallback)
                const controller = new AbortController();
                const timeoutMs = 4000;
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                const products = await Promise.race([
                    wooAPI.fetchProducts({ signal: controller.signal }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), timeoutMs))
                ]);

                clearTimeout(timeoutId);
                
                if (products && products.length > 0) {
                    console.log(`Loaded ${products.length} products from API`);
                    // Render products
                    this.renderProducts(products);
                    // Update filters with real categories
                    await this.updateFilters(products);
                    // Re-initialize filtering functionality
                    this.initializeFiltering(products);
                    // Update results count
                    this.updateResultsCount(products.length);
                    // Apply preselected categories from URL (if any)
                    this.applyPreselectFromQuery();
                    this.filterProducts();
                } else {
                    throw new Error('No products returned from API');
                }

            } catch (apiError) {
                console.warn('API failed, falling back to static content:', apiError);
                this.useStaticContent();
            }

        } catch (error) {
            console.error('Error loading services:', error);
            this.useStaticContent();
        }
    }

    showLoading() {
        // Create skeleton cards that mimic the actual service card layout
        const skeletonCards = Array(6).fill().map(() => `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
                <div class="h-4 bg-gray-300 rounded mb-3"></div>
                <div class="h-3 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div class="space-y-2 mb-4">
                    <div class="h-2 bg-gray-200 rounded"></div>
                    <div class="h-2 bg-gray-200 rounded"></div>
                    <div class="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="h-6 bg-gray-300 rounded w-16"></div>
                    <div class="h-8 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        `).join('');

        this.productsContainer.innerHTML = skeletonCards;
        
        // Add a subtle loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'col-span-full text-center py-4';
        loadingIndicator.innerHTML = `
            <div class="flex items-center justify-center space-x-2 text-gray-500">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm">Loading our marketing services...</span>
            </div>
        `;
        this.productsContainer.appendChild(loadingIndicator);
    }

    showError() {
        this.productsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-500 mb-4">
                    <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Unable to load services</h3>
                <p class="text-gray-600 mb-4">There was an error connecting to the API. Please try again later.</p>
                <button onclick="location.reload()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Retry
                </button>
            </div>
        `;
    }

    useStaticContent() {
        // Always render through a consistent pipeline so filters work
        console.log('Using static content as fallback');
        // Remove loading indicator if present
        const loadingDiv = document.querySelector('.col-span-full');
        if (loadingDiv) loadingDiv.remove();
        this.renderStaticServices();
    }

    renderStaticServices() {
        // Fallback static services to ensure page never shows "0 services"
        const staticServices = [
            {
                id: 1,
                name: "Social Media Management",
                price: 999,
                description: "Manage your social media presence with expert content creation and community engagement.",
                features: ["Daily posts on 2-3 platforms", "Community engagement", "Monthly performance report"],
                category: "Social Media"
            },
            {
                id: 2,
                name: "SEO Optimization",
                price: 1299,
                description: "Improve your website's visibility in search engine results with comprehensive SEO strategies.",
                features: ["Keyword research & strategy", "On-page optimization", "Technical SEO audit"],
                category: "SEO"
            },
            {
                id: 3,
                name: "Content Creation",
                price: 699,
                description: "Engaging blog posts, articles, and website copy to attract and convert customers.",
                features: ["4 blog posts (500-800 words each)", "Topic research & strategy", "SEO optimization"],
                category: "Content"
            },
            {
                id: 4,
                name: "Email Marketing Campaign",
                price: 799,
                description: "Targeted email campaigns with professional design, compelling copy, and automation.",
                features: ["Email template design", "Campaign setup & deployment", "Performance tracking"],
                category: "Email"
            },
            {
                id: 5,
                name: "PPC Management",
                price: 1199,
                description: "Professional Google Ads and social media advertising management to maximize ROI.",
                features: ["Campaign setup & optimization", "Keyword research & bidding", "Monthly performance reports"],
                category: "PPC"
            },
            {
                id: 6,
                name: "Web Design & Development",
                price: 2499,
                description: "Professional website design and development optimized for conversions and user experience.",
                features: ["Custom responsive design", "CMS integration", "SEO optimization"],
                category: "Web Development"
            }
        ];

        // Normalize to API shape
        const fallbackProducts = staticServices.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price,
            short_description: s.description,
            description: s.description,
            categories: [{ name: s.category }]
        }));

        this.renderProducts(fallbackProducts);
        this.updateFilters(fallbackProducts);
        this.initializeFiltering(fallbackProducts);
        this.updateResultsCount(fallbackProducts.length);
        this.applyPreselectFromQuery();
        this.filterProducts();

        console.log(`Rendered ${fallbackProducts.length} static services as fallback`);
    }

    renderProducts(products) {
        this.productsContainer.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }

    renderProductCard(product) {
        const price = product.price ? `$${product.price}` : 'Contact for pricing';
        const shortDesc = wooAPI.stripHTML(product.short_description) || wooAPI.stripHTML(product.description).substring(0, 150) + '...';
        const categories = product.categories.map(cat => cat.name).join(', ');
        
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 product-card" 
                 data-product-id="${product.id}"
                 data-categories="${categories.toLowerCase()}"
                 data-price="${product.price || 0}">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900">${product.name}</h3>
                        <span class="text-2xl font-bold text-red-500">${price}</span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        ${shortDesc}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${product.categories.map(cat => 
                            `<span class="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium">${cat.name}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <button onclick="viewProduct(${product.id})" 
                                class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium">
                            Learn More
                        </button>
                        <button onclick="addToCartFromCard(${product.id})" 
                                class="add-to-cart-btn border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                                data-product-id="${product.id}">
                            <span class="btn-text">Add to Cart</span>
                            <svg class="btn-loading hidden animate-spin h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async updateFilters(products) {
        // Get unique categories
        const categories = [...new Set(products.flatMap(p => p.categories.map(c => c.name)))];
        
        // Update category filter dropdown
        const industrySelect = document.getElementById('vertical');
        if (industrySelect) {
            industrySelect.innerHTML = `
                <option value="">All Industries</option>
                ${categories.map(cat => `<option value="${cat.toLowerCase()}">${cat}</option>`).join('')}
            `;
        }

        // Update price range based on actual product prices
        const prices = products.map(p => parseFloat(p.price || 0)).filter(p => p > 0);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        
        const priceSlider = document.querySelector('.price-range-slider');
        if (priceSlider && maxPrice > 0) {
            priceSlider.max = maxPrice;
            priceSlider.min = minPrice;
            priceSlider.value = maxPrice;
            
            // Update price display
            const priceDisplay = document.querySelector('.price-display');
            if (priceDisplay) {
                priceDisplay.textContent = `Up to $${maxPrice}`;
            }
        }
    }

    initializeFiltering(products) {
        // Store original products for filtering
        this.originalProducts = products;
        
        // Add event listeners for filters
        const filterInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"], select');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.filterProducts());
        });

        const priceSlider = document.querySelector('.price-range-slider');
        if (priceSlider) {
            priceSlider.addEventListener('input', () => this.filterProducts());
        }

        // Hook category tag buttons (All, SEO, etc.)
        const categoryButtons = document.querySelectorAll('.flex.flex-wrap.gap-2.mb-6 button');
        if (categoryButtons.length) {
            categoryButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryButtons.forEach(b => {
                        b.classList.remove('bg-[var(--primary-color)]', 'text-white');
                        b.classList.add('bg-gray-100', 'text-[var(--text-secondary)]');
                    });
                    btn.classList.remove('bg-gray-100', 'text-[var(--text-secondary)]');
                    btn.classList.add('bg-[var(--primary-color)]', 'text-white');

                    const label = (btn.textContent || '').trim();
                    this.selectedCategory = label.toLowerCase() === 'all' ? '' : label.toLowerCase();
                    this.preselectedCategories = [];
                    this.filterProducts();
                });
            });
        }
    }

    filterProducts() {
        const industryFilter = document.getElementById('vertical')?.value.toLowerCase();
        const priceLimit = document.querySelector('.price-range-slider')?.value;
        const categoryTag = (this.selectedCategory || '').toLowerCase();

        let filteredProducts = this.originalProducts;

        // Filter by category/industry (from dropdown)
        if (industryFilter) {
            filteredProducts = filteredProducts.filter(product =>
                product.categories.some(cat => cat.name.toLowerCase().includes(industryFilter))
            );
        }

        // Filter by category tag buttons
        if (categoryTag) {
            filteredProducts = filteredProducts.filter(product =>
                product.categories.some(cat => cat.name.toLowerCase().includes(categoryTag))
            );
        } else if (this.preselectedCategories && this.preselectedCategories.length) {
            const tokens = this.preselectedCategories;
            filteredProducts = filteredProducts.filter(product =>
                product.categories.some(cat => tokens.some(t => cat.name.toLowerCase().includes(t)))
            );
        }

        // Filter by price
        if (priceLimit) {
            filteredProducts = filteredProducts.filter(product =>
                parseFloat(product.price || 0) <= parseFloat(priceLimit)
            );
        }

        // Update display
        if (filteredProducts.length === 0) {
            this.productsContainer.innerHTML = `
                <div class="col-span-full text-center py-12 text-[var(--text-secondary)]">
                    <p class="text-lg font-semibold mb-2">No services match your filters</p>
                    <p class="text-sm">Try adjusting your filters or clearing them to see more options.</p>
                </div>`;
        } else {
            this.renderProducts(filteredProducts);
        }
        this.updateResultsCount(filteredProducts.length);
    }

    updateResultsCount(count) {
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.textContent = `${count} service${count !== 1 ? 's' : ''} found`;
        }
    }
}

    applyPreselectFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const pre = params.get('preselect');
        if (!pre) return;
        const tokens = pre.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        if (tokens.length === 0) return;
        this.preselectedCategories = tokens;

        // Highlight the first matching category button, if any
        const categoryButtons = Array.from(document.querySelectorAll('.flex.flex-wrap.gap-2.mb-6 button'));
        const first = categoryButtons.find(btn => tokens.includes((btn.textContent || '').trim().toLowerCase()));
        if (first) {
            categoryButtons.forEach(b => {
                b.classList.remove('bg-[var(--primary-color)]', 'text-white');
                b.classList.add('bg-gray-100', 'text-[var(--text-secondary)]');
            });
            first.classList.remove('bg-gray-100', 'text-[var(--text-secondary)]');
            first.classList.add('bg-[var(--primary-color)]', 'text-white');
        }
    }

// Global functions for product interactions
window.viewProduct = function(productId) {
    // Navigate to product detail page
    window.location.href = `service-detail.html?id=${productId}`;
};

window.addToCartFromCard = async function(productId) {
    console.log('Adding product to cart:', productId);
    
    // Find the button that was clicked
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    // Show loading state
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    button.disabled = true;
    
    try {
        // Find the product in our original products array
        const product = window.servicesRenderer?.originalProducts?.find(p => p.id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Add to cart
        if (window.marketBoostCart) {
            window.marketBoostCart.addItem(product);
            
            // Success feedback
            btnText.textContent = 'Added!';
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            button.classList.remove('border-red-500', 'text-red-500', 'hover:bg-red-50');
            button.classList.add('border-green-500', 'text-green-500', 'hover:bg-green-50');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                btnText.textContent = 'Add to Cart';
                button.classList.remove('border-green-500', 'text-green-500', 'hover:bg-green-50');
                button.classList.add('border-red-500', 'text-red-500', 'hover:bg-red-50');
                button.disabled = false;
            }, 2000);
            
        } else {
            throw new Error('Cart not initialized');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        
        // Error feedback
        btnText.textContent = 'Error';
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            btnText.textContent = 'Add to Cart';
            button.disabled = false;
        }, 2000);
    }
};

// Initialize when page loads
const servicesRenderer = new ServicesRenderer();
window.servicesRenderer = servicesRenderer; // Make globally accessible
servicesRenderer.init();
