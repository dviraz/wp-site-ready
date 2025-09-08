// Services page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeServiceComparison();
    initializePagination();
    initializeSearch();
});

// Filter functionality
function initializeFilters() {
    const filterInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"], select');
    const priceRangeSlider = document.querySelector('.price-range-slider');
    const categoryButtons = document.querySelectorAll('button[class*="rounded-full"]');

    filterInputs.forEach(input => {
        input.addEventListener('change', filterServices);
    });

    if (priceRangeSlider) {
        priceRangeSlider.addEventListener('input', function() {
            updatePriceDisplay(this.value);
            filterServices();
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectCategory(this);
            filterServices();
        });
    });
}

function filterServices() {
    const services = document.querySelectorAll('.grid > div');
    const activeFilters = getActiveFilters();

    services.forEach(service => {
        const shouldShow = matchesFilters(service, activeFilters);
        service.style.display = shouldShow ? 'block' : 'none';
        
        if (shouldShow) {
            service.classList.add('fade-in');
        }
    });

    updateResultsCount();
}

function getActiveFilters() {
    const filters = {
        industry: document.getElementById('vertical')?.value,
        serviceTypes: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()),
        priceMax: document.querySelector('.price-range-slider')?.value || 2000,
        deliveryTime: document.querySelector('input[name="delivery_time"]:checked')?.nextElementSibling?.textContent.trim(),
        category: document.querySelector('button[class*="bg-red"]')?.textContent.trim()
    };
    return filters;
}

function matchesFilters(serviceElement, filters) {
    // Extract service data from DOM
    const serviceTitle = serviceElement.querySelector('h3')?.textContent || '';
    const servicePrice = parseInt(serviceElement.querySelector('.text-xl')?.textContent.replace(/[^0-9]/g, '') || '0');
    const serviceDescription = serviceElement.querySelector('p')?.textContent || '';

    // Industry filter
    if (filters.industry && filters.industry !== 'All Industries') {
        // This would typically be based on service metadata
    }

    // Service type filter
    if (filters.serviceTypes.length > 0) {
        const hasMatchingType = filters.serviceTypes.some(type => {
            return serviceTitle.toLowerCase().includes(type.toLowerCase()) ||
                   serviceDescription.toLowerCase().includes(type.toLowerCase());
        });
        if (!hasMatchingType) return false;
    }

    // Price filter
    if (servicePrice > parseInt(filters.priceMax)) {
        return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
        if (!serviceTitle.toLowerCase().includes(filters.category.toLowerCase()) &&
            !serviceDescription.toLowerCase().includes(filters.category.toLowerCase())) {
            return false;
        }
    }

    return true;
}

function selectCategory(button) {
    // Remove active state from all category buttons
    document.querySelectorAll('button[class*="rounded-full"]').forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });

    // Add active state to clicked button
    button.classList.remove('bg-gray-100', 'text-gray-600');
    button.classList.add('bg-red-600', 'text-white');
}

function updatePriceDisplay(value) {
    const priceDisplays = document.querySelectorAll('.flex.justify-between span');
    if (priceDisplays.length >= 2) {
        priceDisplays[1].textContent = `$${parseInt(value).toLocaleString()}+`;
    }
}

function updateResultsCount() {
    const visibleServices = document.querySelectorAll('.grid > div[style*="block"], .grid > div:not([style*="none"])').length;
    const breadcrumb = document.querySelector('p[class*="text-base"]');
    if (breadcrumb) {
        breadcrumb.textContent = `${visibleServices} marketing services found`;
    }
}

// Service comparison functionality
function initializeServiceComparison() {
    let selectedServices = [];
    const maxSelections = 3;

    document.querySelectorAll('button[class*="Add to Cart"], button[class*="View Details"]').forEach(button => {
        if (button.textContent.includes('View Details')) {
            return; // Skip "View Details" buttons
        }

        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceCard = this.closest('.bg-white');
            const serviceName = serviceCard.querySelector('h3').textContent;
            const servicePrice = serviceCard.querySelector('.text-xl').textContent;

            if (selectedServices.length >= maxSelections) {
                showNotification(`You can only compare up to ${maxSelections} services at once.`, 'warning');
                return;
            }

            if (!selectedServices.find(s => s.name === serviceName)) {
                selectedServices.push({
                    name: serviceName,
                    price: servicePrice,
                    element: serviceCard
                });

                // Update button state
                this.textContent = 'Added ✓';
                this.classList.add('bg-green-500', 'text-white');
                this.classList.remove('bg-gray-100');

                updateComparisonCart();
            }
        });
    });

    // Clear selection functionality
    document.querySelector('button[class*="Clear selection"]')?.addEventListener('click', function() {
        clearAllSelections();
    });
}

function updateComparisonCart() {
    const stickyCart = document.getElementById('stickyCart');
    const selectedCount = document.querySelector('p[class*="font-semibold"]');
    const compareButton = document.querySelector('button[class*="Compare"]');

    if (selectedServices.length > 0) {
        stickyCart.classList.remove('hidden');
        selectedCount.textContent = `${selectedServices.length} services selected`;
        compareButton.textContent = `Compare (${selectedServices.length})`;
    } else {
        stickyCart.classList.add('hidden');
    }
}

function clearAllSelections() {
    selectedServices.forEach(service => {
        const addButton = service.element.querySelector('button[class*="Added"]');
        if (addButton) {
            addButton.textContent = 'Add to Cart';
            addButton.classList.remove('bg-green-500', 'text-white');
            addButton.classList.add('bg-gray-100');
        }
    });

    selectedServices = [];
    updateComparisonCart();
    showNotification('All selections cleared', 'info');
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    if (!query.trim()) {
        // Show all services if search is empty
        document.querySelectorAll('.grid > div').forEach(service => {
            service.style.display = 'block';
        });
        updateResultsCount();
        return;
    }

    const services = document.querySelectorAll('.grid > div');
    let visibleCount = 0;

    services.forEach(service => {
        const title = service.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = service.querySelector('p')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(query.toLowerCase()) || 
                       description.includes(query.toLowerCase());

        if (matches) {
            service.style.display = 'block';
            visibleCount++;
            
            // Highlight matching text
            highlightText(service, query);
        } else {
            service.style.display = 'none';
        }
    });

    updateResultsCount();
    
    if (visibleCount === 0) {
        showNoResultsMessage(query);
    }
}

function highlightText(element, query) {
    const title = element.querySelector('h3');
    const description = element.querySelector('p');
    
    [title, description].forEach(el => {
        if (el && el.textContent.toLowerCase().includes(query.toLowerCase())) {
            const regex = new RegExp(`(${query})`, 'gi');
            el.innerHTML = el.textContent.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
        }
    });
}

function showNoResultsMessage(query) {
    const existingMessage = document.getElementById('noResults');
    if (existingMessage) {
        existingMessage.remove();
    }

    const noResultsDiv = document.createElement('div');
    noResultsDiv.id = 'noResults';
    noResultsDiv.className = 'col-span-full text-center py-12';
    noResultsDiv.innerHTML = `
        <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p class="text-gray-500">No services match your search for "${query}". Try different keywords or clear your filters.</p>
            <button onclick="clearSearch()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Clear Search
            </button>
        </div>
    `;

    document.querySelector('.grid').appendChild(noResultsDiv);
}

function clearSearch() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
    }
    
    const noResultsMessage = document.getElementById('noResults');
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Pagination functionality
function initializePagination() {
    const paginationButtons = document.querySelectorAll('nav button');
    const servicesPerPage = 6;
    
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            const currentPage = parseInt(document.querySelector('button[class*="bg-red"]')?.textContent) || 1;
            let newPage = currentPage;
            
            if (this.textContent === 'Previous') {
                newPage = Math.max(1, currentPage - 1);
            } else if (this.textContent === 'Next') {
                newPage = currentPage + 1;
            } else if (!isNaN(parseInt(this.textContent))) {
                newPage = parseInt(this.textContent);
            }
            
            goToPage(newPage);
        });
    });
}

function goToPage(pageNumber) {
    const services = Array.from(document.querySelectorAll('.grid > div'));
    const servicesPerPage = 6;
    const start = (pageNumber - 1) * servicesPerPage;
    const end = start + servicesPerPage;

    services.forEach((service, index) => {
        service.style.display = (index >= start && index < end) ? 'block' : 'none';
    });

    // Update pagination buttons
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white');
        btn.classList.add('text-gray-700');
        
        if (btn.textContent === pageNumber.toString()) {
            btn.classList.add('bg-red-600', 'text-white');
            btn.classList.remove('text-gray-700');
        }
    });

    // Scroll to top of services
    document.querySelector('.grid').scrollIntoView({ behavior: 'smooth' });
}

// Utility function for notifications (shared with main.js)
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