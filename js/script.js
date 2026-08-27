// =============================================
// DENTALIGN - Main Application Script
// Project 3: CloudExify Internship 2026
//
// AUTHOR: Saira Sehar
// REGISTRATION: CX-INT-2026-GEN-0488
//
// DESCRIPTION: Handles theme switching, navigation,
// stats counter animation, cost calculator,
// gallery filtering, before/after slider,
// service filtering, forms, and toast notifications.
// =============================================

// =============================================
// THEME SWITCHER
// =============================================

// Get the theme toggle button from navbar
const themeToggleNav = document.getElementById('themeToggleNav');

// Load saved theme from localStorage or default to light
const savedTheme = localStorage.getItem('dentalign_theme') || 'light';

// Apply saved theme to the page
document.documentElement.setAttribute('data-theme', savedTheme);

// Update the toggle button icon
updateThemeIcon(savedTheme);

// Add click event to theme toggle button
if (themeToggleNav) {
    themeToggleNav.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('dentalign_theme', next);
        updateThemeIcon(next);
    });
}

// Function to update theme icon (moon/sun)
function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggleNav i');
    if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
}

// =============================================
// NAVBAR SCROLL EFFECT & ACTIVE LINK HIGHLIGHT
// =============================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    // Add shadow to navbar when scrolled down
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Scroll spy - highlight active section in nav
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    const scrollY = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// =============================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// =============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = navbar.offsetHeight;
            const position = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: position, behavior: 'smooth' });
        }
    });
});

// =============================================
// ANIMATED STATS COUNTER
// Uses IntersectionObserver to trigger count-up
// when the stats section scrolls into view
// =============================================

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseFloat(counter.dataset.target);
            const decimal = parseInt(counter.dataset.decimal || '0');
            const duration = 2000; // Animation duration in milliseconds
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out animation for smooth count-up
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                const current = target * easeOut;
                
                if (decimal > 0) {
                    counter.textContent = current.toFixed(decimal);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString() + '+';
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    // Final value
                    if (decimal > 0) {
                        counter.textContent = target.toFixed(decimal);
                    } else {
                        counter.textContent = target.toLocaleString() + '+';
                    }
                }
            }
            
            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

// Observe all counter elements
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// =============================================
// COST CALCULATOR
// =============================================

// Treatment prices by complexity level
const treatmentPrices = {
    'checkup': { simple: 1500, moderate: 2500, complex: 4000 },
    'filling': { simple: 3000, moderate: 5000, complex: 8000 },
    'whitening': { simple: 8000, moderate: 12000, complex: 18000 },
    'veneer': { simple: 15000, moderate: 20000, complex: 30000 },
    'braces': { simple: 80000, moderate: 120000, complex: 180000 },
    'implant': { simple: 60000, moderate: 90000, complex: 150000 },
    'rootcanal': { simple: 8000, moderate: 12000, complex: 18000 },
    'extraction': { simple: 3000, moderate: 5000, complex: 8000 }
};

// Listen for treatment selection changes
document.getElementById('treatmentSelect')?.addEventListener('change', calculateCost);

// Listen for complexity level changes
document.querySelectorAll('input[name="complexity"]').forEach(radio => {
    radio.addEventListener('change', calculateCost);
});

// Calculate and display estimated cost
function calculateCost() {
    const treatment = document.getElementById('treatmentSelect').value;
    const complexity = document.querySelector('input[name="complexity"]:checked')?.value;
    const resultAmount = document.getElementById('estimatedCost');
    
    if (!treatment) {
        resultAmount.textContent = '₨ 0';
        resultAmount.style.color = 'var(--text-muted)';
        resultAmount.style.fontSize = '2.5rem';
        return;
    }
    
    if (!complexity) {
        resultAmount.textContent = 'Select complexity';
        resultAmount.style.color = 'var(--text-muted)';
        resultAmount.style.fontSize = '1.2rem';
        return;
    }
    
    if (treatmentPrices[treatment] && treatmentPrices[treatment][complexity]) {
        const cost = treatmentPrices[treatment][complexity];
        resultAmount.textContent = '₨ ' + cost.toLocaleString();
        resultAmount.style.color = 'var(--teal)';
        resultAmount.style.fontSize = '2.5rem';
    }
}

// =============================================
// SERVICE FILTER (Live filtering)
// =============================================

document.querySelectorAll('.service-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.service-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        // Show/hide service cards based on filter
        document.querySelectorAll('.service-item').forEach(item => {
            const category = item.dataset.category;
            if (filter === 'all' || category === filter) {
                item.style.display = '';
                item.style.animation = 'fadeInGallery 0.4s ease';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// =============================================
// GALLERY FILTER & FULLSCREEN
// =============================================

// Gallery Filter
document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        document.querySelectorAll('.gallery-item').forEach(item => {
            const category = item.dataset.category;
            if (filter === 'all' || category === filter) {
                item.style.display = '';
                item.style.animation = 'fadeInGallery 0.4s ease';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Fullscreen Functions
function openFullscreen(card) {
    const img = card.querySelector('img');
    const overlay = document.getElementById('fullscreenOverlay');
    const fullscreenImg = document.getElementById('fullscreenImage');
    
    if (img && overlay && fullscreenImg) {
        fullscreenImg.src = img.src;
        fullscreenImg.alt = img.alt;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close fullscreen with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeFullscreen();
    }
});
// =============================================
// CONTACT FORM
// =============================================

document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[placeholder="Your Name"]')?.value.trim();
    const email = this.querySelector('input[placeholder="Your Email"]')?.value.trim();
    const message = this.querySelector('textarea')?.value.trim();
    
    // Basic validation
    if (!name) {
        showToast('Please enter your name.', 'error');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    
    if (!message) {
        showToast('Please enter your message.', 'error');
        return;
    }
    
    // Save message to localStorage
    const messages = JSON.parse(localStorage.getItem('dentalign_messages') || '[]');
    messages.push({
        name: name,
        email: email,
        message: message,
        date: new Date().toISOString()
    });
    localStorage.setItem('dentalign_messages', JSON.stringify(messages));
    
    showToast('Message sent successfully! We\'ll contact you soon.', 'success');
    this.reset();
});

// =============================================
// NEWSLETTER FORM
// =============================================

document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        emailInput?.focus();
        return;
    }
    
    // Check if already subscribed
    const subscribers = JSON.parse(localStorage.getItem('dentalign_subscribers') || '[]');
    if (subscribers.includes(email)) {
        showToast('You are already subscribed!', 'warning');
        return;
    }
    
    // Save subscriber
    subscribers.push(email);
    localStorage.setItem('dentalign_subscribers', JSON.stringify(subscribers));
    
    showToast('Thank you for subscribing! 🎉', 'success');
    this.reset();
});

// =============================================
// HELPER FUNCTIONS
// =============================================

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Pakistani phone number validation helper
function isValidPakistaniPhone(phone) {
    const cleaned = phone.replace(/[\s\-+]/g, '');
    return /^03\d{9}$/.test(cleaned) || 
           /^3\d{9}$/.test(cleaned) || 
           /^923\d{9}$/.test(cleaned);
}

// Toast notification system
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    
    // Create container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            z-index: 99999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: var(--white, #ffffff);
        border-left: 4px solid ${type === 'success' ? 'var(--success, #10b981)' : type === 'error' ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)'};
        color: var(--text-dark, #1e293b);
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 10px;
        animation: slideInToast 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 400px;
    `;
    
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        warning: 'bi-info-circle-fill'
    };
    
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.success}" 
           style="color: ${type === 'success' ? 'var(--success, #10b981)' : type === 'error' ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)'}; font-size: 1.1rem;"></i>
        <span>${message.replace(/\n/g, '<br>')}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Set minimum date for appointment input
const dateInput = document.getElementById('appointmentDate');
if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Prevent past date selection
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showToast('Please select a future date.', 'error');
            this.value = '';
        }
    });
}

// Console confirmation that script loaded
console.log('✅ DentAlign Main Script Loaded');
console.log('👤 Author: Saira Sehar | CloudExify Internship 2026');