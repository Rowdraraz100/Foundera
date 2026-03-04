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
                    // Update UI initial
                    var initEl = document.getElementById('user-initial');
                    if (initEl) initEl.textContent = profileData.name.charAt(0).toUpperCase();
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

        // Detailed Experience & Projects (LinkedIn Style)
        let userExperiences = [
            { 
                id: 1, 
                title: 'Frontend Developer', 
                company: 'TechFlow BD', 
                duration: 'Jan 2024 - Present', 
                description: 'Developed scalable React applications and improved website performance by 40%. Collaborated with the UI/UX team to implement responsive designs.'
            },
            { 
                id: 2, 
                title: 'Junior Web Developer', 
                company: 'Startup IT Solutions', 
                duration: 'Oct 2022 - Dec 2023', 
                description: 'Maintained and updated legacy codebases. Assisted in migrating from monolithic architecture to microservices using Node.js.'
            }
        ];

        // Education Data
        let userEducation = [
            {
                id: 1,
                school: 'University of Dhaka',
                degree: 'BSc in Computer Science & Engineering',
                duration: '2018 - 2022',
                description: 'Graduated with a CGPA of 3.85. President of the University Programming Club.'
            }
        ];

        // Skills Data
        let userSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Git'];
        
        // Certificates
        let userCertificates = [
            { id: 1, name: 'AWS Certified Developer', issuer: 'Amazon', year: '2025' },
            { id: 2, name: 'Advanced React Patterns', issuer: 'Frontend Masters', year: '2024' }
        ];

        // Master Job List
        const jobList = [
            { id: 1, title: 'Frontend React Developer', company: 'Krishi-AI', founder: 'Rahim Uddin', description: 'Build beautiful UI for our AI platform.', requiredSkills: ['React', 'Tailwind CSS'], salary: '$1,500/month', type: 'Full-time', location: 'Remote', matchScore: 95 },
            { id: 2, title: 'Backend Node Engineer', company: 'FinSheba', founder: 'Sadia Rahman', description: 'Develop secure backend services.', requiredSkills: ['Node.js', 'AWS'], salary: '$2,000/month', type: 'Full-time', location: 'Hybrid', matchScore: 80 },
            { id: 3, title: 'Mobile Developer', company: 'HealthBuddy', founder: 'Karim Ahmed', description: 'Create mobile apps.', requiredSkills: ['Flutter', 'Firebase'], salary: '$1,800/month', type: 'Full-time', location: 'Remote', matchScore: 20 }
        ];

        // Founders List — will be loaded from Firebase
        let foundersList = [];

        // --- FETCH REAL FOUNDERS FROM FIREBASE ---
        function fetchFoundersFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve();
            return firebase.database().ref('users/founders').once('value').then(function(snap) {
                var data = snap.val();
                foundersList = [];
                if (data) {
                    var idx = 1;
                    Object.keys(data).forEach(function(key) {
                        var f = data[key];
                        foundersList.push({
                            id: idx,
                            name: f.name || 'Unknown',
                            startup: f.startupName || '',
                            industry: f.industry || 'General',
                            bio: f.bio || '',
                            picture: f.picture || '',
                            description: f.ideaDescription || '',
                            problem: f.problem || '',
                            vision: f.vision || '',
                            businessPlan: f.businessPlan || '',
                            skillsNeeded: Array.isArray(f.skillsNeeded) ? f.skillsNeeded : (f.skillsNeeded ? String(f.skillsNeeded).split(',').map(function(s){return s.trim();}) : []),
                            fundingNeeded: f.fundingNeeded || '',
                            requirements: f.skills ? f.skills.split(',').map(function(s) { return s.trim(); }) : (Array.isArray(f.skillsNeeded) ? f.skillsNeeded : []),
                            linkedin: f.linkedin || '',
                            github: f.github || '',
                            email: f.email || '',
                            hasIdea: !!f.startupName
                        });
                        idx++;
                    });
                }
                console.log('JobSeeker: Loaded ' + foundersList.length + ' founders from Firebase');
            });
        }

        // User specific state
        let savedJobIds = [2]; 
        let userApplications = [
            { id: 1, jobId: 1, appliedDate: '2026-02-28', status: 'Under Review' }
        ];

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
            closeModal('exp-modal');
            renderContent();
        }

        function deleteExperience(id) {
            if(confirm('Are you sure you want to delete this experience?')) {
                userExperiences = userExperiences.filter(e => e.id !== id);
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
                renderContent();
            }
            input.value = '';
        }

        function removeSkill(skillToRemove) {
            userSkills = userSkills.filter(s => s !== skillToRemove);
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

        // --- PROFILE PIC UPLOAD ---
        function handleProfilePicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (file.size > 512000) { alert('Profile photo must be under 500KB. Please compress and try again.'); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                profileData.profilePic = e.target.result;
                localStorage.setItem('seekerProfilePic', e.target.result);
                updateSeekerHeaderAvatar();
                renderContent();
            };
            reader.readAsDataURL(file);
        }

        function removeProfilePic() {
            profileData.profilePic = '';
            localStorage.removeItem('seekerProfilePic');
            updateSeekerHeaderAvatar();
            renderContent();
        }

        // --- COVER PIC UPLOAD ---
        function handleCoverPicUpload(input) {
            if (!input.files || !input.files[0]) return;
            var file = input.files[0];
            if (!file.type.match('image.*')) { alert('Please select an image file (JPG, PNG, etc.)'); return; }
            if (file.size > 1048576) { alert('Cover photo must be under 1MB. Please compress and try again.'); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                profileData.coverPic = e.target.result;
                localStorage.setItem('seekerCoverPic', e.target.result);
                renderContent();
            };
            reader.readAsDataURL(file);
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

        // Modal Handlers
        function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
        function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

        // Job Logic
        function toggleSaveJob(jobId) {
            if(savedJobIds.includes(jobId)) {
                savedJobIds = savedJobIds.filter(id => id !== jobId);
            } else {
                savedJobIds.push(jobId);
            }
            localStorage.setItem('seekerSavedJobs', JSON.stringify(savedJobIds));
            renderContent();
        }

        function applyToJob(jobId) {
            const hasApplied = userApplications.some(app => app.jobId === jobId);
            if(!hasApplied) {
                userApplications.push({
                    id: Date.now(),
                    jobId: jobId,
                    appliedDate: new Date().toISOString().split('T')[0],
                    status: 'Under Review'
                });
                localStorage.setItem('seekerApplications', JSON.stringify(userApplications));
                alert('Successfully applied to the job!');
                renderContent();
            } else {
                alert('You have already applied to this job.');
            }
        }

        function withdrawApplication(appId) {
            if(confirm('Are you sure you want to withdraw this application?')) {
                userApplications = userApplications.filter(a => a.id !== appId);
                localStorage.setItem('seekerApplications', JSON.stringify(userApplications));
                renderContent();
            }
        }

        function getJobDetails(jobId) {
            return jobList.find(j => j.id === jobId);
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
                applications: { t: 'My Applications', s: 'Track your ongoing job applications.' },
                saved: { t: 'Saved Opportunities', s: 'Jobs you have bookmarked for later.' }
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
                    case 'jobs': content.innerHTML = renderJobs(); break;
                    case 'founders': content.innerHTML = renderFounders(); break;
                    case 'applications': content.innerHTML = renderApplications(); break;
                    case 'saved': content.innerHTML = renderSavedJobs(); break;
                }
                lucide.createIcons();
                content.style.opacity = '1';
                content.style.transition = 'opacity 0.3s ease';
            }, 50);
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
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow">
                            <i data-lucide="file-text" class="w-8 h-8 text-green-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userApplications.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Applications</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow">
                            <i data-lucide="bookmark" class="w-8 h-8 text-blue-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${savedJobIds.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Saved Jobs</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow">
                            <i data-lucide="code" class="w-8 h-8 text-yellow-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userSkills.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Skills Added</span>
                        </div>
                        <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center text-center shadow">
                            <i data-lucide="award" class="w-8 h-8 text-purple-400 mb-3"></i>
                            <span class="text-3xl font-bold text-white">${userCertificates.length}</span>
                            <span class="text-xs text-gray-400 uppercase mt-2">Certificates</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // LinkedIn-style Profile
        function renderProfile() {
            return `
                <div class="max-w-4xl space-y-6 animate-fade-in relative">
                    
                    <!-- 1. Top Header Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg relative">
                        <div class="h-48 relative group cursor-pointer" style="${profileData.coverPic ? 'background-image: url(' + profileData.coverPic + '); background-size: cover; background-position: center;' : 'background: linear-gradient(135deg, #1f2937, #065f46, #1f2937);'}" onclick="document.getElementById('cover-pic-input').click()">
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
                                ${profileData.profilePic 
                                    ? '<img src="' + profileData.profilePic + '" alt="Profile" class="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl">'
                                    : '<div class="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-white shadow-xl">' + (profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S') + '</div>'
                                }
                                <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <i data-lucide="camera" class="w-6 h-6 text-white"></i>
                                </div>
                                <input type="file" id="profile-pic-input" accept="image/*" onchange="handleProfilePicUpload(this)" class="hidden">
                            </div>
                            <div class="flex justify-end mt-4 gap-2">
                                ${profileData.profilePic ? '<button onclick="removeProfilePic()" class="p-2 hover:bg-red-500/20 rounded-full transition text-red-400 text-xs flex items-center" title="Remove photo"><i data-lucide="trash-2" class="w-4 h-4 mr-1"></i><span class="hidden sm:inline">Remove Photo</span></button>' : ''}
                                <button onclick="openModal('basic-info-modal')" class="p-2 hover:bg-gray-700 rounded-full transition"><i data-lucide="pencil" class="w-5 h-5 text-gray-400"></i></button>
                            </div>
                            <div class="mt-4">
                                <h1 class="text-2xl font-bold text-white">${profileData.name || 'Your Name'}</h1>
                                <p class="text-gray-300 text-lg mt-1">${profileData.title || '<span class="text-gray-500 italic">Add your headline</span>'}</p>
                                <p class="text-gray-500 text-sm mt-2 flex items-center"><i data-lucide="map-pin" class="w-4 h-4 mr-1"></i> ${profileData.location || 'Add location'}</p>
                                
                                <div class="flex flex-wrap gap-3 mt-5">
                                    <a href="mailto:${profileData.email}" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center text-white"><i data-lucide="mail" class="w-4 h-4 mr-2"></i> Contact Info</a>
                                    ${profileData.linkedin ? '<a href="' + profileData.linkedin + '" target="_blank" class="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center"><i data-lucide="linkedin" class="w-4 h-4 mr-2"></i> LinkedIn</a>' : ''}
                                    ${profileData.github ? '<a href="' + profileData.github + '" target="_blank" class="bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center"><i data-lucide="github" class="w-4 h-4 mr-2"></i> GitHub</a>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. About Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg relative">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-white">About</h2>
                            <button onclick="openModal('basic-info-modal')" class="p-2 hover:bg-gray-700 rounded-full transition"><i data-lucide="pencil" class="w-5 h-5 text-gray-400"></i></button>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${profileData.bio || '<span class="text-gray-500 italic">Click the edit button to add your bio and tell founders about yourself.</span>'}</p>
                    </div>

                    <!-- 3. Experience Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center">Experience & Projects</h2>
                            <button onclick="openModal('exp-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-6">
                            ${userExperiences.length === 0 ? '<p class="text-gray-500 text-sm italic">No experience added yet.</p>' : ''}
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
                                        <p class="text-gray-300 text-sm leading-relaxed">${exp.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 4. Education Card -->
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white flex items-center">Education</h2>
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
                            <h2 class="text-xl font-bold text-white">Skills</h2>
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
                            <h2 class="text-xl font-bold text-white">Licenses & Certifications</h2>
                            <button onclick="openModal('cert-modal')" class="p-2 hover:bg-gray-700 rounded-full transition text-gray-400"><i data-lucide="plus" class="w-6 h-6"></i></button>
                        </div>
                        <div class="space-y-4">
                            ${userCertificates.length === 0 ? '<p class="text-gray-500 text-sm italic">No certificates added yet.</p>' : ''}
                            ${userCertificates.map(cert => `
                                <div class="flex items-center justify-between border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h4 class="font-bold text-white">${cert.name}</h4>
                                        <p class="text-sm text-gray-400 mt-1">${cert.issuer} â€¢ Issued ${cert.year}</p>
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
                        <h2 class="text-xl font-bold text-white mb-2">Resume / CV</h2>
                        <p class="text-sm text-gray-400 mb-6">Upload your PDF resume. Founders can view and download it from your profile.</p>
                        <div class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-900/50 hover:border-green-500/50 transition cursor-pointer" onclick="document.getElementById('cv-upload-input').click()">
                            ${profileData.cvBase64 || profileData.cvFileName
                                ? '<i data-lucide="file-check" class="w-12 h-12 text-green-500 mx-auto mb-3"></i><p class="text-green-400 font-bold mb-2">' + (profileData.cvFileName || 'Resume uploaded') + '</p><span class="text-sm text-gray-400 underline">Click to upload a newer version</span>'
                                : '<i data-lucide="file-up" class="w-12 h-12 text-gray-500 mx-auto mb-3"></i><p class="text-gray-300 font-medium mb-1">Click to Upload PDF Resume</p><span class="text-xs text-gray-500">PDF only &bull; Max size: 5MB</span>'
                            }
                        </div>
                        <input type="file" id="cv-upload-input" accept=".pdf,application/pdf" onchange="handleCVUpload(this)" class="hidden">
                        ${profileData.cvBase64 ? '<button onclick="removeCVFile()" class="mt-3 text-red-400 hover:text-red-300 text-sm font-medium flex items-center transition-colors"><i data-lucide="trash-2" class="w-4 h-4 mr-1"></i> Remove CV</button>' : ''}
                    </div>

                    <!-- Save All Changes -->
                    <div class="sticky bottom-4 z-40">
                        <button onclick="saveAllChanges()" class="save-all-btn w-full btn-highlight-green text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                            <i data-lucide="save" class="w-6 h-6"></i> Save All Changes
                        </button>
                    </div>

                    <!-- ================= MODALS ================== -->
                    
                    <!-- Basic Info & About Modal -->
                    <div id="basic-info-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div class="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                                <h2 class="text-xl font-bold text-white">Edit Intro & About</h2>
                                <button onclick="closeModal('basic-info-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                            </div>
                            <form onsubmit="saveProfileInfo(event)" class="p-6 space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                                    <input type="text" name="name" value="${profileData.name}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Headline (Title) *</label>
                                    <input type="text" name="title" value="${profileData.title}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                                    <input type="text" name="location" value="${profileData.location}" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                        <input type="email" name="email" value="${profileData.email}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-400 mb-1">LinkedIn URL</label>
                                        <input type="url" name="linkedin" value="${profileData.linkedin}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">GitHub URL</label>
                                    <input type="url" name="github" value="${profileData.github}" class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-400 mb-1">About / Bio *</label>
                                    <textarea name="bio" rows="4" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">${profileData.bio}</textarea>
                                </div>
                                <div class="pt-4 flex gap-3">
                                    <button type="button" onclick="closeModal('basic-info-modal')" class="px-6 py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-700 transition">Cancel</button>
                                    <button type="submit" class="seeker-btn text-white px-6 py-3 rounded-xl font-bold flex-1">Save Profile</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Add Experience Modal -->
                    <div id="exp-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
                            <div class="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 class="text-xl font-bold text-white">Add Experience</h2>
                                <button onclick="closeModal('exp-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                            </div>
                            <form onsubmit="addExperience(event)" class="p-6 space-y-4">
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
                                <div class="pt-4 flex gap-3">
                                    <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Experience</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Add Education Modal -->
                    <div id="edu-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
                            <div class="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 class="text-xl font-bold text-white">Add Education</h2>
                                <button onclick="closeModal('edu-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                            </div>
                            <form onsubmit="addEducation(event)" class="p-6 space-y-4">
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
                                <div class="pt-4 flex gap-3">
                                    <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Education</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Add Certificate Modal -->
                    <div id="cert-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
                            <div class="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 class="text-xl font-bold text-white">Add Certification</h2>
                                <button onclick="closeModal('cert-modal')" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                            </div>
                            <form onsubmit="addCertificate(event)" class="p-6 space-y-4">
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
                                <div class="pt-4 flex gap-3">
                                    <button type="submit" class="seeker-btn text-white px-4 py-3 rounded-xl font-bold flex-1">Save Certificate</button>
                                </div>
                            </form>
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

                                        <div class="flex gap-3">
                                            ${founder.email ? '<a href="mailto:' + founder.email + '" class="flex-1 seeker-btn text-white py-2.5 rounded-xl font-bold text-sm shadow-lg text-center">Contact Founder</a>' : ''}
                                            ${founder.linkedin ? '<a href="' + founder.linkedin + '" target="_blank" class="flex-1 border border-gray-600 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl font-bold text-sm text-center transition flex items-center justify-center"><i data-lucide="linkedin" class="w-4 h-4 mr-1"></i> LinkedIn</a>' : ''}
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

        function renderJobs() {
            const sortedJobs = [...jobList].sort((a,b) => b.matchScore - a.matchScore);

            return `
                <div class="space-y-6">
                    <!-- Search and Filter Section -->
                    <div class="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                        <div class="flex flex-col md:flex-row gap-4 mb-4">
                            <div class="flex-1 relative">
                                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                                <input type="text" placeholder="Search by job title, keyword, or company..." class="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-white">
                            </div>
                            <button class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center md:w-auto w-full border border-gray-600">
                                <i data-lucide="filter" class="w-5 h-5 mr-2"></i> Filter
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <select class="px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white text-sm focus:ring-2 focus:ring-green-500">
                                <option>All Industries</option>
                                <option>AgriTech</option>
                                <option>FinTech</option>
                                <option>HealthTech</option>
                                <option>EdTech</option>
                            </select>
                            <select class="px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white text-sm focus:ring-2 focus:ring-green-500">
                                <option>Location Type</option>
                                <option>Remote</option>
                                <option>On-site</option>
                                <option>Hybrid</option>
                            </select>
                            <select class="px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl outline-none text-white text-sm focus:ring-2 focus:ring-green-500">
                                <option>Job Type</option>
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                            </select>
                        </div>
                    </div>

                    <!-- AI Match Info -->
                    <div class="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p class="text-green-200 text-sm">
                            <i data-lucide="sparkles" class="w-4 h-4 inline-block mr-1"></i>
                            AI recommended these jobs based on your profile and <strong class="text-white">${userSkills.length} skills</strong>.
                        </p>
                        <button onclick="renderContent()" class="text-green-400 hover:text-green-300 text-sm font-bold flex items-center whitespace-nowrap bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 transition-colors">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-1"></i> Refresh Matches
                        </button>
                    </div>

                    <!-- Job Listings -->
                    <div class="grid lg:grid-cols-2 gap-6">
                        ${sortedJobs.map(job => {
                            const isSaved = savedJobIds.includes(job.id);
                            return `
                            <div class="bg-gray-800/40 rounded-2xl border ${job.matchScore >= 80 ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700/50'} p-6 hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden">
                                ${job.matchScore >= 90 ? '<div class="absolute -right-10 top-5 bg-green-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-lg">TOP MATCH</div>' : ''}
                                
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-gray-700 shadow-inner group-hover:border-green-500/50 transition-colors">
                                            ${job.company[0]}
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">${job.title}</h3>
                                            <p class="text-sm text-gray-400">${job.company} <span class="text-gray-600 mx-1">â€¢</span> <span class="text-gray-500">Founder: ${job.founder}</span></p>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end shrink-0 ml-2">
                                        <span class="bg-green-500/10 text-green-400 font-bold px-2.5 py-1 rounded-lg text-sm border border-green-500/20">${job.matchScore}% Match</span>
                                    </div>
                                </div>
                                
                                <p class="text-sm text-gray-300 mb-5 line-clamp-3 flex-grow">${job.description}</p>
                                
                                <div class="mb-6">
                                    <p class="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Required Skills:</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${job.requiredSkills.map(s => {
                                            const hasSkill = userSkills.includes(s);
                                            return `<span class="${hasSkill ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-gray-900 text-gray-400 border-gray-700'} border text-xs px-2.5 py-1 rounded-md flex items-center">
                                                ${hasSkill ? `<i data-lucide="check" class="w-3 h-3 mr-1"></i>` : ''} ${s}
                                            </span>`;
                                        }).join('')}
                                    </div>
                                </div>

                                <div class="flex flex-wrap items-center justify-between border-t border-gray-700/50 pt-4 mt-auto gap-4">
                                    <div class="flex flex-wrap gap-3 text-xs text-gray-400">
                                        <span class="flex items-center"><i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.location}</span>
                                        <span class="flex items-center"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1 text-gray-500"></i>${job.type}</span>
                                        <span class="flex items-center text-white font-medium bg-gray-700/50 px-2 py-0.5 rounded"><i data-lucide="dollar-sign" class="w-3.5 h-3.5 mr-0.5 text-green-400"></i>${job.salary}</span>
                                    </div>
                                    <div class="flex gap-2 w-full sm:w-auto">
                                        <button onclick="toggleSaveJob(${job.id})" class="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-gray-400 flex items-center justify-center shrink-0">
                                            <i data-lucide="bookmark" class="w-5 h-5 ${isSaved ? 'fill-green-400 text-green-400' : ''}"></i>
                                        </button>
                                        <button onclick="applyToJob(${job.id})" class="seeker-btn text-white px-6 py-2 rounded-lg font-bold text-sm w-full sm:w-auto shadow-lg">Apply Now</button>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }

        function renderApplications() {
            return `
                <div class="space-y-6">
                    <div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
                        <table class="w-full text-left">
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
                                            <p class="font-bold text-white">${job ? job.title : 'Unknown Role'}</p>
                                            <p class="text-xs text-gray-400">${job ? job.company : 'Unknown Company'}</p>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-300">${app.appliedDate}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 rounded-md text-xs font-bold border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">${app.status}</span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="withdrawApplication(${app.id})" class="text-sm text-red-400 hover:underline">Withdraw</button>
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
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
                                            <h3 class="font-bold text-white text-lg">${job.title}</h3>
                                            <p class="text-sm text-green-400">${job.company}</p>
                                        </div>
                                        <button onclick="toggleSaveJob(${job.id})" class="text-green-400 hover:text-gray-400 transition"><i data-lucide="bookmark" class="w-6 h-6 fill-current"></i></button>
                                    </div>
                                    <div class="mt-6 flex gap-3">
                                        <button onclick="applyToJob(${job.id})" class="seeker-btn text-white px-6 py-2 rounded-lg font-bold text-sm w-full">Apply Now</button>
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
        setTab('overview');
        
        // Then load fresh data from Firebase and re-render
        Promise.all([
            loadJobseekerProfileFromFirebase(),
            fetchFoundersFromFirebase()
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
            }, 2400);
        });
