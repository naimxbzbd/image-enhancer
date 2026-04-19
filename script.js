// Global Variables
let originalImage = null;
let enhancedImage = null;
let originalCanvas = null;
let enhancedCanvas = null;
let currentFilter = 'none';
let currentPreset = 'auto';
let isProcessing = false;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadSection = document.getElementById('uploadSection');
const editorSection = document.getElementById('editorSection');
const originalImageEl = document.getElementById('originalImage');
const enhancedImageEl = document.getElementById('enhancedImage');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressBar = document.getElementById('progressBar');
const loadingStatus = document.getElementById('loadingStatus');
const applyEnhanceBtn = document.getElementById('applyEnhanceBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const newImageBtn = document.getElementById('newImageBtn');
const comparisonSlider = document.getElementById('comparisonSlider');
const sliderHandle = document.getElementById('sliderHandle');

// Camera Elements
const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');

// Control Elements
const upscaleSlider = document.getElementById('upscaleSlider');
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const saturationSlider = document.getElementById('saturationSlider');
const sharpnessSlider = document.getElementById('sharpnessSlider');
const denoiseSlider = document.getElementById('denoiseSlider');

// Value Displays
const upscaleValue = document.getElementById('upscaleValue');
const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');
const saturationValue = document.getElementById('saturationValue');
const sharpnessValue = document.getElementById('sharpnessValue');
const denoiseValue = document.getElementById('denoiseValue');

// Initialize Event Listeners
function initEventListeners() {
    // File Upload
    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and Drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Slider Value Updates
    upscaleSlider.addEventListener('input', updateSliderValues);
    brightnessSlider.addEventListener('input', updateSliderValues);
    contrastSlider.addEventListener('input', updateSliderValues);
    saturationSlider.addEventListener('input', updateSliderValues);
    sharpnessSlider.addEventListener('input', updateSliderValues);
    denoiseSlider.addEventListener('input', updateSliderValues);
    
    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
    
    // Action Buttons
    applyEnhanceBtn.addEventListener('click', applyEnhancement);
    downloadBtn.addEventListener('click', downloadEnhancedImage);
    resetBtn.addEventListener('click', resetEnhancement);
    newImageBtn.addEventListener('click', startNewImage);
    
    // Camera
    cameraBtn.addEventListener('click', openCamera);
    captureBtn.addEventListener('click', capturePhoto);
    closeCameraBtn.addEventListener('click', closeCamera);
    
    // Comparison Slider
    initComparisonSlider();
}

// Handle File Selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processUploadedFile(file);
    }
}

// Process Uploaded File
function processUploadedFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayOriginalImage(img);
            showEditor();
            // Auto-enhance on upload
            setTimeout(() => applyEnhancement(), 500);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Display Original Image
function displayOriginalImage(img) {
    originalImageEl.src = img.src;
    
    // Create canvases for processing
    originalCanvas = document.createElement('canvas');
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    const ctx = originalCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    enhancedCanvas = document.createElement('canvas');
    enhancedCanvas.width = img.width;
    enhancedCanvas.height = img.height;
}

// Show Editor Section
function showEditor() {
    uploadSection.style.display = 'none';
    editorSection.style.display = 'block';
    comparisonSlider.classList.add('active');
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragging');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processUploadedFile(file);
    }
}

// Update Slider Values
function updateSliderValues() {
    upscaleValue.textContent = upscaleSlider.value + 'x';
    brightnessValue.textContent = brightnessSlider.value;
    contrastValue.textContent = contrastSlider.value;
    saturationValue.textContent = saturationSlider.value;
    sharpnessValue.textContent = sharpnessSlider.value;
    denoiseValue.textContent = denoiseSlider.value;
}

// Apply Preset
function applyPreset(preset) {
    currentPreset = preset;
    
    // Update active state
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === preset) {
            btn.classList.add('active');
        }
    });
    
    // Apply preset values
    switch(preset) {
        case 'auto':
            brightnessSlider.value = 0;
            contrastSlider.value = 10;
            saturationSlider.value = 10;
            sharpnessSlider.value = 30;
            denoiseSlider.value = 20;
            break;
        case 'portrait':
            brightnessSlider.value = 10;
            contrastSlider.value = 5;
            saturationSlider.value = 15;
            sharpnessSlider.value = 40;
            denoiseSlider.value = 30;
            break;
        case 'landscape':
            brightnessSlider.value = 5;
            contrastSlider.value = 20;
            saturationSlider.value = 25;
            sharpnessSlider.value = 50;
            denoiseSlider.value = 10;
            break;
        case 'lowlight':
            brightnessSlider.value = 30;
            contrastSlider.value = 15;
            saturationSlider.value = 10;
            sharpnessSlider.value = 20;
            denoiseSlider.value = 40;
            break;
    }
    
    updateSliderValues();
    applyEnhancement();
}

// Apply Filter
function applyFilter(filter) {
    currentFilter = filter;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    applyEnhancement();
}

// Main Enhancement Function
function applyEnhancement() {
    if (!originalImage || isProcessing) return;
    
    isProcessing = true;
    showLoading(true);
    
    // Simulate processing with progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressBar.style.width = progress + '%';
        
        if (progress < 30) {
            loadingStatus.textContent = 'Analyzing image...';
        } else if (progress < 60) {
            loadingStatus.textContent = 'Applying enhancements...';
        } else if (progress < 90) {
            loadingStatus.textContent = 'Upscaling details...';
        } else {
            loadingStatus.textContent = 'Finalizing...';
        }
    }, 200);
    
    // Use setTimeout to allow UI updates
    setTimeout(() => {
        performEnhancement();
        clearInterval(interval);
        progressBar.style.width = '100%';
        loadingStatus.textContent = 'Complete!';
        
        setTimeout(() => {
            showLoading(false);
            isProcessing = false;
        }, 500);
    }, 1500);
}

// Perform Actual Enhancement
function performEnhancement() {
    const ctx = enhancedCanvas.getContext('2d');
    const scale = parseFloat(upscaleSlider.value);
    
    // Set canvas size with upscaling
    enhancedCanvas.width = originalCanvas.width * scale;
    enhancedCanvas.height = originalCanvas.height * scale;
    
    // Draw original image scaled
    ctx.drawImage(originalCanvas, 0, 0, enhancedCanvas.width, enhancedCanvas.height);
    
    // Apply image processing
    let imageData = ctx.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
    const data = imageData.data;
    
    // Get enhancement values
    const brightness = parseInt(brightnessSlider.value);
    const contrast = parseInt(contrastSlider.value);
    const saturation = parseInt(saturationSlider.value);
    const sharpness = parseInt(sharpnessSlider.value) / 100;
    const denoise = parseInt(denoiseSlider.value) / 100;
    
    // Apply enhancements
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Apply brightness
        r += brightness * 2.55;
        g += brightness * 2.55;
        b += brightness * 2.55;
        
        // Apply contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
        
        // Apply saturation
        if (saturation !== 0) {
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            const satFactor = 1 + (saturation / 100);
            r = gray + satFactor * (r - gray);
            g = gray + satFactor * (g - gray);
            b = gray + satFactor * (b - gray);
        }
        
        // Apply AI-like sharpening (simplified)
        if (sharpness > 0 && i % 16 === 0) {
            r = Math.min(255, r * (1 + sharpness * 0.5));
            g = Math.min(255, g * (1 + sharpness * 0.5));
            b = Math.min(255, b * (1 + sharpness * 0.5));
        }
        
        // Apply denoise (simplified blur effect)
        if (denoise > 0 && i % 20 === 0) {
            const avg = (r + g + b) / 3;
            r = r * (1 - denoise * 0.3) + avg * denoise * 0.3;
            g = g * (1 - denoise * 0.3) + avg * denoise * 0.3;
            b = b * (1 - denoise * 0.3) + avg * denoise * 0.3;
        }
        
        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    // Apply sharpening using convolution (simplified)
    if (sharpness > 0.1) {
        applySharpening(imageData, sharpness);
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply filters
    applyImageFilter(ctx);
    
    // Update enhanced image display
    enhancedImageEl.src = enhancedCanvas.toDataURL('image/jpeg', 0.95);
}

// Apply Sharpening
function applySharpening(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(data);
    
    const kernel = [
        0, -1, 0,
        -1, 5 + strength * 2, -1,
        0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
                    
                    r += tempData[idx] * kVal;
                    g += tempData[idx + 1] * kVal;
                    b += tempData[idx + 2] * kVal;
                }
            }
            
            const idx = (y * width + x) * 4;
            data[idx] = Math.max(0, Math.min(255, r));
            data[idx + 1] = Math.max(0, Math.min(255, g));
            data[idx + 2] = Math.max(0, Math.min(255, b));
        }
    }
}

// Apply Image Filter
function applyImageFilter(ctx) {
    if (currentFilter === 'none') return;
    
    const imageData = ctx.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        switch(currentFilter) {
            case 'vivid':
                data[i] = Math.min(255, r * 1.2);
                data[i + 1] = Math.min(255, g * 1.1);
                data[i + 2] = Math.min(255, b * 1.3);
                break;
            case 'warm':
                data[i] = Math.min(255, r * 1.2);
                data[i + 1] = Math.min(255, g * 1.1);
                data[i + 2] = Math.max(0, b * 0.8);
                break;
            case 'cool':
                data[i] = Math.max(0, r * 0.9);
                data[i + 1] = Math.min(255, g * 1.1);
                data[i + 2] = Math.min(255, b * 1.2);
                break;
            case 'bw':
                const gray = (r + g + b) / 3;
                data[i] = data[i + 1] = data[i + 2] = gray;
                break;
            case 'sepia':
                data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131));
                break;
            case 'dramatic':
                const avg = (r + g + b) / 3;
                data[i] = avg > 128 ? Math.min(255, r * 1.3) : Math.max(0, r * 0.7);
                data[i + 1] = avg > 128 ? Math.min(255, g * 1.3) : Math.max(0, g * 0.7);
                data[i + 2] = avg > 128 ? Math.min(255, b * 1.3) : Math.max(0, b * 0.7);
                break;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Show/Hide Loading
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
        progressBar.style.width = '0%';
        loadingStatus.textContent = 'Starting...';
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Download Enhanced Image
function downloadEnhancedImage() {
    if (!enhancedImageEl.src) return;
    
    const link = document.createElement('a');
    link.download = 'enhanced-image.jpg';
    link.href = enhancedImageEl.src;
    link.click();
}

// Reset Enhancement
function resetEnhancement() {
    // Reset sliders to default
    upscaleSlider.value = 2;
    brightnessSlider.value = 0;
    contrastSlider.value = 0;
    saturationSlider.value = 0;
    sharpnessSlider.value = 30;
    denoiseSlider.value = 20;
    
    // Reset filter
    currentFilter = 'none';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'none') {
            btn.classList.add('active');
        }
    });
    
    // Reset preset
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === 'auto') {
            btn.classList.add('active');
        }
    });
    
    updateSliderValues();
    
    // Reset enhanced image to original
    const ctx = enhancedCanvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0, enhancedCanvas.width, enhancedCanvas.height);
    enhancedImageEl.src = originalImageEl.src;
}

// Start New Image
function startNewImage() {
    editorSection.style.display = 'none';
    uploadSection.style.display = 'block';
    comparisonSlider.classList.remove('active');
    
    // Reset variables
    originalImage = null;
    enhancedImage = null;
    fileInput.value = '';
}

// Camera Functions
async function openCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        cameraVideo.srcObject = stream;
        cameraModal.classList.add('active');
    } catch (error) {
        alert('Unable to access camera: ' + error.message);
    }
}

function capturePhoto() {
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    const ctx = cameraCanvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0);
    
    // Convert to image
    const img = new Image();
    img.onload = () => {
        originalImage = img;
        displayOriginalImage(img);
        closeCamera();
        showEditor();
        setTimeout(() => applyEnhancement(), 500);
    };
    img.src = cameraCanvas.toDataURL('image/jpeg');
}

function closeCamera() {
    const stream = cameraVideo.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    cameraVideo.srcObject = null;
    cameraModal.classList.remove('active');
}

// Comparison Slider
function initComparisonSlider() {
    let isDragging = false;
    
    sliderHandle.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);
    
    // Touch events
    sliderHandle.addEventListener('touchstart', startDragging);
    window.addEventListener('touchmove', drag);
    window.addEventListener('touchend', stopDragging);
    
    function startDragging(e) {
        isDragging = true;
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const container = document.querySelector('.comparison-container');
        const rect = container.getBoundingClientRect();
        
        let clientX;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
        } else {
            clientX = e.touches[0].clientX;
        }
        
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        
        const percentage = (x / rect.width) * 100;
        comparisonSlider.style.left = percentage + '%';
        
        // Clip the after image
        const afterBox = document.querySelector('.after-box .image-wrapper');
        afterBox.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }
    
    function stopDragging() {
        isDragging = false;
    }
    
    // Initialize slider position
    comparisonSlider.style.left = '50%';
    document.querySelector('.after-box .image-wrapper').style.clipPath = 'inset(0 50% 0 0)';
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E to enhance
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (editorSection.style.display === 'block') {
            applyEnhancement();
        }
    }
    
    // Ctrl/Cmd + S to download
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editorSection.style.display === 'block') {
            downloadEnhancedImage();
        }
    }
    
    // Escape to close camera
    if (e.key === 'Escape' && cameraModal.classList.contains('active')) {
        closeCamera();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateSliderValues();
    
    // Check for WebGL support for better performance
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported. Some features may be slower.');
    }
});

// Handle window resize for responsive comparison slider
window.addEventListener('resize', () => {
    if (editorSection.style.display === 'block') {
        const percentage = parseFloat(comparisonSlider.style.left) || 50;
        document.querySelector('.after-box .image-wrapper').style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }
});
