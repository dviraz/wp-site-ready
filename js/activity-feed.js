// Live Activity Feed for MarketBoost Platform
class LiveActivityFeed {
    constructor() {
        this.activities = [];
        this.container = null;
        this.isVisible = false;
        this.showInterval = null;
        this.hideTimeout = null;
        this.settings = {
            showInterval: 8000, // Show every 8 seconds
            hideDelay: 4000,    // Hide after 4 seconds
            maxActivities: 5,   // Keep last 5 activities
            enabled: false      // Disabled to improve user focus and trust
        };
        
        this.init();
    }

    init() {
        if (!this.settings.enabled) {
            console.log('Activity feed disabled');
            return;
        }
        
        this.createContainer();
        this.generateInitialData();
        this.startActivityLoop();
        this.setupCartEventListeners();
    }

    // Create activity notification container
    createContainer() {
        const container = document.createElement('div');
        container.className = 'activity-feed fixed bottom-4 left-4 z-50 transform translate-y-full transition-transform duration-500 ease-in-out';
        container.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
                <div class="flex items-start gap-3">
                    <div class="activity-avatar flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-bold activity-initials">JD</span>
                    </div>
                    <div class="flex-1">
                        <div class="activity-message text-sm text-gray-800 font-medium">
                            John from New York just purchased SEO Optimization
                        </div>
                        <div class="activity-time text-xs text-gray-500 mt-1">
                            2 minutes ago
                        </div>
                    </div>
                    <button class="activity-close text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.container = container;
        
        // Add click handlers
        const closeBtn = container.querySelector('.activity-close');
        if (closeBtn) {
            closeBtn.setAttribute('aria-label', 'Close notification');
            closeBtn.addEventListener('click', () => this.hideActivity());
        }
        
        // Hide on click outside
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                this.hideActivity();
            }
        });
    }

    // Generate realistic activity data
    generateInitialData() {
        const names = [
            'John', 'Sarah', 'Mike', 'Jessica', 'David', 'Emily', 'Chris', 'Amanda',
            'Robert', 'Lisa', 'Kevin', 'Maria', 'James', 'Ashley', 'Brian', 'Nicole',
            'Daniel', 'Rachel', 'Michael', 'Lauren', 'Ryan', 'Stephanie', 'Jason', 'Michelle'
        ];
        
        const locations = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
            'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
            'San Francisco', 'Columbus', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver',
            'Boston', 'Nashville', 'Baltimore', 'Portland', 'Las Vegas', 'Detroit'
        ];
        
        const services = [
            'SEO Optimization', 'Social Media Management', 'Content Creation', 
            'Email Marketing Campaign', 'PPC Management', 'Website Audit',
            'Brand Strategy', 'Market Research', 'Lead Generation Campaign'
        ];
        
        const timeOptions = [
            '2 minutes ago', '5 minutes ago', '12 minutes ago', '23 minutes ago',
            '45 minutes ago', '1 hour ago', '2 hours ago', '3 hours ago'
        ];

        // Generate 20 realistic activities
        for (let i = 0; i < 20; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const service = services[Math.floor(Math.random() * services.length)];
            const time = timeOptions[Math.floor(Math.random() * timeOptions.length)];
            
            this.activities.push({
                id: Date.now() + i,
                name,
                location,
                service,
                time,
                initials: this.getInitials(name),
                color: this.getRandomColor(),
                timestamp: Date.now() - Math.random() * 10800000 // Random time in last 3 hours
            });
        }

        // Sort by timestamp (newest first)
        this.activities.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Get random gradient color
    getRandomColor() {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-green-500 to-blue-600',
            'from-purple-500 to-pink-600',
            'from-red-500 to-orange-600',
            'from-teal-500 to-cyan-600',
            'from-indigo-500 to-purple-600',
            'from-pink-500 to-red-600',
            'from-yellow-500 to-orange-600'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Start the activity display loop
    startActivityLoop() {
        if (!this.settings.enabled) return;
        
        this.showInterval = setInterval(() => {
            if (!this.isVisible && this.activities.length > 0) {
                this.showRandomActivity();
            }
        }, this.settings.showInterval);
    }

    // Show random activity
    showRandomActivity() {
        if (this.activities.length === 0) return;
        
        const activity = this.activities[Math.floor(Math.random() * Math.min(10, this.activities.length))];
        this.displayActivity(activity);
    }

    // Display an activity
    displayActivity(activity) {
        if (!this.container) return;
        
        const avatarEl = this.container.querySelector('.activity-avatar');
        const initialsEl = this.container.querySelector('.activity-initials');
        const messageEl = this.container.querySelector('.activity-message');
        const timeEl = this.container.querySelector('.activity-time');
        
        // Update content
        avatarEl.className = `activity-avatar flex-shrink-0 w-10 h-10 bg-gradient-to-r ${activity.color} rounded-full flex items-center justify-center`;
        initialsEl.textContent = activity.initials;
        messageEl.textContent = `${activity.name} from ${activity.location} just purchased ${activity.service}`;
        timeEl.textContent = activity.time;
        
        // Show notification
        this.showActivity();
        
        // Auto hide after delay
        this.hideTimeout = setTimeout(() => {
            this.hideActivity();
        }, this.settings.hideDelay);
    }

    // Show activity notification
    showActivity() {
        if (!this.container || this.isVisible) return;
        
        this.container.classList.remove('translate-y-full');
        this.isVisible = true;
    }

    // Hide activity notification
    hideActivity() {
        if (!this.container || !this.isVisible) return;
        
        this.container.classList.add('translate-y-full');
        this.isVisible = false;
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    // Setup cart event listeners to add real activities
    setupCartEventListeners() {
        if (window.marketBoostCart) {
            window.marketBoostCart.on('itemAdded', (data) => {
                this.addRealActivity(data.product);
            });
        } else {
            // Retry in 1 second if cart not ready
            setTimeout(() => this.setupCartEventListeners(), 1000);
        }
    }

    // Add real activity from cart events
    addRealActivity(product) {
        // Generate a realistic name and location for the "other customer"
        const names = ['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Jamie', 'Sam'];
        const locations = ['Miami', 'Seattle', 'Austin', 'Portland', 'Atlanta', 'Nashville', 'Orlando', 'Tampa'];
        
        const name = names[Math.floor(Math.random() * names.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        const activity = {
            id: Date.now(),
            name,
            location,
            service: product.name,
            time: 'just now',
            initials: this.getInitials(name),
            color: this.getRandomColor(),
            timestamp: Date.now(),
            isReal: true // Mark as real activity
        };

        // Add to front of activities array
        this.activities.unshift(activity);
        
        // Keep only last maxActivities
        if (this.activities.length > this.settings.maxActivities * 4) {
            this.activities = this.activities.slice(0, this.settings.maxActivities * 2);
        }
        
        // Show immediately if not currently showing
        if (!this.isVisible) {
            // Wait a bit to make it feel natural
            setTimeout(() => {
                if (!this.isVisible) {
                    this.displayActivity(activity);
                }
            }, 2000 + Math.random() * 3000); // 2-5 seconds delay
        }
    }

    // Enable/disable the feed
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        
        if (enabled && !this.showInterval) {
            this.startActivityLoop();
        } else if (!enabled && this.showInterval) {
            clearInterval(this.showInterval);
            this.showInterval = null;
            this.hideActivity();
        }
    }

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Restart loop with new interval if running
        if (this.showInterval) {
            clearInterval(this.showInterval);
            this.showInterval = null;
            this.startActivityLoop();
        }
    }

    // Get statistics
    getStats() {
        return {
            totalActivities: this.activities.length,
            realActivities: this.activities.filter(a => a.isReal).length,
            isEnabled: this.settings.enabled,
            isVisible: this.isVisible
        };
    }

    // Destroy the feed
    destroy() {
        if (this.showInterval) {
            clearInterval(this.showInterval);
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if (this.container) {
            document.body.removeChild(this.container);
        }
    }
}

// Initialize activity feed when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        window.liveActivityFeed = new LiveActivityFeed();
        console.log('Live Activity Feed initialized');
    }, 1000);
});
