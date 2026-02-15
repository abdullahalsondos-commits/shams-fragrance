// Central Product Data
window.products = [
    {
        id: 'paradise',
        name: 'Paradise',
        price: 490,
        image: 'assets/images/perfumes/paradise.jpg',
        description: 'Dupe Erba Pura. A luxurious blend of Mediterranean citrus and sweet fruits, layered over a warm, sensual amber and musk base. Perfect for those who love vibrant and long-lasting scents.',
        category: 'men women',
        categoryDisplay: 'Men & Women'
    },
    {
        id: 'lunara',
        name: 'Lunara',
        price: 380,
        image: 'assets/images/perfumes/lunara.jpg',
        description: 'Dupe Kayali Vanilla | 28. A masterpiece of refined cultivation and nuanced nuance. A complex bouquet of vanilla orchid and tonka absolute, balanced with brown sugar and amber woods.',
        category: 'women',
        categoryDisplay: 'Women'
    },
    {
        id: 'sigma',
        name: 'Sigma',
        price: 450,
        image: 'assets/images/perfumes/sigma.jpg',
        description: 'Dupe Stronger With You Intensely. An addictive fougere scent with notes of pink pepper, vanilla, and an ambery wood accord. Bold, charismatic, and undeniably masculine.',
        category: 'men',
        categoryDisplay: 'Men'
    },
    {
        id: 'blaze',
        name: 'Blaze',
        price: 490,
        image: 'assets/images/perfumes/blaze.jpg',
        description: 'Dupe Althair. An elegant and modern ode to vanilla, blended with citrus, spices, and noble woods. A warm, fresh, and gourmand fragrance that leaves a lasting impression.',
        category: 'men',
        categoryDisplay: 'Men'
    },
    {
        id: 'shadow-spice',
        name: 'Shadow Spice',
        price: 490,
        image: 'assets/images/perfumes/shadow-spice.jpg',
        description: 'Dupe Layton. A seductive oriental-floral fragrance with an intense olfactory signature. Vanilla and precious woods grow enhanced by an intriguing note of caramelized coffee.',
        category: 'men',
        categoryDisplay: 'Men'
    },
    {
        id: 'pink-aura',
        name: 'Pink Aura',
        price: 450,
        image: 'assets/images/perfumes/pink-aura.jpg',
        description: 'Dupe Eilish Billie Eilish. A captivating amber gourmand fragrance featuring notes of sugared petals, creamy vanilla, and warm musks. It feels like a warm embrace.',
        category: 'women',
        categoryDisplay: 'Women'
    }
];

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinkItems = document.querySelectorAll('.nav-links a');
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// Header scroll effect
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Enhanced navigation link animations
const navLinkElements = document.querySelectorAll('.nav-links a');
navLinkElements.forEach((link, index) => {
    link.style.transition = 'all 0.3s ease';

    link.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-3px)';
        this.style.color = '#666';
    });

    link.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.color = '#000';
    });

    // Initial wave animation
    link.style.opacity = '0';
    link.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        link.style.transition = 'all 0.5s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
    }, 100 * index);
});

// Smooth scroll for anchor links
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

// Product card interactions are now handled via CSS for better performance and smoother animation

// Add to cart button interaction
const addToCartButtons = document.querySelectorAll('.product-button');
addToCartButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        e.stopPropagation();

        // Visual feedback
        const originalText = this.textContent;
        this.textContent = 'ADDED!';
        this.style.background = '#000';
        this.style.color = '#fff';

        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
            this.style.color = '';
        }, 1500);
    });
});

// Contact form validation and submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Simple validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Simulate form submission
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'SENDING...';
        submitButton.disabled = true;

        setTimeout(() => {
            submitButton.textContent = 'MESSAGE SENT!';
            submitButton.style.background = '#059669';

            // Reset form
            contactForm.reset();

            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.background = '';
                submitButton.disabled = false;
            }, 2000);
        }, 1500);
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements with animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .story-section, .section-header');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Staggered animation for benefit cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Floating effect for icons on scroll
    const icons = document.querySelectorAll('.benefit-card i, .social-icon');
    icons.forEach(icon => {
        icon.style.animation = 'float 3s ease-in-out infinite';
        icon.style.animationDelay = Math.random() * 2 + 's';
    });
});

// Shopping cart icon badge (demo)
const cartIcon = document.querySelector('.fa-shopping-bag');
if (cartIcon) {
    let cartCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartCount++;
            updateCartBadge();
        });
    });

    function updateCartBadge() {
        // Remove existing badge if any
        const existingBadge = document.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Create new badge
        if (cartCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = cartCount;
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #000;
                color: #fff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                font-weight: 600;
            `;

            cartIcon.parentElement.style.position = 'relative';
            cartIcon.parentElement.appendChild(badge);
        }
    }
}

// Preloader (optional)
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Category Filter Logic
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const category = button.getAttribute('data-category');
                filterProducts(category);
            });
        });
    }

    // Check URL params for category
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        // slight delay to ensure elements are ready
        setTimeout(() => filterByCategory(categoryParam), 100);
    }
});

function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const cardCategories = card.getAttribute('data-category').split(' ');

        // Remove existing animation
        card.style.animation = 'none';
        card.offsetHeight; /* trigger reflow */

        if (category === 'all' || cardCategories.includes(category)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });
}

// Global function for footer links to call
window.filterByCategory = function (category) {
    // If not on shop page, redirect
    if (!window.location.pathname.includes('shop.html')) {
        window.location.href = 'shop.html?category=' + category;
        return;
    }

    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button state
    buttons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    filterProducts(category);

    // Scroll to products section
    const productsSection = document.querySelector('.category-filters');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Global Floating Shipping Notice
document.addEventListener('DOMContentLoaded', () => {
    // Check if it already exists (to prevent duplicates)
    if (!document.querySelector('.floating-shipping-notice')) {
        const notice = document.createElement('div');
        notice.className = 'floating-shipping-notice';
        notice.innerHTML = `
            <i class="fas fa-truck"></i>
            <span>Free Shipping on orders over 1000 EGP</span>
        `;
        document.body.appendChild(notice);
    }
});
