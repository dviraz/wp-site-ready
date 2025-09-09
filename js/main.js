// Main JavaScript for MarketBoost Platform

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFormHandlers();
    initializeAnimations();
    initializeServiceSelector();
    initializeConversionFeatures();
    initializeChatbot();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const header = document.querySelector('.site-header') || document.querySelector('header');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                // open
                mobileMenu.classList.remove('hidden');
                requestAnimationFrame(() => mobileMenu.classList.add('open'));
                mobileMenuButton.setAttribute('aria-expanded', 'true');
            } else {
                // close with animation
                mobileMenu.classList.remove('open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                const handler = () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.removeEventListener('transitionend', handler);
                };
                mobileMenu.addEventListener('transitionend', handler);
            }
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                const handler = () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.removeEventListener('transitionend', handler);
                };
                mobileMenu.addEventListener('transitionend', handler);
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Sticky header shadow on scroll
    if (header) {
        const onScroll = () => {
            if (window.scrollY > 8) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }
}

// Form handling
function initializeFormHandlers() {
    // Site audit form
    const auditForm = document.querySelector('#site-audit-form');
    if (auditForm) {
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const websiteInput = this.querySelector('#website-input');
            const websiteUrl = websiteInput.value.trim();
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Validate URL format
            if (!websiteUrl) {
                showNotification('Please enter a website URL', 'error');
                websiteInput.focus();
                return;
            }

            // Basic URL validation
            try {
                let url = websiteUrl;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                new URL(url);
            } catch {
                showNotification('Please enter a valid website URL', 'error');
                websiteInput.focus();
                return;
            }
            
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
                showNotification('Thank you! We\'ll audit your site and get back to you within 24 hours.', 'success');
                this.reset();
            }, 2000);
        });
    }

    // Package selection buttons
    document.querySelectorAll('button[class*="Choose"]').forEach(button => {
        button.addEventListener('click', function() {
            const packageName = this.textContent.replace('Choose ', '');
            showPackageModal(packageName);
        });
    });

    // Get Started buttons
    document.querySelectorAll('button').forEach(button => {
        const buttonText = button.textContent.trim();
        if (buttonText === 'Get Started') {
            button.addEventListener('click', function() {
                window.location.href = 'services.html';
            });
        }
    });
}

// Animations and visual effects
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.grid > div, section').forEach(el => {
        observer.observe(el);
    });
}

// Notification system
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
            <button aria-label="Close notification" onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Package modal
function showPackageModal(packageName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 transform scale-95 transition-transform duration-300">
            <h3 class="text-2xl font-bold mb-4">Get Started with ${packageName}</h3>
            <p class="text-gray-600 mb-6">Ready to boost your business? Let's customize your ${packageName.toLowerCase()} package to fit your needs.</p>
            <div class="flex gap-4">
                <button onclick="window.location.href='services.html'" class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    View Services
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    }, 100);
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Service Selector Quiz
let currentQuizStep = 1;
let quizAnswers = {};

function initializeServiceSelector() {
    const serviceSelector = document.getElementById('service-selector');
    if (!serviceSelector) return;
    
    // Initialize quiz options event listeners
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selections
            this.parentElement.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('border-[var(--primary-color)]', 'bg-[var(--secondary-color)]');
                opt.classList.add('border-gray-200');
            });
            
            // Mark this option as selected
            this.classList.remove('border-gray-200');
            this.classList.add('border-[var(--primary-color)]', 'bg-[var(--secondary-color)]');
            
            // Store the answer
            const stepId = this.closest('.quiz-step').id;
            quizAnswers[stepId] = this.dataset.value;
            
            // Show next button
            document.getElementById('next-btn').style.display = 'block';
        });
    });
}

function nextStep() {
    if (currentQuizStep < 3) {
        // Hide current step
        document.getElementById(`step-${currentQuizStep}`).style.display = 'none';
        
        currentQuizStep++;
        
        // Show next step
        document.getElementById(`step-${currentQuizStep}`).style.display = 'block';
        
        // Update progress
        updateProgress();
        
        // Show/hide navigation buttons
        document.getElementById('prev-btn').style.display = 'block';
        document.getElementById('next-btn').style.display = 'none';
        
        // Update step indicator
        document.getElementById('current-step').textContent = currentQuizStep;
    } else {
        // Show results
        showQuizResults();
    }
}

function previousStep() {
    if (currentQuizStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentQuizStep}`).style.display = 'none';
        
        currentQuizStep--;
        
        // Show previous step
        document.getElementById(`step-${currentQuizStep}`).style.display = 'block';
        
        // Update progress
        updateProgress();
        
        // Show/hide navigation buttons
        if (currentQuizStep === 1) {
            document.getElementById('prev-btn').style.display = 'none';
        }
        document.getElementById('next-btn').style.display = 'block';
        
        // Update step indicator
        document.getElementById('current-step').textContent = currentQuizStep;
    }
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progress = (currentQuizStep / 3) * 100;
    progressBar.style.width = `${progress}%`;
}

function showQuizResults() {
    // Hide current step and navigation
    document.getElementById(`step-${currentQuizStep}`).style.display = 'none';
    document.getElementById('quiz-navigation').style.display = 'none';
    
    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Generate recommendation based on answers
    const recommendation = generateRecommendation();
    document.getElementById('recommendation').innerHTML = recommendation;
    
    // Update progress to 100%
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('current-step').textContent = '✓';
    
    // Scroll to recommended packages section after a brief delay
    setTimeout(() => {
        const packagesSection = document.querySelector('#packages') || 
                               document.querySelector('[id*="package"]') || 
                               document.querySelector('.package-section') ||
                               document.querySelector('[class*="package"]');
        
        if (packagesSection) {
            packagesSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        } else {
            // Fallback: scroll to bottom of page where packages typically are
            window.scrollTo({ 
                top: document.body.scrollHeight * 0.7, 
                behavior: 'smooth' 
            });
        }
    }, 800);
}

function generateRecommendation() {
    const businessType = quizAnswers['step-1'];
    const goal = quizAnswers['step-2'];
    const budget = quizAnswers['step-3'];
    
    let packageName = 'Better';
    let packagePrice = '$999';
    let packageDescription = 'comprehensive marketing package';
    
    // Determine package based on budget
    if (budget === '500') {
        packageName = 'Good';
        packagePrice = '$499';
        packageDescription = 'essential marketing package';
    } else if (budget === '1500') {
        packageName = 'Best';
        packagePrice = '$1,499';
        packageDescription = 'premium marketing package with dedicated support';
    }
    
    // Customize message based on business type and goal
    let businessMessage = '';
    if (businessType === 'restaurant') {
        businessMessage = 'restaurants like yours';
    } else if (businessType === 'retail') {
        businessMessage = 'retail businesses';
    } else if (businessType === 'healthcare') {
        businessMessage = 'healthcare providers';
    } else {
        businessMessage = 'businesses in your industry';
    }
    
    let goalMessage = '';
    if (goal === 'leads') {
        goalMessage = 'generate more qualified leads';
    } else if (goal === 'sales') {
        goalMessage = 'increase your sales revenue';
    } else if (goal === 'awareness') {
        goalMessage = 'build brand awareness';
    } else {
        goalMessage = 'improve customer retention';
    }
    
    return `
        <div class="bg-white border-2 border-[var(--primary-color)] rounded-lg p-6 mb-6">
            <h4 class="text-xl font-bold text-[var(--primary-color)] mb-2">Recommended: ${packageName} Package</h4>
            <div class="text-3xl font-bold text-[var(--text-primary)] mb-2">${packagePrice}<span class="text-lg font-normal">/month</span></div>
            <p class="text-[var(--text-secondary)] mb-4">
                Based on your answers, our <strong>${packageName}</strong> ${packageDescription} is perfect for ${businessMessage} looking to ${goalMessage}.
            </p>
            <div class="flex flex-wrap gap-2">
                <span class="bg-[var(--secondary-color)] text-[var(--primary-color)] px-3 py-1 rounded-full text-sm font-medium">Perfect Match</span>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Best ROI</span>
            </div>
        </div>
    `;
}

// Conversion Features
// Feature flags to consolidate CTAs and reduce distractions
const FEATURES = {
    stickyBar: false,         // Audit: disable sticky "Get Free Audit" bar to reduce competing CTAs
    socialProofToasts: false, // Audit: disable rotating social-proof toasts
    exitIntent: false         // Keep exit intent off unless explicitly enabled
};

function initializeConversionFeatures() {
    initializeCountdown();
    if (FEATURES.stickyBar) initializeStickyBar();
    if (FEATURES.exitIntent) initializeExitIntent();
    if (FEATURES.socialProofToasts) initializeSocialProof();
    initializeExitPopupForm();
}

// Countdown Timer
function initializeCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    // Set countdown to 24 hours from now
    let timeLeft = 24 * 60 * 60; // 24 hours in seconds
    
    function updateCountdown() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            timeLeft = 24 * 60 * 60; // Reset to 24 hours
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Update slots remaining
    const slotsElement = document.getElementById('slots-remaining');
    if (slotsElement) {
        const slots = Math.floor(Math.random() * 5) + 3; // Random between 3-7
        slotsElement.textContent = `${slots} slots`;
    }
}

// Sticky CTA Bar
function initializeStickyBar() {
    const stickyBar = document.getElementById('sticky-cta');
    if (!stickyBar) return;
    
    let hasShown = false;
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent > 30 && !hasShown) {
            stickyBar.classList.remove('translate-y-full');
            hasShown = true;
        }
    });
}

function scrollToAuditForm() {
    const form = document.getElementById('site-audit-form');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.querySelector('input').focus();
    }
}

function hideStickyBar() {
    const stickyBar = document.getElementById('sticky-cta');
    if (stickyBar) {
        stickyBar.classList.add('translate-y-full');
    }
}

// Exit Intent Popup (Less Intrusive)
function initializeExitIntent() {
    const popup = document.getElementById('exit-intent-popup');
    if (!popup) return;
    
    let hasShown = false;
    let lastShown = sessionStorage.getItem('exitPopupLastShown');
    
    // Only show if not shown in last 10 minutes
    if (lastShown && (Date.now() - parseInt(lastShown)) < 600000) {
        return;
    }
    
    // Only show on mouse leave (removed timer-based showing)
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !hasShown && !sessionStorage.getItem('exitPopupDismissed')) {
            showExitPopup();
            hasShown = true;
        }
    });
}

function showExitPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.classList.remove('hidden');
        sessionStorage.setItem('exitPopupLastShown', Date.now().toString());
    }
}

function closeExitPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.classList.add('hidden');
        sessionStorage.setItem('exitPopupDismissed', 'true');
    }
}

function initializeExitPopupForm() {
    const form = document.getElementById('exit-popup-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const website = this.querySelector('input[type="text"]').value;
            
            // Simulate form submission
            showNotification('Thanks! We\'ll send your free audit within 24 hours.', 'success');
            closeExitPopup();
        });
    }
}

// Social Proof Notifications
function initializeSocialProof() {
    const notification = document.getElementById('social-proof-notification');
    if (!notification) return;
    
    const notifications = [
        { name: 'Sarah from Miami', action: 'just signed up for the Better package' },
        { name: 'Mike from Austin', action: 'just requested a free audit' },
        { name: 'Lisa from Seattle', action: 'just upgraded to the Best package' },
        { name: 'John from Denver', action: 'just started their campaign' },
        { name: 'Emma from Portland', action: 'just booked a consultation' }
    ];
    
    const images = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b5e8d47e?w=50&h=50&fit=crop&crop=face'
    ];
    
    function showSocialProofNotification() {
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        const randomImage = images[Math.floor(Math.random() * images.length)];
        
        document.getElementById('notification-name').textContent = randomNotification.name;
        document.getElementById('notification-action').textContent = randomNotification.action;
        notification.querySelector('img').src = randomImage;
        
        notification.classList.remove('translate-x-[-400px]');
        notification.classList.add('translate-x-0');
        
        setTimeout(() => {
            notification.classList.remove('translate-x-0');
            notification.classList.add('translate-x-[-400px]');
        }, 4000);
    }
    
    // Show first notification after 10 seconds
    setTimeout(showSocialProofNotification, 10000);
    
    // Then show every 30 seconds
    setInterval(showSocialProofNotification, 30000);
}

// Video Modal Functions
function openVideoModal() {
    const modal = document.getElementById('video-testimonial-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeVideoModal() {
    const modal = document.getElementById('video-testimonial-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Simple Chatbot
function initializeChatbot() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatToggle || !chatWindow) return;
    
    let isOpen = false;
    
    // Toggle chat
    chatToggle.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.remove('scale-0');
            chatWindow.classList.add('scale-100');
            chatInput.focus();
        } else {
            chatWindow.classList.remove('scale-100');
            chatWindow.classList.add('scale-0');
        }
    });
    
    // Close chat
    chatClose.addEventListener('click', () => {
        isOpen = false;
        chatWindow.classList.remove('scale-100');
        chatWindow.classList.add('scale-0');
    });
    
    // Send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Add bot response after delay
        setTimeout(() => {
            const response = generateBotResponse(message);
            addMessage(response, 'bot');
        }, 1000);
    }
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-2 mb-4 ${sender === 'user' ? 'justify-end' : ''}`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-[var(--primary-color)] text-white rounded-lg p-3 max-w-xs">
                    <p class="text-sm">${text}</p>
                </div>
                <div class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                    👤
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white text-xs">
                    🤖
                </div>
                <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p class="text-sm">${text}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) {
            return "Great! For restaurants, I'd recommend our Better package ($999/month) which includes social media management, local SEO, and review management. Would you like me to show you the details?";
        } else if (lowerMessage.includes('retail') || lowerMessage.includes('store') || lowerMessage.includes('shop')) {
            return "Perfect! Retail businesses do great with our Better package ($999/month) - it includes e-commerce optimization, social media ads, and email marketing. Interested in learning more?";
        } else if (lowerMessage.includes('healthcare') || lowerMessage.includes('medical') || lowerMessage.includes('doctor')) {
            return "Excellent! For healthcare providers, our Best package ($1,499/month) works best with compliance-friendly marketing, patient acquisition, and reputation management. Shall I get you started?";
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
            return "Our packages start at $499/month for essential marketing. Most businesses see 3x ROI within 90 days. What's your monthly marketing budget range?";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
            return "I'd love to help! Let me ask you 3 quick questions to find your perfect package. First: What industry is your business in?";
        } else {
            return "Thanks for that! To give you the best recommendation, could you tell me what industry your business is in? (Restaurant, Retail, Healthcare, etc.)";
        }
    }
}

function sendQuickMessage(industry) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = industry;
        document.getElementById('chat-send').click();
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    /* Removed global default hiding to prevent sections from disappearing */
    
    .loading {
        pointer-events: none;
        opacity: 0.7;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top: 2px solid #ea2a33;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .quiz-step {
        min-height: 300px;
    }
    
    .quiz-option {
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
    }
    
    .quiz-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .quiz-option.selected {
        border-color: var(--primary-color) !important;
        background-color: var(--secondary-color) !important;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .animate-pulse {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);
