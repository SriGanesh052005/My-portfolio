document.addEventListener('DOMContentLoaded', async () => {

    /* --- Dynamic Data Fetching --- */
    async function loadPortfolioData() {
        let data = null;
        try {
            const response = await fetch('/api/portfolio-data');
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error('API server returned status: ' + response.status);
            }
        } catch (e) {
            console.warn("Could not fetch from backend API, trying static fallback...", e);
            try {
                const fallbackResponse = await fetch('./data.json');
                if (fallbackResponse.ok) {
                    data = await fallbackResponse.json();
                } else {
                    throw new Error('Static fallback data.json not found');
                }
            } catch (fallbackError) {
                console.error("Failed to load both backend API and static fallback data", fallbackError);
            }
        }

        if (data) {
            renderData(data);
        }
    }

    function renderData(data) {
        // Inject Hero
        if(document.querySelector('.greeting')) document.querySelector('.greeting').textContent = data.hero.greeting;
        if(document.querySelector('.glitch-text')) {
            document.querySelector('.glitch-text').textContent = data.hero.name;
            document.querySelector('.glitch-text').setAttribute('data-text', data.hero.name);
        }
        if(document.querySelector('.hero-desc')) document.querySelector('.hero-desc').textContent = data.hero.description;
        if(document.getElementById('resume-btn') && data.hero.resumeUrl) {
            document.getElementById('resume-btn').setAttribute('href', data.hero.resumeUrl);
        }

        // Inject About
        const aboutText = document.querySelector('.about-text');
        if (aboutText) {
            const paragraphs = aboutText.querySelectorAll('p');
            if(paragraphs[0] && data.about.paragraphs[0]) paragraphs[0].textContent = data.about.paragraphs[0];
            if(paragraphs[1] && data.about.paragraphs[1]) paragraphs[1].textContent = data.about.paragraphs[1];
            if(paragraphs[2] && data.about.paragraphs[2]) paragraphs[2].textContent = data.about.paragraphs[2];
            
            const infoSpans = aboutText.querySelectorAll('.info-item span');
            if(infoSpans[0]) infoSpans[0].textContent = data.about.location;
            if(infoSpans[1]) infoSpans[1].textContent = data.about.email;
            if(infoSpans[2]) infoSpans[2].textContent = data.about.phone;
        }

        // Inject Profile Image
        const aboutAvatar = document.getElementById('about-avatar');
        const aboutAvatarPlaceholder = document.getElementById('about-avatar-placeholder');
        if (data.about && data.about.profileImg && data.about.profileImg !== '') {
            if (aboutAvatar) {
                aboutAvatar.src = data.about.profileImg;
                aboutAvatar.style.display = 'block';
            }
            if (aboutAvatarPlaceholder) {
                aboutAvatarPlaceholder.style.display = 'none';
            }
        } else {
            if (aboutAvatar) aboutAvatar.style.display = 'none';
            if (aboutAvatarPlaceholder) aboutAvatarPlaceholder.style.display = 'flex';
        }

        // Inject Experience (Timeline)
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            const timelineItems = timeline.querySelectorAll('.timeline-item');
            data.experience.forEach((exp, index) => {
                if (timelineItems[index]) {
                    const dateEl = timelineItems[index].querySelector('.timeline-date');
                    const titleEl = timelineItems[index].querySelector('h3');
                    const descEl = timelineItems[index].querySelector('p');
                    
                    if(dateEl) dateEl.textContent = exp.date;
                    if(titleEl) titleEl.textContent = exp.title;
                    if(descEl) descEl.textContent = exp.description;
                }
            });
        }

        // Inject Projects (Hero Cards)
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = ''; // Clear existing projects
            data.projects.forEach((proj, index) => {
                const isFeature = proj.isFeature ? 'feature-card' : '';
                
                let techHTML = '';
                if (proj.tech && proj.tech.length > 0) {
                    techHTML = '<ul class="project-tech">';
                    proj.tech.forEach(t => {
                        techHTML += `<li>${t}</li>`;
                    });
                    techHTML += '</ul>';
                }

                const projectCard = document.createElement('div');
                projectCard.className = `project-card glass-card ${isFeature}`;
                projectCard.setAttribute('data-project-id', proj.id || `proj-${index}`);
                
                // Construct links
                let linksHTML = '';
                if ((proj.githubLink && proj.githubLink !== '') || (proj.demoLink && proj.demoLink !== '')) {
                    linksHTML = '<div class="project-links">';
                    if (proj.githubLink && proj.githubLink !== '') {
                        linksHTML += `<a href="${proj.githubLink}" class="icon-link"><ion-icon name="logo-github"></ion-icon></a>`;
                    }
                    if (proj.demoLink && proj.demoLink !== '') {
                        linksHTML += `<a href="${proj.demoLink}" class="icon-link"><ion-icon name="open"></ion-icon></a>`;
                    }
                    linksHTML += '</div>';
                }

                projectCard.innerHTML = `
                    <div class="project-content">
                        <div class="project-header">
                            <ion-icon name="${proj.icon || 'folder-outline'}" class="project-icon"></ion-icon>
                            ${linksHTML}
                        </div>
                        <h3 class="project-title">${proj.title}</h3>
                        <p class="project-desc">${proj.description}</p>
                        ${techHTML}
                    </div>
                `;
                projectsGrid.appendChild(projectCard);
            });
        }
    }

    // Call load function
    loadPortfolioData();

    /* --- Navbar Scroll Effect & Active Links --- */
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Navbar shrink/background effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link switching
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    /* --- Scroll Reveal Animations --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Trigger reveal immediately for elements already in viewport on load
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);


    /* --- GitHub Repository Fetching --- */
    const GITHUB_USERNAME = 'SriGanesh052005'; // Your GitHub Username
    const reposContainer = document.getElementById('github-repos');

    // Language colors for dots
    const langColors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'C++': '#f34b7d',
        'C': '#555555',
        'Verilog': '#b2b7f8'
    };

    async function fetchGitHubRepos() {
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const repos = await response.json();

            // Filter out forks if you only want your own code, or keep them. 
            const myRepos = repos.filter(repo => !repo.fork);

            reposContainer.innerHTML = ''; // Clear loading spinner

            if (myRepos.length === 0) {
                reposContainer.innerHTML = '<p class="text-secondary">No public repositories found.</p>';
                return;
            }

            myRepos.slice(0, 6).forEach(repo => {
                const langColor = langColors[repo.language] || '#a0a0b0';
                const langHTML = repo.language ? `
                    <span>
                        <span class="repo-lang-dot" style="background-color: ${langColor}"></span>
                        ${repo.language}
                    </span>
                ` : '';

                const repoEl = document.createElement('a');
                repoEl.href = repo.html_url;
                repoEl.target = '_blank';
                repoEl.className = 'glass-card repo-card';
                repoEl.innerHTML = `
                    <h4><ion-icon name="folder-outline"></ion-icon> ${repo.name}</h4>
                    <p>${repo.description || 'No description provided.'}</p>
                    <div class="repo-stats">
                        ${langHTML}
                        <span><ion-icon name="star-outline"></ion-icon> ${repo.stargazers_count}</span>
                        <span><ion-icon name="git-network-outline"></ion-icon> ${repo.forks_count}</span>
                    </div>
                `;
                reposContainer.appendChild(repoEl);
            });

        } catch (error) {
            console.error('Error fetching GitHub repos:', error);
            reposContainer.innerHTML = `
                <div class="glass-card text-center" style="grid-column: 1 / -1;">
                    <p class="text-secondary">Failed to load repositories. Please check connection.</p>
                </div>
            `;
        }
    }

    // Call fetch func
    fetchGitHubRepos();

    /* --- Project Modal Logic --- */
    const projectCards = document.querySelectorAll('.project-card');
    const modalOverlay = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');

    // Modal Elements to populate
    const modalTitle = document.getElementById('modal-title');
    const modalIcon = document.getElementById('modal-icon');
    const modalTags = document.getElementById('modal-tags');
    const modalDesc = document.getElementById('modal-desc');
    const modalExtended = document.getElementById('modal-extended');
    const modalLinks = document.getElementById('modal-links');

    const projectData = {
        'ai-email': {
            title: 'AI Email Assistant & Webpage Summarizer',
            icon: 'mail-unread',
            tags: ['AI/NLP', 'Vercel', 'Browser Extension'],
            desc: 'Developed an intelligent AI-powered browser extension that integrates seamlessly with Gmail and webpages to perform text summarization and smart categorization. Leverages natural language processing (NLP) models on a fast Vercel backend.',
            extended: `
                <h4>Key Features</h4>
                <ul>
                    <li>Real-time email summarization and key point extraction</li>
                    <li>Automated email categorization (Urgent, Newsletter, Personal, etc.)</li>
                    <li>One-click webpage summarization for long articles</li>
                    <li>Secure backend deployed on Vercel leveraging advanced NLP models</li>
                </ul>
            `,
            links: [
                { url: '#', icon: 'logo-github', text: 'View Source' },
                { url: '#', icon: 'open', text: 'Live Demo' }
            ]
        },
        'power-monitor': {
            title: '3-Phase Power Monitoring System',
            icon: 'flash',
            tags: ['ESP32', 'Python', 'IoT', 'Hardware Design'],
            desc: 'Engineered an advanced 3-phase power monitoring hardware device utilizing an ESP32/NodeMCU and arrays of precision sensors to track the R, Y, and B phases simultaneously. Transmits high-frequency telemetry data over Wi-Fi to a custom Python backend.',
            extended: `
                <h4>Key Details</h4>
                <ul>
                    <li>Simultaneous tracking of R, Y, and B phases for industrial applications</li>
                    <li>High-frequency telemetry data transmission over Wi-Fi</li>
                    <li>Custom Python backend for data aggregation, analysis, and visualization</li>
                    <li>Designed to handle high voltage/current environments safely</li>
                </ul>
            `,
            links: [
                { url: '#', icon: 'logo-github', text: 'View Source' }
            ]
        },
        'biogas': {
            title: 'Biogas Plant Commercialisation',
            icon: 'leaf',
            tags: ['Operations', 'Sustainability'],
            desc: 'Designed strategic protocols and an operational framework to commercialize an existing biogas plant. Focused on maximizing yield, optimizing raw materials input, and establishing a sustainable loop to promote effective organic waste reduction at scale.',
            extended: `
                <h4>Project Scope</h4>
                <ul>
                    <li>Maximizing yield through optimized raw material inputs and fermentation cycles</li>
                    <li>Establishing a sustainable loop for organic waste reduction at scale</li>
                    <li>Financial modeling and operational cost analysis for commercial viability</li>
                    <li>Implementation of automated monitoring systems for gas output</li>
                </ul>
            `,
            links: []
        },
        'arduino': {
            title: 'Arduino Voltage & Current Measurer',
            icon: 'speedometer',
            tags: ['Arduino', 'C++', 'Circuits'],
            desc: 'Built a compact, embedded hardware solution to accurately track the electrical current and voltage transferred through various appliances in real-time, utilizing Arduino microcontrollers and integrated circuitry components.',
            extended: `
                <h4>Technical Specifications</h4>
                <ul>
                    <li>Utilized non-invasive current sensors for safe measurement</li>
                    <li>Real-time calculations of RMS voltage, RMS current, and True Power</li>
                    <li>Interfaced an OLED/LCD display for immediate localized data readout</li>
                    <li>Custom integrated circuitry for signal conditioning and noise reduction</li>
                </ul>
            `,
            links: []
        }
    };

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent triggering modal if clicking on links within the card
            if (e.target.closest('a') || e.target.closest('button')) return;

            const projectId = card.getAttribute('data-project-id');
            const data = projectData[projectId];

            if (data) {
                modalTitle.textContent = data.title;
                modalIcon.setAttribute('name', data.icon);
                modalDesc.textContent = data.desc;

                // Populate tags
                modalTags.innerHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

                // Populate extended details
                modalExtended.innerHTML = data.extended;

                // Populate links
                if (data.links && data.links.length > 0) {
                    modalLinks.innerHTML = data.links.map(link => `
                        <a href="${link.url}" target="_blank" class="btn btn-primary" style="display:flex;gap:0.5rem;align-items:center;">
                            <ion-icon name="${link.icon}"></ion-icon> ${link.text}
                        </a>
                    `).join('');
                    modalLinks.style.display = 'flex';
                } else {
                    modalLinks.style.display = 'none';
                }

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);

    // Close on click outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
});
