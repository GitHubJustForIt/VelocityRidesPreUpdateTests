// ============================================
// VELOCITY RIDES - MAIN APP LOGIC
// ============================================

let currentUser = null;
let currentFilter = 'all';
let selectedTemplate = null;
let searchQuery = '';

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
            
            // Show/hide clear button
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
            !notificationBtn.contains(e.target)) {
            closeNotificationPanel();
        }
    });
    
    // Initial render
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
    const notifications = getNotifications();
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
            markNotificationAsRead(id);
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
    
    // Filter templates based on current filter and search
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

// Filter templates based on current filter, search, and user
function filterTemplates(templates) {
    return templates.filter(template => {
        // Apply search filter
        if (!matchesSearch(template)) {
            return false;
        }
        
        const isPendingByUser = isPending(template.id, currentUser);
        const isOwnedByUser = template.purchased && template.buyer === currentUser;
        
        // Apply filter
        switch (currentFilter) {
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

// Create template card element
function createTemplateCard(template, index) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const isPendingByUser = isPending(template.id, currentUser);
    const isOwnedByUser = template.purchased && template.buyer === currentUser;
    const isSoldToOther = template.purchased && !isOwnedByUser;
    
    // Add sold class if sold to someone else
    if (isSoldToOther) {
        card.classList.add('sold');
    }
    
    // Determine badge
    let badgeHTML = '';
    if (isSoldToOther) {
        badgeHTML = '<span class="badge badge-sold">SOLD</span>';
    } else if (isPendingByUser) {
        badgeHTML = '<span class="badge badge-pending">PENDING</span>';
    } else if (isOwnedByUser) {
        badgeHTML = '<span class="badge badge-owned">OWNED</span>';
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
    
    // Click handler - only open modal if not sold to someone else
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
}

function openModal(template) {
    selectedTemplate = template;
    const overlay = document.getElementById('modal-overlay');
    
    const isPendingByUser = isPending(template.id, currentUser);
    const isOwnedByUser = template.purchased && template.buyer === currentUser;
    const canPurchase = !template.purchased && !isPendingByUser;
    
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
    } else if (isPendingByUser) {
        badge.className = 'badge badge-pending';
        badge.textContent = 'PENDING';
        badge.style.display = 'block';
    } else if (isOwnedByUser) {
        badge.className = 'badge badge-owned';
        badge.textContent = 'OWNED';
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
    
    // Disable form
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Send Discord notification
        const success = await sendDiscordWebhook(selectedTemplate, contact);
        
        if (success) {
            // Add to pending
            addPendingPurchase(selectedTemplate.id, currentUser, contact);
            
            // Add notification
            addNotification(
                'warning',
                'Purchase Pending',
                `Your purchase request for "${selectedTemplate.title}" is being processed.`,
                selectedTemplate.id
            );
            
            // Show success message
            showToast('Purchase request submitted successfully!', 'success');
            
            // Close modal after delay
            setTimeout(() => {
                closeModal();
                renderTemplates(); // Re-render to update badges
                renderNotifications(); // Update notifications
            }, 1500);
        } else {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        showToast('Failed to submit purchase request. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================
// Discord Webhook
// ============================================

async function sendDiscordWebhook(template, contact) {
    const webhookUrl = getWebhookUrl();
    
    // Validierung der URL
    if (!webhookUrl || webhookUrl.includes("HIER_EINFÜGEN")) {
        console.error("❌ Webhook URL fehlt oder ist ungültig!");
        return false;
    }

    const embed = {
        title: '🎮 New Purchase Request - Velocity Rides',
        color: 3447003, // Professional Blue
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

    // Thumbnail nur hinzufügen, wenn ein Bild vorhanden ist
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
// This function simulates when an admin marks a template as purchased
// In a real application, this would be triggered by your backend/admin panel

function simulatePurchaseCompletion(templateId, buyerUsername) {
    // Mark template as purchased
    const success = markTemplateAsPurchased(templateId, buyerUsername);
    
    if (success) {
        // Add notification to buyer
        const template = getTemplateById(templateId);
        if (template) {
            addNotification(
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

// Make this function available globally for testing
window.simulatePurchaseCompletion = simulatePurchaseCompletion;

// ============================================
// Initialize on DOM ready
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getUser();
    if (user && user.username) {
        initDashboard(user.username);
    }
});
