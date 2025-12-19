/**
 * Main Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hero Slider Initialization
    initHeroSlider();

    // Scroll animations
    initScrollAnimations();

    // Marquee animation
    initMarquee();
});

/**
 * Initialize Hero Slider
 */
function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero-slide');
    const currentSlideEl = document.querySelector('[data-current-slide]');
    const totalSlidesEl = document.querySelector('[data-total-slides]');
    const progressBar = document.querySelector('[data-hero-progress]');
    const prevBtn = document.querySelector('.hero-nav-prev');
    const nextBtn = document.querySelector('.hero-nav-next');

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideInterval = 5000; // 5 seconds per slide

    // Update total slides count
    if (totalSlidesEl) {
        totalSlidesEl.textContent = totalSlides.toString().padStart(2, '0');
    }

    // Function to show specific slide
    function showSlide(index, immediate = false) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update current slide number
        if (currentSlideEl) {
            currentSlideEl.textContent = (index + 1).toString().padStart(2, '0');
        }

        // Update progress bar - always fill to 100% for current slide
        if (progressBar) {
            // Reset to 0 then animate to 100%
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';

            // Start animation immediately or with minimal delay
            if (immediate) {
                // For first slide, start immediately
                setTimeout(() => {
                    progressBar.style.transition = `width ${slideInterval}ms linear`;
                    progressBar.style.width = '100%';
                }, 10);
            } else {
                // For subsequent slides
                progressBar.offsetHeight; // Force reflow
                progressBar.style.transition = `width ${slideInterval}ms linear`;
                progressBar.style.width = '100%';
            }
        }
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Function to go to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto-play slider
    let autoPlayInterval;
    let isTransitioning = false;

    // Start auto-play
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, slideInterval);
    }

    // Function to reset auto-play
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Navigation button handlers
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                clearInterval(autoPlayInterval);
                nextSlide();
                setTimeout(() => {
                    isTransitioning = false;
                    resetAutoPlay();
                }, 100);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                clearInterval(autoPlayInterval);
                prevSlide();
                setTimeout(() => {
                    isTransitioning = false;
                    resetAutoPlay();
                }, 100);
            }
        });
    }

    // Pause on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    slider.addEventListener('mouseleave', () => {
        if (!isTransitioning) {
            startAutoPlay();
        }
    });

    // Initialize first slide with immediate animation and start auto-play
    showSlide(0, true);
    startAutoPlay();
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-element');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Parallax effect for shadow background - horizontal movement
    const mainAboutSection = document.querySelector('.main-about-section');
    if (mainAboutSection) {
        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rect = mainAboutSection.getBoundingClientRect();

            // Only apply effect when section is in viewport
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                // Calculate progress through viewport (0 to 1)
                const viewportHeight = window.innerHeight;
                const elementTop = rect.top + scrolled;
                const scrollProgress = (scrolled - elementTop + viewportHeight) / (viewportHeight + rect.height);

                // Move horizontally based on scroll progress
                const maxMove = 50; // Maximum pixels to move
                const xPos = Math.sin(scrollProgress * Math.PI) * maxMove; // Smooth sine wave movement

                mainAboutSection.style.setProperty('--parallax-x', `${xPos}px`);
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
        // Initial call
        updateParallax();
    }
}

/**
 * Initialize marquee animation
 */
function initMarquee() {
    const marqueeEl = document.querySelector('[data-main-marquee]');
    if (!marqueeEl) return;

    const text = "POOLVILLA GLAMPING";
    const repeatCount = 10;

    // Create repeated text
    let content = '';
    for (let i = 0; i < repeatCount; i++) {
        content += `<span>${text}</span>`;
    }

    marqueeEl.innerHTML = content;

    // Add animation class
    marqueeEl.classList.add('marquee-animated');
}

/**
 * Initialize section observer for header color changes
 */
function initSectionObserver() {
    const header = document.querySelector('.transparent-header');
    if (!header) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const isDarkSection = entry.target.classList.contains('dark-section');

                if (isDarkSection) {
                    document.body.classList.add('dark-section-active');
                } else {
                    document.body.classList.remove('dark-section-active');
                }
            }
        });
    }, {
        threshold: 0.5
    });

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize section observer
document.addEventListener('DOMContentLoaded', initSectionObserver);