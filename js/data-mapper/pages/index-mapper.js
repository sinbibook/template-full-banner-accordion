/**
 * Index Page Data Mapper
 * Extends BaseDataMapper for Index page specific mappings
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 메인 매핑 메서드
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            // SEO 메타 태그 업데이트
            this.updateMetaTags();

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapEssenceSection();
            this.mapSignatureSection();
            this.mapGallerySection();
            this.mapClosingSection();

            // E-commerce 등록번호 매핑 (footer)
            this.mapEcommerceRegistration();

            // 애니메이션 재초기화
            this.reinitializeScrollAnimations();

            // 슬라이더 재초기화
            this.reinitializeSliders();

        } catch (error) {
            console.error('Failed to map index page:', error);
        }
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSliders() {
        // Hero 슬라이더 재초기화
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider();
        }

        // Gallery 슬라이더 재초기화
        if (typeof window.setupInfiniteSlider === 'function') {
            const gallerySlider = document.querySelector('.gallery-slider');
            if (gallerySlider && gallerySlider.querySelectorAll('.gallery-item').length > 0) {
                window.setupInfiniteSlider();
                if (typeof window.setupDragAndSwipe === 'function') {
                    window.setupDragAndSwipe();
                }
            }
        }

        // Signature 섹션 재초기화 (썸네일 클릭 이벤트)
        this.initSignatureInteraction();
    }

    /**
     * Signature 섹션 인터랙션 초기화
     */
    initSignatureInteraction() {
        const signatureData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.signature');
        if (!signatureData || !signatureData.images) return;

        const selectedImages = signatureData.images
            .filter(img => img.isSelected === true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .slice(0, 4);

        if (selectedImages.length === 0) return;

        const mainImg = this.safeSelect('[data-signature-main-img]');
        const description = this.safeSelect('[data-signature-description]');
        const thumbnails = this.safeSelectAll('.signature-thumb');

        if (!mainImg || !description || thumbnails.length === 0) return;

        // 초기 활성 썸네일 설정
        thumbnails[0]?.classList.add('active');

        // 썸네일 클릭 이벤트
        thumbnails.forEach((thumb, index) => {
            if (!selectedImages[index]) return;

            thumb.addEventListener('click', () => {
                // 모든 썸네일에서 active 클래스 제거
                thumbnails.forEach(t => t.classList.remove('active'));

                // 클릭된 썸네일에 active 클래스 추가
                thumb.classList.add('active');

                const imgData = selectedImages[index];

                // 페이드 아웃
                mainImg.style.opacity = '0';

                setTimeout(() => {
                    // 이미지와 설명 변경
                    mainImg.src = imgData.url;
                    mainImg.alt = this.sanitizeText(imgData.description, 'Signature Image');
                    description.innerHTML = this._formatTextWithLineBreaks(imgData.description);

                    // 페이드 인
                    mainImg.style.opacity = '1';
                }, 250);
            });
        });
    }

    // ============================================================================
    // 🎯 HERO SECTION MAPPING
    // ============================================================================

    /**
     * Hero Section 매핑 (메인 소개 섹션)
     */
    mapHeroSection() {
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');
        if (!heroData) return;

        // 숙소 서브타이틀 매핑
        const subtitle = this.safeGet(this.data, 'property.subtitle');
        const subtitleElement = this.safeSelect('[data-hero-subtitle]');
        if (subtitleElement && subtitle) {
            subtitleElement.textContent = this.sanitizeText(subtitle);
        }

        // 숙소 영문명 매핑
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const heroPropertyNameEn = this.safeSelect('[data-hero-property-name-en]');
        if (heroPropertyNameEn && propertyNameEn) {
            heroPropertyNameEn.textContent = this.sanitizeText(propertyNameEn);
        }

        // 메인 소개 타이틀 매핑
        const heroTitleElement = this.safeSelect('[data-hero-title]');
        if (heroTitleElement) {
            heroTitleElement.textContent = this.sanitizeText(heroData?.title, '메인 히어로 타이틀');
        }

        // 메인 소개 설명 매핑
        const heroDescElement = this.safeSelect('[data-hero-description]');
        if (heroDescElement) {
            heroDescElement.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '메인 히어로 설명');
        }

        // 히어로 슬라이더 이미지 매핑
        if (heroData.images && Array.isArray(heroData.images)) {
            this.mapHeroSlider(heroData.images);
        }
    }

    /**
     * Hero Slider 이미지 매핑
     */
    mapHeroSlider(images) {
        const sliderContainer = this.safeSelect('[data-hero-slider]');
        if (!sliderContainer) return;

        // images가 문자열 배열인지 객체 배열인지 확인
        let selectedImages = [];
        if (images && images.length > 0) {
            if (typeof images[0] === 'string') {
                // demo-filled.json의 경우: 문자열 배열을 객체 배열로 변환
                selectedImages = images.map((imgUrl, index) => ({
                    url: imgUrl.replace('./', ''),
                    description: `Hero Image ${index + 1}`,
                    isSelected: true,
                    sortOrder: index + 1
                }));
            } else {
                // standard-template-data.json의 경우: isSelected가 true인 이미지만 필터링
                selectedImages = images
                    .filter(img => img.isSelected === true)
                    .sort((a, b) => a.sortOrder - b.sortOrder);
            }
        }

        // 슬라이더 초기화
        sliderContainer.innerHTML = '';

        if (selectedImages.length === 0) {
            // 이미지가 없을 경우 placeholder 슬라이드 추가
            const slideDiv = document.createElement('div');
            slideDiv.className = 'hero-slide active';

            const imgElement = document.createElement('img');
            // demo-filled.json일 때는 ImageHelpers 사용하지 않음
            if (this.dataSource === 'standard-template-data.json' && typeof ImageHelpers !== 'undefined') {
                if (typeof ImageHelpers !== 'undefined') ImageHelpers.applyPlaceholder(imgElement);
            }

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
            return;
        }

        // 이미지 생성
        selectedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'hero-slide';
            if (index === 0) {
                slideDiv.classList.add('active');
            }

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, '히어로 이미지');
            imgElement.loading = index === 0 ? 'eager' : 'lazy';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
        });
    }

    // ============================================================================
    // 💎 ESSENCE SECTION MAPPING
    // ============================================================================

    /**
     * Essence Section 매핑 (핵심 메시지 섹션)
     */
    mapEssenceSection() {
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (!essenceData) return;

        // 타이틀 매핑
        const titleElement = this.safeSelect('[data-essence-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(essenceData?.title, '특징 섹션 타이틀');
        }

        // 설명 매핑 (description이 images 다음에 오는 새로운 구조 지원)
        const descElement = this.safeSelect('[data-essence-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(essenceData?.description, '특징 섹션 설명');
        }

        // Essence 이미지 매핑 (배경 이미지나 메인 이미지가 있다면)
        const essenceImg = this.safeSelect('[data-essence-img]');
        if (essenceImg && essenceData.images && essenceData.images.length > 0) {
            // isSelected가 true인 첫 번째 이미지 사용
            const selectedImage = essenceData.images.find(img => img.isSelected === true) || essenceData.images[0];
            if (selectedImage) {
                essenceImg.src = selectedImage.url;
                essenceImg.alt = this.sanitizeText(selectedImage.description, '핵심 메시지 이미지');
            }
        }
    }

    // ============================================================================
    // ⭐ SIGNATURE SECTION MAPPING
    // ============================================================================

    /**
     * Signature Section 매핑 (특색 섹션)
     */
    mapSignatureSection() {
        const signatureData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.signature');
        if (!signatureData) return;

        // 타이틀 매핑
        const titleElement = this.safeSelect('[data-signature-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(signatureData?.title, '시그니처 섹션 타이틀');
        }

        // 메인 이미지 매핑
        const mainImg = this.safeSelect('[data-signature-main-img]');
        if (mainImg) {
            if (typeof ImageHelpers !== 'undefined') ImageHelpers.applyImageOrPlaceholder(mainImg, signatureData.images);
        }

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = signatureData.images && Array.isArray(signatureData.images)
            ? signatureData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        // 메인 이미지 설명 매핑 (이미지 없어도 fallback 텍스트 보여주기)
        const descElement = this.safeSelect('[data-signature-description]');
        if (descElement) {
            const descriptionText = selectedImages.length > 0 && selectedImages[0].description
                ? selectedImages[0].description
                : '이미지 설명';
            descElement.innerHTML = this._formatTextWithLineBreaks(descriptionText);
        }

        // 썸네일 이미지들 매핑 (이미지 없어도 placeholder 적용 위해 항상 호출)
        this.mapSignatureThumbnails(selectedImages.slice(0, 4));
    }

    /**
     * Signature 썸네일 이미지 매핑
     */
    mapSignatureThumbnails(images) {
        const thumbnails = this.safeSelectAll('.signature-thumb');

        thumbnails.forEach((thumb, index) => {
            const img = thumb.querySelector('img');
            if (!img) return;

            if (images[index]) {
                img.src = images[index].url;
                img.alt = this.sanitizeText(images[index].description, `Signature Thumbnail ${index + 1}`);
                img.classList.remove('empty-image-placeholder');
                thumb.setAttribute('data-index', index);
            } else {
                // 이미지가 없을 경우 placeholder 적용
                if (typeof ImageHelpers !== 'undefined') ImageHelpers.applyPlaceholder(img);
            }
        });
    }

    // ============================================================================
    // 🖼️ GALLERY SECTION MAPPING
    // ============================================================================

    /**
     * Gallery Section 매핑 (갤러리 섹션) - DISABLED
     * Gallery is now handled entirely by index.js
     */
    mapGallerySection() {
        // Gallery section is now handled by index.js
        // This function is kept empty to prevent conflicts
        return;
    }

    // ============================================================================
    // 🎬 CLOSING SECTION MAPPING
    // ============================================================================

    /**
     * Closing Section 매핑 (마무리 섹션)
     */
    mapClosingSection() {
        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');
        if (!closingData) return;

        // 배경 이미지 매핑
        const bgImg = this.safeSelect('[data-closing-bg-img]');
        if (bgImg) {
            if (typeof ImageHelpers !== 'undefined') ImageHelpers.applyImageOrPlaceholder(bgImg, closingData.images);
        }

        // 설명 매핑
        const descElement = this.safeSelect('[data-closing-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(closingData?.description, '마무리 섹션 설명');
        }

        // 숙소 영문명 매핑
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const closingTitle = this.safeSelect('[data-closing-title]');
        if (closingTitle && propertyNameEn) {
            closingTitle.textContent = this.sanitizeText(propertyNameEn);
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new IndexMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}
