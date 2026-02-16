<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Velocity Rides Dashboard</title>
    
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Login Screen -->
    <div id="login-screen" class="screen active">
        <div class="login-container">
            <div class="login-box">
                <div class="logo-container">
                    <div class="logo-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                </div>
                
                <h1 class="login-title">Velocity Rides</h1>
                <p class="login-subtitle">Access your digital template dashboard</p>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" placeholder="Enter your username" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-login">
                        <i class="fas fa-sign-in-alt"></i>
                        Enter Dashboard
                    </button>
                </form>
                
                <p class="login-footer">© 2026 Velocity Rides. All rights reserved.</p>
            </div>
        </div>
    </div>

    <!-- Dashboard Screen -->
    <div id="dashboard-screen" class="screen">
        <!-- Header -->
        <header class="header">
            <div class="container header-content">
                <div class="header-left">
                    <div class="logo-icon-small">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="header-info">
                        <h1 class="header-title">Velocity Rides</h1>
                        <p class="header-subtitle">Digital Templates</p>
                    </div>
                </div>
                
                <div class="header-right">
                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="search-input" class="search-input" placeholder="Search templates...">
                        <button id="search-clear" class="search-clear" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Notification Button -->
                    <button id="notification-btn" class="btn btn-icon notification-btn">
                        <i class="fas fa-bell"></i>
                        <span id="notification-badge" class="notification-badge" style="display: none;">0</span>
                    </button>
                    
                    <div class="user-info">
                        <p class="user-label">Logged in as</p>
                        <p class="user-name" id="logged-user"></p>
                    </div>
                    <button id="logout-btn" class="btn btn-outline">
                        <i class="fas fa-sign-out-alt"></i>
                        <span class="btn-text">Logout</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Notification Panel -->
        <div id="notification-panel" class="notification-panel">
            <div class="notification-panel-header">
                <h3 class="notification-panel-title">
                    <i class="fas fa-bell"></i>
                    Notifications
                </h3>
                <button id="notification-panel-close" class="notification-panel-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="notification-panel-content" class="notification-panel-content">
                <!-- Notifications will be inserted here -->
            </div>
            <div id="notification-empty" class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        </div>

        <!-- Main Content -->
        <main class="main-content">
            <div class="container">
                <!-- Steps Indicator -->
                <div class="steps-container">
                    <h3 class="steps-title">Purchase Process</h3>
                    <div class="steps-wrapper">
                        <div class="steps-line">
                            <div class="steps-line-progress"></div>
                        </div>
                        <div class="steps">
                            <div class="step step-animate" style="animation-delay: 0.1s">
                                <div class="step-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <p class="step-label">Set to Pending</p>
                            </div>
                            <div class="step step-animate" style="animation-delay: 0.2s">
                                <div class="step-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <p class="step-label">Purchased with Success</p>
                            </div>
                            <div class="step step-animate" style="animation-delay: 0.3s">
                                <div class="step-icon">
                                    <i class="fas fa-comment-dots"></i>
                                </div>
                                <p class="step-label">Waiting for team contact</p>
                            </div>
                            <div class="step step-animate" style="animation-delay: 0.4s">
                                <div class="step-icon">
                                    <i class="fas fa-wrench"></i>
                                </div>
                                <p class="step-label">Team builds product</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filters">
                    <button class="filter-btn active" data-filter="all">
                        <i class="fas fa-filter"></i>
                        All Templates
                    </button>
                    <button class="filter-btn" data-filter="pending">
                        <i class="fas fa-clock"></i>
                        Pending
                    </button>
                    <button class="filter-btn" data-filter="purchased">
                        <i class="fas fa-shopping-bag"></i>
                        Purchased
                    </button>
                </div>

                <!-- Templates Grid -->
                <div id="templates-grid" class="templates-grid">
                    <!-- Cards will be inserted here by app.js -->
                </div>

                <!-- Empty State -->
                <div id="empty-state" class="empty-state" style="display: none;">
                    <div class="empty-icon">
                        <i class="fas fa-filter"></i>
                    </div>
                    <h3 class="empty-title">No templates found</h3>
                    <p class="empty-text">Try adjusting your filters or search query</p>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <div class="container footer-content">
                <p>© 2026 Velocity Rides. All rights reserved.</p>
                <p class="footer-copyright">All templates and digital products are protected by copyright law.</p>
            </div>
        </footer>
    </div>

    <!-- Modal -->
    <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
            <button class="modal-close" id="modal-close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="modal-content">
                <div class="modal-image-section">
                    <img id="modal-image" src="" alt="" class="modal-image">
                    <div class="modal-image-overlay"></div>
                    <div id="modal-badge" class="badge"></div>
                    <div class="modal-price-tag">
                        <span id="modal-price"></span>
                    </div>
                </div>
                
                <div class="modal-details-section">
                    <h2 id="modal-title" class="modal-title"></h2>
                    <p id="modal-description" class="modal-description"></p>
                    
                    <div class="modal-gamepass">
                        <div class="gamepass-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div>
                            <p class="gamepass-label">Required Gamepass</p>
                            <p id="modal-gamepass" class="gamepass-name"></p>
                        </div>
                    </div>
                    
                    <div class="modal-tags-section">
                        <div class="tags-header">
                            <i class="fas fa-tag"></i>
                            <span>Tags</span>
                        </div>
                        <div id="modal-tags" class="modal-tags"></div>
                    </div>
                    
                    <div class="modal-user-info">
                        <p class="user-info-label">Logged in as</p>
                        <p id="modal-username" class="user-info-name"></p>
                    </div>
                    
                    <!-- Purchase Form -->
                    <form id="purchase-form" class="purchase-form">
                        <div class="form-group">
                            <label for="contact-input">Contact Information</label>
                            <input type="text" id="contact-input" placeholder="Discord, Email, or Phone" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-purchase">
                            <i class="fas fa-paper-plane"></i>
                            Confirm Pending Purchase
                        </button>
                    </form>
                    
                    <!-- Status Messages -->
                    <div id="status-pending" class="status-message status-warning" style="display: none;">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <p class="status-title">Purchase Pending</p>
                            <p class="status-text">Your purchase request is being processed. The team will contact you soon.</p>
                        </div>
                    </div>
                    
                    <div id="status-sold" class="status-message status-info" style="display: none;">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <p class="status-title">Already Sold</p>
                            <p id="status-sold-text" class="status-text"></p>
                        </div>
                    </div>
                    
                    <div id="status-owned" class="status-message status-success" style="display: none;">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <p class="status-title">You Own This</p>
                            <p class="status-text">This template is in your collection.</p>
                        </div>
                    </div>
                    
                    <!-- Report Button -->
                    <button id="report-btn" class="btn btn-report" type="button">
                        <i class="fas fa-flag"></i>
                        Report Issue with Template
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Modal -->
    <div id="report-modal-overlay" class="modal-overlay">
        <div class="modal modal-small">
            <button class="modal-close" id="report-modal-close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="modal-content-single">
                <div class="modal-header-icon">
                    <div class="report-icon-large">
                        <i class="fas fa-flag"></i>
                    </div>
                </div>
                
                <h2 class="modal-title-center">Report Template Issue</h2>
                <p class="modal-subtitle-center">Please describe the problem you encountered</p>
                
                <form id="report-form" class="report-form">
                    <div class="form-group">
                        <label for="report-issue">Issue Description</label>
                        <textarea id="report-issue" rows="4" placeholder="Describe the issue..." required></textarea>
                    </div>
                    
                    <div class="report-form-actions">
                        <button type="button" id="report-cancel" class="btn btn-outline">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast" class="toast"></div>

    <!-- Scripts - Order matters! -->
    <script src="data.js"></script>
    <script src="login.js"></script>
    <script src="app.js"></script>
</body>
</html>
