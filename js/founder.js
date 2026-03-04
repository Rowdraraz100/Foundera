// --- DATA ---
        let currentTab = 'overview';
        let currentDataId = null; 
        
        // --- PROFILE DATA (No demo defaults — only name/email from signup, rest filled manually) ---
        let profileData = {
            name: localStorage.getItem('founderName') || '',
            email: localStorage.getItem('founderEmail') || '',
            linkedin: localStorage.getItem('founderLinkedin') || '',
            github: localStorage.getItem('founderGithub') || '',
            bio: localStorage.getItem('founderBio') || '',
            skills: localStorage.getItem('founderSkills') || '',
            availability: localStorage.getItem('founderAvailability') || '',
            picture: localStorage.getItem('founderPicture') || ''
        };
        
        // --- LOGOUT FUNCTION ---
        function handleLogout() {
            // Sign out Firebase Auth
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(function(){});
            }
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
            localStorage.removeItem('pendingSignup');
            
            // Redirect to main page
            window.location.href = 'index.html';
        }
        
        // --- SAVE PROFILE TO LOCALSTORAGE + FIREBASE ---
        function saveProfileToStorage() {
            localStorage.setItem('founderName', profileData.name);
            localStorage.setItem('founderEmail', profileData.email);
            localStorage.setItem('founderLinkedin', profileData.linkedin);
            localStorage.setItem('founderGithub', profileData.github);
            localStorage.setItem('founderBio', profileData.bio);
            localStorage.setItem('founderSkills', profileData.skills);
            localStorage.setItem('founderAvailability', profileData.availability);
            localStorage.setItem('founderPicture', profileData.picture);
            
            // Also save to Firebase
            saveFounderProfileToFirebase();
        }
        
        // --- SAVE FOUNDER PROFILE TO FIREBASE ---
        function saveFounderProfileToFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
            if (!safeKey) return;
            var db = firebase.database();
            var founderData = {
                name: profileData.name,
                email: profileData.email,
                linkedin: profileData.linkedin,
                github: profileData.github,
                bio: profileData.bio,
                skills: profileData.skills,
                availability: profileData.availability,
                picture: profileData.picture || '',
                role: 'Founder',
                profileUpdatedAt: new Date().toISOString()
            };
            db.ref('users/founders/' + safeKey).update(founderData)
                .then(function() { console.log('Founder profile saved to Firebase'); })
                .catch(function(e) { console.error('Firebase save error:', e); });
        }

        // --- LOAD FOUNDER PROFILE FROM FIREBASE ---
        function loadFounderProfileFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return Promise.resolve();
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            return firebase.database().ref('users/founders/' + safeKey).once('value').then(function(snap) {
                var data = snap.val();
                if (data) {
                    profileData.name = data.name || profileData.name;
                    profileData.email = data.email || profileData.email;
                    profileData.linkedin = data.linkedin || '';
                    profileData.github = data.github || '';
                    profileData.bio = data.bio || '';
                    profileData.skills = data.skills || '';
                    profileData.availability = data.availability || '';
                    profileData.picture = data.picture || '';
                    // Sync to localStorage
                    localStorage.setItem('founderName', profileData.name);
                    localStorage.setItem('founderEmail', profileData.email);
                    localStorage.setItem('founderLinkedin', profileData.linkedin);
                    localStorage.setItem('founderGithub', profileData.github);
                    localStorage.setItem('founderBio', profileData.bio);
                    localStorage.setItem('founderSkills', profileData.skills);
                    localStorage.setItem('founderAvailability', profileData.availability);
                    localStorage.setItem('founderPicture', profileData.picture);
                    // Update header avatar
                    updateHeaderAvatar();
                    console.log('Founder profile loaded from Firebase');
                }
            }).catch(function(e) { console.error('Firebase load error:', e); });
        }

        // --- UPDATE HEADER AVATAR (photo or initial) ---
        function updateHeaderAvatar() {
            var avatarEl = document.getElementById('header-avatar-container');
            var initialEl = document.getElementById('user-initial');
            if (profileData.picture) {
                if (avatarEl) {
                    avatarEl.innerHTML = '<img src="' + profileData.picture + '" alt="Profile" class="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50">';
                }
            } else if (initialEl) {
                initialEl.textContent = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'F';
            }
        }

        // --- HANDLE PROFILE PHOTO UPLOAD ---
        function handleProfilePhotoUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPG, PNG, etc.)');
                return;
            }
            // Validate file size (max 500KB for base64 in Realtime DB)
            if (file.size > 512000) {
                alert('Image size must be under 500KB. Please compress your image and try again.');
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                var base64 = e.target.result;
                profileData.picture = base64;
                localStorage.setItem('founderPicture', base64);
                // Update profile photo preview
                var preview = document.getElementById('profile-photo-preview');
                if (preview) {
                    preview.innerHTML = '<img src="' + base64 + '" alt="Profile" class="w-28 h-28 rounded-full object-cover">';
                }
                updateHeaderAvatar();
            };
            reader.readAsDataURL(file);
        }

        // --- REMOVE PROFILE PHOTO ---
        function removeProfilePhoto() {
            profileData.picture = '';
            localStorage.removeItem('founderPicture');
            var preview = document.getElementById('profile-photo-preview');
            if (preview) {
                var initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'F';
                preview.innerHTML = '<div class="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">' + initial + '</div>';
            }
            updateHeaderAvatar();
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

        // --- SAVE IDEA TO FIREBASE REALTIME DB ---
        function saveIdeaToFirebase(idea) {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return;
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            
            // Save full idea data under founder's profile
            var ideaData = {
                startupName: idea.title,
                description: idea.description,
                problem: idea.problem || '',
                vision: idea.vision || '',
                businessPlan: idea.businessPlan || '',
                skillsNeeded: idea.skillsNeeded || [],
                industry: idea.industry || '',
                fundingNeeded: idea.fundingNeeded || 'Not Disclosed',
                status: idea.status || 'Active',
                postedAt: new Date().toISOString()
            };
            
            // Update founder profile with startup info (visible to seekers/investors)
            db.ref('users/founders/' + safeKey).update({
                startupName: idea.title,
                industry: idea.industry,
                problem: idea.problem || '',
                vision: idea.vision || '',
                businessPlan: idea.businessPlan || '',
                skillsNeeded: idea.skillsNeeded || [],
                fundingNeeded: idea.fundingNeeded || 'Not Disclosed',
                ideaDescription: idea.description,
                ideaStatus: idea.status || 'Active',
                ideaPostedAt: new Date().toISOString()
            }).then(function() {
                console.log('Idea saved to founder profile in Firebase');
            }).catch(function(e) { console.error('Firebase idea save error:', e); });
            
            // Also save to separate global ideas node (for cross-platform queries)
            db.ref('ideas/' + safeKey).set(ideaData)
                .then(function() { console.log('Idea saved to global ideas node'); })
                .catch(function(e) { console.error('Firebase global idea save error:', e); });
        }

        // --- DELETE IDEA FROM FIREBASE ---
        function deleteIdeaFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return;
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            
            // Remove idea fields from founder profile
            db.ref('users/founders/' + safeKey).update({
                startupName: null,
                industry: null,
                problem: null,
                vision: null,
                businessPlan: null,
                skillsNeeded: null,
                fundingNeeded: null,
                ideaDescription: null,
                ideaStatus: null,
                ideaPostedAt: null
            });
            // Remove from global ideas node
            db.ref('ideas/' + safeKey).remove();
            console.log('Idea deleted from Firebase');
        }

        // --- LOAD IDEA FROM FIREBASE (on page load) ---
        function loadIdeaFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return Promise.resolve();
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            return firebase.database().ref('ideas/' + safeKey).once('value').then(function(snap) {
                var data = snap.val();
                if (data && data.startupName) {
                    // Rebuild idea from Firebase
                    var firebaseIdea = {
                        id: Date.now(),
                        title: data.startupName,
                        description: data.description || '',
                        problem: data.problem || '',
                        vision: data.vision || '',
                        businessPlan: data.businessPlan || '',
                        skillsNeeded: Array.isArray(data.skillsNeeded) ? data.skillsNeeded : (data.skillsNeeded ? String(data.skillsNeeded).split(',').map(function(s){return s.trim();}) : []),
                        industry: data.industry || '',
                        fundingNeeded: data.fundingNeeded || 'Not Disclosed',
                        status: data.status || 'Active',
                        views: 0,
                        applications: 0
                    };
                    // Only load if local is empty (Firebase is source of truth)
                    if (ideas.length === 0) {
                        ideas = [firebaseIdea];
                        saveIdeasToStorage();
                    }
                    console.log('Idea loaded from Firebase: ' + firebaseIdea.title);
                }
            }).catch(function(e) { console.error('Firebase idea load error:', e); });
        }

        // --- AI SKILL MATCHING (Enhanced with free Gemini API) ---
        let aiMatchCache = {};
        
        function getAISkillMatch(ideaSkills, talentSkills) {
            // Local matching: exact + partial match scoring
            var exactMatches = 0;
            var partialMatches = 0;
            var ideaLower = ideaSkills.map(function(s) { return s.toLowerCase().trim(); });
            var talentLower = talentSkills.map(function(s) { return s.toLowerCase().trim(); });
            
            ideaLower.forEach(function(needed) {
                talentLower.forEach(function(has) {
                    if (needed === has) {
                        exactMatches++;
                    } else if (needed.includes(has) || has.includes(needed)) {
                        partialMatches++;
                    }
                });
            });
            
            // Weighted score: exact matches worth more
            var totalNeeded = ideaSkills.length || 1;
            var score = Math.round(((exactMatches * 1.0 + partialMatches * 0.5) / totalNeeded) * 100);
            return Math.min(score, 100);
        }

        // Use free Gemini API for smart AI matching analysis
        async function getGeminiAIMatches(idea, talentList) {
            var cacheKey = idea.id + '_' + talentList.length;
            if (aiMatchCache[cacheKey]) return aiMatchCache[cacheKey];
            
            // First do local matching
            var localMatches = talentList.map(function(t) {
                var score = getAISkillMatch(idea.skillsNeeded, t.skills);
                return Object.assign({}, t, { matchScore: score, matchReason: 'Skill-based match' });
            }).filter(function(t) { return t.matchScore > 0; }).sort(function(a,b) { return b.matchScore - a.matchScore; });
            
            // Try Gemini API for enhanced matching (free tier)
            try {
                var GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng';
                var prompt = 'You are an AI startup talent matcher. A startup needs these skills: ' + idea.skillsNeeded.join(', ') + '. ' +
                    'The startup is in ' + idea.industry + ' industry. ' +
                    'Here are available candidates with their skills: ' + 
                    localMatches.slice(0, 10).map(function(t, i) { return (i+1) + '. ' + t.name + ' - Skills: ' + t.skills.join(', '); }).join('; ') + '. ' +
                    'Rate each candidate 0-100 for fit and give a one-line reason. Return ONLY valid JSON array like: [{"name":"...","score":85,"reason":"..."}]';
                    
                var response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
                    })
                });
                var result = await response.json();
                var text = result.candidates[0].content.parts[0].text;
                // Extract JSON from response
                var jsonMatch = text.match(/\[.*\]/s);
                if (jsonMatch) {
                    var aiResults = JSON.parse(jsonMatch[0]);
                    // Merge AI scores with local matches
                    localMatches = localMatches.map(function(t) {
                        var aiMatch = aiResults.find(function(a) { return a.name === t.name; });
                        if (aiMatch) {
                            t.matchScore = Math.round((t.matchScore * 0.3 + aiMatch.score * 0.7));
                            t.matchReason = aiMatch.reason || t.matchReason;
                        }
                        return t;
                    }).sort(function(a,b) { return b.matchScore - a.matchScore; });
                    console.log('Gemini AI matching completed successfully');
                }
            } catch(e) {
                console.log('Gemini API unavailable, using local skill matching:', e.message);
            }
            
            aiMatchCache[cacheKey] = localMatches;
            return localMatches;
        }
        
        // Ideas array - will be loaded from localStorage
        let ideas = [];

        // Real data from Firebase — loaded dynamically
        let talents = [];
        let investors = [];
        let firebaseDataLoaded = false;

        // --- FETCH REAL JOB SEEKERS FROM FIREBASE ---
        function fetchJobSeekersFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/jobseekers').once('value').then(function(snap) {
                var data = snap.val();
                talents = [];
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        var s = data[key];
                        talents.push({
                            id: key,
                            name: s.name || 'Unknown',
                            role: s.title || 'Job Seeker',
                            skills: Array.isArray(s.skills) ? s.skills : (s.skills ? String(s.skills).split(',').map(function(sk) { return sk.trim(); }) : []),
                            experience: s.experience || 'N/A',
                            rating: s.rating || 0,
                            projects: s.projects || 0,
                            available: s.availability === 'Immediately' || s.availability === 'Available',
                            avatar: (s.name || 'U').charAt(0).toUpperCase(),
                            email: s.email || '',
                            linkedin: s.linkedin || '',
                            github: s.github || '',
                            bio: s.bio || '',
                            location: s.location || '',
                            expectedSalary: s.expectedSalary || '',
                            profilePic: s.profilePic || '',
                            coverPic: s.coverPic || '',
                            cvBase64: s.cvBase64 || '',
                            cvFileName: s.cvFileName || '',
                            experiences: Array.isArray(s.experiences) ? s.experiences : [],
                            education: Array.isArray(s.education) ? s.education : [],
                            certificates: Array.isArray(s.certificates) ? s.certificates : []
                        });
                    });
                }
                console.log('Loaded ' + talents.length + ' job seekers from Firebase');
            });
        }

        // --- FETCH REAL INVESTORS FROM FIREBASE ---
        function fetchInvestorsFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/investors').once('value').then(function(snap) {
                var data = snap.val();
                investors = [];
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        var inv = data[key];
                        investors.push({
                            id: key,
                            name: inv.name || 'Unknown Investor',
                            focus: Array.isArray(inv.industryFocus) ? inv.industryFocus : (inv.industryFocus ? String(inv.industryFocus).split(',').map(function(f) { return f.trim(); }) : []),
                            ticketSize: inv.ticketSize || 'Not specified',
                            totalInvested: inv.totalInvested || '$0',
                            portfolio: inv.portfolio || 0,
                            interested: true,
                            email: inv.email || '',
                            linkedin: inv.linkedin || '',
                            bio: inv.bio || '',
                            title: inv.title || '',
                            location: inv.location || ''
                        });
                    });
                }
                console.log('Loaded ' + investors.length + ' investors from Firebase');
            });
        }

        // --- LOAD ALL FIREBASE DATA ---
        function loadFirebaseData() {
            return Promise.all([
                fetchJobSeekersFromFirebase(),
                fetchInvestorsFromFirebase()
            ]).then(function() {
                firebaseDataLoaded = true;
                // Re-render current content with real data
                renderContent();
            }).catch(function(e) {
                console.error('Error loading Firebase data:', e);
            });
        }

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
            profileData.name = fd.get('name') || '';
            profileData.email = fd.get('email') || '';
            profileData.linkedin = fd.get('linkedin') || '';
            profileData.github = fd.get('github') || '';
            profileData.bio = fd.get('bio') || '';
            profileData.skills = fd.get('skills') || '';
            profileData.availability = fd.get('availability');

            // Header avatar update
            updateHeaderAvatar();

            // Save to localStorage + Firebase
            saveProfileToStorage();

            alert('Profile saved successfully! Your updated info is now visible to talents and investors.');
            
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
            
            // Save to Firebase Realtime Database
            saveIdeaToFirebase(newIdea);
            
            // Update startup name display
            updateStartupNameDisplay();
            
            alert('Your startup idea "' + newIdea.title + '" has been posted and saved to the database! Job seekers and investors can now see it.');
            
            // Redirect directly to the Overview/Dashboard page
            setTab('overview');
        }

        function deleteIdea(id) {
            ideas = ideas.filter(i => i.id !== id);
            saveIdeasToStorage();
            deleteIdeaFromFirebase();
            updateStartupNameDisplay();
            currentDataId = null;
            setTab('post'); // Redirect to post idea if they delete it
        }

        function toggleIdeaStatus(id) {
            const idea = ideas.find(i => i.id === id);
            if(idea) {
                idea.status = idea.status === 'Active' ? 'Draft' : 'Active';
                saveIdeasToStorage();
                saveIdeaToFirebase(idea);
                renderContent();
            }
        }

        // --- UPDATE STARTUP NAME DISPLAY ---
        function updateStartupNameDisplay() {
            var nameEl = document.getElementById('startup-name-display');
            if (nameEl) {
                if (ideas.length > 0 && ideas[0].title) {
                    nameEl.innerHTML = '<i data-lucide="rocket" class="w-4 h-4 mr-1.5 text-blue-400"></i><span class="text-blue-300 font-medium text-sm truncate">' + ideas[0].title + '</span>';
                    nameEl.classList.remove('hidden');
                    lucide.createIcons();
                } else {
                    nameEl.classList.add('hidden');
                }
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
                            <span class="text-3xl font-bold text-white">${investors.length}</span>
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

            // Enhanced AI Matching: local + Gemini
            const matchedTalentsLocal = talents.map(t => {
                const score = getAISkillMatch(idea.skillsNeeded, t.skills);
                return { ...t, matchScore: score, matchReason: 'Skill-based match' };
            }).filter(t => t.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore);

            const matchedInvestors = investors.filter(i => i.focus.some(f => f.toLowerCase().includes(idea.industry.toLowerCase()) || idea.industry.toLowerCase().includes(f.toLowerCase())));

            // Trigger async Gemini AI matching (will update UI when ready)
            if (talents.length > 0) {
                getGeminiAIMatches(idea, talents).then(function(aiMatches) {
                    var container = document.getElementById('ai-talent-matches');
                    if (container && aiMatches.length > 0) {
                        container.innerHTML = aiMatches.map(function(t) {
                            return '<div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">' +
                                '<div class="flex items-center justify-between">' +
                                    '<div class="flex items-center">' +
                                        '<div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600">' + t.avatar + '</div>' +
                                        '<div>' +
                                            '<h5 class="font-bold text-sm text-white">' + t.name + '</h5>' +
                                            '<p class="text-xs text-gray-400">' + t.role + '</p>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="text-right flex items-center gap-2">' +
                                        '<span class="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">' + t.matchScore + '%</span>' +
                                        (t.email ? '<a href="mailto:' + t.email + '" class="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-2 py-1 rounded" title="Email ' + t.name + '"><i data-lucide="mail" class="w-3 h-3 inline"></i></a>' : '') +
                                    '</div>' +
                                '</div>' +
                                (t.matchReason ? '<p class="text-xs text-purple-300 mt-2 bg-purple-500/10 px-3 py-1.5 rounded-lg"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>' + t.matchReason + '</p>' : '') +
                            '</div>';
                        }).join('');
                        lucide.createIcons();
                    }
                });
            }

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
                                <div id="ai-talent-matches" class="space-y-4">
                                    ${matchedTalentsLocal.length > 0 ? matchedTalentsLocal.map(t => `
                                        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center">
                                                    <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600">${t.avatar}</div>
                                                    <div>
                                                        <h5 class="font-bold text-sm text-white">${t.name}</h5>
                                                        <p class="text-xs text-gray-400">${t.role}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right flex items-center gap-2">
                                                    <span class="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">${t.matchScore}%</span>
                                                    ${t.email ? `<a href="mailto:${t.email}" class="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-2 py-1 rounded" title="Email ${t.name}"><i data-lucide="mail" class="w-3 h-3 inline"></i></a>` : ''}
                                                </div>
                                            </div>
                                            ${t.matchReason ? `<p class="text-xs text-purple-300 mt-2 bg-purple-500/10 px-3 py-1.5 rounded-lg"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>${t.matchReason}</p>` : ''}
                                        </div>
                                    `).join('') : '<p class="text-sm text-gray-500 italic">No matching talent found yet. When job seekers join Foundera, matches will appear here.</p>'}
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
                                            <div class="flex items-center gap-2">
                                                ${inv.email ? `<a href="mailto:${inv.email}" class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition-colors">Pitch</a>` : `<span class="bg-gray-700 px-3 py-2 rounded-lg text-xs text-gray-400">No Contact</span>`}
                                            </div>
                                        </div>
                                    `).join('') : '<p class="text-sm text-gray-500 italic">No matching investors found yet. When investors join Foundera, matches will appear here.</p>'}
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
            var initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'F';
            var photoHTML = profileData.picture 
                ? '<img src="' + profileData.picture + '" alt="Profile" class="w-28 h-28 rounded-full object-cover">'
                : '<div class="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">' + initial + '</div>';
            
            var headerPhotoHTML = profileData.picture
                ? '<img src="' + profileData.picture + '" alt="Profile" class="w-24 h-24 rounded-full object-cover border-4 border-gray-800">'
                : '<div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-gray-800 text-white">' + initial + '</div>';

            // Social links — only show if filled
            var socialBtns = '';
            if (profileData.github) socialBtns += '<a href="' + profileData.github + '" target="_blank" class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white border border-gray-600"><i data-lucide="github" class="w-4 h-4 mr-2"></i> GitHub</a>';
            if (profileData.linkedin) socialBtns += '<a href="' + profileData.linkedin + '" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>';
            if (profileData.email) socialBtns += '<a href="mailto:' + profileData.email + '" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white shadow-lg shadow-red-500/20"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Email</a>';
            if (!socialBtns) socialBtns = '<span class="text-gray-500 text-sm italic">Add your links below and save to see them here</span>';

            return `
                <div class="max-w-4xl space-y-6 animate-fade-in">
                    <!-- Profile Header -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="relative group">
                                ${headerPhotoHTML}
                            </div>
                            <div class="flex-1 text-center md:text-left">
                                <h2 class="text-3xl font-bold mb-1 text-white">${profileData.name || '<span class="text-gray-500">Your Name</span>'}</h2>
                                <p class="text-blue-400 font-medium mb-3">Founder</p>
                                ${profileData.bio ? '<p class="text-gray-400 text-sm max-w-md">' + profileData.bio.substring(0, 120) + (profileData.bio.length > 120 ? '...' : '') + '</p>' : '<p class="text-gray-500 text-sm italic">No bio yet — add one below</p>'}
                            </div>
                            <div class="flex gap-3 flex-wrap justify-center">
                                ${socialBtns}
                            </div>
                        </div>
                    </div>

                    <!-- Photo Upload Section -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="mb-6 border-b border-gray-700 pb-4">
                            <h3 class="font-bold text-xl text-white flex items-center"><i data-lucide="camera" class="w-5 h-5 mr-2 text-blue-400"></i> Profile Photo</h3>
                            <p class="text-sm text-gray-400 mt-1">Upload a photo (max 500KB, JPG/PNG). This will be saved to the database.</p>
                        </div>
                        <div class="flex flex-col sm:flex-row items-center gap-6">
                            <div id="profile-photo-preview" class="relative">
                                ${photoHTML}
                            </div>
                            <div class="flex flex-col gap-3">
                                <label class="cursor-pointer founder-btn text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center hover:scale-105 transition-transform">
                                    <i data-lucide="upload" class="w-5 h-5 mr-2"></i> Upload Photo
                                    <input type="file" accept="image/*" onchange="handleProfilePhotoUpload(this)" class="hidden">
                                </label>
                                ${profileData.picture ? '<button onclick="removeProfilePhoto()" class="text-red-400 hover:text-red-300 text-sm font-medium flex items-center transition-colors"><i data-lucide="trash-2" class="w-4 h-4 mr-1"></i> Remove Photo</button>' : ''}
                                <p class="text-gray-500 text-xs">Photo will be saved when you click "Save Changes"</p>
                            </div>
                        </div>
                    </div>

                    <!-- Personal Information Form -->
                    <form onsubmit="saveProfile(event)" class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="mb-6 border-b border-gray-700 pb-4">
                            <h3 class="font-bold text-xl text-white">Update Profile</h3>
                            <p class="text-sm text-gray-400 mt-1">Fill in your details. All information will be saved to the database when you click Save Changes.</p>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input type="text" name="name" value="${profileData.name}" required placeholder="Enter your full name" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600">
                            </div>
                            
                            <div class="md:col-span-2 mt-4">
                                <h4 class="text-white font-bold flex items-center"><i data-lucide="link" class="w-5 h-5 mr-2 text-blue-400"></i> Contact Links</h4>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-red-400 mb-2">Email Address</label>
                                <input type="email" name="email" value="${profileData.email}" required placeholder="you@example.com" class="w-full px-4 py-3 bg-gray-900 border border-red-500/50 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white placeholder-gray-600">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-blue-400 mb-2">LinkedIn Profile Link</label>
                                <input type="url" name="linkedin" placeholder="https://linkedin.com/in/username" value="${profileData.linkedin}" class="w-full px-4 py-3 bg-gray-900 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">GitHub Profile Link</label>
                                <input type="url" name="github" placeholder="https://github.com/username" value="${profileData.github}" class="w-full px-4 py-3 bg-gray-900 border border-gray-500/50 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none text-white placeholder-gray-600">
                            </div>

                            <div class="md:col-span-2 mt-4">
                                <h4 class="text-white font-bold flex items-center"><i data-lucide="info" class="w-5 h-5 mr-2 text-green-400"></i> Professional Details</h4>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-400 mb-2">About You (Bio)</label>
                                <textarea name="bio" rows="3" placeholder="Write a short bio about your experience and vision..." class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600">${profileData.bio}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Skills & Expertise</label>
                                <input type="text" name="skills" value="${profileData.skills}" placeholder="e.g. Product Strategy, UI/UX, Marketing" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-2">Available for Co-founding?</label>
                                <select name="availability" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                                    <option value="" ${!profileData.availability ? 'selected' : ''} disabled>Select an option</option>
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

        // --- VIEW FULL SEEKER PROFILE ---
        function viewSeekerProfile(talentId) {
            var t = talents.find(function(x) { return x.id === talentId; });
            if (!t) return;
            var modal = document.createElement('div');
            modal.id = 'seeker-profile-modal';
            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto';
            modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
            
            var profilePicHTML = t.profilePic 
                ? '<img src="' + t.profilePic + '" alt="' + t.name + '" class="w-28 h-28 rounded-full object-cover border-4 border-gray-800 shadow-xl">'
                : '<div class="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-4 border-gray-800 flex items-center justify-center text-4xl font-bold text-white shadow-xl">' + t.avatar + '</div>';
            
            var coverStyle = t.coverPic 
                ? 'background-image: url(' + t.coverPic + '); background-size: cover; background-position: center;'
                : 'background: linear-gradient(135deg, #1f2937, #065f46, #1f2937);';
            
            var expHTML = t.experiences.length > 0 
                ? t.experiences.map(function(exp) {
                    return '<div class="flex items-start gap-3 border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">' +
                        '<div class="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0"><i data-lucide="briefcase" class="w-5 h-5 text-gray-400"></i></div>' +
                        '<div><h5 class="font-bold text-white">' + (exp.title || '') + '</h5>' +
                        '<p class="text-sm text-gray-300">' + (exp.company || '') + '</p>' +
                        '<p class="text-xs text-gray-500 mt-1">' + (exp.duration || '') + '</p>' +
                        (exp.description ? '<p class="text-xs text-gray-400 mt-2">' + exp.description + '</p>' : '') +
                        '</div></div>';
                }).join('')
                : '<p class="text-gray-500 text-sm italic">No experience added yet.</p>';
            
            var eduHTML = t.education.length > 0
                ? t.education.map(function(edu) {
                    return '<div class="flex items-start gap-3 border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">' +
                        '<div class="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0"><i data-lucide="graduation-cap" class="w-5 h-5 text-gray-400"></i></div>' +
                        '<div><h5 class="font-bold text-white">' + (edu.school || '') + '</h5>' +
                        '<p class="text-sm text-gray-300">' + (edu.degree || '') + '</p>' +
                        '<p class="text-xs text-gray-500 mt-1">' + (edu.duration || '') + '</p>' +
                        (edu.description ? '<p class="text-xs text-gray-400 mt-2">' + edu.description + '</p>' : '') +
                        '</div></div>';
                }).join('')
                : '<p class="text-gray-500 text-sm italic">No education added yet.</p>';
            
            var certHTML = t.certificates.length > 0
                ? t.certificates.map(function(cert) {
                    return '<div class="flex items-center justify-between border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">' +
                        '<div><h5 class="font-bold text-white text-sm">' + (cert.name || '') + '</h5>' +
                        '<p class="text-xs text-gray-400">' + (cert.issuer || '') + ' &bull; ' + (cert.year || '') + '</p></div>' +
                        '<span class="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Verified</span></div>';
                }).join('')
                : '<p class="text-gray-500 text-sm italic">No certifications added yet.</p>';
            
            var skillsHTML = t.skills.length > 0
                ? t.skills.map(function(s) { return '<span class="bg-gray-900 border border-gray-600 px-3 py-1.5 rounded-lg text-sm text-gray-200 font-medium">' + s + '</span>'; }).join('')
                : '<p class="text-gray-500 text-sm italic">No skills listed.</p>';
            
            var cvSection = '';
            if (t.cvBase64) {
                cvSection = '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">' +
                    '<h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="file-text" class="w-5 h-5 mr-2 text-green-400"></i> Resume / CV</h4>' +
                    '<div class="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">' +
                    '<div class="flex items-center"><i data-lucide="file-check" class="w-8 h-8 text-green-400 mr-3"></i><div><p class="text-white font-medium">' + (t.cvFileName || 'Resume.pdf') + '</p><p class="text-xs text-gray-500">PDF Document</p></div></div>' +
                    '<a href="' + t.cvBase64 + '" download="' + (t.cvFileName || t.name + '_CV.pdf') + '" class="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-colors"><i data-lucide="download" class="w-4 h-4"></i> Download CV</a>' +
                    '</div></div>';
            }
            
            var contactSection = '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">' +
                '<h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="phone" class="w-5 h-5 mr-2 text-blue-400"></i> Contact Information</h4>' +
                '<div class="grid sm:grid-cols-2 gap-4">' +
                (t.email ? '<a href="mailto:' + t.email + '" class="bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-3 transition-colors group"><div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><i data-lucide="mail" class="w-5 h-5 text-red-400"></i></div><div><p class="text-xs text-gray-500">Email</p><p class="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">' + t.email + '</p></div></a>' : '') +
                (t.linkedin ? '<a href="' + t.linkedin + '" target="_blank" class="bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-3 transition-colors group"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><i data-lucide="linkedin" class="w-5 h-5 text-blue-400"></i></div><div><p class="text-xs text-gray-500">LinkedIn</p><p class="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">View Profile</p></div></a>' : '') +
                (t.github ? '<a href="' + t.github + '" target="_blank" class="bg-gray-900/80 border border-gray-700 hover:border-gray-500/50 p-4 rounded-xl flex items-center gap-3 transition-colors group"><div class="w-10 h-10 bg-gray-600/30 rounded-lg flex items-center justify-center"><i data-lucide="github" class="w-5 h-5 text-gray-300"></i></div><div><p class="text-xs text-gray-500">GitHub</p><p class="text-sm text-white font-medium group-hover:text-gray-300 transition-colors">View Profile</p></div></a>' : '') +
                '</div></div>';
            
            modal.innerHTML = '<div class="bg-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-3xl my-8 overflow-hidden animate-fade-in">' +
                '<!-- Close Button -->' +
                '<button onclick="document.getElementById(\'seeker-profile-modal\').remove()" class="absolute top-6 right-6 z-20 bg-gray-800/90 hover:bg-gray-700 p-2 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700"><i data-lucide="x" class="w-5 h-5"></i></button>' +
                '<!-- Cover -->' +
                '<div class="h-44 relative" style="' + coverStyle + '">' +
                '<div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>' +
                '</div>' +
                '<!-- Profile Header -->' +
                '<div class="px-8 pb-6 relative -mt-16">' +
                '<div class="flex flex-col sm:flex-row items-start gap-5">' +
                '<div class="shrink-0">' + profilePicHTML + '</div>' +
                '<div class="flex-1 pt-2">' +
                '<h2 class="text-2xl font-bold text-white">' + t.name + '</h2>' +
                '<p class="text-green-400 font-medium text-lg">' + t.role + '</p>' +
                (t.location ? '<p class="text-gray-500 text-sm flex items-center mt-1"><i data-lucide="map-pin" class="w-4 h-4 mr-1"></i> ' + t.location + '</p>' : '') +
                (t.available ? '<span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">Available for hire</span>' : '') +
                '</div>' +
                '</div>' +
                '</div>' +
                '<!-- Body -->' +
                '<div class="px-8 pb-8 space-y-6">' +
                (t.bio ? '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6"><h4 class="font-bold text-lg text-white mb-3 flex items-center"><i data-lucide="user" class="w-5 h-5 mr-2 text-green-400"></i> About</h4><p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">' + t.bio + '</p></div>' : '') +
                '<!-- Skills -->' +
                '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6"><h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="code" class="w-5 h-5 mr-2 text-yellow-400"></i> Skills</h4><div class="flex flex-wrap gap-2">' + skillsHTML + '</div></div>' +
                '<!-- Experience -->' +
                '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6"><h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="briefcase" class="w-5 h-5 mr-2 text-blue-400"></i> Experience & Projects</h4><div class="space-y-4">' + expHTML + '</div></div>' +
                '<!-- Education -->' +
                '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6"><h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="graduation-cap" class="w-5 h-5 mr-2 text-purple-400"></i> Education</h4><div class="space-y-4">' + eduHTML + '</div></div>' +
                '<!-- Certifications -->' +
                '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6"><h4 class="font-bold text-lg text-white mb-4 flex items-center"><i data-lucide="award" class="w-5 h-5 mr-2 text-orange-400"></i> Certifications</h4><div class="space-y-3">' + certHTML + '</div></div>' +
                cvSection +
                contactSection +
                '</div></div>';
            
            document.body.appendChild(modal);
            lucide.createIcons();
        }

        function renderTalent() {
            if (!firebaseDataLoaded) {
                return '<div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50"><div class="w-12 h-12 rounded-full border-4 border-gray-700 loader mb-4 mx-auto"></div><p class="text-gray-400">Loading talent from database...</p></div>';
            }
            
            if (talents.length === 0) {
                return '<div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50"><i data-lucide="users" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i><h2 class="text-2xl font-bold text-white mb-2">No Job Seekers Found Yet</h2><p class="text-gray-400 mb-2">When job seekers create their profiles on Foundera, they will appear here.</p><p class="text-gray-500 text-sm">Share your startup idea to attract talent!</p></div>';
            }
            
            return `
                <div class="space-y-6">
                    <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-wrap gap-4 shadow-sm">
                        <div class="flex-1 min-w-[200px] relative">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                            <input type="text" id="talent-search-input" oninput="filterTalents()" placeholder="Search by name, skill, or location..." class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-white">
                        </div>
                    </div>

                    <p class="text-sm text-gray-400"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i> Showing <strong class="text-white">${talents.length}</strong> real job seekers from database</p>

                    <div id="talent-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${renderTalentCards(talents)}
                    </div>
                </div>
            `;
        }
        
        function renderTalentCards(talentList) {
            return talentList.map(function(talent) {
                var picHTML = talent.profilePic 
                    ? '<img src="' + talent.profilePic + '" alt="' + talent.name + '" class="w-14 h-14 rounded-full object-cover border-2 border-gray-600">'
                    : '<div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-lg text-white border-2 border-gray-600">' + talent.avatar + '</div>';
                
                return '<div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden card-hover shadow-lg group">' +
                    (talent.coverPic ? '<div class="h-24 bg-cover bg-center" style="background-image: url(' + talent.coverPic + ')"></div>' : '<div class="h-24 bg-gradient-to-r from-gray-800 to-green-900/40"></div>') +
                    '<div class="px-5 pb-5 -mt-7 relative">' +
                    '<div class="flex items-end justify-between mb-3">' +
                    picHTML +
                    '<span class="px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ' + (talent.available ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-400 border border-gray-600') + '">' + (talent.available ? 'Available' : 'Busy') + '</span>' +
                    '</div>' +
                    '<h3 class="font-bold text-white text-lg">' + talent.name + '</h3>' +
                    '<p class="text-sm text-gray-400 mb-2">' + talent.role + '</p>' +
                    (talent.location ? '<p class="text-xs text-gray-500 flex items-center mb-3"><i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>' + talent.location + '</p>' : '') +
                    (talent.bio ? '<p class="text-gray-400 text-xs mb-3 line-clamp-2">' + talent.bio + '</p>' : '') +
                    '<div class="flex flex-wrap gap-1.5 mb-4">' + talent.skills.slice(0, 5).map(function(skill) { return '<span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded">' + skill + '</span>'; }).join('') + (talent.skills.length > 5 ? '<span class="text-xs text-gray-500">+' + (talent.skills.length - 5) + ' more</span>' : '') + '</div>' +
                    '<div class="flex gap-2 mt-4">' +
                    '<button onclick="viewSeekerProfile(\'' + talent.id + '\')" class="flex-1 founder-btn text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 text-center flex items-center justify-center transition-colors"><i data-lucide="eye" class="w-4 h-4 mr-1.5"></i> View Profile</button>' +
                    (talent.email ? '<a href="mailto:' + talent.email + '" class="p-2.5 border border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center" title="Email"><i data-lucide="mail" class="w-4 h-4 text-blue-400"></i></a>' : '') +
                    '</div>' +
                    '</div></div>';
            }).join('');
        }
        
        function filterTalents() {
            var query = (document.getElementById('talent-search-input').value || '').toLowerCase().trim();
            var grid = document.getElementById('talent-grid');
            if (!grid) return;
            var filtered = talents.filter(function(t) {
                if (!query) return true;
                return t.name.toLowerCase().includes(query) || 
                       t.role.toLowerCase().includes(query) ||
                       (t.location || '').toLowerCase().includes(query) ||
                       t.skills.some(function(s) { return s.toLowerCase().includes(query); });
            });
            grid.innerHTML = renderTalentCards(filtered);
            lucide.createIcons();
        }

        function renderInvestors() {
            if (!firebaseDataLoaded) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <div class="w-12 h-12 rounded-full border-4 border-gray-700 loader mb-4 mx-auto"></div>
                        <p class="text-gray-400">Loading investors from database...</p>
                    </div>`;
            }
            
            if (investors.length === 0) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <i data-lucide="trending-up" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-2">No Investors Found Yet</h2>
                        <p class="text-gray-400 mb-2">When investors create their profiles on Foundera, they will appear here.</p>
                        <p class="text-gray-500 text-sm">Complete your idea to attract investors!</p>
                    </div>`;
            }
            
            return `
                <div class="space-y-6">
                    <p class="text-sm text-gray-400"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i> Showing <strong class="text-white">${investors.length}</strong> real investors from database</p>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${investors.map(inv => `
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6 card-hover shadow-lg relative overflow-hidden">
                                <div class="flex items-center mb-4">
                                    <div class="bg-purple-500/20 p-3 rounded-xl mr-4 border border-purple-500/30">
                                        <i data-lucide="building-2" class="w-6 h-6 text-purple-400"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-lg text-white">${inv.name}</h3>
                                        ${inv.title ? `<p class="text-xs text-gray-400">${inv.title}</p>` : ''}
                                        <p class="text-xs text-gray-400">Ticket: ${inv.ticketSize}</p>
                                    </div>
                                </div>
                                ${inv.bio ? `<p class="text-gray-400 text-xs mb-3 line-clamp-2">${inv.bio}</p>` : ''}
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${inv.focus.map(f => `<span class="bg-gray-900 border border-gray-700 text-purple-300 text-xs px-2 py-1 rounded-md">${f}</span>`).join('')}
                                </div>
                                ${inv.location ? `<p class="text-xs text-gray-500 mb-4"><i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${inv.location}</p>` : ''}
                                <div class="flex gap-2 mt-4">
                                    ${inv.email ? `<a href="mailto:${inv.email}" class="flex-1 founder-btn text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 text-center flex items-center justify-center"><i data-lucide="mail" class="w-4 h-4 mr-1"></i> Send Pitch</a>` : ''}
                                    ${inv.linkedin ? `<a href="${inv.linkedin}" target="_blank" class="flex-1 border border-gray-600 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-bold transition-colors text-center flex items-center justify-center"><i data-lucide="linkedin" class="w-4 h-4 mr-1"></i> LinkedIn</a>` : ''}
                                </div>
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
        
        // Check if user is logged in
        if (!localStorage.getItem('founderName') && !localStorage.getItem('founderEmail')) {
            window.location.href = 'index.html';
        }
        
        // Load profile + idea from Firebase first, then render
        Promise.all([
            loadFounderProfileFromFirebase(),
            loadIdeaFromFirebase()
        ]).then(function() {
            updateHeaderAvatar();
            updateStartupNameDisplay();
            // Load real data from Firebase (investors + job seekers)
            loadFirebaseData();
            // Go to overview tab
            setTab('overview');
        }).catch(function() {
            updateHeaderAvatar();
            updateStartupNameDisplay();
            loadFirebaseData();
            setTab('overview');
        });
        
        lucide.createIcons();

        window.addEventListener('load', function() {
            setTimeout(function() {
                var p = document.getElementById('foundera-preloader');
                if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
            }, 2400);
        });
