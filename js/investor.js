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
            industryFocus: (localStorage.getItem('investorIndustryFocus') || 'FinTech, AgriTech, SaaS').split(',').map(s => s.trim()),
            profilePic: localStorage.getItem('investorProfilePic') || '',
            coverPic: localStorage.getItem('investorCoverPic') || ''
        };

        // Master Startup List — will be loaded from Firebase  
        let startupList = [];

        // Founders List — will be loaded from Firebase
        let foundersList = [];

        // Talents List — will be loaded from Firebase
        let talentsList = [];

        // AI Match Cache
        let investorAIMatchCache = null;

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
                            matchScore: 0 // Will be generated via AI
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

        // --- FETCH REAL JOB SEEKERS (TALENTS) FROM FIREBASE ---
        function fetchJobSeekersFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/jobseekers').once('value').then(function(snap) {
                var data = snap.val();
                talentsList = [];
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        var s = data[key];
                        talentsList.push({
                            id: key,
                            name: s.name || 'Unknown',
                            role: s.title || 'Job Seeker',
                            skills: Array.isArray(s.skills) ? s.skills : (s.skills ? String(s.skills).split(',').map(sk => sk.trim()) : []),
                            picture: s.profilePic || s.picture || '',
                            avatar: (s.name || 'U').charAt(0).toUpperCase(),
                            email: s.email || '',
                            linkedin: s.linkedin || ''
                        });
                    });
                }
                console.log('Investor: Loaded ' + talentsList.length + ' job seekers from Firebase');
            });
        }

        // User specific state
        let watchlistIds = []; 
        try {
            const savedWatchlist = localStorage.getItem('investorWatchlist');
            if (savedWatchlist) watchlistIds = JSON.parse(savedWatchlist);
        } catch(e) { watchlistIds = []; }
        
        // Portfolio: Startups this investor has already invested in (Loaded from LocalStorage)
        let portfolio = [];
        try {
            const savedPortfolio = localStorage.getItem('investorPortfolio');
            if (savedPortfolio) portfolio = JSON.parse(savedPortfolio);
        } catch(e) { portfolio = []; }

        // --- UTILITY FUNCTIONS ---
        function escapeHtml(text) {
            if (!text) return '';
            return text.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // Smart modal toggler
        function closeModal(id) {
            const el = document.getElementById(id);
            if (el) {
                if (el.parentElement === document.body) {
                    el.remove(); // Remove dynamically generated modals
                } else {
                    el.classList.add('hidden');
                }
            }
        }

        // --- STATE MANAGEMENT FUNCTIONS ---
        function setTab(tab) {
            currentTab = tab;
            updateSidebarActive();
            renderContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            var sidebar = document.getElementById('sidebar');
            var overlay = document.getElementById('sidebar-overlay');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.add('hidden');
            }
        }

        function updateSidebarActive() {
            document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
            const navLink = document.getElementById('nav-' + currentTab);
            if (navLink) navLink.classList.add('active');
            
            document.getElementById('portfolio-count-badge').textContent = portfolio.length;
        }

        // --- PICTURE UPLOAD HANDLERS ---
        function handleProfilePicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (typeof window.compressImageFile === 'function') {
                window.compressImageFile(file, 800, 800, 0.8).then(function(base64) {
                    profileData.profilePic = base64;
                    localStorage.setItem('investorProfilePic', base64);
                    updateHeaderAvatar();
                    saveInvestorProfileToFirebase();
                    renderContent();
                });
            }
        }

        function removeProfilePic() {
            profileData.profilePic = '';
            localStorage.removeItem('investorProfilePic');
            updateHeaderAvatar();
            saveInvestorProfileToFirebase();
            renderContent();
        }
        
        function handleCoverPicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (typeof window.compressImageFile === 'function') {
                window.compressImageFile(file, 1920, 1080, 0.75).then(function(base64) {
                    profileData.coverPic = base64;
                    localStorage.setItem('investorCoverPic', base64);
                    saveInvestorProfileToFirebase();
                    renderContent();
                });
            }
        }

        function removeCoverPic() {
            profileData.coverPic = '';
            localStorage.removeItem('investorCoverPic');
            saveInvestorProfileToFirebase();
            renderContent();
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

            updateHeaderAvatar();
            
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
            
            // Clear AI Cache so it re-generates based on new preferences
            investorAIMatchCache = null;

            closeModal('basic-info-modal');
            renderContent();
            
            setTimeout(() => {
                alert('Profile and Preferences Updated! AI Matching will now use this data.');
            }, 100);
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
                profilePic: profileData.profilePic,
                coverPic: profileData.coverPic,
                role: 'Investor',
                profileUpdatedAt: new Date().toISOString()
            };
            db.ref('users/investors/' + safeKey).update(investorData)
                .then(function() { console.log('Investor profile saved to Firebase'); })
                .catch(function(e) { console.error('Firebase save error:', e); });
        }

        // --- UPDATE HEADER AVATAR ---
        function updateHeaderAvatar() {
            var container = document.getElementById('header-avatar-container');
            if (!container) return;
            if (profileData.profilePic) {
                container.innerHTML = '<img src="' + profileData.profilePic + '" alt="Profile" class="w-12 h-12 rounded-full object-cover">';
            } else {
                container.innerHTML = '<span id="user-initial">' + (profileData.name ? profileData.name.charAt(0).toUpperCase() : 'I') + '</span>';
            }
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
            localStorage.removeItem('investorProfilePic');
            localStorage.removeItem('investorCoverPic');
            localStorage.removeItem('investorPortfolio');
            localStorage.removeItem('investorWatchlist');
            localStorage.removeItem('pendingSignup');
            window.location.href = 'index.html';
        }

        // --- DYNAMIC MODAL GENERATORS (Prevents clipping/stacking issues) ---
        window.openAddInvestmentModal = function() {
            var existing = document.getElementById('add-investment-modal');
            if (existing) existing.remove();

            const startupOptions = startupList.filter(s => s.hasIdea).map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.founder)})</option>`).join('');

            var modal = document.createElement('div');
            modal.id = 'add-investment-modal';
            // Use overflow-y-auto on the wrapper to fix clipping
            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto';
            modal.onclick = function(e) { if (e.target === modal || e.target.id === 'add-inv-wrapper') modal.remove(); };

            modal.innerHTML = `
                <div id="add-inv-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                    <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md flex flex-col animate-fade-in relative">
                        <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="plus-circle" class="w-5 h-5 mr-2 text-indigo-400"></i> Log Investment</h2>
                            <button type="button" onclick="document.getElementById('add-investment-modal').remove()" class="text-gray-400 hover:text-white transition"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <form onsubmit="saveInvestment(event)" class="space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Select Startup</label>
                                    <select name="startupId" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                        <option value="" disabled selected>Choose a startup from network...</option>
                                        ${startupOptions}
                                    </select>
                                    ${startupOptions === '' ? '<p class="text-xs text-red-400 mt-2">No startups with ideas exist currently.</p>' : ''}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Amount Invested ($)</label>
                                    <input type="number" name="amount" required min="1" placeholder="e.g. 50000" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Current Valuation ($)</label>
                                    <input type="number" name="valuation" required min="1" placeholder="e.g. 50000" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    <p class="text-xs text-gray-500 mt-1">If unknown, put the same as Amount Invested initially.</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Investment Date</label>
                                    <input type="date" name="date" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white" style="color-scheme: dark;">
                                </div>
                                <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                    <button type="button" onclick="document.getElementById('add-investment-modal').remove()" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                    <button type="submit" class="invest-btn text-white px-6 py-3 rounded-xl font-bold flex-1 flex justify-center items-center gap-2">Save Log</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        window.openEditProfileModal = function() {
            var existing = document.getElementById('basic-info-modal');
            if (existing) existing.remove();

            var modal = document.createElement('div');
            modal.id = 'basic-info-modal';
            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto';
            modal.onclick = function(e) { if (e.target === modal || e.target.id === 'edit-profile-wrapper') modal.remove(); };

            modal.innerHTML = `
                <div id="edit-profile-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                    <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl flex flex-col animate-fade-in relative">
                        <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                            <h2 class="text-xl font-bold text-white">Edit Profile & Preferences</h2>
                            <button type="button" onclick="document.getElementById('basic-info-modal').remove()" class="text-gray-400 hover:text-white transition"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <form onsubmit="saveProfileInfo(event)" class="space-y-6">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                        <input type="text" name="name" value="${escapeHtml(profileData.name)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Title & Company/Fund</label>
                                        <input type="text" name="title" value="${escapeHtml(profileData.title)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                        <input type="text" name="location" value="${escapeHtml(profileData.location)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Email Address (For Deal Flow)</label>
                                        <input type="email" name="email" value="${escapeHtml(profileData.email)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile</label>
                                        <input type="url" name="linkedin" value="${escapeHtml(profileData.linkedin)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Investment Thesis / Bio</label>
                                        <textarea name="bio" rows="4" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">${escapeHtml(profileData.bio)}</textarea>
                                    </div>

                                    <div class="md:col-span-2 mt-2 border-t border-gray-700/50 pt-6">
                                        <h3 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="target" class="w-5 h-5 mr-2 text-indigo-400"></i> Investment Preferences</h3>
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
                                        <input type="text" name="industryFocus" value="${escapeHtml(profileData.industryFocus.join(', '))}" placeholder="e.g. FinTech, AgriTech, SaaS" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                                    </div>
                                </div>
                                
                                <div class="pt-4 flex gap-3 mt-6 border-t border-gray-700/50 pt-6">
                                    <button type="button" onclick="document.getElementById('basic-info-modal').remove()" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                    <button type="submit" class="invest-btn text-white px-6 py-3 rounded-xl font-bold flex-1 flex justify-center items-center gap-2"><i data-lucide="save" class="w-5 h-5"></i> Save Profile</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        // --- PORTFOLIO LOGIC ---
        function saveInvestment(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            const inv = {
                id: Date.now(),
                startupId: Number(fd.get('startupId')),
                amountInvested: Number(fd.get('amount')),
                currentValuation: Number(fd.get('valuation')),
                date: fd.get('date')
            };
            
            portfolio.push(inv);
            localStorage.setItem('investorPortfolio', JSON.stringify(portfolio));
            
            closeModal('add-investment-modal');
            renderContent();
            updateSidebarActive();
        }

        function deleteInvestment(id) {
            if(confirm("Are you sure you want to remove this investment record from your portfolio?")) {
                portfolio = portfolio.filter(p => p.id !== id);
                localStorage.setItem('investorPortfolio', JSON.stringify(portfolio));
                renderContent();
                updateSidebarActive();
            }
        }

        // Watchlist Logic
        function toggleWatchlist(startupId) {
            if(watchlistIds.includes(startupId)) {
                watchlistIds = watchlistIds.filter(id => id !== startupId);
            } else {
                watchlistIds.push(startupId);
            }
            localStorage.setItem('investorWatchlist', JSON.stringify(watchlistIds));
            renderContent();
        }

        // Contact/Request Pitch Logic
        function requestPitch(startupId) {
            const startup = getStartupDetails(startupId);
            alert(`Pitch request sent to ${startup.founder} at ${startup.name}. They will contact you via email.`);
        }

        // Using strictly typed String comparison to ensure matching doesn't fail
        function getStartupDetails(id) {
            return startupList.find(s => String(s.id) === String(id));
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
                community: { t: 'Community Feed', s: 'Connect, share, and grow with the entire Foundera community.' },
                myposts: { t: 'My Posts', s: 'View, edit, and manage your community posts.' }
            };
            
            if(titles[currentTab]) {
                pageTitle.textContent = titles[currentTab].t;
                pageSubtitle.textContent = titles[currentTab].s;
            }

            content.style.opacity = '0';
            content.style.transition = 'opacity 0.2s ease';
            requestAnimationFrame(function() {
                switch(currentTab) {
                    case 'overview': content.innerHTML = renderOverview(); break;
                    case 'profile': content.innerHTML = renderProfile(); break;
                    case 'explore': content.innerHTML = renderExplore(); break;
                    case 'founders': content.innerHTML = renderFounders(); break;
                    case 'portfolio': content.innerHTML = renderPortfolio(); break;
                    case 'watchlist': content.innerHTML = renderWatchlist(); break;
                    case 'community': content.innerHTML = window.renderCommunity ? window.renderCommunity() : '<p class="p-8 text-center text-gray-500">Loading community feed...</p>'; break;
                    case 'myposts': content.innerHTML = window.renderMyPosts ? window.renderMyPosts() : '<p class="p-8 text-center text-gray-500">Loading my posts...</p>'; break;
                }
                lucide.createIcons();
                requestAnimationFrame(function() { content.style.opacity = '1'; });
            });
        }

        // --- SKILL MATCHING LOGIC ---
        function getAISkillMatch(ideaSkills, talentSkills) {
            var exactMatches = 0;
            var partialMatches = 0;
            var ideaLower = ideaSkills.map(s => s.toLowerCase().trim());
            var talentLower = talentSkills.map(s => s.toLowerCase().trim());
            
            ideaLower.forEach(needed => {
                talentLower.forEach(has => {
                    if (needed === has) {
                        exactMatches++;
                    } else if (needed.includes(has) || has.includes(needed)) {
                        partialMatches++;
                    }
                });
            });
            
            var totalNeeded = ideaSkills.length || 1;
            var score = Math.round(((exactMatches * 1.0 + partialMatches * 0.5) / totalNeeded) * 100);
            return Math.min(score, 100);
        }

        // --- VIEWS ---
        function renderOverview() {
            // Calculate Matched Startups (Founders) based on investor's industry focus
            let matchedStartupsCount = 0;
            if (startupList && startupList.length > 0) {
                matchedStartupsCount = startupList.filter(s => 
                    s.hasIdea && 
                    profileData.industryFocus.some(ind => 
                        s.industry.toLowerCase().includes(ind.toLowerCase()) || 
                        ind.toLowerCase().includes(s.industry.toLowerCase())
                    )
                ).length;
            }

            // Total Job Seekers (Talent pool available for startups)
            let talentCount = talentsList ? talentsList.length : 0;

            return `
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-gray-800 to-indigo-900/40 rounded-2xl p-8 border border-indigo-500/30 shadow-lg">
                        <h2 class="text-3xl font-bold mb-2 text-white">Welcome back, ${profileData.name.split(' ')[0]}!</h2>
                        <p class="text-indigo-100 mb-6 max-w-2xl text-lg">AI has found <strong>${matchedStartupsCount}</strong> startups matching your focus in <strong>${profileData.industryFocus.join(', ')}</strong>.</p>
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
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-indigo-500/50 transition-colors cursor-pointer" onclick="setTab('portfolio')">
                            <i data-lucide="briefcase" class="w-8 h-8 text-indigo-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${portfolio.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Active Investments</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-colors cursor-pointer" onclick="setTab('watchlist')">
                            <i data-lucide="heart" class="w-8 h-8 text-purple-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${watchlistIds.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">In Watchlist</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-green-500/50 transition-colors cursor-pointer" onclick="setTab('explore')">
                            <i data-lucide="rocket" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${matchedStartupsCount}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Matched Founders</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-blue-500/50 transition-colors">
                            <i data-lucide="users" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${talentCount}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Available Talent</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderProfile() {
            var initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'I';
            var profilePicHTML = profileData.profilePic 
                ? '<img src="' + profileData.profilePic + '" alt="Profile" class="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl">'
                : '<div class="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-white shadow-xl">' + initial + '</div>';

            var coverStyle = profileData.coverPic
                ? 'background-image: url(' + profileData.coverPic + '); background-size: cover; background-position: center;'
                : 'background: linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b);';

            var industriesHTML = profileData.industryFocus.length > 0
                ? profileData.industryFocus.map(function(ind) { return '<span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg text-sm">' + escapeHtml(ind) + '</span>'; }).join('')
                : '<span class="text-gray-500 italic text-sm">No preferences set.</span>';

            return `
                <div class="max-w-4xl space-y-6 animate-fade-in relative">
                    <!-- Top Header Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg relative">
                        <div class="h-48 relative group cursor-pointer" style="${coverStyle}" onclick="document.getElementById('cover-pic-input').click()">
                            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div class="bg-black/60 px-4 py-2 rounded-xl flex items-center text-white text-sm font-medium">
                                    <i data-lucide="camera" class="w-5 h-5 mr-2"></i> ${profileData.coverPic ? 'Change Cover Photo' : 'Upload Cover Photo'}
                                </div>
                            </div>
                            ${profileData.coverPic ? '<button onclick="event.stopPropagation(); removeCoverPic();" class="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Remove cover"><i data-lucide="trash-2" class="w-4 h-4"></i></button>' : ''}
                            <input type="file" id="cover-pic-input" accept="image/*" onchange="handleCoverPicUpload(this)" class="hidden">
                        </div>
                        <div class="px-8 pb-8 relative">
                            <div class="absolute -top-16 left-8 group cursor-pointer" onclick="document.getElementById('profile-pic-input').click()">
                                ${profilePicHTML}
                                <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <i data-lucide="camera" class="w-6 h-6 text-white"></i>
                                </div>
                                <input type="file" id="profile-pic-input" accept="image/*" onchange="handleProfilePicUpload(this)" class="hidden">
                            </div>
                            <div class="flex justify-end mt-4 gap-2">
                                ${profileData.profilePic ? '<button onclick="removeProfilePic()" class="p-2 hover:bg-red-500/20 rounded-full transition text-red-400 text-xs flex items-center" title="Remove photo"><i data-lucide="trash-2" class="w-4 h-4 mr-1"></i><span class="hidden sm:inline">Remove Photo</span></button>' : ''}
                                <button onclick="openEditProfileModal()" class="p-2 hover:bg-gray-700 rounded-full transition text-indigo-400"><i data-lucide="pencil" class="w-5 h-5"></i></button>
                            </div>
                            <div class="mt-4">
                                <h1 class="text-2xl font-bold text-white">${profileData.name || 'Your Name'}</h1>
                                <p class="text-indigo-400 font-medium mt-1">${profileData.title || '<span class="text-gray-500 italic">Add your headline/fund</span>'}</p>
                                <p class="text-gray-500 text-sm mt-2 flex items-center"><i data-lucide="map-pin" class="w-4 h-4 mr-1"></i> ${profileData.location || 'Add location'}</p>
                                
                                <div class="flex flex-wrap gap-3 mt-5">
                                    <a href="mailto:${profileData.email}" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center text-white"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Contact Info</a>
                                    ${profileData.linkedin ? '<a href="' + profileData.linkedin + '" target="_blank" class="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Investment Thesis / Bio -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg relative">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="user" class="w-5 h-5 text-indigo-400 mr-2"></i> Investment Thesis & Bio</h2>
                            <button onclick="openEditProfileModal()" class="p-2 hover:bg-gray-700 rounded-full transition"><i data-lucide="pencil" class="w-5 h-5 text-gray-400"></i></button>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${profileData.bio || '<span class="text-gray-500 italic">Click the edit button to add your investment thesis.</span>'}</p>
                    </div>

                    <!-- Investment Preferences -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg relative">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="target" class="w-5 h-5 text-indigo-400 mr-2"></i> Preferences</h2>
                            <button onclick="openEditProfileModal()" class="p-2 hover:bg-gray-700 rounded-full transition"><i data-lucide="pencil" class="w-5 h-5 text-gray-400"></i></button>
                        </div>
                        
                        <div class="grid sm:grid-cols-2 gap-6">
                            <div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                                <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Typical Ticket Size</p>
                                <p class="text-xl font-bold text-white">${profileData.ticketSize || 'Not specified'}</p>
                            </div>
                            <div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                                <p class="text-xs text-gray-500 uppercase tracking-wider mb-3 font-bold">Industry Focus</p>
                                <div class="flex flex-wrap gap-2">
                                    ${industriesHTML}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Community Posts -->
                    ${window.renderUserCommunityPostsFull ? window.renderUserCommunityPostsFull(profileData.email ? profileData.email.replace(/[.#$\\[\\]]/g, '_') : '', profileData.name) : ''}
                </div>
            `;
        }

        // --- GEMINI AI MATCHING LOGIC FOR INVESTORS ---
        async function generateAIStartupMatches() {
            const container = document.getElementById('ai-explore-container');
            if (!container) return;

            // Filter startups that actually have ideas
            let validStartups = startupList.filter(s => s.hasIdea);

            if (validStartups.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-gray-400">No active startups available for matching.</div>';
                return;
            }

            // Local pre-filtering/scoring
            validStartups.forEach(s => {
                s.localScore = 40;
                if (profileData.industryFocus.some(ind => s.industry.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(s.industry.toLowerCase()))) {
                    s.localScore += 40;
                }
            });
            validStartups.sort((a,b) => b.localScore - a.localScore);
            const topStartups = validStartups.slice(0, 10);

            if (investorAIMatchCache) {
                renderMatchedCards(investorAIMatchCache);
                return;
            }

            try {
                const GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng';
                const prompt = `You are an expert AI Investor Matchmaker. 
An investor prefers these industries: ${profileData.industryFocus.join(', ')}. 
Ticket Size: ${profileData.ticketSize}
Bio/Thesis: ${profileData.bio || 'General investor looking for great opportunities.'}

Rate these startups (0-100) on how well they fit the investor's thesis. Give a short 1-line reason explaining why.
Startups:
${topStartups.map((s, i) => `${i+1}. ID: ${s.id}, Name: ${s.name}, Industry: ${s.industry}, Description: ${s.description}, Raising: ${s.raising}`).join('\n')}

Output strictly a JSON array of objects with exactly these keys: "id" (number), "score" (number), "reason" (string).`;

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.4, maxOutputTokens: 1024, responseMimeType: "application/json" }
                    })
                });

                if (!response.ok) throw new Error("API Limit");
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                const aiScores = JSON.parse(text);

                topStartups.forEach(s => {
                    const aiMatch = aiScores.find(a => String(a.id) === String(s.id));
                    if (aiMatch) {
                        s.matchScore = aiMatch.score;
                        s.matchReason = aiMatch.reason;
                    } else {
                        s.matchScore = s.localScore + Math.floor(Math.random() * 15);
                        s.matchReason = "Matched based on industry focus.";
                    }
                });

                topStartups.sort((a,b) => b.matchScore - a.matchScore);
                investorAIMatchCache = topStartups;
                renderMatchedCards(topStartups);

            } catch(error) {
                console.warn("AI Match Error - Using local fallback:", error);
                topStartups.forEach(s => {
                    s.matchScore = s.localScore + Math.floor(Math.random() * 15);
                    s.matchReason = "Strong synergy with your portfolio thesis based on industry and stage.";
                });
                topStartups.sort((a,b) => b.matchScore - a.matchScore);
                investorAIMatchCache = topStartups;
                renderMatchedCards(topStartups);
            }
        }

        function renderMatchedCards(startups) {
            const container = document.getElementById('ai-explore-container');
            if (!container) return;

            container.innerHTML = startups.map(startup => {
                const isSaved = watchlistIds.includes(startup.id);
                
                // Calculate matched talents for this startup
                const matchedTalents = talentsList.map(t => {
                    return { ...t, matchScore: getAISkillMatch(startup.skillsNeeded, t.skills) };
                }).filter(t => t.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore).slice(0, 2);
                
                let teamHtml = '';
                if (matchedTalents.length > 0) {
                    teamHtml = `
                        <div class="mt-4 pt-4 border-t border-gray-700/50 mb-4">
                            <p class="text-xs text-gray-400 mb-2 font-semibold">Top Matched Talent for this Idea:</p>
                            <div class="space-y-2">
                                ${matchedTalents.map(t => `
                                    <div class="flex items-center justify-between bg-gray-900/40 p-2 rounded-lg border border-gray-700/30">
                                        <div class="flex items-center gap-2">
                                            ${t.picture ? `<img src="${t.picture}" class="w-6 h-6 rounded-full object-cover">` : `<div class="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300">${t.avatar}</div>`}
                                            <span class="text-xs font-medium text-gray-200">${t.name}</span>
                                        </div>
                                        <div class="flex gap-2 items-center">
                                            <span class="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">${t.matchScore}% Match</span>
                                            ${typeof window.viewCommunityProfile !== 'undefined' ? `<button onclick="viewCommunityProfile('${t.id}', 'Job Seeker')" class="text-[10px] bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded">View</button>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="bg-gray-800/40 rounded-2xl border ${startup.matchScore >= 80 ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-gray-700/50'} p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden">
                        ${startup.matchScore >= 85 ? '<div class="absolute -right-10 top-5 bg-indigo-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-lg">HIGH MATCH</div>' : ''}
                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                ${startup.picture 
                                    ? '<img src="' + startup.picture + '" class="w-14 h-14 rounded-xl object-cover border border-gray-600">'
                                    : '<div class="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-600">' + startup.name[0] + '</div>'
                                }
                                <div>
                                    <h3 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">${startup.name}</h3>
                                    <p class="text-sm text-gray-400">Founder: <span class="text-gray-300 font-medium">${startup.founder}</span></p>
                                </div>
                            </div>
                            <span class="bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-500/20">${startup.matchScore}% Match</span>
                        </div>
                        
                        <div class="flex gap-2 mb-3">
                            <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.industry}</span>
                            <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.stage}</span>
                        </div>

                        ${startup.matchReason ? '<p class="text-xs text-indigo-300 mb-3 bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/20"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>' + startup.matchReason + '</p>' : ''}

                        <p class="text-sm text-gray-300 mb-4 line-clamp-3 flex-grow">${startup.description}</p>
                        
                        ${teamHtml}

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
                            <button onclick="toggleWatchlist(${startup.id})" class="p-3 border border-gray-600 rounded-xl hover:bg-gray-700 transition text-gray-400 flex items-center justify-center shrink-0 bg-gray-900" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}">
                                <i data-lucide="heart" class="w-5 h-5 ${isSaved ? 'fill-red-400 text-red-400' : ''}"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        // New Section: Explore Startups (Using AI Match)
        function renderExplore() {
            if (startupList.length === 0) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <i data-lucide="compass" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-2">No Startups to Match Yet</h2>
                        <p class="text-gray-400">When founders create their profiles and ideas, AI matches will appear here.</p>
                    </div>`;
            }
            
            // Trigger AI Match generation asynchronously to not block UI rendering
            setTimeout(generateAIStartupMatches, 100);

            return `
                <div class="space-y-6">
                    <div class="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p class="text-indigo-200 text-sm">
                            <i data-lucide="sparkles" class="w-4 h-4 inline-block mr-1"></i>
                            AI recommends these startups based on your focus in <strong>${profileData.industryFocus.join(', ')}</strong>.
                        </p>
                    </div>

                    <div id="ai-explore-container" class="grid lg:grid-cols-2 gap-6">
                        <div class="col-span-full py-20 flex flex-col items-center justify-center">
                            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-indigo-400 font-medium animate-pulse">AI is analyzing startup pitch decks based on your thesis...</p>
                        </div>
                    </div>
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
                            
                            // Calculate matched talents for this specific startup
                            const matchedTalents = talentsList.map(t => {
                                return { ...t, matchScore: getAISkillMatch(startup.skillsNeeded, t.skills) };
                            }).filter(t => t.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore).slice(0, 3);
                            
                            let teamHtml = '';
                            if (matchedTalents.length > 0) {
                                teamHtml = `
                                    <div class="mt-6 border-t border-gray-700/50 pt-6">
                                        <h4 class="text-white font-bold text-lg mb-4 flex items-center"><i data-lucide="users" class="w-5 h-5 text-green-400 mr-2"></i> AI Matched Talent (Potential Team)</h4>
                                        <div class="grid gap-3">
                                            ${matchedTalents.map(t => `
                                                <div class="bg-gray-900/60 p-3 rounded-xl border border-gray-700/50 flex items-center justify-between">
                                                    <div class="flex items-center gap-3">
                                                        ${t.picture ? `<img src="${t.picture}" class="w-10 h-10 rounded-full object-cover border border-gray-600">` : `<div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-300 border border-gray-600">${t.avatar}</div>`}
                                                        <div>
                                                            <p class="text-sm font-bold text-white">${t.name}</p>
                                                            <p class="text-xs text-gray-400">${t.role}</p>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <span class="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded">${t.matchScore}% Match</span>
                                                        ${typeof window.viewCommunityProfile !== 'undefined' ? `<button onclick="viewCommunityProfile('${t.id}', 'Job Seeker')" class="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 transition-colors">Profile</button>` : ''}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            } else if (startup.skillsNeeded && startup.skillsNeeded.length > 0) {
                                 teamHtml = `
                                    <div class="mt-6 border-t border-gray-700/50 pt-6">
                                        <h4 class="text-white font-bold text-lg mb-4 flex items-center"><i data-lucide="users" class="w-5 h-5 text-green-400 mr-2"></i> AI Matched Talent (Potential Team)</h4>
                                        <p class="text-sm text-gray-500 italic">No job seekers match these skills yet.</p>
                                    </div>
                                `;
                            }
                            
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
                                            ${typeof window.viewCommunityProfile !== 'undefined' ? `<button onclick="viewCommunityProfile('${startup.firebaseKey}','Founder')" class="flex-1 invest-btn text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">View Profile</button>` : ''}
                                            ${startup.email ? '<button onclick="requestPitch(' + startup.id + ')" class="flex-1 border border-indigo-500/40 text-indigo-300 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500/10 transition">Contact Founder</button>' : ''}
                                            <button onclick="toggleWatchlist(${startup.id})" class="p-2.5 border border-gray-600 rounded-xl hover:bg-gray-700 transition text-gray-400 flex items-center justify-center bg-gray-900" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}">
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
                                        
                                        ${teamHtml}
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

        function renderPortfolio() {
            const startupOptions = startupList.filter(s => s.hasIdea).map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.founder)})</option>`).join('');

            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex justify-end mb-6">
                        <button onclick="openAddInvestmentModal()" class="btn-highlight-purple text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg">
                            <i data-lucide="plus" class="w-4 h-4"></i> Log Investment
                        </button>
                    </div>

                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
                        <div class="overflow-x-auto">
                        <table class="w-full text-left min-w-[700px]">
                            <thead class="bg-gray-900/80 border-b border-gray-700/50">
                                <tr>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Startup</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Invested Date</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Amount Invested</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Current Valuation</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700/30">
                                ${portfolio.length === 0 ? `<tr><td colspan="5" class="p-12 text-center text-gray-400"><div class="flex flex-col items-center"><i data-lucide="briefcase" class="w-12 h-12 text-gray-600 mb-3"></i><p>No active investments logged yet.</p><button onclick="openAddInvestmentModal()" class="mt-4 text-indigo-400 hover:text-indigo-300 font-medium hover:underline">Log your first investment</button></div></td></tr>` : ''}
                                ${portfolio.map(inv => {
                                    const startup = getStartupDetails(Number(inv.startupId));
                                    return `
                                    <tr class="hover:bg-gray-800/60 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                ${startup && startup.picture ? `<img src="${startup.picture}" class="w-10 h-10 rounded-lg object-cover border border-gray-700">` : `<div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center font-bold text-white border border-gray-600">${startup ? startup.name[0] : 'U'}</div>`}
                                                <div>
                                                    <p class="font-bold text-white">${startup ? startup.name : 'Unknown Startup'}</p>
                                                    <p class="text-xs text-gray-400">${startup ? startup.industry : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-300">${inv.date}</td>
                                        <td class="px-6 py-4 font-medium text-white">$${Number(inv.amountInvested).toLocaleString()}</td>
                                        <td class="px-6 py-4 font-bold text-green-400">$${Number(inv.currentValuation).toLocaleString()}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="deleteInvestment(${inv.id})" class="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove log"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                        </div>
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
                                <div class="bg-gray-800/40 rounded-2xl border border-indigo-500/30 p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden shadow-lg">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="flex items-center gap-4">
                                            ${startup.picture 
                                                ? '<img src="' + startup.picture + '" class="w-14 h-14 rounded-xl object-cover border border-gray-600">'
                                                : '<div class="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-600">' + startup.name[0] + '</div>'
                                            }
                                            <div>
                                                <h3 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">${startup.name}</h3>
                                                <p class="text-sm text-gray-400">Founder: <span class="text-gray-300 font-medium">${startup.founder}</span></p>
                                            </div>
                                        </div>
                                        <button onclick="toggleWatchlist(${startup.id})" class="p-2 border border-gray-600 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition text-red-400 flex items-center justify-center shrink-0 bg-red-500/10" title="Remove from Watchlist">
                                            <i data-lucide="heart" class="w-4 h-4 fill-current"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="flex gap-2 mb-3">
                                        <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.industry}</span>
                                        <span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">${startup.stage}</span>
                                    </div>

                                    <p class="text-sm text-gray-300 mb-6 line-clamp-3 flex-grow">${startup.description || 'No description provided.'}</p>

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

                                    <div class="mt-auto flex gap-3">
                                        ${typeof window.viewCommunityProfile !== 'undefined' ? `<button onclick="viewCommunityProfile('${startup.firebaseKey}','Founder')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors text-center shadow-lg border border-gray-600">Profile</button>` : ''}
                                        <button onclick="requestPitch(${startup.id})" class="flex-1 invest-btn text-white py-2.5 rounded-xl font-bold text-sm shadow-lg">Pitch Deck</button>
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
        
        updateHeaderAvatar();
        
        // Start community listener FIRST for fastest post loading
        if (typeof window.fetchCommunityPosts === "function") {
            window.fetchCommunityPosts();
        }
        
        // Render community tab immediately with cached data
        setTab('community');
        
        // Load real founders data from Firebase and update
        Promise.all([
            fetchFoundersFromFirebase(),
            fetchJobSeekersFromFirebase() // Call to fetch talents alongside founders
        ]).then(function() {
            renderContent();
        }).catch(function() {
            renderContent();
        });

        // --- PRELOADER ---
        window.addEventListener('load', function() {
            setTimeout(function() {
                var p = document.getElementById('foundera-preloader');
                if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
            }, 1200);
        });