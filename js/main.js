/**
 * INTERCARGO - Main JavaScript
 * All interactive functionality for the static site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initMobileMenu();
    initHeroSlider();
    initAdvantagesSlider();
    initPackingSlider();
    initFaqAccordion();
    initContactWidget();
    initSmoothScroll();
    initCurrentYear();
});

/* ========== MOBILE MENU ========== */
function initMobileMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu?.querySelectorAll('.mobile-menu__link');

    if (!burgerBtn || !mobileMenu) return;

    burgerBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on links
    mobileLinks?.forEach(link => {
        link.addEventListener('click', function() {
            burgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            burgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ========== HERO SLIDER ========== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__slider-dot');
    const prevBtn = document.querySelector('.hero__slider-arrow--prev');
    const nextBtn = document.querySelector('.hero__slider-arrow--next');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoSlideInterval;
    const slideCount = slides.length;

    function goToSlide(index) {
        // Normalize index
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentSlide = index;
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Event listeners
    prevBtn?.addEventListener('click', function() {
        prevSlide();
        startAutoSlide();
    });

    nextBtn?.addEventListener('click', function() {
        nextSlide();
        startAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToSlide(index);
            startAutoSlide();
        });
    });

    // Start auto slide
    startAutoSlide();
}

/* ========== ADVANTAGES SLIDER ========== */
function initAdvantagesSlider() {
    const slider = document.getElementById('advantages-slider');
    const track = slider?.querySelector('.advantages__track');
    const prevBtn = document.querySelector('.advantages__arrow--prev');
    const nextBtn = document.querySelector('.advantages__arrow--next');

    if (!slider || !track) return;

    const cards = track.querySelectorAll('.advantages__card');
    const cardWidth = 340 + 24; // Card width + gap
    let currentIndex = 0;
    let autoScrollInterval;
    let isDragging = false;
    let startX = 0;
    let translateX = 0;
    let currentTranslate = 0;

    // Clone cards for infinite scroll effect
    const originalCards = Array.from(cards);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    function updateSlider(animate = true) {
        track.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    function nextSlide() {
        currentIndex++;
        updateSlider();

        // Reset position when reaching cloned section
        if (currentIndex >= originalCards.length * 2) {
            setTimeout(() => {
                currentIndex = originalCards.length;
                updateSlider(false);
            }, 500);
        }
    }

    function prevSlide() {
        currentIndex--;
        updateSlider();

        // Reset position when going below original section
        if (currentIndex < 0) {
            setTimeout(() => {
                currentIndex = originalCards.length - 1;
                updateSlider(false);
            }, 500);
        }
    }

    function startAutoScroll() {
        stopAutoScroll();
        autoScrollInterval = setInterval(nextSlide, 3000);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }

    // Event listeners for buttons
    prevBtn?.addEventListener('click', function() {
        prevSlide();
        startAutoScroll();
    });

    nextBtn?.addEventListener('click', function() {
        nextSlide();
        startAutoScroll();
    });

    // Drag functionality
    function handleDragStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        translateX = 0;
        stopAutoScroll();
        slider.style.cursor = 'grabbing';
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        translateX = currentX - startX;
        track.style.transition = 'none';
        track.style.transform = `translateX(calc(-${currentIndex * cardWidth}px + ${translateX}px))`;
    }

    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        slider.style.cursor = 'grab';

        if (translateX > 50) {
            prevSlide();
        } else if (translateX < -50) {
            nextSlide();
        } else {
            updateSlider();
        }

        translateX = 0;
        startAutoScroll();
    }

    // Mouse events
    slider.addEventListener('mousedown', handleDragStart);
    slider.addEventListener('mousemove', handleDragMove);
    slider.addEventListener('mouseup', handleDragEnd);
    slider.addEventListener('mouseleave', handleDragEnd);

    // Touch events
    slider.addEventListener('touchstart', handleDragStart, { passive: true });
    slider.addEventListener('touchmove', handleDragMove, { passive: true });
    slider.addEventListener('touchend', handleDragEnd);

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);

    // Start auto scroll
    currentIndex = originalCards.length; // Start from middle for infinite scroll
    updateSlider(false);
    startAutoScroll();
}

/* ========== PACKING SLIDER (NO DUPLICATES) ========== */
function initPackingSlider() {
    const slider = document.getElementById('packing-slider');
    const track = slider?.querySelector('.packing-track');
    const prevBtn = document.querySelector('.packing-arrow--prev');
    const nextBtn = document.querySelector('.packing-arrow--next');

    if (!slider || !track) return;

    const cards = track.querySelectorAll('.packing-card');
    if (cards.length === 0) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let translateX = 0;
    let currentTranslate = 0;

    // Calculate visible cards based on viewport
    function getVisibleCards() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth <= 640) return 1;
        if (viewportWidth <= 1024) return 2;
        return 3;
    }

    // Calculate card width including gap
    function getCardWidth() {
        const card = cards[0];
        const gap = 24;
        return card.offsetWidth + gap;
    }

    // Get max index (prevent scrolling past last cards)
    function getMaxIndex() {
        const visibleCards = getVisibleCards();
        return Math.max(0, cards.length - visibleCards);
    }

    // Update slider position
    function updateSlider(animate = true) {
        const cardWidth = getCardWidth();
        track.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        currentTranslate = -currentIndex * cardWidth;
        updateButtons();
    }

    // Update button states
    function updateButtons() {
        const maxIndex = getMaxIndex();
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }

    // Navigation
    function nextSlide() {
        const maxIndex = getMaxIndex();
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    }

    // Button events
    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);

    // Drag functionality
    function handleDragStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        translateX = 0;
        slider.style.cursor = 'grabbing';
        track.style.transition = 'none';
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        translateX = currentX - startX;
        track.style.transform = `translateX(${currentTranslate + translateX}px)`;
    }

    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        slider.style.cursor = 'grab';

        const cardWidth = getCardWidth();
        const maxIndex = getMaxIndex();

        if (translateX > 50 && currentIndex > 0) {
            currentIndex--;
        } else if (translateX < -50 && currentIndex < maxIndex) {
            currentIndex++;
        }

        updateSlider();
    }

    // Mouse events
    slider.addEventListener('mousedown', handleDragStart);
    slider.addEventListener('mousemove', handleDragMove);
    slider.addEventListener('mouseup', handleDragEnd);
    slider.addEventListener('mouseleave', handleDragEnd);

    // Touch events
    slider.addEventListener('touchstart', handleDragStart, { passive: true });
    slider.addEventListener('touchmove', handleDragMove, { passive: true });
    slider.addEventListener('touchend', handleDragEnd);

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Ensure current index is valid after resize
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            updateSlider(false);
        }, 100);
    });

    // Initialize
    updateSlider(false);
}

/* ========== FAQ ACCORDION ========== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq__question-btn') || item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const btn = otherItem.querySelector('.faq__question-btn');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active', !isActive);
            questionBtn.setAttribute('aria-expanded', String(!isActive));
        });
    });
}

/* ========== CONTACT WIDGET ========== */
function initContactWidget() {
    const widget = document.getElementById('contact-widget');
    const toggleBtn = document.getElementById('contact-widget-toggle');
    const links = widget?.querySelectorAll('.contact-widget__link');

    if (!widget || !toggleBtn) return;

    toggleBtn.addEventListener('click', function() {
        widget.classList.toggle('active');
    });

    // Close widget when clicking on a link
    links?.forEach(link => {
        link.addEventListener('click', function() {
            // Small delay to allow the link to work
            setTimeout(() => {
                widget.classList.remove('active');
            }, 100);
        });
    });

    // Close widget when clicking outside
    document.addEventListener('click', function(e) {
        if (!widget.contains(e.target)) {
            widget.classList.remove('active');
        }
    });
}

/* ========== SMOOTH SCROLL ========== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========== CURRENT YEAR ========== */
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* ========== FORM SUBMISSION (Placeholder) ========== */
const ctaForm = document.getElementById('cta-form');
if (ctaForm) {
    ctaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        // Here you would normally send the data to your server
        console.log('Form submitted:', data);

        // Show success message (you can customize this)
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.');

        // Reset form
        this.reset();
    });
}

/* ========== INTERSECTION OBSERVER FOR ANIMATIONS ========== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up, .stagger-children > *');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('animated'));
    }
}

// Initialize scroll animations after DOM is fully loaded
window.addEventListener('load', initScrollAnimations);
