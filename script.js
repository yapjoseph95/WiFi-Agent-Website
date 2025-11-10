const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOTVs6sipqe6stetdKJqV4AkKRFbkErcOnFmBRkFrDE8saR3MxDQ6ebRPXgDNe9PjJ/exec'; // 您的 Google Apps Script Web 应用 URL

// Carousel 功能
let currentSlide = 0;
let autoSlideInterval;

// 初始化 carousel
function initCarousel() {
    const carouselContainer = document.getElementById('carouselContainer');
    if (!carouselContainer) return; // 如果不在首页，退出

    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    // 初始化 dots
    const dotsContainer = document.getElementById('carouselDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }

    // 开始自动播放
    resetAutoSlide();
}

function updateCarousel() {
    const container = document.getElementById('carouselContainer');
    if (!container) return;

    container.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // 更新 dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;
    updateCarousel();
    resetAutoSlide();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoSlide();
}

function autoSlide() {
    moveCarousel(1);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(autoSlide, 5000);
}

// FAQ 折叠功能
function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-icon');
    
    answer.classList.toggle('active');
    icon.classList.toggle('active');
}

// 证件类型切换功能
function toggleIdFields() {
    const idType = document.getElementById('idType').value;
    const icUploadSection = document.getElementById('icUploadSection');
    const passportUploadSection = document.getElementById('passportUploadSection');
    const icNumberGroup = document.getElementById('icNumberGroup');
    const passportNumberGroup = document.getElementById('passportNumberGroup');
    
    // 重置所有字段
    icUploadSection.classList.add('hidden');
    passportUploadSection.classList.add('hidden');
    icNumberGroup.style.display = 'none';
    passportNumberGroup.style.display = 'none';
    
    // 清除必填要求
    document.getElementById('icFront').removeAttribute('required');
    document.getElementById('icBack').removeAttribute('required');
    document.getElementById('passportPhoto').removeAttribute('required');
    document.getElementById('icNumber').removeAttribute('required');
    document.getElementById('passportNumber').removeAttribute('required');
    
    // 根据选择显示对应字段
    if (idType === 'ic') {
        icUploadSection.classList.remove('hidden');
        icNumberGroup.style.display = 'block';
        document.getElementById('icFront').setAttribute('required', 'required');
        document.getElementById('icBack').setAttribute('required', 'required');
        document.getElementById('icNumber').setAttribute('required', 'required');
    } else if (idType === 'passport') {
        passportUploadSection.classList.remove('hidden');
        passportNumberGroup.style.display = 'block';
        document.getElementById('passportPhoto').setAttribute('required', 'required');
        document.getElementById('passportNumber').setAttribute('required', 'required');
    }
}

// 文件上传显示文件名
function setupFileInput(inputId, infoId) {
    const input = document.getElementById(inputId);
    const info = document.getElementById(infoId);
    
    if (!input || !info) return;
    
    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            const fileSize = (this.files[0].size / 1024 / 1024).toFixed(2);
            info.textContent = `✓ ${fileName} (${fileSize} MB)`;
            info.style.color = '#4caf50';
        }
    });
}

// 表单提交
function setupFormSubmit() {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const successMsg = document.getElementById('successMessage');
        const errorMsg = document.getElementById('errorMessage');
        
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
        
        try {
            const formData = new FormData(this);
            
            const response = await fetch(APP_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();

            if (result.success) {
                successMsg.style.display = 'block';
                errorMsg.style.display = 'none';
                this.reset();
                
                // 重置文件上传显示
                const fileInfos = ['icFrontInfo', 'icBackInfo', 'passportPhotoInfo', 'billInfo'];
                fileInfos.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = '支持 JPG, PNG, PDF (最大 10MB)';
                        element.style.color = '#666';
                    }
                });
                
                // 重置证件选择
                document.getElementById('icUploadSection').classList.add('hidden');
                document.getElementById('passportUploadSection').classList.add('hidden');
                document.getElementById('icNumberGroup').style.display = 'none';
                document.getElementById('passportNumberGroup').style.display = 'none';
                
                // 滚动到成功消息
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                errorMsg.textContent = '❌ 提交失败：' + result.message;
                errorMsg.style.display = 'block';
                successMsg.style.display = 'none';
                errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
        } catch (error) {
            errorMsg.textContent = '❌ 提交失败，请稍后再试。错误信息：' + error.message;
            errorMsg.style.display = 'block';
            successMsg.style.display = 'none';
            errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交注册';
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 carousel（仅在首页）
    initCarousel();
    
    // 设置文件上传
    setupFileInput('icFront', 'icFrontInfo');
    setupFileInput('icBack', 'icBackInfo');
    setupFileInput('passportPhoto', 'passportPhotoInfo');
    setupFileInput('bill', 'billInfo');
    
    // 设置表单提交
    setupFormSubmit();
});