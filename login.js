// ============================================
// VELOCITY RIDES - LOGIN LOGIC
// ============================================

// LocalStorage Keys
const STORAGE_KEYS = {
    USER: 'velocity_rides_user',
    PENDING: 'velocity_rides_pending',
    NOTIFICATIONS: 'velocity_rides_notifications',
    WISHLIST: 'velocity_rides_wishlist'
};

// ============================================
// LocalStorage Helper Functions
// ============================================

// User Management
function getUser() {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
}

function setUser(username) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ username }));
}

function clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// Pending Purchases Management
function getPendingPurchases() {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING);
    return data ? JSON.parse(data) : [];
}

function addPendingPurchase(templateId, username, contact, selectedDate) {
    const pending = getPendingPurchases();
    pending.push({
        templateId,
        username,
        contact,
        selectedDate,
        timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(pending));
}

function isPending(templateId, username) {
    const pending = getPendingPurchases();
    return pending.some(p => p.templateId === templateId && p.username === username);
}

function getUserPendingPurchases(username) {
    const pending = getPendingPurchases();
    return pending.filter(p => p.username === username);
}

function removePendingPurchase(templateId) {
    const pending = getPendingPurchases();
    const filtered = pending.filter(p => p.templateId !== templateId);
    localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(filtered));
}

// Remove pending status for all users except the buyer
function removePendingForOtherUsers(templateId, buyerUsername) {
    const pending = getPendingPurchases();
    const filtered = pending.filter(p => {
        return p.templateId !== templateId || p.username === buyerUsername;
    });
    localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(filtered));
}

// Remove pending status for a specific user and template
function removePendingForUser(templateId, username) {
    const pending = getPendingPurchases();
    const filtered = pending.filter(p => 
        !(p.templateId === templateId && p.username === username)
    );
    localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(filtered));
}

// ============================================
// Wishlist Management
// ============================================

function getWishlist() {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return data ? JSON.parse(data) : [];
}

function addToWishlist(templateId, username) {
    const wishlist = getWishlist();
    
    // Check if already in wishlist
    const exists = wishlist.some(w => w.templateId === templateId && w.username === username);
    if (exists) return false;
    
    wishlist.push({
        templateId,
        username,
        timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return true;
}

function removeFromWishlist(templateId, username) {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(w => 
        !(w.templateId === templateId && w.username === username)
    );
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(filtered));
}

function isInWishlist(templateId, username) {
    const wishlist = getWishlist();
    return wishlist.some(w => w.templateId === templateId && w.username === username);
}

function getUserWishlist(username) {
    const wishlist = getWishlist();
    return wishlist.filter(w => w.username === username);
}

// Remove from wishlist when template is purchased or owned
function removeFromWishlistIfOwned(templateId, username) {
    removeFromWishlist(templateId, username);
}

// ============================================
// Notifications Management (User-Specific)
// ============================================

function getNotifications(username) {
    if (!username) return [];
    
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const allNotifications = data ? JSON.parse(data) : [];
    
    // Filter by username and remove old notifications (older than 24h)
    const now = Date.now();
    const userNotifications = allNotifications.filter(n => {
        if (n.username !== username) return false;
        
        const age = now - n.timestamp;
        const hours = age / (1000 * 60 * 60);
        return hours < 24;
    });
    
    // Clean up old notifications from storage
    const validNotifications = allNotifications.filter(n => {
        const age = now - n.timestamp;
        const hours = age / (1000 * 60 * 60);
        return hours < 24;
    });
    
    if (validNotifications.length !== allNotifications.length) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(validNotifications));
    }
    
    return userNotifications;
}

function addNotification(username, type, title, message, templateId = null) {
    if (!username) return;
    
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : [];
    
    notifications.unshift({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        username,
        type, // 'success', 'warning', 'info', 'error'
        title,
        message,
        templateId,
        timestamp: Date.now(),
        read: false
    });
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    // Update notification badge if this is for the current user
    const currentUser = getUser();
    if (currentUser && currentUser.username === username) {
        updateNotificationBadge(username);
    }
}

function markNotificationAsRead(username, notificationId) {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : [];
    
    const notification = notifications.find(n => n.id === notificationId && n.username === username);
    
    if (notification) {
        notification.read = true;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        updateNotificationBadge(username);
    }
}

function clearAllNotifications(username) {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : [];
    
    // Remove only this user's notifications
    const filtered = notifications.filter(n => n.username !== username);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    updateNotificationBadge(username);
}

function getUnreadNotificationCount(username) {
    const notifications = getNotifications(username);
    return notifications.filter(n => !n.read).length;
}

function updateNotificationBadge(username) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    const count = getUnreadNotificationCount(username);
    
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// Login/Logout Logic
// ============================================

// Check if user is already logged in
function checkLogin() {
    const user = getUser();
    if (user && user.username) {
        showDashboard(user.username);
        return true;
    }
    showLogin();
    return false;
}

// Show login screen
function showLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('dashboard-screen').classList.remove('active');
}

// Show dashboard
function showDashboard(username) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    document.getElementById('logged-user').textContent = username;
    
    // Update notification badge
    updateNotificationBadge(username);
    
    // Initialize dashboard wenn app.js geladen ist
    if (typeof initDashboard === 'function') {
        initDashboard(username);
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    // Save user
    setUser(username);
    
    // Show dashboard
    showDashboard(username);
    
    // Show welcome toast (not saved as notification)
    showToast(`Welcome, ${username}!`, 'success');
}

// Handle logout
function handleLogout() {
    clearUser();
    showLogin();
    showToast('Logged out successfully', 'info');
}

// ============================================
// Event Listeners - Wait for DOM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check if user is already logged in
    checkLogin();
});

// ============================================
// Toast Notification Function
// ============================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // Set message
    toast.textContent = message;
    
    // Set type class
    toast.className = 'toast show toast-' + type;
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
