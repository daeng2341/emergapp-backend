document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabNavBtns = document.querySelectorAll('.tab-nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const quickLinks = document.querySelectorAll('.quick-link');
    const emergencyTypes = document.querySelectorAll('.emergency-type');
    const emergencyDetails = document.getElementById('emergency-details');
    const emergencyActive = document.getElementById('emergency-active');
    const sosBtn = document.getElementById('sos-btn');
    const cancelBtn = document.querySelector('.btn-cancel');
    const infoCategories = document.querySelectorAll('.info-category');
    const infoContent = document.getElementById('info-content');
    const backBtn = document.querySelector('.btn-back');
    const infoTitle = document.getElementById('info-title');
    const infoText = document.getElementById('info-text');
    const notificationBell = document.getElementById('notification-bell');
    const notificationPanel = document.getElementById('notification-panel');
    const closeNotifications = document.getElementById('close-notifications');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Sample user data (in a real app, this would come from a database)
    let users = JSON.parse(localStorage.getItem('emergencyAppUsers')) || [];
    let currentUser = null;
    
    // Sample emergency information
    const emergencyInfo = {
        fire: {
            title: "Fire Prevention",
            content: `<h4>Fire Safety Tips</h4>
                      <ul>
                        <li>Install smoke alarms on every level of your home and test them monthly.</li>
                        <li>Create and practice a fire escape plan with your family.</li>
                        <li>Keep flammable items at least 3 feet away from anything that gets hot.</li>
                        <li>Never leave cooking unattended.</li>
                        <li>Learn how to properly use a fire extinguisher.</li>
                        <li>If a fire occurs, get out immediately and call for help.</li>
                      </ul>`
        },
        cybercrime: {
            title: "Cybercrime Prevention",
            content: `<h4>Protect Yourself Online</h4>
                      <ul>
                        <li>Use strong, unique passwords for all accounts.</li>
                        <li>Enable two-factor authentication where available.</li>
                        <li>Be cautious of suspicious emails and links.</li>
                        <li>Keep your software and devices updated.</li>
                        <li>Use secure networks and avoid public Wi-Fi for sensitive transactions.</li>
                        <li>Regularly monitor your financial accounts for unauthorized activity.</li>
                      </ul>`
        },
        crime: {
            title: "Crime Prevention",
            content: `<h4>Staying Safe in Your Community</h4>
                      <ul>
                        <li>Be aware of your surroundings at all times.</li>
                        <li>Walk confidently and with purpose.</li>
                        <li>Avoid displaying valuables in public.</li>
                        <li>Lock doors and windows when leaving home.</li>
                        <li>Get to know your neighbors and look out for each other.</li>
                        <li>Report suspicious activity to authorities immediately.</li>
                      </ul>`
        },
        women: {
            title: "Women's Protection",
            content: `<h4>Safety Resources for Women</h4>
                      <ul>
                        <li>Trust your instincts - if a situation feels wrong, remove yourself.</li>
                        <li>Share your location with trusted contacts when meeting new people.</li>
                        <li>Learn self-defense techniques.</li>
                        <li>Be cautious with personal information on social media.</li>
                        <li>Know emergency contacts and safe places in your area.</li>
                        <li>Report harassment or threats to authorities immediately.</li>
                      </ul>
                      <h4>Local Resources in Victoria, Laguna</h4>
                      <p>Women's Help Desk at Victoria Police Station: (049) 123-4567</p>
                      <p>24/7 Crisis Hotline: 0917-123-4567</p>`
        },
        health: {
            title: "Health Information",
            content: `<h4>Local Health Resources</h4>
                      <p>Victoria Community Health Center: (049) 234-5678</p>
                      <p>Open Monday-Friday, 8AM-5PM</p>
                      <h4>Emergency Services</h4>
                      <p>Ambulance: 0922-987-6543</p>
                      <p>Hospital Emergency: 0917-765-4321</p>
                      <h4>Common Health Concerns</h4>
                      <ul>
                        <li>Stay hydrated during hot weather.</li>
                        <li>Use mosquito repellent to prevent dengue.</li>
                        <li>Practice proper food handling to avoid foodborne illnesses.</li>
                        <li>Get regular check-ups for chronic conditions.</li>
                      </ul>`
        },
        firstaid: {
            title: "First Aid Information",
            content: `<h4>Basic First Aid Procedures</h4>
                      <h5>CPR (Cardiopulmonary Resuscitation)</h5>
                      <ol>
                        <li>Check for responsiveness and breathing.</li>
                        <li>Call for help.</li>
                        <li>Place heel of hand on center of chest, other hand on top.</li>
                        <li>Push hard and fast (100-120 compressions per minute).</li>
                        <li>Give 2 rescue breaths after every 30 compressions.</li>
                      </ol>
                      <h5>Bleeding</h5>
                      <ol>
                        <li>Apply direct pressure with clean cloth.</li>
                        <li>Elevate the injured area if possible.</li>
                        <li>Add more layers if blood soaks through.</li>
                        <li>Seek medical help for serious wounds.</li>
                      </ol>
                      <h5>Burns</h5>
                      <ol>
                        <li>Cool with running water for 10-15 minutes.</li>
                        <li>Do not use ice or butter.</li>
                        <li>Cover with sterile dressing.</li>
                        <li>Seek medical help for serious burns.</li>
                      </ol>`
        }
    };
    
    // Sample news data
    const newsItems = [
        {
            title: "Fire Safety Seminar at Barangay Hall",
            content: "The Victoria Fire Department will conduct a free fire safety seminar this Saturday at the Barangay Hall from 9AM to 12PM.",
            date: "2023-06-15"
        },
        {
            title: "New Emergency Hotline Numbers",
            content: "The municipality has updated its emergency contact numbers. Please save these in your phones for quick access.",
            date: "2023-06-10"
        },
        {
            title: "Typhoon Preparedness Tips",
            content: "With typhoon season approaching, here are important tips to prepare your home and family for potential storms.",
            date: "2023-06-05"
        },
        {
            title: "Road Closure Due to Flooding",
            content: "Municipal Road 5 will be closed until further notice due to severe flooding. Please use alternate routes.",
            date: "2023-05-28"
        }
    ];
    
    // Sample notifications
    const notifications = [
        {
            title: "Fire reported near your area",
            content: "A fire has been reported at Purok 3, about 1km from your location. Authorities are responding.",
            time: "10 minutes ago"
        },
        {
            title: "Emergency contact updated",
            content: "The police station has a new direct line: 0918-555-1234",
            time: "2 days ago"
        },
        {
            title: "Weather alert",
            content: "Heavy rains expected tonight. Prepare for possible flooding.",
            time: "3 days ago"
        }
    ];
    
    // Initialize the app
    function initApp() {
        // Check if user is logged in
        const loggedInUser = localStorage.getItem('emergencyAppCurrentUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            showMainApp();
        } else {
            showAuthScreen();
        }
        
        // Load news
        loadNews();
        
        // Load notifications
        loadNotifications();
    }
    
    // Show authentication screen
    function showAuthScreen() {
        authScreen.classList.add('active');
        mainApp.classList.remove('active');
    }
    
    // Show main app
    function showMainApp() {
        authScreen.classList.remove('active');
        mainApp.classList.add('active');
        
        // Update user info in profile
        if (currentUser) {
            document.getElementById('username-display').textContent = currentUser.name;
            document.getElementById('profile-name').textContent = currentUser.name;
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = currentUser.phone;
            document.getElementById('profile-address').textContent = currentUser.address;
            
            // Set emergency address
            document.getElementById('emergency-address').textContent = currentUser.address;
        }
    }
    
    // Load news items
    function loadNews() {
        const newsList = document.querySelector('.news-list');
        newsList.innerHTML = '';
        
        newsItems.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3>${news.title}</h3>
                <p>${news.content}</p>
                <p class="news-date">${formatDate(news.date)}</p>
            `;
            newsList.appendChild(newsItem);
        });
    }
    
    // Load notifications
    function loadNotifications() {
        const notificationList = document.querySelector('.notification-list');
        notificationList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `
                <h4>${notification.title}</h4>
                <p>${notification.content}</p>
                <p class="notification-time">${notification.time}</p>
            `;
            notificationList.appendChild(notificationItem);
        });
    }
    
    // Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Event Listeners
    // Auth tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(tab).classList.add('active');
        });
    });
    
    // Register button
    registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const address = document.getElementById('register-address').value;
        const phone = document.getElementById('register-phone').value;
        const gender = document.getElementById('register-gender').value;
        const birthday = document.getElementById('register-birthday').value;
        
        // Simple validation
        if (!name || !email || !password || !address || !phone || !gender || !birthday) {
            alert('Please fill in all fields');
            return;
        }
        
        // Check if user already exists
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            alert('User with this email already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            name,
            email,
            password,
            address,
            phone,
            gender,
            birthday
        };
        
        users.push(newUser);
        localStorage.setItem('emergencyAppUsers', JSON.stringify(users));
        
                // Log in the new user
                currentUser = newUser;
                localStorage.setItem('emergencyAppCurrentUser', JSON.stringify(currentUser));
                
                // Show main app
                showMainApp();
                
                // Reset form
                document.getElementById('register').reset();
            });
            
            // Login button
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                // Find user
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    currentUser = user;
                    localStorage.setItem('emergencyAppCurrentUser', JSON.stringify(currentUser));
                    showMainApp();
                    
                    // Reset form
                    document.getElementById('login').reset();
                } else {
                    alert('Invalid email or password');
                }
            });
            
            // Main app tab navigation
            tabNavBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tab = this.dataset.tab;
                    
                    // Update active tab button
                    tabNavBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show corresponding tab content
                    tabPanes.forEach(pane => {
                        pane.classList.remove('active');
                    });
                    document.getElementById(tab).classList.add('active');
                });
            });
            
            // Quick links
            quickLinks.forEach(link => {
                link.addEventListener('click', function() {
                    const tab = this.dataset.tab;
                    
                    // Update active tab button
                    tabNavBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector(`.tab-nav-btn[data-tab="${tab}"]`).classList.add('active');
                    
                    // Show corresponding tab content
                    tabPanes.forEach(pane => {
                        pane.classList.remove('active');
                    });
                    document.getElementById(tab).classList.add('active');
                });
            });
            
            // Emergency types
            emergencyTypes.forEach(type => {
                type.addEventListener('click', function() {
                    emergencyDetails.classList.remove('hidden');
                    
                    // Scroll to emergency details
                    emergencyDetails.scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            // SOS Button
            sosBtn.addEventListener('click', function() {
                // In a real app, this would send the emergency request to authorities
                emergencyDetails.classList.add('hidden');
                emergencyActive.classList.remove('hidden');
                
                // Simulate responders coming
                setTimeout(() => {
                    // In a real app, this would be a push notification
                    alert('First responders have arrived at your location!');
                }, 10000); // 10 seconds delay for simulation
            });
            
            // Cancel emergency
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    emergencyActive.classList.add('hidden');
                    emergencyDetails.classList.remove('hidden');
                });
            }
            
            // Info categories
            infoCategories.forEach(category => {
                category.addEventListener('click', function() {
                    const categoryType = this.dataset.category;
                    
                    // Show info content
                    infoContent.classList.remove('hidden');
                    
                    // Hide categories
                    document.querySelector('.info-categories').classList.add('hidden');
                    
                    // Set content based on category
                    infoTitle.textContent = emergencyInfo[categoryType].title;
                    infoText.innerHTML = emergencyInfo[categoryType].content;
                    
                    // Scroll to top
                    window.scrollTo(0, 0);
                });
            });
            
            // Back button in info section
            backBtn.addEventListener('click', function() {
                infoContent.classList.add('hidden');
                document.querySelector('.info-categories').classList.remove('hidden');
            });
            
            // Notification bell
            notificationBell.addEventListener('click', function() {
                notificationPanel.classList.toggle('hidden');
            });
            
            // Close notifications
            closeNotifications.addEventListener('click', function() {
                notificationPanel.classList.add('hidden');
            });
            
            // Logout button
            logoutBtn.addEventListener('click', function() {
                currentUser = null;
                localStorage.removeItem('emergencyAppCurrentUser');
                showAuthScreen();
                
                // Reset to home tab
                tabNavBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('.tab-nav-btn[data-tab="home"]').classList.add('active');
                
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                document.getElementById('home').classList.add('active');
            });
            
            // Simulate fire alert near user's location
            function simulateFireAlert() {
                // In a real app, this would come from a server push notification
                setTimeout(() => {
                    const notification = {
                        title: "Fire reported near your area",
                        content: "A fire has been reported at Purok 3, about 1km from your location. Authorities are responding.",
                        time: "Just now"
                    };
                    
                    // Add to notifications
                    notifications.unshift(notification);
                    loadNotifications();
                    
                    // Show alert
                    alert(`EMERGENCY ALERT: ${notification.title}\n\n${notification.content}`);
                }, 15000); // 15 seconds delay for simulation
            }
            
            // Initialize the app
            initApp();
            
            // Start simulation (for demo purposes)
            simulateFireAlert();
        });