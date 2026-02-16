// ============================================
// VELOCITY RIDES - MAIN APP LOGIC
// ============================================

let currentUser = null;
let currentFilter = 'all';
let selectedTemplate = null;
let searchQuery = '';
let selectedDate = null;
let pendingPurchaseData = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// ============================================
// Initialize Dashboard
// ============================================

function initDashboard(username) {
    currentUser = username;
    renderTemplates();
    setupFilterButtons();
    setupModal();
    setupSearch();
    setupNotificationPanel();
    setupReportModal();
    setupCalendarModal();
}

// ============================================
// Search Functionality
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            
            if (searchQuery) {
                searchClear.style.display = 'flex';
            } else {
                searchClear.style.display = 'none';
            }
            
            renderTemplates();
        });
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClear.style.display = 'none';
            renderTemplates();
            searchInput.focus();
        });
    }
}

function matchesSearch(template) {
    if (!searchQuery) return true;
    
    const searchableText = [
        template.title,
        template.description,
        template.gamepass,
        ...template.tags
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchQuery);
}

// ============================================
// Notification Panel
// ============================================

function setupNotificationPanel() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationPanelClose = document.getElementById('notification-panel-close');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationPanel();
        });
    }
    
    if (notificationPanelClose) {
        notificationPanelClose.addEventListener('click', () => {
            closeNotificationPanel();
        });
    }
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationPanel && 
            !notificationPanel.contains(e.target) && 
            e.target !== notificationBtn &&
            !notificationBtn.contains(e.target)) {
            closeNotificationPanel();
        }
    });
    
    renderNotifications();
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel.classList.contains('show')) {
        closeNotificationPanel();
    } else {
        openNotificationPanel();
    }
}

function openNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.add('show');
    renderNotifications();
}

function closeNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.remove('show');
}

function renderNotifications() {
    const notifications = getNotifications(currentUser);
    const content = document.getElementById('notification-panel-content');
    const empty = document.getElementById('notification-empty');
    
    if (notifications.length === 0) {
        content.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }
    
    content.style.display = 'block';
    empty.style.display = 'none';
    
    content.innerHTML = notifications.map(notification => {
        const timeAgo = getTimeAgo(notification.timestamp);
        const unreadClass = notification.read ? '' : 'unread';
        
        return `
            <div class="notification-item ${unreadClass}" data-id="${notification.id}">
                <div class="notification-item-header">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers to notifications
    content.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            markNotificationAsRead(currentUser, id);
            item.classList.remove('unread');
        });
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-circle',
        info: 'info-circle',
        error: 'times-circle'
    };
    return icons[type] || 'bell';
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
}

// ============================================
// Template Rendering
// ============================================

function renderTemplates() {
    const grid = document.getElementById('templates-grid');
    const emptyState = document.getElementById('empty-state');
    const allTemplates = getAllTemplates();
    
    // Filter templates
    const filteredTemplates = filterTemplates(allTemplates);
    
    // Clear grid
    grid.innerHTML = '';
    
    // Show/hide empty state
    if (filteredTemplates.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
    }
    
    // Render each template
    filteredTemplates.forEach((template, index) => {
        const card = createTemplateCard(template, index);
        grid.appendChild(card);
    });
}

function filterTemplates(templates) {
    return templates.filter(template => {
        // Apply search filter
        if (!matchesSearch(template)) {
            return false;
        }
        
        const isPendingByUser = isPending(template.id, currentUser);
        const isOwnedByUser = template.purchased && template.buyer === currentUser;
        const inWishlist = isInWishlist(template.id, currentUser);
        
        // Apply filter
        switch (currentFilter) {
            case 'wishlist':
                return inWishlist && !isOwnedByUser;
            case 'pending':
                return isPendingByUser;
            case 'purchased':
                return isOwnedByUser;
            case 'all':
            default:
                return true;
        }
    });
}

function createTemplateCard(template, index) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const isPendingByUser = isPending(template.id, currentUser);
    const isOwnedByUser = template.purchased && template.buyer === currentUser;
    const isSoldToOther = template.purchased && !isOwnedByUser;
    
    if (isSoldToOther) {
        card.classList.add('sold');
    }
    
    // Determine badge
    let badgeHTML = '';
    if (isSoldToOther) {
        badgeHTML = '<span class="badge badge-sold">SOLD</span>';
    } else if (isOwnedByUser) {
        badgeHTML = '<span class="badge badge-owned">PURCHASED</span>';
    } else if (isPendingByUser) {
        badgeHTML = '<span class="badge badge-pending">PENDING</span>';
    }
    
    // Sold overlay
    let soldOverlayHTML = '';
    if (isSoldToOther) {
        soldOverlayHTML = `
            <div class="sold-overlay">
                <div class="sold-text">SOLD</div>
            </div>
        `;
    }
    
    // Generate tags HTML
    const tagsHTML = template.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${template.image}" alt="${template.title}" class="card-image">
            <div class="card-image-overlay"></div>
            ${soldOverlayHTML}
            ${badgeHTML}
            <div class="card-price-tag">
                <span class="card-price">$${template.price}</span>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-title">${template.title}</h3>
            <p class="card-description">${template.description}</p>
            <div class="card-gamepass">
                <i class="fas fa-shopping-cart"></i>
                <span>${template.gamepass}</span>
            </div>
            <div class="card-tags">
                <i class="fas fa-tag"></i>
                ${tagsHTML}
            </div>
        </div>
    `;
    
    // Click handler
    if (!isSoldToOther) {
        card.addEventListener('click', () => openModal(template));
    }
    
    return card;
}

// ============================================
// Filter Buttons
// ============================================

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter
            currentFilter = btn.dataset.filter;
            
            // Re-render templates
            renderTemplates();
        });
    });
}

// ============================================
// Modal Logic
// ============================================

function setupModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const purchaseForm = document.getElementById('purchase-form');
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Handle purchase form
    purchaseForm.addEventListener('submit', handlePurchaseSubmit);
    
    // Report button
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            openReportModal();
        });
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', handleWishlistToggle);
    }
}

function openModal(template) {
    selectedTemplate = template;
    const overlay = document.getElementById('modal-overlay');
    
    const isPendingByUser = isPending(template.id, currentUser);
    const isOwnedByUser = template.purchased && template.buyer === currentUser;
    const canPurchase = !template.purchased && !isPendingByUser;
    const inWishlist = isInWishlist(template.id, currentUser);
    
    // Populate modal
    document.getElementById('modal-image').src = template.image;
    document.getElementById('modal-title').textContent = template.title;
    document.getElementById('modal-description').textContent = template.description;
    document.getElementById('modal-price').textContent = `$${template.price}`;
    document.getElementById('modal-gamepass').textContent = template.gamepass;
    document.getElementById('modal-username').textContent = currentUser;
    
    // Badge
    const badge = document.getElementById('modal-badge');
    if (template.purchased && !isOwnedByUser) {
        badge.className = 'badge badge-sold';
        badge.textContent = 'SOLD';
        badge.style.display = 'block';
    } else if (isOwnedByUser) {
        badge.className = 'badge badge-owned';
        badge.textContent = 'PURCHASED';
        badge.style.display = 'block';
    } else if (isPendingByUser) {
        badge.className = 'badge badge-pending';
        badge.textContent = 'PENDING';
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
    
    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = template.tags.map(tag => 
        `<span class="tag-large">${tag}</span>`
    ).join('');
    
    // Show/hide form and status messages
    document.getElementById('purchase-form').style.display = canPurchase ? 'block' : 'none';
    document.getElementById('status-pending').style.display = isPendingByUser ? 'flex' : 'none';
    document.getElementById('status-owned').style.display = isOwnedByUser ? 'flex' : 'none';
    
    const statusSold = document.getElementById('status-sold');
    if (template.purchased && !isOwnedByUser) {
        statusSold.style.display = 'flex';
        document.getElementById('status-sold-text').textContent = 
            `This template has been purchased by ${template.buyer}.`;
    } else {
        statusSold.style.display = 'none';
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistBtnText = document.getElementById('wishlist-btn-text');
    
    if (template.purchased) {
        wishlistBtn.style.display = 'none';
    } else {
        wishlistBtn.style.display = 'block';
        
        if (inWishlist) {
            wishlistBtn.classList.add('in-wishlist');
            wishlistBtnText.textContent = 'Remove from Wishlist';
        } else {
            wishlistBtn.classList.remove('in-wishlist');
            wishlistBtnText.textContent = 'Add to Wishlist';
        }
    }
    
    // Show modal
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    selectedTemplate = null;
    
    // Reset form
    document.getElementById('contact-input').value = '';
}

// ============================================
// Wishlist Functions
// ============================================

function handleWishlistToggle() {
    if (!selectedTemplate) return;
    
    const inWishlist = isInWishlist(selectedTemplate.id, currentUser);
    
    if (inWishlist) {
        removeFromWishlist(selectedTemplate.id, currentUser);
        showToast('Removed from wishlist', 'info');
    } else {
        const added = addToWishlist(selectedTemplate.id, currentUser);
        if (added) {
            showToast('Added to wishlist', 'success');
        }
    }
    
    // Update button
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistBtnText = document.getElementById('wishlist-btn-text');
    
    if (!inWishlist) {
        wishlistBtn.classList.add('in-wishlist');
        wishlistBtnText.textContent = 'Remove from Wishlist';
    } else {
        wishlistBtn.classList.remove('in-wishlist');
        wishlistBtnText.textContent = 'Add to Wishlist';
    }
    
    // Re-render if on wishlist filter
    if (currentFilter === 'wishlist') {
        renderTemplates();
    }
}

// ============================================
// Calendar Modal
// ============================================

function setupCalendarModal() {
    const overlay = document.getElementById('calendar-modal-overlay');
    const closeBtn = document.getElementById('calendar-modal-close');
    const cancelBtn = document.getElementById('calendar-cancel');
    const continueBtn = document.getElementById('calendar-continue');
    const prevMonth = document.getElementById('calendar-prev-month');
    const nextMonth = document.getElementById('calendar-next-month');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCalendarModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCalendarModal);
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', handleCalendarContinue);
    }
    
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }
    
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCalendarModal();
            }
        });
    }
}

function openCalendarModal() {
    const overlay = document.getElementById('calendar-modal-overlay');
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    selectedDate = null;
    
    renderCalendar();
    updateSelectedDateDisplay();
    
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCalendarModal() {
    const overlay = document.getElementById('calendar-modal-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    selectedDate = null;
    pendingPurchaseData = null;
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthYear = document.getElementById('calendar-month-year');
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysContainer.appendChild(emptyDay);
    }
    
    // Add days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayElement = document.createElement('button');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.type = 'button';
        
        // Check if today
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Check if selected
        if (selectedDate && 
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()) {
            dayElement.classList.add('selected');
        }
        
        // Check if selectable
        if (isDateSelectable(date)) {
            dayElement.addEventListener('click', () => selectDate(date));
        } else {
            dayElement.classList.add('disabled');
        }
        
        daysContainer.appendChild(dayElement);
    }
}

function isDateSelectable(date) {
    // Can't select past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday, 5 = Friday
    
    // Get week number of year
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    const isEvenWeek = weekNumber % 2 === 0;
    
    // Jede zweite Woche Freitags (even weeks)
    if (dayOfWeek === 5 && isEvenWeek) return true;
    
    // Immer Samstags
    if (dayOfWeek === 6) return true;
    
    // Jede zweite Woche Sonntags (even weeks)
    if (dayOfWeek === 0 && isEvenWeek) return true;
    
    return false;
}

function selectDate(date) {
    selectedDate = date;
    renderCalendar();
    updateSelectedDateDisplay();
    
    // Enable continue button
    const continueBtn = document.getElementById('calendar-continue');
    continueBtn.disabled = false;
}

function updateSelectedDateDisplay() {
    const display = document.getElementById('selected-date-display');
    const text = document.getElementById('selected-date-text');
    const continueBtn = document.getElementById('calendar-continue');
    
    if (selectedDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        text.textContent = selectedDate.toLocaleDateString('en-US', options);
        display.style.display = 'flex';
        continueBtn.disabled = false;
    } else {
        display.style.display = 'none';
        continueBtn.disabled = true;
    }
}

async function handleCalendarContinue() {
    if (!selectedDate || !pendingPurchaseData) return;
    
    const { template, contact } = pendingPurchaseData;
    
    // Disable button
    const continueBtn = document.getElementById('calendar-continue');
    const originalText = continueBtn.innerHTML;
    continueBtn.disabled = true;
    continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Send Discord webhook
        const success = await sendDiscordWebhook(template, contact, selectedDate);
        
        if (success) {
            // Add to pending with selected date
            addPendingPurchase(template.id, currentUser, contact, selectedDate);
            
            // Add notification
            addNotification(
                currentUser,
                'warning',
                'Purchase Pending',
                `Your purchase request for "${template.title}" is being processed. Pickup date: ${selectedDate.toLocaleDateString('en-US')}`,
                template.id
            );
            
            // Show success message
            showToast('Purchase request submitted successfully!', 'success');
            
            // Close modals
            closeCalendarModal();
            closeModal();
            
            // Re-render
            renderTemplates();
            renderNotifications();
        } else {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        showToast('Failed to submit purchase request. Please try again.', 'error');
        continueBtn.disabled = false;
        continueBtn.innerHTML = originalText;
    }
}

// ============================================
// Report Modal
// ============================================

function setupReportModal() {
    const overlay = document.getElementById('report-modal-overlay');
    const closeBtn = document.getElementById('report-modal-close');
    const cancelBtn = document.getElementById('report-cancel');
    const reportForm = document.getElementById('report-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReportModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReportModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeReportModal();
            }
        });
    }
    
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }
}

function openReportModal() {
    if (!selectedTemplate) return;
    
    const overlay = document.getElementById('report-modal-overlay');
    overlay.classList.add('show');
}

function closeReportModal() {
    const overlay = document.getElementById('report-modal-overlay');
    overlay.classList.remove('show');
    
    // Reset form
    document.getElementById('report-issue').value = '';
}

async function handleReportSubmit(event) {
    event.preventDefault();
    
    if (!selectedTemplate) return;
    
    const issueInput = document.getElementById('report-issue');
    const issue = issueInput.value.trim();
    
    if (!issue) {
        showToast('Please describe the issue', 'error');
        return;
    }
    
    // Disable form
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        // Send report to Discord
        const success = await sendReportWebhook(selectedTemplate, currentUser, issue);
        
        if (success) {
            showToast('Report submitted successfully!', 'success');
            
            // Add notification
            addNotification(
                currentUser,
                'info',
                'Report Submitted',
                `Your report for "${selectedTemplate.title}" has been sent to the team.`,
                selectedTemplate.id
            );
            
            // Close modals
            closeReportModal();
            
            setTimeout(() => {
                renderNotifications();
            }, 500);
        } else {
            throw new Error('Failed to send report');
        }
    } catch (error) {
        console.error('Report error:', error);
        showToast('Failed to submit report. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================
// Purchase Logic
// ============================================

async function handlePurchaseSubmit(event) {
    event.preventDefault();
    
    if (!selectedTemplate) return;
    
    const contactInput = document.getElementById('contact-input');
    const contact = contactInput.value.trim();
    
    if (!contact) {
        showToast('Please enter your contact information', 'error');
        return;
    }
    
    // Store pending purchase data
    pendingPurchaseData = {
        template: selectedTemplate,
        contact: contact
    };
    
    // Close main modal and open calendar
    closeModal();
    
    // Scroll to calendar section smoothly
    setTimeout(() => {
        openCalendarModal();
    }, 300);
}

// ============================================
// Discord Webhook
// ============================================

async function sendDiscordWebhook(template, contact, pickupDate) {
    const webhookUrl = getWebhookUrl();
    
    if (!webhookUrl || webhookUrl.includes("HIER_EINFÜGEN")) {
        console.error("❌ Webhook URL fehlt oder ist ungültig!");
        return false;
    }

    const dateStr = pickupDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const embed = {
        title: '🎮 New Purchase Request - Velocity Rides',
        color: 3447003,
        fields: [
            {
                name: '👤 Username',
                value: currentUser || "Unknown User",
                inline: true
            },
            {
                name: '🆔 Product ID',
                value: String(template.id),
                inline: true
            },
            {
                name: '📞 Contact Information',
                value: contact,
                inline: false
            },
            {
                name: '📅 Pickup Date',
                value: dateStr,
                inline: false
            },
            {
                name: 'Product',
                value: template.title,
                inline: false
            },
            {
                name: 'Price',
                value: `$${template.price}`,
                inline: true
            },
            {
                name: 'Gamepass',
                value: template.gamepass,
                inline: true
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Velocity Rides Dashboard'
        }
    };

    if (template.image) {
        embed.thumbnail = { url: template.image };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `🔔 **Neue Bestellung von ${currentUser}!**`,
                embeds: [embed]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Discord API Error:', errorData);
            throw new Error(`Webhook request failed with status ${response.status}`);
        }

        console.log('✅ Discord notification sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to send Discord notification:', error);
        return false;
    }
}

// ============================================
// Simulate Purchase Completion (for testing)
// ============================================

function simulatePurchaseCompletion(templateId, buyerUsername) {
    const success = markTemplateAsPurchased(templateId, buyerUsername);
    
    if (success) {
        const template = getTemplateById(templateId);
        if (template) {
            addNotification(
                buyerUsername,
                'success',
                'Purchase Completed!',
                `You have successfully purchased "${template.title}". The team will contact you soon.`,
                templateId
            );
        }
        
        // Re-render everything
        renderTemplates();
        renderNotifications();
        
        showToast('Template marked as purchased!', 'success');
    }
}

window.simulatePurchaseCompletion = simulatePurchaseCompletion;

// ============================================
// Initialize on DOM ready
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const user = getUser();
    if (user && user.username) {
        initDashboard(user.username);
    }
});
