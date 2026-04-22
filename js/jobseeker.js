// --- RELATIONAL DATA MODEL (Backend Friendly) ---
        let currentTab = 'profile';
        
        // Get name from localStorage
        const savedName = localStorage.getItem('seekerName') || '';
        const savedEmail = localStorage.getItem('seekerEmail') || '';
        
        // Profile Info
        let profileData = {
            id: 101,
            name: savedName,
            title: localStorage.getItem('seekerTitle') || '',
            location: localStorage.getItem('seekerLocation') || '',
            email: savedEmail,
            linkedin: localStorage.getItem('seekerLinkedin') || '',
            github: localStorage.getItem('seekerGithub') || '',
            bio: localStorage.getItem('seekerBio') || '',
            availability: localStorage.getItem('seekerAvailability') || '',
            expectedSalary: localStorage.getItem('seekerSalary') || '',
            cvUrl: localStorage.getItem('seekerCvUrl') || '',
            profilePic: localStorage.getItem('seekerProfilePic') || '',
            coverPic: localStorage.getItem('seekerCoverPic') || '',
            cvBase64: '',
            cvFileName: localStorage.getItem('seekerCvFileName') || ''
        };

        // Jobseeker AI Cache
        let jobseekerAIMatchCache = null;
        
        // --- LOAD PROFILE FROM FIREBASE (for data persistence across sessions) ---
        function loadJobseekerProfileFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database || !savedEmail) return Promise.resolve();
            var safeKey = savedEmail.replace(/[.#$\[\]]/g, '_');
            return firebase.database().ref('users/jobseekers/' + safeKey).once('value').then(function(snap) {
                var data = snap.val();
                if (data) {
                    profileData.name = data.name || profileData.name;
                    profileData.title = data.title || profileData.title;
                    profileData.location = data.location || profileData.location;
                    profileData.email = data.email || profileData.email;
                    profileData.linkedin = data.linkedin || profileData.linkedin;
                    profileData.github = data.github || profileData.github;
                    profileData.bio = data.bio || profileData.bio;
                    profileData.availability = data.availability || profileData.availability;
                    profileData.expectedSalary = data.expectedSalary || profileData.expectedSalary;
                    profileData.profilePic = data.profilePic || '';
                    profileData.coverPic = data.coverPic || '';
                    profileData.cvBase64 = data.cvBase64 || '';
                    profileData.cvFileName = data.cvFileName || '';
                    if (data.profilePic) localStorage.setItem('seekerProfilePic', data.profilePic);
                    if (data.coverPic) localStorage.setItem('seekerCoverPic', data.coverPic);
                    if (data.cvFileName) localStorage.setItem('seekerCvFileName', data.cvFileName);
                    if (Array.isArray(data.skills) && data.skills.length > 0) {
                        userSkills = data.skills;
                    }
                    if (Array.isArray(data.experiences) && data.experiences.length > 0) {
                        userExperiences = data.experiences;
                    }
                    if (Array.isArray(data.education) && data.education.length > 0) {
                        userEducation = data.education;
                    }
                    if (Array.isArray(data.certificates) && data.certificates.length > 0) {
                        userCertificates = data.certificates;
                    }
                    if (Array.isArray(data.projects) && data.projects.length > 0) {
                        userProjects = data.projects;
                    }
                    
                    // Load applications from firebase if exist
                    if (data.applications) {
                        userApplications = Object.values(data.applications);
                    }

                    // Sync back to localStorage
                    localStorage.setItem('seekerName', profileData.name);
                    localStorage.setItem('seekerEmail', profileData.email);
                    localStorage.setItem('seekerTitle', profileData.title);
                    localStorage.setItem('seekerLocation', profileData.location);
                    localStorage.setItem('seekerLinkedin', profileData.linkedin);
                    localStorage.setItem('seekerGithub', profileData.github);
                    localStorage.setItem('seekerBio', profileData.bio);
                    localStorage.setItem('seekerAvailability', profileData.availability);
                    localStorage.setItem('seekerSalary', profileData.expectedSalary);
                    localStorage.setItem('seekerApplications', JSON.stringify(userApplications));
                    
                    // Update UI initial
                    var initEl = document.getElementById('user-initial');
                    if (initEl) initEl.textContent = profileData.name.charAt(0).toUpperCase();
                    
                    // Update badge
                    var appBadge = document.getElementById('app-count-badge');
                    if (appBadge) appBadge.textContent = userApplications.length;

                    console.log('Jobseeker profile loaded from Firebase');
                }
            }).catch(function(e) { console.error('Firebase load error:', e); });
        }

        // --- LOGOUT FUNCTION ---
        function handleLogout() {
            // Sign out Firebase Auth
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(function(){});
            }
            localStorage.removeItem('seekerName');
            localStorage.removeItem('seekerEmail');
            localStorage.removeItem('seekerTitle');
            localStorage.removeItem('seekerLocation');
            localStorage.removeItem('seekerLinkedin');
            localStorage.removeItem('seekerGithub');
            localStorage.removeItem('seekerBio');
            localStorage.removeItem('seekerAvailability');
            localStorage.removeItem('seekerSalary');
            localStorage.removeItem('seekerCvUrl');
            localStorage.removeItem('seekerPicture');
            localStorage.removeItem('seekerProfilePic');
            localStorage.removeItem('seekerCoverPic');
            localStorage.removeItem('seekerCvFileName');
            localStorage.removeItem('seekerApplications');
            localStorage.removeItem('seekerSavedJobs');
            localStorage.removeItem('pendingSignup');
            window.location.href = 'index.html';
        }
        
        // --- SAVE PROFILE TO LOCALSTORAGE ---
        function saveProfileToStorage() {
            localStorage.setItem('seekerName', profileData.name);
            localStorage.setItem('seekerEmail', profileData.email);
            localStorage.setItem('seekerTitle', profileData.title);
            localStorage.setItem('seekerLocation', profileData.location);
            localStorage.setItem('seekerLinkedin', profileData.linkedin);
            localStorage.setItem('seekerGithub', profileData.github);
            localStorage.setItem('seekerBio', profileData.bio);
            localStorage.setItem('seekerAvailability', profileData.availability);
            localStorage.setItem('seekerSalary', profileData.expectedSalary);
            if (profileData.profilePic) localStorage.setItem('seekerProfilePic', profileData.profilePic);
            if (profileData.coverPic) localStorage.setItem('seekerCoverPic', profileData.coverPic);
            if (profileData.cvFileName) localStorage.setItem('seekerCvFileName', profileData.cvFileName);
            
            // Also save to Firebase
            saveJobseekerProfileToFirebase();
        }
        
        // --- SAVE JOBSEEKER PROFILE TO FIREBASE ---
        function saveJobseekerProfileToFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            var seekerData = {
                name: profileData.name,
                title: profileData.title,
                location: profileData.location,
                email: profileData.email,
                linkedin: profileData.linkedin,
                github: profileData.github,
                bio: profileData.bio,
                availability: profileData.availability,
                expectedSalary: profileData.expectedSalary,
                skills: userSkills,
                experiences: userExperiences,
                education: userEducation,
                certificates: userCertificates,
                projects: userProjects,
                profilePic: profileData.profilePic || '',
                coverPic: profileData.coverPic || '',
                cvBase64: profileData.cvBase64 || '',
                cvFileName: profileData.cvFileName || '',
                role: 'Job Seeker',
                profileUpdatedAt: new Date().toISOString()
            };
            db.ref('users/jobseekers/' + safeKey).update(seekerData)
                .then(function() { console.log('Jobseeker profile saved to Firebase'); })
                .catch(function(e) { console.error('Firebase save error:', e); });
        }

        // Experience, Education, Skills, Certificates, Projects — all empty, user fills manually
        let userExperiences = [];
        let userEducation = [];
        let userSkills = [];
        let userCertificates = [];
        let userProjects = [];

        // Growth Posts & Browse Seekers state
        let growthPosts = [];
        let allJobSeekers = [];
        let growthPostsListener = null;

        // Founders List (Startups) — will be loaded from Firebase
        let foundersList = [];
        let startupList = []; // Kept for logic compatibility

        // --- FETCH REAL FOUNDERS FROM FIREBASE ---
        function fetchFoundersFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/founders').once('value').then(function(snap) {
                var data = snap.val();
                foundersList = [];
                startupList = [];
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        var f = data[key];
                        const startupObj = {
                            id: key, // Use firebase key as unique ID
                            firebaseKey: key,
                            name: f.startupName || '',
                            founder: f.name || 'Unknown',
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
                            requirements: f.skillsNeeded ? (Array.isArray(f.skillsNeeded) ? f.skillsNeeded : String(f.skillsNeeded).split(',').map(s => s.trim())) : [],
                            matchScore: 0 // Default
                        };
                        foundersList.push(startupObj);
                        if(startupObj.hasIdea) startupList.push(startupObj);
                    });
                }
                console.log('JobSeeker: Loaded ' + foundersList.length + ' founders from Firebase');
            });
        }

        // User specific state
        let savedJobIds = []; 
        let userApplications = [];

        // --- STATE MANAGEMENT FUNCTIONS ---
        function setTab(tab) {
            currentTab = tab;
            updateSidebarActive();
            renderContent();
            // Scroll to top for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Close mobile sidebar after navigation
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
            
            document.getElementById('app-count-badge').textContent = userApplications.length;
        }

        // Profile Update
        function saveProfileInfo(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            
            profileData.name = fd.get('name');
            profileData.title = fd.get('title');
            profileData.location = fd.get('location');
            profileData.email = fd.get('email');
            profileData.linkedin = fd.get('linkedin');
            profileData.github = fd.get('github');
            profileData.bio = fd.get('bio');

            document.getElementById('user-initial').textContent = profileData.name.charAt(0).toUpperCase();
            
            // Clear AI cache because profile changed
            jobseekerAIMatchCache = null;
            
            saveProfileToStorage();
            closeModal('basic-info-modal');
            renderContent();
        }

        // Add Experience
        function addExperience(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            userExperiences.unshift({
                id: Date.now(),
                title: fd.get('title'),
                company: fd.get('company'),
                duration: fd.get('duration'),
                description: fd.get('description')
            });
            jobseekerAIMatchCache = null;
            closeModal('exp-modal');
            renderContent();
        }

        function deleteExperience(id) {
            if(confirm('Are you sure you want to delete this experience?')) {
                userExperiences = userExperiences.filter(e => e.id !== id);
                jobseekerAIMatchCache = null;
                renderContent();
            }
        }

        // Add Education
        function addEducation(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            userEducation.unshift({
                id: Date.now(),
                school: fd.get('school'),
                degree: fd.get('degree'),
                duration: fd.get('duration'),
                description: fd.get('description')
            });
            closeModal('edu-modal');
            renderContent();
        }

        function deleteEducation(id) {
            if(confirm('Are you sure you want to delete this education?')) {
                userEducation = userEducation.filter(e => e.id !== id);
                renderContent();
            }
        }

        // Add Skill
        function addSkill(event) {
            event.preventDefault();
            const input = document.getElementById('new-skill-input');
            const val = input.value.trim();
            if(val && !userSkills.includes(val)) {
                userSkills.push(val);
                jobseekerAIMatchCache = null;
                renderContent();
            }
            input.value = '';
        }

        function removeSkill(skillToRemove) {
            userSkills = userSkills.filter(s => s !== skillToRemove);
            jobseekerAIMatchCache = null;
            renderContent();
        }

        // Add Certificate
        function addCertificate(event) {
            event.preventDefault();
            const fd = new FormData(event.target);
            userCertificates.unshift({
                id: Date.now(),
                name: fd.get('name'),
                issuer: fd.get('issuer'),
                year: fd.get('year')
            });
            closeModal('cert-modal');
            renderContent();
        }

        function deleteCertificate(id) {
            if(confirm('Are you sure you want to delete this certificate?')) {
                userCertificates = userCertificates.filter(c => c.id !== id);
                renderContent();
            }
        }

        // --- PROFILE PIC UPLOAD (auto-compress, no size limit) ---
        function handleProfilePicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (typeof window.compressImageFile === 'function') {
                window.compressImageFile(file, 800, 800, 0.8).then(function(base64) {
                    profileData.profilePic = base64;
                    localStorage.setItem('seekerProfilePic', base64);
                    updateSeekerHeaderAvatar();
                    renderContent();
                });
            }
        }

        function removeProfilePic() {
            profileData.profilePic = '';
            localStorage.removeItem('seekerProfilePic');
            updateSeekerHeaderAvatar();
            renderContent();
        }

        // --- COVER PIC UPLOAD (auto-compress, no size limit) ---
        function handleCoverPicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (typeof window.compressImageFile === 'function') {
                window.compressImageFile(file, 1920, 1080, 0.75).then(function(base64) {
                    profileData.coverPic = base64;
                    localStorage.setItem('seekerCoverPic', base64);
                    renderContent();
                });
            }
        }

        function removeCoverPic() {
            profileData.coverPic = '';
            localStorage.removeItem('seekerCoverPic');
            renderContent();
        }

        // --- CV/PDF UPLOAD ---
        function handleCVUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (file.type !== 'application/pdf') { alert('Please select a PDF file only.'); return; }
            if (file.size > 5242880) { alert('CV file must be under 5MB.'); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                profileData.cvBase64 = e.target.result;
                profileData.cvFileName = file.name;
                localStorage.setItem('seekerCvFileName', file.name);
                renderContent();
            };
            reader.readAsDataURL(file);
        }

        function removeCVFile() {
            profileData.cvBase64 = '';
            profileData.cvFileName = '';
            localStorage.removeItem('seekerCvFileName');
            renderContent();
        }

        // --- UPDATE HEADER AVATAR ---
        function updateSeekerHeaderAvatar() {
            var container = document.getElementById('header-avatar-container');
            if (!container) return;
            if (profileData.profilePic) {
                container.innerHTML = '<img src="' + profileData.profilePic + '" alt="Profile" class="w-12 h-12 rounded-full object-cover">';
            } else {
                container.innerHTML = '<span id="user-initial">' + (profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S') + '</span>';
            }
        }

        // --- SAVE ALL CHANGES ---
        function saveAllChanges() {
            saveProfileToStorage();
            
            var btn = document.querySelector('.save-all-btn');
            if (btn) {
                btn.innerHTML = '<svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.3"></circle><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path></svg> Saving...';
                btn.disabled = true;
            }
            
            if (typeof firebase === 'undefined' || !firebase.database) {
                alert('Profile saved locally!');
                return;
            }
            var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
            var db = firebase.database();
            var fullData = {
                name: profileData.name,
                title: profileData.title,
                location: profileData.location,
                email: profileData.email,
                linkedin: profileData.linkedin,
                github: profileData.github,
                bio: profileData.bio,
                availability: profileData.availability,
                expectedSalary: profileData.expectedSalary,
                skills: userSkills,
                experiences: userExperiences,
                education: userEducation,
                certificates: userCertificates,
                projects: userProjects,
                profilePic: profileData.profilePic || '',
                coverPic: profileData.coverPic || '',
                cvBase64: profileData.cvBase64 || '',
                cvFileName: profileData.cvFileName || '',
                role: 'Job Seeker',
                profileUpdatedAt: new Date().toISOString()
            };
            db.ref('users/jobseekers/' + safeKey).update(fullData)
                .then(function() {
                    if (btn) {
                        btn.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i> Saved Successfully!';
                        btn.classList.remove('btn-highlight-green');
                        btn.style.background = '#16a34a';
                        setTimeout(function() {
                            btn.innerHTML = '<i data-lucide="save" class="w-6 h-6"></i> Save All Changes';
                            btn.style.background = '';
                            btn.classList.add('btn-highlight-green');
                            btn.disabled = false;
                            lucide.createIcons();
                        }, 2500);
                    }
                    lucide.createIcons();
                    console.log('All profile data saved to Firebase!');
                })
                .catch(function(e) {
                    console.error('Firebase save error:', e);
                    alert('Error saving. Changes saved locally.');
                    if (btn) {
                        btn.innerHTML = '<i data-lucide="save" class="w-6 h-6"></i> Save All Changes';
                        btn.disabled = false;
                        lucide.createIcons();
                    }
                });
        }

        // --- UTILITY HELPERS ---
        function escapeHtml(text) {
            if (!text) return '';
            return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // --- PROJECT CRUD ---
        function addProject(event) {
            event.preventDefault();
            var fd = new FormData(event.target);
            userProjects.unshift({
                id: Date.now(),
                name: fd.get('name'),
                tech: fd.get('tech'),
                url: fd.get('url'),
                description: fd.get('description')
            });
            closeModal('project-modal');
            renderContent();
        }
        function deleteProject(id) {
            if(confirm('Delete this project?')) {
                userProjects = userProjects.filter(function(p) { return p.id !== id; });
                renderContent();
            }
        }

        // --- BROWSE JOB SEEKERS FIREBASE ---
        function fetchAllJobSeekers() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/jobseekers').once('value').then(function(snap) {
                allJobSeekers = [];
                var data = snap.val();
                if (data) {
                    var myKey = profileData.email ? profileData.email.replace(/[.#$\[\]]/g, '_') : '';
                    Object.keys(data).forEach(function(key) {
                        if (key === myKey) return;
                        var s = data[key];
                        allJobSeekers.push({
                            key: key,
                            name: s.name || 'Unknown',
                            title: s.title || '',
                            location: s.location || '',
                            email: s.email || '',
                            bio: s.bio || '',
                            linkedin: s.linkedin || '',
                            github: s.github || '',
                            profilePic: s.profilePic || '',
                            skills: Array.isArray(s.skills) ? s.skills : [],
                            experiences: Array.isArray(s.experiences) ? s.experiences : [],
                            education: Array.isArray(s.education) ? s.education : [],
                            certificates: Array.isArray(s.certificates) ? s.certificates : [],
                            projects: Array.isArray(s.projects) ? s.projects : [],
                            availability: s.availability || '',
                            profileUpdatedAt: s.profileUpdatedAt || ''
                        });
                    });
                }
                console.log('Loaded ' + allJobSeekers.length + ' job seekers');
            });
        }
        
        function viewSeekerProfile(key) {
            var seeker = allJobSeekers.find(function(s) { return s.key === key; });
            if (!seeker) return;
            var modalHtml = '<div id="seeker-profile-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onclick="if(event.target===this || event.target.id===\'seeker-wrapper\')closeModal(\'seeker-profile-modal\')">' +
                '<div id="seeker-wrapper" class="flex min-h-full items-center justify-center py-6 w-full">' +
                '<div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-3xl flex flex-col relative">' +
                    '<div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10 rounded-t-2xl">' +
                        '<h2 class="text-xl font-bold text-white">' + escapeHtml(seeker.name) + '</h2>' +
                        '<button onclick="closeModal(\'seeker-profile-modal\')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>' +
                    '</div>' +
                    '<div class="p-6 space-y-6">' +
                        '<div class="flex items-start gap-5">' +
                            (seeker.profilePic ? '<img src="' + seeker.profilePic + '" class="w-20 h-20 rounded-2xl object-cover border-2 border-gray-700">' : '<div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">' + (seeker.name ? seeker.name.charAt(0).toUpperCase() : '?') + '</div>') +
                            '<div>' +
                                '<h3 class="text-2xl font-bold text-white">' + escapeHtml(seeker.name) + '</h3>' +
                                '<p class="text-gray-300">' + escapeHtml(seeker.title || 'Job Seeker') + '</p>' +
                                (seeker.location ? '<p class="text-sm text-gray-500 flex items-center mt-1"><i data-lucide="map-pin" class="w-4 h-4 mr-1"></i>' + escapeHtml(seeker.location) + '</p>' : '') +
                                '<div class="flex gap-2 mt-3">' +
                                    (seeker.email ? '<a href="mailto:' + seeker.email + '" class="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition hover:bg-green-500/30"><i data-lucide="mail" class="w-3.5 h-3.5 mr-1"></i>Contact</a>' : '') +
                                    (seeker.linkedin ? '<a href="' + seeker.linkedin + '" target="_blank" class="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition hover:bg-blue-500/30"><i data-lucide="linkedin" class="w-3.5 h-3.5 mr-1"></i>LinkedIn</a>' : '') +
                                    (seeker.github ? '<a href="' + seeker.github + '" target="_blank" class="bg-gray-700 text-gray-300 border border-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition hover:bg-gray-600"><i data-lucide="github" class="w-3.5 h-3.5 mr-1"></i>GitHub</a>' : '') +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        (seeker.bio ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-2 flex items-center"><i data-lucide="user" class="w-4 h-4 mr-2 text-green-400"></i>About</h4><p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">' + escapeHtml(seeker.bio) + '</p></div>' : '') +
                        (seeker.skills && seeker.skills.length > 0 ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-3 flex items-center"><i data-lucide="code" class="w-4 h-4 mr-2 text-yellow-400"></i>Skills</h4><div class="flex flex-wrap gap-2">' + seeker.skills.map(function(s) { return '<span class="bg-gray-800 text-gray-200 text-sm px-3 py-1 rounded-lg border border-gray-600">' + s + '</span>'; }).join('') + '</div></div>' : '') +
                        (seeker.experiences && seeker.experiences.length > 0 ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-3 flex items-center"><i data-lucide="briefcase" class="w-4 h-4 mr-2 text-blue-400"></i>Experience</h4><div class="space-y-4">' + seeker.experiences.map(function(exp) { return '<div class="border-b border-gray-700/50 pb-3 last:border-0 last:pb-0"><h5 class="font-bold text-white">' + escapeHtml(exp.title || '') + '</h5><p class="text-sm text-gray-400">' + escapeHtml(exp.company || '') + ' &bull; ' + escapeHtml(exp.duration || '') + '</p>' + (exp.description ? '<p class="text-sm text-gray-300 mt-1">' + escapeHtml(exp.description) + '</p>' : '') + '</div>'; }).join('') + '</div></div>' : '') +
                        (seeker.education && seeker.education.length > 0 ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-3 flex items-center"><i data-lucide="graduation-cap" class="w-4 h-4 mr-2 text-purple-400"></i>Education</h4><div class="space-y-4">' + seeker.education.map(function(edu) { return '<div class="border-b border-gray-700/50 pb-3 last:border-0 last:pb-0"><h5 class="font-bold text-white">' + escapeHtml(edu.school || '') + '</h5><p class="text-sm text-gray-400">' + escapeHtml(edu.degree || '') + ' &bull; ' + escapeHtml(edu.duration || '') + '</p></div>'; }).join('') + '</div></div>' : '') +
                        (seeker.projects && seeker.projects.length > 0 ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-3 flex items-center"><i data-lucide="folder-git-2" class="w-4 h-4 mr-2 text-orange-400"></i>Projects</h4><div class="space-y-4">' + seeker.projects.map(function(p) { return '<div class="border-b border-gray-700/50 pb-3 last:border-0 last:pb-0"><h5 class="font-bold text-white">' + escapeHtml(p.name || '') + '</h5>' + (p.tech ? '<p class="text-xs text-gray-400 mt-0.5">' + escapeHtml(p.tech) + '</p>' : '') + (p.description ? '<p class="text-sm text-gray-300 mt-1">' + escapeHtml(p.description) + '</p>' : '') + (p.url ? '<a href="' + p.url + '" target="_blank" class="text-xs text-green-400 hover:underline mt-1 inline-flex items-center"><i data-lucide="external-link" class="w-3 h-3 mr-1"></i>View Project</a>' : '') + '</div>'; }).join('') + '</div></div>' : '') +
                        (seeker.certificates && seeker.certificates.length > 0 ? '<div class="bg-gray-900/50 p-5 rounded-xl border border-gray-700"><h4 class="font-bold text-white mb-3 flex items-center"><i data-lucide="award" class="w-4 h-4 mr-2 text-green-400"></i>Certifications</h4><div class="space-y-3">' + seeker.certificates.map(function(c) { return '<div class="flex items-center justify-between"><div><span class="font-bold text-white text-sm">' + escapeHtml(c.name || '') + '</span><span class="text-xs text-gray-400 ml-2">' + escapeHtml(c.issuer || '') + ' &bull; ' + escapeHtml(c.year || '') + '</span></div></div>'; }).join('') + '</div></div>' : '') +
                        (window.renderUserCommunityPosts ? window.renderUserCommunityPosts(seeker.key, seeker.name) : '') +
                    '</div>' +
                '</div></div></div>';
            var existing = document.getElementById('seeker-profile-modal');
            if (existing) existing.remove();
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            lucide.createIcons();
        }
        function filterSeekers() {
            var query = (document.getElementById('seeker-search-input').value || '').toLowerCase().trim();
            var cards = document.querySelectorAll('.seeker-card');
            var visibleCount = 0;
            cards.forEach(function(card) {
                var name = card.getAttribute('data-name') || '';
                var title = card.getAttribute('data-title') || '';
                var skills = card.getAttribute('data-skills') || '';
                var match = !query || name.indexOf(query) !== -1 || title.indexOf(query) !== -1 || skills.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });
            var countEl = document.getElementById('seeker-count');
            if (countEl) countEl.textContent = visibleCount;
        }

        // Modal Handlers
        function openModal(id) { 
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden'); 
        }
        function closeModal(id) {
            var el = document.getElementById(id);
            if (el) { if (el.parentElement === document.body) { el.remove(); } else { el.classList.add('hidden'); } }
        }

        // Job Logic
        function toggleSaveJob(startupId) {
            if(savedJobIds.includes(String(startupId))) {
                savedJobIds = savedJobIds.filter(id => id !== String(startupId));
            } else {
                savedJobIds.push(String(startupId));
            }
            localStorage.setItem('seekerSavedJobs', JSON.stringify(savedJobIds));
            renderContent();
        }

        function applyToJob(startupId) {
            const hasApplied = userApplications.some(app => app.jobId === String(startupId));
            if(!hasApplied) {
                const appId = Date.now().toString();
                const newApp = {
                    id: appId,
                    jobId: String(startupId),
                    appliedDate: new Date().toISOString().split('T')[0],
                    status: 'Under Review'
                };
                userApplications.push(newApp);
                localStorage.setItem('seekerApplications', JSON.stringify(userApplications));
                
                // Save Application to Firebase Global and Jobseeker node
                if (typeof firebase !== 'undefined' && firebase.database) {
                    var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
                    firebase.database().ref('users/jobseekers/' + safeKey + '/applications/' + appId).set(newApp);
                    
                    // Send to global applications node for founder to see
                    firebase.database().ref('applications/' + startupId + '/' + safeKey).set({
                        ...newApp,
                        seekerName: profileData.name,
                        seekerEmail: profileData.email,
                        seekerTitle: profileData.title,
                        seekerPic: profileData.profilePic || ''
                    });
                }
                
                alert('Successfully applied to the startup! The founder has been notified.');
                renderContent();
            } else {
                alert('You have already applied to this startup.');
            }
        }

        function withdrawApplication(appId) {
            if(confirm('Are you sure you want to withdraw this application?')) {
                const appToWithdraw = userApplications.find(a => String(a.id) === String(appId));
                userApplications = userApplications.filter(a => String(a.id) !== String(appId));
                localStorage.setItem('seekerApplications', JSON.stringify(userApplications));
                
                // Remove from Firebase
                if (appToWithdraw && typeof firebase !== 'undefined' && firebase.database) {
                    var safeKey = profileData.email.replace(/[.#$\[\]]/g, '_');
                    firebase.database().ref('users/jobseekers/' + safeKey + '/applications/' + appId).remove();
                    firebase.database().ref('applications/' + appToWithdraw.jobId + '/' + safeKey).remove();
                }
                
                renderContent();
            }
        }

        function getJobDetails(startupId) {
            return startupList.find(j => String(j.id) === String(startupId));
        }

        // --- SKILL MATCHING LOGIC FOR JOBS (AI) ---
        async function generateAIJobMatches() {
            const container = document.getElementById('ai-job-container');
            if (!container) return;

            if (startupList.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No startup opportunities available right now.</div>';
                return;
            }

            if (jobseekerAIMatchCache) {
                renderMatchedJobs(jobseekerAIMatchCache);
                return;
            }

            try {
                const GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng';
                const prompt = `You are an expert AI Job Matchmaker for startup roles.
Job Seeker Profile:
Bio: ${profileData.bio || 'General Professional'}
Skills: ${userSkills.join(', ')}
Experiences: ${userExperiences.map(e => e.title + ' at ' + e.company).join(', ')}

Here are some open startup opportunities:
${startupList.map((s, i) => `${i+1}. ID: "${s.id}", Startup: ${s.name}, Industry: ${s.industry}, Skills Needed: ${s.requirements.join(', ')}`).join('\n')}

Score how well the job seeker fits each startup from 0-100. Provide a short 1-sentence reason. 
Output strictly a JSON array of objects with keys: "id" (string), "score" (number), "reason" (string).`;

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: "application/json" }
                    })
                });

                if (!response.ok) throw new Error("API Limit");
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                const aiScores = JSON.parse(text);

                // Map scores back to startupList
                let matchedList = startupList.map(s => {
                    const aiMatch = aiScores.find(a => String(a.id) === String(s.id));
                    if (aiMatch) {
                        return { ...s, matchScore: aiMatch.score, matchReason: aiMatch.reason };
                    }
                    return { ...s, matchScore: 30, matchReason: "Basic profile match" }; // fallback
                });

                matchedList.sort((a,b) => b.matchScore - a.matchScore);
                jobseekerAIMatchCache = matchedList;
                renderMatchedJobs(matchedList);

            } catch(error) {
                console.warn("AI Match Error - Using local fallback:", error);
                
                // Fallback scoring using basic string matching
                let matchedList = startupList.map(s => {
                    let score = 30;
                    let matches = 0;
                    const seekerSkillsStr = userSkills.join(' ').toLowerCase() + ' ' + (profileData.bio || '').toLowerCase();
                    s.requirements.forEach(req => {
                        if (seekerSkillsStr.includes(req.toLowerCase())) {
                            score += 20;
                            matches++;
                        }
                    });
                    return { ...s, matchScore: Math.min(score, 95), matchReason: `Matched ${matches} required skills based on profile keywords.` };
                });
                
                matchedList.sort((a,b) => b.matchScore - a.matchScore);
                jobseekerAIMatchCache = matchedList;
                renderMatchedJobs(matchedList);
            }
        }

        function renderMatchedJobs(jobs) {
            const container = document.getElementById('ai-job-container');
            if (!container) return;

            container.innerHTML = jobs.map(job => {
                const isSaved = savedJobIds.includes(String(job.id));
                const hasApplied = userApplications.some(app => app.jobId === String(job.id));
                
                return `
                    <div class="bg-gray-800/40 rounded-2xl border ${job.matchScore >= 80 ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700/50'} p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden">
                        ${job.matchScore >= 85 ? '<div class="absolute -right-10 top-5 bg-green-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-lg">TOP MATCH</div>' : ''}
                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                ${job.picture 
                                    ? '<img src="' + job.picture + '" class="w-14 h-14 rounded-xl object-cover border border-gray-600">'
                                    : '<div class="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-700 shadow-inner group-hover:border-green-500/50 transition-colors">' + job.name[0] + '</div>'
                                }
                                <div>
                                    <h3 class="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">Co-founder / Core Team</h3>
                                    <p class="text-sm text-gray-400">${job.name} <span class="text-gray-600 mx-1">•</span> <span class="text-gray-500">${job.founder}</span></p>
                                </div>
                            </div>
                            <div class="flex flex-col items-end shrink-0 ml-2">
                                <span class="bg-green-500/10 text-green-400 font-bold px-2.5 py-1 rounded-lg text-sm border border-green-500/20">${job.matchScore}% Match</span>
                            </div>
                        </div>
                        
                        ${job.matchReason ? '<p class="text-xs text-green-300 mb-3 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>' + job.matchReason + '</p>' : ''}
                        
                        <p class="text-sm text-gray-300 mb-5 line-clamp-3 flex-grow">${job.description || 'No description provided.'}</p>
                        
                        <div class="mb-6">
                            <p class="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Required Skills:</p>
                            <div class="flex flex-wrap gap-2">
                                ${job.requirements.length > 0 ? job.requirements.map(s => {
                                    const hasSkill = userSkills.some(us => us.toLowerCase() === s.toLowerCase());
                                    return `<span class="${hasSkill ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-gray-900 text-gray-400 border-gray-700'} border text-xs px-2.5 py-1 rounded-md flex items-center">
                                        ${hasSkill ? `<i data-lucide="check" class="w-3 h-3 mr-1"></i>` : ''} ${s}
                                    </span>`;
                                }).join('') : '<span class="text-gray-500 text-xs italic">Not specified</span>'}
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-between border-t border-gray-700/50 pt-4 mt-auto gap-4">
                            <div class="flex flex-wrap gap-3 text-xs text-gray-400">
                                <span class="flex items-center"><i data-lucide="briefcase" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.industry}</span>
                                <span class="flex items-center"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.stage}</span>
                                <span class="flex items-center text-white font-medium bg-gray-700/50 px-2 py-0.5 rounded"><i data-lucide="dollar-sign" class="w-3.5 h-3.5 mr-0.5 text-green-400"></i>${job.fundingNeeded || 'Not Disclosed'}</span>
                            </div>
                            <div class="flex gap-2 w-full sm:w-auto">
                                <button onclick="toggleSaveJob('${job.id}')" class="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-gray-400 flex items-center justify-center shrink-0">
                                    <i data-lucide="bookmark" class="w-5 h-5 ${isSaved ? 'fill-green-400 text-green-400' : ''}"></i>
                                </button>
                                ${hasApplied ? 
                                    `<button class="bg-gray-700 text-gray-400 px-6 py-2 rounded-lg font-bold text-sm w-full sm:w-auto cursor-not-allowed">Applied</button>` : 
                                    `<button onclick="applyToJob('${job.id}')" class="seeker-btn text-white px-6 py-2 rounded-lg font-bold text-sm w-full sm:w-auto shadow-lg">Apply Now</button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }


        // --- RENDER ROUTER ---
        function renderContent() {
            const content = document.getElementById('content');
            const pageTitle = document.getElementById('page-title');
            const pageSubtitle = document.getElementById('page-subtitle');
            
            const titles = {
                overview: { t: 'Command Center', s: 'Your central hub for startup job hunting.' },
                profile: { t: 'My Profile', s: 'Your complete professional details.' },
                jobs: { t: 'AI Job Matches', s: 'Jobs recommended based on your skills and CV.' },
                founders: { t: 'Browse Founders', s: 'Discover founders and see what they are looking for.' },
                community: { t: 'Community Feed', s: 'Connect, share, and grow with the entire Foundera community.' },
                seekers: { t: 'Browse Job Seekers', s: 'Discover other talented job seekers in the community.' },
                applications: { t: 'My Applications', s: 'Track your ongoing job applications.' },
                saved: { t: 'Saved Opportunities', s: 'Jobs you have bookmarked for later.' },
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
                    case 'jobs': content.innerHTML = renderJobs(); break;
                    case 'founders': content.innerHTML = renderFounders(); break;
                    case 'community': content.innerHTML = window.renderCommunity ? window.renderCommunity() : '<p class="p-8 text-center text-gray-500">Loading community feed...</p>'; break;
                    case 'seekers': content.innerHTML = renderBrowseSeekers(); break;
                    case 'applications': content.innerHTML = renderApplications(); break;
                    case 'saved': content.innerHTML = renderSavedJobs(); break;
                    case 'myposts': content.innerHTML = window.renderMyPosts ? window.renderMyPosts() : '<p class="p-8 text-center text-gray-500">Loading my posts...</p>'; break;
                }
                lucide.createIcons();
                requestAnimationFrame(function() { content.style.opacity = '1'; });
            });
        }

        // --- VIEWS ---
        function renderOverview() {
            var firstName = profileData.name ? profileData.name.split(' ')[0] : 'there';
            return `
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-gray-800 to-green-900/40 rounded-2xl p-8 border border-green-500/30 shadow-lg">
                        <h2 class="text-3xl font-bold mb-2 text-white">Welcome back, ${firstName}!</h2>
                        <p class="text-green-100 mb-6 max-w-2xl text-lg">Keep your profile updated and check your AI matches to land your next big startup role.</p>
                        <div class="flex flex-wrap gap-4">
                            <button onclick="setTab('jobs')" class="btn-highlight-green text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max">
                                <i data-lucide="sparkles" class="w-5 h-5 mr-2"></i> View Job Matches
                            </button>
                            <button onclick="setTab('founders')" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max transition-colors">
                                <i data-lucide="users" class="w-5 h-5 mr-2"></i> Browse Founders
                            </button>
                            <button onclick="setTab('community')" class="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max transition-colors">
                                <i data-lucide="message-circle" class="w-5 h-5 mr-2"></i> Community Feed
                            </button>
                            <button onclick="setTab('seekers')" class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg w-max transition-colors">
                                <i data-lucide="user-search" class="w-5 h-5 mr-2"></i> Browse Seekers
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow cursor-pointer hover:border-green-500/50 transition-colors" onclick="setTab('applications')">
                            <i data-lucide="file-text" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userApplications.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Applications</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow cursor-pointer hover:border-blue-500/50 transition-colors" onclick="setTab('saved')">
                            <i data-lucide="bookmark" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${savedJobIds.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Saved Jobs</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow cursor-pointer hover:border-yellow-500/50 transition-colors" onclick="setTab('profile')">
                            <i data-lucide="code" class="w-8 h-8 text-yellow-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userSkills.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Skills</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow cursor-pointer hover:border-orange-500/50 transition-colors" onclick="setTab('profile')">
                            <i data-lucide="folder-git-2" class="w-8 h-8 text-orange-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userProjects.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Projects</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // LinkedIn-style Profile
        function renderProfile() {
            var initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S';
            var profilePicHTML = profileData.profilePic 
                ? '<img src="' + profileData.profilePic + '" alt="Profile" class="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl">'
                : '<div class="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-white shadow-xl">' + initial + '</div>';

            var coverStyle = profileData.coverPic
                ? 'background-image: url(' + profileData.coverPic + '); background-size: cover; background-position: center;'
                : 'background: linear-gradient(135deg, #1f2937, #065f46, #1f2937);';

            var socialBtns = '';
            if (profileData.github) socialBtns += '<a href="' + profileData.github + '" target="_blank" class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white border border-gray-600"><i data-lucide="github" class="w-4 h-4 mr-2"></i> GitHub</a>';
            if (profileData.linkedin) socialBtns += '<a href="' + profileData.linkedin + '" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>';
            if (profileData.email) socialBtns += '<a href="mailto:' + profileData.email + '" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center text-white shadow-lg shadow-red-500/20"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Email</a>';

            return `
                <div class="max-w-4xl space-y-6 animate-fade-in relative">
                    
                    <!-- 1. Top Header Card -->
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
                                <button onclick="openModal('basic-info-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="pencil" class="w-5 h-5"></i></button>
                            </div>
                            <div class="mt-4">
                                <h1 class="text-2xl font-bold text-white">${profileData.name || 'Your Name'}</h1>
                                <p class="text-green-400 font-medium mt-1">${profileData.title || '<span class="text-gray-500 italic">Add your headline (e.g. Frontend Developer)</span>'}</p>
                                <p class="text-gray-500 text-sm mt-2 flex items-center"><i data-lucide="map-pin" class="w-4 h-4 mr-1"></i> ${profileData.location || 'Add location'}</p>
                                
                                <div class="flex flex-wrap gap-3 mt-5">
                                    ${socialBtns}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. About Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg relative">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="user" class="w-5 h-5 text-green-400 mr-2"></i> About</h2>
                            <button onclick="openModal('basic-info-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="pencil" class="w-5 h-5"></i></button>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${profileData.bio || '<span class="text-gray-500 italic">Click the edit button to add your bio and tell founders about yourself.</span>'}</p>
                    </div>

                    <!-- 3. Experience Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="briefcase" class="w-5 h-5 text-blue-400 mr-2"></i> Experience</h2>
                            <button onclick="openModal('exp-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-6">
                            ${userExperiences.length === 0 ? '<p class="text-gray-500 text-sm italic">No experience added yet. Click + to add your work experience.</p>' : ''}
                            ${userExperiences.map(exp => `
                                <div class="flex items-start group border-b border-gray-700/50 pb-6 last:border-0 last:pb-0">
                                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 shrink-0 text-gray-400 mr-4">
                                        <i data-lucide="briefcase" class="w-6 h-6"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h4 class="font-bold text-lg text-white">${exp.title}</h4>
                                                <p class="text-white text-sm mt-0.5">${exp.company}</p>
                                                <p class="text-gray-500 text-xs mt-1 mb-3">${exp.duration}</p>
                                            </div>
                                            <button onclick="deleteExperience(${exp.id})" class="text-gray-500 hover:text-red-400 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                        </div>
                                        <p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${exp.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 3b. Projects Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="folder-git-2" class="w-5 h-5 mr-2 text-yellow-400"></i>Projects</h2>
                            <button onclick="openModal('project-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-4">
                            ${userProjects.length === 0 ? '<p class="text-gray-500 text-sm italic">No projects added yet. Showcase your work by clicking +.</p>' : ''}
                            ${userProjects.map(proj => `
                                <div class="project-card bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-bold text-white text-lg">${proj.name}</h4>
                                            ${proj.tech ? '<p class="text-xs text-yellow-400/80 mt-1 font-medium">' + proj.tech + '</p>' : ''}
                                            ${proj.description ? '<p class="text-gray-300 text-sm mt-2 leading-relaxed whitespace-pre-line">' + proj.description + '</p>' : ''}
                                            ${proj.url ? '<a href="' + proj.url + '" target="_blank" class="text-green-400 text-xs hover:underline mt-2 inline-flex items-center"><i data-lucide="external-link" class="w-3 h-3 mr-1"></i>View Project</a>' : ''}
                                        </div>
                                        <button onclick="deleteProject(${proj.id})" class="text-gray-500 hover:text-red-400 p-2 shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 4. Education Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="graduation-cap" class="w-5 h-5 mr-2 text-purple-400"></i> Education</h2>
                            <button onclick="openModal('edu-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-6">
                            ${userEducation.length === 0 ? '<p class="text-gray-500 text-sm italic">No education history added yet.</p>' : ''}
                            ${userEducation.map(edu => `
                                <div class="flex items-start group border-b border-gray-700/50 pb-6 last:border-0 last:pb-0">
                                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 shrink-0 text-gray-400 mr-4">
                                        <i data-lucide="graduation-cap" class="w-6 h-6"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h4 class="font-bold text-lg text-white">${edu.school}</h4>
                                                <p class="text-white text-sm mt-0.5">${edu.degree}</p>
                                                <p class="text-gray-500 text-xs mt-1 mb-3">${edu.duration}</p>
                                            </div>
                                            <button onclick="deleteEducation(${edu.id})" class="text-gray-500 hover:text-red-400 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                        </div>
                                        <p class="text-gray-400 text-sm leading-relaxed">${edu.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 5. Skills Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="code" class="w-5 h-5 text-yellow-400 mr-2"></i> Skills</h2>
                        </div>
                        <form onsubmit="addSkill(event)" class="flex gap-3 mb-6">
                            <input type="text" id="new-skill-input" placeholder="Add a new skill (e.g. Next.js)..." required class="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                            <button type="submit" class="border border-green-500 text-green-400 hover:bg-green-500/10 px-6 py-3 rounded-xl font-bold transition">Add</button>
                        </form>
                        <div class="flex flex-wrap gap-3">
                            ${userSkills.map(skill => `
                                <div class="bg-gray-900 border border-gray-600 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm hover:border-gray-500 transition">
                                    <span class="text-gray-200 font-medium">${skill}</span>
                                    <button onclick="removeSkill('${skill}')" class="text-gray-500 hover:text-red-400 transition"><i data-lucide="x" class="w-4 h-4"></i></button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 6. Certificates Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center"><i data-lucide="award" class="w-5 h-5 text-orange-400 mr-2"></i> Licenses & Certifications</h2>
                            <button onclick="openModal('cert-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-4">
                            ${userCertificates.length === 0 ? '<p class="text-gray-500 text-sm italic">No certificates added yet.</p>' : ''}
                            ${userCertificates.map(cert => `
                                <div class="flex items-center justify-between border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h4 class="font-bold text-white">${cert.name}</h4>
                                        <p class="text-sm text-gray-400 mt-1">${cert.issuer} • Issued ${cert.year}</p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Verified</span>
                                        <button onclick="deleteCertificate(${cert.id})" class="text-gray-500 hover:text-red-400 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 7. CV/Resume Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <h2 class="text-xl font-bold text-white mb-2 flex items-center"><i data-lucide="file-text" class="w-5 h-5 text-green-400 mr-2"></i> Resume / CV</h2>
                        <p class="text-sm text-gray-400 mb-6">Upload your PDF resume. Founders can view and download it from your profile.</p>
                        <div class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-900/50 hover:border-green-500/50 transition cursor-pointer" onclick="document.getElementById('cv-upload-input').click()">
                            ${profileData.cvBase64 || profileData.cvFileName
                                ? '<i data-lucide="file-check" class="w-12 h-12 text-green-500 mx-auto mb-3"></i><p class="text-green-400 font-bold mb-2">' + (profileData.cvFileName || 'Resume uploaded') + '</p><span class="text-sm text-gray-400 underline">Click to upload a newer version</span>'
                                : '<i data-lucide="file-up" class="w-12 h-12 text-gray-500 mx-auto mb-3"></i><p class="text-gray-300 font-medium mb-1">Click to Upload PDF Resume</p><span class="text-xs text-gray-500">PDF only • Max size: 5MB</span>'
                            }
                        </div>
                        <input type="file" id="cv-upload-input" accept=".pdf,application/pdf" onchange="handleCVUpload(this)" class="hidden">
                        ${profileData.cvBase64 ? '<button onclick="removeCVFile()" class="mt-3 text-red-400 hover:text-red-300 text-sm font-medium flex items-center transition-colors"><i data-lucide="trash-2" class="w-4 h-4 mr-1"></i> Remove CV</button>' : ''}
                    </div>

                    <!-- Community Posts -->
                    ${window.renderUserCommunityPostsFull ? window.renderUserCommunityPostsFull(profileData.email ? profileData.email.replace(/[.#$\[\]]/g, '_') : '', profileData.name) : ''}

                    <!-- Save All Changes -->
                    <div class="sticky bottom-4 z-40">
                        <button onclick="saveAllChanges()" class="save-all-btn w-full btn-highlight-green text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                            <i data-lucide="save" class="w-6 h-6"></i> Save All Changes
                        </button>
                    </div>

                    <!-- ================= MODALS (Fixed Overflow/Clipping) ================== -->
                    
                    <!-- Basic Info & About Modal -->
                    <div id="basic-info-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto" onclick="if(event.target===this || event.target.id==='edit-profile-wrapper')closeModal('basic-info-modal')">
                        <div id="edit-profile-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl flex flex-col animate-fade-in relative">
                                <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                                    <h2 class="text-xl font-bold text-white">Edit Intro & About</h2>
                                    <button type="button" onclick="closeModal('basic-info-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                                </div>
                                <div class="p-6">
                                    <form onsubmit="saveProfileInfo(event)" class="space-y-5">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                                            <input type="text" name="name" value="${escapeHtml(profileData.name)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Headline (Title) *</label>
                                            <input type="text" name="title" value="${escapeHtml(profileData.title)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                                            <input type="text" name="location" value="${escapeHtml(profileData.location)}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                                <input type="email" name="email" value="${escapeHtml(profileData.email)}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-400 mb-1">LinkedIn URL</label>
                                                <input type="url" name="linkedin" value="${escapeHtml(profileData.linkedin)}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">GitHub URL</label>
                                            <input type="url" name="github" value="${escapeHtml(profileData.github)}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">About / Bio *</label>
                                            <textarea name="bio" rows="4" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">${escapeHtml(profileData.bio)}</textarea>
                                        </div>
                                        <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                            <button type="button" onclick="closeModal('basic-info-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                            <button type="submit" class="seeker-btn text-white px-6 py-3 rounded-xl font-bold flex-1">Save Profile</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Experience Modal -->
                    <div id="exp-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto" onclick="if(event.target===this || event.target.id==='exp-wrapper')closeModal('exp-modal')">
                        <div id="exp-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg flex flex-col animate-fade-in relative">
                                <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                                    <h2 class="text-xl font-bold text-white">Add Experience</h2>
                                    <button type="button" onclick="closeModal('exp-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                                </div>
                                <div class="p-6">
                                    <form onsubmit="addExperience(event)" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Title *</label>
                                            <input type="text" name="title" required placeholder="Ex: Software Engineer" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Company name *</label>
                                            <input type="text" name="company" required placeholder="Ex: Google" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Duration *</label>
                                            <input type="text" name="duration" required placeholder="Ex: Jan 2022 - Present" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                            <textarea name="description" rows="3" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white"></textarea>
                                        </div>
                                        <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                            <button type="button" onclick="closeModal('exp-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                            <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Experience</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Education Modal -->
                    <div id="edu-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto" onclick="if(event.target===this || event.target.id==='edu-wrapper')closeModal('edu-modal')">
                        <div id="edu-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg flex flex-col animate-fade-in relative">
                                <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                                    <h2 class="text-xl font-bold text-white">Add Education</h2>
                                    <button type="button" onclick="closeModal('edu-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                                </div>
                                <div class="p-6">
                                    <form onsubmit="addEducation(event)" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">School / University *</label>
                                            <input type="text" name="school" required placeholder="Ex: Dhaka University" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Degree *</label>
                                            <input type="text" name="degree" required placeholder="Ex: BSc in Computer Science" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Duration *</label>
                                            <input type="text" name="duration" required placeholder="Ex: 2018 - 2022" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Activities / Description</label>
                                            <textarea name="description" rows="2" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white"></textarea>
                                        </div>
                                        <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                            <button type="button" onclick="closeModal('edu-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                            <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Education</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Certificate Modal -->
                    <div id="cert-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto" onclick="if(event.target===this || event.target.id==='cert-wrapper')closeModal('cert-modal')">
                        <div id="cert-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg flex flex-col animate-fade-in relative">
                                <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                                    <h2 class="text-xl font-bold text-white">Add Certification</h2>
                                    <button type="button" onclick="closeModal('cert-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                                </div>
                                <div class="p-6">
                                    <form onsubmit="addCertificate(event)" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                                            <input type="text" name="name" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Issuing Organization *</label>
                                            <input type="text" name="issuer" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Issue Year *</label>
                                            <input type="text" name="year" required placeholder="Ex: 2024" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                        </div>
                                        <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                            <button type="button" onclick="closeModal('cert-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                            <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Certificate</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Project Modal -->
                    <div id="project-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto" onclick="if(event.target===this || event.target.id==='project-wrapper')closeModal('project-modal')">
                        <div id="project-wrapper" class="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg flex flex-col animate-fade-in relative">
                                <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                                    <h2 class="text-xl font-bold text-white">Add Project</h2>
                                    <button type="button" onclick="closeModal('project-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                                </div>
                                <div class="p-6">
                                    <form onsubmit="addProject(event)" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Project Name *</label>
                                            <input type="text" name="name" required placeholder="Ex: E-commerce Platform" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Technologies Used</label>
                                            <input type="text" name="tech" placeholder="Ex: React, Node.js, MongoDB" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Project URL</label>
                                            <input type="url" name="url" placeholder="https://github.com/..." class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                            <textarea name="description" rows="3" placeholder="What does this project do? What did you learn?" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white"></textarea>
                                        </div>
                                        <div class="pt-4 flex gap-3 mt-4 border-t border-gray-700/50 pt-6">
                                            <button type="button" onclick="closeModal('project-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition text-white w-1/3">Cancel</button>
                                            <button type="submit" class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-bold flex-1 transition-all">Save Project</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            `;
        }

        // New Founders Section
        function renderFounders() {
            if (foundersList.length === 0) {
                return `
                    <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                        <i data-lucide="users" class="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-2">No Founders Found Yet</h2>
                        <p class="text-gray-400">When founders create their profiles on Foundera, they will appear here.</p>
                    </div>`;
            }
            return `
                <div class="space-y-6">
                    <p class="text-sm text-gray-400"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i> Showing <strong class="text-white">${foundersList.length}</strong> real founders from database</p>
                    <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 shadow-lg mb-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1 relative">
                                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                                <input type="text" placeholder="Search founders by name, startup or industry..." class="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                            </div>
                            <select class="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white focus:ring-2 focus:ring-blue-500">
                                <option>All Industries</option>
                                <option>AgriTech</option><option>FinTech</option><option>HealthTech</option><option>EdTech</option><option>SaaS</option><option>AI/ML</option><option>E-commerce</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-8">
                        ${foundersList.map(founder => `
                            <div class="bg-gray-800/40 rounded-3xl border border-gray-700/50 p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                                <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="flex flex-col lg:flex-row gap-8">
                                    <!-- Left: Founder Profile -->
                                    <div class="lg:w-1/3 space-y-5">
                                        <div class="flex items-start gap-4">
                                            ${founder.picture 
                                                ? '<img src="' + founder.picture + '" class="w-16 h-16 rounded-2xl object-cover border border-gray-700 shadow-inner">'
                                                : '<div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-inner">' + founder.name.charAt(0) + '</div>'
                                            }
                                            <div>
                                                <h3 class="text-xl font-bold text-white">${founder.name}</h3>
                                                ${founder.startup 
                                                    ? '<p class="text-sm text-blue-400 font-medium">Founder @ ' + founder.startup + '</p>' 
                                                    : '<p class="text-sm text-gray-400 italic">No startup posted yet</p>'
                                                }
                                                <div class="flex gap-2 mt-2">
                                                    ${founder.linkedin ? '<a href="' + founder.linkedin + '" target="_blank" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="LinkedIn"><i data-lucide="linkedin" class="w-4 h-4"></i></a>' : ''}
                                                    ${founder.github ? '<a href="' + founder.github + '" target="_blank" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="GitHub"><i data-lucide="github" class="w-4 h-4"></i></a>' : ''}
                                                    ${founder.email ? '<a href="mailto:' + founder.email + '" class="p-1.5 bg-gray-700 rounded text-gray-300 hover:text-white transition" title="Email"><i data-lucide="mail" class="w-4 h-4"></i></a>' : ''}
                                                </div>
                                            </div>
                                        </div>

                                        ${founder.bio ? '<p class="text-gray-300 text-sm leading-relaxed">' + founder.bio + '</p>' : ''}

                                        ${founder.hasIdea ? '<div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700"><div class="grid grid-cols-2 gap-3 text-sm"><div><span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Industry</span><span class="font-medium text-white">' + founder.industry + '</span></div><div><span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Funding</span><span class="font-bold text-green-400">' + (founder.fundingNeeded || 'Not Disclosed') + '</span></div></div></div>' : ''}

                                        ${founder.skillsNeeded.length > 0 ? '<div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700"><p class="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Skills Needed:</p><div class="flex flex-wrap gap-2">' + founder.skillsNeeded.map(function(s){ return '<span class="bg-blue-500/15 text-blue-300 text-xs px-2.5 py-1 rounded-lg border border-blue-500/30">' + s + '</span>'; }).join('') + '</div></div>' : ''}

                                        <div class="flex gap-3 flex-wrap">
                                            ${typeof window.viewCommunityProfile !== 'undefined' ? `<button onclick="viewCommunityProfile('${founder.firebaseKey}','Founder')" class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg text-center transition-all flex items-center justify-center gap-1.5"><i data-lucide="eye" class="w-4 h-4"></i> View Profile</button>` : ''}
                                        </div>
                                    </div>

                                    <!-- Right: Full Idea Details -->
                                    ${founder.hasIdea ? '<div class="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-700/50 pt-6 lg:pt-0 lg:pl-8 space-y-5">' +
                                        '<div class="flex items-center gap-2 mb-2"><span class="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">Active Startup</span><span class="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">' + founder.industry + '</span></div>' +
                                        '<h4 class="text-2xl font-bold text-white">' + founder.startup + '</h4>' +
                                        (founder.description ? '<p class="text-gray-300 text-sm leading-relaxed">' + founder.description + '</p>' : '') +
                                        (founder.problem ? '<div><h5 class="text-white font-bold text-sm mb-1 flex items-center"><i data-lucide="alert-circle" class="w-4 h-4 text-red-400 mr-2"></i> Problem Statement</h5><p class="text-gray-400 text-sm leading-relaxed">' + founder.problem + '</p></div>' : '') +
                                        (founder.vision ? '<div><h5 class="text-white font-bold text-sm mb-1 flex items-center"><i data-lucide="eye" class="w-4 h-4 text-blue-400 mr-2"></i> Vision & Mission</h5><p class="text-gray-400 text-sm leading-relaxed">' + founder.vision + '</p></div>' : '') +
                                        (founder.businessPlan ? '<div><h5 class="text-white font-bold text-sm mb-1 flex items-center"><i data-lucide="briefcase" class="w-4 h-4 text-purple-400 mr-2"></i> Business Plan</h5><p class="text-gray-400 text-sm leading-relaxed">' + founder.businessPlan + '</p></div>' : '') +
                                    '</div>' : '<div class="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-700/50 pt-6 lg:pt-0 lg:pl-8 flex items-center justify-center"><div class="text-center py-8"><i data-lucide="file-question" class="w-12 h-12 text-gray-600 mx-auto mb-3"></i><p class="text-gray-500 text-sm">This founder has not shared their startup idea yet.</p></div></div>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // --- BROWSE JOB SEEKERS VIEW ---
        function renderBrowseSeekers() {
            var seekerCards = '';
            if (allJobSeekers.length === 0) {
                seekerCards = '<div class="col-span-full text-center py-16 bg-gray-800/40 rounded-2xl border border-gray-700/50"><i data-lucide="user-search" class="w-16 h-16 text-gray-600 mx-auto mb-4"></i><h3 class="text-xl font-bold text-white mb-2">No Other Job Seekers Yet</h3><p class="text-gray-400">When other job seekers join Foundera, they will appear here.</p></div>';
            } else {
                seekerCards = allJobSeekers.map(function(seeker) {
                    return '<div class="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-6 shadow-lg seeker-card" data-name="' + escapeHtml((seeker.name || '').toLowerCase()) + '" data-title="' + escapeHtml((seeker.title || '').toLowerCase()) + '" data-skills="' + escapeHtml((seeker.skills || []).join(',').toLowerCase()) + '">' +
                        '<div class="flex items-start gap-4 mb-4">' +
                            (seeker.profilePic ? '<img src="' + seeker.profilePic + '" class="w-14 h-14 rounded-xl object-cover border border-gray-700">' : '<div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-xl font-bold text-white">' + (seeker.name ? seeker.name.charAt(0).toUpperCase() : '?') + '</div>') +
                            '<div class="flex-1 min-w-0">' +
                                '<h3 class="font-bold text-white text-lg truncate">' + escapeHtml(seeker.name || 'Unknown') + '</h3>' +
                                '<p class="text-sm text-gray-400 truncate">' + escapeHtml(seeker.title || 'Job Seeker') + '</p>' +
                                (seeker.location ? '<p class="text-xs text-gray-500 flex items-center mt-1"><i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>' + escapeHtml(seeker.location) + '</p>' : '') +
                            '</div>' +
                        '</div>' +
                        (seeker.bio ? '<p class="text-sm text-gray-300 mb-4 line-clamp-2">' + escapeHtml(seeker.bio) + '</p>' : '') +
                        (seeker.skills && seeker.skills.length > 0 ? '<div class="flex flex-wrap gap-1.5 mb-4">' + seeker.skills.slice(0, 6).map(function(s) { return '<span class="bg-purple-500/10 text-purple-300 text-xs px-2 py-0.5 rounded-md border border-purple-500/20">' + escapeHtml(s) + '</span>'; }).join('') + (seeker.skills.length > 6 ? '<span class="text-xs text-gray-500">+' + (seeker.skills.length - 6) + ' more</span>' : '') + '</div>' : '') +
                        '<div class="flex items-center gap-2 pt-4 border-t border-gray-700/50">' +
                            '<button onclick="viewSeekerProfile(\'' + seeker.key + '\')" class="flex-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-4 py-2 rounded-xl text-sm font-bold transition text-center">View Profile</button>' +
                            (seeker.linkedin ? '<a href="' + seeker.linkedin + '" target="_blank" class="p-2 bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition"><i data-lucide="linkedin" class="w-4 h-4"></i></a>' : '') +
                            (seeker.email ? '<a href="mailto:' + seeker.email + '" class="p-2 bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition"><i data-lucide="mail" class="w-4 h-4"></i></a>' : '') +
                        '</div>' +
                    '</div>';
                }).join('');
            }

            return '<div class="space-y-6">' +
                '<div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 shadow-lg">' +
                    '<div class="flex flex-col md:flex-row gap-4">' +
                        '<div class="flex-1 relative">' +
                            '<i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>' +
                            '<input type="text" id="seeker-search-input" oninput="filterSeekers()" placeholder="Search by name, title, or skills..." class="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white">' +
                        '</div>' +
                        '<button onclick="fetchAllJobSeekers().then(function(){renderContent();})" class="bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh</button>' +
                    '</div>' +
                '</div>' +
                '<p class="text-sm text-gray-400"><i data-lucide="users" class="w-4 h-4 inline mr-1"></i> Showing <strong class="text-white" id="seeker-count">' + allJobSeekers.length + '</strong> job seekers from the community</p>' +
                '<div id="seekers-grid" class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">' + seekerCards + '</div>' +
            '</div>';
        }

        // --- GEMINI AI MATCHING LOGIC FOR JOBS ---
        async function generateAIJobMatches() {
            const container = document.getElementById('ai-job-container');
            if (!container) return;

            if (startupList.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No startup opportunities available right now.</div>';
                return;
            }

            if (jobseekerAIMatchCache) {
                renderMatchedJobs(jobseekerAIMatchCache);
                return;
            }

            try {
                const GEMINI_API_KEY = 'AIzaSyAHf2s0KF9BIeN-GqSsYydv5riqkiEz2ng';
                const prompt = `You are an expert AI Job Matchmaker for startup roles.
Job Seeker Profile:
Bio: ${profileData.bio || 'General Professional'}
Skills: ${userSkills.join(', ')}
Experiences: ${userExperiences.map(e => e.title + ' at ' + e.company).join(', ')}

Here are some open startup opportunities:
${startupList.map((s, i) => `${i+1}. ID: "${s.id}", Startup: ${s.name}, Industry: ${s.industry}, Skills Needed: ${s.requirements.join(', ')}`).join('\n')}

Score how well the job seeker fits each startup from 0-100. Provide a short 1-sentence reason. 
Output strictly a JSON array of objects with keys: "id" (string), "score" (number), "reason" (string).`;

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: "application/json" }
                    })
                });

                if (!response.ok) throw new Error("API Limit");
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                const aiScores = JSON.parse(text);

                // Map scores back to startupList
                let matchedList = startupList.map(s => {
                    const aiMatch = aiScores.find(a => String(a.id) === String(s.id));
                    if (aiMatch) {
                        return { ...s, matchScore: aiMatch.score, matchReason: aiMatch.reason };
                    }
                    return { ...s, matchScore: 30, matchReason: "Basic profile match" }; // fallback
                });

                matchedList.sort((a,b) => b.matchScore - a.matchScore);
                jobseekerAIMatchCache = matchedList;
                renderMatchedJobs(matchedList);

            } catch(error) {
                console.warn("AI Match Error - Using local fallback:", error);
                
                // Fallback scoring using basic string matching
                let matchedList = startupList.map(s => {
                    let score = 30;
                    let matches = 0;
                    const seekerSkillsStr = userSkills.join(' ').toLowerCase() + ' ' + (profileData.bio || '').toLowerCase();
                    s.requirements.forEach(req => {
                        if (seekerSkillsStr.includes(req.toLowerCase())) {
                            score += 20;
                            matches++;
                        }
                    });
                    return { ...s, matchScore: Math.min(score, 95), matchReason: `Matched ${matches} required skills based on profile keywords.` };
                });
                
                matchedList.sort((a,b) => b.matchScore - a.matchScore);
                jobseekerAIMatchCache = matchedList;
                renderMatchedJobs(matchedList);
            }
        }

        function renderMatchedJobs(jobs) {
            const container = document.getElementById('ai-job-container');
            if (!container) return;

            container.innerHTML = jobs.map(job => {
                const isSaved = savedJobIds.includes(String(job.id));
                const hasApplied = userApplications.some(app => app.jobId === String(job.id));
                
                return `
                    <div class="bg-gray-800/40 rounded-2xl border ${job.matchScore >= 80 ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700/50'} p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden">
                        ${job.matchScore >= 85 ? '<div class="absolute -right-10 top-5 bg-green-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-lg">TOP MATCH</div>' : ''}
                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                ${job.picture 
                                    ? '<img src="' + job.picture + '" class="w-14 h-14 rounded-xl object-cover border border-gray-600">'
                                    : '<div class="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-700 shadow-inner group-hover:border-green-500/50 transition-colors">' + job.name[0] + '</div>'
                                }
                                <div>
                                    <h3 class="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">Co-founder / Core Team</h3>
                                    <p class="text-sm text-gray-400">${job.name} <span class="text-gray-600 mx-1">•</span> <span class="text-gray-500">${job.founder}</span></p>
                                </div>
                            </div>
                            <div class="flex flex-col items-end shrink-0 ml-2">
                                <span class="bg-green-500/10 text-green-400 font-bold px-2.5 py-1 rounded-lg text-sm border border-green-500/20">${job.matchScore}% Match</span>
                            </div>
                        </div>
                        
                        ${job.matchReason ? '<p class="text-xs text-green-300 mb-3 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20"><i data-lucide="sparkles" class="w-3 h-3 inline mr-1"></i>' + job.matchReason + '</p>' : ''}
                        
                        <p class="text-sm text-gray-300 mb-5 line-clamp-3 flex-grow">${job.description || 'No description provided.'}</p>
                        
                        <div class="mb-6">
                            <p class="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Required Skills:</p>
                            <div class="flex flex-wrap gap-2">
                                ${job.requirements.length > 0 ? job.requirements.map(s => {
                                    const hasSkill = userSkills.some(us => us.toLowerCase() === s.toLowerCase());
                                    return `<span class="${hasSkill ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-gray-900 text-gray-400 border-gray-700'} border text-xs px-2.5 py-1 rounded-md flex items-center">
                                        ${hasSkill ? `<i data-lucide="check" class="w-3 h-3 mr-1"></i>` : ''} ${s}
                                    </span>`;
                                }).join('') : '<span class="text-gray-500 text-xs italic">Not specified</span>'}
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-between border-t border-gray-700/50 pt-4 mt-auto gap-4">
                            <div class="flex flex-wrap gap-3 text-xs text-gray-400">
                                <span class="flex items-center"><i data-lucide="briefcase" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.industry}</span>
                                <span class="flex items-center"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.stage}</span>
                                <span class="flex items-center text-white font-medium bg-gray-700/50 px-2 py-0.5 rounded"><i data-lucide="dollar-sign" class="w-3.5 h-3.5 mr-0.5 text-green-400"></i>${job.fundingNeeded || 'Not Disclosed'}</span>
                            </div>
                            <div class="flex gap-2 w-full sm:w-auto">
                                <button onclick="toggleSaveJob('${job.id}')" class="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-gray-400 flex items-center justify-center shrink-0">
                                    <i data-lucide="bookmark" class="w-5 h-5 ${isSaved ? 'fill-green-400 text-green-400' : ''}"></i>
                                </button>
                                ${hasApplied ? 
                                    `<button class="bg-gray-700 text-gray-400 px-6 py-2 rounded-lg font-bold text-sm w-full sm:w-auto cursor-not-allowed">Applied</button>` : 
                                    `<button onclick="applyToJob('${job.id}')" class="seeker-btn text-white px-6 py-2 rounded-lg font-bold text-sm w-full sm:w-auto shadow-lg">Apply Now</button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        function renderJobs() {
            setTimeout(generateAIJobMatches, 100);

            return `
                <div class="space-y-6">
                    <!-- AI Match Info -->
                    <div class="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p class="text-green-200 text-sm">
                            <i data-lucide="sparkles" class="w-4 h-4 inline-block mr-1"></i>
                            AI recommended these startup opportunities based on your profile and <strong class="text-white">${userSkills.length} skills</strong>.
                        </p>
                        <button onclick="renderContent()" class="text-green-400 hover:text-green-300 text-sm font-bold flex items-center whitespace-nowrap bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 transition-colors">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-1"></i> Refresh Matches
                        </button>
                    </div>

                    <!-- Job Listings -->
                    <div id="ai-job-container" class="grid lg:grid-cols-2 gap-6">
                        <div class="col-span-full py-20 flex flex-col items-center justify-center">
                            <div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-green-400 font-medium animate-pulse">AI is analyzing startup ideas based on your skills...</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderApplications() {
            return `
                <div class="space-y-6">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
                        <div class="overflow-x-auto">
                        <table class="w-full text-left min-w-[600px]">
                            <thead class="bg-gray-900/50 border-b border-gray-700/50">
                                <tr>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Job Details</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Date Applied</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300">Status</th>
                                    <th class="px-6 py-4 text-sm font-bold text-gray-300 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700/30">
                                ${userApplications.length === 0 ? `<tr><td colspan="4" class="p-6 text-center text-gray-400">No applications yet.</td></tr>` : ''}
                                ${userApplications.map(app => {
                                    const job = getJobDetails(app.jobId);
                                    return `
                                    <tr class="hover:bg-gray-800/60 transition-colors">
                                        <td class="px-6 py-4">
                                            <p class="font-bold text-white">Co-founder / Core Team</p>
                                            <p class="text-xs text-gray-400">${job ? job.name : 'Unknown Startup'}</p>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-300">${app.appliedDate}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 rounded-md text-xs font-bold border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">${app.status}</span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="withdrawApplication('${app.id}')" class="text-sm text-red-400 hover:underline">Withdraw</button>
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

        function renderSavedJobs() {
            const savedJobsList = savedJobIds.map(id => getJobDetails(id)).filter(Boolean);
            
            return `
                <div class="space-y-6">
                    ${savedJobsList.length === 0 ? `
                        <div class="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                            <i data-lucide="bookmark" class="w-12 h-12 text-gray-600 mx-auto mb-4"></i>
                            <h3 class="text-xl font-bold text-white">No Saved Jobs</h3>
                            <p class="text-gray-400 mt-2">Jobs you bookmark will appear here.</p>
                        </div>
                    ` : `
                        <div class="grid md:grid-cols-2 gap-6">
                            ${savedJobsList.map(job => `
                                <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 shadow-lg">
                                    <div class="flex justify-between">
                                        <div>
                                            <h3 class="font-bold text-white text-lg">Co-founder / Core Team</h3>
                                            <p class="text-sm text-green-400">${job.name}</p>
                                        </div>
                                        <button onclick="toggleSaveJob('${job.id}')" class="text-green-400 hover:text-gray-400 transition"><i data-lucide="bookmark" class="w-6 h-6 fill-current"></i></button>
                                    </div>
                                    <div class="mt-6 flex gap-3">
                                        <button onclick="applyToJob('${job.id}')" class="seeker-btn text-white px-6 py-2 rounded-lg font-bold text-sm w-full">Apply Now</button>
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
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('hidden');
        }

        // --- INIT ---
        // Auth guard — redirect if not logged in
        if (!localStorage.getItem('seekerName') && !localStorage.getItem('seekerEmail')) {
            window.location.href = 'index.html';
        }

        // Load from localStorage — set user initial safely
        var displayInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S';
        document.getElementById('user-initial').textContent = displayInitial;
        if (profileData.profilePic) updateSeekerHeaderAvatar();
        
        // Load saved applications and saved jobs from localStorage (with error handling)
        try {
            var savedApplications = localStorage.getItem('seekerApplications');
            if (savedApplications) { userApplications = JSON.parse(savedApplications); }
        } catch(e) { console.warn('Failed to parse seekerApplications:', e); userApplications = []; }
        
        try {
            var savedSavedJobs = localStorage.getItem('seekerSavedJobs');
            if (savedSavedJobs) { savedJobIds = JSON.parse(savedSavedJobs); }
        } catch(e) { console.warn('Failed to parse seekerSavedJobs:', e); savedJobIds = []; }
        
        // Update badge count
        var appBadge = document.getElementById('app-count-badge');
        if (appBadge) appBadge.textContent = userApplications.length;
        
        // RENDER IMMEDIATELY with localStorage data — don't wait for Firebase
        // Start community listener FIRST for fastest post loading
        if (typeof window.fetchCommunityPosts === "function") {
            window.fetchCommunityPosts();
        }
        
        setTab('community');
        
        // Then load fresh data from Firebase and re-render
        Promise.all([
            loadJobseekerProfileFromFirebase(),
            fetchFoundersFromFirebase(),
            fetchAllJobSeekers()
        ]).then(function() {
            // Re-render with updated Firebase data
            updateSeekerHeaderAvatar();
            renderContent();
        }).catch(function(err) {
            console.warn('Firebase load error (dashboard still works with local data):', err);
        });
        
        if (typeof lucide !== 'undefined') { lucide.createIcons(); }

        window.addEventListener('load', function() {
            setTimeout(function() {
                var p = document.getElementById('foundera-preloader');
                if (p) { p.classList.add('preloader-hidden'); setTimeout(function() { p.remove(); }, 600); }
            }, 1200);
        });