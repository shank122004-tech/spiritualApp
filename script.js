// script.js
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnS2NCgBvbGWroC2dSzJK0rGCAzpctkfo",
    authDomain: "naam-jap-d12aa.firebaseapp.com",
    projectId: "naam-jap-d12aa",
    storageBucket: "naam-jap-d12aa.firebasestorage.app",
    messagingSenderId: "113108846084",
    appId: "1:113108846084:web:397c7c3e2f2f45a2709751",
    measurementId: "G-04K4HSHJGT"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.log('Firebase already initialized');
}
const auth = firebase.auth();
// ===============================
// KARMA SYSTEM STORAGE
// ===============================
if (!localStorage.getItem("karmaPoints")) {
    localStorage.setItem("karmaPoints", "0");
}
if (!localStorage.getItem("karmaLevel")) {
    localStorage.setItem("karmaLevel", "1");
}
// ===============================
// ADD KARMA POINTS
// ===============================
function addKarma(points) {
    let karma = Number(localStorage.getItem("karmaPoints"));
    karma += points;
    localStorage.setItem("karmaPoints", karma);

    updateKarmaLevel();
    updateKarmaUI();
    updateDynamicAura();

}
function updateDynamicAura() {
    const aura = document.getElementById("dynamicAura");
    let level = Number(localStorage.getItem("karmaLevel"));

    aura.className = "god-aura"; // reset classes

    if (level < 5) aura.classList.add("aura-level-1");
    else if (level < 10) aura.classList.add("aura-level-2");
    else if (level < 20) aura.classList.add("aura-level-3");
    else if (level < 35) aura.classList.add("aura-level-4");
    else if (level < 50) aura.classList.add("aura-level-5");
    else aura.classList.add("aura-level-6");
}

// Each 500 points = 1 Level
function updateKarmaLevel() {
    let karma = Number(localStorage.getItem("karmaPoints"));
    let level = Math.floor(karma / 500) + 1;
    localStorage.setItem("karmaLevel", level);
}
function getKarmaTitle(level) {
    if (level < 5) return "🟢 Devotee";
    if (level < 10) return "🔵 Bhakt";
    if (level < 20) return "🟣 Yogi";
    if (level < 35) return "🟠 Divine Soul";
    if (level < 50) return "🔱 Mahadev Bhakt";
    return "🌟 Enlightened One";
}

// ===========================================================
// INDEXEDDB: PERMANENT GLB STORAGE SYSTEM
// ===========================================================
/**********************************
  INDEXEDDB: PERMANENT GLB STORAGE
**********************************/

function openGLBDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("GLB_STORAGE_DB", 1);

        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains("glbFiles")) {
                db.createObjectStore("glbFiles", { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveGLB_InIDB(key, fileBlob) {
    const db = await openGLBDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("glbFiles", "readwrite");
        const store = tx.objectStore("glbFiles");
        store.put({ key, blob: fileBlob, time: Date.now() });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function loadGLB_FromIDB(key) {
    const db = await openGLBDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("glbFiles", "readonly");
        const store = tx.objectStore("glbFiles");

        const req = store.get(key);
        req.onsuccess = () => {
            if (req.result) resolve(req.result.blob);
            else resolve(null);
        };
        req.onerror = () => reject(req.error);
    });
}

async function deleteGLB_FromIDB(key) {
    const db = await openGLBDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("glbFiles", "readwrite");
        tx.objectStore("glbFiles").delete(key);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function uploadGLB_and_Save(key, file, viewerID) {
    try {
        // Save blob permanently in IDB
        await saveGLB_InIDB(key, file);

        // Convert to temporary blob URL for display
        const blobURL = URL.createObjectURL(file);

        // Set inside model-viewer
        const viewer = document.getElementById(viewerID);
        if (viewer) {
            viewer.setAttribute("src", blobURL);
        }

        // Save key reference in localStorage for easy loading
        const activeModels = JSON.parse(localStorage.getItem('activeGLBModels') || '{}');
        activeModels[viewerID] = key;
        localStorage.setItem('activeGLBModels', JSON.stringify(activeModels));

        showMessage("Your 3D model is saved permanently!", 'success');
        return true;
    } catch (error) {
        console.error('Error uploading GLB:', error);
        showMessage('Error saving 3D model. Please try again.', 'error');
        return false;
    }
}

async function loadGLB_onStart(viewerID, defaultKey = null) {
    try {
        // Get the key from localStorage
        const activeModels = JSON.parse(localStorage.getItem('activeGLBModels') || '{}');
        const key = activeModels[viewerID] || defaultKey;
        
        if (!key) return false;

        const blob = await loadGLB_FromIDB(key);
        if (!blob) return false;

        const url = URL.createObjectURL(blob);
        const viewer = document.getElementById(viewerID);
        if (viewer) {
            viewer.setAttribute("src", url);
        }
        return true;
    } catch (error) {
        console.error('Error loading GLB:', error);
        return false;
    }
}

async function clearAllGLBStorage() {
    try {
        const db = await openGLBDatabase();
        const tx = db.transaction("glbFiles", "readwrite");
        const store = tx.objectStore("glbFiles");
        store.clear();
        
        localStorage.removeItem('activeGLBModels');
        showMessage('All 3D models cleared successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error clearing GLB storage:', error);
        showMessage('Error clearing 3D models.', 'error');
        return false;
    }
}

// ===========================================================
// UPI PAYMENT CONFIGURATION
// ===========================================================

// UPI Configuration - EDIT THIS WITH YOUR UPI ID
const UPI_CONFIG = {
    // Replace 'your-upi-id@okaxis' with your actual UPI ID
    upiId: '9310365058-2@ibl',
    appName: 'Divine Mantra',
    currency: 'INR'
};

// Demo credentials for testing
const DEMO_EMAIL = "demo@divinemantra.com";
const DEMO_PASSWORD = "demo123";

// ===========================================================
// APP STATE
// ===========================================================

let currentUser = null;
let japCount = 0;
let malaCount = 0;
let currentBead = 1;
let sessionJapCount = 0;
let isHandFreeMode = false;
let handFreeInterval = null;
let lastJapTime = 0;
let japTimes = [];
let touchTrailCtx = null;
let lastTouch = null;
let isChakraMode = false;
let isMandalaMode = false;
let selectedGodName = "Shiva";

// Enhanced GLB Storage System Keys
const GLB_STORAGE_KEYS = {
    HOME_BG: 'homeBG',
    JAP_BG: 'japBG',
    JAP_STATIC_BG: 'japStaticBG',
    MANDIR_GOD: 'mandirGod',
    MANDIR_BG: 'mandirBG',
    DECORATIONS: 'decoration'
};

// Premium Themes with pricing
const PREMIUM_THEMES = {
    'mahadev': { price: 0, name: 'Mahadev', unlocked: true },
    'krishna': { price: 99, name: 'Krishna', unlocked: false },
    'golden': { price: 99, name: 'Golden', unlocked: false },
    'vishnu': { price: 99, name: 'Vishnu', unlocked: false },
    'durga': { price: 99, name: 'Durga', unlocked: false },
    'ganesha': { price: 99, name: 'Ganesha', unlocked: false },
    'hanuman': { price: 99, name: 'Hanuman', unlocked: false },
    'saraswati': { price: 99, name: 'Saraswati', unlocked: false },
    'lakshmi': { price: 99, name: 'Lakshmi', unlocked: false },
    'radha': { price: 99, name: 'Radha', unlocked: false },
    'kubera': { price: 99, name: 'Kubera', unlocked: false },
    'brahma': { price: 99, name: 'Brahma', unlocked: false },
    'kartikeya': { price: 99, name: 'Kartikeya', unlocked: false },
    'surya': { price: 99, name: 'Surya', unlocked: false },
    'indra': { price: 99, name: 'Indra', unlocked: false },
    'yama': { price: 99, name: 'Yama', unlocked: false },
    'varuna': { price: 99, name: 'Varuna', unlocked: false },
    'vayu': { price: 99, name: 'Vayu', unlocked: false },
    'agni': { price: 99, name: 'Agni', unlocked: false }
};

// Mandir State
let isMandirOpen = false;
let activeDecorations = new Set();
let activeOfferings = new Set();
let interactiveDecorations = [];
let selectedDecoration = null;
let isDraggingDecoration = false;
let currentDecorationElement = null;
let startX = 0, startY = 0;
let initialX = 0, initialY = 0;
let currentScale = 1;
let currentRotation = 0;
let isPinching = false;
let initialDistance = 0;

// Background Edit Mode
let isBackgroundEditMode = false;
let backgroundElement = null;
let backgroundStartX = 0, backgroundStartY = 0;
let backgroundInitialX = 0, backgroundInitialY = 0;
let backgroundScale = 1;
let backgroundRotation = 0;
let isBackgroundDragging = false;

// Spiritual Offering Items
const spiritualOfferings = [
    { id: 'flowers', name: 'Flowers', icon: '🌸', type: 'flowers' },
    { id: 'diya', name: 'Diya', icon: '🪔', type: 'diya' },
   
    { id: 'fruits', name: 'Fruits', icon: '🍎', type: 'fruits' },
   
    { id: 'water', name: 'Holy Water', icon: '💧', type: 'water' },
    
    { id: 'honey', name: 'Honey', icon: '🍯', type: 'honey' },
    
    { id: 'coconut', name: 'Coconut', icon: '🥥', type: 'coconut' },
   
];

// Premium Decoration Items
const premiumDecorations = [
    { id: 'flowers', name: 'Flowers', icon: '💐', type: 'flowers' },
   
    { id: 'bells', name: 'Bells', icon: '🔔', type: 'bells' },
   
    
  
    { id: 'kalash', name: 'Kalash', icon: '🏺', type: 'kalash' }
];

// ===========================================================
// DOM ELEMENTS
// ===========================================================

const screens = document.querySelectorAll('.screen');
const splashScreen = document.getElementById('splash');
const loginScreen = document.getElementById('login');
const homeScreen = document.getElementById('home');
const japScreen = document.getElementById('jap');
const japTouchArea = document.getElementById('jap-touch-area');
const touchTrail = document.getElementById('touch-trail');
const floatingBlessings = document.getElementById('floating-blessings');
const floatingBlessingsJap = document.getElementById('floating-blessings-jap');
const achievementAnimations = document.getElementById('achievement-animations');
const lotusPetals = document.getElementById('lotus-petals');
const godNameAnimation = document.getElementById('god-name-animation');
const speedIndicator = document.getElementById('speed-indicator');
const speedBar = document.querySelector('.speed-bar');
const speedText = document.getElementById('speed-text');
const accuracyValue = document.getElementById('accuracy-value');
const karmaNeedle = document.getElementById('karma-needle');
const currentMantraDisplay = document.getElementById('current-mantra-display');

// Mandir Elements
const fullscreenMandir = document.getElementById('fullscreen-mandir');
const mandirMainGod = document.getElementById('mandir-main-god');
const mandirAnimations = document.getElementById('mandir-animations');
const mandirBackground = document.getElementById('mandir-bg-static');
const interactiveDecorationsContainer = document.getElementById('interactive-decorations');
const deleteZone = document.getElementById('delete-zone');
const sunkhMenu = document.getElementById('sunkh-menu');
const backgroundEditControls = document.getElementById('background-edit-controls');
const backgroundEditBtn = document.getElementById('background-edit-btn');

// Panel Elements
const uploadGodPanel = document.getElementById('upload-god-panel');
const offeringPanel = document.getElementById('offering-panel');
const decorationPanel = document.getElementById('decoration-panel');
const customDecorationPanel = document.getElementById('custom-decoration-panel');
const mandirBackgroundPanel = document.getElementById('mandir-background-panel');
const glbManagementPanel = document.getElementById('glb-management-panel');

// 3D Model Elements
const homeBGModel = document.getElementById('home-bg-model');
const japBGModel = document.getElementById('jap-god-model');
const japStaticBG = document.getElementById('jap-bg-static');

// Payment Elements
const upiSuccessModal = document.getElementById('upi-success-modal');

// File Inputs
const profilePicInput = document.getElementById('profile-pic-input');
const godUploadInput = document.getElementById('god-upload-input');
const mandirBgUpload = document.getElementById('mandir-bg-upload');
const customDecorationUpload = document.getElementById('custom-decoration-upload');
const glbUploadInput = document.getElementById('glb-upload-input');

// Current GLB management context
let currentGLBContext = 'home';

// ===========================================================
// INITIALIZE APP
// ===========================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startSplashAnimation();
    populatePremiumItems();
    updateKarmaUI();
    updateDynamicAura();

    addKarma(2); // +2 per jap
addKarma(10);
addKarma(15);
addKarma(20);

function updateKarmaUI() {
    let karma = localStorage.getItem("karmaPoints");
    let level = localStorage.getItem("karmaLevel");
    let title = getKarmaTitle(Number(level));

    document.getElementById("karmaValue").innerText = karma;
    document.getElementById("karmaLevelText").innerText = `Level ${level} – ${title}`;
}

    // Auto-fill demo credentials for testing
    setTimeout(() => {
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const signupEmail = document.getElementById('signupEmail');
        const signupPassword = document.getElementById('signupPassword');
        const signupConfirm = document.getElementById('signupConfirm');
        
        if (loginEmail) loginEmail.value = DEMO_EMAIL;
        if (loginPassword) loginPassword.value = DEMO_PASSWORD;
        if (signupEmail) signupEmail.value = DEMO_EMAIL;
        if (signupPassword) signupPassword.value = DEMO_PASSWORD;
        if (signupConfirm) signupConfirm.value = DEMO_PASSWORD;
    }, 1000);
});

function initializeApp() {
    // Load user data from localStorage
    japCount = parseInt(localStorage.getItem('totalJapCount')) || 0;
    malaCount = parseInt(localStorage.getItem('totalMalaCount')) || 0;
    currentBead = parseInt(localStorage.getItem('currentBead')) || 1;
    selectedGodName = localStorage.getItem('selectedGodName') || 'Shiva';
    
    // Load premium themes status
    loadPremiumThemes();
    
    // Load interactive decorations
    loadInteractiveDecorations();
    
    // Load profile data
    loadProfileData();
    
    // Load GLB models using IndexedDB
    loadAllGLBModels();
    
    // Setup touch trail canvas
    if (touchTrail) {
        touchTrail.width = touchTrail.offsetWidth;
        touchTrail.height = touchTrail.offsetHeight;
        touchTrailCtx = touchTrail.getContext('2d');
        touchTrailCtx.strokeStyle = '#ffd700';
        touchTrailCtx.lineWidth = 3;
        touchTrailCtx.lineCap = 'round';
        touchTrailCtx.lineJoin = 'round';
        touchTrailCtx.globalCompositeOperation = 'lighter';
    }
    
    // Update UI
    updateCounters();
    updateKarmaMeter();
    loadTheme();
    
    // Setup Firebase auth state listener
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            restorePurchases();

            console.log('User signed in:', user.email);
            setTimeout(() => {
                showScreen('home');
            }, 3000);
        } else {
            console.log('User signed out');
            setTimeout(() => {
                showScreen('login');
            }, 3000);
        }
    }, (error) => {
        console.error('Auth state change error:', error);
    });
}

// ===========================================================
// UPI PAYMENT SYSTEM
// ===========================================================

/**
 * REAL UPI PAYMENT FUNCTION
 * 
 * How to set up:
 * 1. Replace 'your-upi-id@okaxis' in UPI_CONFIG with your actual UPI ID
 * 2. Test with UPI apps like Google Pay, PhonePe, Paytm, BHIM
 * 3. Make sure your UPI ID is active and can receive payments
 */
function payUsingUPI(themeName, amount) {
    if (PREMIUM_THEMES[themeName].unlocked) {
        changeTheme(themeName);
        return;
    }
    
    // Create UPI deep link
    // IMPORTANT: Replace 'your-upi-id@okaxis' with your actual UPI ID
    const upiId = UPI_CONFIG.upiId; // Change this to your UPI ID
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(UPI_CONFIG.appName)}&am=${amount}&cu=${UPI_CONFIG.currency}&tn=${encodeURIComponent(`Theme: ${PREMIUM_THEMES[themeName].name}`)}`;
    
    // Show payment instruction
    showMessage(`Opening UPI app... Complete payment of ₹${amount}`, 'info', 5000);
    
    // Try to open UPI app
    setTimeout(() => {
        window.location.href = upiLink;
        
        // After 5 seconds, check if user completed payment
        setTimeout(() => {
            checkPaymentConfirmation(themeName, amount);
        }, 5000);
    }, 1000);
}

function checkPaymentConfirmation(themeName, amount) {
    // Show confirmation dialog
    const userConfirmed = confirm(`Did you complete the payment of ₹${amount} for ${PREMIUM_THEMES[themeName].name} theme?\n\nClick OK if payment was successful, Cancel if failed.`);
    
    if (userConfirmed) {
        handlePaymentSuccess(themeName);
    } else {
        showMessage('Payment cancelled or failed. Please try again.', 'error');
    }
}

function handlePaymentSuccess(themeName) {
    // Unlock the theme
    PREMIUM_THEMES[themeName].unlocked = true;
    savePremiumThemes();
    updateThemeUI();
    
    // Save payment record
    savePaymentRecord(themeName);
    
    // Apply theme and show success
    changeTheme(themeName);
    showUPISuccessModal(themeName);
    
    showMessage(`🎉 ${PREMIUM_THEMES[themeName].name} theme unlocked!`, 'success');
}

function savePaymentRecord(themeName) {
    const payments = JSON.parse(localStorage.getItem('themePayments') || '[]');
    payments.push({
        theme: themeName,
        amount: PREMIUM_THEMES[themeName].price,
        date: new Date().toISOString(),
        userId: currentUser?.uid || 'anonymous',
        method: 'UPI'
    });
    localStorage.setItem('themePayments', JSON.stringify(payments));
}

function showUPISuccessModal(themeName) {
    upiSuccessModal.style.display = 'flex';
}

function closeUPISuccessModal() {
    upiSuccessModal.style.display = 'none';
}

// ===========================================================
// ENHANCED GLB STORAGE SYSTEM WITH INDEXEDDB
// ===========================================================

async function loadAllGLBModels() {
    await loadGLB_onStart('home-bg-model', GLB_STORAGE_KEYS.HOME_BG);
    await loadGLB_onStart('jap-god-model', GLB_STORAGE_KEYS.JAP_BG);
    await loadGLB_onStart('jap-bg-static', GLB_STORAGE_KEYS.JAP_STATIC_BG);
    await loadGLB_onStart('mandir-main-god', GLB_STORAGE_KEYS.MANDIR_GOD);
    await loadGLB_onStart('mandir-bg-static', GLB_STORAGE_KEYS.MANDIR_BG);
}

function getStorageKeyForType(type) {
    const keyMap = {
        'home': GLB_STORAGE_KEYS.HOME_BG,
        'jap': GLB_STORAGE_KEYS.JAP_BG,
        'jap-static': GLB_STORAGE_KEYS.JAP_STATIC_BG,
        'mandir-god': GLB_STORAGE_KEYS.MANDIR_GOD,
        'mandir-bg': GLB_STORAGE_KEYS.MANDIR_BG
    };
    return keyMap[type] || GLB_STORAGE_KEYS.HOME_BG;
}

function getViewerIDForType(type) {
    const viewerMap = {
        'home': 'home-bg-model',
        'jap': 'jap-god-model',
        'jap-static': 'jap-bg-static',
        'mandir-god': 'mandir-main-god',
        'mandir-bg': 'mandir-bg-static'
    };
    return viewerMap[type] || 'home-bg-model';
}

async function handleGLBUpload(type, file) {
    const storageKey = getStorageKeyForType(type);
    const viewerID = getViewerIDForType(type);
    
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
        const success = await uploadGLB_and_Save(storageKey, file, viewerID);
        if (success) {
            // Setup background manipulation for mandir background
            if (type === 'mandir-bg') {
                setupBackgroundManipulation(document.getElementById(viewerID));
            }
        }
    } else {
        showMessage('Please upload a valid GLB or GLTF file', 'error');
    }
}

function setupBackgroundManipulation(backgroundViewer) {
    if (!backgroundViewer) return;
    
    backgroundElement = backgroundViewer;
    
    // Add pinch gesture support for background scaling
    backgroundViewer.addEventListener('touchstart', handleBackgroundTouchStart, { passive: false });
    backgroundViewer.addEventListener('touchmove', handleBackgroundTouchMove, { passive: false });
    backgroundViewer.addEventListener('touchend', handleBackgroundTouchEnd);
    
    // Add mouse support for background manipulation
    backgroundViewer.addEventListener('mousedown', handleBackgroundMouseDown);
    backgroundViewer.addEventListener('mousemove', handleBackgroundMouseMove);
    backgroundViewer.addEventListener('mouseup', handleBackgroundMouseUp);
    
    // Initialize background transform
    backgroundScale = 1;
    backgroundRotation = 0;
    updateBackgroundTransform();
}

function handleBackgroundTouchStart(e) {
    if (!isBackgroundEditMode) return;
    
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // Single touch - dragging
        const touch = e.touches[0];
        backgroundStartX = touch.clientX;
        backgroundStartY = touch.clientY;
        
        const rect = backgroundElement.getBoundingClientRect();
        backgroundInitialX = rect.left;
        backgroundInitialY = rect.top;
        
        isBackgroundDragging = true;
    } else if (e.touches.length === 2) {
        // Two touches - pinching for scaling
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        isPinching = true;
        isBackgroundDragging = false;
    }
}

function handleBackgroundTouchMove(e) {
    if (!isBackgroundEditMode) return;
    
    e.preventDefault();
    
    if (isBackgroundDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - backgroundStartX;
        const deltaY = touch.clientY - backgroundStartY;
        
        moveBackground(backgroundInitialX + deltaX, backgroundInitialY + deltaY);
    } else if (isPinching && e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        const scaleChange = currentDistance / initialDistance;
        backgroundScale = Math.max(0.3, Math.min(3, backgroundScale * scaleChange));
        
        updateBackgroundTransform();
        
        initialDistance = currentDistance;
    }
}

function handleBackgroundTouchEnd() {
    isBackgroundDragging = false;
    isPinching = false;
}

function handleBackgroundMouseDown(e) {
    if (!isBackgroundEditMode) return;
    
    backgroundStartX = e.clientX;
    backgroundStartY = e.clientY;
    
    const rect = backgroundElement.getBoundingClientRect();
    backgroundInitialX = rect.left;
    backgroundInitialY = rect.top;
    
    isBackgroundDragging = true;
}

function handleBackgroundMouseMove(e) {
    if (!isBackgroundEditMode || !isBackgroundDragging) return;
    
    const deltaX = e.clientX - backgroundStartX;
    const deltaY = e.clientY - backgroundStartY;
    
    moveBackground(backgroundInitialX + deltaX, backgroundInitialY + deltaY);
}

function handleBackgroundMouseUp() {
    isBackgroundDragging = false;
}

function moveBackground(x, y) {
    if (!backgroundElement) return;
    
    backgroundElement.style.position = 'absolute';
    backgroundElement.style.left = x + 'px';
    backgroundElement.style.top = y + 'px';
    backgroundElement.style.width = 'auto';
    backgroundElement.style.height = 'auto';
}

function updateBackgroundTransform() {
    if (!backgroundElement) return;
    
    backgroundElement.style.transform = `scale(${backgroundScale}) rotate(${backgroundRotation}deg)`;
}

function resetBackgroundSize() {
    backgroundScale = 1;
    backgroundRotation = 0;
    updateBackgroundTransform();
    centerBackground();
}

function centerBackground() {
    if (!backgroundElement) return;
    
    const container = backgroundElement.parentElement;
    const containerRect = container.getBoundingClientRect();
    const elementRect = backgroundElement.getBoundingClientRect();
    
    const centerX = (containerRect.width - elementRect.width * backgroundScale) / 2;
    const centerY = (containerRect.height - elementRect.height * backgroundScale) / 2;
    
    moveBackground(centerX, centerY);
}

function toggleBackgroundEditMode() {
    if (mandirMainGod.getAttribute('src')) {
        showMessage('Please remove god image first to edit background', 'info');
        return;
    }
    
    isBackgroundEditMode = !isBackgroundEditMode;
    
    if (isBackgroundEditMode) {
        backgroundEditControls.classList.remove('hidden');
        backgroundEditBtn.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
        showMessage('Background edit mode activated. Use pinch to resize and drag to move.', 'info');
    } else {
        backgroundEditControls.classList.add('hidden');
        backgroundEditBtn.style.background = '';
        showMessage('Background edit mode deactivated', 'info');
    }
}

function exitBackgroundEditMode() {
    isBackgroundEditMode = false;
    backgroundEditControls.classList.add('hidden');
    backgroundEditBtn.style.background = '';
}

// ===========================================================
// GLB MANAGEMENT PANEL
// ===========================================================

function openGLBManagement(context) {
    currentGLBContext = context;
    const panelTitle = document.getElementById('glb-panel-title');
    
    if (panelTitle) {
        panelTitle.textContent = `Manage 3D Models - ${context.charAt(0).toUpperCase() + context.slice(1)}`;
    }
    
    glbManagementPanel.classList.add('active');
}

function closeGLBManagement() {
    glbManagementPanel.classList.remove('active');
}

// Handle GLB file upload
if (glbUploadInput) {
    glbUploadInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
            handleGLBUpload(currentGLBContext, file);
            
            // Clear the input
            event.target.value = '';
        } else {
            showMessage('Please upload a valid GLB or GLTF file', 'error');
        }
    });
}

// ===========================================================
// PREMIUM THEME SYSTEM WITH UPI PAYMENTS
// ===========================================================

function loadPremiumThemes() {
    const savedThemes = localStorage.getItem('premiumThemes');
    if (savedThemes) {
        const themes = JSON.parse(savedThemes);
        Object.keys(themes).forEach(theme => {
            if (PREMIUM_THEMES[theme]) {
                PREMIUM_THEMES[theme].unlocked = themes[theme];
            }
        });
    }
    updateThemeUI();
}

function savePremiumThemes() {
    const themes = {};
    Object.keys(PREMIUM_THEMES).forEach(theme => {
        themes[theme] = PREMIUM_THEMES[theme].unlocked;
    });
    localStorage.setItem('premiumThemes', JSON.stringify(themes));
}

function updateThemeUI() {
    const themeOptions = document.querySelectorAll('.theme-option.premium');
    themeOptions.forEach(option => {
        const theme = option.dataset.theme;
        if (PREMIUM_THEMES[theme] && PREMIUM_THEMES[theme].unlocked) {
            option.classList.add('unlocked');
            option.onclick = () => changeTheme(theme);
        } else {
            option.classList.remove('unlocked');
            option.onclick = () => payUsingUPI(theme, PREMIUM_THEMES[theme].price);
        }
    });
}

// Remove all Razorpay related functions and replace with UPI
function initiatePayment(theme) {
    if (PREMIUM_THEMES[theme].unlocked) {
        changeTheme(theme);
        return;
    }
    
    // Direct UPI payment
    payUsingUPI(theme, PREMIUM_THEMES[theme].price);
}

// ===========================================================
// RESTORE PURCHASE SYSTEM
// ===========================================================

function restorePurchases() {
    let restoredCount = 0;

    // Restore premium items
    const premiumItems = JSON.parse(localStorage.getItem('premiumItems') || '[]');
    premiumItems.forEach(id => {
        localStorage.setItem(`unlock_${id}`, 'true');
        restoredCount++;
    });

    // Restore Mandir Rooms
    for (let key in localStorage) {
        if (key.startsWith('unlock_room_')) restoredCount++;
    }

    // Restore Themes
    const themes = JSON.parse(localStorage.getItem('premiumThemes') || '[]');
    themes.forEach(theme => restoredCount++);

    // Restore Backgrounds
    if (localStorage.getItem('homeBG3D_unlocked') === 'true') restoredCount++;
    if (localStorage.getItem('japBG3D_unlocked') === 'true') restoredCount++;

    if (restoredCount > 0) {
        showMessage(`✔ Restored ${restoredCount} purchases successfully!`, 'success');
    } else {
        showMessage(`No previous purchases found on this device.`, 'error');
    }
}

// ===========================================================
// ENHANCED JAP SCREEN WITH GOD NAME ANIMATION
// ===========================================================

function selectGodName(godName) {
    selectedGodName = godName;
    localStorage.setItem('selectedGodName', godName);
    showMessage(`${godName} name selected for Jap animation`, 'success');
    showScreen('home');
}

function showCustomGodInput() {
    const customGodInput = document.getElementById('custom-god-input');
    customGodInput.style.display = 'block';
}

function saveCustomGodName() {
    const customGodNameInput = document.getElementById('custom-god-name');
    const customGodName = customGodNameInput.value.trim();
    
    if (customGodName) {
        selectedGodName = customGodName;
        localStorage.setItem('selectedGodName', customGodName);
        showMessage(`Custom God name "${customGodName}" saved!`, 'success');
        showScreen('home');
    } else {
        showMessage('Please enter a God name', 'error');
    }
}

function createGodNameAnimation(x, y) {
    if (!godNameAnimation) return;
    
    const godNameElement = document.createElement('div');
    godNameElement.className = 'god-name-particle';
    godNameElement.textContent = selectedGodName;
    godNameElement.style.left = x + 'px';
    godNameElement.style.top = y + 'px';
    godNameElement.style.fontSize = (Math.random() * 1 + 1.5) + 'rem';
    
    godNameAnimation.appendChild(godNameElement);
    
    setTimeout(() => {
        if (godNameElement.parentNode) {
            godNameElement.remove();
        }
    }, 3000);
}

// ===========================================================
// SMOOTH COUNTER ANIMATIONS
// ===========================================================

function animateCounter(element) {
    element.classList.add('animate');
    setTimeout(() => {
        element.classList.remove('animate');
    }, 300);
}

// ===========================================================
// EVENT LISTENERS SETUP
// ===========================================================

function setupEventListeners() {
    // Enhanced Jap touch area
    if (japTouchArea) {
        japTouchArea.addEventListener('touchstart', handleJapTouchStart, { passive: false });
        japTouchArea.addEventListener('touchmove', handleJapTouchMove, { passive: false });
        japTouchArea.addEventListener('touchend', handleJapTouchEnd);
        
        japTouchArea.addEventListener('mousedown', handleJapMouseDown);
        japTouchArea.addEventListener('mousemove', handleJapMouseMove);
        japTouchArea.addEventListener('mouseup', handleJapMouseUp);
        japTouchArea.addEventListener('click', handleJapClick);
    }
    
    // Profile picture upload
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
    
    // GLB file upload handlers
    if (godUploadInput) {
        godUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleGLBUpload('mandir-god', file);
            closeUploadGodPanel();
        });
    }
    
    if (mandirBgUpload) {
        mandirBgUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleGLBUpload('mandir-bg', file);
            closeMandirBackgroundPanel();
        });
    }
    
    if (customDecorationUpload) {
        customDecorationUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                addCustomInteractiveDecoration(file.name);
                showMessage('Custom decoration uploaded successfully!', 'success');
            }
        });
    }
    
    // Enter key support for login forms
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen.id === 'login') {
                login();
            } else if (activeScreen.id === 'signup') {
                signup();
            } else if (activeScreen.id === 'forgot') {
                resetPassword();
            }
        }
    });
    
    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        if (!glbManagementPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeGLBManagement();
        }
        
        if (!uploadGodPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeUploadGodPanel();
        }
        if (!offeringPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeOfferingPanel();
        }
        if (!decorationPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeDecorationPanel();
        }
        if (!customDecorationPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeCustomDecorationPanel();
        }
        if (!mandirBackgroundPanel.contains(e.target) && !e.target.closest('.icon-btn')) {
            closeMandirBackgroundPanel();
        }
        
        // Close sunkh menu when clicking outside
        if (!sunkhMenu.contains(e.target) && !e.target.closest('.sunkh-icon')) {
            sunkhMenu.classList.add('hidden');
        }
    });
    
    // Setup interactive decorations events
    setupInteractiveDecorations();
}

// Enhanced Jap touch handlers
function handleJapTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    startJapInteraction(touch.clientX, touch.clientY);
    
    if (touchTrailCtx) {
        const rect = japTouchArea.getBoundingClientRect();
        lastTouch = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
}

function handleJapTouchMove(e) {
    e.preventDefault();
    
    if (touchTrailCtx && lastTouch) {
        const touch = e.touches[0];
        const rect = japTouchArea.getBoundingClientRect();
        const currentTouch = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        touchTrailCtx.beginPath();
        touchTrailCtx.moveTo(lastTouch.x, lastTouch.y);
        touchTrailCtx.lineTo(currentTouch.x, currentTouch.y);
        touchTrailCtx.stroke();
        
        touchTrailCtx.shadowBlur = 15;
        touchTrailCtx.shadowColor = '#ffd700';
        
        lastTouch = currentTouch;
    }
}

function handleJapTouchEnd() {
    setTimeout(() => {
        if (touchTrailCtx) {
            touchTrailCtx.clearRect(0, 0, touchTrail.width, touchTrail.height);
        }
    }, 1000);
}

function handleJapMouseDown(e) {
    startJapInteraction(e.clientX, e.clientY);
}

function handleJapMouseMove(e) {
    // Mouse move handling for future enhancements
}

function handleJapMouseUp() {
    // Mouse up handling
}

function handleJapClick(e) {
    startJapInteraction(e.clientX, e.clientY);
}

function startJapInteraction(x, y) {
    increaseJapCount();
    createGodNameAnimation(x, y);
    animateGoldSpark();
    rotateMalaBead();
    updateJapMetrics();
    updateChakraAlignment();
    showFloatingBlessing();
}

// ===========================================================
// AUTHENTICATION FUNCTIONS
// ===========================================================

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
    }
    
    const loginBtn = document.querySelector('#login .auth-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showMessage('Login successful!', 'success');
            showScreen('home');
        })
        .catch((error) => {
            console.error('Login error:', error);
            let errorMessage = 'Login failed: ';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'This account has been disabled';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            showMessage(errorMessage, 'error');
        })
        .finally(() => {
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        });
}

function signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    
    if (!email || !password || !confirmPassword) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    const signupBtn = document.querySelector('#signup .auth-btn');
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Creating account...';
    signupBtn.disabled = true;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showMessage('Account created successfully!', 'success');
            showScreen('home');
        })
        .catch((error) => {
            console.error('Signup error:', error);
            let errorMessage = 'Signup failed: ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            showMessage(errorMessage, 'error');
        })
        .finally(() => {
            signupBtn.textContent = originalText;
            signupBtn.disabled = false;
        });
}

function resetPassword() {
    const email = document.getElementById('forgotEmail').value;
    
    if (!email) {
        showMessage('Please enter your email', 'error');
        return;
    }
    
    const resetBtn = document.querySelector('#forgot .auth-btn');
    const originalText = resetBtn.textContent;
    resetBtn.textContent = 'Sending...';
    resetBtn.disabled = true;
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showMessage('Password reset email sent! Check your inbox.', 'success');
            showScreen('login');
        })
        .catch((error) => {
            console.error('Password reset error:', error);
            showMessage('Error: ' + error.message, 'error');
        })
        .finally(() => {
            resetBtn.textContent = originalText;
            resetBtn.disabled = false;
        });
}

function logout() {
    if (isHandFreeMode) {
        stopHandFreeMode();
    }
    
    auth.signOut()
        .then(() => {
            showMessage('Logged out successfully', 'success');
            showScreen('login');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showMessage('Logout failed: ' + error.message, 'error');
        });
}

// ===========================================================
// PROFILE MANAGEMENT
// ===========================================================

function loadProfileData() {
    const profilePic = document.getElementById('profile-pic');
    const profilePicLarge = document.getElementById('profile-pic-large');
    const profileName = document.getElementById('profile-name');
    const profileNameInput = document.getElementById('profile-name-input');
    
    const savedPic = localStorage.getItem('profilePic');
    const savedName = localStorage.getItem('profileName') || 'User';
    const savedMantra = localStorage.getItem('customMantra') || 'Om Namah Shivaya';
    
    if (profilePic && savedPic) {
        profilePic.src = savedPic;
    }
    if (profilePicLarge && savedPic) {
        profilePicLarge.src = savedPic;
    }
    if (profileName) {
        profileName.textContent = savedName;
    }
    if (profileNameInput) {
        profileNameInput.value = savedName;
    }
    if (currentMantraDisplay) {
        currentMantraDisplay.textContent = savedMantra;
    }
}

function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profilePic = document.getElementById('profile-pic');
            const profilePicLarge = document.getElementById('profile-pic-large');
            
            if (profilePic) profilePic.src = e.target.result;
            if (profilePicLarge) profilePicLarge.src = e.target.result;
            
            localStorage.setItem('profilePic', e.target.result);
            showMessage('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const profileNameInput = document.getElementById('profile-name-input');
    const profileName = document.getElementById('profile-name');
    
    if (profileNameInput && profileNameInput.value.trim()) {
        const name = profileNameInput.value.trim();
        localStorage.setItem('profileName', name);
        
        if (profileName) {
            profileName.textContent = name;
        }
        
        showMessage('Profile saved successfully!', 'success');
        showScreen('home');
    } else {
        showMessage('Please enter a name', 'error');
    }
}

function updateProfileScreen() {
    if (currentUser) {
        const userEmailElement = document.getElementById('user-email');
        const profileJapCountElement = document.getElementById('profile-jap-count');
        const profileMalaCountElement = document.getElementById('profile-mala-count');
        
        if (userEmailElement) userEmailElement.textContent = currentUser.email;
        if (profileJapCountElement) profileJapCountElement.textContent = japCount.toLocaleString();
        if (profileMalaCountElement) profileMalaCountElement.textContent = malaCount.toLocaleString();
    }
}

function inviteFriends() {
    const appUrl = window.location.href;
    const shareText = `Join me in Divine Mantra - A beautiful spiritual app for meditation and naam jap! Download now: ${appUrl}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Divine Mantra',
            text: shareText,
            url: appUrl
        }).then(() => {
            showMessage('Invitation shared successfully!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(shareText) {
    navigator.clipboard.writeText(shareText).then(() => {
        showMessage('Invitation link copied to clipboard! Share it with your friends.', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('Invitation link copied to clipboard! Share it with your friends.', 'success');
    });
}

// ===========================================================
// JAP COUNTER FUNCTIONS
// ===========================================================

function increaseJapCount() {
    const now = Date.now();
    japTimes.push(now);
    
    if (japTimes.length > 10) {
        japTimes.shift();
    }
    
    japCount++;
    sessionJapCount++;
    currentBead++;
    
    if (currentBead > 108) {
        currentBead = 1;
        malaCount++;
        showMalaCompletion();
        showAchievement('mala');
    }
    
    if (japCount === 1000) {
        showAchievement('thousand');
    } else if (japCount === 10000) {
        showAchievement('ten-thousand');
    }
    
    localStorage.setItem('totalJapCount', japCount.toString());
    localStorage.setItem('totalMalaCount', malaCount.toString());
    localStorage.setItem('currentBead', currentBead.toString());
    
    updateCounters();
    updateKarmaMeter();
}

function updateCounters() {
    const totalJapElement = document.getElementById('total-jap-count');
    const totalMalaElement = document.getElementById('total-mala-count');
    
    if (totalJapElement) {
        totalJapElement.textContent = japCount.toLocaleString();
        animateCounter(totalJapElement);
    }
    if (totalMalaElement) {
        totalMalaElement.textContent = malaCount.toLocaleString();
        animateCounter(totalMalaElement);
    }
    
    const currentBeadElement = document.getElementById('current-bead');
    const sessionJapElement = document.getElementById('session-jap-count');
    
    if (currentBeadElement) {
        currentBeadElement.textContent = currentBead;
        animateCounter(currentBeadElement);
    }
    if (sessionJapElement) {
        sessionJapElement.textContent = sessionJapCount.toLocaleString();
        animateCounter(sessionJapElement);
    }
}

function updateKarmaMeter() {
    if (!karmaNeedle) return;
    
    const karmaPercentage = Math.min((japCount % 1000) / 10, 100);
    karmaNeedle.style.width = karmaPercentage + '%';
}

function updateJapMetrics() {
    if (japTimes.length < 2) return;
    
    const timeDiff = (japTimes[japTimes.length - 1] - japTimes[0]) / 1000;
    const japsPerMinute = (japTimes.length - 1) / (timeDiff / 60);
    
    let speedPercentage = Math.min(japsPerMinute / 60 * 100, 100);
    speedBar.style.width = speedPercentage + '%';
    
    if (japsPerMinute < 20) {
        speedText.textContent = 'Slow';
        speedBar.style.background = '#ff4444';
    } else if (japsPerMinute < 40) {
        speedText.textContent = 'Perfect';
        speedBar.style.background = '#00b09b';
    } else {
        speedText.textContent = 'Fast';
        speedBar.style.background = '#ff6b00';
    }
    
    let timeDiffs = [];
    for (let i = 1; i < japTimes.length; i++) {
        timeDiffs.push(japTimes[i] - japTimes[i - 1]);
    }
    
    const avgTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const variance = timeDiffs.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / timeDiffs.length;
    const accuracy = Math.max(0, 100 - (variance / 100));
    
    accuracyValue.textContent = Math.round(accuracy) + '%';
}

function updateChakraAlignment() {
    const chakraAlignment = document.querySelector('.chakra-alignment');
    if (!chakraAlignment) return;
    
    const chakras = chakraAlignment.querySelectorAll('.chakra');
    const chakraIndex = (currentBead - 1) % 7;
    
    chakras.forEach((chakra, index) => {
        if (index === chakraIndex) {
            chakra.classList.add('active');
        } else {
            chakra.classList.remove('active');
        }
    });
}

// ===========================================================
// ANIMATIONS AND EFFECTS
// ===========================================================

function animateGoldSpark() {
    const spark = document.createElement('div');
    spark.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #ffd700, transparent);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkAnimation 0.6s ease-out forwards;
        z-index: 100;
    `;
    
    japScreen.appendChild(spark);
    
    setTimeout(() => {
        spark.remove();
    }, 600);
}

function rotateMalaBead() {
    const malaModel = document.getElementById('mala-model');
    if (malaModel) {
        malaModel.style.transform = 'rotateY(10deg)';
        setTimeout(() => {
            malaModel.style.transform = 'rotateY(0deg)';
        }, 200);
    }
}

function showFloatingBlessing() {
    const blessings = ['ॐ', 'शिव', 'शक्ति', 'कृष्ण', 'राम'];
    const blessing = blessings[Math.floor(Math.random() * blessings.length)];
    
    const blessingElement = document.createElement('div');
    blessingElement.className = 'blessing';
    blessingElement.textContent = blessing;
    blessingElement.style.left = Math.random() * 70 + 15 + '%';
    
    floatingBlessingsJap.appendChild(blessingElement);
    
    setTimeout(() => {
        if (blessingElement.parentNode) {
            blessingElement.remove();
        }
    }, 3000);
}

function showMalaCompletion() {
    const completionMsg = document.createElement('div');
    completionMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 215, 0, 0.9);
        color: #0c0c0c;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        font-size: 1.2rem;
    `;
    completionMsg.textContent = 'Mala Completed! 🙏';
    
    document.body.appendChild(completionMsg);
    
    setTimeout(() => {
        completionMsg.remove();
    }, 2000);
}

function showAchievement(type) {
    if (!achievementAnimations) return;
    
    const achievement = document.createElement('div');
    achievement.className = 'achievement';
    
    switch (type) {
        case 'mala':
            achievement.textContent = '🎉 Mala Complete! 🎉';
            achievement.style.color = '#ffd700';
            break;
        case 'thousand':
            achievement.textContent = '🌟 1000 Japs! 🌟';
            achievement.style.color = '#00b09b';
            break;
        case 'ten-thousand':
            achievement.textContent = '✨ 10,000 Japs! ✨';
            achievement.style.color = '#9b59b6';
            break;
    }
    
    achievementAnimations.appendChild(achievement);
    
    setTimeout(() => {
        if (achievement.parentNode) {
            achievement.remove();
        }
    }, 2000);
}

// ===========================================================
// HAND-FREE MODE
// ===========================================================

function toggleHandFreeMode() {
    if (!isHandFreeMode) {
        startHandFreeMode();
    } else {
        stopHandFreeMode();
    }
}

function startHandFreeMode() {
    isHandFreeMode = true;
    const handfreeBtn = document.getElementById('handfree-btn');
    if (handfreeBtn) {
        handfreeBtn.textContent = '⏸️ Stop Auto';
        handfreeBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff6b6b)';
    }
    
    handFreeInterval = setInterval(() => {
        increaseJapCount();
        animateGoldSpark();
        rotateMalaBead();
        updateJapMetrics();
        updateChakraAlignment();
        showFloatingBlessing();
    }, 2000);
    
    showMessage('Hand-free mode started', 'info');
}

function stopHandFreeMode() {
    isHandFreeMode = false;
    const handfreeBtn = document.getElementById('handfree-btn');
    if (handfreeBtn) {
        handfreeBtn.textContent = '🤚 Hand-Free';
        handfreeBtn.style.background = '';
    }
    
    if (handFreeInterval) {
        clearInterval(handFreeInterval);
        handFreeInterval = null;
    }
    
    showMessage('Hand-free mode stopped', 'info', 1000);
}

// ===========================================================
// MODE TOGGLES
// ===========================================================

function toggleChakraMode() {
    isChakraMode = !isChakraMode;
    if (isChakraMode) {
        showMessage('Chakra Mode Activated', 'success');
        document.body.classList.add('chakra-mode');
    } else {
        showMessage('Chakra Mode Deactivated', 'info');
        document.body.classList.remove('chakra-mode');
    }
}

function toggleMandalaMode() {
    isMandalaMode = !isMandalaMode;
    if (isMandalaMode) {
        showMessage('Mandala Mode Activated', 'success');
        document.body.classList.add('mandala-mode');
    } else {
        showMessage('Mandala Mode Deactivated', 'info');
        document.body.classList.remove('mandala-mode');
    }
}

// ===========================================================
// SCREEN NAVIGATION
// ===========================================================

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        if (screenId === 'home') {
            updateHomeScreen();
        } else if (screenId === 'profile') {
            updateProfileScreen();
        } else if (screenId === 'jap') {
            resetSessionCounters();
            startJapPreview();
        } else if (screenId === 'custom-mantra') {
            updateCustomMantraScreen();
        }
        
        if (screenId !== 'fullscreen-mandir') {
            closeAllPanels();
            sunkhMenu.classList.add('hidden');
            exitBackgroundEditMode();
        }
        
        window.scrollTo(0, 0);
    }
}

function showThemeStore() {
    showScreen('theme-store');
}

function startJapPreview() {
    const japContainer = document.querySelector('.jap-container');
    if (japContainer) {
        japContainer.style.opacity = '0';
        japContainer.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            japContainer.style.transition = 'all 0.5s ease';
            japContainer.style.opacity = '1';
            japContainer.style.transform = 'scale(1)';
        }, 100);
    }
}

function resetSessionCounters() {
    sessionJapCount = 0;
    japTimes = [];
    const sessionJapElement = document.getElementById('session-jap-count');
    if (sessionJapElement) sessionJapElement.textContent = '0';
    
    if (speedBar) speedBar.style.width = '50%';
    if (speedText) speedText.textContent = 'Perfect';
    if (accuracyValue) accuracyValue.textContent = '100%';
}

function resetSession() {
    if (confirm('Reset current session?')) {
        resetSessionCounters();
        currentBead = 1;
        localStorage.setItem('currentBead', '1');
        updateCounters();
        showMessage('Session reset', 'info');
    }
}

function updateHomeScreen() {
    updateCounters();
    updateKarmaMeter();
}

// ===========================================================
// CUSTOM MANTRA
// ===========================================================

function updateCustomMantraScreen() {
    const currentMantraText = document.getElementById('current-mantra-text');
    const customMantraInput = document.getElementById('custom-mantra-input');
    
    const savedMantra = localStorage.getItem('customMantra') || 'Om Namah Shivaya';
    
    if (currentMantraText) {
        currentMantraText.textContent = savedMantra;
    }
    if (customMantraInput) {
        customMantraInput.value = savedMantra;
    }
}

function saveCustomMantra() {
    const customMantraInput = document.getElementById('custom-mantra-input');
    const currentMantraText = document.getElementById('current-mantra-text');
    const currentMantraDisplay = document.getElementById('current-mantra-display');
    
    if (customMantraInput && customMantraInput.value.trim()) {
        const mantra = customMantraInput.value.trim();
        localStorage.setItem('customMantra', mantra);
        
        if (currentMantraText) {
            currentMantraText.textContent = mantra;
        }
        if (currentMantraDisplay) {
            currentMantraDisplay.textContent = mantra;
        }
        
        showMessage('Custom mantra saved!', 'success');
    } else {
        showMessage('Please enter a mantra', 'error');
    }
}

// ===========================================================
// THEME MANAGEMENT
// ===========================================================

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'mahadev';
    changeTheme(savedTheme);
}

function changeTheme(themeName) {
    document.body.classList.remove('mahadev-theme', 'krishna-theme', 'golden-theme', 'vishnu-theme', 'durga-theme', 'ganesha-theme', 'hanuman-theme', 'saraswati-theme', 'lakshmi-theme', 'radha-theme', 'kubera-theme', 'brahma-theme', 'kartikeya-theme', 'surya-theme', 'indra-theme', 'yama-theme', 'varuna-theme', 'vayu-theme', 'agni-theme');
    
    document.body.classList.add(themeName + '-theme');
    localStorage.setItem('theme', themeName);
    
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === themeName) {
            option.style.border = '2px solid #ffd700';
        } else {
            option.style.border = '1px solid rgba(255, 215, 0, 0.3)';
        }
    });
}

// ===========================================================
// MANDIR FUNCTIONS
// ===========================================================

function openFullscreenMandir() {
    isMandirOpen = true;
    showScreen('fullscreen-mandir');
}

function closeFullscreenMandir() {
    isMandirOpen = false;
    showScreen('home');
    clearMandirAnimations();
    exitBackgroundEditMode();
}

function clearMandirAnimations() {
    if (mandirAnimations) {
        mandirAnimations.innerHTML = '';
    }
}

function toggleSunkhMenu() {
    sunkhMenu.classList.toggle('hidden');
}

// Mandir Panel Functions
function openUploadGodPanel() {
    closeAllPanels();
    uploadGodPanel.classList.add('active');
    sunkhMenu.classList.add('hidden');
    document.querySelector(".god-aura").style.display = "block";
    document.querySelector(".god-aura").style.display = "none";
}

function closeUploadGodPanel() {
    uploadGodPanel.classList.remove('active');
}

function openOfferingPanel() {
    closeAllPanels();
    offeringPanel.classList.add('active');
    sunkhMenu.classList.add('hidden');
}

function closeOfferingPanel() {
    offeringPanel.classList.remove('active');
}

function openDecorationPanel() {
    closeAllPanels();
    decorationPanel.classList.add('active');
    sunkhMenu.classList.add('hidden');
}

function closeDecorationPanel() {
    decorationPanel.classList.remove('active');
}

function openCustomDecorationPanel() {
    closeAllPanels();
    customDecorationPanel.classList.add('active');
    sunkhMenu.classList.add('hidden');
}

function closeCustomDecorationPanel() {
    customDecorationPanel.classList.remove('active');
}

function openMandirBackgroundPanel() {
    closeAllPanels();
    mandirBackgroundPanel.classList.add('active');
    sunkhMenu.classList.add('hidden');
}

function closeMandirBackgroundPanel() {
    mandirBackgroundPanel.classList.remove('active');
}

function closeAllPanels() {
    uploadGodPanel.classList.remove('active');
    offeringPanel.classList.remove('active');
    decorationPanel.classList.remove('active');
    customDecorationPanel.classList.remove('active');
    mandirBackgroundPanel.classList.remove('active');
}

function resetMandirGod() {
    deleteGLB_FromIDB(GLB_STORAGE_KEYS.MANDIR_GOD).then(() => {
        const activeModels = JSON.parse(localStorage.getItem('activeGLBModels') || '{}');
        delete activeModels['mandir-main-god'];
        localStorage.setItem('activeGLBModels', JSON.stringify(activeModels));
        
        mandirMainGod.removeAttribute('src');
        showMessage('God model reset to default', 'success');
        closeUploadGodPanel();
    });
}

function resetMandirBackground() {
    deleteGLB_FromIDB(GLB_STORAGE_KEYS.MANDIR_BG).then(() => {
        const activeModels = JSON.parse(localStorage.getItem('activeGLBModels') || '{}');
        delete activeModels['mandir-bg-static'];
        localStorage.setItem('activeGLBModels', JSON.stringify(activeModels));
        
        mandirBackground.removeAttribute('src');
        showMessage('Mandir background reset to default', 'success');
        closeMandirBackgroundPanel();
    });
}

// ===========================================================
// SPIRITUAL OFFERING ITEMS
// ===========================================================

function populatePremiumItems() {
    populateOfferings();
    populateDecorations();
}

function populateOfferings() {
    const offeringsGrid = document.getElementById('offerings-grid');
    if (!offeringsGrid) return;
    
    offeringsGrid.innerHTML = '';
    
    spiritualOfferings.forEach(offering => {
        const offeringItem = document.createElement('div');
        offeringItem.className = 'offering-item';
        offeringItem.innerHTML = `
            <div class="offering-icon">${offering.icon}</div>
            <span>${offering.name}</span>
        `;
        offeringItem.onclick = () => playOfferingAnimation(offering.type);
        offeringsGrid.appendChild(offeringItem);
    });
}

function populateDecorations() {
    const decorationsGrid = document.getElementById('decorations-grid');
    if (!decorationsGrid) return;
    
    decorationsGrid.innerHTML = '';
    
    premiumDecorations.forEach(decoration => {
        const decorationItem = document.createElement('div');
        decorationItem.className = 'decoration-item';
        decorationItem.innerHTML = `
            <div class="decoration-icon">${decoration.icon}</div>
            <span>${decoration.name}</span>
        `;
        decorationItem.onclick = () => addInteractiveDecoration(decoration.id, decoration.name);
        decorationsGrid.appendChild(decorationItem);
    });
}

// ===========================================================
// INTERACTIVE DECORATIONS
// ===========================================================

function setupInteractiveDecorations() {
    if (!interactiveDecorationsContainer) return;
    
    interactiveDecorationsContainer.addEventListener('touchstart', handleDecorationTouchStart, { passive: false });
    interactiveDecorationsContainer.addEventListener('touchmove', handleDecorationTouchMove, { passive: false });
    interactiveDecorationsContainer.addEventListener('touchend', handleDecorationTouchEnd);
    
    interactiveDecorationsContainer.addEventListener('mousedown', handleDecorationMouseDown);
    interactiveDecorationsContainer.addEventListener('mousemove', handleDecorationMouseMove);
    interactiveDecorationsContainer.addEventListener('mouseup', handleDecorationMouseUp);
}

function handleDecorationTouchStart(e) {
    const decorationElement = e.target.closest('.interactive-decoration');
    if (!decorationElement) return;
    
    e.preventDefault();
    selectDecoration(decorationElement);
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    const rect = decorationElement.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    isDraggingDecoration = true;
    currentDecorationElement = decorationElement;
    
    deleteZone.classList.add('active');
}

function handleDecorationTouchMove(e) {
    if (!isDraggingDecoration || !currentDecorationElement) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    moveDecoration(currentDecorationElement, initialX + deltaX, initialY + deltaY);
    
    const rect = currentDecorationElement.getBoundingClientRect();
    const deleteZoneRect = deleteZone.getBoundingClientRect();
    
    if (rect.bottom > deleteZoneRect.top) {
        currentDecorationElement.style.opacity = '0.5';
        deleteZone.style.background = 'rgba(255, 0, 0, 0.5)';
    } else {
        currentDecorationElement.style.opacity = '1';
        deleteZone.style.background = 'rgba(255, 0, 0, 0.3)';
    }
}

function handleDecorationTouchEnd() {
    if (isDraggingDecoration && currentDecorationElement) {
        const rect = currentDecorationElement.getBoundingClientRect();
        const deleteZoneRect = deleteZone.getBoundingClientRect();
        
        if (rect.bottom > deleteZoneRect.top) {
            removeDecoration(currentDecorationElement);
        } else {
            saveDecorationPosition(currentDecorationElement);
        }
    }
    
    isDraggingDecoration = false;
    currentDecorationElement = null;
    
    deleteZone.classList.remove('active');
    deleteZone.style.background = 'rgba(255, 0, 0, 0.3)';
}

function handleDecorationMouseDown(e) {
    const decorationElement = e.target.closest('.interactive-decoration');
    if (!decorationElement) return;
    
    selectDecoration(decorationElement);
    
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = decorationElement.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    isDraggingDecoration = true;
    currentDecorationElement = decorationElement;
    
    deleteZone.classList.add('active');
}

function handleDecorationMouseMove(e) {
    if (!isDraggingDecoration || !currentDecorationElement) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    moveDecoration(currentDecorationElement, initialX + deltaX, initialY + deltaY);
    
    const rect = currentDecorationElement.getBoundingClientRect();
    const deleteZoneRect = deleteZone.getBoundingClientRect();
    
    if (rect.bottom > deleteZoneRect.top) {
        currentDecorationElement.style.opacity = '0.5';
        deleteZone.style.background = 'rgba(255, 0, 0, 0.5)';
    } else {
        currentDecorationElement.style.opacity = '1';
        deleteZone.style.background = 'rgba(255, 0, 0, 0.3)';
    }
}

function handleDecorationMouseUp() {
    if (isDraggingDecoration && currentDecorationElement) {
        const rect = currentDecorationElement.getBoundingClientRect();
        const deleteZoneRect = deleteZone.getBoundingClientRect();
        
        if (rect.bottom > deleteZoneRect.top) {
            removeDecoration(currentDecorationElement);
        } else {
            saveDecorationPosition(currentDecorationElement);
        }
    }
    
    isDraggingDecoration = false;
    currentDecorationElement = null;
    
    deleteZone.classList.remove('active');
    deleteZone.style.background = 'rgba(255, 0, 0, 0.3)';
}

function selectDecoration(decorationElement) {
    document.querySelectorAll('.interactive-decoration').forEach(dec => {
        dec.classList.remove('selected');
    });
    
    decorationElement.classList.add('selected');
    selectedDecoration = decorationElement;
}

function moveDecoration(element, x, y) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

function saveDecorationPosition(element) {
    const decorationId = element.dataset.decorationId;
    const decoration = interactiveDecorations.find(dec => dec.id === decorationId);
    if (decoration) {
        decoration.x = parseFloat(element.style.left);
        decoration.y = parseFloat(element.style.top);
        saveInteractiveDecorations();
    }
}

function removeDecoration(element) {
    const decorationId = element.dataset.decorationId;
    interactiveDecorations = interactiveDecorations.filter(dec => dec.id !== decorationId);
    element.remove();
    saveInteractiveDecorations();
    selectedDecoration = null;
    showMessage('Decoration removed', 'success');
}

function addInteractiveDecoration(type, name) {
    const decorationId = 'decoration-' + Date.now();
    const decoration = {
        id: decorationId,
        type: type,
        name: name,
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        scale: 1,
        rotation: 0
    };
    
    interactiveDecorations.push(decoration);
    createDecorationElement(decoration);
    saveInteractiveDecorations();
    closeDecorationPanel();
}

function addCustomInteractiveDecoration(name) {
    const decorationId = 'custom-decoration-' + Date.now();
    const decoration = {
        id: decorationId,
        type: 'custom',
        name: name || 'Custom Decoration',
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        scale: 1,
        rotation: 0
    };
    
    interactiveDecorations.push(decoration);
    createDecorationElement(decoration);
    saveInteractiveDecorations();
    closeCustomDecorationPanel();
}

function createDecorationElement(decoration) {
    const decorationElement = document.createElement('div');
    decorationElement.className = 'interactive-decoration';
    decorationElement.dataset.decorationId = decoration.id;
    
    decorationElement.style.left = decoration.x + 'px';
    decorationElement.style.top = decoration.y + 'px';
    
    const decorationData = premiumDecorations.find(d => d.id === decoration.type);
    if (decorationData) {
        decorationElement.innerHTML = `
            <div style="font-size: 3rem; text-align: center;">${decorationData.icon}</div>
            <div style="font-size: 0.8rem; text-align: center; margin-top: 5px;">${decoration.name}</div>
        `;
    }
    
    interactiveDecorationsContainer.appendChild(decorationElement);
}

function loadInteractiveDecorations() {
    const savedDecorations = localStorage.getItem('interactiveDecorations');
    if (savedDecorations) {
        interactiveDecorations = JSON.parse(savedDecorations);
        interactiveDecorations.forEach(decoration => {
            createDecorationElement(decoration);
        });
    }
}

function saveInteractiveDecorations() {
    localStorage.setItem('interactiveDecorations', JSON.stringify(interactiveDecorations));
}

function clearAllDecorations() {
    if (confirm('Remove all decorations?')) {
        interactiveDecorations = [];
        interactiveDecorationsContainer.innerHTML = '';
        saveInteractiveDecorations();
        showMessage('All decorations removed', 'success');
        sunkhMenu.classList.add('hidden');
    }
}

// ===========================================================
// OFFERING ANIMATIONS
// ===========================================================

function playOfferingAnimation(type) {
    const container = mandirAnimations;
    
    switch (type) {
        case 'flowers':
            createFlowerAnimation(container);
            break;
        case 'diya':
            createDiyaAnimation(container);
            break;
        case 'incense':
            createIncenseAnimation(container);
            break;
        case 'fruits':
            createFruitAnimation(container);
            break;
        case 'sweets':
            createSweetAnimation(container);
            break;
        case 'water':
            createWaterAnimation(container);
            break;
        case 'milk':
            createMilkAnimation(container);
            break;
        case 'honey':
            createHoneyAnimation(container);
            break;
        case 'ghee':
            createGheeAnimation(container);
            break;
        case 'coconut':
            createCoconutAnimation(container);
            break;
        default:
            createGenericOfferingAnimation(container, type);
    }
    
    showMessage('Offering made successfully!', 'success');
    closeOfferingPanel();
}

function createFlowerAnimation(container) {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const flower = document.createElement('div');
            flower.className = 'animation-particle';
            flower.innerHTML = '🌸';
            flower.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 1 + 1}rem;
                animation: fallingPetal ${Math.random() * 3 + 2}s linear forwards;
                z-index: 51;
            `;
            
            container.appendChild(flower);
            
            setTimeout(() => {
                if (flower.parentNode) {
                    flower.remove();
                }
            }, 5000);
        }, i * 100);
    }
}

function createDiyaAnimation(container) {
    const diya = document.createElement('div');
    diya.className = 'animation-particle';
    diya.innerHTML = '🪔';
    diya.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        animation: flameFlicker 2s ease-in-out infinite;
        z-index: 51;
    `;
    
    container.appendChild(diya);
    
    setTimeout(() => {
        if (diya.parentNode) {
            diya.remove();
        }
    }, 2000);
}

function createIncenseAnimation(container) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const smoke = document.createElement('div');
            smoke.className = 'animation-particle';
            smoke.innerHTML = '💨';
            smoke.style.cssText = `
                position: absolute;
                bottom: 30%;
                left: 50%;
                font-size: 2rem;
                animation: smokeRise 4s ease-out forwards;
                z-index: 51;
            `;
            
            container.appendChild(smoke);
            
            setTimeout(() => {
                if (smoke.parentNode) {
                    smoke.remove();
                }
            }, 4000);
        }, i * 500);
    }
}

function createFruitAnimation(container) {
    const fruits = ['🍎', '🍇', '🥭', '🍊', '🍓'];
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const fruit = document.createElement('div');
            fruit.className = 'animation-particle';
            fruit.innerHTML = fruits[Math.floor(Math.random() * fruits.length)];
            fruit.style.cssText = `
                position: absolute;
                top: ${Math.random() * 60 + 20}%;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 1 + 1.5}rem;
                animation: fruitFall ${Math.random() * 2 + 1}s ease-out forwards;
                z-index: 51;
            `;
            
            container.appendChild(fruit);
            
            setTimeout(() => {
                if (fruit.parentNode) {
                    fruit.remove();
                }
            }, 3000);
        }, i * 200);
    }
}

function createSweetAnimation(container) {
    const sweets = ['🍬', '🍭', '🎂', '🍰'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sweet = document.createElement('div');
            sweet.className = 'animation-particle';
            sweet.innerHTML = sweets[Math.floor(Math.random() * sweets.length)];
            sweet.style.cssText = `
                position: absolute;
                top: ${Math.random() * 50 + 25}%;
                left: ${Math.random() * 100}%;
                font-size: 1.5rem;
                animation: sweetBounce 1s ease-out forwards;
                z-index: 51;
            `;
            
            container.appendChild(sweet);
            
            setTimeout(() => {
                if (sweet.parentNode) {
                    sweet.remove();
                }
            }, 1000);
        }, i * 150);
    }
}

function createWaterAnimation(container) {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const water = document.createElement('div');
            water.className = 'animation-particle';
            water.innerHTML = '💧';
            water.style.cssText = `
                position: absolute;
                top: ${Math.random() * 40 + 10}%;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 0.5 + 1}rem;
                animation: waterDrop ${Math.random() * 2 + 1}s ease-out forwards;
                z-index: 51;
            `;
            
            container.appendChild(water);
            
            setTimeout(() => {
                if (water.parentNode) {
                    water.remove();
                }
            }, 3000);
        }, i * 150);
    }
}

function createMilkAnimation(container) {
    const milk = document.createElement('div');
    milk.className = 'animation-particle';
    milk.innerHTML = '🥛';
    milk.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        animation: milkPour 2s ease-out forwards;
        z-index: 51;
    `;
    
    container.appendChild(milk);
    
    setTimeout(() => {
        if (milk.parentNode) {
            milk.remove();
        }
    }, 2000);
}

function createHoneyAnimation(container) {
    const honey = document.createElement('div');
    honey.className = 'animation-particle';
    honey.innerHTML = '🍯';
    honey.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        animation: honeyDrip 2s ease-out forwards;
        z-index: 51;
    `;
    
    container.appendChild(honey);
    
    setTimeout(() => {
        if (honey.parentNode) {
            honey.remove();
        }
    }, 2000);
}

function createGheeAnimation(container) {
    const ghee = document.createElement('div');
    ghee.className = 'animation-particle';
    ghee.innerHTML = '🕯️';
    ghee.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        animation: gheeGlow 2s ease-out forwards;
        z-index: 51;
    `;
    
    container.appendChild(ghee);
    
    setTimeout(() => {
        if (ghee.parentNode) {
            ghee.remove();
        }
    }, 2000);
}

function createCoconutAnimation(container) {
    const coconut = document.createElement('div');
    coconut.className = 'animation-particle';
    coconut.innerHTML = '🥥';
    coconut.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        animation: coconutOffer 2s ease-out forwards;
        z-index: 51;
    `;
    
    container.appendChild(coconut);
    
    setTimeout(() => {
        if (coconut.parentNode) {
            coconut.remove();
        }
    }, 2000);
}

function createGenericOfferingAnimation(container, type) {
    const offering = document.createElement('div');
    offering.className = 'animation-particle';
    offering.innerHTML = '🎁';
    offering.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        animation: offeringGlow 2s ease-out forwards;
        z-index: 51;
    `;
    
    container.appendChild(offering);
    
    setTimeout(() => {
        if (offering.parentNode) {
            offering.remove();
        }
    }, 2000);
}

// ===========================================================
// PREMIUM SPLASH SCREEN ANIMATIONS
// ===========================================================

function startSplashAnimation() {
    // Loading progress animation
    const loadingProgress = document.querySelector('.loading-progress');
    if (loadingProgress) {
        loadingProgress.style.animation = 'loadingProgress 3s ease-in-out forwards';
    }
    
    // Auto transition to login after 3 seconds
    setTimeout(() => {
        if (currentUser) {
            showScreen('home');
        } else {
            showScreen('login');
        }
    }, 3000);
}

function startFloatingBlessings() {
    const blessings = ['ॐ', 'शांति', 'शिव', 'शक्ति', 'कृष्ण', 'राम', 'हनुमान', 'गणेश', 'दुर्गा', 'लक्ष्मी'];
    const containers = [floatingBlessings, floatingBlessingsJap];
    
    containers.forEach(container => {
        if (!container) return;
        
        setInterval(() => {
            if (Math.random() < 0.3) {
                const blessing = document.createElement('div');
                blessing.className = 'blessing';
                blessing.textContent = blessings[Math.floor(Math.random() * blessings.length)];
                blessing.style.left = Math.random() * 80 + 10 + '%';
                blessing.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
                blessing.style.opacity = Math.random() * 0.5 + 0.5;
                
                container.appendChild(blessing);
                
                setTimeout(() => {
                    if (blessing.parentNode) {
                        blessing.remove();
                    }
                }, 3000);
            }
        }, 2000);
    });
}

function startLotusPetals() {
    if (!lotusPetals) return;
    
    setInterval(() => {
        if (Math.random() < 0.2) {
            const petal = document.createElement('div');
            petal.className = 'lotus-petal';
            petal.textContent = '🌸';
            petal.style.left = Math.random() * 90 + 5 + '%';
            petal.style.fontSize = (Math.random() * 1 + 1) + 'rem';
            
            lotusPetals.appendChild(petal);
            
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.remove();
                }
            }, 5000);
        }
    }, 1000);
}

// ===========================================================
// UTILITY FUNCTIONS
// ===========================================================

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        japCount = 0;
        malaCount = 0;
        currentBead = 1;
        sessionJapCount = 0;
        japTimes = [];
        interactiveDecorations = [];
        activeDecorations.clear();
        activeOfferings.clear();
        
        Object.keys(PREMIUM_THEMES).forEach(theme => {
            PREMIUM_THEMES[theme].unlocked = theme === 'mahadev';
        });
        savePremiumThemes();
        
        localStorage.setItem('profileName', 'User');
        localStorage.setItem('customMantra', 'Om Namah Shivaya');
        localStorage.setItem('selectedGodName', 'Shiva');
        localStorage.setItem('theme', 'mahadev');
        
        // Clear IndexedDB storage
        clearAllGLBStorage();
        
        updateCounters();
        updateKarmaMeter();
        loadProfileData();
        loadAllGLBModels();
        updateThemeUI();
        showMessage('All data has been cleared.', 'success');
    }
}

function showMessage(message, type = 'info', duration = 3000) {
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        text-align: center;
        max-width: 80%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: messageSlideIn 0.3s ease-out;
    `;
    
    switch (type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
            break;
        case 'error':
            messageDiv.style.background = 'linear-gradient(45deg, #ff416c, #ff4b2b)';
            break;
        case 'info':
            messageDiv.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
            break;
        default:
            messageDiv.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'messageSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, duration);
}

// Add message animations to CSS
if (!document.querySelector('#message-styles')) {
    const messageStyles = document.createElement('style');
    messageStyles.id = 'message-styles';
    messageStyles.textContent = `
        @keyframes messageSlideIn {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes messageSlideOut {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
        }
        
        @keyframes sparkAnimation {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(3);
                opacity: 0;
            }
        }
        
        @keyframes fallingPetal {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes flameFlicker {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes smokeRise {
            to {
                transform: translate(-50%, -100vh);
                opacity: 0;
            }
        }
        
        @keyframes fruitFall {
            to {
                transform: translateY(100px);
                opacity: 0;
            }
        }
        
        @keyframes sweetBounce {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
        }
        
        @keyframes waterDrop {
            to {
                transform: translateY(100px);
                opacity: 0;
            }
        }
        
        @keyframes milkPour {
            0% { transform: translate(-50%, -50%) scale(0); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes honeyDrip {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -30%) scale(0.8); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes gheeGlow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.5); }
        }
        
        @keyframes coconutOffer {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes offeringGlow {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes godNameFloat {
            0% {
                transform: translateY(100px) scale(0.5);
                opacity: 0;
            }
            20% {
                transform: translateY(50px) scale(1.2);
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) scale(0.8);
                opacity: 0;
            }
        }
        
        @keyframes smoothCount {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(messageStyles);
}

// ===========================================================
// GLOBAL FUNCTION EXPORTS
// ===========================================================

window.showScreen = showScreen;
window.login = login;
window.signup = signup;
window.resetPassword = resetPassword;
window.logout = logout;
window.toggleHandFreeMode = toggleHandFreeMode;
window.clearData = clearData;
window.changeTheme = changeTheme;
window.toggleChakraMode = toggleChakraMode;
window.toggleMandalaMode = toggleMandalaMode;
window.resetSession = resetSession;
window.saveCustomMantra = saveCustomMantra;
window.saveProfile = saveProfile;
window.selectGodName = selectGodName;
window.showCustomGodInput = showCustomGodInput;
window.saveCustomGodName = saveCustomGodName;
window.inviteFriends = inviteFriends;
window.showThemeStore = showThemeStore;
window.payUsingUPI = payUsingUPI;
window.closeUPISuccessModal = closeUPISuccessModal;

// Mandir Builder Functions
window.openFullscreenMandir = openFullscreenMandir;
window.closeFullscreenMandir = closeFullscreenMandir;
window.openUploadGodPanel = openUploadGodPanel;
window.closeUploadGodPanel = closeUploadGodPanel;
window.openOfferingPanel = openOfferingPanel;
window.closeOfferingPanel = closeOfferingPanel;
window.openDecorationPanel = openDecorationPanel;
window.closeDecorationPanel = closeDecorationPanel;
window.openCustomDecorationPanel = openCustomDecorationPanel;
window.closeCustomDecorationPanel = closeCustomDecorationPanel;
window.openMandirBackgroundPanel = openMandirBackgroundPanel;
window.closeMandirBackgroundPanel = closeMandirBackgroundPanel;
window.playOfferingAnimation = playOfferingAnimation;
window.resetMandirGod = resetMandirGod;
window.resetMandirBackground = resetMandirBackground;
window.clearAllDecorations = clearAllDecorations;
window.toggleSunkhMenu = toggleSunkhMenu;

// Background Edit Functions
window.toggleBackgroundEditMode = toggleBackgroundEditMode;
window.exitBackgroundEditMode = exitBackgroundEditMode;
window.resetBackgroundSize = resetBackgroundSize;
window.centerBackground = centerBackground;

// GLB Management Functions
window.openGLBManagement = openGLBManagement;
window.closeGLBManagement = closeGLBManagement;

// Payment Functions
window.initiatePayment = initiatePayment;

// Prevent zoom on mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle model viewer errors
document.addEventListener('model-viewer-error', (e) => {
    console.log('3D model error:', e.detail);
    const modelViewer = e.target;
    modelViewer.style.background = 'rgba(255, 215, 0, 0.1)';
    modelViewer.style.display = 'flex';
    modelViewer.style.alignItems = 'center';
    modelViewer.style.justifyContent = 'center';
    modelViewer.innerHTML = '<div style="text-align: center; color: #ffd700; font-size: 0.9rem;">3D Model<br>Loading...</div>';
});

// Show Firebase setup instructions if config is not set
if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
    setTimeout(() => {
        const firebaseSetup = document.createElement('div');
        firebaseSetup.id = 'firebase-setup';
        firebaseSetup.style.cssText = `
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            color: white;
            z-index: 10000;
            padding: 20px;
            overflow-y: auto;
        `;
        firebaseSetup.innerHTML = `
            <div style="max-width: 600px; margin: 50px auto; background: #1a1a2e; padding: 20px; border-radius: 10px; border: 2px solid #ffd700;">
                <h2 style="color: #ffd700; text-align: center;">Firebase Setup Required</h2>
                <p>To enable login functionality, you need to set up Firebase:</p>
                <ol>
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" style="color: #ffd700;">Firebase Console</a></li>
                    <li>Create a new project</li>
                    <li>Enable Authentication → Email/Password</li>
                    <li>Copy your config and replace in script.js</li>
                </ol>
                <div style="background: #2a2a4e; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <code style="color: #ffd700;">
                        const firebaseConfig = {<br>
                        &nbsp;&nbsp;apiKey: "your-api-key",<br>
                        &nbsp;&nbsp;authDomain: "your-project.firebaseapp.com",<br>
                        &nbsp;&nbsp;projectId: "your-project-id",<br>
                        &nbsp;&nbsp;storageBucket: "your-project.appspot.com",<br>
                        &nbsp;&nbsp;messagingSenderId: "123456789",<br>
                        &nbsp;&nbsp;appId: "your-app-id"<br>
                        };
                    </code>
                </div>
                <p style="color: #00ff00;">For testing, use demo credentials:<br>
                Email: demo@divinemantra.com<br>
                Password: demo123</p>
                <button onclick="document.getElementById('firebase-setup').remove()" 
                        style="background: #ffd700; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: block; margin: 20px auto;">
                    I Understand
                </button>
            </div>
        `;
        document.body.appendChild(firebaseSetup);
    }, 5000);
}