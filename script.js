// --- DATA & STATE ---
let state = {
    currentUser: null,
    currentScreen: 'home',
    googleUser: null,
    ideas: [
        { id: 1, title: 'Krishi-AI: AI based Farming Assistant', founder: 'Rahim Uddin', description: 'Our platform uses AI to help farmers diagnose crop diseases. We are currently looking for a Frontend Developer to join our team.', skillsNeeded: ['React', 'Mobile App', 'UI/UX'], industry: 'AgriTech', fundingNeeded: '$50,000' },
        { id: 2, title: 'FinSheba: Rural Banking App', founder: 'Sadia Rahman', description: 'A simple banking app for rural people. We have completed our MVP and are currently looking for seed funding.', skillsNeeded: ['Node.js', 'Cybersecurity'], industry: 'FinTech', fundingNeeded: '$100,000' }
    ],
    founderTab: 'ideas'
};

const mockSeekers = [
    { id: 1, name: 'Anik Hasan', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB'], experience: '3 Years' },
    { id: 2, name: 'Nusrat Jahan', role: 'UI/UX Designer', skills: ['Figma', 'UI/UX', 'Research'], experience: '2 Years' }
];

const mockInvestors = [
    { id: 1, name: 'Venture BD', focus: ['AgriTech', 'EdTech'], ticketSize: '$10k - $100k' },
    { id: 2, name: 'Global Seed Fund', focus: ['FinTech', 'HealthTech', 'AI'], ticketSize: '$50k - $500k' }
];

// --- GOOGLE SIGN-IN CONFIG ---
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your Google Client ID

// Initialize Google Sign-In
function initGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false
        });
    }
}

// Handle Google Sign-In callback
function handleGoogleSignIn(response) {
    // Decode the JWT token to get user info
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const name = payload.name;
    const email = payload.email;
    const picture = payload.picture;
    
    // Store Google user info temporarily
    state.googleUser = { name, email, picture };
    
    // Show role selection modal
    showRoleSelectionModal(name, email, picture);
}

// Trigger Google Sign-In
function signInWithGoogle() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback: Use popup method
                google.accounts.id.renderButton(
                    document.createElement('div'),
                    { theme: 'outline', size: 'large' }
                );
                // Try One Tap again or show manual popup
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'email profile',
                    callback: (tokenResponse) => {
                        // Get user info using the access token
                        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        })
                        .then(res => res.json())
                        .then(userInfo => {
                            state.googleUser = {
                                name: userInfo.name,
                                email: userInfo.email,
                                picture: userInfo.picture
                            };
                            showRoleSelectionModal(userInfo.name, userInfo.email, userInfo.picture);
                        });
                    }
                });
                client.requestAccessToken();
            }
        });
    } else {
        alert('Google Sign-In is loading. Please try again in a moment.');
    }
}

// Show role selection modal after Google Sign-In
function showRoleSelectionModal(name, email, picture) {
    const modal = document.createElement('div');
    modal.id = 'role-modal';
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]';
    modal.innerHTML = `
        <div class="bg-[#1E1B4B] rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-text-spring">
            <div class="text-center mb-6">
                <img src="${picture || ''}" alt="Profile" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-500/30" onerror="this.style.display='none'">
                <h2 class="text-2xl font-bold text-white mb-1">Welcome, ${name}!</h2>
                <p class="text-gray-400 text-sm">${email}</p>
            </div>
            <p class="text-gray-300 text-center mb-6">What brings you to Foundera?</p>
            <div class="space-y-3">
                <button onclick="completeGoogleSignUp('Founder')" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    I'm a Founder
                </button>
                <button onclick="completeGoogleSignUp('Job Seeker')" class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    I'm a Job Seeker
                </button>
                <button onclick="completeGoogleSignUp('Investor')" class="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    I'm an Investor
                </button>
            </div>
            <button onclick="closeRoleModal()" class="w-full mt-4 text-gray-400 hover:text-white text-sm py-2 transition-colors">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Close role selection modal
function closeRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) modal.remove();
    state.googleUser = null;
}

// --- FIREBASE: Save user to Realtime Database ---
function saveUserToFirebase(userData) {
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.error('Firebase not available');
        return;
    }
    const db = firebase.database();
    // Use email as key (replace dots/special chars for Firebase path)
    const safeKey = userData.email.replace(/[.#$\[\]]/g, '_');
    const roleFolder = userData.role === 'Founder' ? 'founders' 
                     : userData.role === 'Job Seeker' ? 'jobseekers' 
                     : 'investors';
    
    const userDataToSave = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        picture: userData.picture || '',
        signupMethod: userData.signupMethod || 'email',
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : (userData.signupMethod === 'google' ? true : false),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // If user is authenticated, also store uid
    if (firebase.auth().currentUser) {
        userDataToSave.uid = firebase.auth().currentUser.uid;
    }
    
    return db.ref('users/' + roleFolder + '/' + safeKey).set(userDataToSave)
        .then(() => {
            console.log('User data saved to Firebase Realtime Database successfully!');
        })
        .catch((error) => {
            console.error('Error saving to Firebase DB:', error);
            // If permission denied, try writing to a different path structure
            if (error.code === 'PERMISSION_DENIED') {
                console.error('Database rules are blocking writes. Please update Firebase Realtime Database Rules.');
                alert('Database write blocked by rules. Please update your Firebase Realtime Database Rules to allow writes.');
            }
        });
}

// Complete sign up after role selection
function completeGoogleSignUp(role) {
    const { name, email, picture } = state.googleUser;
    
    state.currentUser = { name, email, role, picture };
    
    // Save to Firebase Realtime Database - WAIT before redirect
    saveUserToFirebase({ name, email, role, picture, signupMethod: 'google' }).then(() => {
        // Close modal
        closeRoleModal();
        
        // Redirect based on role
        if (role === 'Founder') {
            localStorage.setItem('founderName', name);
            localStorage.setItem('founderPicture', picture || '');
            window.location.href = 'founder.html';
            return;
        }
        
        if (role === 'Job Seeker') {
            localStorage.setItem('seekerName', name);
            localStorage.setItem('seekerPicture', picture || '');
            window.location.href = 'jobseeker.html';
            return;
        }
        
        if (role === 'Investor') {
            localStorage.setItem('investorName', name);
            localStorage.setItem('investorPicture', picture || '');
            window.location.href = 'investor.html';
            return;
        }
    }).catch(() => {
        closeRoleModal();
        alert('Failed to save data. Please check your database rules.');
    });
}

// --- EMAIL VERIFICATION POPUP ---
function showVerificationPopup(email) {
    // Remove any existing popup
    const existing = document.getElementById('verification-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'verification-popup';
    popup.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]';
    popup.innerHTML = `
        <div class="bg-[#1E1B4B] rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-text-spring text-center">
            <!-- Email Icon -->
            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
            </div>
            
            <!-- Title -->
            <h2 class="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
            
            <!-- Message -->
            <p class="text-gray-300 mb-2">We've sent a verification link to:</p>
            <p class="text-purple-400 font-semibold mb-4">${email}</p>
            
            <!-- Warning Box -->
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/><path d="M12 17h.01"/>
                    </svg>
                    <div class="text-left">
                        <p class="text-yellow-300 font-semibold text-sm mb-1">Check your Spam / Junk folder!</p>
                        <p class="text-yellow-200/70 text-xs">The verification email may land in your spam folder. Please check there if you don't see it in your inbox.</p>
                    </div>
                </div>
            </div>
            
            <!-- Instructions -->
            <p class="text-gray-400 text-sm mb-6">Click the verification link in the email, then come back and log in to your account.</p>
            
            <!-- Resend Button -->
            <button onclick="resendVerificationEmail()" id="resend-verification-btn" class="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/10 mb-3">
                Resend Verification Email
            </button>
            
            <!-- Go to Login Button -->
            <button onclick="closeVerificationPopup()" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20">
                Go to Login
            </button>
        </div>
    `;
    document.body.appendChild(popup);
}

function closeVerificationPopup() {
    const popup = document.getElementById('verification-popup');
    if (popup) popup.remove();
    navigateTo('login');
}

function resendVerificationEmail() {
    const btn = document.getElementById('resend-verification-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
    }
    
    // We need to sign in temporarily to resend
    const user = firebase.auth().currentUser;
    if (user) {
        user.sendEmailVerification()
            .then(() => {
                if (btn) {
                    btn.textContent = '✓ Email Sent! Check your inbox';
                    btn.classList.add('bg-green-500/20', 'border-green-500/30');
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = 'Resend Verification Email';
                        btn.classList.remove('bg-green-500/20', 'border-green-500/30');
                    }, 30000);
                }
            })
            .catch((error) => {
                if (btn) {
                    btn.disabled = false;
                    if (error.code === 'auth/too-many-requests') {
                        btn.textContent = 'Too many attempts. Try later.';
                    } else {
                        btn.textContent = 'Failed. Try again.';
                    }
                    setTimeout(() => { btn.textContent = 'Resend Verification Email'; }, 5000);
                }
            });
    } else {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Please register again to resend';
            setTimeout(() => { btn.textContent = 'Resend Verification Email'; }, 5000);
        }
    }
}

// --- NAVIGATION & ACTIONS ---
function navigateTo(screen) {
    state.currentScreen = screen;
    render();
    window.scrollTo(0,0);
}

function handleLogout() {
    state.currentUser = null;
    navigateTo('home');
}

function setFounderTab(tab) {
    state.founderTab = tab;
    render();
}

function handleAuth(event, type) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const email = fd.get('email');
    const password = fd.get('password');
    const firstName = fd.get('firstName') || '';
    const lastName = fd.get('lastName') || '';
    const name = firstName && lastName ? `${firstName} ${lastName}` : (fd.get('name') || 'Demo User');
    let role = fd.get('role') || 'Founder';

    // Disable submit button to prevent double clicks
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = type === 'login' ? 'Logging in...' : 'Creating account...';
    }

    if(type === 'login') {
        // LOGIN: Firebase Authentication দিয়ে login
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // CHECK EMAIL VERIFICATION
                if (!user.emailVerified) {
                    // User email is not verified - block login
                    showVerificationPopup(email);
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
                    return;
                }
                
                const safeKey = email.replace(/[.#$\[\]]/g, '_');
                const db = firebase.database();
                
                // Realtime Database থেকে role খুঁজে বের করো
                db.ref('users').once('value').then(snapshot => {
                    const data = snapshot.val();
                    let foundUser = null;
                    let foundRole = null;
                    
                    if (data) {
                        if (data.founders && data.founders[safeKey]) {
                            foundUser = data.founders[safeKey];
                            foundRole = 'Founder';
                        }
                        if (data.jobseekers && data.jobseekers[safeKey]) {
                            foundUser = data.jobseekers[safeKey];
                            foundRole = 'Job Seeker';
                        }
                        if (data.investors && data.investors[safeKey]) {
                            foundUser = data.investors[safeKey];
                            foundRole = 'Investor';
                        }
                    }
                    
                    if (foundUser) {
                        // Update last login time & mark as verified in DB
                        const roleFolder = foundRole === 'Founder' ? 'founders' 
                                         : foundRole === 'Job Seeker' ? 'jobseekers' 
                                         : 'investors';
                        db.ref('users/' + roleFolder + '/' + safeKey).update({
                            lastLogin: new Date().toISOString(),
                            emailVerified: true
                        });
                        
                        state.currentUser = { name: foundUser.name, email: foundUser.email, role: foundRole };
                        
                        // Role অনুযায়ী redirect
                        if (foundRole === 'Founder') {
                            localStorage.setItem('founderName', foundUser.name);
                            localStorage.setItem('founderEmail', foundUser.email);
                            window.location.href = 'founder.html';
                        } else if (foundRole === 'Job Seeker') {
                            localStorage.setItem('seekerName', foundUser.name);
                            localStorage.setItem('seekerEmail', foundUser.email);
                            window.location.href = 'jobseeker.html';
                        } else if (foundRole === 'Investor') {
                            localStorage.setItem('investorName', foundUser.name);
                            localStorage.setItem('investorEmail', foundUser.email);
                            window.location.href = 'investor.html';
                        }
                    } else {
                        alert('Account found but no role assigned. Please contact support.');
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
                    }
                });
            })
            .catch((error) => {
                let msg = 'Login failed. ';
                if (error.code === 'auth/user-not-found') msg += 'No account found with this email. Please sign up first.';
                else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg += 'Wrong password. Please try again.';
                else if (error.code === 'auth/invalid-email') msg += 'Invalid email format.';
                else if (error.code === 'auth/too-many-requests') msg += 'Too many failed attempts. Please try again later.';
                else msg += error.message;
                alert(msg);
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
            });
        return;
    }

    // SIGNUP: Firebase Authentication এ account create + Realtime Database এ data save
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Firebase Auth profile update
            user.updateProfile({ displayName: name }).catch(() => {});
            
            // Send verification email
            user.sendEmailVerification()
                .then(() => {
                    console.log('Verification email sent to:', email);
                })
                .catch((err) => {
                    console.error('Failed to send verification email:', err);
                });
            
            // Save user data to Realtime Database (with emailVerified: false)
            return saveUserToFirebase({ name, email, role, picture: '', signupMethod: 'email', emailVerified: false }).then(() => {
                // DO NOT auto-login. Show verification popup instead.
                // Sign out immediately so user cannot access dashboard
                firebase.auth().signOut().catch(() => {});
                state.currentUser = null;
                
                // Show the verification popup
                showVerificationPopup(email);
            });
        })
        .catch((error) => {
            let msg = 'Registration failed. ';
            if (error.code === 'auth/email-already-in-use') msg += 'This email is already registered. Please login instead.';
            else if (error.code === 'auth/weak-password') msg += 'Password should be at least 6 characters.';
            else if (error.code === 'auth/invalid-email') msg += 'Invalid email format.';
            else msg += error.message;
            alert(msg);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Register'; }
        });
}

function postNewIdea(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const idea = {
        id: Date.now(),
        title: fd.get('title'),
        founder: state.currentUser.name,
        description: fd.get('description'),
        skillsNeeded: fd.get('skills').split(',').map(s => s.trim()),
        industry: 'General',
        fundingNeeded: fd.get('funding') || 'Not Disclosed'
    };
    state.ideas = [idea, ...state.ideas];
    state.founderTab = 'ideas';
    render();
}

// --- COMPONENT TEMPLATES ---

function Navbar() {
    const user = state.currentUser;
    return `
        <nav class="bg-[#1a0b2e] sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div class="flex items-center cursor-pointer" onclick="navigateTo(state.currentUser ? 'dashboard' : 'home')">
                    <span class="text-2xl font-bold text-white tracking-tight">Foundera</span>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="blog.html" class="text-gray-300 hover:text-white font-medium text-sm transition-colors">Blog</a>
                    <a href="success-stories.html" class="text-gray-300 hover:text-white font-medium text-sm transition-colors">Success Stories</a>
                    <a href="about-us.html" class="text-gray-300 hover:text-white font-medium text-sm transition-colors">About Us</a>
                </div>
                <div class="flex items-center space-x-3">
                    ${user ? `
                        <div class="flex items-center text-sm font-medium text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                            <i data-lucide="user-circle" class="h-5 w-5 mr-1.5 text-purple-400"></i>
                            ${user.name} (${user.role})
                        </div>
                        <button onclick="handleLogout()" class="text-gray-300 hover:text-red-400 flex items-center text-sm font-medium">
                            <i data-lucide="log-out" class="h-4 w-4 mr-1"></i> Logout
                        </button>
                    ` : `
                        <button onclick="navigateTo('login')" class="text-gray-300 hover:text-white font-medium px-3 py-2 text-sm transition-colors">Log in</button>
                        <button onclick="navigateTo('signup')" class="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Join for free</button>
                    `}
                </div>
            </div>
        </nav>
    `;
}

function HomeView() {
    return `
        <div class="flex flex-col">
            <!-- Hero Section -->
            <section class="w-full bg-[#1a0b2e] text-white relative min-h-[85vh] flex items-center overflow-hidden">
                <!-- Background gradient glow -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/4">
                        <div class="absolute inset-0 bg-gradient-to-l from-purple-600/40 via-purple-500/20 to-transparent rounded-full blur-[100px]"></div>
                        <div class="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-transparent rounded-full blur-[80px] animate-pulse"></div>
                    </div>
                    <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-700/20 rounded-full blur-[80px]"></div>
                </div>
                
                <div class="relative py-20 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12">
                    <!-- Left Content -->
                    <div class="flex-1 text-left space-y-8 z-10">
                        <h1 class="text-5xl md:text-7xl font-extrabold text-white animate-text-spring leading-tight">
                            <span class="text-white animate-shimmer">World's First</span><br/>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 animate-gradient">Integrated Platform</span>
                        </h1>
                        <p class="text-xl md:text-2xl text-gray-300 animate-text-spring delay-100 max-w-xl leading-relaxed">
                            Connecting <span class="text-purple-400 font-semibold animate-pulse-text">Founders</span>, 
                            <span class="text-cyan-400 font-semibold animate-pulse-text delay-200">Job Seekers</span> & 
                            <span class="text-emerald-400 font-semibold animate-pulse-text delay-400">Investors</span> 
                            in one single platform.
                        </p>
                        
                        <div class="flex flex-wrap gap-4 animate-text-spring delay-200">
                            <button onclick="navigateTo('signup')" class="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-medium px-6 py-3 rounded-full text-sm transition-colors shadow-lg hover:shadow-xl hover:scale-105">
                                Sign up with email
                            </button>
                        </div>
                        
                        <p class="text-gray-400 text-sm animate-text-spring delay-300">By signing up, you agree to Foundera's <a href="#" class="text-gray-300 underline hover:text-white">Terms of Service</a>.</p>
                    </div>
                    
                    <!-- Right Content - Enhanced Orbiting Animation -->
                    <div class="flex-1 relative h-[500px] hidden md:block z-10">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg pointer-events-none">
                            <!-- Central Glow -->
                            <div class="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-tr from-fuchsia-500 to-purple-500 rounded-full blur-[100px] animate-[center-glow_4s_infinite] opacity-50"></div>
                            <div class="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full blur-[60px] animate-[center-glow_3s_infinite] opacity-20"></div>
                            
                            <!-- Particle Effects -->
                            <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-particle"></div>
                            <div class="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-particle delay-300"></div>
                            <div class="absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-particle delay-500"></div>
                            
                            <!-- Inner Orbit (Founder) -->
                            <div class="absolute top-1/2 left-1/2 w-[200px] h-[200px] -mt-[100px] -ml-[100px] border border-dashed border-purple-400/50 rounded-full animate-orbit">
                                <div class="absolute top-0 left-1/2 -mt-8 -ml-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center animate-counter shadow-xl shadow-purple-500/40 hover:scale-110 transition-transform">
                                    <i data-lucide="lightbulb" class="text-white w-7 h-7"></i>
                                    <span class="absolute -bottom-6 text-xs text-purple-300 font-medium whitespace-nowrap">Founders</span>
                                </div>
                            </div>
                            
                            <!-- Middle Orbit (Job Seekers) -->
                            <div class="absolute top-1/2 left-1/2 w-[320px] h-[320px] -mt-[160px] -ml-[160px] border border-dashed border-cyan-400/40 rounded-full animate-orbit-reverse">
                                <div class="absolute top-[10%] -left-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center animate-counter-reverse shadow-xl shadow-cyan-500/40 hover:scale-110 transition-transform">
                                    <i data-lucide="users" class="text-white w-7 h-7"></i>
                                    <span class="absolute -bottom-6 text-xs text-cyan-300 font-medium whitespace-nowrap">Job Seekers</span>
                                </div>
                                <div class="absolute bottom-[15%] -right-6 w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center animate-counter-reverse shadow-lg shadow-blue-500/30 animate-bounce-slow"><i data-lucide="briefcase" class="text-white w-6 h-6"></i></div>
                            </div>
                            
                            <!-- Outer Orbit (Investors) -->
                            <div class="absolute top-1/2 left-1/2 w-[440px] h-[440px] -mt-[220px] -ml-[220px] border border-dashed border-emerald-400/30 rounded-full animate-orbit" style="animation-duration: 50s;">
                                <div class="absolute bottom-[5%] left-1/2 -ml-8 w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center animate-counter shadow-xl shadow-emerald-500/40 hover:scale-110 transition-transform" style="animation-duration: 50s;">
                                    <i data-lucide="trending-up" class="text-white w-7 h-7"></i>
                                    <span class="absolute -bottom-6 text-xs text-emerald-300 font-medium whitespace-nowrap">Investors</span>
                                </div>
                                <div class="absolute top-[20%] -right-5 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center animate-counter shadow-lg shadow-amber-500/30 animate-pulse"><i data-lucide="dollar-sign" class="text-white w-5 h-5"></i></div>
                            </div>
                            
                            <!-- Center Hub -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-slow border-4 border-white/20">
                                <i data-lucide="rocket" class="text-white w-8 h-8"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Dream to Reality Section -->
            <section class="bg-gradient-to-b from-[#1a0b2e] to-[#1E1B4B] py-24 px-6 relative overflow-hidden">
                <!-- Background Effects -->
                <div class="absolute top-0 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]"></div>
                <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>
                
                <div class="max-w-6xl mx-auto relative z-10">
                    <!-- Header -->
                    <div class="text-center mb-16">
                        <h2 class="text-4xl md:text-6xl font-extrabold text-white mb-4 animate-text-spring">
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400">Dream</span> to <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">Reality</span>
                        </h2>
                        <p class="text-xl md:text-2xl text-gray-400 animate-text-spring delay-100">Want to make your dreams come true?</p>
                    </div>
                    
                    <!-- Three Cards -->
                    <div class="grid md:grid-cols-3 gap-8">
                        <!-- Card 1: Share Your Idea -->
                        <div class="group relative animate-slide-up">
                            <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                            <div class="relative glass-card rounded-3xl p-8 h-full border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
                                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <i data-lucide="lightbulb" class="text-white w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-3">Share Your Idea</h3>
                                <p class="text-gray-400 mb-6 leading-relaxed">Got a groundbreaking startup idea? Share it with the world and find the perfect co-founders & team to build it together.</p>
                                <div class="flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                                    <span>Start as Founder</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Card 2: Get Your Dream Job -->
                        <div class="group relative animate-slide-up delay-100">
                            <div class="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                            <div class="relative glass-card rounded-3xl p-8 h-full border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2">
                                <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                                    <i data-lucide="briefcase" class="text-white w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-3">Get Your Dream Job</h3>
                                <p class="text-gray-400 mb-6 leading-relaxed">Looking for exciting opportunities? Connect with innovative startups that match your skills and passion.</p>
                                <div class="flex items-center text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
                                    <span>Find Opportunities</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Card 3: Find Startups to Invest -->
                        <div class="group relative animate-slide-up delay-200">
                            <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                            <div class="relative glass-card rounded-3xl p-8 h-full border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2">
                                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <i data-lucide="trending-up" class="text-white w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-3">Find Startups to Invest</h3>
                                <p class="text-gray-400 mb-6 leading-relaxed">Discover promising startups and invest in the next big thing. Get access to vetted founders and exciting opportunities.</p>
                                <div class="flex items-center text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors">
                                    <span>Explore Deals</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div class="text-center mt-12 animate-slide-up delay-300">
                        <button onclick="navigateTo('signup')" class="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-700 hover:via-violet-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>

            <!-- Redesigned Vision & Mission (Deep Purple Theme) -->
            <section class="bg-[#1E1B4B] py-32 px-6 relative overflow-hidden">
                <!-- Floating Background Elements -->
                <div class="absolute top-1/4 left-10 w-32 h-32 bg-purple-500/20 rounded-3xl blur-2xl animate-float"></div>
                <div class="absolute bottom-1/4 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float delay-500"></div>
                
                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="text-center mb-20 animate-slide-up">
                        <h2 class="text-4xl md:text-6xl font-black text-white mb-6">Our Vision & Mission</h2>
                        <p class="text-slate-400 max-w-xl mx-auto text-lg">Building a future where tech, talent, and capital thrive together.</p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-12">
                        <!-- Vision Card -->
                        <div class="glass-card rounded-[40px] p-12 relative group hover:bg-white/10 transition-all duration-500">
                            <div class="absolute -top-10 -right-5 w-32 h-32 opacity-20 group-hover:opacity-100 transition-opacity duration-700 animate-float">
                                <svg viewBox="0 0 200 200" class="w-full h-full text-blue-400">
                                    <path fill="currentColor" d="M40,20 L160,20 L180,80 L20,80 Z" opacity="0.6" />
                                    <rect x="30" y="90" width="140" height="20" rx="5" fill="currentColor" />
                                </svg>
                            </div>
                            
                            <div class="bg-gradient-to-br from-blue-500 to-cyan-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <i data-lucide="eye" class="text-white w-8 h-8"></i>
                            </div>
                            <h3 class="text-3xl font-bold text-white mb-6">Our Vision</h3>
                            <p class="text-xl text-slate-300 leading-relaxed font-light">
                                To create a world where <span class="text-blue-400 font-medium">everyone</span>—whether you have a big idea, specialized skills, or capital—can work together to build great things effortlessly.
                            </p>
                            
                            <div class="mt-12 flex gap-4">
                                <div class="h-1 w-12 bg-blue-500 rounded-full"></div>
                                <div class="h-1 w-4 bg-slate-700 rounded-full"></div>
                                <div class="h-1 w-4 bg-slate-700 rounded-full"></div>
                            </div>
                        </div>

                        <!-- Mission Card -->
                        <div class="glass-card rounded-[40px] p-12 relative group hover:bg-white/10 transition-all duration-500">
                            <div class="absolute -top-10 -right-5 w-32 h-32 opacity-20 group-hover:opacity-100 transition-opacity duration-700 animate-float delay-300">
                                <div class="bg-purple-500 w-20 h-20 rounded-xl rotate-12 flex items-center justify-center">
                                    <i data-lucide="cpu" class="text-white w-10 h-10"></i>
                                </div>
                            </div>

                            <div class="bg-gradient-to-br from-purple-500 to-pink-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                <i data-lucide="target" class="text-white w-8 h-8"></i>
                            </div>
                            <h3 class="text-3xl font-bold text-white mb-6">Our Mission</h3>
                            <p class="text-xl text-slate-300 leading-relaxed font-light">
                                To <span class="text-purple-400 font-medium">connect</span> the right people so that ideas can grow, talented workers can find dream jobs, and investors can find the next big startups instantly.
                            </p>

                            <div class="mt-12 flex gap-4">
                                <div class="h-1 w-4 bg-slate-700 rounded-full"></div>
                                <div class="h-1 w-12 bg-purple-500 rounded-full"></div>
                                <div class="h-1 w-4 bg-slate-700 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="relative bg-[#FFEFD5] py-32 px-6 overflow-hidden">
                <div class="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
                <div class="max-w-7xl mx-auto relative z-10 text-center">
                    <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 animate-slide-up">How Foundera Works</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto text-lg mb-20 animate-slide-up delay-100">A seamless ecosystem designed to bring ideas to life.</p>
                    <div class="grid md:grid-cols-3 gap-8">
                        ${[
                            {id: 1, title: 'Create Profile', desc: 'Sign up and tell us your goals.', icon: 'user-circle', color: 'blue'},
                            {id: 2, title: 'Discover & Match', desc: 'Our algorithm connects you with the right partners.', icon: 'search', color: 'emerald'},
                            {id: 3, title: 'Build & Grow', desc: 'Form your team, secure funding, and scale.', icon: 'globe', color: 'purple'}
                        ].map(step => `
                            <div class="relative bg-white/70 backdrop-blur-2xl p-10 rounded-3xl border border-white shadow-xl group hover:-translate-y-2 transition-all">
                                <div class="absolute -right-6 -top-10 text-[180px] font-black text-gray-200/50 z-0 pointer-events-none">${step.id}</div>
                                <div class="relative z-10 text-left">
                                    <div class="w-16 h-16 bg-${step.color}-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"><i data-lucide="${step.icon}"></i></div>
                                    <h3 class="text-2xl font-bold mb-4 text-gray-900">${step.title}</h3>
                                    <p class="text-gray-600 text-sm">${step.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- Synergy Section -->
            <section class="bg-white py-24 px-6 border-t border-gray-100">
                <div class="max-w-7xl mx-auto text-center">
                    <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-16">When the Right People Meet</h2>
                    <div class="relative bg-gray-50 rounded-3xl p-8 md:p-16 border border-gray-100">
                        <div class="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-300 via-green-300 to-purple-300 transform -translate-y-1/2 opacity-40"></div>
                        <div class="grid md:grid-cols-3 gap-8 items-center relative z-10">
                            <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 hover:-translate-y-2 transition-all">
                                <div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><i data-lucide="lightbulb" class="text-blue-600"></i></div><div><h4 class="font-bold">The Visionary</h4><p class="text-xs text-gray-500">Founder</p></div></div>
                                <p class="text-sm text-gray-600">"I have a game-changing idea, but I need a technical partner."</p>
                            </div>
                            <div class="bg-gray-900 text-white p-8 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-all">
                                <i data-lucide="star" class="text-yellow-400 w-8 h-8 mb-2"></i>
                                <h3 class="text-xl font-bold">Your Startup</h3>
                                <p class="text-gray-400 text-[10px] mt-2 uppercase">Brought To Life</p>
                            </div>
                            <div class="space-y-6">
                                <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500 text-left"><h4 class="font-bold">The Builder</h4><p class="text-sm text-gray-600">"I have the skills to build impactful products."</p></div>
                                <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500 text-left"><h4 class="font-bold">The Backer</h4><p class="text-sm text-gray-600">"I'm looking to invest in early-stage startups."</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function AuthView(type) {
    const isLogin = type === 'login';
    return `
        <div class="min-h-screen flex">
            <!-- Left Side - Branding -->
            <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a0b2e] via-[#1E1B4B] to-[#1a0b2e] relative overflow-hidden">
                <!-- Background Effects -->
                <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
                <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]"></div>
                
                <div class="relative z-10 flex flex-col justify-center px-12 max-w-xl mx-auto">
                    <!-- Logo -->
                    <div class="mb-8">
                        <span class="text-3xl font-bold text-white tracking-tight">Foundera</span>
                    </div>
                    
                    <!-- Main Text -->
                    <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                        One Platform.<br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Three Goals.</span>
                    </h1>
                    
                    <!-- Three Focus Points -->
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i data-lucide="lightbulb" class="w-6 h-6 text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-white font-semibold">For Founders</h3>
                                <p class="text-gray-400 text-sm">Share your idea & build your dream team</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i data-lucide="briefcase" class="w-6 h-6 text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-white font-semibold">For Job Seekers</h3>
                                <p class="text-gray-400 text-sm">Find your dream job at exciting startups</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i data-lucide="trending-up" class="w-6 h-6 text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-white font-semibold">For Investors</h3>
                                <p class="text-gray-400 text-sm">Discover & invest in the next big thing</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Feature Tags -->
                    <div class="flex flex-wrap gap-3">
                        <span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                            <i data-lucide="lightbulb" class="w-4 h-4 text-purple-400"></i> Share Ideas
                        </span>
                        <span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4 text-cyan-400"></i> Find Talent
                        </span>
                        <span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i> Get Funded
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Right Side - Form -->
            <div class="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
                <div class="w-full max-w-md">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-900 mb-2">${isLogin ? 'Welcome Back' : 'Sign up for an account'}</h2>
                    </div>
                    
                    <form onsubmit="handleAuth(event, '${type}')" class="space-y-4">
                        ${!isLogin ? `
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input name="firstName" required placeholder="First Name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input name="lastName" required placeholder="Last Name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all">
                            </div>
                        </div>
                        ` : ''}
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input name="email" required type="email" placeholder="Email Address" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input name="password" required type="password" placeholder="Password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all">
                        </div>
                        ${!isLogin ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">I want to</label>
                            <select name="role" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all">
                                <option value="Founder">Launch my startup idea</option>
                                <option value="Job Seeker">Find a job at a startup</option>
                                <option value="Investor">Invest in startups</option>
                            </select>
                        </div>
                        <p class="text-xs text-gray-500">By signing up you agree to our <a href="#" class="text-purple-600 hover:underline">Terms and Conditions</a> and <a href="#" class="text-purple-600 hover:underline">Privacy Policy</a>.</p>
                        ` : ''}
                        <button type="submit" class="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3 rounded-full transition-all shadow-lg">
                            ${isLogin ? 'Sign In' : 'Register'}
                        </button>
                    </form>
                    <div class="mt-6 text-center text-sm text-gray-500">
                        ${isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onclick="navigateTo('${isLogin?'signup':'login'}')" class="text-purple-600 font-semibold hover:underline">${isLogin?'Sign up':'Log in'}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function FounderDashboard() {
    const tab = state.founderTab;
    return `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><h1 class="text-3xl font-bold">Welcome, Founder ${state.currentUser.name}!</h1></div>
                <button onclick="setFounderTab('post')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 transition-all"><i data-lucide="plus-circle" class="mr-2"></i> Post Idea</button>
            </div>
            <div class="flex border-b border-gray-200 mb-6 space-x-6">
                <button onclick="setFounderTab('ideas')" class="pb-3 text-sm font-medium ${tab==='ideas'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}">My Ideas</button>
                <button onclick="setFounderTab('talent')" class="pb-3 text-sm font-medium ${tab==='talent'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}">Find Talent</button>
                <button onclick="setFounderTab('investors')" class="pb-3 text-sm font-medium ${tab==='investors'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}">Investors</button>
            </div>
            ${tab === 'ideas' ? `
                <div class="grid md:grid-cols-2 gap-6">
                    ${state.ideas.map(i => `<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"><h3 class="text-xl font-bold mb-2">${i.title}</h3><p class="text-gray-600 text-sm mb-4 line-clamp-2">${i.description}</p><div class="flex justify-between items-center mt-6 pt-4 border-t"><span class="text-green-600 font-medium">Funding: ${i.fundingNeeded}</span><button class="text-blue-600 text-sm font-bold">Edit</button></div></div>`).join('')}
                </div>
            ` : tab === 'talent' ? `
                <div class="grid md:grid-cols-3 gap-6">
                    ${mockSeekers.map(s => `<div class="bg-white p-5 rounded-xl border border-gray-200 text-center hover:shadow-md transition-all"><i data-lucide="user-circle" class="w-12 h-12 text-green-600 mx-auto mb-3"></i><h3 class="font-bold">${s.name}</h3><p class="text-sm text-gray-500 mb-3">${s.role}</p><div class="flex flex-wrap justify-center gap-1 mb-4">${s.skills.map(sk=>`<span class="bg-gray-100 text-[10px] px-2 py-1 rounded">${sk}</span>`).join('')}</div><button class="w-full bg-gray-900 text-white py-2 rounded-lg text-sm">Message</button></div>`).join('')}
                </div>
            ` : tab === 'investors' ? `
                <div class="grid md:grid-cols-2 gap-6">
                    ${mockInvestors.map(inv => `<div class="bg-white p-6 rounded-xl border border-gray-200 flex items-start hover:shadow-md transition-all"><div class="bg-purple-100 p-3 rounded-lg mr-4"><i data-lucide="trending-up" class="text-purple-600"></i></div><div><h3 class="font-bold text-lg">${inv.name}</h3><p class="text-sm text-gray-500 mb-2">Ticket: ${inv.ticketSize}</p><div class="flex gap-2">${inv.focus.map(f=>`<span class="text-xs border border-purple-200 text-purple-700 px-2 py-1 rounded-full font-medium">${f}</span>`).join('')}</div></div></div>`).join('')}
                </div>
            ` : `
                <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto text-left">
                    <h2 class="text-2xl font-bold mb-6">Launch Your Idea</h2>
                    <form onsubmit="postNewIdea(event)" class="space-y-4">
                        <div><label class="block text-sm font-medium mb-1">Title</label><input name="title" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Description</label><textarea name="description" required rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"></textarea></div>
                        <div><label class="block text-sm font-medium mb-1">Skills (comma separated)</label><input name="skills" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="React, UI/UX"></div>
                        <div><label class="block text-sm font-medium mb-1">Funding Target</label><input name="funding" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="$10,000"></div>
                        <button type="submit" class="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-all">Publish Idea</button>
                    </form>
                </div>
            `}
        </div>
    `;
}

function JobSeekerDashboard() {
    return `
        <div class="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            <div class="w-full md:w-1/3"><div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24 text-center">
                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-blue-600 shadow-inner">${state.currentUser.name[0]}</div>
                <h2 class="text-xl font-bold">${state.currentUser.name}</h2><p class="text-gray-500 text-sm mb-4">Software Engineer</p>
                <div class="w-full border-t border-gray-100 pt-4 mt-2 space-y-2">
                    <div class="flex justify-between text-sm"><span>Skills:</span><span class="font-medium">React, JS</span></div>
                    <div class="flex justify-between text-sm"><span>Status:</span><span class="font-medium text-green-600 bg-green-50 px-2 rounded">Active</span></div>
                    <button class="w-full mt-4 border border-blue-600 text-blue-600 py-2 rounded-lg font-medium transition-colors hover:bg-blue-50">Update CV</button>
                </div>
            </div></div>
            <div class="w-full md:w-2/3"><h2 class="text-2xl font-bold mb-6">Recommended Startups</h2>
                <div class="space-y-6">${state.ideas.map(i => `<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                    <h3 class="text-xl font-bold text-blue-700 mb-2">${i.title}</h3><p class="text-xs text-gray-500 mb-4 flex items-center"><i data-lucide="user" class="w-3 h-3 mr-1"></i> Founder: ${i.founder}</p>
                    <p class="text-gray-700 mb-4">${i.description}</p>
                    <div class="flex flex-wrap gap-2 mb-6">${i.skillsNeeded.map(s=>`<span class="bg-gray-50 border text-xs px-2 py-1 rounded">${s}</span>`).join('')}</div>
                    <button class="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">Apply Now</button>
                </div>`).join('')}</div>
            </div>
        </div>
    `;
}

function InvestorDashboard() {
    return `
        <div class="max-w-7xl mx-auto px-4 py-8"><h1 class="text-3xl font-bold mb-8">Investment Opportunities</h1>
            <div class="grid md:grid-cols-3 gap-6">
                ${state.ideas.map(i => `
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col transition-shadow hover:shadow-md">
                        <div class="flex justify-between items-start mb-4"><span class="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest">${i.industry}</span><i data-lucide="star" class="w-5 h-5 text-gray-300"></i></div>
                        <h3 class="text-xl font-bold mb-2">${i.title}</h3><p class="text-xs text-gray-500 mb-4">By ${i.founder}</p>
                        <p class="text-gray-600 text-sm mb-6 flex-1 line-clamp-2">${i.description}</p>
                        <div class="border-t pt-4 mt-auto space-y-4">
                            <div class="flex justify-between items-center"><span class="text-xs text-gray-400 font-bold uppercase">Ask</span><span class="font-bold text-green-600 text-lg">${i.fundingNeeded}</span></div>
                            <div class="grid grid-cols-2 gap-2"><button class="bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors">Pitch Deck</button><button class="border border-gray-300 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">Contact</button></div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>
    `;
}

function Footer() {
    return `
        <footer class="bg-gray-900 text-gray-400 py-12 px-6 mt-auto">
            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-800 pb-8 mb-8">
                <div class="col-span-1 md:col-span-2">
                    <div class="flex items-center mb-4"><div class="bg-blue-600 p-1.5 rounded-lg mr-2"><i data-lucide="lightbulb" class="text-white h-5 w-5"></i></div><span class="text-2xl font-bold text-white tracking-tight">Foundera</span></div>
                    <p class="text-sm max-w-sm leading-relaxed">Empowering the next generation of innovators by connecting founders, talent, and capital in one unified ecosystem.</p>
                </div>
                <div><h4 class="text-white font-semibold mb-4">Platform</h4><ul class="space-y-2 text-sm"><li>Founders</li><li>Job Seekers</li><li>Investors</li></ul></div>
                <div><h4 class="text-white font-semibold mb-4">Company</h4><ul class="space-y-2 text-sm"><li>About</li><li>Privacy</li><li>Terms</li></ul></div>
            </div>
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
                <p>© 2024 Foundera Inc. All rights reserved.</p>
                <div class="flex items-center mt-4 md:mt-0 space-x-2"><i data-lucide="shield" class="w-4 h-4"></i><span>Secure & Trusted Platform</span></div>
            </div>
        </footer>
    `;
}

// --- CORE RENDERER ---
function render() {
    const app = document.getElementById('app-root');
    const nav = document.getElementById('navbar-root');
    const footer = document.getElementById('footer-root');

    nav.innerHTML = Navbar();
    footer.innerHTML = Footer();

    if (state.currentScreen === 'home') app.innerHTML = HomeView();
    else if (state.currentScreen === 'login') app.innerHTML = AuthView('login');
    else if (state.currentScreen === 'signup') app.innerHTML = AuthView('signup');
    else if (state.currentScreen === 'dashboard') {
        if(!state.currentUser) { navigateTo('home'); return; }
        const role = state.currentUser.role;
        if(role === 'Founder') app.innerHTML = FounderDashboard();
        else if(role === 'Job Seeker') app.innerHTML = JobSeekerDashboard();
        else if(role === 'Investor') app.innerHTML = InvestorDashboard();
    }

    lucide.createIcons();
}

window.onload = function() {
    render();
    // Initialize Google Sign-In after page loads
    setTimeout(initGoogleSignIn, 500);
};