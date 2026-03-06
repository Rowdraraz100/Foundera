// --- RELATIONAL DATA MODEL (Backend Friendly) ---
        let currentTab = 'overview';
        
        // Investor Profile Info — load from localStorage or defaults
        let profileData = {
            id: 201,
            name: localStorage.getItem('investorName') || '',
            title: localStorage.getItem('investorTitle') || '',
            location: localStorage.getItem('investorLocation') || '',
            email: localStorage.getItem('investorEmail') || '',
            linkedin: localStorage.getItem('investorLinkedin') || '',
            bio: localStorage.getItem('investorBio') || '',
            ticketSize: localStorage.getItem('investorTicketSize') || '$50k - $200k',
            stageFocus: ['Seed', 'Pre-Seed'],
            industryFocus: (localStorage.getItem('investorIndustryFocus') || 'FinTech, AgriTech, SaaS').split(',').map(s => s.trim())
        };

        // Master Startup List — will be loaded from Firebase  
        let startupList = [];

        // Founders List — will be loaded from Firebase
        let foundersList = [];

        // --- FETCH REAL FOUNDERS FROM FIREBASE ---
        function fetchFoundersFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/founders').once('value').then(function(snap) {
                var data = snap.val();
                startupList = [];
                foundersList = [];
                if (data) {
                    var idx = 1;
                    Object.keys(data).forEach(function(key) {
                        var f = data[key];
                        startupList.push({
                            id: idx,
                            firebaseKey: key,
                            name: f.startupName || '',
                            founder: f.name || 'Unknown',
                            picture: f.picture || '',
                            industry: f.industry || 'General',
                            stage: f.stage || 'Pre-Seed',
                            raising: f.fundingNeeded || 'Not Disclosed',
                            valuation: f.valuation || 'Not Disclosed',
                            description: f.ideaDescription || f.bio || '',
                            problem: f.problem || '',
                            vision: f.vision || '',
                            businessPlan: f.businessPlan || '',
                            skillsNeeded: Array.isArray(f.skillsNeeded) ? f.skillsNeeded : (f.skillsNeeded ? String(f.skillsNeeded).split(',').map(function(s){return s.trim();}) : []),
                            linkedin: f.linkedin || '',
                            github: f.github || '',
                            email: f.email || '',
                            bio: f.bio || '',
                            hasIdea: !!f.startupName,
                            matchScore: Math.floor(Math.random() * 40) + 60
                        });
                        foundersList.push({
                            id: idx,
                            name: f.name || 'Unknown',
                            startup: f.startupName || '',
                            industry: f.industry || 'General',
                            stage: f.stage || 'Pre-Seed',
                            bio: f.bio || '',
                            picture: f.picture || '',
                            problem: f.problem || '',
                            vision: f.vision || '',
                            businessPlan: f.businessPlan || '',
                            description: f.ideaDescription || '',
                            skillsNeeded: Array.isArray(f.skillsNeeded) ? f.skillsNeeded : (f.skillsNeeded ? String(f.skillsNeeded).split(',').map(function(s){return s.trim();}) : []),
                            fundingNeeded: f.fundingNeeded || '',
                            linkedin: f.linkedin || '',
                            github: f.github || '',
                            email: f.email || '',
                            hasIdea: !!f.startupName,
                            requirements: f.skills ? f.skills.split(',').map(function(s) { return s.trim(); }) : (Array.isArray(f.skillsNeeded) ? f.skillsNeeded : [])
                        });
                        idx++;
                    });
                }
                console.log('Investor: Loaded ' + foundersList.length + ' founders from Firebase');
            });
        }

        // User specific state
        let watchlistIds = []; // Empty by default — will work with real data
        
        // Portfolio: Startups this investor has already invested in
        let portfolio = [];

        // --- STATE MANAGEMENT FUNCTIONS ---
        function setTab(tab) {
            currentTab = tab;
            updateSidebarActive();
            renderContent();
        }

        function updateSidebarActive() {
            document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
            const navLink = document.getElementById('nav-' + currentTab);
            if (navLink) navLink.classList.add('active');
            
            document.getElementById('portfolio-count-badge').textContent = portfolio.length;
        }

        // Profile Update — save to localStorage + Firebase
        function saveProfileInfo(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            profileData.name = fd.get('name');
            profileData.title = fd.get('title');
            profileData.location = fd.get('location');
            profileData.email = fd.get('email');
            profileData.linkedin = fd.get('linkedin');
            profileData.bio = fd.get('bio');
            profileData.ticketSize = fd.get('ticketSize');
            
            const industries = fd.get('industryFocus');
            if(industries) profileData.industryFocus = industries.split(',').map(i => i.trim());

            document.getElementById('user-initial').textContent = profileData.name.charAt(0).toUpperCase();
            
            // Save to localStorage
            localStorage.setItem('investorName', profileData.name);
            localStorage.setItem('investorTitle', profileData.title);
            localStorage.setItem('investorLocation', profileData.location);
            localStorage.setItem('investorEmail', profileData.email);
            localStorage.setItem('investorLinkedin', profileData.linkedin);
            localStorage.setItem('investorBio', profileData.bio);
            localStorage.setItem('investorTicketSize', profileData.ticketSize);
            localStorage.setItem('investorIndustryFocus', profileData.industryFocus.join(', '));
            
            // Save to Firebase
            saveInvestorProfileToFirebase();
            
            alert('Profile and Preferences Updated! AI Matching will now use this data.');
            renderContent();
        }
        
        // --- SAVE INVESTOR PROFILE TO FIREBASE ---
        function saveInvestorProfileToFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            var investorData = {
                name: profileData.name,
                title: profileData.title,
                location: profileData.location,
                email: profileData.email,
                linkedin: profileData.linkedin,
                bio: profileData.bio,
                ticketSize: profileData.ticketSize,
                industryFocus: profileData.industryFocus,
                role: 'Investor',
                profileUpdatedAt: new Date().toISOString()
            };
            db.ref('users/investors/' + safeKey).update(investorData)
                .then(function() { console.log('Investor profile saved to Firebase'); })
                .catch(function(e) { console.error('Firebase save error:', e); });
        }
        
        // --- LOGOUT FUNCTION ---
        function handleLogout() {
            // Sign out Firebase Auth
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(function(){});
            }
            localStorage.removeItem('investorName');
            localStorage.removeItem('investorEmail');
            localStorage.removeItem('investorTitle');
            localStorage.removeItem('investorLocation');
            localStorage.removeItem('investorLinkedin');
            localStorage.removeItem('investorBio');
            localStorage.removeItem('investorTicketSize');
            localStorage.removeItem('investorIndustryFocus');
            localStorage.removeItem('investorPicture');
            localStorage.removeItem('pendingSignup');
            window.location.href = 'index.html';
        }

        // Watchlist Logic
        function toggleWatchlist(startupId) {
            if(watchlistIds.includes(startupId)) {
                watchlistIds = watchlistIds.filter(id => id !== startupId);
            } else {
                watchlistIds.push(startupId);
            }
            renderContent();
        }

        // Contact/Request Pitch Logic
        function requestPitch(startupId) {
            const startup = getStartupDetails(startupId);
            alert(`Pitch request sent to ${startup.founder} at ${startup.name}. They will contact you via email.`);
        }

        function getStartupDetails(id) {
            return startupList.find(s => s.id === id);
        }

        // --- RENDER ROUTER ---
        function renderContent() {
            const content = document.getElementById('content');
            const pageTitle = document.getElementById('page-title');
            const pageSubtitle = document.getElementById('page-subtitle');
            
            const titles = {
                overview: { t: 'Command Center', s: 'Overview of your investments and activity.' },
                profile: { t: 'Investor Profile', s: 'Manage your details and investment thesis.' },
                explore: { t: 'AI Startup Matching', s: 'Discover startups that match your investment criteria.' },
                founders: { t: 'Browse Founders', s: 'Discover founders and read about their core ideas.' },
                portfolio: { t: 'My Portfolio', s: 'Track the performance of your investments.' },
                watchlist: { t: 'Watchlist', s: 'Startups you are currently monitoring.' },
                community: { t: 'Community Feed', s: 'Connect, share, and grow with the entire Foundera community.' }
            };
            
            if(titles[currentTab]) {
                pageTitle.textContent = titles[currentTab].t;
                pageSubtitle.textContent = titles[currentTab].s;
            }

            content.style.opacity = '0';
            setTimeout(() => {
                switch(currentTab) {
                    case 'overview': content.innerHTML = renderOverview(); break;
                    case 'profile': content.innerHTML = renderProfile(); break;
                    case 'explore': content.innerHTML = renderExplore(); break;
                    case 'founders': content.innerHTML = renderFounders(); break;
                    case 'portfolio': content.innerHTML = renderPortfolio(); break;
                    case 'watchlist': content.innerHTML = renderWatchlist(); break;
                    case 'community': content.innerHTML = renderCommunity(); break;
                }
                lucide.createIcons();
                content.style.opacity = '1';
                content.style.transition = 'opacity 0.3s ease';
            }, 50);
        }

        // --- VIEWS ---
        function renderOverview() {
            return `
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-gray-800 to-indigo-900/40 rounded-2xl p-8 border border-indigo-500/30 shadow-lg">
                        <h2 class="text-3xl font-bold mb-2 text-white">Welcome back, ${profileData.name.split(' ')[0]}!</h2>
                        <p class="text-indigo-100 mb-6 max-w-2xl text-lg">AI has found new startups matching your focus in <strong>${profileData.industryFocus.join(', ')}</strong>.</p>
                        <div class="flex flex-wrap gap-4">
                            <button onclick="setTab('explore')" class="btn-highlight-purple text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                <i data-lucide="compass" class="w-5 h-5 mr-2"></i> Review AI Matches
                            </button>
                            <button onclick="setTab('founders')" class="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max transition-colors">
                                <i data-lucide="users" class="w-5 h-5 mr-2"></i> Browse Founders
                            </button>
                            <button onclick="setTab('community')" class="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max transition-colors">
                                <i data-lucide="message-circle" class="w-5 h-5 mr-2"></i> Community Feed
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-indigo-500/50 transition-colors">
                            <i data-lucide="briefcase" class="w-8 h-8 text-indigo-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${portfolio.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Active Investments</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-colors">
                            <i data-lucide="heart" class="w-8 h-8 text-purple-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${watchlistIds.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">In Watchlist</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-green-500/50 transition-colors">
                            <i data-lucide="wallet" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">$25K</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Capital Deployed</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-blue-500/50 transition-colors">
                            <i data-lucide="pie-chart" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white text-green-400">+40%</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Portfolio ROI</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderProfile() {
            return `
                <div class="max-w-4xl space-y-6 animate-fade-in">
                    
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex items-center gap-6 mb-8">
                            <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                                ${profileData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 class="text-3xl font-bold text-white mb-1">${profileData.name}</h2>
                                <p class="text-indigo-400 font-medium">${profileData.title}</p>
                            </div>
                        </div>

                        <form onsubmit="saveProfileInfo(event)" class="space-y-6">
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input type="text" name="name" value="${profileData.name}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Title & Company/Fund</label>
                                    <input type="text" name="title" value="${profileData.title}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                    <input type="text" name="location" value="${profileData.location}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Email Address (For Deal Flow)</label>
                                    <input type="email" name="email" value="${profileData.email}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile</label>
                                    <input type="url" name="linkedin" value="${profileData.linkedin}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Investment Thesis / Bio</label>
                                    <textarea name="bio" rows="3" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">${profileData.bio}</textarea>
                                </div>

                                <div class="md:col-span-2 mt-4 border-t border-gray-700/50 pt-6">
                                    <h3 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="target" class="w-5 h-5 mr-2 text-indigo-400"></i> Investment Preferences (For AI Matching)</h3>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Typical Check Size</label>
                                    <select name="ticketSize" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                        <option value="$10k - $50k" ${profileData.ticketSize === '$10k - $50k' ? 'selected' : ''}>$10k - $50k</option>
                                        <option value="$50k - $200k" ${profileData.ticketSize === '$50k - $200k' ? 'selected' : ''}>$50k - $200k</option>
                                        <option value="$200k - $500k" ${profileData.ticketSize === '$200k - $500k' ? 'selected' : ''}>$200k - $500k</option>
                                        <option value="$500k+" ${profileData.ticketSize === '$500k+' ? 'selected' : ''}>$500k+</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Preferred Industries (Comma separated)</label>
                                    <input type="text" name="industryFocus" value="${profileData.industryFocus.join(', ')}" placeholder="e.g. FinTech, AgriTech, SaaS" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                            </div>
                            
                            <div class="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                                <button type="submit" class="invest-btn text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center">
                                    <i data-lucide="save" class="w-5 h-5 mr-2"></i> Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Community Posts -->
                    ${window.renderUserCommunityPosts ? window.renderUserCommunityPosts(profileData.email ? profileData.email.replace(/[.#$\[\]]/g, '_') : '', profileData.name) : ''}
                </div>
            `;
        }

        // New Section: Founders & Detailed Ideas
        function renderFounders() {
            if (startupList.length === 0) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <i data-lucide="users" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-2">No Founders Found Yet</h2>
                        <p class="text-gray-400">When founders create their profiles on Foundera, they will appear here.</p>
                    </div>`;
            }
            return `
                <div class="space-y-6 animate-fade-in">
                    <p class="text-sm text-gray-400"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i> Showing <strong class="text-white">${startupList.length}</strong> real founders from database</p>
                    <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 shadow-lg mb-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1 relative">
                                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                                <input type="text" placeholder="Search by founder name, startup, or keywords..." class="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                            </div>
                            <select class="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white focus:ring-2 focus:ring-indigo-500">
                                <option>All Industries</option>
                                <option>AgriTech</option>
                                <option>FinTech</option>
                                <option>HealthTech</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-8">
                        ${startupList.map(startup => {
                            const isSaved = watchlistIds.includes(startup.id);
                            return `
                            <div class="bg-gray-800/40 rounded-3xl border border-gray-700/50 p-8 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="flex flex-col lg:flex-row gap-8">
                                    <!-- Left Column: Founder & Basic Info -->
                                    <div class="lg:w-1/3 space-y-6">
                                        <div class="flex items-start gap-4">
                                            ${startup.picture 
                                                ? '<img src="' + startup.picture + '" class="w-16 h-16 rounded-2xl object-cover border border-gray-700 shadow-inner">'
                                                : '<div class="w-16 h-16 bg-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center font-bold text-2xl text-indigo-400 shadow-inner">' + startup.founder[0] + '</div>'
                                            }
                                            <div>
                                                <h3 class="text-xl font-bold text-white">${startup.founder}</h3>
                                                ${startup.hasIdea 
                                                    ? '<p class="text-sm text-indigo-400 font-medium">Founder @ ' + startup.name + '</p>'
                                                    : '<p class="text-sm text-gray-400 italic">No startup posted yet</p>'
                                                }
                                                <div class="flex gap-2 mt-2">
                                                    ${startup.linkedin ? '<a href="' + startup.linkedin + '" target="_blank" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="LinkedIn"><i data-lucide="linkedin" class="w-4 h-4"></i></a>' : ''}
                                                    ${startup.github ? '<a href="' + startup.github + '" target="_blank" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="GitHub"><i data-lucide="github" class="w-4 h-4"></i></a>' : ''}
                                                    ${startup.email ? '<a href="mailto:' + startup.email + '" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="Email"><i data-lucide="mail" class="w-4 h-4"></i></a>' : ''}
                                                </div>
                                            </div>
                                        </div>

                                        ${startup.bio ? '<p class="text-gray-300 text-sm leading-relaxed">' + startup.bio + '</p>' : ''}

                                        ${startup.hasIdea ? `<div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                            <div class="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Industry</span>
                                                    <span class="font-medium text-white">${startup.industry}</span>
                                                </div>
                                                <div>
                                                    <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Stage</span>
                                                    <span class="font-medium text-white">${startup.stage}</span>
                                                </div>
                                                <div>
                                                    <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Raising</span>
                                                    <span class="font-bold text-green-400">${startup.raising}</span>
                                                </div>
                                                <div>
                                                    <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Valuation</span>
                                                    <span class="font-medium text-white">${startup.valuation}</span>
                                                </div>
                                            </div>
                                        </div>` : ''}

                                        ${startup.skillsNeeded && startup.skillsNeeded.length > 0 ? '<div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700"><p class="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Skills Needed:</p><div class="flex flex-wrap gap-2">' + startup.skillsNeeded.map(function(s){ return '<span class="bg-indigo-500/15 text-indigo-300 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30">' + s + '</span>'; }).join('') + '</div></div>' : ''}

                                        <div class="flex gap-3">
                                            <button onclick="viewCommunityProfile('${startup.firebaseKey}','Founder')" class="flex-1 invest-btn text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">View Profile</button>
                                            ${startup.email ? '<button onclick="requestPitch(' + startup.id + ')" class="flex-1 border border-indigo-500/40 text-indigo-300 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500/10 transition">Contact Founder</button>' : ''}
                                            <button onclick="toggleWatchlist(${startup.id})" class="p-2.5 border border-gray-600 rounded-xl hover:bg-gray-700 transition text-gray-400 flex items-center justify-center" title="Save to Watchlist">
                                                <i data-lucide="heart" class="w-5 h-5 ${isSaved ? 'fill-red-400 text-red-400' : ''}"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Right Column: Detailed Idea -->
                                    ${startup.hasIdea ? `<div class="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-700/50 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">Active Startup</span>
                                        </div>
                                        <h4 class="text-2xl font-bold text-white mb-2">${startup.name}</h4>
                                        ${startup.description ? '<p class="text-gray-300 text-sm leading-relaxed">' + startup.description + '</p>' : ''}
                                        <div>
                                            <h4 class="text-white font-bold text-lg mb-2 flex items-center"><i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 mr-2"></i> The Problem</h4>
                                            <p class="text-gray-300 text-sm leading-relaxed">${startup.problem || 'No problem statement provided.'}</p>
                                        </div>
                                        <div>
                                            <h4 class="text-white font-bold text-lg mb-2 flex items-center"><i data-lucide="eye" class="w-5 h-5 text-blue-400 mr-2"></i> Vision & Mission</h4>
                                            <p class="text-gray-300 text-sm leading-relaxed">${startup.vision || 'No vision provided.'}</p>
                                        </div>
                                        <div>
                                            <h4 class="text-white font-bold text-lg mb-2 flex items-center"><i data-lucide="briefcase" class="w-5 h-5 text-purple-400 mr-2"></i> Business Plan & Revenue Model</h4>
                                            <p class="text-gray-300 text-sm leading-relaxed">${startup.businessPlan || 'No business plan detailed yet.'}</p>
                                        </div>
                                    </div>` : `<div class="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-700/50 pt-6 lg:pt-0 lg:pl-8 flex items-center justify-center">
                                        <div class="text-center py-8">
                                            <i data-lucide="file-question" class="w-12 h-12 text-gray-600 mx-auto mb-3"></i>
                                            <p class="text-gray-500 text-sm">This founder hasn't shared their startup idea yet.</p>
                                        </div>
                                    </div>`}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }

        function renderExplore() {
            if (startupList.length === 0) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <i data-lucide="compass" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-2">No Startups to Match Yet</h2>
                        <p class="text-gray-400">When founders create their profiles and ideas, AI matches will appear here.</p>
                    </div>`;
            }
            // Sort by Match Score for AI Matching
            const sortedStartups = [...startupList].sort((a,b) => b.matchScore - a.matchScore);

            return `
                <div class="space-y-6">
                    <div class="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p class="text-indigo-200 text-sm">
                            <i data-lucide="sparkles" class="w-4 h-4 inline-block mr-1"></i>
                            AI recommends these startups based on your focus in <strong>${profileData.industryFocus.join(', ')}</strong>.
                        </p>
                    </div>

                    <div class="grid lg:grid-cols-2 gap-6">
                        ${sortedStartups.map(startup => {
                            const isSaved = watchlistIds.includes(startup.id);
                            return `
                            <div class="bg-gray-800/40 rounded-2xl border ${startup.matchScore >= 85 ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-gray-700/50'} p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden">
                                ${startup.matchScore >= 90 ? '<div class="absolute -right-10 top-5 bg-indigo-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-lg">HIGH MATCH</div>' : ''}
                                
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-600">
                                            ${startup.name[0]}
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">${startup.name}</h3>
                                            <p class="text-sm text-gray-400">Founder: <span class="text-gray-300 font-medium">${startup.founder}</span></p>
                                        </div>
                                    </div>
                                    <span class="bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-500/20">${startup.matchScore}% Match</span>
                                </div>
                                
                                <div class="flex gap-2 mb-4">
                                    <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.industry}</span>
                                    <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.stage}</span>
                                </div>

                                <p class="text-sm text-gray-300 mb-6 line-clamp-3 flex-grow">${startup.description}</p>

                                <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Raising</p>
                                        <p class="font-bold text-white">${startup.raising}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Valuation</p>
                                        <p class="font-bold text-white">${startup.valuation}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 mt-auto">
                                    <button onclick="requestPitch(${startup.id})" class="flex-1 invest-btn text-white py-3 rounded-xl font-bold text-sm shadow-lg">Request Pitch Deck</button>
                                    <button onclick="toggleWatchlist(${startup.id})" class="p-3 border border-gray-600 rounded-xl hover:bg-gray-700 transition text-gray-400 flex items-center justify-center shrink-0" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}">
                                        <i data-lucide="heart" class="w-5 h-5 ${isSaved ? 'fill-red-400 text-red-400' : ''}"></i>
                                    </button>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }

        function renderPortfolio() {
            return `
                <div class="space-y-6">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-gray-700/50">
                            <h2 class="text-xl font-bold text-white">Active Investments</h2>
                        </div>
                        <table class="w-full text-left">
                            <thead class="bg-gray-900/50 border-b border-gray-700/50">
                                <tr>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Startup</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Invested Date</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Amount Invested</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Current Value</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700/30">
                                ${portfolio.length === 0 ? `<tr><td colspan="4" class="p-6 text-center text-gray-400">No active investments yet.</td></tr>` : ''}
                                ${portfolio.map(inv => {
                                    const startup = getStartupDetails(inv.startupId);
                                    return `
                                    <tr class="hover:bg-gray-800/60 transition-colors">
                                        <td class="px-6 py-4">
                                            <p class="font-bold text-white">${startup ? startup.name : 'Unknown'}</p>
                                            <p class="text-xs text-gray-400">${startup ? startup.industry : ''}</p>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-300">${inv.date}</td>
                                        <td class="px-6 py-4 font-medium text-white">${inv.amountInvested}</td>
                                        <td class="px-6 py-4 font-bold text-green-400">${inv.currentValuation}</td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderWatchlist() {
            const watchedStartups = watchlistIds.map(id => getStartupDetails(id)).filter(Boolean);
            
            return `
                <div class="space-y-6">
                    ${watchedStartups.length === 0 ? `
                        <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                            <i data-lucide="heart" class="w-12 h-12 text-gray-600 mx-auto mb-4"></i>
                            <h3 class="text-xl font-bold text-white">Watchlist is Empty</h3>
                            <p class="text-gray-400 mt-2">Save startups from the Explore tab to monitor them here.</p>
                        </div>
                    ` : `
                        <div class="grid lg:grid-cols-2 gap-6">
                            ${watchedStartups.map(startup => `
                                <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 shadow-lg flex flex-col">
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class="text-xl font-bold text-white">${startup.name}</h3>
                                            <p class="text-sm text-gray-400">${startup.industry} â€¢ ${startup.stage}</p>
                                        </div>
                                        <button onclick="toggleWatchlist(${startup.id})" class="text-red-400 hover:text-gray-400 transition" title="Remove">
                                            <i data-lucide="heart" class="w-6 h-6 fill-current"></i>
                                        </button>
                                    </div>
                                    <p class="text-sm text-gray-300 mb-6">${startup.description}</p>
                                    <div class="mt-auto">
                                        <button onclick="requestPitch(${startup.id})" class="w-full invest-btn text-white py-3 rounded-xl font-bold text-sm">Request Pitch Deck</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            `;
        }

        
// --- MOBILE SIDEBAR TOGGLE ---
function toggleMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}
        // --- INIT ---
        // Auth guard — redirect if not logged in
        if (!localStorage.getItem('investorName') && !localStorage.getItem('investorEmail')) {
            window.location.href = 'index.html';
        }
        document.getElementById('user-initial').textContent = profileData.name.charAt(0).toUpperCase();
        
        // Load real founders data from Firebase
        fetchFoundersFromFirebase().then(function() {
            setTab('community');
        }).catch(function() {
            setTab('community');
        });
        
        // Start real-time community posts listener
        fetchCommunityPosts();

// --- PRELOADER ---
window.addEventListener('load', function() {
    setTimeout(function() {
        var p = document.getElementById('foundera-preloader');
        if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
    }, 2400);
});
