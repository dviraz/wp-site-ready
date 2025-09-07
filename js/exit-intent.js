// Exit Intent Popup for MarketBoost Platform
class ExitIntentPopup {
    constructor() {
        this.popup = null;
        this.overlay = null;
        this.isShown = false;
        this.isDestroyed = false;
        this.mouseLeaveTimer = null;
        this.settings = {
            enabled: false,        // Disabled to prevent showing bundle offers before users can see services
            sensitivity: 20,       // pixels from top to trigger
            delay: 100,           // ms delay before showing
            cookieExpiry: 24,     // hours before showing again
            mobileEnabled: false  // disable on mobile by default
        };
        
        this.offers = [
            {
                title: "Wait! Don't Leave Empty Handed",
                subtitle: "Get 25% Off Your First Marketing Package",
                description: "Join over 1,000+ businesses that have boosted their growth with our proven marketing services.",
                discount: "25% OFF",
                code: "SAVE25NOW",
                buttonText: "Claim My Discount",
                image: null
            },
            {
                title: "Before You Go...",
                subtitle: "Get a FREE Marketing Audit Worth $299",
                description: "Our experts will analyze your current marketing and show you exactly how to increase your revenue.",
                discount: "FREE $299 VALUE",
                code: "FREEAUDIT",
                buttonText: "Get Free Audit",
                image: null
            },
            {
                title: "Exclusive Offer!",
                subtitle: "Bundle Any 2 Services & Save 30%",
                description: "Perfect for businesses ready to supercharge their marketing across multiple channels.",
                discount: "30% OFF BUNDLES",
                code: "BUNDLE30",
                buttonText: "View Bundles",
                image: null
            }
        ];
        
        this.init();
    }

    init() {
        // Check if should be enabled
        if (!this.shouldShowPopup()) {
            return;
        }

        this.createPopup();
        this.setupEventListeners();
        console.log('Exit Intent Popup initialized');
    }

    // Check if popup should be shown
    shouldShowPopup() {
        // Check if enabled
        if (!this.settings.enabled) return false;
        
        // Check if mobile and mobile disabled
        if (!this.settings.mobileEnabled && this.isMobile()) return false;
        
        // Check cookie to prevent spam
        if (this.hasSeenPopup()) return false;
        
        return true;
    }

    // Detect mobile devices
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Check if user has seen popup recently
    hasSeenPopup() {
        const seen = localStorage.getItem('exitIntentShown');
        if (!seen) return false;
        
        const timestamp = parseInt(seen);
        const hoursAgo = (Date.now() - timestamp) / (1000 * 60 * 60);
        return hoursAgo < this.settings.cookieExpiry;
    }

    // Mark popup as seen
    markPopupSeen() {
        localStorage.setItem('exitIntentShown', Date.now().toString());
    }

    // Create popup HTML
    createPopup() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'exit-intent-overlay fixed inset-0 bg-black bg-opacity-75 z-[60] hidden flex items-center justify-center p-4';
        
        // Select random offer
        const offer = this.offers[Math.floor(Math.random() * this.offers.length)];
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'exit-intent-popup bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-95 transition-transform duration-300 relative';
        popup.innerHTML = `
            <div class="relative">
                <!-- Close button -->
                <button class="exit-close absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <!-- Header with urgency -->
                <div class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
                    <div class="flex items-center justify-center mb-2">
                        <div class="bg-white bg-opacity-20 rounded-full p-2">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 class="text-2xl font-bold text-center mb-2">${offer.title}</h2>
                    <p class="text-center text-red-100 text-sm">This offer expires in 10 minutes!</p>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                    <!-- Discount badge -->
                    <div class="text-center mb-4">
                        <div class="inline-block bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-lg transform rotate-3 shadow-lg">
                            ${offer.discount}
                        </div>
                    </div>
                    
                    <!-- Offer details -->
                    <div class="text-center mb-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">${offer.subtitle}</h3>
                        <p class="text-gray-600 leading-relaxed">${offer.description}</p>
                    </div>
                    
                    <!-- Promo code -->
                    <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 mb-6 text-center">
                        <p class="text-sm text-gray-600 mb-1">Use promo code:</p>
                        <div class="flex items-center justify-center gap-2">
                            <code class="bg-white border px-3 py-1 rounded font-mono text-lg font-bold text-red-600">${offer.code}</code>
                            <button class="copy-code text-gray-400 hover:text-gray-600 transition-colors" data-code="${offer.code}">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Action buttons -->
                    <div class="space-y-3">
                        <button class="claim-offer w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg">
                            ${offer.buttonText}
                        </button>
                        <button class="no-thanks w-full text-gray-500 text-sm hover:text-gray-700 transition-colors">
                            No thanks, I'll pay full price
                        </button>
                    </div>
                    
                    <!-- Social proof -->
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <div class="flex items-center justify-center gap-4 text-sm text-gray-600">
                            <div class="flex items-center gap-1">
                                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                                <span>1,247+ customers</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                                <span>30-day guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        this.overlay = overlay;
        this.popup = popup;
        this.currentOffer = offer;
        
        this.setupPopupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Mouse leave detection
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= this.settings.sensitivity) {
                this.triggerExitIntent();
            }
        });

        // Mobile: scroll up detection (alternative trigger)
        if (this.isMobile()) {
            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                if (window.scrollY < lastScrollY && window.scrollY < 100) {
                    this.triggerExitIntent();
                }
                lastScrollY = window.scrollY;
            });
        }
    }

    // Setup popup-specific event listeners
    setupPopupEventListeners() {
        if (!this.popup || !this.overlay) return;
        
        // Close button
        const closeBtn = this.popup.querySelector('.exit-close');
        closeBtn.addEventListener('click', () => this.hidePopup());
        
        // No thanks button
        const noThanksBtn = this.popup.querySelector('.no-thanks');
        noThanksBtn.addEventListener('click', () => this.hidePopup());
        
        // Claim offer button
        const claimBtn = this.popup.querySelector('.claim-offer');
        claimBtn.addEventListener('click', () => this.handleClaimOffer());
        
        // Copy code button
        const copyBtn = this.popup.querySelector('.copy-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPromoCode());
        }
        
        // Click overlay to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePopup();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isShown) {
                this.hidePopup();
            }
        });
    }

    // Trigger exit intent
    triggerExitIntent() {
        if (this.isShown || this.isDestroyed || !this.popup) return;
        
        // Small delay to avoid accidental triggers
        if (this.mouseLeaveTimer) return;
        
        this.mouseLeaveTimer = setTimeout(() => {
            this.showPopup();
            this.mouseLeaveTimer = null;
        }, this.settings.delay);
    }

    // Show popup
    showPopup() {
        if (this.isShown || !this.overlay) return;
        
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('flex');
        
        // Animate in
        setTimeout(() => {
            const popup = this.overlay.querySelector('.exit-intent-popup');
            if (popup) {
                popup.classList.remove('scale-95');
                popup.classList.add('scale-100');
            }
        }, 10);
        
        this.isShown = true;
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Mark as seen
        this.markPopupSeen();
        
        // Track analytics
        this.trackEvent('exit_intent_shown', {
            offer: this.currentOffer?.title || 'unknown'
        });
        
        console.log('Exit intent popup shown');
    }

    // Hide popup
    hidePopup() {
        if (!this.isShown || !this.overlay) return;
        
        const popup = this.overlay.querySelector('.exit-intent-popup');
        if (popup) {
            popup.classList.remove('scale-100');
            popup.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.overlay.classList.remove('flex');
            this.overlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
        
        this.isShown = false;
        
        // Track analytics
        this.trackEvent('exit_intent_dismissed');
        
        console.log('Exit intent popup hidden');
    }

    // Handle claim offer
    handleClaimOffer() {
        // Track conversion
        this.trackEvent('exit_intent_conversion', {
            offer: this.currentOffer?.title || 'unknown',
            code: this.currentOffer?.code || 'unknown'
        });
        
        // Different actions based on offer type
        if (this.currentOffer.code === 'FREEAUDIT') {
            // Scroll to contact form or open chat
            this.hidePopup();
            // TODO: Integrate with contact form
            alert('Free audit form would open here. Integration with contact/calendar system needed.');
        } else if (this.currentOffer.code === 'BUNDLE30') {
            // Go to services with bundle focus
            this.hidePopup();
            window.location.href = 'services.html?bundle=true';
        } else {
            // Standard discount - go to services
            this.hidePopup();
            window.location.href = 'services.html?discount=' + this.currentOffer.code;
        }
        
        console.log('Exit intent offer claimed:', this.currentOffer);
    }

    // Copy promo code
    copyPromoCode() {
        const code = this.currentOffer?.code;
        if (!code) return;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(code).then(() => {
                this.showCopyFeedback();
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyFeedback();
        }
        
        this.trackEvent('promo_code_copied', { code });
    }

    // Show copy feedback
    showCopyFeedback() {
        const copyBtn = this.popup.querySelector('.copy-code');
        if (!copyBtn) return;
        
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        `;
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    }

    // Track analytics events
    trackEvent(eventName, data = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'exit_intent',
                event_label: data.offer || 'unknown',
                ...data
            });
        }
        
        console.log(`Exit Intent Event: ${eventName}`, data);
    }

    // Enable/disable popup
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        
        if (!enabled) {
            this.destroy();
        }
    }

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    // Destroy popup
    destroy() {
        if (this.mouseLeaveTimer) {
            clearTimeout(this.mouseLeaveTimer);
        }
        
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
            this.popup = null;
        }
        
        this.isDestroyed = true;
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Initialize exit intent when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to let user engage with page first
    setTimeout(() => {
        window.exitIntentPopup = new ExitIntentPopup();
    }, 5000); // Wait 5 seconds before enabling
});