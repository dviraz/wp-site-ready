// ROI Calculator JavaScript

document.addEventListener('DOMContentLoaded', async function() {\n    await loadWooConfig();
    initializeCalculator();
    initializeIndustryPresets();
    populateDefaultData();
});

// Industry benchmark data
const industryData = {
    ecommerce: {
        name: 'E-commerce',
        conversionRate: 2.8,
        averageOrderValue: 85,
        leadToCustomerRate: 100, // Direct sales
        monthlyVisitors: 15000
    },
    saas: {
        name: 'SaaS',
        conversionRate: 3.5,
        averageOrderValue: 120,
        leadToCustomerRate: 25,
        monthlyVisitors: 8000
    },
    local: {
        name: 'Local Business',
        conversionRate: 4.2,
        averageOrderValue: 150,
        leadToCustomerRate: 35,
        monthlyVisitors: 3000
    },
    healthcare: {
        name: 'Healthcare',
        conversionRate: 3.8,
        averageOrderValue: 200,
        leadToCustomerRate: 30,
        monthlyVisitors: 5000
    },
    realestate: {
        name: 'Real Estate',
        conversionRate: 2.1,
        averageOrderValue: 8000,
        leadToCustomerRate: 8,
        monthlyVisitors: 4000
    },
    professional: {
        name: 'Professional Services',
        conversionRate: 3.2,
        averageOrderValue: 2500,
        leadToCustomerRate: 20,
        monthlyVisitors: 2500
    }
};

// Service performance data
const serviceData = {
    seo: {
        name: 'SEO Optimization',
        cost: 1299,
        trafficIncrease: { conservative: 15, moderate: 25, aggressive: 40 },
        conversionImprovement: { conservative: 0, moderate: 0.2, aggressive: 0.5 },
        timeToResults: 3,
        paybackMonths: { conservative: 4, moderate: 3, aggressive: 2 }
    },
    ppc: {
        name: 'PPC Management',
        cost: 1199,
        trafficIncrease: { conservative: 20, moderate: 35, aggressive: 50 },
        conversionImprovement: { conservative: 0.5, moderate: 0.8, aggressive: 1.2 },
        timeToResults: 1,
        paybackMonths: { conservative: 2, moderate: 1.5, aggressive: 1 }
    },
    social: {
        name: 'Social Media Marketing',
        cost: 999,
        trafficIncrease: { conservative: 10, moderate: 20, aggressive: 35 },
        conversionImprovement: { conservative: 0.2, moderate: 0.5, aggressive: 0.8 },
        timeToResults: 2,
        paybackMonths: { conservative: 3, moderate: 2.5, aggressive: 2 }
    },
    content: {
        name: 'Content Marketing',
        cost: 699,
        trafficIncrease: { conservative: 15, moderate: 25, aggressive: 40 },
        conversionImprovement: { conservative: 0.3, moderate: 0.6, aggressive: 1.0 },
        timeToResults: 4,
        paybackMonths: { conservative: 6, moderate: 4, aggressive: 3 }
    },
    email: {
        name: 'Email Marketing',
        cost: 799,
        trafficIncrease: { conservative: 5, moderate: 15, aggressive: 25 },
        conversionImprovement: { conservative: 0.8, moderate: 1.2, aggressive: 1.8 },
        timeToResults: 2,
        paybackMonths: { conservative: 3, moderate: 2, aggressive: 1.5 }
    }
};

function initializeCalculator() {
    const calculateButton = document.querySelector('button[onclick="calculateROI()"]');
    if (calculateButton) {
        calculateButton.onclick = calculateROI;
    }

    // Add input event listeners for real-time updates
    const inputs = document.querySelectorAll('#roiForm input, #roiForm select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(validateAndPreviewCalculation, 500));
    });
}

function initializeIndustryPresets() {
    const industrySelect = document.getElementById('industry-preset');
    if (industrySelect) {
        industrySelect.addEventListener('change', function() {
            const selectedIndustry = industryData[this.value];
            if (selectedIndustry) {
                populateIndustryData(selectedIndustry);
            }
        });
    }
}

function populateDefaultData() {
    // Set some default values for demonstration
    const defaults = {
        'monthly-visitors': '8000',
        'conversion-rate': '2.5',
        'average-order-value': '150',
        'lead-to-customer': '25',
        'monthly-budget': '2000'
    };

    Object.entries(defaults).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input && !input.value) {
            input.value = value;
        }
    });
}

function populateIndustryData(industry) {
    document.getElementById('monthly-visitors').value = industry.monthlyVisitors;
    document.getElementById('conversion-rate').value = industry.conversionRate;
    document.getElementById('average-order-value').value = industry.averageOrderValue;
    document.getElementById('lead-to-customer').value = industry.leadToCustomerRate;
    
    // Trigger calculation preview
    validateAndPreviewCalculation();
}

function validateAndPreviewCalculation() {
    const formData = getFormData();
    if (isValidFormData(formData)) {
        updateCurrentMetrics(formData);
    }
}

function getFormData() {
    return {
        industry: document.getElementById('industry-preset').value,
        monthlyVisitors: parseInt(document.getElementById('monthly-visitors').value) || 0,
        conversionRate: parseFloat(document.getElementById('conversion-rate').value) || 0,
        averageOrderValue: parseFloat(document.getElementById('average-order-value').value) || 0,
        leadToCustomerRate: parseFloat(document.getElementById('lead-to-customer').value) || 0,
        monthlyBudget: parseFloat(document.getElementById('monthly-budget').value) || 0
    };
}

function isValidFormData(data) {
    return data.monthlyVisitors > 0 && 
           data.conversionRate > 0 && 
           data.averageOrderValue > 0 && 
           data.leadToCustomerRate > 0;
}

function updateCurrentMetrics(data) {
    const monthlyConversions = (data.monthlyVisitors * data.conversionRate / 100);
    const monthlyCustomers = (monthlyConversions * data.leadToCustomerRate / 100);
    const monthlyRevenue = monthlyCustomers * data.averageOrderValue;

    document.getElementById('currentVisitors').textContent = formatNumber(data.monthlyVisitors);
    document.getElementById('currentConversions').textContent = formatNumber(Math.round(monthlyConversions));
    document.getElementById('currentRevenue').textContent = formatCurrency(monthlyRevenue);
}

function calculateROI() {
    const formData = getFormData();
    
    if (!isValidFormData(formData)) {
        showNotification('Please fill in all required fields with valid numbers.', 'error');
        return;
    }

    // Show loading state
    const button = document.querySelector('button[onclick="calculateROI()"]');
    const originalText = button.textContent;
    button.textContent = 'Calculating...';
    button.disabled = true;

    setTimeout(() => {
        try {
            updateROIResults(formData);
            showSummaryMetrics(formData);
            showFloatingCart(formData);
            
            // Scroll to results
            document.querySelector('.overflow-x-auto').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            showNotification('ROI calculation completed successfully!', 'success');
        } catch (error) {
            console.error('Calculation error:', error);
            showNotification('An error occurred during calculation. Please try again.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }, 1000);
}

function updateROIResults(formData) {
    const tableBody = document.getElementById('roiResults');
    if (!tableBody) return;

    const baseMonthlyConversions = formData.monthlyVisitors * formData.conversionRate / 100;
    const baseMonthlyCustomers = baseMonthlyConversions * formData.leadToCustomerRate / 100;
    const baseMonthlyRevenue = baseMonthlyCustomers * formData.averageOrderValue;

    let tableHTML = '';

    Object.entries(serviceData).forEach(([key, service]) => {
        const results = calculateServiceROI(formData, service, baseMonthlyRevenue);
        
        tableHTML += `
            <tr>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">${service.name}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div>${service.trafficIncrease.conservative}% / ${service.trafficIncrease.moderate}% / ${service.trafficIncrease.aggressive}%</div>
                    <div class="text-[10px] text-gray-400">mod scaled: ${Math.round(results.trafficUplift)}%</div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    ${results.paybackMonths === '—' ? '—' : results.paybackMonths + ' months'}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-semibold ${results.roi > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${results.roi > 0 ? '+' : ''}${formatCurrency(results.annualReturn)} 
                    <br><span class="text-xs">(${results.roi}% ROI)</span>
                    <br><span class="text-xs text-gray-500">+${formatCurrency(results.monthlyIncrease)}/mo; Cost: ${formatCurrency(results.monthlyCost)}/mo</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    ${results.roi > 0 ? 
                        `<a href="${getAddToCartHref(key)}" class="rounded-md border border-red-600 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50">
                            Add to Cart
                        </a>` :
                        `<button onclick="scheduleConsultation('${key}')" class="rounded-md border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                            Get Consultation
                        </button>`
                    }
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
}

function calculateServiceROI(formData, service, baseRevenue) {
    const monthlyBudget = Math.max(0, parseFloat(formData.monthlyBudget) || 0);
    const serviceCost = Math.max(0, parseFloat(service.cost) || 0);

    // Per-service scenario: dedicate up to your budget to this single service
    const monthlyCost = serviceCost > 0 ? Math.min(monthlyBudget, serviceCost) : monthlyBudget;
    const ratioRaw = serviceCost > 0 ? (monthlyBudget / serviceCost) : 1;

    // Scale improvements with diminishing returns
    const trafficFactor = Math.max(0.5, Math.min(ratioRaw, 2));
    const convFactor = Math.max(0.5, Math.min(Math.sqrt(Math.max(ratioRaw, 0.01)), 1.5));

    const trafficUplift = service.trafficIncrease.moderate * trafficFactor;
    const conversionImprovement = service.conversionImprovement.moderate * convFactor;

    const newVisitors = formData.monthlyVisitors * (1 + trafficUplift / 100);
    const newConversionRate = formData.conversionRate + conversionImprovement;
    const newConversions = newVisitors * newConversionRate / 100;
    const newCustomers = newConversions * formData.leadToCustomerRate / 100;
    const newRevenue = newCustomers * formData.averageOrderValue;

    const monthlyIncrease = Math.max(0, newRevenue - baseRevenue);
    const annualIncrease = monthlyIncrease * 12;
    const annualCost = monthlyCost * 12;
    const annualReturn = annualIncrease - annualCost;
    const roi = annualCost > 0 ? ((annualReturn / annualCost) * 100).toFixed(1) : '0.0';
    const paybackMonths = monthlyIncrease > 0 && monthlyCost > 0 ? Math.ceil(monthlyCost / monthlyIncrease) : '—';

    return {
        monthlyIncrease,
        monthlyCost,
        annualIncrease,
        annualReturn,
        annualCost,
        trafficUplift,
        roi: parseFloat(roi),
        paybackMonths
    };
}

// Map ROI services to WooCommerce products and add to cart
const SERVICE_NAME_MAP = {
    seo: 'SEO Optimization',
    ppc: 'PPC Management',
    social: 'Social Media Management',
    content: 'Content Creation',
    email: 'Email Marketing Campaign'
};

let roiProductsCache = null;

async function loadAllProductsSafe() {
    if (roiProductsCache) return roiProductsCache;
    try {
        // Try API with a short timeout via AbortController
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const products = await wooAPI.fetchProducts({ signal: controller.signal });
        clearTimeout(timer);
        roiProductsCache = Array.isArray(products) ? products : [];
        return roiProductsCache;
    } catch (e) {
        roiProductsCache = [];
        return roiProductsCache;
    }
}

async function findProductForService(serviceKey) {
    const products = await loadAllProductsSafe();
    const name = SERVICE_NAME_MAP[serviceKey] || serviceData[serviceKey]?.name;
    if (products && products.length && name) {
        const match = products.find(p => (p.name || '').toLowerCase().includes(name.toLowerCase()));
        if (match) return match;
    }
    // Fallback synthetic product (numeric id for cart stability)
    const fallbackIdBase = 900000;
    const index = Object.keys(SERVICE_NAME_MAP).indexOf(serviceKey);
    const id = fallbackIdBase + Math.max(0, index);
    const svc = serviceData[serviceKey];
    return {
        id,
        name: svc?.name || name || `Service ${serviceKey}`,
        price: svc?.cost || 0,
        images: [],
        slug: serviceKey,
        sku: '',
        categories: [{ name: (svc?.name.split(' ')[0]) || 'Service', id: id + 1 }]
    };
}

window.addServiceToCart = async function(serviceKey) {
    try {
        if (!window.marketBoostCart) {
            showNotification('Cart is not initialized on this page.', 'error');
            return;
        }
        const product = await findProductForService(serviceKey);
        window.marketBoostCart.addItem(product, 1);
        showNotification(`${product.name} added to cart.`, 'success');
    } catch (err) {
        console.error('Failed to add service to cart:', err);
        showNotification('Could not add to cart. Please try again.', 'error');
    }
};

function showSummaryMetrics(formData) {
    const summarySection = document.getElementById('summaryMetrics');
    if (summarySection) {
        summarySection.style.display = 'grid';
        
        // Calculate projected metrics using budget‑scaled improvements (with diminishing returns)
        const BASE_BUDGET = 2000; // baseline where avg improvements apply
        const avgTrafficIncrease = 25; // % baseline uplift across services
        const avgConversionImprovement = 0.6; // absolute pp uplift

        // Scale improvements with budget; cap to avoid unrealistic values
        const rawFactor = formData.monthlyBudget > 0 ? (formData.monthlyBudget / BASE_BUDGET) : 0;
        const budgetFactor = Math.max(0.5, Math.min(rawFactor, 2)); // 0.5x..2x
        const trafficUplift = Math.min(60, avgTrafficIncrease * budgetFactor);
        const convUplift = +(avgConversionImprovement * Math.sqrt(budgetFactor)).toFixed(2);

        const currentMonthlyRevenue = formData.monthlyVisitors * formData.conversionRate / 100 * formData.leadToCustomerRate / 100 * formData.averageOrderValue;
        const projectedVisitors = Math.round(formData.monthlyVisitors * (1 + trafficUplift / 100));
        const projectedConversions = Math.round(projectedVisitors * (formData.conversionRate + convUplift) / 100);
        const projectedRevenue = Math.round(projectedConversions * formData.leadToCustomerRate / 100 * formData.averageOrderValue);
        
        const totalInvestment = formData.monthlyBudget * 12;
        const annualIncrease = Math.max(0, (projectedRevenue - currentMonthlyRevenue)) * 12;
        const roiPercentage = totalInvestment > 0 
          ? (((annualIncrease - totalInvestment) / totalInvestment) * 100).toFixed(1)
          : '0.0';
        
        document.getElementById('projectedVisitors').textContent = formatNumber(projectedVisitors);
        document.getElementById('projectedConversions').textContent = formatNumber(projectedConversions);
        document.getElementById('projectedRevenue').textContent = formatCurrency(projectedRevenue);
        document.getElementById('totalInvestment').textContent = formatCurrency(totalInvestment);
        document.getElementById('annualReturn').textContent = formatCurrency(annualIncrease);
        document.getElementById('roiPercentage').textContent = `${roiPercentage}%`;
    }
}

let recommendedServices = [];

function addToRecommendations(serviceKey) {
    const service = serviceData[serviceKey];
    if (!recommendedServices.find(s => s.key === serviceKey)) {
        recommendedServices.push({
            key: serviceKey,
            name: service.name,
            cost: service.cost
        });
        
        showNotification(`${service.name} added to recommendations!`, 'success');
        updateRecommendationsCart();
    } else {
        showNotification('This service is already in your recommendations.', 'info');
    }
}

function updateRecommendationsCart() {
    if (recommendedServices.length > 0) {
        showFloatingCart();
    }
}

function showFloatingCart() {
    const cart = document.getElementById('floatingCart');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (recommendedServices.length === 0) {
        cart.style.display = 'none';
        return;
    }
    
    cart.style.display = 'block';
    
    let total = 0;
    let itemsHTML = '';
    
    recommendedServices.forEach(service => {
        total += service.cost;
        itemsHTML += `
            <div class="flex items-center justify-between py-2">
                <div>
                    <p class="font-medium text-gray-900">${service.name}</p>
                    <p class="text-sm text-gray-500">${formatCurrency(service.cost)}/mo</p>
                </div>
                <button onclick="removeFromRecommendations('${service.key}')" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Remove
                </button>
            </div>
        `;
    });
    
    cartItems.innerHTML = itemsHTML;
    cartTotal.textContent = formatCurrency(total);
}

function removeFromRecommendations(serviceKey) {
    recommendedServices = recommendedServices.filter(s => s.key !== serviceKey);
    updateRecommendationsCart();
    showNotification('Service removed from recommendations.', 'info');
}

function closeCart() {
    document.getElementById('floatingCart').style.display = 'none';
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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

// Function to handle consultation scheduling for negative ROI services
function scheduleConsultation(serviceKey) {
    const service = serviceData[serviceKey];
    if (!service) return;
    
    // Create consultation modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.009 8.009 0 01-5.966-2.686l-1.451 1.451C4.55 19.799 2.99 20 1 20H5l.002.001.002.002.001.002h.003l.002-.001.004-.003.006-.005.014-.012.04-.035c.02-.02.051-.05.091-.089a8.01 8.01 0 01-.002-.034L5 20c0-1.99.201-3.55 1.235-4.583l1.451-1.451A7.963 7.963 0 0112 4c4.418 0 8 3.582 8 8z" />
                    </svg>
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Your Current Setup Shows Negative ROI</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500 mb-4">
                        The ${service.name} service shows a negative ROI with your current metrics. Let's schedule a free 15-minute strategy call to build a profitable plan for your budget.
                    </p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 class="font-semibold text-blue-900 text-sm mb-2">In this consultation, we'll:</h4>
                        <ul class="text-sm text-blue-800 space-y-1">
                            <li>• Analyze your current marketing performance</li>
                            <li>• Identify optimization opportunities</li>
                            <li>• Create a custom strategy for positive ROI</li>
                            <li>• Provide budget-optimized recommendations</li>
                        </ul>
                    </div>
                    <div class="space-y-3">
                        <input type="text" placeholder="Your Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="consultationName">
                        <input type="email" placeholder="Email Address" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="consultationEmail">
                        <input type="tel" placeholder="Phone Number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="consultationPhone">
                    </div>
                </div>
                <div class="items-center px-4 py-3">
                    <button id="scheduleBtn" class="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
                        Schedule Free Consultation
                    </button>
                    <button id="cancelBtn" class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle consultation scheduling
    document.getElementById('scheduleBtn').onclick = function() {
        const name = document.getElementById('consultationName').value;
        const email = document.getElementById('consultationEmail').value;
        const phone = document.getElementById('consultationPhone').value;
        
        if (!name || !email) {
            alert('Please fill in your name and email address.');
            return;
        }
        
        // In a real app, this would send data to your backend
        console.log('Consultation scheduled:', { name, email, phone, service: service.name });
        showNotification('Consultation request submitted! We\'ll contact you within 24 hours.', 'success');
        document.body.removeChild(modal);
    };
    
    // Handle cancel
    document.getElementById('cancelBtn').onclick = function() {
        document.body.removeChild(modal);
    };
    
    // Close on backdrop click
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Make functions available globally for onclick handlers
window.calculateROI = calculateROI;
window.addToRecommendations = addToRecommendations;
window.removeFromRecommendations = removeFromRecommendations;
window.closeCart = closeCart;
window.scheduleConsultation = scheduleConsultation;

// WooCommerce deep-link config
let wooConfig = null;
async function loadWooConfig() {
  if (wooConfig) return wooConfig;
  try {
    const res = await fetch('config/woocommerce.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('config fetch failed');
    wooConfig = await res.json();
  } catch (e) {
    wooConfig = { shopBase: '/shop', products: {}, categories: {} };
  }
  return wooConfig;
}

function getAddToCartHref(serviceKey) {
  const cfg = wooConfig || { shopBase: '/shop', products: {}, categories: {} };
  const id = cfg.products?.[serviceKey];
  if (typeof id === 'number' && id > 0) {
    return `${cfg.shopBase}?add-to-cart=${id}`;
  }
  const slug = cfg.categories?.[serviceKey];
  if (slug) return `${cfg.shopBase}/product-category/${slug}/`;
  return cfg.shopBase || '/shop';
}
