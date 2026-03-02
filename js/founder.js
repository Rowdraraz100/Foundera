// --- DATA ---
        let currentTab = 'overview';
        let currentDataId = null; 
        
        // --- PROFILE DATA (Ekhon eta kaj korbe ebong save hobe) ---
        let profileData = {
            name: localStorage.getItem('founderName') || 'Demo Founder',
            email: localStorage.getItem('founderEmail') || 'founder@gmail.com',
            linkedin: localStorage.getItem('founderLinkedin') || 'https://linkedin.com/in/demofounder',
            github: localStorage.getItem('founderGithub') || 'https://github.com/demofounder',
            bio: localStorage.getItem('founderBio') || 'Passionate about building scalable tech solutions for emerging markets. Background in software engineering and product management.',
            skills: localStorage.getItem('founderSkills') || 'Product Strategy, System Architecture, UI/UX',
            availability: localStorage.getItem('founderAvailability') || 'No, working on my own startup'
        };
        
        // --- LOGOUT FUNCTION ---
        function handleLogout() {
            // Clear all founder data from localStorage
            localStorage.removeItem('founderName');
            localStorage.removeItem('founderEmail');
            localStorage.removeItem('founderLinkedin');
            localStorage.removeItem('founderGithub');
            localStorage.removeItem('founderBio');
            localStorage.removeItem('founderSkills');
            localStorage.removeItem('founderAvailability');
            localStorage.removeItem('founderPicture');
            localStorage.removeItem('founderIdeas');
            
            // Redirect to main page
            window.location.href = 'index.html';
        }
        
        // --- SAVE PROFILE TO LOCALSTORAGE ---
        function saveProfileToStorage() {
            localStorage.setItem('founderName', profileData.name);
            localStorage.setItem('founderEmail', profileData.email);
            localStorage.setItem('founderLinkedin', profileData.linkedin);
            localStorage.setItem('founderGithub', profileData.github);
            localStorage.setItem('founderBio', profileData.bio);
            localStorage.setItem('founderSkills', profileData.skills);
            localStorage.setItem('founderAvailability', profileData.availability);
        }
        
        // --- LOAD IDEAS FROM LOCALSTORAGE ---
        function loadIdeasFromStorage() {
            const savedIdeas = localStorage.getItem('founderIdeas');
            if (savedIdeas) {
                ideas = JSON.parse(savedIdeas);
            }
        }
        
        // --- SAVE IDEAS TO LOCALSTORAGE ---
        function saveIdeasToStorage() {
            localStorage.setItem('founderIdeas', JSON.stringify(ideas));
        }
        
        // Ideas array - will be loaded from localStorage
        let ideas = [];

        const talents = [
            { id: 1, name: 'Anik Hasan', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB', 'Python'], experience: '3 Years', rating: 4.8, projects: 15, available: true, avatar: 'A' },
            { id: 2, name: 'Nusrat Jahan', role: 'UI/UX Designer', skills: ['Figma', 'Adobe XD', 'UI/UX', 'Research'], experience: '2 Years', rating: 4.9, projects: 22, available: true, avatar: 'N' },
            { id: 3, name: 'Rafiq Ahmed', role: 'Mobile Developer', skills: ['Flutter', 'React Native', 'Firebase', 'Mobile App'], experience: '4 Years', rating: 4.7, projects: 18, available: false, avatar: 'R' },
            { id: 4, name: 'Tasnim Islam', role: 'AI/ML Engineer', skills: ['Python', 'TensorFlow', 'AI/ML', 'Data Science'], experience: '3 Years', rating: 4.9, projects: 10, available: true, avatar: 'T' },
            { id: 5, name: 'Sohel Rana', role: 'Backend Developer', skills: ['Node.js', 'Cybersecurity', 'AWS', 'Java'], experience: '5 Years', rating: 4.6, projects: 25, available: true, avatar: 'S' }
        ];

        const investors = [
            { id: 1, name: 'Venture BD', focus: ['AgriTech', 'EdTech'], ticketSize: '$10k - $100k', totalInvested: '$2.5M', portfolio: 15, interested: true },
            { id: 2, name: 'Global Seed Fund', focus: ['FinTech', 'HealthTech', 'AI/ML'], ticketSize: '$50k - $500k', totalInvested: '$10M', portfolio: 30, interested: false },
            { id: 3, name: 'Bangladesh Angels', focus: ['SaaS', 'E-commerce', 'EdTech'], ticketSize: '$25k - $200k', totalInvested: '$5M', portfolio: 20, interested: true },
            { id: 4, name: 'Tech Capital BD', focus: ['AI/ML', 'FinTech', 'AgriTech'], ticketSize: '$100k - $1M', totalInvested: '$15M', portfolio: 12, interested: false }
        ];

        // --- FUNCTIONS ---
        function setTab(tab, dataId = null) {
            // Check if trying to post when an idea already exists
            if (tab === 'post' && ideas.length >= 1) {
                alert("Apni already ekta idea share korechen! Notun idea share korte chaile aager idea ti delete korun.");
                currentTab = 'ideaDetail';
                currentDataId = ideas[0].id;
            } else {
                currentTab = tab;
                currentDataId = dataId;
            }
            updateSidebarActive();
            renderContent();
        }

        function updateSidebarActive() {
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
            });
            // highlight the parent tab if we are in a sub-view
            let activeTabId = currentTab;
            if(currentTab === 'ideaDetail' || currentTab === 'post') activeTabId = 'ideas';
            const navLink = document.getElementById('nav-' + activeTabId);
            if (navLink) navLink.classList.add('active');
        }

        function saveProfile(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            // Notun data gulo update kora hocche
            profileData.name = fd.get('name');
            profileData.email = fd.get('email');
            profileData.linkedin = fd.get('linkedin');
            profileData.github = fd.get('github');
            profileData.bio = fd.get('bio');
            profileData.skills = fd.get('skills');
            profileData.availability = fd.get('availability');

            // Header a namer prothom okkhor (Letter) update korbe
            document.getElementById('user-initial').textContent = profileData.name.charAt(0).toUpperCase();

            // Save to localStorage
            saveProfileToStorage();

            alert('Profile successfully updated! Ekhon theke user ra apnar notun contact details dekhte parbe.');
            
            // Re-render kore notun data gulo dekhabe
            renderContent();
        }

        function postNewIdea(event) {
            event.preventDefault();
            
            // Final check to prevent adding multiple ideas
            if (ideas.length >= 1) {
                alert("Ek profile theke shudhu ektai idea share kora jabe.");
                return;
            }

            const fd = new FormData(event.target);
            const newIdea = {
                id: Date.now(),
                title: fd.get('title'),
                description: fd.get('description'),
                problem: fd.get('problem'),
                vision: fd.get('vision'),
                businessPlan: fd.get('businessPlan'),
                skillsNeeded: fd.get('skills').split(',').map(s => s.trim()),
                industry: fd.get('industry'),
                fundingNeeded: fd.get('funding') || 'Not Disclosed',
                status: 'Active',
                views: 0,
                applications: 0
            };
            ideas.unshift(newIdea);
            
            // Save to localStorage
            saveIdeasToStorage();
            
            // Redirect directly to the Overview/Dashboard page for this new idea
            setTab('overview');
        }

        function deleteIdea(id) {
            ideas = ideas.filter(i => i.id !== id);
            saveIdeasToStorage();
            currentDataId = null;
            setTab('post'); // Redirect to post idea if they delete it
        }

        function toggleIdeaStatus(id) {
            const idea = ideas.find(i => i.id === id);
            if(idea) {
                idea.status = idea.status === 'Active' ? 'Draft' : 'Active';
                saveIdeasToStorage();
                renderContent();
            }
        }

        // --- RENDER FUNCTIONS ---
        function updateDynamicUI() {
            const sidebarBtn = document.getElementById('sidebar-share-btn');
            const headerBtn = document.getElementById('header-share-btn');
            
            // Dynamically switch button behavior if user has an idea
            if (ideas.length >= 1) {
                if(sidebarBtn) {
                    sidebarBtn.innerHTML = `<i data-lucide="eye" class="w-5 h-5 fill-current"></i><span class="text-[15px] tracking-wide">View Your Idea</span>`;
                    sidebarBtn.onclick = () => setTab('ideaDetail', ideas[0].id);
                }
                if(headerBtn) {
                    headerBtn.innerHTML = `<i data-lucide="eye" class="w-4 h-4 fill-current"></i> View Idea`;
                    headerBtn.onclick = () => setTab('ideaDetail', ideas[0].id);
                }
            } else {
                if(sidebarBtn) {
                    sidebarBtn.innerHTML = `<i data-lucide="rocket" class="w-5 h-5 fill-current"></i><span class="text-[15px] tracking-wide">Share Your Idea</span>`;
                    sidebarBtn.onclick = () => setTab('post');
                }
                if(headerBtn) {
                    headerBtn.innerHTML = `<i data-lucide="zap" class="w-4 h-4 fill-current"></i> Share Idea`;
                    headerBtn.onclick = () => setTab('post');
                }
            }
        }

        function renderContent() {
            const content = document.getElementById('content');
            const pageTitle = document.getElementById('page-title');
            const pageSubtitle = document.getElementById('page-subtitle');
            
            updateDynamicUI();
            
            const titles = {
                overview: { t: 'Overview', s: 'Welcome to your Foundera Dashboard.' },
                ideas: { t: 'My Idea', s: 'Manage and track your startup concept.' },
                ideaDetail: { t: 'Idea Details & AI Match', s: 'Review your idea and AI-suggested connections.' },
                talent: { t: 'Find Talent', s: 'Discover skilled professionals for your startup.' },
                investors: { t: 'Investors', s: 'Connect with investors matching your industry.' },
                post: { t: 'Share Your Unique Idea', s: 'Provide details to get best AI matches.' },
                roadmap: { t: 'AI Roadmap Generator', s: 'Generate a step-by-step execution plan for your idea.' },
                profile: { t: 'My Profile', s: 'Manage your contact details and skills.' }
            };
            
            if(titles[currentTab]) {
                pageTitle.textContent = titles[currentTab].t;
                pageSubtitle.textContent = titles[currentTab].s;
            }

            // Fade animation trigger
            content.style.opacity = '0';
            setTimeout(() => {
                switch(currentTab) {
                    case 'overview': content.innerHTML = renderOverview(); break;
                    case 'ideas': content.innerHTML = renderIdeas(); break;
                    case 'ideaDetail': content.innerHTML = renderIdeaDetail(); break;
                    case 'talent': content.innerHTML = renderTalent(); break;
                    case 'investors': content.innerHTML = renderInvestors(); break;
                    case 'post': content.innerHTML = renderPostIdea(); break;
                    case 'roadmap': content.innerHTML = renderRoadmap(); break;
                    case 'profile': content.innerHTML = renderProfile(); break;
                }
                lucide.createIcons();
                content.style.opacity = '1';
                content.style.transition = 'opacity 0.3s ease';
            }, 50);
        }

        // --- SIMPLIFIED OVERVIEW ---
        function renderOverview() {
            const hasIdea = ideas.length >= 1;
            const mainIdea = hasIdea ? ideas[0] : null;

            return `
                <div class="space-y-6">
                    <!-- Welcome Banner -->
                    <div class="bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-2xl p-8 border border-blue-500/30 shadow-lg relative overflow-hidden">
                        <div class="relative z-10">
                            <h2 class="text-3xl font-bold mb-2 text-white">
                                ${hasIdea ? 'Idea Status: ' + mainIdea.title : 'Welcome to Foundera Dashboard'}
                            </h2>
                            <p class="text-blue-200 mb-6 max-w-2xl text-lg">
                                ${hasIdea ? 'Your idea is live! Review the AI matched developers and investors to take the next step.' : 'Share your startup idea and let our AI find the best co-founders, developers, and investors for you.'}
                            </p>
                            ${hasIdea 
                                ? `<button onclick="setTab('ideaDetail', ${mainIdea.id})" class="btn-highlight text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                    <i data-lucide="eye" class="w-5 h-5 mr-2 fill-current"></i> View AI Matches
                                   </button>`
                                : `<button onclick="setTab('post')" class="btn-highlight text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                    <i data-lucide="rocket" class="w-5 h-5 mr-2 fill-current"></i> Share Your Idea Now
                                   </button>`
                            }
                        </div>
                        <i data-lucide="${hasIdea ? 'check-circle' : 'lightbulb'}" class="absolute -right-4 -top-4 w-48 h-48 text-white opacity-5"></i>
                    </div>

                    ${hasIdea ? `
                    <!-- Simple Stats Grid (Only shows if idea exists) -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-blue-500/50 transition-colors">
                            <i data-lucide="eye" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${mainIdea.views}</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Idea Views</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-green-500/50 transition-colors">
                            <i data-lucide="users" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${mainIdea.applications}</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Interested Talent</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-colors">
                            <i data-lucide="briefcase" class="w-8 h-8 text-purple-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">3</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Investor Matches</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-yellow-500/50 transition-colors">
                            <i data-lucide="check-circle" class="w-8 h-8 text-yellow-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">Active</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Project Status</span>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Quick Actions -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 shadow-lg">
                        <h3 class="text-xl font-bold mb-6 text-white flex items-center">
                            <i data-lucide="zap" class="w-5 h-5 mr-2 text-yellow-400"></i> Explore
                        </h3>
                        <div class="grid md:grid-cols-3 gap-6">
                            <button onclick="setTab('roadmap')" class="p-5 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-blue-500 transition-all flex items-center gap-4 text-left group">
                                <div class="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-400"><i data-lucide="map" class="w-6 h-6"></i></div>
                                <div>
                                    <h4 class="font-bold text-white text-md">AI Roadmap</h4>
                                    <p class="text-sm text-gray-400 mt-1">Generate a step-by-step plan</p>
                                </div>
                            </button>
                            
                            <button onclick="setTab('talent')" class="p-5 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-green-500 transition-all flex items-center gap-4 text-left group">
                                <div class="bg-green-500/20 p-3 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors text-green-400"><i data-lucide="users" class="w-6 h-6"></i></div>
                                <div>
                                    <h4 class="font-bold text-white text-md">Find Talent</h4>
                                    <p class="text-sm text-gray-400 mt-1">Browse skilled developers</p>
                                </div>
                            </button>
                            
                            <button onclick="setTab('investors')" class="p-5 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500 transition-all flex items-center gap-4 text-left group">
                                <div class="bg-purple-500/20 p-3 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-400"><i data-lucide="trending-up" class="w-6 h-6"></i></div>
                                <div>
                                    <h4 class="font-bold text-white text-md">Investors</h4>
                                    <p class="text-sm text-gray-400 mt-1">Look for potential funding</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderIdeas() {
            if(ideas.length === 0) {
                return `
                <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                    <i data-lucide="inbox" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                    <h2 class="text-2xl font-bold text-white mb-2">No Idea Shared Yet</h2>
                    <p class="text-gray-400 mb-6">Share your idea to start finding matches and building your team.</p>
                    <button onclick="setTab('post')" class="btn-highlight text-white px-6 py-3 rounded-xl font-bold mx-auto flex items-center">
                        <i data-lucide="rocket" class="w-5 h-5 mr-2"></i> Share Idea Now
                    </button>
                </div>`;
            }

            return `
                <div class="space-y-6">
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${ideas.map(idea => `
                            <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden card-hover flex flex-col">
                                <div class="p-6 flex-1 cursor-pointer" onclick="setTab('ideaDetail', ${idea.id})">
                                    <div class="flex items-center justify-between mb-4">
                                        <span class="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-medium border border-blue-500/30">${idea.industry}</span>
                                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${idea.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}">${idea.status}</span>
                                    </div>
                                    <h3 class="text-xl font-bold mb-2 text-white hover:text-blue-400 transition-colors">${idea.title}</h3>
                                    <p class="text-gray-400 text-sm mb-4 line-clamp-2">${idea.description}</p>
                                    
                                    <div class="flex items-center text-sm text-gray-400 mb-4 bg-gray-900/50 p-3 rounded-xl border border-purple-500/30">
                                        <i data-lucide="sparkles" class="w-4 h-4 mr-2 text-purple-400"></i>
                                        <span class="text-purple-300 font-medium">AI Matches Ready</span>
                                    </div>
                                </div>
                                <div class="border-t border-gray-700/50 px-6 py-4 bg-gray-900/30 flex justify-between items-center">
                                    <button onclick="setTab('ideaDetail', ${idea.id})" class="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center transition-colors">
                                        View Matches <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                                    </button>
                                    <div class="flex gap-3">
                                        <button onclick="toggleIdeaStatus(${idea.id})" class="text-gray-400 hover:text-white transition-colors" title="Toggle Status"><i data-lucide="${idea.status === 'Active' ? 'pause' : 'play'}" class="w-4 h-4"></i></button>
                                        <button onclick="deleteIdea(${idea.id})" class="text-gray-400 hover:text-red-400 transition-colors" title="Delete Idea"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderIdeaDetail() {
            const idea = ideas.find(i => i.id === currentDataId);
            if(!idea) return `<p>Idea not found.</p>`;

            // Simple Backend-ready AI Matching Logic
            const matchedTalents = talents.map(t => {
                const matchCount = t.skills.filter(s => idea.skillsNeeded.includes(s)).length;
                return { ...t, matchScore: Math.round((matchCount / idea.skillsNeeded.length) * 100) || 0 };
            }).filter(t => t.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore);

            const matchedInvestors = investors.filter(i => i.focus.includes(idea.industry));

            return `
                <div class="space-y-6 animate-fade-in">
                    <!-- Idea Full Details -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <span class="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-medium mb-3 inline-block border border-blue-500/30">${idea.industry}</span>
                                <h2 class="text-3xl font-bold text-white mb-2">${idea.title}</h2>
                                <p class="text-gray-400 text-lg">${idea.description}</p>
                            </div>
                            <span class="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${idea.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}">${idea.status}</span>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-700/50">
                            <div>
                                <h4 class="text-gray-300 font-bold mb-2 flex items-center"><i data-lucide="alert-circle" class="w-4 h-4 mr-2 text-red-400"></i> Problem Statement</h4>
                                <p class="text-gray-400 text-sm leading-relaxed">${idea.problem || 'No problem statement provided.'}</p>
                            </div>
                            <div>
                                <h4 class="text-gray-300 font-bold mb-2 flex items-center"><i data-lucide="compass" class="w-4 h-4 mr-2 text-blue-400"></i> Vision & Mission</h4>
                                <p class="text-gray-400 text-sm leading-relaxed">${idea.vision || 'No vision provided.'}</p>
                            </div>
                            <div>
                                <h4 class="text-gray-300 font-bold mb-2 flex items-center"><i data-lucide="book-open" class="w-4 h-4 mr-2 text-purple-400"></i> Business Plan</h4>
                                <p class="text-gray-400 text-sm leading-relaxed">${idea.businessPlan || 'No business plan detailed yet.'}</p>
                            </div>
                            <div>
                                <h4 class="text-gray-300 font-bold mb-2 flex items-center"><i data-lucide="target" class="w-4 h-4 mr-2 text-green-400"></i> Requirements</h4>
                                <div class="mb-4">
                                    <span class="text-xs text-gray-500 block mb-1">Funding Needed</span>
                                    <span class="text-xl font-bold text-green-400">${idea.fundingNeeded}</span>
                                </div>
                                <div>
                                    <span class="text-xs text-gray-500 block mb-2">Required Skills</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${idea.skillsNeeded.map(s => `<span class="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md border border-gray-600">${s}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Matches Section -->
                    <div class="mt-8">
                        <h3 class="text-xl font-bold mb-6 flex items-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            <i data-lucide="sparkles" class="w-6 h-6 mr-2 text-purple-400"></i> AI Suggested Matches
                        </h3>
                        
                        <div class="grid lg:grid-cols-2 gap-8">
                            <!-- Matched Talent -->
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                                <h4 class="font-bold text-lg mb-4 flex justify-between items-center text-white">
                                    Best Talent For This <span class="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">${matchedTalents.length} found</span>
                                </h4>
                                <div class="space-y-4">
                                    ${matchedTalents.length > 0 ? matchedTalents.map(t => `
                                        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600">${t.avatar}</div>
                                                <div>
                                                    <h5 class="font-bold text-sm text-white">${t.name}</h5>
                                                    <p class="text-xs text-gray-400">${t.role}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <span class="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">${t.matchScore}% Match</span>
                                                <button class="block w-full text-center text-xs text-blue-400 hover:text-blue-300 font-bold mt-2">View Profile</button>
                                            </div>
                                        </div>
                                    `).join('') : '<p class="text-sm text-gray-500 italic">No matching talent found yet.</p>'}
                                </div>
                            </div>

                            <!-- Matched Investors -->
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                                <h4 class="font-bold text-lg mb-4 flex justify-between items-center text-white">
                                    Interested Investors <span class="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">${matchedInvestors.length} found</span>
                                </h4>
                                <div class="space-y-4">
                                    ${matchedInvestors.length > 0 ? matchedInvestors.map(inv => `
                                        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex items-center justify-between hover:border-purple-500/50 transition-colors">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mr-3"><i data-lucide="briefcase" class="w-5 h-5"></i></div>
                                                <div>
                                                    <h5 class="font-bold text-sm text-white">${inv.name}</h5>
                                                    <p class="text-xs text-gray-400">Invests in: <span class="text-gray-300">${inv.focus.join(', ')}</span></p>
                                                </div>
                                            </div>
                                            <button class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition-colors">Pitch</button>
                                        </div>
                                    `).join('') : '<p class="text-sm text-gray-500 italic">No matching investors found yet.</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderPostIdea() {
            return `
                <div class="max-w-3xl mx-auto">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <div class="mb-8">
                            <h2 class="text-3xl font-bold mb-2 text-white">Share Your Unique Idea</h2>
                            <p class="text-gray-400">Fill out these details. Our AI will automatically analyze your requirements and suggest the best Co-founders, Developers, and Investors.</p>
                        </div>
                        
                        <form onsubmit="postNewIdea(event)" class="space-y-6 relative z-10">
                            <!-- Basic Info -->
                            <div class="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Startup Title *</label>
                                    <input name="title" required placeholder="e.g., AI-Powered Healthcare App" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Startup Description *</label>
                                    <textarea name="description" required rows="2" placeholder="Briefly describe your idea and the core problem it solves..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Problem Statement *</label>
                                    <textarea name="problem" required rows="2" placeholder="What specific problem is your startup trying to solve?..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Vision and Mission *</label>
                                    <textarea name="vision" required rows="2" placeholder="What is the ultimate goal and vision of your startup?..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white"></textarea>
                                </div>
                            </div>

                            <!-- Detailed Plan -->
                            <div class="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Business Plan & Revenue Model</label>
                                    <textarea name="businessPlan" rows="3" placeholder="How will it make money? Who is the target audience? (Helps AI find better investors)" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white"></textarea>
                                </div>
                                <div class="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Industry Type *</label>
                                        <select name="industry" required class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-200">
                                            <option value="">Select industry</option>
                                            <option>AgriTech</option>
                                            <option>FinTech</option>
                                            <option>EdTech</option>
                                            <option>HealthTech</option>
                                            <option>E-commerce</option>
                                            <option>SaaS</option>
                                            <option>AI/ML</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Funding Requirement</label>
                                        <input name="funding" placeholder="e.g., $50,000" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                    </div>
                                </div>
                            </div>

                            <!-- AI Matching Requirements -->
                            <div class="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30 space-y-5">
                                <h4 class="font-bold text-blue-300 flex items-center mb-2"><i data-lucide="cpu" class="w-5 h-5 mr-2"></i> AI Matchmaking Data</h4>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Skills Needed (For finding Talent) *</label>
                                    <input name="skills" required placeholder="e.g., React, Node.js, Marketing (comma separated)" class="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                </div>
                            </div>

                            <div class="flex gap-4 pt-2">
                                <button type="submit" class="flex-1 founder-btn text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 flex justify-center items-center transition-transform hover:scale-[1.02]">
                                    <i data-lucide="sparkles" class="w-5 h-5 mr-2"></i> Post Idea & Generate Matches
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        }

        function renderRoadmap() {
            return `
                <div class="max-w-4xl mx-auto">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8">
                        <div class="text-center mb-8">
                            <div class="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="map" class="w-8 h-8 text-purple-400"></i>
                            </div>
                            <h2 class="text-3xl font-bold mb-2 text-white">AI Roadmap Generator</h2>
                            <p class="text-gray-400">Select an idea to generate a strategic, step-by-step execution plan.</p>
                        </div>

                        <div class="flex gap-4 mb-10 max-w-2xl mx-auto">
                            <select id="roadmap-idea-select" class="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-200">
                                <option value="">-- Select an Idea --</option>
                                ${ideas.map(i => `<option value="${i.id}">${i.title}</option>`).join('')}
                            </select>
                            <button onclick="generateRoadmap()" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center shadow-lg shadow-purple-500/20">
                                <i data-lucide="zap" class="w-4 h-4 mr-2"></i> Generate
                            </button>
                        </div>

                        <div id="roadmap-result" class="hidden">
                            <!-- Loader -->
                            <div id="roadmap-loader" class="flex flex-col items-center justify-center py-12">
                                <div class="w-12 h-12 rounded-full border-4 border-gray-700 loader mb-4"></div>
                                <p class="text-purple-400 font-medium animate-pulse">AI is analyzing your business plan...</p>
                            </div>
                            
                            <!-- Roadmap Timeline (Hidden initially) -->
                            <div id="roadmap-timeline" class="hidden space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-600 before:to-transparent pt-4">
                                <!-- Phases will be injected here via JS -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function generateRoadmap() {
            const select = document.getElementById('roadmap-idea-select');
            if(!select.value) {
                alert("Please select an idea first. If you haven't shared one, go to 'Share Idea'.");
                return;
            }
            
            const resultBox = document.getElementById('roadmap-result');
            const loader = document.getElementById('roadmap-loader');
            const timeline = document.getElementById('roadmap-timeline');
            
            resultBox.classList.remove('hidden');
            loader.classList.remove('hidden');
            timeline.classList.add('hidden');

            // Simulate API Request delay
            setTimeout(() => {
                loader.classList.add('hidden');
                timeline.classList.remove('hidden');
                
                // Hardcoded realistic roadmap template 
                timeline.innerHTML = `
                    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <i data-lucide="search" class="w-4 h-4"></i>
                        </div>
                        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-5 rounded-2xl border border-gray-700/50 shadow-lg hover:border-purple-500/50 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-bold text-lg text-white">Phase 1: Validation</h4>
                                <span class="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Month 1</span>
                            </div>
                            <p class="text-sm text-gray-400">Conduct user interviews with target audience. Finalize core features required for MVP. Start scouting technical co-founders.</p>
                        </div>
                    </div>
                    
                    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <i data-lucide="code" class="w-4 h-4"></i>
                        </div>
                        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-5 rounded-2xl border border-gray-700/50 shadow-lg hover:border-blue-500/50 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-bold text-lg text-white">Phase 2: MVP Build</h4>
                                <span class="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Month 2-3</span>
                            </div>
                            <p class="text-sm text-gray-400">Develop prototype. Integrate basic backend and database. Begin early alpha testing with 50-100 closed beta users.</p>
                        </div>
                    </div>

                    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <i data-lucide="rocket" class="w-4 h-4"></i>
                        </div>
                        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-5 rounded-2xl border border-gray-700/50 shadow-lg hover:border-green-500/50 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-bold text-lg text-white">Phase 3: Launch & Iterate</h4>
                                <span class="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">Month 4-5</span>
                            </div>
                            <p class="text-sm text-gray-400">Public launch. Start marketing campaigns on social media. Collect user feedback and fix initial bugs. Track core KPIs.</p>
                        </div>
                    </div>

                    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-yellow-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <i data-lucide="trending-up" class="w-4 h-4"></i>
                        </div>
                        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-5 rounded-2xl border border-gray-700/50 shadow-lg hover:border-yellow-500/50 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-bold text-lg text-white">Phase 4: Seed Funding</h4>
                                <span class="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">Month 6+</span>
                            </div>
                            <p class="text-sm text-gray-400">Prepare pitch deck with traction metrics. Approach suggested AI-matched investors on Foundera. Secure seed capital to scale team.</p>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            }, 1500);
        }

        function renderProfile() {
            return `
                <div class="max-w-4xl space-y-6 animate-fade-in">
                    <!-- Profile Header -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="relative group">
                                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-gray-800 text-white">${profileData.name.charAt(0).toUpperCase()}</div>
                                <button class="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition shadow-lg border border-gray-600">
                                    <i data-lucide="camera" class="w-4 h-4 text-white"></i>
                                </button>
                            </div>
                            <div class="flex-1 text-center md:text-left">
                                <h2 class="text-3xl font-bold mb-1 text-white">${profileData.name}</h2>
                                <p class="text-blue-400 font-medium mb-3">Founder / Visionary</p>
                                <div class="flex flex-wrap justify-center md:justify-start gap-2">
                                    <span class="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center border border-gray-600"><i data-lucide="map-pin" class="w-3 h-3 mr-1"></i> Dhaka, BD</span>
                                </div>
                            </div>
                            <div class="flex gap-3 flex-wrap justify-center">
                                <a href="${profileData.github}" target="_blank" class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white border border-gray-600"><i data-lucide="github" class="w-4 h-4 mr-2"></i> GitHub</a>
                                <a href="${profileData.linkedin}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>
                                <a href="mailto:${profileData.email}" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white shadow-lg shadow-red-500/20"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Gmail</a>
                            </div>
                        </div>
                    </div>

                    <!-- Personal Information Form -->
                    <form onsubmit="saveProfile(event)" class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="mb-6 border-b border-gray-700 pb-4">
                            <h3 class="font-bold text-xl text-white">Update Profile</h3>
                            <p class="text-sm text-gray-400 mt-1">Provide accurate details so talents and investors can easily connect with you.</p>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input type="text" name="name" value="${profileData.name}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                            </div>
                            
                            <div class="md:col-span-2 mt-4">
                                <h4 class="text-white font-bold flex items-center"><i data-lucide="link" class="w-5 h-5 mr-2 text-blue-400"></i> Contact Links (Important)</h4>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-red-400 mb-2">Email Address (Main)</label>
                                <input type="email" name="email" value="${profileData.email}" required class="w-full px-4 py-3 bg-gray-900 border border-red-500/50 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-blue-400 mb-2">LinkedIn Profile Link</label>
                                <input type="url" name="linkedin" placeholder="https://linkedin.com/in/username" value="${profileData.linkedin}" class="w-full px-4 py-3 bg-gray-900 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">GitHub Profile Link</label>
                                <input type="url" name="github" placeholder="https://github.com/username" value="${profileData.github}" class="w-full px-4 py-3 bg-gray-900 border border-gray-500/50 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none text-white">
                            </div>

                            <div class="md:col-span-2 mt-4">
                                <h4 class="text-white font-bold flex items-center"><i data-lucide="info" class="w-5 h-5 mr-2 text-green-400"></i> Professional Details</h4>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-400 mb-2">About You (Bio)</label>
                                <textarea name="bio" rows="3" placeholder="Write a short bio about your experience and vision..." class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">${profileData.bio}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Skills & Expertise</label>
                                <input type="text" name="skills" value="${profileData.skills}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Available for Co-founding?</label>
                                <select name="availability" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                                    <option value="Yes, actively looking" ${profileData.availability === 'Yes, actively looking' ? 'selected' : ''}>Yes, actively looking</option>
                                    <option value="No, working on my own startup" ${profileData.availability === 'No, working on my own startup' ? 'selected' : ''}>No, working on my own startup</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                            <button type="submit" class="founder-btn text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center hover:scale-105 transition-transform">
                                <i data-lucide="save" class="w-5 h-5 mr-2"></i> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }

        function renderTalent() {
            return `
                <div class="space-y-6">
                    <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-wrap gap-4 shadow-sm">
                        <div class="flex-1 min-w-[200px] relative">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                            <input type="text" placeholder="Search by name or React, Python, etc..." class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-white">
                        </div>
                        <select class="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                            <option>All Roles</option>
                            <option>Developer</option>
                            <option>Designer</option>
                        </select>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${talents.map(talent => `
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6 card-hover shadow-lg">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600 text-white">${talent.avatar}</div>
                                        <div>
                                            <h3 class="font-bold text-white">${talent.name}</h3>
                                            <p class="text-sm text-gray-400">${talent.role}</p>
                                        </div>
                                    </div>
                                    <span class="px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${talent.available ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}">${talent.available ? 'Available' : 'Busy'}</span>
                                </div>
                                <div class="flex flex-wrap gap-1 mb-4">
                                    ${talent.skills.map(skill => `<span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded">${skill}</span>`).join('')}
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-400 mb-6 bg-gray-900/50 p-3 rounded-xl">
                                    <span class="flex items-center"><i data-lucide="briefcase" class="w-4 h-4 mr-1"></i> ${talent.experience}</span>
                                    <span class="flex items-center text-yellow-400"><i data-lucide="star" class="w-4 h-4 mr-1 fill-current"></i> ${talent.rating}</span>
                                </div>
                                <button class="w-full border border-blue-500/50 hover:bg-blue-500/10 text-blue-400 py-2.5 rounded-xl text-sm font-bold transition-colors">View Profile & Get Contact Info</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderInvestors() {
            return `
                <div class="space-y-6">
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${investors.map(inv => `
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6 card-hover shadow-lg relative overflow-hidden">
                                ${inv.interested ? '<div class="absolute -right-8 top-4 bg-green-500 text-white text-[10px] font-bold py-1 px-10 rotate-45 shadow-lg">HOT</div>' : ''}
                                <div class="flex items-center mb-4">
                                    <div class="bg-purple-500/20 p-3 rounded-xl mr-4 border border-purple-500/30">
                                        <i data-lucide="building-2" class="w-6 h-6 text-purple-400"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-lg text-white">${inv.name}</h3>
                                        <p class="text-xs text-gray-400">Ticket: ${inv.ticketSize}</p>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${inv.focus.map(f => `<span class="bg-gray-900 border border-gray-700 text-purple-300 text-xs px-2 py-1 rounded-md">${f}</span>`).join('')}
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-400 mb-6 bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                                    <div class="text-center"><span class="block text-white font-bold">${inv.totalInvested}</span><span class="text-[10px] uppercase">Invested</span></div>
                                    <div class="w-px h-8 bg-gray-700"></div>
                                    <div class="text-center"><span class="block text-white font-bold">${inv.portfolio}</span><span class="text-[10px] uppercase">Portfolio</span></div>
                                </div>
                                <button class="w-full founder-btn text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">Send Pitch & Request Call</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // --- MOBILE SIDEBAR TOGGLE ---
        function toggleMobileSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('hidden');
        }

        // --- INIT ---
        // Load ideas from localStorage first
        loadIdeasFromStorage();
        
        // Set user initial from profile name
        document.getElementById('user-initial').textContent = profileData.name.charAt(0).toUpperCase();
        
        // Check if user is logged in (has name in localStorage), if not redirect to index
        if (!localStorage.getItem('founderName')) {
            // Allow demo access but show default name
        }
        
        // Ekhon login/page load korar sathe sathe 'overview' tab e jabe
        setTab('overview');
        
        lucide.createIcons();

        window.addEventListener('load', function() {
            setTimeout(function() {
                var p = document.getElementById('foundera-preloader');
                if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
            }, 2400);
        });
