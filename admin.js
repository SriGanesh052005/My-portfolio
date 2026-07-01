let currentData = {};

// Helper to show/hide views based on authentication status
function updateUIForAuth() {
    const token = localStorage.getItem('authToken');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (token) {
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'block';
    } else {
        loginScreen.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
}

// Handle login submission
async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    errorEl.style.display = 'none';
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
            localStorage.setItem('authToken', result.token);
            updateUIForAuth();
            loadData();
        } else {
            errorEl.textContent = result.error || 'Invalid username or password';
            errorEl.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'An error occurred during login. Please try again.';
        errorEl.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    updateUIForAuth();
    // Clear forms
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

async function loadData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        updateUIForAuth();
        return;
    }
    
    try {
        const response = await fetch('/api/portfolio-data');
        
        currentData = await response.json();
        populateForm();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function populateForm() {
    // Hero
    document.getElementById('hero-greeting').value = currentData.hero.greeting;
    document.getElementById('hero-name').value = currentData.hero.name;
    document.getElementById('hero-desc').value = currentData.hero.description;
    document.getElementById('hero-resume').value = currentData.hero.resumeUrl || '';

    // About
    document.getElementById('about-p0').value = currentData.about.paragraphs[0];
    document.getElementById('about-p1').value = currentData.about.paragraphs[1];
    document.getElementById('about-p2').value = currentData.about.paragraphs[2];
    document.getElementById('about-location').value = currentData.about.location;
    document.getElementById('about-email').value = currentData.about.email;
    document.getElementById('about-phone').value = currentData.about.phone;
    document.getElementById('about-profile-img').value = currentData.about.profileImg || '';

    // Experience
    const expContainer = document.getElementById('experience-container');
    expContainer.innerHTML = '';
    currentData.experience.forEach((exp, index) => {
        expContainer.innerHTML += `
            <div class="array-item">
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" id="exp-date-${index}" class="form-control" value="${exp.date}">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="exp-title-${index}" class="form-control" value="${exp.title}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="exp-desc-${index}" class="form-control">${exp.description}</textarea>
                </div>
            </div>
        `;
    });

    // Projects
    const projContainer = document.getElementById('projects-container');
    projContainer.innerHTML = '';
    currentData.projects.forEach((proj, index) => {
        projContainer.innerHTML += `
            <div class="array-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <label style="margin:0;">Project ${index + 1}</label>
                    <button type="button" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; background: rgba(255,0,0,0.2); border-color: rgba(255,0,0,0.5);" onclick="removeProject(${index})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="proj-title-${index}" class="form-control" value="${proj.title}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="proj-desc-${index}" class="form-control">${proj.description}</textarea>
                </div>
            </div>
        `;
    });
}

async function saveData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        updateUIForAuth();
        return;
    }

    // Collect Hero
    currentData.hero.greeting = document.getElementById('hero-greeting').value;
    currentData.hero.name = document.getElementById('hero-name').value;
    currentData.hero.description = document.getElementById('hero-desc').value;
    currentData.hero.resumeUrl = document.getElementById('hero-resume').value;

    // Collect About
    currentData.about.paragraphs[0] = document.getElementById('about-p0').value;
    currentData.about.paragraphs[1] = document.getElementById('about-p1').value;
    currentData.about.paragraphs[2] = document.getElementById('about-p2').value;
    currentData.about.location = document.getElementById('about-location').value;
    currentData.about.email = document.getElementById('about-email').value;
    currentData.about.phone = document.getElementById('about-phone').value;
    currentData.about.profileImg = document.getElementById('about-profile-img').value;

    // Collect Experience
    currentData.experience.forEach((exp, index) => {
        exp.date = document.getElementById(`exp-date-${index}`).value;
        exp.title = document.getElementById(`exp-title-${index}`).value;
        exp.description = document.getElementById(`exp-desc-${index}`).value;
    });

    // Collect Projects
    currentData.projects.forEach((proj, index) => {
        proj.title = document.getElementById(`proj-title-${index}`).value;
        proj.description = document.getElementById(`proj-desc-${index}`).value;
    });

    try {
        const response = await fetch('/api/portfolio-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(currentData)
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        if (response.ok) {
            showToast();
        } else {
            console.error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Exposed project actions
window.addProject = function() {
    currentData.projects.push({
        id: `proj-${Date.now()}`,
        icon: 'folder-outline',
        title: 'New Project',
        description: 'Project description goes here.',
        tech: [],
        githubLink: '',
        demoLink: '',
        isFeature: false
    });
    populateForm();
};

window.removeProject = function(index) {
    if (confirm("Are you sure you want to remove this project?")) {
        currentData.projects.splice(index, 1);
        populateForm();
    }
};

// Expose functions globally for HTML events
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.saveData = saveData;

// Initial session check
updateUIForAuth();
if (localStorage.getItem('authToken')) {
    loadData();
}
