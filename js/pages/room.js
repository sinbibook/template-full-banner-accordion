/**
 * Room Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero slider
    initHeroSlider();

    // Initialize animations
    initAnimations();

    // Initialize marquee
    initMarquee();

    // Initialize thumbnail gallery
    initThumbnailGallery();
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

    // Auto-play slider
    let autoPlayInterval;
    let isTransitioning = false;

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
 * Initialize animations
 */
function initAnimations() {
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
}

/**
 * Initialize marquee animation
 */
function initMarquee() {
    const marqueeEl = document.querySelector('[data-marquee-propery-name]');
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
 * Initialize room detail slider
 */
function initThumbnailGallery() {
    const slides = document.querySelectorAll('.room-slide');
    const indicators = document.querySelectorAll('.indicator');

    if (!slides.length || !indicators.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideInterval = 4000; // 4 seconds per slide

    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');

        // Update thumbnails
        const thumbs = document.querySelectorAll('.thumb-img');
        thumbs.forEach(t => t.classList.remove('active'));
        if (thumbs[index]) {
            thumbs[index].classList.add('active');
        }
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto-play slider
    let autoPlayInterval = setInterval(nextSlide, slideInterval);

    // Click handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(autoPlayInterval);
            currentSlide = index;
            showSlide(currentSlide);
            // Restart auto-play
            autoPlayInterval = setInterval(nextSlide, slideInterval);
        });
    });

    // Click handlers for thumbnails
    const thumbs = document.querySelectorAll('.thumb-img');
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            clearInterval(autoPlayInterval);
            currentSlide = index;
            showSlide(currentSlide);
            // Update thumbnail active state
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            // Restart auto-play
            autoPlayInterval = setInterval(nextSlide, slideInterval);
        });
    });

    // Pause on hover
    const sliderContainer = document.querySelector('.room-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        sliderContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(nextSlide, slideInterval);
        });
    }
}