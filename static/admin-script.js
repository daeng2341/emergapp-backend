// Initialize map
let emergencyMap;
let routeMap;
let markers = [];
let emergencyMarkers = {};

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeMap();
    initializeFilters();
    initializeModals();
    loadEmergencyData();
    loadNews();
    loadAdvisories();
    loadResponders();
    loadDutySchedule();
    initializeResponderFilters();
});

// Tab Navigation
function initializeTabs() {
    const tabLinks = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');

            // Update active states
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                    if (tabId === 'map-view') {
                        emergencyMap.invalidateSize();
                    }
                }
            });
        });
    });
}

// Map Initialization
function initializeMap() {
    // Initialize emergency map
    emergencyMap = L.map('emergency-map').setView([14.2277, 121.3295], 13); // Victoria, Laguna coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(emergencyMap);

    // Initialize route map (for modal)
    routeMap = L.map('route-map').setView([14.2277, 121.3295], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
}

// Emergency Data Loading
function loadEmergencyData() {
    // Fetch emergency data from the server
    fetch('/api/emergencies')
        .then(response => response.json())
        .then(data => {
            updateEmergencyMarkers(data);
            updateEmergencyTable(data);
            updateCategoryCounts(data);
        })
        .catch(error => console.error('Error loading emergency data:', error));
}

// Update Emergency Markers on Map
function updateEmergencyMarkers(emergencies) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    emergencyMarkers = {};

    emergencies.forEach(emergency => {
        const [lat, lng] = emergency.location.split(',').map(coord => parseFloat(coord));
        
        // Create marker with custom icon based on emergency type
        const markerIcon = L.divIcon({
            className: `emergency-marker ${emergency.type.toLowerCase()}`,
            html: `<i class="fas ${getEmergencyIcon(emergency.type)}"></i>`,
            iconSize: [30, 30]
        });

        const marker = L.marker([lat, lng], { icon: markerIcon })
            .bindPopup(createEmergencyPopup(emergency))
            .addTo(emergencyMap);

        markers.push(marker);
        emergencyMarkers[emergency.id] = marker;
    });
}

// Get Emergency Icon
function getEmergencyIcon(type) {
    const icons = {
        'Fire': 'fa-fire',
        'Disaster': 'fa-house-damage',
        'Crime': 'fa-shield-alt',
        'Help': 'fa-hands-helping'
    };
    return icons[type] || 'fa-exclamation-circle';
}

// Create Emergency Popup
function createEmergencyPopup(emergency) {
    return `
        <div class="emergency-popup">
            <h3>${emergency.type} Emergency</h3>
            <p><strong>Location:</strong> ${emergency.location}</p>
            <p><strong>Status:</strong> ${emergency.status}</p>
            <p><strong>Time:</strong> ${new Date(emergency.created_at).toLocaleString()}</p>
            <button onclick="viewEmergency(${emergency.id})">View Details</button>
            <button onclick="showRoute(${emergency.id})">Show Route</button>
        </div>
    `;
}

// Update Emergency Table
function updateEmergencyTable(emergencies) {
    const tbody = document.querySelector('.recent-emergencies tbody');
    tbody.innerHTML = '';

    emergencies.forEach(emergency => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#EMG-${emergency.id}</td>
            <td>
                <span class="badge badge-${getEmergencyBadgeClass(emergency.type)}">
                    ${emergency.type}
                </span>
            </td>
            <td>${emergency.location}</td>
            <td>
                <span class="badge badge-${getStatusBadgeClass(emergency.status)}">
                    ${emergency.status}
                </span>
            </td>
            <td>${new Date(emergency.created_at).toLocaleTimeString()}</td>
            <td>
                <button class="btn-view" onclick="viewEmergency(${emergency.id})">View</button>
                <button class="btn-route" onclick="showRoute(${emergency.id})">Route</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update Category Counts
function updateCategoryCounts(emergencies) {
    const counts = {
        'fire': 0,
        'disaster': 0,
        'crime': 0,
        'help': 0
    };

    emergencies.forEach(emergency => {
        const type = emergency.type.toLowerCase();
        if (counts.hasOwnProperty(type)) {
            counts[type]++;
        }
    });

    Object.entries(counts).forEach(([type, count]) => {
        const countElement = document.querySelector(`.category-card[data-category="${type}"] .count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Get Emergency Badge Class
function getEmergencyBadgeClass(type) {
    const classes = {
        'Fire': 'red',
        'Disaster': 'orange',
        'Crime': 'purple',
        'Help': 'blue'
    };
    return classes[type] || 'gray';
}

// Get Status Badge Class
function getStatusBadgeClass(status) {
    const classes = {
        'Active': 'red',
        'In Progress': 'orange',
        'Resolved': 'green'
    };
    return classes[status] || 'gray';
}

// Initialize Filters
function initializeFilters() {
    // Map filters
    const mapFilters = document.querySelectorAll('.map-controls .btn-filter');
    mapFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.getAttribute('data-filter');
            filterEmergencyMarkers(category);
            
            // Update active state
            mapFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
        });
    });

    // Emergency list filters
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterEmergencyList();
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            filterEmergencyList();
        });
    }
}

// Filter Emergency Markers
function filterEmergencyMarkers(category) {
    markers.forEach(marker => {
        const emergencyType = marker.getPopup().getContent().includes(category);
        if (category === 'all' || emergencyType) {
            marker.addTo(emergencyMap);
        } else {
            marker.remove();
        }
    });
}

// Filter Emergency List
function filterEmergencyList() {
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    
    if (!statusFilter || !typeFilter) return;

    const status = statusFilter.value;
    const type = typeFilter.value;

    // Implement filtering logic here
    // This will be connected to the backend API
}

// Initialize Modals
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal .close');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// View Emergency Details
function viewEmergency(emergencyId) {
    const modal = document.getElementById('emergency-modal');
    const detailsContainer = modal.querySelector('.emergency-details');

    // Fetch emergency details from the server
    fetch(`/api/emergencies/${emergencyId}`)
        .then(response => response.json())
        .then(emergency => {
            detailsContainer.innerHTML = `
                <h2>${emergency.type} Emergency</h2>
                <div class="emergency-info">
                    <p><strong>Location:</strong> ${emergency.location}</p>
                    <p><strong>Status:</strong> ${emergency.status}</p>
                    <p><strong>Reported:</strong> ${new Date(emergency.created_at).toLocaleString()}</p>
                    <p><strong>Description:</strong> ${emergency.description || 'No description provided'}</p>
                </div>
                <div class="emergency-actions">
                    <button onclick="updateStatus(${emergencyId}, 'In Progress')">Mark In Progress</button>
                    <button onclick="updateStatus(${emergencyId}, 'Resolved')">Mark Resolved</button>
                    <button onclick="assignResponders(${emergencyId})">Assign Responders</button>
                </div>
            `;
            modal.style.display = 'block';
        })
        .catch(error => console.error('Error loading emergency details:', error));
}

// Show Route to Emergency
function showRoute(emergencyId) {
    const modal = document.getElementById('route-modal');
    const routeInfo = modal.querySelector('.route-info');

    // Fetch emergency location and calculate route
    fetch(`/api/emergencies/${emergencyId}`)
        .then(response => response.json())
        .then(emergency => {
            const [lat, lng] = emergency.location.split(',').map(coord => parseFloat(coord));
            
            // Clear existing route
            routeMap.eachLayer((layer) => {
                if (layer instanceof L.Polyline) {
                    layer.remove();
                }
            });

            // Add emergency marker
            L.marker([lat, lng]).addTo(routeMap);

            // Get current location and calculate route
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const currentLat = position.coords.latitude;
                    const currentLng = position.coords.longitude;

                    // Add current location marker
                    L.marker([currentLat, currentLng]).addTo(routeMap);

                    // Calculate and display route
                    calculateRoute(currentLat, currentLng, lat, lng, routeInfo);
                });
            }

            modal.style.display = 'block';
            routeMap.invalidateSize();
        })
        .catch(error => console.error('Error loading route information:', error));
}

// Calculate Route
function calculateRoute(startLat, startLng, endLat, endLng, routeInfo) {
    // Use OpenStreetMap Routing Machine API
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Draw route on map
                L.polyline(coordinates, {
                    color: '#3498db',
                    weight: 5,
                    opacity: 0.7
                }).addTo(routeMap);

                // Fit map to show entire route
                routeMap.fitBounds(L.polyline(coordinates).getBounds());

                // Display route information
                routeInfo.innerHTML = `
                    <h3>Route Information</h3>
                    <p><strong>Distance:</strong> ${(route.distance / 1000).toFixed(2)} km</p>
                    <p><strong>Estimated Time:</strong> ${Math.ceil(route.duration / 60)} minutes</p>
                `;
            }
        })
        .catch(error => console.error('Error calculating route:', error));
}

// Update Emergency Status
function updateStatus(emergencyId, status) {
    fetch(`/api/emergencies/${emergencyId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        loadEmergencyData(); // Refresh data
        document.getElementById('emergency-modal').style.display = 'none';
    })
    .catch(error => console.error('Error updating status:', error));
}

// Assign Responders
function assignResponders(emergencyId) {
    // Implement responder assignment logic
    // This will be connected to the backend API
}

// Real-time Updates
function initializeRealTimeUpdates() {
    // Implement WebSocket connection for real-time updates
    const ws = new WebSocket('ws://' + window.location.host + '/ws');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'emergency_update') {
            loadEmergencyData(); // Refresh data
        }
    };
}

// Initialize real-time updates
initializeRealTimeUpdates();

// News and Advisory Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize news and advisory forms
    const newsForm = document.getElementById('news-form');
    const advisoryForm = document.getElementById('advisory-form');
    const newsImageInput = document.getElementById('news-image');
    const advisoryImageInput = document.getElementById('advisory-image');
    const newsImagePreview = document.getElementById('news-image-preview');
    const advisoryImagePreview = document.getElementById('advisory-image-preview');

    // News form handling
    if (newsForm) {
        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const editId = this.dataset.editId;
            
            try {
                const response = await fetch(editId ? `/api/news/${editId}` : '/api/news', {
                    method: editId ? 'PUT' : 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification(editId ? 'News updated successfully!' : 'News published successfully!', 'success');
                    closeModal('news-modal');
                    loadNews();
                    this.reset();
                    this.removeAttribute('data-edit-id');
                    newsImagePreview.innerHTML = '';
                } else {
                    const error = await response.json();
                    showNotification(error.error || 'Failed to publish news', 'error');
                }
            } catch (error) {
                showNotification('Error publishing news', 'error');
            }
        });
    }

    // Advisory form handling
    if (advisoryForm) {
        advisoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const editId = this.dataset.editId;
            
            try {
                const response = await fetch(editId ? `/api/advisories/${editId}` : '/api/advisories', {
                    method: editId ? 'PUT' : 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification(editId ? 'Advisory updated successfully!' : 'Advisory published successfully!', 'success');
                    closeModal('advisory-modal');
                    loadAdvisories();
                    this.reset();
                    this.removeAttribute('data-edit-id');
                    advisoryImagePreview.innerHTML = '';
                } else {
                    const error = await response.json();
                    showNotification(error.error || 'Failed to publish advisory', 'error');
                }
            } catch (error) {
                showNotification('Error publishing advisory', 'error');
            }
        });
    }

    // Image preview for news
    if (newsImageInput) {
        newsImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newsImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Image preview for advisory
    if (advisoryImageInput) {
        advisoryImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    advisoryImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Load news items
async function loadNews() {
    try {
        const response = await fetch('/api/news');
        const news = await response.json();
        
        const newsList = document.querySelector('.news-list');
        if (newsList) {
            newsList.innerHTML = news.map(item => `
                <div class="news-item" data-id="${item.id}">
                    <div class="news-content">
                        <h4>${item.title}</h4>
                        <p>${item.content}</p>
                        ${item.image_url ? `<img src="${item.image_url}" alt="News image">` : ''}
                        <div class="news-meta">
                            <span>By ${item.author_name}</span>
                            <span>${new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="news-actions">
                        <button onclick="editNews(${item.id})" class="btn-edit">Edit</button>
                        <button onclick="deleteNews(${item.id})" class="btn-delete">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        showNotification('Error loading news', 'error');
    }
}

// Load advisories
async function loadAdvisories() {
    try {
        const response = await fetch('/api/advisories');
        const advisories = await response.json();
        
        const advisoryList = document.querySelector('.advisory-list');
        if (advisoryList) {
            advisoryList.innerHTML = advisories.map(item => `
                <div class="advisory-item" data-id="${item.id}">
                    <div class="advisory-content">
                        <h4>${item.title}</h4>
                        <p>${item.content}</p>
                        ${item.image_url ? `<img src="${item.image_url}" alt="Advisory image">` : ''}
                        <div class="advisory-meta">
                            <span class="priority-badge ${item.priority}">${item.priority}</span>
                            <span>By ${item.author_name}</span>
                            <span>${new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="advisory-actions">
                        <button onclick="editAdvisory(${item.id})" class="btn-edit">Edit</button>
                        <button onclick="deleteAdvisory(${item.id})" class="btn-delete">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        showNotification('Error loading advisories', 'error');
    }
}

// Show news form
function showNewsForm() {
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-form');
    form.reset();
    form.removeAttribute('data-edit-id');
    document.getElementById('news-image-preview').innerHTML = '';
    modal.style.display = 'block';
}

// Show advisory form
function showAdvisoryForm() {
    const modal = document.getElementById('advisory-modal');
    const form = document.getElementById('advisory-form');
    form.reset();
    form.removeAttribute('data-edit-id');
    document.getElementById('advisory-image-preview').innerHTML = '';
    modal.style.display = 'block';
}

// Edit news
async function editNews(id) {
    try {
        const response = await fetch(`/api/news/${id}`);
        const news = await response.json();
        
        const form = document.getElementById('news-form');
        form.dataset.editId = id;
        
        document.getElementById('news-title').value = news.title;
        document.getElementById('news-content').value = news.content;
        
        const imagePreview = document.getElementById('news-image-preview');
        if (news.image_url) {
            imagePreview.innerHTML = `<img src="${news.image_url}" alt="Current image">`;
        }
        
        showModal('news-modal');
    } catch (error) {
        showNotification('Error loading news details', 'error');
    }
}

// Edit advisory
async function editAdvisory(id) {
    try {
        const response = await fetch(`/api/advisories/${id}`);
        const advisory = await response.json();
        
        const form = document.getElementById('advisory-form');
        form.dataset.editId = id;
        
        document.getElementById('advisory-title').value = advisory.title;
        document.getElementById('advisory-content').value = advisory.content;
        document.getElementById('advisory-type').value = advisory.type;
        document.getElementById('advisory-priority').value = advisory.priority;
        
        const imagePreview = document.getElementById('advisory-image-preview');
        if (advisory.image_url) {
            imagePreview.innerHTML = `<img src="${advisory.image_url}" alt="Current image">`;
        }
        
        showModal('advisory-modal');
    } catch (error) {
        showNotification('Error loading advisory details', 'error');
    }
}

// Delete news
async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news item?')) return;
    
    try {
        const response = await fetch(`/api/news/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('News deleted successfully!', 'success');
            loadNews();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to delete news', 'error');
        }
    } catch (error) {
        showNotification('Error deleting news', 'error');
    }
}

// Delete advisory
async function deleteAdvisory(id) {
    if (!confirm('Are you sure you want to delete this advisory?')) return;
    
    try {
        const response = await fetch(`/api/advisories/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Advisory deleted successfully!', 'success');
            loadAdvisories();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to delete advisory', 'error');
        }
    } catch (error) {
        showNotification('Error deleting advisory', 'error');
    }
}

// Utility functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type) {
    // Implement your notification system here
    alert(message);
}

// Close modals when clicking the close button or outside the modal
document.querySelectorAll('.modal .close').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Responder Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize responder management
    loadResponders();
    loadDutySchedule();
    initializeResponderFilters();
});

// Load responders
async function loadResponders(department = 'all') {
    try {
        const response = await fetch(`/api/responders${department !== 'all' ? `?department=${department}` : ''}`);
        const responders = await response.json();
        
        const respondersGrid = document.querySelector('.responders-grid');
        if (respondersGrid) {
            respondersGrid.innerHTML = responders.map(responder => `
                <div class="responder-card" data-id="${responder.id}">
                    <div class="responder-info">
                        <h4>${responder.rank} ${responder.first_name} ${responder.last_name}</h4>
                        <p>${responder.position}</p>
                        <p>${responder.department_name}</p>
                        <div class="responder-contact">
                            <span>${responder.contact_number}</span>
                            <span>${responder.email}</span>
                        </div>
                    </div>
                    <div class="responder-actions">
                        <button onclick="editResponder(${responder.id})" class="btn-edit">Edit</button>
                        <button onclick="toggleResponderStatus(${responder.id})" class="btn-status">
                            ${responder.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        showNotification('Error loading responders', 'error');
    }
}

// Load duty schedule
async function loadDutySchedule(date = new Date().toISOString().split('T')[0]) {
    try {
        const response = await fetch(`/api/duty-schedules?date=${date}`);
        const schedules = await response.json();
        
        const scheduleTable = document.querySelector('.duty-schedule tbody');
        if (scheduleTable) {
            scheduleTable.innerHTML = schedules.map(schedule => `
                <tr>
                    <td>${schedule.department_name}</td>
                    <td>${schedule.responder_name}</td>
                    <td>${schedule.shift}</td>
                    <td>
                        <span class="status-badge ${schedule.status}">${schedule.status}</span>
                    </td>
                    <td>
                        <button onclick="updateDutyStatus(${schedule.id}, 'on_duty')" class="btn-status">Start Duty</button>
                        <button onclick="updateDutyStatus(${schedule.id}, 'completed')" class="btn-complete">Complete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showNotification('Error loading duty schedule', 'error');
    }
}

// Initialize responder filters
function initializeResponderFilters() {
    const searchInput = document.getElementById('responder-search');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const departmentTabs = document.querySelectorAll('.department-tabs .tab-btn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterResponders();
        }, 300));
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterResponders);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadDutySchedule(this.value);
        });
    }

    if (departmentTabs) {
        departmentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                departmentTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                loadResponders(this.dataset.dept);
            });
        });
    }
}

// Filter responders
function filterResponders() {
    const searchTerm = document.getElementById('responder-search').value.toLowerCase();
    const status = document.getElementById('status-filter').value;
    const cards = document.querySelectorAll('.responder-card');

    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const cardStatus = card.dataset.status;
        const matchesSearch = name.includes(searchTerm);
        const matchesStatus = status === 'all' || cardStatus === status;

        card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
    });
}

// Show add responder form
function showAddResponderForm() {
    const modal = document.getElementById('responder-modal');
    const form = document.getElementById('responder-form');
    form.reset();
    form.removeAttribute('data-edit-id');
    modal.style.display = 'block';
}

// Show duty schedule form
function showDutyScheduleForm() {
    const modal = document.getElementById('duty-schedule-modal');
    const form = document.getElementById('duty-schedule-form');
    form.reset();
    form.removeAttribute('data-edit-id');
    modal.style.display = 'block';
}

// Show report form
function showReportForm() {
    const modal = document.getElementById('report-modal');
    const form = document.getElementById('report-form');
    form.reset();
    modal.style.display = 'block';
}

// Handle responder form submission
document.getElementById('responder-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const editId = this.dataset.editId;
    
    try {
        const response = await fetch(editId ? `/api/responders/${editId}` : '/api/responders', {
            method: editId ? 'PUT' : 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification(editId ? 'Responder updated successfully!' : 'Responder added successfully!', 'success');
            closeModal('responder-modal');
            loadResponders();
            this.reset();
            this.removeAttribute('data-edit-id');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to save responder', 'error');
        }
    } catch (error) {
        showNotification('Error saving responder', 'error');
    }
});

// Handle duty schedule form submission
document.getElementById('duty-schedule-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    try {
        const response = await fetch('/api/duty-schedules', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification('Duty scheduled successfully!', 'success');
            closeModal('duty-schedule-modal');
            loadDutySchedule();
            this.reset();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to schedule duty', 'error');
        }
    } catch (error) {
        showNotification('Error scheduling duty', 'error');
    }
});

// Handle report form submission
document.getElementById('report-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    try {
        const response = await fetch('/api/reports/generate', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `duty-report-${formData.get('report_date')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Report generated successfully!', 'success');
            closeModal('report-modal');
            this.reset();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to generate report', 'error');
        }
    } catch (error) {
        showNotification('Error generating report', 'error');
    }
});

// Update duty status
async function updateDutyStatus(id, status) {
    try {
        const response = await fetch(`/api/duty-schedules/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification('Duty status updated successfully!', 'success');
            loadDutySchedule();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update duty status', 'error');
        }
    } catch (error) {
        showNotification('Error updating duty status', 'error');
    }
}

// Toggle responder status
async function toggleResponderStatus(id) {
    try {
        const response = await fetch(`/api/responders/${id}/toggle-status`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showNotification('Responder status updated successfully!', 'success');
            loadResponders();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update responder status', 'error');
        }
    } catch (error) {
        showNotification('Error updating responder status', 'error');
    }
}

// Edit responder
async function editResponder(id) {
    try {
        const response = await fetch(`/api/responders/${id}`);
        const responder = await response.json();
        
        const form = document.getElementById('responder-form');
        form.dataset.editId = id;
        
        document.getElementById('department').value = responder.department_id;
        document.getElementById('first-name').value = responder.first_name;
        document.getElementById('last-name').value = responder.last_name;
        document.getElementById('rank').value = responder.rank;
        document.getElementById('position').value = responder.position;
        document.getElementById('contact').value = responder.contact_number;
        document.getElementById('email').value = responder.email;
        
        showModal('responder-modal');
    } catch (error) {
        showNotification('Error loading responder details', 'error');
    }
}

// Load department responders
document.getElementById('schedule-department').addEventListener('change', async function() {
    const departmentId = this.value;
    if (!departmentId) return;
    
    try {
        const response = await fetch(`/api/responders?department_id=${departmentId}`);
        const responders = await response.json();
        
        const responderSelect = document.getElementById('schedule-responder');
        responderSelect.innerHTML = '<option value="">Select Responder</option>' +
            responders.map(responder => `
                <option value="${responder.id}">
                    ${responder.rank} ${responder.first_name} ${responder.last_name}
                </option>
            `).join('');
    } catch (error) {
        showNotification('Error loading department responders', 'error');
    }
});