/**
 * Hero Slider with Zoom Animation
 */
class HeroSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.slideDuration = 7000; // 7초
        this.slides = [];
        this.progressFill = null;
        this.sliderContainer = null;
        this.autoSlideInterval = null;
    }

    init() {
        this.sliderContainer = document.querySelector('[data-hero-slider]');
        this.progressFill = document.querySelector('[data-hero-progress]');

        if (!this.sliderContainer) return;

        this.createSlides();
        this.updateIndicators();
        this.startAutoSlide();
    }

    createSlides() {
        // 이미지 데이터
        const images = [
            { src: './images/hero.jpg', alt: 'Hero Image 1' },
            { src: './images/hero1.jpg', alt: 'Hero Image 2' },
            { src: './images/hero2.jpg', alt: 'Hero Image 3' },
            { src: './images/hero3.jpg', alt: 'Hero Image 4' }
        ];

        this.totalSlides = images.length;

        // 슬라이드 생성
        images.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;

            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.alt = img.alt;

            slide.appendChild(imgElement);
            this.sliderContainer.appendChild(slide);
            this.slides.push(slide);
        });

        // 첫 번째 슬라이드 줌인 시작
        if (this.slides[0]) {
            this.startZoomAnimation(this.slides[0]);
        }
    }

    startZoomAnimation(slide) {
        const img = slide.querySelector('img');
        if (img) {
            // 줌 아웃 상태로 초기화
            img.style.transform = 'scale(1)';
            img.style.transition = 'none';

            // 약간의 지연 후 줌인 시작
            setTimeout(() => {
                img.style.transition = `transform ${this.slideDuration}ms ease-out`;
                img.style.transform = 'scale(1.15)';
            }, 100);
        }
    }

    nextSlide() {
        // 현재 슬라이드를 비활성화
        this.slides[this.currentSlide].classList.remove('active');

        // 다음 슬라이드로 이동
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;

        // 새 슬라이드 활성화
        this.slides[this.currentSlide].classList.add('active');

        // 줌인 애니메이션 시작
        this.startZoomAnimation(this.slides[this.currentSlide]);

        // 인디케이터 업데이트
        this.updateIndicators();
    }

    updateIndicators() {
        const currentEl = document.querySelector('[data-current-slide]');
        const totalEl = document.querySelector('[data-total-slides]');

        if (currentEl) {
            currentEl.textContent = String(this.currentSlide + 1).padStart(2, '0');
        }
        if (totalEl) {
            totalEl.textContent = String(this.totalSlides).padStart(2, '0');
        }
    }

    animateProgress() {
        if (!this.progressFill) return;

        // 프로그레스바 초기화
        this.progressFill.style.transition = 'none';
        this.progressFill.style.width = '0%';

        // 강제 리플로우
        this.progressFill.offsetHeight;

        // 애니메이션 시작
        setTimeout(() => {
            this.progressFill.style.transition = `width ${this.slideDuration}ms linear`;
            this.progressFill.style.width = '100%';
        }, 50);
    }

    startAutoSlide() {
        // 첫 번째 프로그레스바 애니메이션 시작
        this.animateProgress();

        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
            this.animateProgress();
        }, this.slideDuration);
    }

    stop() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

/**
 * Gallery Slider - Flex 기반 깔끔한 캐러셀
 */
class GallerySlider {
    constructor() {
        this.slider = null;
        this.index = 0;
        this.intervalId = null;
        this.isPaused = false;
        this.slideDuration = 3000; // 3초마다 슬라이드
        this.images = [
            { src: './images/bbq.jpg', description: 'BBQ' },
            { src: './images/breakfast.jpg', description: '조식' },
            { src: './images/breakfast2.jpg', description: '모닝 브런치' },
            { src: './images/pool.jpg', description: '프라이빗 풀' },
            { src: './images/pool2.jpg', description: '수영장' },
            { src: './images/pool3.jpg', description: '야외 수영장' },
            { src: './images/exterior.jpg', description: '외관 전경' },
            { src: './images/exterior2.jpg', description: '펜션 외관' },
            { src: './images/exterior3.jpg', description: '정원' },
            { src: './images/room.jpg', description: '객실' },
            { src: './images/room2.jpg', description: '침실' },
            { src: './images/room3.jpg', description: '거실' }
        ];
        this.slideCount = this.images.length;
    }

    init() {
        this.slider = document.querySelector('[data-gallery-slider]');
        if (!this.slider) {
            return;
        }

        // 갤러리 타이틀과 설명 설정 (하드코딩)
        const titleElement = document.querySelector('[data-gallery-title]');
        if (titleElement) {
            titleElement.textContent = '특별한 순간들';
        }

        const descElement = document.querySelector('[data-gallery-description]');
        if (descElement) {
            descElement.textContent = '당신의 특별한 순간을 이곳에서 담아보세요.';
        }

        this.setupGallery();
    }

    setupGallery() {
        // 기존 내용 초기화
        this.slider.innerHTML = '';

        // 원본 이미지들 생성
        this.images.forEach((imgData, index) => {
            const slide = this.createSlide(imgData, index);
            this.slider.appendChild(slide);
        });

        // 무한 루프를 위해 원본 이미지들을 여러 번 복제 (3번 더 복제해서 총 4세트)
        const originalSlides = Array.from(this.slider.children);
        for (let i = 0; i < 3; i++) {
            originalSlides.forEach(slide => {
                this.slider.appendChild(slide.cloneNode(true));
            });
        }

        // 슬라이드 시작
        this.startSlider();
    }

    createSlide(imgData, index) {
        const slide = document.createElement('div');
        slide.className = 'gallery-item';

        // 홀수(0,2,4...)는 가로, 짝수(1,3,5...)는 세로
        const isLandscape = index % 2 === 0;
        if (isLandscape) {
            slide.classList.add('landscape');
        } else {
            slide.classList.add('portrait');
        }

        // CSS는 common.css의 기존 스타일 사용 (inline style 제거)

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'gallery-item-image';

        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.description;

        const description = document.createElement('div');
        description.className = 'gallery-item-description';
        const descSpan = document.createElement('span');
        descSpan.textContent = imgData.description;
        description.appendChild(descSpan);

        imageWrapper.appendChild(img);
        slide.appendChild(imageWrapper);
        slide.appendChild(description);

        return slide;
    }

    addFadeOverlays() {
        const galleryContainer = document.querySelector('.gallery-container');

        if (galleryContainer) {
            // 왼쪽 페이드 오버레이
            const leftOverlay = document.createElement('div');
            leftOverlay.className = 'gallery-fade-left';
            leftOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 200px;
                height: 100%;
                background: linear-gradient(to right, rgba(255, 236, 210, 1) 0%, rgba(255, 236, 210, 0.8) 20%, rgba(255, 236, 210, 0) 100%);
                pointer-events: none;
                z-index: 100;
            `;

            // 오른쪽 페이드 오버레이
            const rightOverlay = document.createElement('div');
            rightOverlay.className = 'gallery-fade-right';
            rightOverlay.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                width: 200px;
                height: 100%;
                background: linear-gradient(to left, rgba(255, 236, 210, 1) 0%, rgba(255, 236, 210, 0.8) 20%, rgba(255, 236, 210, 0) 100%);
                pointer-events: none;
                z-index: 100;
            `;

            galleryContainer.appendChild(leftOverlay);
            galleryContainer.appendChild(rightOverlay);
        }
    }

    startSlider() {
        // 슬라이더 초기 위치 설정
        this.slider.style.transform = 'translateX(0)';

        // 호버 이벤트
        this.slider.addEventListener('mouseenter', () => {
            this.isPaused = true;
        });

        this.slider.addEventListener('mouseleave', () => {
            this.isPaused = false;
        });

        // 자동 슬라이드 활성화
        setTimeout(() => {
            this.intervalId = setInterval(() => {
                if (!this.isPaused) {
                    this.move();
                }
            }, this.slideDuration);
        }, 2000);
    }

    move() {
        // 이미지 너비 계산 (첫 번째 아이템 기준)
        const firstItem = this.slider.querySelector('.gallery-item');
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth + 30; // gap 포함

        // 2세트 반까지 갔을 때 미리 리셋 (사용자가 못 보는 타이밍에)
        if (this.index >= this.slideCount * 2) {
            // 즉시 리셋 (애니메이션 없이)
            this.slider.style.transition = 'none';
            this.index = this.slideCount; // 두 번째 세트 시작점으로
            this.slider.style.transform = `translateX(-${this.index * itemWidth}px)`;

            // 리플로우 후 애니메이션 재적용
            void this.slider.offsetWidth;
            this.slider.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        this.index += 1;
        const moveDistance = this.index * itemWidth;
        this.slider.style.transform = `translateX(-${moveDistance}px)`;
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}

/**
 * Fullpage Scroll
 */
class FullpageScroll {
    constructor() {
        this.sections = [];
        this.currentSection = 0;
        this.isScrolling = false;
        this.wheelTimeout = null;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isInFooter = false;

        this.init();
    }

    init() {
        // 모바일에서는 fullpage scroll 비활성화
        if (window.innerWidth <= 768) {
            // 모바일에서 일반 스크롤 활성화
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';

            // fullpage 컨테이너 스타일 변경
            const fullpage = document.getElementById('fullpage');
            if (fullpage) {
                fullpage.style.height = 'auto';
            }

            // 모든 섹션 높이 자동으로 변경
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.height = 'auto';
                section.style.minHeight = '100vh';
            });

            // fp-section 클래스 제거
            document.querySelectorAll('.fp-section').forEach(el => {
                el.classList.remove('fp-section');
            });

            // Navigation dots 숨기기
            const fpNav = document.querySelector('.fp-nav');
            if (fpNav) {
                fpNav.style.display = 'none';
            }

            return;
        }

        this.sections = document.querySelectorAll('.fp-section');
        this.initNavigation();
        this.initScrollListener();
        this.initWheelListener();
        this.initTouchListener();
        this.updateActiveSection();
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.fp-nav a');
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSection(index);
            });
        });
    }

    initScrollListener() {
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveSection();
            }, 100);
        });
    }

    initWheelListener() {
        window.addEventListener('wheel', (e) => {
            if (this.isScrolling) {
                e.preventDefault();
                return;
            }

            // 마지막 섹션에서 아래로 스크롤하거나 푸터 영역에 있으면 일반 스크롤 허용
            const lastSection = this.sections[this.sections.length - 1];
            const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
            const currentScrollPosition = window.scrollY + window.innerHeight;

            if (currentScrollPosition >= lastSectionBottom || this.isInFooter) {
                return; // 일반 스크롤 허용
            }

            e.preventDefault();

            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    // 아래로 스크롤
                    this.nextSection();
                } else {
                    // 위로 스크롤
                    this.prevSection();
                }
            }, 50);
        }, { passive: false });
    }

    initTouchListener() {
        window.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (this.isScrolling) return;

            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - this.touchStartTime;
            const touchDistance = Math.abs(touchEndY - this.touchStartY);

            // 최소 거리와 최대 시간 체크 (스와이프 감지)
            if (touchDistance > 50 && touchDuration < 500) {
                // 마지막 섹션에서 아래로 스와이프하거나 푸터 영역에 있으면 일반 스크롤 허용
                const lastSection = this.sections[this.sections.length - 1];
                const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
                const currentScrollPosition = window.scrollY + window.innerHeight;

                if (currentScrollPosition >= lastSectionBottom || this.isInFooter) {
                    return; // 일반 스크롤 허용
                }

                if (touchEndY < this.touchStartY) {
                    // 아래로 스와이프
                    this.nextSection();
                } else {
                    // 위로 스와이프
                    this.prevSection();
                }
            }
        }, { passive: true });
    }

    updateActiveSection() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        const footer = document.querySelector('.footer');

        // 푸터 영역 체크
        if (footer) {
            const footerTop = footer.offsetTop;
            this.isInFooter = window.scrollY + window.innerHeight > footerTop;
        }

        this.sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                this.currentSection = index;
                this.updateNavigation();

                // 갤러리 또는 클로징 섹션 체크
                if (section.classList.contains('gallery-section') || section.classList.contains('closing-section')) {
                    document.body.classList.add('dark-section-active');
                } else {
                    document.body.classList.remove('dark-section-active');
                }

                // Footer 가시성 체크 (스크롤 끝)
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // 스크롤이 거의 끝에 도달했을 때 (footer가 보일 때)
                if (scrollTop + windowHeight >= documentHeight - 100) {
                    document.body.classList.add('footer-visible');
                } else {
                    document.body.classList.remove('footer-visible');
                }
            }
        });
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.fp-nav a');
        navLinks.forEach((link, index) => {
            if (index === this.currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    nextSection() {
        if (this.currentSection < this.sections.length - 1) {
            this.goToSection(this.currentSection + 1);
        } else {
            // 마지막 섹션에서 푸터로 스크롤
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    prevSection() {
        if (this.currentSection > 0) {
            this.goToSection(this.currentSection - 1);
        }
    }

    goToSection(index) {
        if (this.isScrolling || index < 0 || index >= this.sections.length) return;

        this.isScrolling = true;
        this.currentSection = index;

        const targetSection = this.sections[index];
        targetSection.scrollIntoView({ behavior: 'smooth' });

        this.updateNavigation();

        // 애니메이션 트리거
        this.triggerSectionAnimation(targetSection);

        // 스크롤 완료 후 잠금 해제
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);
    }

    triggerSectionAnimation(section) {
        // 모든 섹션의 애니메이션 리셋
        this.sections.forEach(s => {
            const elements = s.querySelectorAll('.animate-element');
            elements.forEach(el => {
                el.classList.remove('animate');
                // 강제 리플로우
                el.offsetHeight;
            });
        });

        // 히어로 섹션(첫 번째 섹션)은 스킵
        if (section.classList.contains('hero-section')) {
            return;
        }

        // 현재 섹션의 애니메이션 트리거 (약간의 지연 후)
        setTimeout(() => {
            const elements = section.querySelectorAll('.animate-element');
            elements.forEach(el => {
                // 인라인 스타일 제거 (CSS가 처리하도록)
                el.style.removeProperty('opacity');
                el.style.removeProperty('transform');
                el.classList.add('animate');
            });
        }, 200);
    }
}

/**
 * 스크롤 감지 및 UI 업데이트
 */
function initScrollDetection() {
    function updateScrollState() {
        const scrolled = window.scrollY > 50;

        if (scrolled) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    }

    // 초기 상태 설정
    updateScrollState();

    // 스크롤 이벤트 리스너
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollState();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// 모바일 스크롤 애니메이션 초기화 함수
function initMobileAnimations() {
    const animateElements = document.querySelectorAll('.animate-element');

    if (!animateElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 약간의 지연을 두고 애니메이션 실행
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, entry.target.dataset.delay || 0);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach((element, index) => {
        // 순차적 애니메이션을 위한 지연 시간 설정
        element.dataset.delay = index * 100;
        observer.observe(element);
    });
}

// 모바일 일반 스크롤 활성화 함수
function enableMobileScroll() {
    // body와 html 스크롤 활성화
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    // fullpage 컨테이너 스타일 초기화
    const fullpage = document.getElementById('fullpage');
    if (fullpage) {
        fullpage.style.height = 'auto';
        fullpage.style.overflow = 'visible';
    }

    // 모든 섹션 높이 자동으로
    const sections = document.querySelectorAll('.section, .fp-section');
    sections.forEach(section => {
        section.style.height = 'auto';
        section.style.minHeight = '100vh';
        section.classList.remove('fp-section');
    });

    // Navigation dots 숨기기
    const fpNav = document.querySelector('.fp-nav');
    if (fpNav) {
        fpNav.style.display = 'none';
    }
}

// DOM 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // Hero Slider 초기화
    const heroSlider = new HeroSlider();
    heroSlider.init();

    // Gallery Slider 초기화 (모든 디바이스에서)
    const gallerySlider = new GallerySlider();
    gallerySlider.init();

    // 모바일이 아닐 때만 Fullpage Scroll 초기화
    if (window.innerWidth > 768) {
        new FullpageScroll();
    }

    // 스크롤 감지 초기화
    initScrollDetection();

    // 모바일에서 일반 스크롤 활성화
    if (window.innerWidth <= 768) {
        enableMobileScroll();
        initMobileAnimations();
    }

    // 초기 로드 시 두 번째 섹션부터 애니메이션 준비 (히어로는 원래 애니메이션 사용)
    setTimeout(() => {
        const sections = document.querySelectorAll('.fp-section:not(.hero-section)');
        sections.forEach(section => {
            const elements = section.querySelectorAll('.animate-element');
            elements.forEach(el => {
                el.classList.remove('animate');
            });
        });
    }, 100);

    // Signature 썸네일 자동 및 클릭 이벤트
    const signatureThumbs = document.querySelectorAll('.signature-thumb');
    const signatureMainImage = document.getElementById('signature-main-image');
    let signatureCurrentIndex = 0;
    let signatureInterval = null;

    function changeSignatureImage(index) {
        // 모든 썸네일에서 active 클래스 제거
        signatureThumbs.forEach(t => t.classList.remove('active'));
        // 선택된 썸네일에 active 클래스 추가
        signatureThumbs[index].classList.add('active');

        // 메인 이미지 변경
        const newImageSrc = signatureThumbs[index].getAttribute('data-image');
        if (signatureMainImage && newImageSrc) {
            signatureMainImage.style.opacity = '0';
            setTimeout(() => {
                signatureMainImage.src = newImageSrc;
                signatureMainImage.style.opacity = '1';
            }, 250);
        }
    }

    // 자동 슬라이드 시작
    function startSignatureAutoSlide() {
        signatureInterval = setInterval(() => {
            signatureCurrentIndex = (signatureCurrentIndex + 1) % signatureThumbs.length;
            changeSignatureImage(signatureCurrentIndex);
        }, 4000); // 4초마다 변경
    }

    // 자동 슬라이드 중지
    function stopSignatureAutoSlide() {
        if (signatureInterval) {
            clearInterval(signatureInterval);
            signatureInterval = null;
        }
    }

    // 썸네일 클릭 이벤트
    signatureThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            stopSignatureAutoSlide(); // 자동 슬라이드 중지
            signatureCurrentIndex = index;
            changeSignatureImage(index);
            // 3초 후 자동 슬라이드 재시작
            setTimeout(startSignatureAutoSlide, 3000);
        });
    });

    // 자동 슬라이드 시작
    if (signatureThumbs.length > 0) {
        startSignatureAutoSlide();
    }
});