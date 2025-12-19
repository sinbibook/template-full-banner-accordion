/**
 * Image Helper Class
 */
class ImageHelpers {
    static EMPTY_IMAGE_WITH_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjxwYXRoIGQ9Ik0xODAgMTIwaDQwdjYwaC00MHptMCAwbDQwIDYwbS00MC02MGwtNDAgNjBoMTIwIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

    static applyPlaceholder(img) {
        if (img) {
            img.src = this.EMPTY_IMAGE_WITH_ICON;
            img.classList.add('empty-image-placeholder');
        }
    }
}

/**
 * Main Page Data Mapper
 * main.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 main 페이지 특화 기능 제공
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 MAIN PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 슬라이더 이미지 매핑
     * homepage.customFields.pages.main.sections[0].hero.images → [data-main-hero-slider]
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');
        const sliderContainer = this.safeSelect('[data-main-hero-slider]');

        if (!sliderContainer) return;

        // 기존 슬라이드 제거 (placeholder 제외하고 동적 생성된 것만)
        const existingSlides = sliderContainer.querySelectorAll('.fullscreen-slide:not(:first-child)');
        existingSlides.forEach(slide => slide.remove());

        // isSelected: true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = heroData?.images
            ? heroData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            : [];

        if (selectedImages.length === 0) {
            // 이미지 없으면 첫 번째 슬라이드만 placeholder로 유지
            const firstSlide = sliderContainer.querySelector('.fullscreen-slide');
            if (firstSlide) {
                const img = firstSlide.querySelector('img');
                if (img) {
                    ImageHelpers.applyPlaceholder(img);
                }
            }
            return;
        }

        // 첫 번째 이미지를 기존 슬라이드에 적용
        const firstSlide = sliderContainer.querySelector('.fullscreen-slide');
        if (firstSlide) {
            const img = firstSlide.querySelector('img');
            if (img) {
                img.src = selectedImages[0].url;
                img.alt = this.sanitizeText(selectedImages[0].description, '메인 이미지');
                img.classList.remove('empty-image-placeholder');
            }
        }

        // 나머지 이미지들을 추가 슬라이드로 생성
        for (let i = 1; i < selectedImages.length; i++) {
            const slide = document.createElement('div');
            slide.className = 'fullscreen-slide';

            const img = document.createElement('img');
            img.src = selectedImages[i].url;
            img.alt = this.sanitizeText(selectedImages[i].description, `메인 이미지 ${i + 1}`);

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        }

        // 네비게이션 총 개수 업데이트
        const navTotal = document.querySelector('.nav-total');
        if (navTotal) {
            navTotal.textContent = String(selectedImages.length).padStart(2, '0');
        }
    }

    /**
     * About 섹션 매핑 (제목 + 설명)
     * customFields.pages.main.sections[0].hero.title → [data-main-about-title]
     * customFields.pages.main.sections[0].hero.description → [data-main-about-description]
     */
    mapAboutSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');

        // About 제목 - customFields hero.title 사용
        const aboutTitle = this.safeSelect('[data-main-about-title]');
        if (aboutTitle) {
            aboutTitle.textContent = this.sanitizeText(heroData?.title, '소개 페이지 히어로 타이틀');
        }

        // About 설명 - customFields hero.description 사용
        const aboutDescription = this.safeSelect('[data-main-about-description]');
        if (aboutDescription) {
            aboutDescription.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '소개 페이지 히어로 설명');
        }
    }

    /**
     * Marquee 섹션 매핑
     * property.nameEn → [data-main-marquee] 내부 span들 (uppercase)
     */
    mapMarqueeSection() {
        if (!this.isDataLoaded) return;

        const property = this.safeGet(this.data, 'property');
        const marqueeContainer = this.safeSelect('[data-main-marquee]');

        if (!marqueeContainer || !property || !property.nameEn) return;

        // 기존 span 제거
        marqueeContainer.innerHTML = '';

        // 5개의 span 생성
        const nameEnUpper = this.sanitizeText(property.nameEn, 'PROPERTY NAME').toUpperCase();

        for (let i = 0; i < 5; i++) {
            const span = document.createElement('span');
            span.textContent = nameEnUpper;
            marqueeContainer.appendChild(span);
        }
    }

    /**
     * Full Banner 이미지 매핑
     * property.images[0].exterior → [data-main-banner] 배경 이미지
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-main-banner]');
        if (!banner) return;

        const propertyImages = this.safeGet(this.data, 'property.images');
        const exteriorImages = this.safeGet(propertyImages?.[0], 'exterior');

        // exterior 이미지 필터링 및 정렬
        const sortedExterior = exteriorImages
            ?.filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        const targetImage = sortedExterior[0];

        if (targetImage && targetImage.url) {
            // 배경 이미지 설정
            banner.style.backgroundImage = `url('${targetImage.url}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        } else {
            // 이미지 없을 때 placeholder
            banner.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
    }

    /**
     * Introduction 섹션 매핑 (동적 블록 생성)
     * homepage.customFields.pages.main.sections[0].intro[] → .intro-section
     */
    mapIntroductionSection() {
        console.log('mapIntroductionSection called');

        const introContainer = document.querySelector('.intro-section');
        console.log('introContainer found:', introContainer);

        if (!introContainer) {
            console.error('intro-section not found');
            return;
        }

        // 기존 블록 제거
        introContainer.innerHTML = '';

        // JSON 데이터에서 intro 섹션 가져오기
        const introData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.intro');
        console.log('Intro data from JSON:', introData);

        let blocks = [];

        if (introData && Array.isArray(introData) && introData.length > 0) {
            // JSON 데이터 사용 - 첫 번째 블록만
            blocks = [introData[0]];
            console.log('Using first block from JSON');
        } else {
            // 데이터가 없으면 데모 블록 1개만 사용
            console.log('No intro data found, using single demo block');
            blocks = [
                {
                    title: '특별한 휴식',
                    description: '자연과 함께하는 프라이빗한 공간에서 진정한 휴식을 경험하세요.',
                    image: { url: 'images/pool.jpg', description: '메인 이미지' }
                }
            ];
        }

        console.log('Creating blocks, total:', blocks.length);

        blocks.forEach((block, index) => {
            console.log(`Creating block ${index + 1}:`, block.title);
            const blockElement = this.createIntroBlock(block);
            introContainer.appendChild(blockElement);
        });

        console.log('Blocks created, container children:', introContainer.children.length);
    }

    /**
     * Introduction 블록 생성 헬퍼 함수
     */
    createIntroBlock(block) {
        const introBlock = document.createElement('div');
        introBlock.className = 'intro-block';

        // 이미지 생성
        const imageDiv = document.createElement('div');
        imageDiv.className = 'intro-block-image';

        const img = document.createElement('img');
        if (block.image && block.image.url) {
            img.src = block.image.url;
            img.alt = this.sanitizeText(block.image.description, '소개 블록 이미지');
        } else {
            img.src = 'images/hero.jpg'; // 기본 이미지
            img.alt = '소개 블록 이미지';
        }

        imageDiv.appendChild(img);

        // 텍스트 컨텐츠 래퍼 생성
        const contentDiv = document.createElement('div');
        contentDiv.className = 'intro-block-content';

        // 제목 생성
        const title = document.createElement('h2');
        title.className = 'intro-block-title';
        title.textContent = this.sanitizeText(block.title, '소개 블록 제목');

        // 설명 생성
        const description = document.createElement('p');
        description.className = 'intro-block-description';
        description.innerHTML = this._formatTextWithLineBreaks(block.description, '소개 블록 설명');

        // 컨텐츠에 추가
        contentDiv.appendChild(title);
        contentDiv.appendChild(description);

        // 블록에 추가
        introBlock.appendChild(imageDiv);
        introBlock.appendChild(contentDiv);

        return introBlock;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Main 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map main page: data not loaded');
            return;
        }

        // Main 페이지 섹션들 순차 매핑
        console.log('Starting main page mapping...');
        this.mapHeroSlider();
        this.mapAboutSection();
        this.mapMarqueeSection();
        // this.mapFullBanner(); // 하드코딩된 이미지 사용을 위해 비활성화
        this.mapIntroductionSection();

        // 메타 태그 업데이트
        this.updateMetaTags();

        // 슬라이더 재초기화
        this.reinitializeSlider();

        // 스크롤 애니메이션 재초기화
        this.reinitializeScrollAnimations();
    }

    /**
     * 스크롤 애니메이션 재초기화
     */
    reinitializeScrollAnimations() {
        // main.js의 setupScrollAnimations() 함수 호출
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }

        // 즉시 체크 (화면에 이미 보이는 요소들)
        const animateElements = document.querySelectorAll('.animate-element');
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSlider() {
        // 기존 슬라이더 인스턴스가 있으면 제거
        if (window.mainSliderInstance) {
            if (typeof window.mainSliderInstance.destroy === 'function') {
                window.mainSliderInstance.destroy();
            }
            window.mainSliderInstance = null;
        }

        // 슬라이더 재초기화
        setTimeout(() => {
            if (typeof window.FullscreenSlider === 'function') {
                window.mainSliderInstance = new window.FullscreenSlider('.fullscreen-slider-container', {
                    slideDuration: 4000,
                    autoplay: true,
                    enableSwipe: true,
                    enableKeyboard: true
                });
            }
        }, 100);
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new MainMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}
