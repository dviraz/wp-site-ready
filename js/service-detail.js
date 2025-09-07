// Service Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeServiceDetail();
    initializePriceCalculator();
    initializeContactForms();
    initializeFAQ();
});

function initializeServiceDetail() {
    // Add-on checkboxes functionality
    const addOnCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    addOnCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTotalPrice);
    });

    // Action buttons
    initializeActionButtons();
    
    // Gallery functionality
    initializeGallery();
    
    // Testimonials or reviews (if any)
    initializeTestimonials();
}

function initializePriceCalculator() {
    const basePrice = 999; // Base service price
    updateTotalPrice(); // Initial calculation
    
    // Watch for changes in add-ons
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            updateTotalPrice();
        }
    });
}

function updateTotalPrice() {
    const basePrice = 999;
    let totalPrice = basePrice;
    
    const addOns = document.querySelectorAll('input[type="checkbox"]:checked');
    addOns.forEach(addOn => {
        const priceText = addOn.closest('label').querySelector('span[class*="font-medium"]').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        totalPrice += price;
    });
    
    // Update the displayed price
    const priceDisplay = document.querySelector('.text-4xl');
    if (priceDisplay) {
        priceDisplay.textContent = `$${totalPrice.toLocaleString()}`;
    }
    
    // Update any other price references
    updateActionButtonsPricing(totalPrice);
    
    // Show savings or discounts if applicable
    updateSavingsDisplay(totalPrice, basePrice);
}

function updateActionButtonsPricing(totalPrice) {
    // Update button text to reflect current pricing
    const getStartedBtn = document.querySelector('button[class*="Get Started"]');
    if (getStartedBtn && totalPrice !== 999) {
        getStartedBtn.textContent = `Get Started - $${totalPrice.toLocaleString()}/mo`;
    }
}

function updateSavingsDisplay(totalPrice, basePrice) {
    const difference = totalPrice - basePrice;
    if (difference > 0) {
        showPriceUpdateNotification(`+ $${difference} in add-ons selected`);
    }
}

function initializeActionButtons() {
    // Get Started button
    const getStartedBtn = document.querySelector('button[class*="Get Started"]');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            handleGetStarted();
        });
    }
    
    // Request Quote button
    const quoteBtn = document.querySelector('button[class*="Request Quote"]');
    if (quoteBtn) {
        quoteBtn.addEventListener('click', function() {
            showQuoteModal();
        });
    }
    
    // Add to Bundle button with proper state management
    let bundleState = false;
    const bundleBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Add to Bundle'));
    if (bundleBtn) {
        bundleBtn.addEventListener('click', function() {
            if (!bundleState) {
                bundleState = true;
                addToBundle();
                this.textContent = 'Remove from Bundle';
                this.classList.add('bg-[var(--text-secondary)]', 'text-white');
                this.classList.remove('bg-transparent', 'text-[var(--text-secondary)]');
            } else {
                bundleState = false;
                removeFromBundle();
                this.textContent = 'Add to Bundle';
                this.classList.remove('bg-[var(--text-secondary)]', 'text-white');
                this.classList.add('bg-transparent', 'text-[var(--text-secondary)]');
            }
        });
    }
}

function handleGetStarted() {
    const selectedAddOns = getSelectedAddOns();
    const totalPrice = calculateTotalPrice();
    
    // Create a summary modal
    showGetStartedModal({
        service: 'Social Media Management',
        basePrice: 999,
        addOns: selectedAddOns,
        totalPrice: totalPrice
    });
}

function getSelectedAddOns() {
    const selectedAddOns = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        const name = label.querySelector('span:first-child').textContent;
        const priceText = label.querySelector('span[class*="font-medium"]').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        
        selectedAddOns.push({ name, price });
    });
    
    return selectedAddOns;
}

function calculateTotalPrice() {
    const basePrice = 999;
    const selectedAddOns = getSelectedAddOns();
    const addOnTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return basePrice + addOnTotal;
}

function showGetStartedModal(orderDetails) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    
    const addOnsHTML = orderDetails.addOns.map(addOn => 
        `<div class="flex justify-between"><span>${addOn.name}</span><span>+$${addOn.price}</span></div>`
    ).join('');
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 max-h-96 overflow-y-auto">
            <h3 class="text-2xl font-bold mb-6">Order Summary</h3>
            
            <div class="space-y-4 mb-6">
                <div class="flex justify-between font-medium">
                    <span>${orderDetails.service}</span>
                    <span>$${orderDetails.basePrice}</span>
                </div>
                
                ${addOnsHTML}
                
                <hr class="my-4">
                
                <div class="flex justify-between font-bold text-lg">
                    <span>Total Monthly</span>
                    <span class="text-red-600">$${orderDetails.totalPrice.toLocaleString()}</span>
                </div>
            </div>
            
            <form class="space-y-4" onsubmit="submitOrder(event)">
                <input type="email" placeholder="Your business email" required 
                       class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <input type="tel" placeholder="Phone number" required 
                       class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <textarea placeholder="Tell us about your business goals..." rows="3"
                          class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                            class="flex-1 bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700">
                        Start Service
                    </button>
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                            class="flex-1 border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
            
            <p class="text-xs text-gray-500 mt-4 text-center">
                No setup fees • Cancel anytime • 30-day money-back guarantee
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on email input
    setTimeout(() => {
        modal.querySelector('input[type="email"]').focus();
    }, 100);
}

function showQuoteModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 class="text-2xl font-bold mb-4">Request Custom Quote</h3>
            <p class="text-gray-600 mb-6">Get a personalized quote based on your specific needs and budget.</p>
            
            <form class="space-y-4" onsubmit="submitQuoteRequest(event)">
                <input type="text" placeholder="Company name" required 
                       class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <input type="email" placeholder="Business email" required 
                       class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <select required class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                    <option value="">Company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                </select>
                <input type="text" placeholder="Monthly marketing budget" 
                       class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <textarea placeholder="Describe your marketing goals and challenges..." rows="4" required
                          class="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                            class="flex-1 bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700">
                        Request Quote
                    </button>
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                            class="flex-1 border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addToBundle() {
    const service = {
        name: 'Social Media Management',
        price: calculateTotalPrice(),
        addOns: getSelectedAddOns()
    };
    
    // Store in localStorage for bundle building
    let bundle = JSON.parse(localStorage.getItem('marketingBundle') || '[]');
    
    // Check if service already exists in bundle
    const existingIndex = bundle.findIndex(item => item.name === service.name);
    if (existingIndex >= 0) {
        bundle[existingIndex] = service; // Update existing
        showNotification('Service updated in your bundle!', 'success');
    } else {
        bundle.push(service);
        showNotification('Service added to your bundle!', 'success');
    }
    
    localStorage.setItem('marketingBundle', JSON.stringify(bundle));
    
    // Show bundle preview
    showBundlePreview(bundle);
}

function removeFromBundle() {
    const serviceName = 'Social Media Management';
    
    // Remove from localStorage bundle
    let bundle = JSON.parse(localStorage.getItem('marketingBundle') || '[]');
    bundle = bundle.filter(item => item.name !== serviceName);
    localStorage.setItem('marketingBundle', JSON.stringify(bundle));
    
    showNotification('Service removed from your bundle!', 'info');
    
    // Hide any existing bundle preview
    const existingPreview = document.querySelector('.fixed.bottom-4.right-4');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Show updated bundle preview if there are still items
    if (bundle.length > 0) {
        showBundlePreview(bundle);
    }
}

function showBundlePreview(bundle) {
    const totalPrice = bundle.reduce((sum, item) => sum + item.price, 0);
    const bundleCount = bundle.length;
    
    const preview = document.createElement('div');
    preview.className = 'fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm';
    preview.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold">Your Bundle</h4>
            <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
        <div class="text-sm text-gray-600 mb-3">
            ${bundleCount} service${bundleCount !== 1 ? 's' : ''} • $${totalPrice.toLocaleString()}/month
        </div>
        <button onclick="viewFullBundle()" class="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
            View Bundle
        </button>
    `;
    
    document.body.appendChild(preview);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (preview.parentNode) {
            preview.remove();
        }
    }, 10000);
}

function initializeGallery() {
    const galleryItems = document.querySelectorAll('a[class*="group block"]');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            showGalleryModal(index);
        });
    });
}

function showGalleryModal(startIndex) {
    const images = [
        'https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&w=800&q=80',
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&w=800&q=80',
        'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-4.0.3&w=800&q=80'
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full p-4">
            <img src="${images[startIndex]}" class="max-w-full max-h-full rounded-lg" alt="Portfolio sample">
            <button onclick="this.closest('.fixed').remove()" 
                    class="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('details');
    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            if (this.open) {
                // Close other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== this) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
}

function initializeContactForms() {
    // Contact link handler
    const contactLinks = document.querySelectorAll('a[href*="Contact"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showContactModal();
        });
    });
}

function showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 class="text-2xl font-bold mb-4">Contact Our Experts</h3>
            <p class="text-gray-600 mb-6">Have questions about this service? Our marketing experts are here to help.</p>
            
            <div class="space-y-4 mb-6">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                    <span>experts@marketboost.com</span>
                </div>
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                    <span>(555) 123-4567</span>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button onclick="scheduleCall()" class="flex-1 bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700">
                    Schedule Call
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Form submission handlers
function submitOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        form.closest('.fixed').remove();
        showNotification('Order submitted successfully! We\'ll contact you within 24 hours to get started.', 'success');
    }, 2000);
}

function submitQuoteRequest(event) {
    event.preventDefault();
    const form = event.target;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        form.closest('.fixed').remove();
        showNotification('Quote request sent! We\'ll prepare a custom proposal and send it to you within 2 business days.', 'success');
    }, 1500);
}

function scheduleCall() {
    // This would typically open a calendar booking widget
    showNotification('Calendar booking will open in a new window.', 'info');
    // window.open('https://calendly.com/marketboost-experts', '_blank');
}

function viewFullBundle() {
    window.location.href = 'services.html#bundle';
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:text-gray-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showPriceUpdateNotification(message) {
    // Small, subtle notification for price updates
    const existing = document.getElementById('priceUpdate');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'priceUpdate';
    notification.className = 'fixed top-20 right-4 z-40 bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm shadow-sm';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function initializeTestimonials() {
    // Placeholder function for testimonials functionality
    // This can be expanded later to handle testimonial carousels, reviews, etc.
    console.log('Testimonials initialized');
}

function initializeGallery() {
    // Placeholder function for gallery functionality
    // This can be expanded later to handle image galleries, lightboxes, etc.  
    console.log('Gallery initialized');
}

function initializeContactForms() {
    // Placeholder function for contact form functionality
    // This can be expanded later to handle form submissions, validation, etc.
    console.log('Contact forms initialized');
}

function initializeFAQ() {
    // Placeholder function for FAQ functionality
    // This can be expanded later to handle FAQ accordions, search, etc.
    console.log('FAQ initialized');
}

// Make functions globally available
window.submitOrder = submitOrder;
window.submitQuoteRequest = submitQuoteRequest;
window.scheduleCall = scheduleCall;
window.viewFullBundle = viewFullBundle;