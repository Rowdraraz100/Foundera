// --- DATA ---
        let currentTab = 'overview';
        let currentDataId = null; 
        
        // --- PROFILE DATA ---
        let profileData = {
            name: localStorage.getItem('founderName') || '',
            email: localStorage.getItem('founderEmail') || '',
            linkedin: localStorage.getItem('founderLinkedin') || '',
            github: localStorage.getItem('founderGithub') || '',
            bio: localStorage.getItem('founderBio') || '',
            skills: localStorage.getItem('founderSkills') || '',
            availability: localStorage.getItem('founderAvailability') || '',
            picture: localStorage.getItem('founderPicture') || '',
            coverPic: localStorage.getItem('founderCoverPic') || ''
        };
        
        // --- LOGOUT FUNCTION ---
        function handleLogout() {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(function(){});
            }
            localStorage.removeItem('founderName');
            localStorage.removeItem('founderEmail');
            localStorage.removeItem('founderLinkedin');
            localStorage.removeItem('founderGithub');
            localStorage.removeItem('founderBio');
            localStorage.removeItem('founderSkills');
            localStorage.removeItem('founderAvailability');
            localStorage.removeItem('founderPicture');
            localStorage.removeItem('founderCoverPic');
            localStorage.removeItem('founderIdeas');
            localStorage.removeItem('pendingSignup');
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
            localStorage.setItem('founderCoverPic', profileData.coverPic);
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
                coverPic: profileData.coverPic || '',
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
                    profileData.coverPic = data.coverPic || '';
                    
                    localStorage.setItem('founderName', profileData.name);
                    localStorage.setItem('founderEmail', profileData.email);
                    localStorage.setItem('founderLinkedin', profileData.linkedin);
                    localStorage.setItem('founderGithub', profileData.github);
                    localStorage.setItem('founderBio', profileData.bio);
                    localStorage.setItem('founderSkills', profileData.skills);
                    localStorage.setItem('founderAvailability', profileData.availability);
                    localStorage.setItem('founderPicture', profileData.picture);
                    localStorage.setItem('founderCoverPic', profileData.coverPic);
                    
                    updateHeaderAvatar();
                    console.log('Founder profile loaded from Firebase');
                }
            }).catch(function(e) { console.error('Firebase load error:', e); });
        }

        // --- UPDATE HEADER AVATAR ---
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

        // --- PROFILE PHOTOS ---
        function handleProfilePhotoUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPG, PNG, etc.)');
                return;
            }
            window.compressImageFile(file, 800, 800, 0.8).then(function(base64) {
                profileData.picture = base64;
                localStorage.setItem('founderPicture', base64);
                var preview = document.getElementById('profile-photo-preview');
                if (preview) {
                    preview.innerHTML = '<img src="' + base64 + '" alt="Profile" class="w-28 h-28 rounded-full object-cover">';
                }
                updateHeaderAvatar();
            });
        }

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
        
        function handleCoverPhotoUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPG, PNG, etc.)');
                return;
            }
            window.compressImageFile(file, 1920, 1080, 0.75).then(function(base64) {
                profileData.coverPic = base64;
                localStorage.setItem('founderCoverPic', base64);
                var preview = document.getElementById('cover-photo-preview');
                if (preview) {
                    preview.style.backgroundImage = 'url(' + base64 + ')';
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }
                saveFounderProfileToFirebase();
            });
        }

        function removeCoverPhoto() {
            profileData.coverPic = '';
            localStorage.removeItem('founderCoverPic');
            var preview = document.getElementById('cover-photo-preview');
            if (preview) {
                preview.style.backgroundImage = 'none';
                preview.style.background = 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)';
            }
            saveFounderProfileToFirebase();
        }

        // --- IDEAS ---
        let ideas = [];

        function loadIdeasFromStorage() {
            const savedIdeas = localStorage.getItem('founderIdeas');
            if (savedIdeas) {
                ideas = JSON.parse(savedIdeas);
            }
        }
        
        function saveIdeasToStorage() {
            localStorage.setItem('founderIdeas', JSON.stringify(ideas));
        }

        function saveIdeaToFirebase(idea) {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return;
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            
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
            });
            
            db.ref('ideas/' + safeKey).set(ideaData);
        }

        function deleteIdeaFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return;
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            
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
            db.ref('ideas/' + safeKey).remove();
        }

        function loadIdeaFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email) return Promise.resolve();
            var safeKey = email.replace(/[.#$\[\]]/g, '_');
            return firebase.database().ref('ideas/' + safeKey).once('value').then(function(snap) {
                var data = snap.val();
                if (data && data.startupName) {
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
                    if (ideas.length === 0) {
                        ideas = [firebaseIdea];
                        saveIdeasToStorage();
                    }
                }
            });
        }

        // --- FETCH RECEIVED APPLICATIONS ---
        let receivedApplications = [];
        
        function fetchIdeaApplications() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            var email = profileData.email || localStorage.getItem('founderEmail') || '';
            if (!email || ideas.length === 0) return Promise.resolve();
            
            var ideaId = email.replace(/[.#$\[\]]/g, '_'); 
            
            return firebase.database().ref('applications/' + ideaId).on('value', function(snap) {
                receivedApplications = [];
                var data = snap.val();
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        receivedApplications.push(data[key]);
                    });
                }
                receivedApplications.sort((a,b) => new Date(b.appliedDate) - new Date(a.appliedDate));
                console.log("Founder: Received " + receivedApplications.length + " applications.");
                
                if (currentTab === 'overview' || currentTab === 'ideaDetail' || currentTab === 'ideas') {
                    renderContent();
                }
            });
        }

        // --- AI SKILL MATCHING ---
        let aiMatchCache = {};
        
        function getAISkillMatch(ideaSkills, talentSkills) {
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
            
            var totalNeeded = ideaSkills.length || 1;
            var score = Math.round(((exactMatches * 1.0 + partialMatches * 0.5) / totalNeeded) * 100);
            return Math.min(score, 100);
        }

        async function getGeminiAIMatches(idea, talentList) {
            var cacheKey = idea.id + '_' + talentList.length;
            if (aiMatchCache[cacheKey]) return aiMatchCache[cacheKey];
            
            var localMatches = talentList.map(function(t) {
                var score = getAISkillMatch(idea.skillsNeeded, t.skills);
                return Object.assign({}, t, { matchScore: score, matchReason: 'Skill-based match' });
            }).filter(function(t) { return t.matchScore > 0; }).sort(function(a,b) { return b.matchScore - a.matchScore; });
            
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
                var jsonMatch = text.match(/\[.*\]/s);
                if (jsonMatch) {
                    var aiResults = JSON.parse(jsonMatch[0]);
                    localMatches = localMatches.map(function(t) {
                        var aiMatch = aiResults.find(function(a) { return a.name === t.name; });
                        if (aiMatch) {
                            t.matchScore = Math.round((t.matchScore * 0.3 + aiMatch.score * 0.7));
                            t.matchReason = aiMatch.reason || t.matchReason;
                        }
                        return t;
                    }).sort(function(a,b) { return b.matchScore - a.matchScore; });
                }
            } catch(e) {
                console.log('Gemini API unavailable, using local skill matching:', e.message);
            }
            
            aiMatchCache[cacheKey] = localMatches;
            return localMatches;
        }

        let talents = [];
        let investors = [];
        let firebaseDataLoaded = false;

        // --- FETCH DATA ---
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
                            available: s.availability === 'Immediately' || s.availability === 'Available',
                            avatar: (s.name || 'U').charAt(0).toUpperCase(),
                            email: s.email || '',
                            linkedin: s.linkedin || '',
                            github: s.github || '',
                            bio: s.bio || '',
                            location: s.location || '',
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
            });
        }

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
                            location: inv.location || '',
                            profilePic: inv.profilePic || inv.picture || '',
                            avatar: (inv.name || 'I').charAt(0).toUpperCase()
                        });
                    });
                }
            });
        }

        function loadFirebaseData() {
            return Promise.all([
                fetchJobSeekersFromFirebase(),
                fetchInvestorsFromFirebase()
            ]).then(function() {
                firebaseDataLoaded = true;
                renderContent();
            }).catch(function(e) {
                console.error('Error loading Firebase data:', e);
            });
        }

        // --- FUNCTIONS ---
        function setTab(tab, dataId = null) {
            if (tab === 'post' && dataId === null && ideas.length >= 1) {
                alert("You have already shared an idea! Please edit the existing one.");
                currentTab = 'ideaDetail';
                currentDataId = ideas[0].id;
            } else {
                currentTab = tab;
                currentDataId = dataId;
            }
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
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
            });
            let activeTabId = currentTab;
            if(currentTab === 'ideaDetail' || currentTab === 'post') activeTabId = 'ideas';
            const navLink = document.getElementById('nav-' + activeTabId);
            if (navLink) navLink.classList.add('active');
        }

        function saveProfile(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            profileData.name = fd.get('name') || '';
            profileData.email = fd.get('email') || '';
            profileData.linkedin = fd.get('linkedin') || '';
            profileData.github = fd.get('github') || '';
            profileData.bio = fd.get('bio') || '';
            profileData.skills = fd.get('skills') || '';
            profileData.availability = fd.get('availability');

            updateHeaderAvatar();
            saveProfileToStorage();

            alert('Profile saved successfully! Your updated info is now visible to talents and investors.');
            renderContent();
        }

        function editIdea(id) {
            setTab('post', id);
        }

        function postNewIdea(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            if (currentDataId) {
                const existingIdeaIndex = ideas.findIndex(i => String(i.id) === String(currentDataId));
                if (existingIdeaIndex > -1) {
                    ideas[existingIdeaIndex] = {
                        ...ideas[existingIdeaIndex],
                        title: fd.get('title'),
                        description: fd.get('description'),
                        problem: fd.get('problem'),
                        vision: fd.get('vision'),
                        businessPlan: fd.get('businessPlan'),
                        skillsNeeded: fd.get('skills').split(',').map(s => s.trim()),
                        industry: fd.get('industry'),
                        fundingNeeded: fd.get('funding') || 'Not Disclosed'
                    };
                    saveIdeasToStorage();
                    saveIdeaToFirebase(ideas[existingIdeaIndex]);
                    updateStartupNameDisplay();
                    alert('Your idea has been updated successfully!');
                    setTab('ideas');
                    return;
                }
            }

            if (ideas.length >= 1) {
                alert("You can only share one idea per profile.");
                return;
            }

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
            
            saveIdeasToStorage();
            saveIdeaToFirebase(newIdea);
            updateStartupNameDisplay();
            
            alert('Your startup idea "' + newIdea.title + '" has been posted and saved to the database! Job seekers and investors can now see it.');
            fetchIdeaApplications(); 
            setTab('overview');
        }

        function deleteIdea(id) {
            if(confirm('Are you sure you want to delete your idea?')) {
                ideas = ideas.filter(i => String(i.id) !== String(id));
                saveIdeasToStorage();
                deleteIdeaFromFirebase();
                updateStartupNameDisplay();
                currentDataId = null;
                setTab('post');
            }
        }

        function toggleIdeaStatus(id) {
            const idea = ideas.find(i => String(i.id) === String(id));
            if(idea) {
                idea.status = idea.status === 'Active' ? 'Draft' : 'Active';
                saveIdeasToStorage();
                saveIdeaToFirebase(idea);
                renderContent();
            }
        }

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

        function escapeHtml(text) {
            if (!text) return '';
            return text.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // --- RENDER FUNCTIONS ---
        function updateDynamicUI() {
            const sidebarBtn = document.getElementById('sidebar-share-btn');
            const headerBtn = document.getElementById('header-share-btn');
            
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
                ideaDetail: { t: 'Idea Details & Matches', s: 'Review your idea, received applications, and AI suggestions.' },
                talent: { t: 'Find Talent', s: 'Discover skilled professionals for your startup.' },
                investors: { t: 'Investors', s: 'Connect with investors matching your industry.' },
                post: { t: currentDataId ? 'Edit Your Idea' : 'Share Your Unique Idea', s: currentDataId ? 'Update your startup details.' : 'Provide details to get best AI matches.' },
                roadmap: { t: 'AI Roadmap & Startup Advisor', s: 'Generate a detailed execution plan and chat with AI advisor.' },
                profile: { t: 'My Profile', s: 'Manage your contact details and skills.' },
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
                    case 'ideas': content.innerHTML = renderIdeas(); break;
                    case 'ideaDetail': content.innerHTML = renderIdeaDetail(); break;
                    case 'talent': content.innerHTML = renderTalent(); break;
                    case 'investors': content.innerHTML = renderInvestors(); break;
                    case 'post': content.innerHTML = renderPostIdea(); break;
                    case 'roadmap': content.innerHTML = renderRoadmap(); break;
                    case 'profile': content.innerHTML = renderProfile(); break;
                    case 'community': content.innerHTML = renderCommunity(); break;
                    case 'myposts': content.innerHTML = renderMyPosts(); break;
                }
                lucide.createIcons();
                requestAnimationFrame(function() { content.style.opacity = '1'; });
            });
        }

        function renderOverview() {
            const hasIdea = ideas.length >= 1;
            const mainIdea = hasIdea ? ideas[0] : null;

            let matchedTalentsCount = 0;
            let matchedInvestorsCount = 0;
            
            if (hasIdea) {
                matchedTalentsCount = talents.filter(t => getAISkillMatch(mainIdea.skillsNeeded, t.skills) > 0).length;
                matchedInvestorsCount = investors.filter(i => i.focus.some(f => f.toLowerCase().includes(mainIdea.industry.toLowerCase()) || mainIdea.industry.toLowerCase().includes(f.toLowerCase()))).length;
            }

            return `
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-2xl p-8 border border-blue-500/30 shadow-lg relative overflow-hidden">
                        <div class="relative z-10">
                            <h2 class="text-3xl font-bold mb-2 text-white">
                                ${hasIdea ? 'Idea Status: ' + mainIdea.title : 'Welcome to Foundera Dashboard'}
                            </h2>
                            <p class="text-blue-200 mb-6 max-w-2xl text-lg">
                                ${hasIdea ? 'Your idea is live! Review the received applications and AI matches to take the next step.' : 'Share your startup idea and let our AI find the best co-founders, developers, and investors for you.'}
                            </p>
                            ${hasIdea 
                                ? `<button onclick="setTab('ideaDetail', ${mainIdea.id})" class="btn-highlight text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                    <i data-lucide="eye" class="w-5 h-5 mr-2 fill-current"></i> View Applications & Matches
                                   </button>`
                                : `<button onclick="setTab('post')" class="btn-highlight text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                    <i data-lucide="rocket" class="w-5 h-5 mr-2 fill-current"></i> Share Your Idea Now
                                   </button>`
                            }
                        </div>
                        <i data-lucide="${hasIdea ? 'check-circle' : 'lightbulb'}" class="absolute -right-4 -top-4 w-48 h-48 text-white opacity-5"></i>
                    </div>

                    ${hasIdea ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-blue-500/50 transition-colors cursor-pointer" onclick="setTab('ideaDetail', ${mainIdea.id})">
                            <i data-lucide="file-check" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${receivedApplications.length}</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Applications</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-green-500/50 transition-colors cursor-pointer" onclick="setTab('ideaDetail', ${mainIdea.id})">
                            <i data-lucide="users" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${matchedTalentsCount}</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Matched Talent</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-colors cursor-pointer" onclick="setTab('ideaDetail', ${mainIdea.id})">
                            <i data-lucide="briefcase" class="w-8 h-8 text-purple-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${matchedInvestorsCount}</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Investor Matches</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow hover:border-yellow-500/50 transition-colors">
                            <i data-lucide="check-circle" class="w-8 h-8 text-yellow-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">Active</span>
                            <span class="text-xs text-gray-400 uppercase tracking-wider mt-2 font-medium">Project Status</span>
                        </div>
                    </div>
                    ` : ''}

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
                                    
                                    <div class="flex items-center gap-3">
                                        <div class="flex items-center text-xs text-green-400 bg-gray-900/50 px-3 py-1.5 rounded-xl border border-green-500/30">
                                            <i data-lucide="file-check" class="w-3.5 h-3.5 mr-1.5"></i>
                                            <span class="font-medium">${receivedApplications.length} Applications</span>
                                        </div>
                                        <div class="flex items-center text-xs text-purple-400 bg-gray-900/50 px-3 py-1.5 rounded-xl border border-purple-500/30">
                                            <i data-lucide="sparkles" class="w-3.5 h-3.5 mr-1.5"></i>
                                            <span class="font-medium">Matches Ready</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="border-t border-gray-700/50 px-6 py-4 bg-gray-900/30 flex justify-between items-center">
                                    <button onclick="setTab('ideaDetail', ${idea.id})" class="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center transition-colors">
                                        View Details <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                                    </button>
                                    <div class="flex gap-3">
                                        <button onclick="editIdea(${idea.id})" class="text-gray-400 hover:text-blue-400 transition-colors" title="Edit Idea"><i data-lucide="edit" class="w-4 h-4"></i></button>
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
            const idea = ideas.find(i => String(i.id) === String(currentDataId));
            if(!idea) return `<p>Idea not found.</p>`;

            const matchedTalentsLocal = talents.map(t => {
                const score = getAISkillMatch(idea.skillsNeeded, t.skills);
                return { ...t, matchScore: score, matchReason: 'Skill-based match' };
            }).filter(t => t.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore);

            const matchedInvestors = investors.filter(i => i.focus.some(f => f.toLowerCase().includes(idea.industry.toLowerCase()) || idea.industry.toLowerCase().includes(f.toLowerCase())));

            if (talents.length > 0) {
                getGeminiAIMatches(idea, talents).then(function(aiMatches) {
                    var container = document.getElementById('ai-talent-matches');
                    if (container && aiMatches.length > 0) {
                        container.innerHTML = aiMatches.map(function(t) {
                            var picHTML = t.profilePic 
                                ? `<img src="${t.profilePic}" class="w-10 h-10 rounded-full object-cover mr-3 border border-gray-600">`
                                : `<div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600">${t.avatar}</div>`;
                            return '<div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">' +
                                '<div class="flex items-center justify-between">' +
                                    '<div class="flex items-center">' + picHTML +
                                        '<div>' +
                                            '<h5 class="font-bold text-sm text-white">' + t.name + '</h5>' +
                                            '<p class="text-xs text-gray-400">' + t.role + '</p>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="text-right flex flex-col items-end gap-2">' +
                                        '<span class="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">' + t.matchScore + '%</span>' +
                                    '</div>' +
                                '</div>' +
                                (t.matchReason ? '<p class="text-xs text-purple-300 mt-2 mb-2 bg-purple-500/10 px-3 py-1.5 rounded-lg"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>' + t.matchReason + '</p>' : '') +
                                '<div class="mt-3 flex gap-2">' +
                                    `<button onclick="${typeof window.viewCommunityProfile !== 'undefined' ? `viewCommunityProfile('${t.id}', 'Job Seeker')` : `viewSeekerProfile('${t.id}')`}" class="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 transition-colors">View Profile</button>` +
                                    (t.email ? '<a href="mailto:' + t.email + '" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"><i data-lucide="mail" class="w-3 h-3 inline"></i> Email</a>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('');
                        lucide.createIcons();
                    }
                });
            }

            let applicationsHtml = '';
            if (receivedApplications.length > 0) {
                applicationsHtml = `
                    <div class="mt-10 mb-6">
                        <h3 class="text-xl font-bold mb-6 flex items-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            <i data-lucide="file-check" class="w-6 h-6 mr-2 text-green-400"></i> Received Applications (${receivedApplications.length})
                        </h3>
                        <div class="grid md:grid-cols-2 gap-6">
                            ${receivedApplications.map(app => {
                                let seekerKey = app.seekerEmail ? app.seekerEmail.replace(/[.#$\[\]]/g, '_') : '';
                                return `
                                <div class="bg-gray-800/40 p-5 rounded-2xl border border-green-500/30 shadow-lg hover:border-green-500/60 transition-colors">
                                    <div class="flex items-center gap-4 mb-4">
                                        ${app.seekerPic ? `<img src="${app.seekerPic}" class="w-12 h-12 rounded-full object-cover border border-gray-600">` : `<div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">${app.seekerName.charAt(0)}</div>`}
                                        <div>
                                            <h4 class="font-bold text-white text-lg">${app.seekerName}</h4>
                                            <p class="text-xs text-gray-400">${app.seekerTitle || 'Job Seeker'}</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                                        <span class="text-xs text-gray-500"><i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>Applied: ${app.appliedDate}</span>
                                        <div class="flex gap-2">
                                            <button onclick="${typeof window.viewCommunityProfile !== 'undefined' ? `viewCommunityProfile('${seekerKey}', 'Job Seeker')` : `viewSeekerProfile('${seekerKey}')`}" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition shadow border border-gray-600">View Profile</button>
                                            <a href="mailto:${app.seekerEmail}" class="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition shadow">Contact</a>
                                        </div>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                `;
            } else {
                applicationsHtml = `
                    <div class="mt-10 mb-6">
                        <h3 class="text-xl font-bold mb-6 flex items-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            <i data-lucide="file-check" class="w-6 h-6 mr-2 text-green-400"></i> Received Applications
                        </h3>
                        <div class="bg-gray-800/40 p-8 rounded-2xl border border-gray-700/50 text-center">
                            <i data-lucide="inbox" class="w-12 h-12 text-gray-500 mx-auto mb-3"></i>
                            <p class="text-gray-400">No applications received yet. They will appear here when job seekers apply.</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg relative">
                        <button onclick="editIdea(${idea.id})" class="absolute top-6 right-6 bg-gray-900/80 hover:bg-blue-600 border border-gray-700 p-2 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium z-10"><i data-lucide="edit" class="w-4 h-4"></i> Edit Idea</button>
                        
                        <div class="flex justify-between items-start mb-6 pr-32">
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

                    ${applicationsHtml}

                    <div class="mt-8">
                        <h3 class="text-xl font-bold mb-6 flex items-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            <i data-lucide="sparkles" class="w-6 h-6 mr-2 text-purple-400"></i> AI Suggested Matches
                        </h3>
                        
                        <div class="grid lg:grid-cols-2 gap-8">
                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                                <h4 class="font-bold text-lg mb-4 flex justify-between items-center text-white">
                                    Best Talent For This <span class="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">${matchedTalentsLocal.length} found</span>
                                </h4>
                                <div id="ai-talent-matches" class="space-y-4">
                                    ${matchedTalentsLocal.length > 0 ? matchedTalentsLocal.map(t => {
                                        var picHTML = t.profilePic 
                                            ? `<img src="${t.profilePic}" class="w-10 h-10 rounded-full object-cover mr-3 border border-gray-600">`
                                            : `<div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3 border border-gray-600">${t.avatar}</div>`;
                                        return `
                                        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center">
                                                    ${picHTML}
                                                    <div>
                                                        <h5 class="font-bold text-sm text-white">${t.name}</h5>
                                                        <p class="text-xs text-gray-400">${t.role}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right flex items-center gap-2">
                                                    <span class="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">${t.matchScore}%</span>
                                                </div>
                                            </div>
                                            ${t.matchReason ? `<p class="text-xs text-purple-300 mt-2 mb-2 bg-purple-500/10 px-3 py-1.5 rounded-lg"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>${t.matchReason}</p>` : ''}
                                            <div class="mt-3 flex gap-2">
                                                <button onclick="${typeof window.viewCommunityProfile !== 'undefined' ? `viewCommunityProfile('${t.id}', 'Job Seeker')` : `viewSeekerProfile('${t.id}')`}" class="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 transition-colors">View Profile</button>
                                                ${t.email ? `<a href="mailto:${t.email}" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"><i data-lucide="mail" class="w-3 h-3 inline"></i> Email</a>` : ''}
                                            </div>
                                        </div>
                                    `}).join('') : '<p class="text-sm text-gray-500 italic">No matching talent found yet. When job seekers join Foundera, matches will appear here.</p>'}
                                </div>
                            </div>

                            <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                                <h4 class="font-bold text-lg mb-4 flex justify-between items-center text-white">
                                    Interested Investors <span class="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">${matchedInvestors.length} found</span>
                                </h4>
                                <div class="space-y-4">
                                    ${matchedInvestors.length > 0 ? matchedInvestors.map(inv => {
                                        var invPicHTML = inv.profilePic 
                                            ? `<img src="${inv.profilePic}" class="w-10 h-10 rounded-full object-cover mr-3 border border-gray-600">`
                                            : `<div class="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold mr-3 border border-purple-500/30">${inv.avatar || 'I'}</div>`;
                                        return `
                                        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-between hover:border-purple-500/50 transition-colors">
                                            <div class="flex items-center mb-3">
                                                ${invPicHTML}
                                                <div>
                                                    <h5 class="font-bold text-sm text-white">${inv.name}</h5>
                                                    <p class="text-xs text-gray-400">Invests in: <span class="text-gray-300">${inv.focus.join(', ')}</span></p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <button onclick="viewInvestorProfile('${inv.id}')" class="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 transition-colors">View Profile</button>
                                                ${inv.email ? `<a href="mailto:${inv.email}" class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white transition-colors"><i data-lucide="mail" class="w-3 h-3 inline"></i> Pitch</a>` : `<span class="bg-gray-700 px-3 py-1.5 rounded text-xs text-gray-400">No Contact</span>`}
                                            </div>
                                        </div>
                                    `}).join('') : '<p class="text-sm text-gray-500 italic">No matching investors found yet. When investors join Foundera, matches will appear here.</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderPostIdea() {
            const editIdea = currentDataId ? ideas.find(i => String(i.id) === String(currentDataId)) : null;

            return `
                <div class="max-w-3xl mx-auto">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <div class="mb-8">
                            <h2 class="text-3xl font-bold mb-2 text-white">${editIdea ? 'Update Your Startup Idea' : 'Share Your Unique Idea'}</h2>
                            <p class="text-gray-400">${editIdea ? 'Change your details below. Our AI will automatically re-analyze for best matches.' : 'Fill out these details. Our AI will automatically analyze your requirements and suggest the best Co-founders, Developers, and Investors.'}</p>
                        </div>
                        
                        <form onsubmit="postNewIdea(event)" class="space-y-6 relative z-10">
                            <!-- Basic Info -->
                            <div class="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Startup Title *</label>
                                    <input name="title" required value="${editIdea ? editIdea.title : ''}" placeholder="e.g., AI-Powered Healthcare App" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Startup Description *</label>
                                    <textarea name="description" required rows="2" placeholder="Briefly describe your idea and the core problem it solves..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">${editIdea ? editIdea.description : ''}</textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Problem Statement *</label>
                                    <textarea name="problem" required rows="2" placeholder="What specific problem is your startup trying to solve?..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">${editIdea ? editIdea.problem : ''}</textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Vision and Mission *</label>
                                    <textarea name="vision" required rows="2" placeholder="What is the ultimate goal and vision of your startup?..." class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">${editIdea ? editIdea.vision : ''}</textarea>
                                </div>
                            </div>

                            <!-- Detailed Plan -->
                            <div class="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Business Plan & Revenue Model</label>
                                    <textarea name="businessPlan" rows="3" placeholder="How will it make money? Who is the target audience? (Helps AI find better investors)" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">${editIdea ? editIdea.businessPlan : ''}</textarea>
                                </div>
                                <div class="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Industry Type *</label>
                                        <select name="industry" required class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-200">
                                            <option value="">Select industry</option>
                                            <option ${editIdea && editIdea.industry === 'AgriTech' ? 'selected' : ''}>AgriTech</option>
                                            <option ${editIdea && editIdea.industry === 'FinTech' ? 'selected' : ''}>FinTech</option>
                                            <option ${editIdea && editIdea.industry === 'EdTech' ? 'selected' : ''}>EdTech</option>
                                            <option ${editIdea && editIdea.industry === 'HealthTech' ? 'selected' : ''}>HealthTech</option>
                                            <option ${editIdea && editIdea.industry === 'E-commerce' ? 'selected' : ''}>E-commerce</option>
                                            <option ${editIdea && editIdea.industry === 'SaaS' ? 'selected' : ''}>SaaS</option>
                                            <option ${editIdea && editIdea.industry === 'AI/ML' ? 'selected' : ''}>AI/ML</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Funding Requirement</label>
                                        <input name="funding" value="${editIdea ? editIdea.fundingNeeded : ''}" placeholder="e.g., $50,000" class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                    </div>
                                </div>
                            </div>

                            <!-- AI Matching Requirements -->
                            <div class="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30 space-y-5">
                                <h4 class="font-bold text-blue-300 flex items-center mb-2"><i data-lucide="cpu" class="w-5 h-5 mr-2"></i> AI Matchmaking Data</h4>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Skills Needed (For finding Talent) *</label>
                                    <input name="skills" required value="${editIdea ? editIdea.skillsNeeded.join(', ') : ''}" placeholder="e.g., React, Node.js, Marketing (comma separated)" class="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500 text-white">
                                </div>
                            </div>

                            <div class="flex gap-4 pt-2">
                                <button type="submit" class="flex-1 founder-btn text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 flex justify-center items-center transition-transform hover:scale-[1.02]">
                                    <i data-lucide="${editIdea ? 'save' : 'sparkles'}" class="w-5 h-5 mr-2"></i> ${editIdea ? 'Update Idea' : 'Post Idea & Generate Matches'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        }

        function renderRoadmap() {
            return `
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="map" class="w-8 h-8 text-purple-400"></i>
                        </div>
                        <h2 class="text-3xl font-bold mb-2 text-white">AI Roadmap & Startup Advisor</h2>
                        <p class="text-gray-400">Select your idea. AI will create a detailed plan and provide expert advice.</p>
                    </div>

                    <div class="flex gap-4 mb-10 max-w-2xl mx-auto">
                        <select id="roadmap-idea-select" class="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-200">
                            <option value="">-- Select Your Idea --</option>
                            ${ideas.map(i => `<option value="${i.id}">${escapeHtml(i.title)}</option>`).join('')}
                        </select>
                        <button onclick="generateRoadmap()" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center shadow-lg shadow-purple-500/20">
                            <i data-lucide="zap" class="w-4 h-4 mr-2"></i> Generate
                        </button>
                    </div>

                    <div id="roadmap-result" class="hidden">
                        <div class="grid lg:grid-cols-3 gap-8">
                            <!-- Left Side: Timeline -->
                            <div class="lg:col-span-2 bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 sm:p-8">
                                <h3 class="text-xl font-bold text-white mb-6 flex items-center"><i data-lucide="map" class="w-5 h-5 mr-2 text-blue-400"></i> Execution Timeline</h3>
                                
                                <!-- Loader -->
                                <div id="roadmap-loader" class="flex flex-col items-center justify-center py-12">
                                    <div class="w-12 h-12 rounded-full border-4 border-gray-700 loader mb-4"></div>
                                    <p class="text-purple-400 font-medium animate-pulse">Gemini AI is analyzing your business plan in detail...</p>
                                </div>
                                
                                <!-- Roadmap Timeline -->
                                <div id="roadmap-timeline" class="hidden space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-600 before:to-transparent pt-4">
                                    <!-- Phases will be injected here via JS -->
                                </div>
                            </div>

                            <!-- Right Side: AI Chatbot -->
                            <div class="lg:col-span-1 bg-gray-800/40 rounded-2xl border border-gray-700/50 flex flex-col h-[600px] overflow-hidden">
                                <div class="bg-gray-900/80 p-4 border-b border-gray-700/50 flex items-center gap-3 shrink-0">
                                    <div class="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                                        <i data-lucide="bot" class="w-5 h-5 text-purple-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-white text-sm">Startup Advisor</h4>
                                        <p class="text-[10px] text-green-400 font-medium">Online (Gemini AI)</p>
                                    </div>
                                </div>

                                <div id="advisor-chat-history" class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    <div class="bg-gray-700/50 text-gray-300 text-sm p-3 rounded-xl rounded-tl-none w-[85%] self-start">
                                        Hello! I am your Startup Advisor. You can ask any questions about your idea, and I will guide you.
                                    </div>
                                </div>

                                <form onsubmit="handleAdvisorChat(event)" class="p-3 bg-gray-900 border-t border-gray-700/50 shrink-0 flex gap-2">
                                    <input type="text" id="advisor-chat-input" placeholder="Ask a question..." required class="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none">
                                    <button type="submit" class="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center shrink-0">
                                        <i data-lucide="send" class="w-5 h-5"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
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
                    ? '<img src="' + talent.profilePic + '" alt="' + escapeHtml(talent.name) + '" class="w-14 h-14 rounded-full object-cover border-2 border-gray-600">'
                    : '<div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-lg text-white border-2 border-gray-600">' + talent.avatar + '</div>';
                
                return '<div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden card-hover shadow-lg group">' +
                    (talent.coverPic ? '<div class="h-24 bg-cover bg-center" style="background-image: url(' + talent.coverPic + ')"></div>' : '<div class="h-24 bg-gradient-to-r from-gray-800 to-green-900/40"></div>') +
                    '<div class="px-5 pb-5 -mt-7 relative">' +
                    '<div class="flex items-end justify-between mb-3">' +
                    picHTML +
                    '<span class="px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ' + (talent.available ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-400 border border-gray-600') + '">' + (talent.available ? 'Available' : 'Busy') + '</span>' +
                    '</div>' +
                    '<h3 class="font-bold text-white text-lg">' + escapeHtml(talent.name) + '</h3>' +
                    '<p class="text-sm text-gray-400 mb-2">' + escapeHtml(talent.role) + '</p>' +
                    (talent.location ? '<p class="text-xs text-gray-500 flex items-center mb-3"><i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>' + escapeHtml(talent.location) + '</p>' : '') +
                    (talent.bio ? '<p class="text-gray-400 text-xs mb-3 line-clamp-2">' + escapeHtml(talent.bio) + '</p>' : '') +
                    '<div class="flex flex-wrap gap-1.5 mb-4">' + talent.skills.slice(0, 5).map(function(skill) { return '<span class="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded">' + escapeHtml(skill) + '</span>'; }).join('') + (talent.skills.length > 5 ? '<span class="text-xs text-gray-500">+' + (talent.skills.length - 5) + ' more</span>' : '') + '</div>' +
                    '<div class="flex gap-2 mt-4">' +
                    `<button onclick="${typeof window.viewCommunityProfile !== 'undefined' ? `viewCommunityProfile('${talent.id}', 'Job Seeker')` : `viewSeekerProfile('${talent.id}')`}" class="flex-1 founder-btn text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 text-center flex items-center justify-center transition-colors"><i data-lucide="eye" class="w-4 h-4 mr-1.5"></i> View Profile</button>` +
                    (talent.email ? '<a href="mailto:' + talent.email + '" class="p-2.5 border border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center" title="Email"><i data-lucide="mail" class="w-4 h-4 text-blue-400"></i></a>' : '') +
                    '</div>' +
                    '</div></div>';
            }).join('');
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
                                        <h3 class="font-bold text-lg text-white">${escapeHtml(inv.name)}</h3>
                                        ${inv.title ? `<p class="text-xs text-gray-400">${escapeHtml(inv.title)}</p>` : ''}
                                        <p class="text-xs text-gray-400">Ticket: ${escapeHtml(inv.ticketSize)}</p>
                                    </div>
                                </div>
                                ${inv.bio ? `<p class="text-gray-400 text-xs mb-3 line-clamp-2">${escapeHtml(inv.bio)}</p>` : ''}
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${inv.focus.map(f => `<span class="bg-gray-900 border border-gray-700 text-purple-300 text-xs px-2 py-1 rounded-md">${escapeHtml(f)}</span>`).join('')}
                                </div>
                                ${inv.location ? `<p class="text-xs text-gray-500 mb-4"><i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${escapeHtml(inv.location)}</p>` : ''}
                                <div class="flex gap-2 mt-4">
                                    <button onclick="viewInvestorProfile('${inv.id}')" class="flex-1 founder-btn text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 text-center flex items-center justify-center"><i data-lucide="eye" class="w-4 h-4 mr-1.5"></i> Profile</button>
                                    ${inv.email ? `<a href="mailto:${inv.email}" class="p-2.5 border border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center" title="Email Pitch"><i data-lucide="mail" class="w-4 h-4 text-blue-400"></i></a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let chatIdeaContext = null;

        async function generateRoadmap() {
            const select = document.getElementById('roadmap-idea-select');
            if(!select.value) {
                alert("Please select an idea first. If you haven't shared one, go to 'Share Idea'.");
                return;
            }
            const ideaId = parseInt(select.value);
            const idea = ideas.find(i => String(i.id) === String(ideaId));
            chatIdeaContext = idea; 
            
            const resultBox = document.getElementById('roadmap-result');
            const loader = document.getElementById('roadmap-loader');
            const timeline = document.getElementById('roadmap-timeline');
            const chatHistory = document.getElementById('advisor-chat-history');
            
            resultBox.classList.remove('hidden');
            loader.classList.remove('hidden');
            timeline.classList.add('hidden');
            
            if(chatHistory) {
                chatHistory.innerHTML = `<div class="bg-gray-700/50 text-gray-300 text-sm p-3 rounded-xl rounded-tl-none w-[85%] self-start animate-fade-in">
                    Generating a highly customized roadmap... Feel free to ask any specific questions about "${idea.title}" here.
                </div>`;
            }

            try {
                const GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng'; 
                const prompt = `You are an elite Startup Technical & Business Advisor. Analyze the following startup idea deeply and create a highly customized, practical, and non-generic 4-phase execution roadmap. It must specifically address the unique technical, operational, and market challenges of this exact idea, not just general startup advice.

Startup Title: ${idea.title}
Industry: ${idea.industry}
Core Description: ${idea.description}
Business Plan / Revenue Model: ${idea.businessPlan || 'Not specified'}
Required Skills: ${idea.skillsNeeded.join(', ')}

Return the roadmap STRICTLY as a JSON array where each object represents a phase and has these exact keys:
- "phase": string (e.g., "Phase 1: Technical Validation & Prototyping")
- "timeframe": string (e.g., "Months 1-2")
- "description": string (A highly specific paragraph explaining EXACTLY what needs to be built or done for THIS specific idea)
- "keyTasks": array of strings (3-4 highly specific, actionable steps - e.g., "Develop React Native frontend connecting to the soil-analysis Python backend")
- "challenges": array of strings (1-2 specific potential bottlenecks or risks for this phase, and a short tip on how to overcome them)
- "kpi": string (Specific metric to measure success for this phase)
- "icon": string (choose ONE exactly from: search, code, rocket, trending-up, target, users, lightbulb)
- "colorTheme": string (choose ONE exactly from: purple, blue, green, yellow, red, orange)

Output ONLY a valid JSON array without any markdown wrappers or additional text.`;

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: "application/json" }
                    })
                });
                
                if (!response.ok) throw new Error("API request failed (Limits likely exceeded).");

                const result = await response.json();
                let text = result.candidates[0].content.parts[0].text;
                
                const phases = JSON.parse(text);

                const colorMap = {
                    purple: { bg: 'bg-purple-500', text: 'text-purple-400', light: 'bg-purple-500/10', borderHover: 'hover:border-purple-500/50' },
                    blue: { bg: 'bg-blue-500', text: 'text-blue-400', light: 'bg-blue-500/10', borderHover: 'hover:border-blue-500/50' },
                    green: { bg: 'bg-green-500', text: 'text-green-400', light: 'bg-green-500/10', borderHover: 'hover:border-green-500/50' },
                    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/10', borderHover: 'hover:border-yellow-500/50' },
                    red: { bg: 'bg-red-500', text: 'text-red-400', light: 'bg-red-500/10', borderHover: 'hover:border-red-500/50' },
                    orange: { bg: 'bg-orange-500', text: 'text-orange-400', light: 'bg-orange-500/10', borderHover: 'hover:border-orange-500/50' }
                };

                timeline.innerHTML = phases.map((p, index) => {
                    const colors = colorMap[p.colorTheme] || colorMap.blue;
                    const tasksHtml = p.keyTasks && Array.isArray(p.keyTasks) ? 
                        `<ul class="mt-3 space-y-2">` + p.keyTasks.map(task => `<li class="text-sm text-gray-400 flex items-start"><i data-lucide="check" class="w-4 h-4 mr-2 text-gray-500 shrink-0 mt-0.5"></i> <span>${task}</span></li>`).join('') + `</ul>` : '';
                    
                    const challengesHtml = p.challenges && Array.isArray(p.challenges) && p.challenges.length > 0 ?
                        `<div class="mt-5 bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                            <h5 class="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center"><i data-lucide="alert-triangle" class="w-4 h-4 mr-1.5"></i> Potential Challenges & Solutions</h5>
                            <ul class="space-y-2">` + p.challenges.map(c => `<li class="text-sm text-gray-400 flex items-start"><i data-lucide="info" class="w-4 h-4 mr-2 text-red-400 shrink-0 mt-0.5"></i> <span>${c}</span></li>`).join('') + `</ul>
                        </div>` : '';

                    return `
                        <div class="relative flex flex-col md:flex-row items-start group is-active animate-fade-in mb-8" style="animation-delay: ${index * 0.1}s">
                            <div class="flex items-center justify-center w-12 h-12 rounded-full border-4 border-gray-900 ${colors.bg} text-white shadow shrink-0 z-10 -ml-[5px] md:mr-6 mb-4 md:mb-0">
                                <i data-lucide="${p.icon || 'target'}" class="w-5 h-5"></i>
                            </div>
                            <div class="w-full bg-gray-900/80 p-5 sm:p-6 rounded-2xl border border-gray-700/50 shadow-lg ${colors.borderHover} transition-colors">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                    <h4 class="font-bold text-lg sm:text-xl text-white">${p.phase}</h4>
                                    <span class="text-xs font-bold ${colors.text} ${colors.light} px-3 py-1.5 rounded-lg border border-${p.colorTheme}-500/20 w-fit">${p.timeframe}</span>
                                </div>
                                <p class="text-sm text-gray-300 font-medium mb-4">${p.description}</p>
                                
                                <h5 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 mt-4">Key Tasks:</h5>
                                ${tasksHtml}

                                ${challengesHtml}

                                ${p.kpi ? `
                                <div class="mt-4 bg-gray-800 p-3 rounded-xl border border-gray-700 flex items-center">
                                    <i data-lucide="target" class="w-4 h-4 mr-2 text-green-400"></i>
                                    <span class="text-xs text-gray-400"><strong class="text-gray-300">KPI:</strong> ${p.kpi}</span>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                loader.classList.add('hidden');
                timeline.classList.remove('hidden');
                lucide.createIcons();

            } catch (error) {
                console.warn("AI Roadmap Error - Falling back to local generation:", error);
                
                const colorMap = {
                    purple: { bg: 'bg-purple-500', text: 'text-purple-400', light: 'bg-purple-500/10', borderHover: 'hover:border-purple-500/50' },
                    blue: { bg: 'bg-blue-500', text: 'text-blue-400', light: 'bg-blue-500/10', borderHover: 'hover:border-blue-500/50' },
                    green: { bg: 'bg-green-500', text: 'text-green-400', light: 'bg-green-500/10', borderHover: 'hover:border-green-500/50' },
                    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/10', borderHover: 'hover:border-yellow-500/50' }
                };

                const fallbackPhases = [
                    { phase: "Phase 1: Validation & Strategy", timeframe: "Month 1-2", description: `Conduct extensive market research in the ${idea.industry} sector. Refine the business model for ${idea.title} to ensure product-market fit.`, keyTasks: ["Survey target audience.", "Analyze competitors."], challenges: ["Risk: Target audience may not be willing to pay. Solution: Run early pre-sales or signups."], kpi: "100 valid user interviews completed", icon: "search", colorTheme: "purple" },
                    { phase: "Phase 2: MVP Development", timeframe: "Month 3-4", description: `Leverage Foundera talent network to onboard developers with skills in ${idea.skillsNeeded.slice(0,2).join(', ')}. Build the initial core platform.`, keyTasks: ["Hire core developers", "Develop core feature set"], challenges: ["Risk: Development delays. Solution: Strictly limit MVP features to core problem solving."], kpi: "Working prototype deployed", icon: "code", colorTheme: "blue" },
                    { phase: "Phase 3: Beta Testing & Iteration", timeframe: "Month 5", description: `Release beta to early adopters. Gather feedback specifically around the problem statement to validate your core hypothesis.`, keyTasks: ["Onboard 50 beta testers", "Fix critical bugs"], challenges: ["Risk: Low user retention. Solution: Create a direct feedback channel and iterate weekly."], kpi: "80% positive user feedback", icon: "target", colorTheme: "green" },
                    { phase: "Phase 4: Launch & Seed Funding", timeframe: "Month 6+", description: `Officially launch the product. Prepare a pitch deck focused on traction and approach Foundera investors to secure ${idea.fundingNeeded} capital.`, keyTasks: ["Public Launch", "Pitch to Foundera Investors"], challenges: ["Risk: Failure to secure funding. Solution: Build a strong traction record before pitching."], kpi: "Seed funding secured", icon: "trending-up", colorTheme: "yellow" }
                ];

                timeline.innerHTML = fallbackPhases.map((p, index) => {
                    const colors = colorMap[p.colorTheme];
                    const tasksHtml = `<ul class="mt-3 space-y-2">` + p.keyTasks.map(task => `<li class="text-sm text-gray-400 flex items-start"><i data-lucide="check" class="w-4 h-4 mr-2 text-gray-500 shrink-0 mt-0.5"></i> <span>${task}</span></li>`).join('') + `</ul>`;
                    const challengesHtml = `<div class="mt-5 bg-red-900/10 border border-red-500/20 rounded-xl p-4"><h5 class="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center"><i data-lucide="alert-triangle" class="w-4 h-4 mr-1.5"></i> Potential Challenges & Solutions</h5><ul class="space-y-2">` + p.challenges.map(c => `<li class="text-sm text-gray-400 flex items-start"><i data-lucide="info" class="w-4 h-4 mr-2 text-red-400 shrink-0 mt-0.5"></i> <span>${c}</span></li>`).join('') + `</ul></div>`;
                    
                    return `
                        <div class="relative flex flex-col md:flex-row items-start group is-active animate-fade-in mb-8" style="animation-delay: ${index * 0.1}s">
                            <div class="flex items-center justify-center w-12 h-12 rounded-full border-4 border-gray-900 ${colors.bg} text-white shadow shrink-0 z-10 -ml-[5px] md:mr-6 mb-4 md:mb-0">
                                <i data-lucide="${p.icon}" class="w-5 h-5"></i>
                            </div>
                            <div class="w-full bg-gray-900/80 p-5 sm:p-6 rounded-2xl border border-gray-700/50 shadow-lg ${colors.borderHover} transition-colors">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                    <h4 class="font-bold text-lg sm:text-xl text-white">${p.phase} <span class="ml-2 text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">Fallback</span></h4>
                                    <span class="text-xs font-bold ${colors.text} ${colors.light} px-3 py-1.5 rounded-lg border border-${p.colorTheme}-500/20 w-fit">${p.timeframe}</span>
                                </div>
                                <p class="text-sm text-gray-300 font-medium mb-4">${p.description}</p>
                                <h5 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 mt-4">Key Tasks:</h5>
                                ${tasksHtml}
                                ${challengesHtml}
                                <div class="mt-4 bg-gray-800 p-3 rounded-xl border border-gray-700 flex items-center">
                                    <i data-lucide="target" class="w-4 h-4 mr-2 text-green-400"></i>
                                    <span class="text-xs text-gray-400"><strong class="text-gray-300">KPI:</strong> ${p.kpi}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                loader.classList.add('hidden');
                timeline.classList.remove('hidden');
                lucide.createIcons();
            }
        }

        async function handleAdvisorChat(event) {
            event.preventDefault();
            if (!chatIdeaContext) return;

            const inputField = document.getElementById('advisor-chat-input');
            const chatHistory = document.getElementById('advisor-chat-history');
            const userText = inputField.value.trim();
            if (!userText) return;

            inputField.value = '';

            const userMsgHtml = `
                <div class="bg-blue-600 text-white text-sm p-3 rounded-xl rounded-tr-none w-[85%] self-end ml-auto animate-fade-in shadow-md">
                    ${userText}
                </div>
            `;
            chatHistory.insertAdjacentHTML('beforeend', userMsgHtml);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            const typingId = 'typing-' + Date.now();
            const typingHtml = `
                <div id="${typingId}" class="bg-gray-700/50 text-gray-400 text-xs p-3 rounded-xl rounded-tl-none w-fit self-start flex gap-1 animate-pulse">
                    <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                </div>
            `;
            chatHistory.insertAdjacentHTML('beforeend', typingHtml);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            try {
                const GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng'; 
                const systemPrompt = `You are a Startup Advisor. You are working on a specific startup idea.
Idea details: Title: ${chatIdeaContext.title}, Industry: ${chatIdeaContext.industry}, Problem: ${chatIdeaContext.problem}, Plan: ${chatIdeaContext.businessPlan}.
The user will ask you questions. Your answer must be helpful, professional, and in English. Please keep answers short, crisp, and to the point.`;

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        contents: [{ role: "user", parts: [{ text: userText }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                    })
                });

                if (!response.ok) {
                    throw new Error("API Limit Exceeded");
                }
                
                const result = await response.json();
                let aiResponse = "";
                
                if (result.candidates && result.candidates[0].content) {
                    aiResponse = result.candidates[0].content.parts[0].text;
                } else {
                    aiResponse = "Sorry, your question was blocked due to safety guidelines. Please ask differently.";
                }
                
                const typingEl = document.getElementById(typingId);
                if(typingEl) typingEl.remove();

                const aiMsgHtml = `
                    <div class="bg-gray-700/50 text-gray-300 text-sm p-3 rounded-xl rounded-tl-none w-[90%] self-start animate-fade-in border border-gray-600/50">
                        ${aiResponse.replace(/\n/g, '<br>')}
                    </div>
                `;
                chatHistory.insertAdjacentHTML('beforeend', aiMsgHtml);
                chatHistory.scrollTop = chatHistory.scrollHeight;

            } catch (error) {
                console.warn("Chat API Error - Using Fallback:", error);
                const typingEl = document.getElementById(typingId);
                if(typingEl) typingEl.remove();

                const fallbacks = [
                    "Great question! Currently my API is overloaded, but your idea is very promising. You can focus on getting feedback from your target audience right now.",
                    "That is a big challenge. The API connection limit has been crossed, but I would suggest testing this with your MVP (Minimum Viable Product).",
                    "Exactly! You should add this to your business plan. It will attract more investors.",
                    "Good point. Now you should analyze your industry competitors to make your advantage clearer."
                ];
                const fallbackMsg = fallbacks[Math.floor(Math.random() * fallbacks.length)];

                chatHistory.insertAdjacentHTML('beforeend', `
                    <div class="bg-gray-700/50 text-gray-300 text-sm p-3 rounded-xl rounded-tl-none w-[90%] self-start animate-fade-in border border-gray-600/50">
                        <span class="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded mr-1">Fallback Mode</span>
                        ${fallbackMsg}
                    </div>
                `);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        }

        // --- VIEW PROFILES ---
        function viewInvestorProfile(investorId) {
            var inv = investors.find(function(x) { return String(x.id) === String(investorId); });
            if (!inv) return;
            var modal = document.createElement('div');
            modal.id = 'investor-profile-modal';
            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-2 sm:p-4 overflow-y-auto';
            modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

            var initial = (inv.name || 'I').charAt(0).toUpperCase();
            var profilePicHTML = '<div class="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full border-4 border-gray-900 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl">' + initial + '</div>';
            var coverStyle = 'background: linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b);';

            modal.innerHTML = `
                <div class="bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-3xl my-4 sm:my-8 overflow-hidden animate-fade-in">
                    <button onclick="document.getElementById('investor-profile-modal').remove()" class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-gray-800/90 hover:bg-gray-700 p-2 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700"><i data-lucide="x" class="w-5 h-5"></i></button>
                    <div class="h-32 sm:h-44 relative" style="${coverStyle}">
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    </div>
                    <div class="px-4 sm:px-8 pb-4 sm:pb-6 relative -mt-12 sm:-mt-16">
                        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                            <div class="shrink-0">${profilePicHTML}</div>
                            <div class="flex-1 text-center sm:text-left pt-1 sm:pt-2">
                                <h2 class="text-xl sm:text-2xl font-bold text-white">${inv.name}</h2>
                                <p class="text-purple-400 font-medium text-sm sm:text-lg">${inv.title || 'Investor'}</p>
                                ${inv.location ? `<p class="text-gray-500 text-xs sm:text-sm flex items-center justify-center sm:justify-start mt-1"><i data-lucide="map-pin" class="w-3 h-3 sm:w-4 sm:h-4 mr-1"></i> ${inv.location}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="px-4 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
                        ${inv.bio ? `<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-base sm:text-lg text-white mb-2 sm:mb-3 flex items-center"><i data-lucide="user" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-400"></i> About</h4><p class="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">${inv.bio}</p></div>` : ''}
                        
                        <div class="grid sm:grid-cols-2 gap-4">
                            <div class="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
                                <p class="text-xs text-gray-500 mb-1">Ticket Size</p>
                                <p class="text-lg font-bold text-white">${inv.ticketSize}</p>
                            </div>
                            <div class="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
                                <p class="text-xs text-gray-500 mb-1">Total Invested</p>
                                <p class="text-lg font-bold text-white">${inv.totalInvested}</p>
                            </div>
                        </div>

                        <div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6">
                            <h4 class="font-bold text-base sm:text-lg text-white mb-3 sm:mb-4 flex items-center"><i data-lucide="target" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400"></i> Industry Focus</h4>
                            <div class="flex flex-wrap gap-2">
                                ${inv.focus.map(f => `<span class="bg-gray-900 border border-gray-600 px-3 py-1.5 rounded-lg text-sm text-gray-200 font-medium">${f}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6">
                            <h4 class="font-bold text-base sm:text-lg text-white mb-3 sm:mb-4 flex items-center"><i data-lucide="phone" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400"></i> Contact Information</h4>
                            <div class="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                ${inv.email ? `<a href="mailto:${inv.email}" class="bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-3 transition-colors group"><div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><i data-lucide="mail" class="w-5 h-5 text-red-400"></i></div><div><p class="text-xs text-gray-500">Email</p><p class="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">${inv.email}</p></div></a>` : ''}
                                ${inv.linkedin ? `<a href="${inv.linkedin}" target="_blank" class="bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-3 transition-colors group"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><i data-lucide="linkedin" class="w-5 h-5 text-blue-400"></i></div><div><p class="text-xs text-gray-500">LinkedIn</p><p class="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">View Profile</p></div></a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();
        }

        // Reusing community view profile fallback if needed for talent profiles
        function viewSeekerProfile(talentId) {
            if (typeof window.viewCommunityProfile !== 'undefined') {
                window.viewCommunityProfile(talentId, 'Job Seeker');
            } else {
                alert("Profile viewer is loading, please try again.");
            }
        }

        function renderProfile() {
            var initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'F';
            var photoHTML = profileData.picture 
                ? '<img src="' + profileData.picture + '" alt="Profile" class="w-28 h-28 rounded-full object-cover">'
                : '<div class="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">' + initial + '</div>';
            
            var headerPhotoHTML = profileData.picture
                ? '<img src="' + profileData.picture + '" alt="Profile" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-900 shadow-xl">'
                : '<div class="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-gray-900 text-white">' + initial + '</div>';

            var coverStyle = profileData.coverPic
                ? 'background-image: url(' + profileData.coverPic + '); background-size: cover; background-position: center;'
                : 'background: linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b);';

            var socialBtns = '';
            if (profileData.github) socialBtns += '<a href="' + profileData.github + '" target="_blank" class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white border border-gray-600"><i data-lucide="github" class="w-4 h-4 mr-2"></i> GitHub</a>';
            if (profileData.linkedin) socialBtns += '<a href="' + profileData.linkedin + '" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>';
            if (profileData.email) socialBtns += '<a href="mailto:' + profileData.email + '" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white shadow-lg shadow-red-500/20"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Email</a>';
            if (!socialBtns) socialBtns = '<span class="text-gray-500 text-sm italic">Add your links below and save to see them here</span>';

            return `
                <div class="max-w-4xl space-y-6 animate-fade-in">
                    <!-- Profile Header with Cover Photo -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden">
                        <div id="cover-photo-preview" class="h-36 sm:h-48 relative" style="${coverStyle}">
                            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                            <div class="absolute top-3 right-3 flex gap-2 z-10">
                                <label class="cursor-pointer bg-gray-900/70 hover:bg-gray-900 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white transition border border-gray-600/50 flex items-center gap-1.5">
                                    <i data-lucide="image" class="w-3.5 h-3.5"></i> ${profileData.coverPic ? 'Change Cover' : 'Add Cover'}
                                    <input type="file" accept="image/*" onchange="handleCoverPhotoUpload(this)" class="hidden">
                                </label>
                                ${profileData.coverPic ? '<button onclick="removeCoverPhoto()" class="bg-gray-900/70 hover:bg-red-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white transition border border-gray-600/50 flex items-center gap-1.5"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Remove</button>' : ''}
                            </div>
                        </div>
                        <div class="px-6 sm:px-8 pb-6 relative -mt-14 sm:-mt-16">
                            <div class="flex flex-col md:flex-row items-center gap-5">
                                <div class="relative group shrink-0">
                                    ${headerPhotoHTML}
                                </div>
                                <div class="flex-1 text-center md:text-left pt-1">
                                    <h2 class="text-2xl sm:text-3xl font-bold mb-1 text-white">${profileData.name || '<span class="text-gray-500">Your Name</span>'}</h2>
                                    <p class="text-blue-400 font-medium mb-2">Founder</p>
                                    ${profileData.bio ? '<p class="text-gray-400 text-sm max-w-md">' + profileData.bio.substring(0, 120) + (profileData.bio.length > 120 ? '...' : '') + '</p>' : '<p class="text-gray-500 text-sm italic">No bio yet — add one below</p>'}
                                </div>
                                <div class="flex gap-3 flex-wrap justify-center">
                                    ${socialBtns}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Photo Upload Section -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="mb-6 border-b border-gray-700 pb-4">
                            <h3 class="font-bold text-xl text-white flex items-center"><i data-lucide="camera" class="w-5 h-5 mr-2 text-blue-400"></i> Profile Photo</h3>
                            <p class="text-sm text-gray-400 mt-1">Upload a photo (JPG/PNG). Images are auto-compressed.</p>
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

                <!-- Community Posts -->
                ${window.renderUserCommunityPostsFull ? window.renderUserCommunityPostsFull(profileData.email ? profileData.email.replace(/[.#$\[\]]/g, '_') : '', profileData.name) : ''}
            `;
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
        
        // Start community listener FIRST for fastest post loading
        if (typeof fetchCommunityPosts === "function") {
            fetchCommunityPosts();
        }
        
        // Render community tab immediately with cached data
        setTab('community');
        
        // Load profile + idea from Firebase, then update UI
        Promise.all([
            loadFounderProfileFromFirebase(),
            loadIdeaFromFirebase()
        ]).then(function() {
            updateHeaderAvatar();
            updateStartupNameDisplay();
            fetchIdeaApplications(); // <--- Fetch applications once idea is loaded
            // Load real data from Firebase (investors + job seekers)
            loadFirebaseData();
            renderContent();
        }).catch(function() {
            updateHeaderAvatar();
            updateStartupNameDisplay();
            fetchIdeaApplications(); // <--- Fetch applications once idea is loaded
            loadFirebaseData();
            renderContent();
        });
        
        lucide.createIcons();

        window.addEventListener('load', function() {
            setTimeout(function() {
                var p = document.getElementById('foundera-preloader');
                if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
            }, 1200);
        });

    // --- GLOBAL NOTIFICATIONS OVERRIDE (Founder) ---
    function setupFounderNotifications() {
        if (typeof window.buildNotifications !== 'function') {
            setTimeout(setupFounderNotifications, 500);
            return;
        }
        const originalBuildNotifications = window.buildNotifications;
        window.buildNotifications = function() {
            let notifs = [];
            try { notifs = originalBuildNotifications() || []; } catch(e){}
            
            if (typeof receivedApplications !== 'undefined' && receivedApplications.length > 0) {
                receivedApplications.forEach(app => {
                    notifs.push({
                        type: 'application',
                        emoji: '📄',
                        timestamp: parseInt(app.id) || Date.now(),
                        actorName: app.seekerName || 'Someone',
                        actorPic: app.seekerPic || '',
                        role: app.seekerTitle || 'Job Seeker',
                        appId: app.id
                    });
                });
            }
            
            notifs.sort((a, b) => b.timestamp - a.timestamp);
            window._notifications = notifs;
            return notifs;
        };
        
        window.toggleNotifPanel = function() {
            var panel = document.getElementById('notif-panel');
            if (panel) {
                panel.remove();
                window._notifPanelOpen = false;
                return;
            }
            window._notifPanelOpen = true;
            if(typeof window.markNotifsRead === 'function') window.markNotifsRead();
            
            var notifs = (window._notifications || []).slice(0, 30);
            var itemsHtml = '';
            if (notifs.length === 0) {
                itemsHtml = '<div class="p-8 text-center"><div class="w-14 h-14 mx-auto mb-3 bg-gray-700/30 rounded-full flex items-center justify-center"><i data-lucide="bell-off" class="w-7 h-7 text-gray-600"></i></div><p class="text-gray-500 text-sm">No notifications yet</p><p class="text-gray-600 text-xs mt-1">Applications and reactions will show up here</p></div>';
            } else {
                itemsHtml = notifs.map(function(n) {
                    var isUnread = n.timestamp > (window._notifLastSeen - 5000);
                    var diff = Date.now() - n.timestamp;
                    var mins = Math.floor(diff / 60000);
                    var ago = mins < 1 ? 'Just now' : mins < 60 ? mins + 'm ago' : Math.floor(mins/60) < 24 ? Math.floor(mins/60) + 'h ago' : Math.floor(mins/1440) + 'd ago';
                    
                    var avatar = n.actorPic
                        ? '<img src="' + n.actorPic + '" class="w-9 h-9 rounded-full object-cover shrink-0">'
                        : '<div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">' + (n.actorName ? n.actorName.charAt(0).toUpperCase() : '?') + '</div>';
                    
                    if (n.type === 'application') {
                        return '<div class="p-3 border-b border-gray-700/50 hover:bg-gray-800/80 cursor-pointer transition flex gap-3' + (isUnread ? ' bg-gray-800/40' : '') + '" onclick="setTab(\'ideaDetail\'); window.toggleNotifPanel()">' +
                            avatar +
                            '<div class="flex-1 min-w-0">' +
                                '<p class="text-sm text-gray-200"><span class="font-semibold text-white">' + escapeHtml(n.actorName) + '</span> applied for your startup</p>' +
                                '<p class="text-xs text-gray-400 mt-0.5 truncate">' + escapeHtml(n.role) + '</p>' +
                                '<p class="text-[10px] text-gray-600 mt-1">' + ago + '</p>' +
                            '</div></div>';
                    } else if (n.type === 'reaction') {
                        return '<div class="p-3 border-b border-gray-700/50 hover:bg-gray-800/80 cursor-pointer transition flex gap-3' + (isUnread ? ' bg-gray-800/40' : '') + '" onclick="window._goToNotifPost()">' +
                            avatar +
                            '<div class="flex-1 min-w-0">' +
                                '<p class="text-sm text-gray-200"><span class="font-semibold text-white">' + escapeHtml(n.actorName) + '</span> reacted ' + n.emoji + ' to your post</p>' +
                                '<p class="text-[10px] text-gray-600 mt-1">' + ago + '</p>' +
                            '</div></div>';
                    } else {
                        return '<div class="p-3 border-b border-gray-700/50 hover:bg-gray-800/80 cursor-pointer transition flex gap-3' + (isUnread ? ' bg-gray-800/40' : '') + '" onclick="window._goToNotifPost()">' +
                            avatar +
                            '<div class="flex-1 min-w-0">' +
                                '<p class="text-sm text-gray-200"><span class="font-semibold text-white">' + escapeHtml(n.actorName) + '</span> commented on your post</p>' +
                                '<p class="text-xs text-gray-400 mt-0.5 truncate">"' + escapeHtml(n.commentText) + '"</p>' +
                                '<p class="text-[10px] text-gray-600 mt-1">' + ago + '</p>' +
                            '</div></div>';
                    }
                }).join('');
            }
            var panelHtml = '<div id="notif-panel" class="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[100] max-h-[80vh] flex flex-col overflow-hidden">' +
                '<div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">' +
                    '<h3 class="font-bold text-white text-sm">Notifications</h3>' +
                    '<button onclick="window.toggleNotifPanel()" class="text-gray-500 hover:text-white p-1 transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
                '</div>' +
                '<div class="overflow-y-auto custom-scrollbar">' + itemsHtml + '</div>' +
            '</div>';
            
            var container = document.getElementById('notif-bell-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', panelHtml);
            } else {
                document.body.insertAdjacentHTML('beforeend', panelHtml);
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        window.buildNotifications();
        var badge = document.getElementById('notif-count-badge');
        if (badge) {
            var count = typeof window.getUnreadNotifCount === 'function' ? window.getUnreadNotifCount() : 0;
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    setupFounderNotifications();