// Interview Master - Main Application Logic
class InterviewMaster {
    constructor() {
        this.currentUser = null;
        this.currentDomain = null;
        this.currentDifficulty = null;
        this.currentInterview = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.cameraStream = null;
        this.isMonitoring = false;
        this.tabFocusLost = false;
        this.isInterviewActive = false;
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadSavedTheme();
        this.clearMediaPermissions(); // Clear any existing permissions
        this.checkAuthStatus();
        
        // Update username after initialization
        setTimeout(() => {
            if (this.currentUser) {
                this.updateDomainPageUsername();
            }
        }, 500);
        
        // Also update when DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (this.currentUser) {
                    this.updateDomainPageUsername();
                }
            }, 100);
        });
        
        // Final fallback when window is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.currentUser) {
                    this.updateDomainPageUsername();
                }
            }, 200);
        });
        
        // Add a global function for testing username update
        window.testUsernameUpdate = () => {
            console.log('🧪 Testing username update...');
            this.updateDomainPageUsername();
        };
        
        // Add a direct DOM manipulation function for testing
        window.forceUpdateUsername = (username) => {
            console.log('🧪 Force updating username to:', username);
            const domainUserName = document.getElementById('domainUserName');
            if (domainUserName) {
                domainUserName.textContent = username;
                console.log('✅ Force updated domainUserName element');
            } else {
                console.log('❌ domainUserName element not found');
            }
            
            // Also try updating any welcome element
            const welcomeElements = document.querySelectorAll('h2');
            welcomeElements.forEach((el, index) => {
                if (el.textContent.includes('Welcome')) {
                    el.innerHTML = el.innerHTML.replace(/Welcome,.*?!/, `Welcome, ${username}!`);
                    console.log(`✅ Updated welcome element ${index}`);
                }
            });
        };
    }

    async clearMediaPermissions() {
        // Clear any existing media device permissions to force fresh permission request
        try {
            // Get current media streams
            const streams = await navigator.mediaDevices.enumerateDevices();
            
            // Stop any existing tracks
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // This helps ensure fresh permission requests
                console.log('Media permissions cleared for fresh request');
            }
        } catch (error) {
            console.log('No existing media permissions to clear');
        }
    }

    setupEventListeners() {
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('authSwitchBtn').addEventListener('click', () => this.toggleAuthMode());
        
        // Navigation
        document.getElementById('navLogoutBtn').addEventListener('click', () => this.logout());
        
        // User menu dropdown
        document.getElementById('userMenuBtn').addEventListener('click', () => this.toggleUserDropdown());
        document.getElementById('navHomeBtn').addEventListener('click', () => this.goToHome());
        document.getElementById('navDashboardBtn').addEventListener('click', () => this.showDashboard());
        
        // Edit profile
        document.getElementById('navEditProfileBtn').addEventListener('click', () => this.showEditProfile());
        document.getElementById('cancelEditProfile').addEventListener('click', () => this.hideEditProfile());
        document.getElementById('closeEditProfileBtn').addEventListener('click', () => this.hideEditProfile());
        document.getElementById('editProfileForm').addEventListener('submit', (e) => this.handleEditProfile(e));
        document.getElementById('resetPasswordBtn').addEventListener('click', () => this.handlePasswordReset());
        
        // Theme switcher
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleThemeDropdown());
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.changeTheme(e.target.dataset.theme));
        });
        
        // Domain selection
        document.querySelectorAll('.domain-card').forEach(card => {
            card.addEventListener('click', () => this.selectDomain(card.dataset.domain));
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', () => this.selectDifficulty(card.dataset.level));
        });
        document.getElementById('backToDomains').addEventListener('click', () => this.showDomainPage());
        
        // Interview controls
        document.getElementById('prevQuestion').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitInterview').addEventListener('click', () => this.submitInterview());
        
        // Results actions
        document.getElementById('retakeInterview').addEventListener('click', () => this.retakeInterview());
        document.getElementById('backToDashboard').addEventListener('click', () => this.showDashboard());
        
        // Close dropdowns and modals when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                document.getElementById('themeDropdown').classList.remove('show');
                document.getElementById('themeDropdown').style.display = 'none';
            }
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('show');
                document.getElementById('userDropdown').style.display = 'none';
            }
            if (e.target.id === 'editProfileModal') {
                this.hideEditProfile();
            }
        });
        
        // ESC key to close edit profile modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const editProfileModal = document.getElementById('editProfileModal');
                if (editProfileModal && editProfileModal.style.display === 'block') {
                    this.hideEditProfile();
                }
            }
        });
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const fullName = formData.get('fullName');
        
        const authTitle = document.getElementById('authTitle').textContent;
        const isSignup = authTitle.includes('Create Your Account') || authTitle.includes('Sign Up');
        
        console.log(`🔍 Auth mode detection - Title: "${authTitle}", isSignup: ${isSignup}`);
        
        if (isSignup) {
            if (password !== confirmPassword) {
                this.showAlert('Passwords do not match', 'error');
                return;
            }
            if (!fullName) {
                this.showAlert('Please enter your full name', 'error');
                return;
            }
        }
        
        try {
            const endpoint = isSignup ? '/api/signup' : '/api/login';
            const requestData = { email, password, fullName };
            
            console.log(`🔍 ${isSignup ? 'Signup' : 'Login'} request:`, {
                endpoint,
                email,
                password: password ? '*'.repeat(password.length) : 'None',
                fullName,
                isSignup
            });
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            console.log(`🔍 Response status: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            console.log(`🔍 Response data:`, data);
            
            if (response.ok) {
                if (isSignup) {
                    this.showAlert('Account created successfully! Please sign in.', 'success');
                    this.toggleAuthMode();
                } else {
                    localStorage.setItem('authToken', data.token);
                    this.currentUser = data.user;
                    console.log('🔍 Login successful, currentUser set to:', this.currentUser);
                    this.updateNavigationStats();
                    this.showDomainPage();
                    // Update username after a short delay to ensure DOM is ready
                    setTimeout(() => {
                        this.updateDomainPageUsername();
                    }, 100);
                }
            } else {
                console.log(`❌ ${isSignup ? 'Signup' : 'Login'} failed:`, data.message);
                this.showAlert(data.message || 'Authentication failed', 'error');
            }
        } catch (error) {
            console.log(`❌ ${isSignup ? 'Signup' : 'Login'} error:`, error);
            this.showAlert('Network error. Please try again.', 'error');
        }
    }

    toggleAuthMode() {
        const authTitle = document.getElementById('authTitle').textContent;
        const isSignup = authTitle.includes('Create Your Account') || authTitle.includes('Sign Up');
        
        if (isSignup) {
            document.getElementById('authTitle').textContent = 'Welcome to Interview Master';
            document.getElementById('authSubtitle').textContent = 'Sign in to start your interview journey';
            document.getElementById('authSubmit').textContent = 'Sign In';
            document.getElementById('authSwitchText').textContent = "Don't have an account?";
            document.getElementById('authSwitchBtn').textContent = 'Sign Up';
            document.getElementById('confirmPasswordGroup').style.display = 'none';
            document.getElementById('nameGroup').style.display = 'none';
        } else {
            document.getElementById('authTitle').textContent = 'Create Your Account';
            document.getElementById('authSubtitle').textContent = 'Join Interview Master today';
            document.getElementById('authSubmit').textContent = 'Sign Up';
            document.getElementById('authSwitchText').textContent = 'Already have an account?';
            document.getElementById('authSwitchBtn').textContent = 'Sign In';
            document.getElementById('confirmPasswordGroup').style.display = 'block';
            document.getElementById('nameGroup').style.display = 'block';
        }
        
        document.getElementById('authForm').reset();
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        try {
            const response = await fetch('/api/verify-token', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Received user data from verify-token:', data);
                this.currentUser = data.user;
                console.log('🔍 Set currentUser to:', this.currentUser);
                this.updateNavigationStats();
                this.updateDomainPageUsername();
                this.showDomainPage();
            } else {
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        this.currentUser = null;
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('difficultySelection').style.display = 'none';
        document.getElementById('interviewInterface').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('navActions').style.display = 'none';
    }

    toggleThemeDropdown() {
        const dropdown = document.getElementById('themeDropdown');
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
        } else {
            dropdown.classList.add('show');
            dropdown.style.display = 'block';
        }
    }

    changeTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
        
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        document.getElementById('themeDropdown').classList.remove('show');
        document.getElementById('themeDropdown').style.display = 'none';
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        this.changeTheme(savedTheme);
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
        } else {
            dropdown.classList.add('show');
            dropdown.style.display = 'block';
        }
    }

    goToHome() {
        // Go to domain selection page
        document.getElementById('userDropdown').classList.remove('show');
        document.getElementById('userDropdown').style.display = 'none';
        this.showDomainPage();
    }

    showEditProfile() {
        if (!this.currentUser) return;
        
        // Close user dropdown
        document.getElementById('userDropdown').classList.remove('show');
        document.getElementById('userDropdown').style.display = 'none';
        
        // Populate form with current user data
        document.getElementById('editFullName').value = this.currentUser.fullName || '';
        document.getElementById('editEmail').value = this.currentUser.email || '';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
        // Show modal
        const modal = document.getElementById('editProfileModal');
        modal.style.display = 'block';
        
        // Ensure modal is properly positioned in center of viewport
        modal.style.position = 'absolute';
        modal.style.zIndex = '1001';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.margin = '0';
        
        // Ensure all form sections are visible
        const formSections = document.querySelectorAll('.form-section');
        formSections.forEach(section => {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
        });
        
        // Scroll to top of modal
        modal.scrollTop = 0;
        
        // Force a reflow to ensure proper positioning
        modal.offsetHeight;
        
        console.log('Edit profile modal opened, form sections count:', formSections.length);
    }

    hideEditProfile() {
        document.getElementById('editProfileModal').style.display = 'none';
    }

    async handleEditProfile(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const fullName = formData.get('fullName');
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');
        
        // Validate passwords if provided
        if (newPassword && newPassword !== confirmNewPassword) {
            this.showAlert('New passwords do not match', 'error');
            return;
        }
        
        try {
            // Update user profile
            await this.updateUserProfile({
                fullName,
                currentPassword,
                newPassword: newPassword || null
            });
            
            this.showAlert('Profile updated successfully!', 'success');
            this.hideEditProfile();
            this.updateUserStats();
            this.updateNavigationStats();
            
        } catch (error) {
            this.showAlert(error.message || 'Failed to update profile', 'error');
        }
    }

    async updateUserProfile(profileData) {
        // In a real application, this would make an API call
        // For now, we'll update the local user data
        
        if (!this.currentUser) return;
        
        // Validate current password if changing profile
        if (profileData.currentPassword) {
            const currentPasswordHash = await this.hashPassword(profileData.currentPassword);
            if (this.currentUser.password_hash !== currentPasswordHash) {
                throw new Error('Current password is incorrect');
            }
        }
        
        // Update user data
        this.currentUser.fullName = profileData.fullName;
        
        if (profileData.newPassword) {
            this.currentUser.password_hash = await this.hashPassword(profileData.newPassword);
        }
        
        // Update local storage and navigation
        this.updateNavigationStats();
    }
    
    handlePasswordReset() {
        if (!this.currentUser || !this.currentUser.email) {
            this.showAlert('Please log in first to reset your password.', 'error');
            return;
        }
        
        const email = this.currentUser.email;
        const newPassword = prompt('Enter your new password:');
        
        if (!newPassword) {
            return;
        }
        
        const confirmPassword = prompt('Confirm your new password:');
        
        if (newPassword !== confirmPassword) {
            this.showAlert('Passwords do not match!', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showAlert('Password must be at least 6 characters long!', 'error');
            return;
        }
        
        // Update password
        this.hashPassword(newPassword).then(hash => {
            this.currentUser.password_hash = hash;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showAlert('Password reset successfully!', 'success');
            
            // Clear the password fields in the form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        });
    }

    async hashPassword(password) {
        // Simple SHA-256 hash using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    enterFullScreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported or denied:', err);
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        // Listen for fullscreen exit
        document.addEventListener('fullscreenchange', () => {
            console.log('Fullscreen change event, fullscreenElement:', document.fullscreenElement);
            if (!document.fullscreenElement) {
                this.handleFullScreenExit();
            }
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            console.log('Webkit fullscreen change event, webkitFullscreenElement:', document.webkitFullscreenElement);
            if (!document.webkitFullscreenElement) {
                this.handleFullScreenExit();
            }
        });
        
        document.addEventListener('msfullscreenchange', () => {
            console.log('MS fullscreen change event, msFullscreenElement:', document.msFullscreenElement);
            if (!document.msFullscreenElement) {
                this.handleFullScreenExit();
            }
        });
    }

    handleFullScreenExit() {
        console.log('Full screen exit detected, isInterviewActive:', this.isInterviewActive);
        
        if (this.isInterviewActive) {
            // Set interview as inactive immediately
            this.isInterviewActive = false;
            
            // Stop monitoring
            this.stopMonitoring();
            
            // Show notification and go to dashboard
            this.showAlert('Interview terminated due to fullscreen exit!', 'error');
            
            // Go directly to dashboard
            setTimeout(() => {
                console.log('Redirecting to domain page...');
                this.showDomainPage();
            }, 1500);
        }
    }

    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log('Exit fullscreen failed:', err);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    selectDomain(domain) {
        this.currentDomain = domain;
        document.getElementById('selectedDomain').textContent = this.getDomainDisplayName(domain);
        document.getElementById('domainTitle').textContent = `Select Difficulty Level`;
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('difficultySelection').style.display = 'block';
    }

    getDomainDisplayName(domain) {
        const names = {
            'data-analytics': 'Data Analytics',
            'machine-learning': 'Machine Learning',
            'web-development': 'Web Development',
            'dsa': 'Data Structures & Algorithms',
            'group-discussion': 'Group Discussion',
            'cloud-computing': 'Cloud Computing'
        };
        return names[domain] || domain;
    }

    async selectDifficulty(level) {
        this.currentDifficulty = level;
        this.showInterviewInstructions();
    }

    showInterviewInstructions() {
        document.getElementById('difficultySelection').style.display = 'none';
        
        // Create instructions modal
        const instructionsModal = document.createElement('div');
        instructionsModal.id = 'instructionsModal';
        instructionsModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h2>📋 Interview Instructions</h2>
                    <div class="instructions-content">
                        <div class="instruction-item">
                            <i class="fas fa-video"></i>
                            <div>
                                <h3>Camera & Microphone Required</h3>
                                <p>Your camera and microphone will be monitored throughout the interview. Ensure you're in a well-lit area.</p>
                            </div>
                        </div>
                        <div class="instruction-item">
                            <i class="fas fa-eye"></i>
                            <div>
                                <h3>Tab Focus</h3>
                                <p>Do not switch tabs or minimize the browser. The interview will auto-submit if you lose focus.</p>
                            </div>
                        </div>
                        <div class="instruction-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <h3>Time Limit</h3>
                                <p>You have ${this.getTimeLimitInMinutes()} minutes to complete ${this.getQuestionCount()} questions.</p>
                            </div>
                        </div>
                        <div class="instruction-item">
                            <i class="fas fa-question-circle"></i>
                            <div>
                                <h3>Question Types</h3>
                                <p>You'll encounter both Multiple Choice Questions (MCQ) and Text-based questions.</p>
                            </div>
                        </div>
                        <div class="instruction-item">
                            <i class="fas fa-shield-alt"></i>
                            <div>
                                <h3>Monitoring</h3>
                                <p>Your camera feed will be visible to ensure fair assessment. No external help is allowed.</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="requestPermissionsBtn" class="btn-primary">
                            <i class="fas fa-camera"></i> Allow Camera & Microphone Access
                        </button>
                        <button id="cancelInterviewBtn" class="btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(instructionsModal);
        
        // Add event listeners
        document.getElementById('requestPermissionsBtn').addEventListener('click', () => {
            document.body.removeChild(instructionsModal);
            this.requestPermissionsAndStart();
        });
        
        document.getElementById('cancelInterviewBtn').addEventListener('click', () => {
            document.body.removeChild(instructionsModal);
            document.getElementById('difficultySelection').style.display = 'block';
        });
    }

    getTimeLimitInMinutes() {
        const limits = {
            easy: 60,
            medium: 45,
            hard: 30
        };
        return limits[this.currentDifficulty] || 60;
    }

    getQuestionCount() {
        const counts = {
            easy: 45,
            medium: 30,
            hard: 15
        };
        return counts[this.currentDifficulty] || 15;
    }

    async requestPermissionsAndStart() {
        // First, stop any existing media streams to force fresh permission request
        await this.forceFreshPermissions();
        
        // Show permission request modal
        const permissionModal = document.createElement('div');
        permissionModal.id = 'permissionModal';
        permissionModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h2>🎥 Camera & Microphone Access Required</h2>
                    <div class="permission-content">
                        <div class="permission-icon">
                            <i class="fas fa-camera"></i>
                        </div>
                        <p>To ensure a fair and secure interview, we need access to your camera and microphone.</p>
                        <div class="permission-requirements">
                            <div class="requirement-item">
                                <i class="fas fa-video"></i>
                                <span>Camera access for visual monitoring</span>
                            </div>
                            <div class="requirement-item">
                                <i class="fas fa-microphone"></i>
                                <span>Microphone access for audio monitoring</span>
                            </div>
                        </div>
                        <div class="permission-status" id="permissionStatus">
                            <i class="fas fa-clock"></i>
                            <span>Click "Allow Access" to continue...</span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="allowAccessBtn" class="btn-primary">
                            <i class="fas fa-check"></i> Allow Access
                        </button>
                        <button id="denyAccessBtn" class="btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(permissionModal);
        
        // Add event listeners
        document.getElementById('allowAccessBtn').addEventListener('click', async () => {
            const statusElement = document.getElementById('permissionStatus');
            statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Requesting permissions...</span>';
            
            try {
                // Request camera and microphone access with explicit constraints
                this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    }, 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                });
                
                // Show success and camera preview
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> <span style="color: green;">Permissions granted successfully!</span>';
                
                // Show camera preview
                this.showCameraPreview();
                
                // Wait a moment then proceed
                setTimeout(() => {
                    document.body.removeChild(permissionModal);
                    this.startInterview();
                }, 2000);
                
            } catch (error) {
                console.error('Permission denied:', error);
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span style="color: red;">Permissions denied. Please allow camera and microphone access to continue.</span>';
                
                // Show error and go back after delay
                setTimeout(() => {
                    document.body.removeChild(permissionModal);
                    this.showAlert('Camera and microphone permissions are required to start the interview!', 'error');
                    document.getElementById('difficultySelection').style.display = 'block';
                }, 3000);
            }
        });
        
        document.getElementById('denyAccessBtn').addEventListener('click', () => {
            document.body.removeChild(permissionModal);
            document.getElementById('difficultySelection').style.display = 'block';
        });
    }

    async forceFreshPermissions() {
        // Stop any existing camera streams
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Remove any existing video elements
        const existingVideos = document.querySelectorAll('video[srcObject]');
        existingVideos.forEach(video => video.remove());
        
        // Clear any existing canvas elements
        const existingCanvas = document.querySelectorAll('canvas');
        existingCanvas.forEach(canvas => canvas.remove());
        
        console.log('Cleared existing media streams for fresh permission request');
    }

    showCameraPreview() {
        // Create camera preview modal
        const previewModal = document.createElement('div');
        previewModal.id = 'cameraPreviewModal';
        previewModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content camera-preview">
                    <h2>📹 Camera Preview</h2>
                    <div class="camera-preview-container">
                        <video id="cameraPreview" autoplay muted></video>
                        <div class="preview-overlay">
                            <div class="preview-status">
                                <i class="fas fa-check-circle"></i>
                                <span>Camera is working properly!</span>
                            </div>
                        </div>
                    </div>
                    <p class="preview-text">Your camera is now active and ready for the interview. You can see yourself in the preview above.</p>
                    <div class="modal-actions">
                        <button id="startTestBtn" class="btn-primary">
                            <i class="fas fa-play"></i> Start MCQ Test
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(previewModal);
        
        // Set up camera preview
        const previewVideo = document.getElementById('cameraPreview');
        previewVideo.srcObject = this.cameraStream;
        
        // Add event listener for starting test
        document.getElementById('startTestBtn').addEventListener('click', () => {
            document.body.removeChild(previewModal);
            // Camera preview is done, now start the actual interview
        });
    }

    async startInterview() {
        try {
            console.log('Starting interview for domain:', this.currentDomain, 'difficulty:', this.currentDifficulty);
            
            // Add timestamp to ensure fresh randomization every second
            const timestamp = Date.now();
            
        // Try HARDCODED API first (guaranteed unique questions)
        console.log('Trying HARDCODED API...');
        let response = await fetch(`/api/questions-hardcoded/${this.currentDomain}/${this.currentDifficulty}?t=${timestamp}`);
        let data = await response.json();
        
        // If hardcoded API fails, try NEW API
        if (!response.ok) {
            console.log('HARDCODED API failed, trying NEW API...');
            response = await fetch(`/api/questions-new/${this.currentDomain}/${this.currentDifficulty}?t=${timestamp}`);
            data = await response.json();
            console.log('Using NEW API');
        }
        
        // If new API fails, try main API
        if (!response.ok) {
            console.log('NEW API failed, trying main API...');
            response = await fetch(`/api/questions/${this.currentDomain}/${this.currentDifficulty}?t=${timestamp}`);
            data = await response.json();
            console.log('Using main API');
        }
        
        // If main API fails, try backup API
        if (!response.ok) {
            console.log('Main API failed, trying backup API...');
            response = await fetch(`/api/questions-backup/${this.currentDomain}/${this.currentDifficulty}?t=${timestamp}`);
            data = await response.json();
            console.log('Using backup API');
        }
            
            console.log('API Response:', data);
            
            if (response.ok) {
                this.questions = data.questions;
                console.log('=== QUESTIONS LOADED WITH RANDOMIZATION ===');
                console.log('API Version:', data.api_version || 'unknown');
                console.log('Randomization timestamp:', data.randomization_timestamp);
                console.log('Total questions:', data.total_questions);
                console.log('MCQ questions:', data.mcq_count);
                console.log('Text questions:', data.text_count);
                console.log('Uniqueness check:', data.uniqueness_check || 'not available');
                console.log('Questions loaded:', this.questions);
                console.log('First question:', this.questions[0]);
                console.log('Question types:', this.questions.map(q => q.type));
                console.log('Question distribution:', {
                    mcq: data.mcq_count,
                    text: data.text_count,
                    total: data.total_questions
                });
                
                this.currentQuestionIndex = 0;
                this.answers = {};
                this.startTime = new Date();
                
                console.log('Interview state initialized - currentQuestionIndex:', this.currentQuestionIndex);
                
                // Enter full screen mode
                this.enterFullScreen();
                
                this.showInterviewInterface();
                this.displayCurrentQuestion();
                this.startTimer();
            } else {
                this.showAlert(data.message || 'Failed to load questions', 'error');
                this.showDashboard();
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            this.showAlert('Network error. Please try again.', 'error');
            this.showDashboard();
        }
    }

    showInterviewInterface() {
        document.getElementById('difficultySelection').style.display = 'none';
        document.getElementById('interviewInterface').style.display = 'block';
        
        // Hide navigation during interview
        document.getElementById('navActions').style.display = 'none';
        
        // Set interview as active
        this.isInterviewActive = true;
        
        const totalQuestions = this.questions.length;
        const timeLimit = this.getTimeLimit();
        
        // Calculate question type distribution
        const mcqCount = this.questions.filter(q => q.type === 'mcq').length;
        const textCount = this.questions.filter(q => q.type === 'text').length;
        
        document.getElementById('interviewTitle').textContent = `${this.getDomainDisplayName(this.currentDomain)} - ${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)}`;
        document.getElementById('questionCounter').textContent = `Question 1 of ${totalQuestions}`;
        document.getElementById('timeRemaining').textContent = this.formatTime(timeLimit);
        
        // Set randomization info
        const randomizationInfo = document.getElementById('randomizationInfo');
        if (randomizationInfo) {
            randomizationInfo.textContent = `Randomized at ${new Date().toLocaleTimeString()}`;
        }
        
        // Log question distribution
        console.log('Interview started with question distribution:');
        console.log(`- Total: ${totalQuestions} questions`);
        console.log(`- MCQ: ${mcqCount} questions (${Math.round((mcqCount/totalQuestions)*100)}%)`);
        console.log(`- Text: ${textCount} questions (${Math.round((textCount/totalQuestions)*100)}%)`);
        
        // Start monitoring
        this.startMonitoring();
    }

    async startMonitoring() {
        this.isMonitoring = true;
        
        // Camera stream should already be available from permission request
        if (this.cameraStream) {
            // Create video element for camera feed - VISIBLE to user during interview
            this.video = document.createElement('video');
            this.video.srcObject = this.cameraStream;
            this.video.autoplay = true;
            this.video.muted = true;
            this.video.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                width: 200px;
                height: 150px;
                border: 3px solid #4CAF50;
                border-radius: 10px;
                z-index: 1000;
                background: #000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(this.video);
            
            this.updateMonitoringStatus('cameraStatus', 'active', 'Camera On');
            this.updateMonitoringStatus('micStatus', 'active', 'Microphone On');
            
            // Start face detection
            this.startFaceDetection();
        } else {
            // Fallback if camera stream is not available
            this.updateMonitoringStatus('cameraStatus', 'error', 'Camera Not Available');
            this.updateMonitoringStatus('micStatus', 'error', 'Microphone Not Available');
        }
        
        // Monitor tab focus
        this.startTabFocusMonitoring();
    }

    startFaceDetection() {
        // Create canvas for face detection
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 200;
        this.canvas.height = 150;
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
        
        // Face detection variables
        this.faceDetectionInterval = null;
        this.noFaceCount = 0;
        this.multipleFaceCount = 0;
        this.lastFaceCount = 0;
        this.faceDetectionAlert = null;
        this.faceDetectionTimer = null;
        
        // Start face detection every 2 seconds
        this.faceDetectionInterval = setInterval(() => {
            this.detectFaces();
        }, 2000);
    }

    detectFaces() {
        if (!this.video || !this.isMonitoring) return;
        
        // Draw current video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Simple face detection using canvas analysis
        // This is a basic implementation - in production, you'd use a proper face detection library
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const faces = this.simpleFaceDetection(imageData);
        
        if (faces === 0) {
            this.noFaceCount++;
            this.multipleFaceCount = 0;
            
            // Show alert after 2 seconds (1 detection), start 10-second timer
            if (this.noFaceCount === 1 && !this.faceDetectionAlert) {
                this.showFaceDetectionAlert();
            }
            
            if (this.noFaceCount >= 5) { // No face for 10 seconds (5 checks × 2 seconds)
                this.handleNoFaceDetected();
            }
        } else if (faces > 1) {
            this.multipleFaceCount++;
            this.noFaceCount = 0;
            
            // Hide face detection alert if it's showing
            this.hideFaceDetectionAlert();
            
            if (this.multipleFaceCount >= 3) { // Multiple faces for 6 seconds (3 checks × 2 seconds)
                this.handleMultipleFacesDetected();
            }
        } else {
            // Normal: exactly 1 face
            this.noFaceCount = 0;
            this.multipleFaceCount = 0;
            this.lastFaceCount = faces;
            
            // Hide face detection alert if it's showing
            this.hideFaceDetectionAlert();
        }
        
        // Update face detection status
        this.updateFaceDetectionStatus(faces);
    }

    simpleFaceDetection(imageData) {
        // This is a simplified face detection algorithm using skin tone detection
        // For production use, consider integrating proper face detection libraries like:
        // - face-api.js (TensorFlow.js based)
        // - MediaPipe Face Detection
        // - OpenCV.js
        // - Google Vision API
        
        const data = imageData.data;
        let faceCount = 0;
        const width = imageData.width;
        const height = imageData.height;
        
        // Look for skin-tone colored pixels (simplified approach)
        let skinPixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Improved skin tone detection with broader ranges
            const isSkinTone1 = (r > 80 && g > 30 && b > 15 && 
                                Math.max(r, g, b) - Math.min(r, g, b) > 10 &&
                                Math.abs(r - g) > 8 && r > g && r > b);
            
            const isSkinTone2 = (r > 60 && g > 20 && b > 10 && 
                                Math.abs(r - g) > 5 && r > g);
            
            const isSkinTone3 = (r > 100 && g > 50 && b > 30 && 
                                r > g && r > b);
            
            if (isSkinTone1 || isSkinTone2 || isSkinTone3) {
                skinPixelCount++;
            }
        }
        
        // Estimate face count based on skin pixel density
        const skinRatio = skinPixelCount / (width * height);
        
        if (skinRatio > 0.02 && skinRatio < 0.5) {
            faceCount = 1; // Likely one face
        } else if (skinRatio >= 0.5) {
            faceCount = 2; // Likely multiple faces
        } else {
            faceCount = 0; // No face detected
        }
        
        // Debug logging
        if (skinRatio > 0.01) { // Only log when there's some skin detected
            console.log(`Face detection: skinRatio=${skinRatio.toFixed(4)}, faceCount=${faceCount}, skinPixels=${skinPixelCount}, totalPixels=${width * height}`);
        }
        
        return faceCount;
    }

    updateFaceDetectionStatus(faceCount) {
        // Update monitoring status based on face detection
        if (faceCount === 0) {
            this.updateMonitoringStatus('cameraStatus', 'warning', 'No Face Detected');
        } else if (faceCount > 1) {
            this.updateMonitoringStatus('cameraStatus', 'error', 'Multiple Faces Detected');
        } else {
            this.updateMonitoringStatus('cameraStatus', 'active', 'Camera On - 1 Face');
        }
    }

    showFaceDetectionAlert() {
        // Create alert modal with countdown timer
        const alertModal = document.createElement('div');
        alertModal.id = 'faceDetectionAlert';
        alertModal.className = 'face-detection-alert';
        alertModal.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">⚠️</div>
                <h3>Face Not Detected</h3>
                <p>Please position yourself in front of the camera</p>
                <div class="countdown-timer">
                    <span id="countdownNumber">8</span> seconds remaining
                </div>
                <p class="alert-warning">Interview will be auto-submitted if face is not detected</p>
            </div>
        `;
        
        document.body.appendChild(alertModal);
        this.faceDetectionAlert = alertModal;
        
        // Start countdown timer
        let timeLeft = 8; // 8 seconds remaining (2 seconds already passed)
        const countdownElement = document.getElementById('countdownNumber');
        
        this.faceDetectionTimer = setInterval(() => {
            timeLeft--;
            if (countdownElement) {
                countdownElement.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.faceDetectionTimer);
                this.faceDetectionTimer = null;
            }
        }, 1000);
    }
    
    hideFaceDetectionAlert() {
        if (this.faceDetectionAlert) {
            this.faceDetectionAlert.remove();
            this.faceDetectionAlert = null;
        }
        
        if (this.faceDetectionTimer) {
            clearInterval(this.faceDetectionTimer);
            this.faceDetectionTimer = null;
        }
    }
    
    handleNoFaceDetected() {
        console.log('No face detected for too long, auto-submitting interview');
        
        // Hide the alert if it's showing
        this.hideFaceDetectionAlert();
        
        this.showAlert('No face detected! Interview will be auto-submitted.', 'error');
        
        // Auto-submit after a short delay
        setTimeout(() => {
            if (this.isMonitoring) {
                this.submitInterview();
            }
        }, 2000);
    }

    handleMultipleFacesDetected() {
        this.showAlert('Multiple faces detected! Interview will auto-submit.', 'error');
        setTimeout(() => {
            if (this.isMonitoring) {
                this.submitInterview();
            }
        }, 3000);
    }

    startTabFocusMonitoring() {
        // Check tab focus every second
        this.focusInterval = setInterval(() => {
            if (document.hidden && this.isMonitoring) {
                this.handleTabFocusLost();
            } else if (!document.hidden && this.isMonitoring) {
                this.updateMonitoringStatus('focusStatus', 'active', 'Focused');
                this.tabFocusLost = false;
            }
        }, 1000);
        
        // Also listen to visibility change events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isMonitoring) {
                this.handleTabFocusLost();
            } else if (!document.hidden && this.isMonitoring) {
                this.updateMonitoringStatus('focusStatus', 'active', 'Focused');
                this.tabFocusLost = false;
            }
        });
    }

    handleTabFocusLost() {
        if (!this.tabFocusLost) {
            this.tabFocusLost = true;
            this.updateMonitoringStatus('focusStatus', 'error', 'Tab Focus Lost');
            this.showAlert('Tab focus lost! Interview will auto-submit.', 'warning');
            
            // Auto-submit after 3 seconds
            setTimeout(() => {
                if (this.isMonitoring && this.tabFocusLost) {
                    this.showAlert('Interview auto-submitted due to tab switching.', 'error');
                    this.submitInterview();
                }
            }, 3000);
        }
    }

    updateMonitoringStatus(elementId, status, text) {
        const element = document.getElementById(elementId);
        element.className = `status-indicator ${status}`;
        element.querySelector('span').textContent = text;
    }

    getTimeLimit() {
        const limits = {
            easy: 60 * 60, // 60 minutes
            medium: 45 * 60, // 45 minutes
            hard: 30 * 60 // 30 minutes
        };
        return limits[this.currentDifficulty] || 60 * 60;
    }

    startTimer() {
        const timeLimit = this.getTimeLimit();
        let timeRemaining = timeLimit;
        
        this.timer = setInterval(() => {
            timeRemaining--;
            document.getElementById('timeRemaining').textContent = this.formatTime(timeRemaining);
            
            if (timeRemaining <= 0) {
                clearInterval(this.timer);
                this.submitInterview();
            }
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    displayCurrentQuestion() {
        console.log('=== DISPLAYING QUESTION ===');
        console.log('Current question index:', this.currentQuestionIndex);
        console.log('Total questions:', this.questions.length);
        console.log('Questions array:', this.questions);
        
        if (this.currentQuestionIndex >= this.questions.length) {
            console.log('Question index out of bounds, submitting interview');
            this.submitInterview();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const totalQuestions = this.questions.length;
        
        console.log('Current question object:', question);
        console.log('Question text:', question.text);
        console.log('Question type:', question.type);
        console.log('Question options:', question.options);
        console.log('Question ID:', question.id || 'No ID');
        console.log('=== ALL QUESTIONS PREVIEW ===');
        this.questions.forEach((q, i) => {
            console.log(`Question ${i}: ID=${q.id || 'No ID'}, Text="${q.text?.substring(0, 50)}..."`);
        });
        
        // TEST: Check if all questions are actually different
        const allTexts = this.questions.map(q => q.text);
        const uniqueTexts = new Set(allTexts);
        console.log(`=== UNIQUENESS TEST ===`);
        console.log(`Total questions: ${allTexts.length}`);
        console.log(`Unique questions: ${uniqueTexts.size}`);
        console.log(`Are all questions unique? ${allTexts.length === uniqueTexts.size ? 'YES' : 'NO'}`);
        
        if (allTexts.length !== uniqueTexts.size) {
            console.log('WARNING: Duplicate questions detected!');
            const duplicates = allTexts.filter((text, index) => allTexts.indexOf(text) !== index);
            console.log('Duplicate texts:', duplicates);
        }
        
        // Update question counter (proper numbering: 1, 2, 3...)
        document.getElementById('questionCounter').textContent = `Question ${this.currentQuestionIndex + 1} of ${totalQuestions}`;
        
        // Update question text - FIXED: Use 'text' property (from questions.json)
        let questionText = question.text || question.question || 'Question not available';
        
        // Remove numbers in brackets from question text
        questionText = questionText.replace(/\s*\(\d+\)\s*$/, '').trim();
        questionText = questionText.replace(/Question\s+\d+\s*:?\s*/gi, '').trim();
        
        console.log('Final question text to display:', questionText);
        console.log('Setting question text in DOM element:', document.getElementById('questionText'));
        
        // Force update the question text element
        const questionTextElement = document.getElementById('questionText');
        if (questionTextElement) {
            questionTextElement.textContent = questionText;
            console.log('Question text element updated to:', questionTextElement.textContent);
        } else {
            console.error('Question text element not found!');
        }
        
        // Update question type badge
        const typeBadge = document.querySelector('.type-badge');
        if (question.type === 'mcq') {
            typeBadge.textContent = 'MCQ';
            typeBadge.className = 'type-badge mcq';
            this.displayMCQOptions(question.options);
        } else {
            typeBadge.textContent = 'TEXT';
            typeBadge.className = 'type-badge text';
            this.displayTextAnswer();
        }
        
        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextQuestion').style.display = this.currentQuestionIndex < totalQuestions - 1 ? 'block' : 'none';
        document.getElementById('submitInterview').style.display = this.currentQuestionIndex === totalQuestions - 1 ? 'block' : 'none';
        
        // Load existing answer
        this.loadExistingAnswer();
    }

    displayMCQOptions(options) {
        console.log('Displaying MCQ options:', options);
        
        const container = document.getElementById('optionsContainer');
        container.style.display = 'block';
        document.getElementById('textAnswerContainer').style.display = 'none';
        
        container.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" name="answer" value="${option}" id="option${index}">
                <label for="option${index}">${option}</label>
            `;
            
            // Add click event to make the entire option clickable
            optionElement.addEventListener('click', (e) => {
                // Don't trigger twice if radio button is clicked directly
                if (e.target.type !== 'radio') {
                    const radioButton = optionElement.querySelector('input[type="radio"]');
                    radioButton.checked = true;
                    
                    // Update visual selection
                    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                    optionElement.classList.add('selected');
                    
                    // Save the answer
                    this.saveCurrentAnswer();
                }
            });
            
            // Add event listener for radio button changes
            const radioButton = optionElement.querySelector('input[type="radio"]');
            radioButton.addEventListener('change', () => {
                // Update visual selection
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
                
                // Save the answer
                this.saveCurrentAnswer();
            });
            
            container.appendChild(optionElement);
        });
    }

    displayTextAnswer() {
        document.getElementById('optionsContainer').style.display = 'none';
        document.getElementById('textAnswerContainer').style.display = 'block';
    }

    loadExistingAnswer() {
        const answer = this.answers[this.currentQuestionIndex];
        if (answer) {
            const question = this.questions[this.currentQuestionIndex];
            if (question.type === 'mcq') {
                const radioButton = document.querySelector(`input[value="${answer}"]`);
                if (radioButton) {
                    radioButton.checked = true;
                    radioButton.closest('.option').classList.add('selected');
                }
            } else {
                document.getElementById('textAnswer').value = answer;
            }
        }
    }

    saveCurrentAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        let answer = '';
        
        if (question.type === 'mcq') {
            const selectedRadio = document.querySelector('input[name="answer"]:checked');
            if (selectedRadio) {
                answer = selectedRadio.value;
                // Update visual selection
                document.querySelectorAll('.option').forEach(option => option.classList.remove('selected'));
                selectedRadio.closest('.option').classList.add('selected');
            }
        } else {
            answer = document.getElementById('textAnswer').value.trim();
        }
        
        if (answer) {
            this.answers[this.currentQuestionIndex] = answer;
        }
    }

    nextQuestion() {
        console.log('Next question clicked, current index:', this.currentQuestionIndex, 'total questions:', this.questions.length);
        this.saveCurrentAnswer();
        
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            console.log('Moving to question:', this.currentQuestionIndex + 1);
            this.displayCurrentQuestion();
        } else {
            console.log('Last question reached, submitting interview');
            this.submitInterview();
        }
    }


    previousQuestion() {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    async submitInterview() {
        this.saveCurrentAnswer();
        this.endTime = new Date();
        
        // Set interview as inactive
        this.isInterviewActive = false;
        
        // Show navigation again
        document.getElementById('navActions').style.display = 'flex';
        
        // Stop monitoring
        this.stopMonitoring();
        
        // Exit full screen
        this.exitFullScreen();
        
        // Calculate results
        const results = this.calculateResults();
        this.showResults(results);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Stop focus monitoring
        if (this.focusInterval) {
            clearInterval(this.focusInterval);
        }
        
        // Stop face detection
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }
        
        // Hide face detection alert if showing
        this.hideFaceDetectionAlert();
        
        // Stop camera stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Remove video element
        if (this.video) {
            this.video.remove();
            this.video = null;
        }
        
        // Remove canvas element
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }
    }

    calculateResults() {
        let correctAnswers = 0;
        const totalQuestions = this.questions.length;
        const timeTaken = Math.floor((this.endTime - this.startTime) / 1000);
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            
            if (question.type === 'mcq') {
                if (userAnswer === question.correct_answer) {
                    correctAnswers++;
                }
            } else {
                // Simple keyword matching for text answers
                const userText = userAnswer.toLowerCase();
                const keywords = question.keywords.map(k => k.toLowerCase());
                const matchedKeywords = keywords.filter(keyword => 
                    userText.includes(keyword)
                );
                
                // Consider correct if at least 50% of keywords are matched
                if (matchedKeywords.length >= keywords.length * 0.5) {
                    correctAnswers++;
                }
            }
        });
        
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const creditsEarned = Math.round((correctAnswers / totalQuestions) * 200);
        
        return {
            correctAnswers,
            totalQuestions,
            accuracy,
            timeTaken,
            creditsEarned,
            answers: this.answers
        };
    }

    showResults(results) {
        document.getElementById('interviewInterface').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
        
        document.getElementById('overallScore').textContent = `${results.accuracy}%`;
        document.getElementById('correctAnswers').textContent = `${results.correctAnswers}/${results.totalQuestions}`;
        document.getElementById('resultAccuracy').textContent = `${results.accuracy}%`;
        document.getElementById('timeTaken').textContent = this.formatTime(results.timeTaken);
        document.getElementById('creditsEarned').textContent = `+${results.creditsEarned}`;
        
        // Show correct answers after test completion
        this.displayCorrectAnswers();
        
        // Save interview to history
        this.saveInterviewToHistory(results);
        
        // Update user stats
        this.updateUserStats(results);
    }

    displayCorrectAnswers() {
        const answersContainer = document.getElementById('correctAnswersContainer');
        if (!answersContainer) return;
        
        answersContainer.innerHTML = '<h3>Review Your Answers:</h3>';
        
        this.questions.forEach((question, index) => {
            if (question.type === 'mcq') {
                const userAnswer = this.answers[index] || 'Not answered';
                const correctAnswer = question.correct_answer;
                const isCorrect = userAnswer === correctAnswer;
                
                const answerDiv = document.createElement('div');
                answerDiv.className = `answer-review ${isCorrect ? 'correct' : 'incorrect'}`;
                answerDiv.innerHTML = `
                    <div class="question-number">Question ${index + 1}</div>
                    <div class="question-text">${question.question || question.text}</div>
                    <div class="answer-comparison">
                        <div class="user-answer">
                            <strong>Your Answer:</strong> ${userAnswer}
                        </div>
                        <div class="correct-answer">
                            <strong>Correct Answer:</strong> ${correctAnswer}
                        </div>
                        <div class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">
                            ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </div>
                    </div>
                `;
                
                answersContainer.appendChild(answerDiv);
            }
        });
    }

    async updateUserStats(results) {
        try {
            console.log('Updating user stats with results:', results);
            console.log('Current user email:', this.currentUser.email);
            
            const response = await fetch(`/api/update-stats?email=${encodeURIComponent(this.currentUser.email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    domain: this.currentDomain,
                    difficulty: this.currentDifficulty,
                    results: results
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Stats updated successfully:', data);
                
                // Update local user data
                if (data.user) {
                    this.currentUser.credits = data.user.credits;
                    this.currentUser.streak = data.user.streak;
                    this.currentUser.accuracy = data.user.accuracy;
                    this.currentUser.interviewsCompleted = data.user.interviewsCompleted;
                    
                    console.log('Local user data updated:', this.currentUser);
                    
                    // Update UI immediately
                    this.updateUserStatsUI();
                    this.updateNavigationStats();
                }
            } else {
                console.error('Failed to update stats:', response.statusText);
                const errorData = await response.json();
                console.error('Error details:', errorData);
            }
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    retakeInterview() {
        document.getElementById('resultsContainer').style.display = 'none';
        this.showDashboard();
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // Show alert
        setTimeout(() => alert.classList.add('show'), 100);
        
        // Hide and remove alert
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => document.body.removeChild(alert), 300);
        }, 4000);
    }

    showDomainPage() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('difficultySelection').style.display = 'none';
        document.getElementById('interviewInterface').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('navActions').style.display = 'flex';
        
        // Hide dashboard header on domain page
        document.querySelector('.dashboard-header').style.display = 'none';
        
        // Show only the domains grid (hide analytics and profile sections)
        document.querySelector('.analytics-section').style.display = 'none';
        document.querySelector('.profile-section').style.display = 'none';
        document.querySelector('.interview-history-section').style.display = 'none';
        document.querySelector('.domains-grid').style.display = 'block';
        
        this.updateNavigationStats();
        this.updateDomainPageUsername();
    }

    async showDashboard() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('difficultySelection').style.display = 'none';
        document.getElementById('interviewInterface').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('navActions').style.display = 'flex';
        
        // Show dashboard header on dashboard page
        document.querySelector('.dashboard-header').style.display = 'block';
        
        // Show analytics and profile sections (hide domains grid)
        document.querySelector('.analytics-section').style.display = 'block';
        document.querySelector('.profile-section').style.display = 'block';
        document.querySelector('.interview-history-section').style.display = 'block';
        document.querySelector('.domains-grid').style.display = 'none';
        
        // Ensure current user data is available
        if (!this.currentUser) {
            console.log('No current user found, checking auth token...');
            const token = localStorage.getItem('authToken');
            if (token) {
                await this.checkAuthStatus();
            }
        }
        
        // Sync user stats with real interview history
        await this.syncUserStatsWithServer();
        
        this.updateUserStatsUI();
        this.updateNavigationStats();
        this.loadInterviewHistory();
        
        console.log('Dashboard loaded with user:', this.currentUser?.fullName || this.currentUser?.name || 'Unknown');
    }

    async updateUserStatsUI() {
        if (!this.currentUser) {
            console.log('No current user found for updateUserStats');
            return;
        }
        
        console.log('Updating user stats for:', this.currentUser);
        
        // Calculate real stats from interview history
        const realStats = this.calculateRealStatsFromHistory();
        console.log('Calculated real stats from history:', realStats);
        
        // Update main dashboard elements with real calculated values
        const userName = this.currentUser.fullName || this.currentUser.name || 'User';
        
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = userName;
            console.log('Updated userName to:', userName);
        }
        
        // Update domain page username
        const domainUserNameEl = document.getElementById('domainUserName');
        if (domainUserNameEl) {
            domainUserNameEl.textContent = userName;
            console.log('Updated domainUserName to:', userName);
        }
        
        const totalCreditsEl = document.getElementById('totalCredits');
        if (totalCreditsEl) {
            totalCreditsEl.textContent = realStats.totalCredits;
            console.log('Updated totalCredits to:', realStats.totalCredits);
        }
        
        const currentStreakEl = document.getElementById('currentStreak');
        if (currentStreakEl) {
            currentStreakEl.textContent = realStats.currentStreak;
            console.log('Updated currentStreak to:', realStats.currentStreak);
        }
        
        const accuracyEl = document.getElementById('accuracy');
        if (accuracyEl) {
            accuracyEl.textContent = `${realStats.overallAccuracy}%`;
            console.log('Updated accuracy to:', `${realStats.overallAccuracy}%`);
        }
        
        const interviewsCompletedEl = document.getElementById('interviewsCompleted');
        if (interviewsCompletedEl) {
            interviewsCompletedEl.textContent = realStats.totalInterviews;
            console.log('Updated interviewsCompleted to:', realStats.totalInterviews);
        }
        
        // Update profile section
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) {
            profileNameEl.textContent = userName;
        }
        
        const profileEmailEl = document.getElementById('profileEmail');
        if (profileEmailEl) {
            profileEmailEl.textContent = this.currentUser.email || 'No email';
        }
        
        const profileJoinDateEl = document.getElementById('profileJoinDate');
        if (profileJoinDateEl) {
            profileJoinDateEl.textContent = `Member since: ${new Date(this.currentUser.created_at || Date.now()).toLocaleDateString()}`;
        }
        
        const profileCreditsEl = document.getElementById('profileCredits');
        if (profileCreditsEl) {
            profileCreditsEl.textContent = realStats.totalCredits;
        }
        
        const profileStreakEl = document.getElementById('profileStreak');
        if (profileStreakEl) {
            profileStreakEl.textContent = realStats.currentStreak;
        }
        
        const profileAccuracyEl = document.getElementById('profileAccuracy');
        if (profileAccuracyEl) {
            profileAccuracyEl.textContent = `${realStats.overallAccuracy}%`;
        }
        
        console.log('Dashboard stats updated successfully with real values:', realStats);
    }

    async syncUserStatsWithServer() {
        try {
            console.log('Syncing user stats with server...');
            const response = await fetch(`/api/sync-user-stats?email=${encodeURIComponent(this.currentUser.email)}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Server stats synced:', data);
                
                // Update local user data with synced stats
                this.currentUser.credits = data.credits;
                this.currentUser.streak = data.streak;
                this.currentUser.accuracy = data.accuracy;
                this.currentUser.interviewsCompleted = data.interviewsCompleted;
                
                console.log('Local user data updated with synced stats:', this.currentUser);
            } else {
                console.error('Failed to sync stats with server:', response.statusText);
            }
        } catch (error) {
            console.error('Error syncing stats with server:', error);
        }
    }

    calculateRealStatsFromHistory() {
        // Get interview history from localStorage
        const historyKey = `interviewHistory_${this.currentUser.email}`;
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        console.log('Calculating stats from history:', history);
        
        let totalCredits = 0;
        let totalInterviews = history.length;
        let totalScore = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        // Calculate stats from each interview
        history.forEach((interview, index) => {
            // Add credits earned from this interview
            totalCredits += interview.creditsEarned || 0;
            
            // Add to total score for accuracy calculation
            totalScore += interview.score || 0;
            
            // Calculate streaks (70% or higher is considered good)
            if (interview.score >= 70) {
                tempStreak++;
                currentStreak = tempStreak;
                if (tempStreak > bestStreak) {
                    bestStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
                // For current streak, we want the streak from the most recent interviews
                if (index >= history.length - 10) { // Only consider last 10 interviews for current streak
                    currentStreak = tempStreak;
                }
            }
        });
        
        // Calculate overall accuracy
        const overallAccuracy = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;
        
        const realStats = {
            totalCredits: totalCredits,
            totalInterviews: totalInterviews,
            overallAccuracy: overallAccuracy,
            currentStreak: currentStreak,
            bestStreak: bestStreak,
            averageScore: totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0
        };
        
        console.log('Real stats calculated:', realStats);
        return realStats;
    }

    updateDomainProgress(progress) {
        document.querySelectorAll('.domain-card').forEach(card => {
            const domain = card.dataset.domain;
            const domainProgress = progress[domain] || { completed: 0 };
            const completed = domainProgress.completed || 0;
            const percentage = Math.round((completed / 7) * 100);
            
            card.querySelector('.progress-fill').style.width = `${percentage}%`;
            card.querySelector('.progress-text').textContent = `${completed}/7 completed`;
        });
    }

    updateNavigationStats() {
        if (!this.currentUser) {
            console.log('No current user found for updateNavigationStats');
            return;
        }
        
        const userName = this.currentUser.fullName || this.currentUser.name || 'User';
        
        // Update user menu name - with null check
        const userMenuName = document.getElementById('userMenuName');
        if (userMenuName) {
            userMenuName.textContent = userName;
        }
        
        // Update domain page username - with null check
        const domainUserName = document.getElementById('domainUserName');
        if (domainUserName) {
            domainUserName.textContent = userName;
        }
    }
    
    updateDomainPageUsername() {
        console.log('updateDomainPageUsername called');
        console.log('Current user:', this.currentUser);
        
        if (!this.currentUser) {
            console.log('No current user found for updateDomainPageUsername');
            // Try to get user from localStorage
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                console.log('Loaded user from localStorage:', this.currentUser);
            } else {
                console.log('No user found in localStorage either');
                return;
            }
        }
        
        const userName = this.currentUser.fullName || this.currentUser.name || this.currentUser.email || 'User';
        console.log('Username to display:', userName);
        
        // Update domain page username - with multiple retry attempts
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryUpdateUsername = () => {
            attempts++;
            const domainUserName = document.getElementById('domainUserName');
            console.log(`Attempt ${attempts}: domainUserName element found:`, !!domainUserName);
            
            if (domainUserName) {
                domainUserName.textContent = userName;
                console.log('✅ Successfully updated domain page username to:', userName);
                return true;
            } else if (attempts < maxAttempts) {
                console.log(`❌ domainUserName element not found, retrying in ${attempts * 100}ms...`);
                setTimeout(tryUpdateUsername, attempts * 100);
            } else {
                console.log('❌ domainUserName element not found after all attempts');
                // Try to find any element with similar text
                const welcomeElements = document.querySelectorAll('h2');
                welcomeElements.forEach((el, index) => {
                    if (el.textContent.includes('Welcome')) {
                        console.log(`Found welcome element ${index}:`, el.textContent);
                        el.innerHTML = el.innerHTML.replace(/Welcome,.*?!/, `Welcome, ${userName}!`);
                        console.log('Updated welcome element directly');
                    }
                });
            }
        };
        
        tryUpdateUsername();
        
        // Update navigation stats - with null checks
        const navCredits = document.getElementById('navCredits');
        if (navCredits) {
            navCredits.textContent = this.currentUser.credits || 0;
        }
        
        const navStreak = document.getElementById('navStreak');
        if (navStreak) {
            navStreak.textContent = this.currentUser.streak || 0;
        }
        
        const navAccuracy = document.getElementById('navAccuracy');
        if (navAccuracy) {
            navAccuracy.textContent = `${Math.round(this.currentUser.accuracy || 0)}%`;
        }
    }

    saveInterviewToHistory(results) {
        if (!this.currentUser) {
            console.log('No current user, cannot save interview history');
            return;
        }
        
        console.log('Saving interview to history for user:', this.currentUser.email);
        
        const interviewData = {
            id: Date.now().toString(),
            domain: this.currentDomain,
            difficulty: this.currentDifficulty,
            score: results.accuracy,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            timeTaken: results.timeTaken,
            creditsEarned: results.creditsEarned,
            completedAt: new Date().toISOString(),
            domainDisplayName: this.getDomainDisplayName(this.currentDomain)
        };
        
        console.log('Interview data to save:', interviewData);
        
        // Get existing history from localStorage
        let history = JSON.parse(localStorage.getItem(`interviewHistory_${this.currentUser.email}`) || '[]');
        
        // Add new interview to beginning of array
        history.unshift(interviewData);
        
        // Keep only last 20 interviews
        history = history.slice(0, 20);
        
        console.log('Updated history:', history);
        
        // Save back to localStorage
        localStorage.setItem(`interviewHistory_${this.currentUser.email}`, JSON.stringify(history));
        
        console.log('Interview history saved successfully');
    }

    loadInterviewHistory() {
        if (!this.currentUser) {
            console.log('No current user for interview history');
            return;
        }
        
        console.log('Loading interview history for user:', this.currentUser.email);
        
        // Get interview history from localStorage
        const history = JSON.parse(localStorage.getItem(`interviewHistory_${this.currentUser.email}`) || '[]');
        
        console.log('Interview history found:', history);
        
        // Update history stats
        this.updateHistoryStats(history);
        
        // Display history list
        this.displayHistoryList(history);
    }

    updateHistoryStats(history) {
        if (history.length === 0) {
            document.getElementById('totalAttempts').textContent = '0';
            document.getElementById('averageScore').textContent = '0%';
            document.getElementById('bestScore').textContent = '0%';
            document.getElementById('currentStreakHistory').textContent = '0';
            return;
        }
        
        // Use the real calculated stats from history
        const realStats = this.calculateRealStatsFromHistory();
        
        // Update UI with real calculated values
        document.getElementById('totalAttempts').textContent = realStats.totalInterviews;
        document.getElementById('averageScore').textContent = `${realStats.overallAccuracy}%`;
        document.getElementById('bestScore').textContent = `${realStats.bestStreak}`; // Best streak as performance indicator
        document.getElementById('currentStreakHistory').textContent = realStats.currentStreak;
    }

    displayHistoryList(history) {
        const historyList = document.getElementById('interviewHistoryList');
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No interviews completed yet</p>
                    <small>Start your first interview to see your progress here</small>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = history.map(interview => {
            const scoreClass = this.getScoreClass(interview.score);
            const difficultyClass = `difficulty-${interview.difficulty}`;
            const completedDate = new Date(interview.completedAt).toLocaleDateString();
            const completedTime = new Date(interview.completedAt).toLocaleTimeString();
            
            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-item-title">
                            ${interview.domainDisplayName} - ${interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)}
                        </div>
                        <div class="history-item-score ${scoreClass}">
                            ${interview.score}%
                        </div>
                    </div>
                    <div class="history-item-details">
                        <div class="history-detail">
                            <span class="history-detail-label">Correct Answers</span>
                            <span class="history-detail-value">${interview.correctAnswers}/${interview.totalQuestions}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Difficulty</span>
                            <span class="history-detail-value">
                                <span class="history-difficulty-badge ${difficultyClass}">${interview.difficulty}</span>
                            </span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Time Taken</span>
                            <span class="history-detail-value">${this.formatTime(interview.timeTaken)}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Credits Earned</span>
                            <span class="history-detail-value">+${interview.creditsEarned}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Completed</span>
                            <span class="history-detail-value">${completedDate} at ${completedTime}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'average';
        return 'poor';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.interviewMaster = new InterviewMaster();
});
