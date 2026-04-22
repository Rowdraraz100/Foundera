// ============================================
//   FOUNDERA — Index Page (Home / Auth / Dashboard)
//   ============================================ 

/* --- DATA & STATE --- */
var state = {
    currentUser: null,
    currentScreen: 'home',
    googleUser: null,
    ideas: [
        { id: 1, title: 'Krishi-AI: AI based Farming Assistant', founder: 'Rahim Uddin', description: 'Our platform uses AI to help farmers diagnose crop diseases. We are currently looking for a Frontend Developer to join our team.', skillsNeeded: ['React', 'Mobile App', 'UI/UX'], industry: 'AgriTech', fundingNeeded: '$50,000' },
        { id: 2, title: 'FinSheba: Rural Banking App', founder: 'Sadia Rahman', description: 'A simple banking app for rural people. We have completed our MVP and are currently looking for seed funding.', skillsNeeded: ['Node.js', 'Cybersecurity'], industry: 'FinTech', fundingNeeded: '$100,000' }
    ],
    founderTab: 'ideas'
};

var mockSeekers = [];
var mockInvestors = [];

/* --- AUTH CONFIG --- */
// Gmail-only validation
var GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
var GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function initGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleSignIn, auto_select: false });
    }
}

function handleGoogleSignIn(response) {
    var payload = JSON.parse(atob(response.credential.split('.')[1]));
    state.googleUser = { name: payload.name, email: payload.email, picture: payload.picture };
    showRoleSelectionModal(payload.name, payload.email, payload.picture);
}

function signInWithGoogle() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt(function (notification) {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                google.accounts.id.renderButton(document.createElement('div'), { theme: 'outline', size: 'large' });
                var client = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID, scope: 'email profile',
                    callback: function (tokenResponse) {
                        fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + tokenResponse.access_token } })
                            .then(function (r) { return r.json(); })
                            .then(function (u) { state.googleUser = { name: u.name, email: u.email, picture: u.picture }; showRoleSelectionModal(u.name, u.email, u.picture); });
                    }
                });
                client.requestAccessToken();
            }
        });
    } else { showToast('Google Sign-In is loading. Please try again.', 'info'); }
}

/* --- ROLE SELECTION MODAL --- */
function showRoleSelectionModal(name, email, picture) {
    var m = document.createElement('div');
    m.id = 'role-modal';
    m.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]';
    m.innerHTML =
        '<div class="bg-[#1E1B4B] rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-text-spring">' +
            '<div class="text-center mb-6">' +
                '<img src="' + (picture || '') + '" alt="Profile" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-500/30" onerror="this.style.display=\'none\'">' +
                '<h2 class="text-2xl font-bold text-white mb-1">Welcome, ' + name + '!</h2>' +
                '<p class="text-gray-400 text-sm">' + email + '</p>' +
            '</div>' +
            '<p class="text-gray-300 text-center mb-6">What brings you to Foundera?</p>' +
            '<div class="space-y-3">' +
                '<button onclick="completeGoogleSignUp(\'Founder\')" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/20">I\'m a Founder</button>' +
                '<button onclick="completeGoogleSignUp(\'Job Seeker\')" class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20">I\'m a Job Seeker</button>' +
                '<button onclick="completeGoogleSignUp(\'Investor\')" class="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20">I\'m an Investor</button>' +
            '</div>' +
            '<button onclick="closeRoleModal()" class="w-full mt-4 text-gray-400 hover:text-white text-sm py-2 transition-colors">Cancel</button>' +
        '</div>';
    document.body.appendChild(m);
}

function closeRoleModal() {
    var m = document.getElementById('role-modal');
    if (m) m.remove();
    state.googleUser = null;
}

/* --- FORGOT PASSWORD MODAL --- */
function showForgotPasswordModal() {
    var existingModal = document.getElementById('forgot-password-modal');
    if (existingModal) existingModal.remove();

    var emailInput = document.querySelector('input[name="email"]');
    var emailVal = emailInput ? emailInput.value : '';

    var m = document.createElement('div');
    m.id = 'forgot-password-modal';
    m.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4';
    m.innerHTML =
        '<div class="bg-[#1E1B4B] rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl animate-text-spring">' +
            '<div class="text-center mb-6">' +
                '<div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
                '<h2 class="text-2xl font-bold text-white mb-2">Reset Password</h2>' +
                '<p class="text-gray-400 text-sm">Enter your email address and we\'ll send you a link to reset your password.</p>' +
            '</div>' +
            '<form onsubmit="handleForgotPassword(event)" class="space-y-4">' +
                '<div>' +
                    '<input type="email" id="reset-email-input" required value="' + emailVal + '" placeholder="yourname@gmail.com" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all placeholder-gray-500">' +
                '</div>' +
                '<button type="submit" id="reset-submit-btn" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20">Send Reset Link</button>' +
                '<button type="button" onclick="document.getElementById(\'forgot-password-modal\').remove()" class="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors">Cancel</button>' +
            '</form>' +
        '</div>';
    document.body.appendChild(m);
}

function handleForgotPassword(event) {
    event.preventDefault();
    var email = document.getElementById('reset-email-input').value.trim();
    var btn = document.getElementById('reset-submit-btn');
    
    if (!GMAIL_REGEX.test(email)) {
        showToast('Please use a valid @gmail.com email address.', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        showToast('Password reset link sent! Check your email.', 'success');
        document.getElementById('forgot-password-modal').remove();
    }).catch(function(error) {
        var msg = 'Failed to send reset link. ';
        if (error.code === 'auth/user-not-found') msg += 'No account found with this email.';
        else if (error.code === 'auth/invalid-email') msg += 'Invalid email format.';
        else msg += error.message;
        showToast(msg, 'error');
        btn.disabled = false;
        btn.textContent = 'Send Reset Link';
    });
}

/* --- FIREBASE HELPERS --- */
function saveUserToFirebase(userData) {
    if (typeof firebase === 'undefined' || !firebase.database) { console.error('Firebase not available'); return Promise.reject(); }
    var db = firebase.database();
    var safeKey = userData.email.replace(/[.#$\[\]]/g, '_');
    var roleFolder = userData.role === 'Founder' ? 'founders' : userData.role === 'Job Seeker' ? 'jobseekers' : 'investors';
    var d = {
        name: userData.name, email: userData.email, role: userData.role,
        picture: userData.picture || '', signupMethod: userData.signupMethod || 'email',
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : (userData.signupMethod === 'google'),
        createdAt: new Date().toISOString(), lastLogin: new Date().toISOString()
    };
    if (firebase.auth().currentUser) d.uid = firebase.auth().currentUser.uid;
    return db.ref('users/' + roleFolder + '/' + safeKey).set(d)
        .then(function () { console.log('User saved to DB'); })
        .catch(function (e) {
            console.error('DB error:', e);
            if (e.code === 'PERMISSION_DENIED') showToast('Database write blocked. Please update Firebase rules.', 'error');
        });
}

function completeGoogleSignUp(role) {
    var g = state.googleUser;
    state.currentUser = { name: g.name, email: g.email, role: role, picture: g.picture };
    saveUserToFirebase({ name: g.name, email: g.email, role: role, picture: g.picture, signupMethod: 'google', emailVerified: true }).then(function () {
        closeRoleModal();
        redirectToDashboard(g.name, g.email, role);
    }).catch(function () { closeRoleModal(); showToast('Failed to save data. Please check database rules.', 'error'); });
}

/* --- TOAST NOTIFICATIONS --- */
function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none';
        container.style.maxWidth = '420px';
        document.body.appendChild(container);
    }
    var colors = { success: 'bg-green-500/15 border-green-500/30 text-green-300', error: 'bg-red-500/15 border-red-500/30 text-red-300', info: 'bg-blue-500/15 border-blue-500/30 text-blue-300', warning: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' };
    var icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    var toast = document.createElement('div');
    toast.className = 'pointer-events-auto backdrop-blur-xl border rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl min-w-[280px] ' + (colors[type] || colors.info) + ' animate-toast-in';
    toast.innerHTML = (icons[type] || icons.info) + '<span class="text-sm font-medium flex-1">' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.classList.add('animate-toast-out');
        setTimeout(function() { if (toast.parentElement) toast.remove(); }, 300);
    }, 5000);
}

/* --- FORM HELPERS --- */
function validateEmailField(input, isSignup) {
    var icon = document.getElementById('email-check-icon');
    var hint = document.getElementById('email-hint');
    if (!input.value) { if (icon) icon.innerHTML = ''; if (hint) { hint.textContent = isSignup ? 'Only @gmail.com emails are accepted' : ''; hint.className = 'text-xs text-gray-400 mt-1'; } input.classList.remove('border-red-400', 'border-green-400'); input.classList.add('border-gray-300'); return; }
    if (isSignup && !GMAIL_REGEX.test(input.value)) {
        if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        if (hint) { hint.textContent = 'Only @gmail.com emails are accepted'; hint.className = 'text-xs text-red-500 mt-1'; }
        input.classList.add('border-red-400'); input.classList.remove('border-green-400', 'border-gray-300');
    } else {
        if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        if (hint) { hint.textContent = 'Valid Gmail address'; hint.className = 'text-xs text-green-600 mt-1'; }
        input.classList.add('border-green-400'); input.classList.remove('border-red-400', 'border-gray-300');
    }
}

function updatePasswordStrength(val) {
    var container = document.getElementById('password-strength');
    var bar = document.getElementById('strength-bar');
    var text = document.getElementById('strength-text');
    if (!container || !bar || !text) return;
    if (!val) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    var score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;
    var levels = [
        { w: '20%', c: '#ef4444', t: 'Very Weak' },
        { w: '40%', c: '#f97316', t: 'Weak' },
        { w: '60%', c: '#eab308', t: 'Fair' },
        { w: '80%', c: '#22c55e', t: 'Strong' },
        { w: '100%', c: '#10b981', t: 'Very Strong' }
    ];
    var level = levels[Math.min(score, levels.length) - 1] || levels[0];
    bar.style.width = level.w; bar.style.backgroundColor = level.c;
    text.textContent = level.t; text.style.color = level.c;
}

function togglePasswordVisibility(btn) {
    var input = btn.parentElement.querySelector('input');
    if (!input) return;
    var isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

/* --- NAVIGATION --- */
function navigateTo(screen) {
    state.currentScreen = screen;
    render();
    window.scrollTo(0, 0);
}

function handleLogout() {
    state.currentUser = null;
    firebase.auth().signOut().catch(function(){});
    localStorage.removeItem('founderName');
    localStorage.removeItem('founderEmail');
    localStorage.removeItem('seekerName');
    localStorage.removeItem('seekerEmail');
    localStorage.removeItem('investorName');
    localStorage.removeItem('investorEmail');
    localStorage.removeItem('pendingSignup');
    localStorage.removeItem('pendingSignupData'); // Clear new memory
    localStorage.removeItem('currentOTP');
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    navigateTo('home');
}

function setFounderTab(tab) {
    state.founderTab = tab;
    render();
}

/* --- ROLE-BASED REDIRECT HELPER --- */
function redirectToDashboard(name, email, role) {
    if (role === 'Founder') {
        localStorage.setItem('founderName', name);
        localStorage.setItem('founderEmail', email);
        setTimeout(function() { window.location.href = 'founder.html'; }, 400);
    } else if (role === 'Job Seeker') {
        localStorage.setItem('seekerName', name);
        localStorage.setItem('seekerEmail', email);
        setTimeout(function() { window.location.href = 'jobseeker.html'; }, 400);
    } else if (role === 'Investor') {
        localStorage.setItem('investorName', name);
        localStorage.setItem('investorEmail', email);
        setTimeout(function() { window.location.href = 'investor.html'; }, 400);
    }
}

/* --- LOGIN ROLE SELECTION (when user is in Auth but not in DB) --- */
function showLoginRoleSelection(name, email) {
    var m = document.createElement('div');
    m.id = 'login-role-modal';
    m.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]';
    m.innerHTML =
        '<div class="bg-[#1E1B4B] rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-text-spring">' +
            '<div class="text-center mb-6">' +
                '<h2 class="text-2xl font-bold text-white mb-1">Welcome, ' + name + '!</h2>' +
                '<p class="text-gray-400 text-sm">' + email + '</p>' +
            '</div>' +
            '<p class="text-gray-300 text-center mb-6">Please select your role to continue:</p>' +
            '<div class="space-y-3">' +
                '<button onclick="completeLoginRoleSelection(\'' + name.replace(/'/g, "\\'") + '\',\'' + email.replace(/'/g, "\\'") + '\',\'Founder\')" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/20">I\'m a Founder</button>' +
                '<button onclick="completeLoginRoleSelection(\'' + name.replace(/'/g, "\\'") + '\',\'' + email.replace(/'/g, "\\'") + '\',\'Job Seeker\')" class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20">I\'m a Job Seeker</button>' +
                '<button onclick="completeLoginRoleSelection(\'' + name.replace(/'/g, "\\'") + '\',\'' + email.replace(/'/g, "\\'") + '\',\'Investor\')" class="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20">I\'m an Investor</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(m);
}

function completeLoginRoleSelection(name, email, role) {
    var m = document.getElementById('login-role-modal');
    if (m) m.remove();
    saveUserToFirebase({ name: name, email: email, role: role, picture: '', signupMethod: 'email', emailVerified: true }).then(function() {
        localStorage.removeItem('pendingSignup');
        state.currentUser = { name: name, email: email, role: role };
        showToast('Welcome, ' + name + '!', 'success');
        redirectToDashboard(name, email, role);
    }).catch(function() {
        state.currentUser = { name: name, email: email, role: role };
        redirectToDashboard(name, email, role);
    });
}

/* --- ROLE LOOKUP HELPER --- */
function lookupUserRole(email) {
    if (typeof firebase === 'undefined' || !firebase.database) return Promise.resolve(null);
    var db = firebase.database();
    var safeKey = email.replace(/[.#$\[\]]/g, '_');
    return Promise.all([
        db.ref('users/founders/' + safeKey).once('value'),
        db.ref('users/jobseekers/' + safeKey).once('value'),
        db.ref('users/investors/' + safeKey).once('value')
    ]).then(function(results) {
        var founderData = results[0].val();
        var seekerData = results[1].val();
        var investorData = results[2].val();
        if (founderData) return { user: founderData, role: 'Founder' };
        if (seekerData) return { user: seekerData, role: 'Job Seeker' };
        if (investorData) return { user: investorData, role: 'Investor' };
        return null;
    });
}

/* --- OTP TIMER LOGIC --- */
var otpTimerInterval = null;

function startOTPTimer(duration) {
    var timerDisplay = document.getElementById('otp-countdown');
    var timerText = document.getElementById('otp-timer-text');
    var resendBtn = document.getElementById('resend-btn');
    var verifyBtn = document.getElementById('verify-otp-btn');
    
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    
    if (resendBtn) { resendBtn.disabled = true; }
    if (verifyBtn) { verifyBtn.disabled = false; }
    
    // Reset timer UI if it was previously expired
    if (timerText) { 
        timerText.innerHTML = 'Time remaining: <span id="otp-countdown" class="text-purple-400 font-bold"></span>'; 
        timerDisplay = document.getElementById('otp-countdown'); 
    }

    var timer = duration, minutes, seconds;
    otpTimerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timerDisplay) timerDisplay.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(otpTimerInterval);
            if (timerText) timerText.innerHTML = '<span class="text-red-400 font-medium">Code expired. Please resend.</span>';
            if (resendBtn) { resendBtn.disabled = false; }
            if (verifyBtn) { verifyBtn.disabled = true; }
            localStorage.removeItem('currentOTP'); // Expire the code in memory
        }
    }, 1000);
}

/* --- OTP EMAIL VERIFICATION --- */
function generateAndSendOTP(email) {
    // Generate a random 6-digit code
    var otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('currentOTP', otp);

    // EmailJS er maddhome ashol email pathano
    if (typeof emailjs !== 'undefined') {
        var serviceID = 'service_w6km8fi';   
        var templateID = 'template_j9jkke8';   
        var publicKey = 'pt1nWPB5tv9JSX76w';

        var templateParams = {
            to_email: email, 
            otp_code: otp    
        };

        emailjs.send(serviceID, templateID, templateParams, publicKey)
            .then(function(response) {
                console.log('OTP Email Sent Successfully!', response.status, response.text);
            }, function(error) {
                console.error('Failed to send OTP Email...', error);
            });
    } else {
        console.error("EmailJS script is missing in index.html");
    }

    return otp;
}

function showVerificationScreen(user, name, email, role) {
    state.currentScreen = 'verify';
    var app = document.getElementById('app-root');
    var nav = document.getElementById('navbar-root');
    var footer = document.getElementById('footer-root');
    if (nav) nav.innerHTML = '';
    if (footer) footer.innerHTML = '';
    app.innerHTML =
        '<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0b2e] via-[#1E1B4B] to-[#1a0b2e] px-4">' +
            '<div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">' +
                '<div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30 animate-bounce-slow">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
                '</div>' +
                '<h2 class="text-3xl font-bold text-white mb-3">Verify Your Email</h2>' +
                '<p class="text-gray-400 mb-2">We\'ve sent a 6-digit code to:</p>' +
                '<p class="text-purple-400 font-semibold text-lg mb-2">' + email + '</p>' +
                '<p id="otp-timer-text" class="text-gray-400 text-sm mb-6">Time remaining: <span id="otp-countdown" class="text-purple-400 font-bold">02:00</span></p>' +
                
                '<div class="mb-8">' +
                    '<div class="flex justify-center gap-2 mb-6" id="otp-container">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                        '<input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">' +
                    '</div>' +
                    '<button id="verify-otp-btn" onclick="verifyEnteredOTP(\'' + name.replace(/'/g, "\\'") + '\', \'' + email.replace(/'/g, "\\'") + '\', \'' + role + '\')" class="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed">Verify Code</button>' +
                '</div>' +
                
                '<div class="space-y-3">' +
                    '<button onclick="resendVerificationEmail(\'' + email.replace(/'/g, "\\'") + '\')" id="resend-btn" disabled class="w-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-medium py-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">Resend Code</button>' +
                    '<button onclick="cancelVerification()" class="w-full border border-white/20 text-gray-400 hover:text-white hover:border-white/40 font-medium py-3 rounded-xl transition-all">Back to Sign Up</button>' +
                '</div>' +
                '<p class="text-gray-500 text-xs mt-6">Check your spam/junk folder if you don\'t see the email</p>' +
            '</div>' +
        '</div>';

    // Store pending signup data
    localStorage.setItem('pendingSignup', JSON.stringify({ name: name, email: email, role: role }));
    setupOTPInputs();
    
    // Start 2-minute countdown timer (120 seconds)
    startOTPTimer(120);
}

function setupOTPInputs() {
    var inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(function(input, index) {
        // Auto focus next input
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        // Backspace to previous input
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
    // Focus first input automatically
    if(inputs.length > 0) setTimeout(function() { inputs[0].focus(); }, 100);
}

function verifyEnteredOTP(name, email, role) {
    var inputs = document.querySelectorAll('.otp-input');
    var enteredCode = '';
    inputs.forEach(function(i) { enteredCode += i.value; });

    var expectedCode = localStorage.getItem('currentOTP');

    if (enteredCode.length < 6) {
        showToast('Please enter the full 6-digit code.', 'error');
        return;
    }

    if (enteredCode === expectedCode && expectedCode != null) {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        
        var verifyBtn = document.getElementById('verify-otp-btn');
        if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying...'; }

        // Get saved password from local storage
        var pDataStr = localStorage.getItem('pendingSignupData');
        var pData = pDataStr ? JSON.parse(pDataStr) : null;
        var password = pData ? pData.password : 'TempPass123!';

        // Function to finalize and save to DB
        var finalize = function() {
            localStorage.removeItem('currentOTP');
            localStorage.removeItem('pendingSignup');
            localStorage.removeItem('pendingSignupData');
            
            saveUserToFirebase({ name: name, email: email, role: role, picture: '', signupMethod: 'email', emailVerified: true }).then(function() {
                state.currentUser = { name: name, email: email, role: role };
                showToast('Email verified successfully! Welcome to Foundera.', 'success');
                redirectToDashboard(name, email, role);
            });
        };

        // --- NEW FIX: Try to create Firebase Auth account ONLY after OTP is verified ---
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(cred) {
            var user = cred.user;
            user.updateProfile({ displayName: name }).catch(function(){});
            finalize();
        }).catch(function(e) {
            // Handle case if they had a previous unverified account in Firebase
            if (e.code === 'auth/email-already-in-use') {
                firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
                    finalize();
                }).catch(function() {
                    showToast('This email has an old account with a different password. Please reset password from Login page.', 'error');
                    if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = 'Verify Code'; }
                    inputs.forEach(function(i) { i.value = ''; });
                    if(inputs.length > 0) inputs[0].focus();
                });
            } else {
                showToast(e.message, 'error');
                if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = 'Verify Code'; }
            }
        });
    } else {
        if (!expectedCode) {
            showToast('Code expired. Please resend.', 'error');
        } else {
            showToast('Invalid verification code. Please try again.', 'error');
        }
        inputs.forEach(function(i) { i.value = ''; });
        if(inputs.length > 0) inputs[0].focus();
    }
}

function resendVerificationEmail(email) {
    var btn = document.getElementById('resend-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    
    // Generate new code
    generateAndSendOTP(email);
    
    showToast('New code sent! Check your inbox.', 'success');
    
    // Restart the 2-minute timer
    startOTPTimer(120); 
    if (btn) { btn.textContent = 'Resend Code'; } 
}

function cancelVerification() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    firebase.auth().signOut().catch(function(){});
    localStorage.removeItem('pendingSignup');
    localStorage.removeItem('pendingSignupData'); // Clear stored temp data
    localStorage.removeItem('currentOTP');
    navigateTo('signup');
}

/* --- AUTH HANDLER --- */
function handleAuth(event, type) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var email = fd.get('email'), password = fd.get('password');
    var firstName = fd.get('firstName') || '', lastName = fd.get('lastName') || '';
    var name = firstName && lastName ? firstName + ' ' + lastName : (fd.get('name') || 'User');
    var role = fd.get('role') || 'Founder';
    var submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = type === 'login' ? 'Signing in...' : 'Creating account...'; }

    if (type === 'login') {
        firebase.auth().signInWithEmailAndPassword(email, password).then(function (cred) {
            var user = cred.user;

            // Check our custom Database-level OTP Verification
            lookupUserRole(email).then(function(result) {
                var isVerifiedInDB = result ? result.user.emailVerified : false;

                if (!isVerifiedInDB) {
                    // User hasn't verified OTP yet
                    var pending = localStorage.getItem('pendingSignup');
                    var pendName = name, pendRole = role;
                    if (pending) {
                        try { var pData = JSON.parse(pending); if (pData.email === email) { pendName = pData.name; pendRole = pData.role; } } catch(e) {}
                    }
                    if (result) { pendName = result.user.name; pendRole = result.role; }
                    
                    showToast('Please verify your email before logging in.', 'warning');
                    
                    // We need to store password so verifyEnteredOTP can sign them in!
                    localStorage.setItem('pendingSignupData', JSON.stringify({
                        name: pendName, email: email, password: password, role: pendRole
                    }));

                    // Send OTP and show screen
                    generateAndSendOTP(email);
                    showVerificationScreen(user, pendName, email, pendRole);
                    
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
                    return;
                }

                // Email is verified — proceed with login
                var safeKey = email.replace(/[.#$\[\]]/g, '_');
                var db = firebase.database();
                var foundUser = result.user;
                var foundRole = result.role;
                var rf = foundRole === 'Founder' ? 'founders' : foundRole === 'Job Seeker' ? 'jobseekers' : 'investors';
                
                db.ref('users/' + rf + '/' + safeKey).update({ lastLogin: new Date().toISOString(), emailVerified: true });
                state.currentUser = { name: foundUser.name, email: foundUser.email, role: foundRole };
                showToast('Welcome back, ' + foundUser.name + '!', 'success');
                redirectToDashboard(foundUser.name, foundUser.email, foundRole);
                
            }).catch(function(err) {
                console.error('Role lookup failed:', err);
                showToast('Login failed. Could not retrieve your data. Please try again.', 'error');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
            });
        }).catch(function (e) {
            var msg = 'Login failed. ';
            if (e.code === 'auth/user-not-found') msg += 'No account found. Please sign up first.';
            else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') msg += 'Wrong password.';
            else if (e.code === 'auth/invalid-email') msg += 'Invalid email format.';
            else if (e.code === 'auth/too-many-requests') msg += 'Too many attempts. Try later.';
            else msg += e.message;
            showToast(msg, 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
        });
        return;
    }

    // SIGNUP — Validate @gmail.com
    if (!GMAIL_REGEX.test(email)) {
        showToast('Please use a valid @gmail.com email address.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
        return;
    }

    // --- NEW FIX: Delay Firebase Auth Creation Until OTP Verification ---
    // Prothome DB check korbo je verified account ache kina
    lookupUserRole(email).then(function(result) {
        if (result && result.user.emailVerified) {
            showToast('Email already registered. Please login instead.', 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
            return;
        }

        // Email verified na, ba account nei. Amra OTP pathabo kintu Firebase e ekhoni account toiri korbo na
        localStorage.setItem('pendingSignupData', JSON.stringify({
            name: name, email: email, password: password, role: role
        }));

        showToast('Verification code sent! Check your inbox.', 'success');
        generateAndSendOTP(email);
        showVerificationScreen(null, name, email, role);
        
    }).catch(function(err) {
        showToast('Something went wrong. Please try again.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
    });
}

function postNewIdea(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    state.ideas = [{ id: Date.now(), title: fd.get('title'), founder: state.currentUser.name, description: fd.get('description'), skillsNeeded: fd.get('skills').split(',').map(function (s) { return s.trim(); }), industry: 'General', fundingNeeded: fd.get('funding') || 'Not Disclosed' }].concat(state.ideas);
    state.founderTab = 'ideas';
    render();
}

/* ============================================
   COMPONENT TEMPLATES
   ============================================ */

function Navbar() {
    var user = state.currentUser;
    return '<nav id="main-nav" class="nav-glass nav-animated sticky top-0 z-50">' +
        '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">' +
            '<div class="flex items-center cursor-pointer gap-2" onclick="navigateTo(state.currentUser ? \'dashboard\' : \'home\')">' +
                '<img src="images/founderaLogo.jpeg" alt="Foundera" class="w-9 h-9 rounded-lg object-cover">' +
                '<span class="text-[1.65rem] logo-gradient tracking-tight nav-logo-text">Foundera</span>' +
            '</div>' +
            '<div class="hidden md:flex items-center space-x-6">' +
                '<a href="blog.html" class="nav-link-animated text-gray-300 hover:text-white font-medium text-sm">Blog</a>' +
                '<a href="success-stories.html" class="nav-link-animated text-gray-300 hover:text-white font-medium text-sm">Success Stories</a>' +
                '<a href="about-us.html" class="nav-link-animated text-gray-300 hover:text-white font-medium text-sm">About Us</a>' +
            '</div>' +
            /* Mobile hamburger */
            '<button id="index-mobile-hamburger" class="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/10 border border-white/20" onclick="toggleIndexMobileNav()">' +
                '<span class="block w-5 h-0.5 bg-white mb-1"></span><span class="block w-5 h-0.5 bg-white mb-1"></span><span class="block w-5 h-0.5 bg-white"></span>' +
            '</button>' +
            '<div class="hidden md:flex items-center space-x-3">' +
                (user
                    ? '<div class="flex items-center text-sm font-medium text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/20"><i data-lucide="user-circle" class="h-5 w-5 mr-1.5 text-purple-400"></i>' + user.name + ' (' + user.role + ')</div>' +
                      '<button onclick="handleLogout()" class="text-gray-300 hover:text-red-400 flex items-center text-sm font-medium"><i data-lucide="log-out" class="h-4 w-4 mr-1"></i> Logout</button>'
                    : '<button onclick="navigateTo(\'login\')" class="nav-link-animated text-gray-300 hover:text-white font-medium px-3 py-2 text-sm">Log in</button>' +
                      '<button onclick="navigateTo(\'signup\')" class="nav-btn-glow bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">Join for free</button>'
                ) +
            '</div>' +
        '</div>' +
    '</nav>' +
    /* Mobile Drawer */
    '<div id="index-mobile-overlay" class="mobile-nav-overlay" onclick="toggleIndexMobileNav()"></div>' +
    '<div id="index-mobile-drawer" class="mobile-nav-drawer">' +
        '<div class="flex justify-between items-center mb-8">' +
            '<div class="flex items-center gap-2"><img src="images/founderaLogo.jpeg" alt="Foundera" class="w-8 h-8 rounded-lg object-cover"><span class="text-xl logo-gradient">Foundera</span></div>' +
            '<button onclick="toggleIndexMobileNav()" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
        '<nav class="space-y-2">' +
            '<a href="blog.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-medium">Blog</a>' +
            '<a href="success-stories.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-medium">Success Stories</a>' +
            '<a href="about-us.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-medium">About Us</a>' +
        '</nav>' +
        '<div class="mt-8 space-y-3">' +
            (user
                ? '<div class="text-center text-white font-medium py-3">' + user.name + '</div><button onclick="handleLogout();toggleIndexMobileNav()" class="block w-full text-center px-4 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium">Logout</button>'
                : '<button onclick="navigateTo(\'login\');toggleIndexMobileNav()" class="block w-full text-center px-4 py-3 rounded-xl border border-white/20 text-white font-medium">Log in</button>' +
                  '<button onclick="navigateTo(\'signup\');toggleIndexMobileNav()" class="block w-full text-center px-4 py-3 rounded-xl bg-[#7c3aed] text-white font-semibold">Sign up for free</button>'
            ) +
        '</div>' +
    '</div>';
}

var indexMobileNavOpen = false;
function toggleIndexMobileNav() {
    indexMobileNavOpen = !indexMobileNavOpen;
    var overlay = document.getElementById('index-mobile-overlay');
    var drawer = document.getElementById('index-mobile-drawer');
    if (overlay && drawer) {
        overlay.classList.toggle('active', indexMobileNavOpen);
        drawer.classList.toggle('active', indexMobileNavOpen);
        document.body.style.overflow = indexMobileNavOpen ? 'hidden' : '';
    }
}

/* --- Dashboard Tab Switcher --- */
function switchDashboardTab(tab) {
    var tabs = ['founder', 'seeker', 'investor'];
    var colors = { founder: 'purple', seeker: 'cyan', investor: 'emerald' };
    tabs.forEach(function(t) {
        var btn = document.getElementById('dtab-' + t);
        var panel = document.getElementById('dpanel-' + t);
        if (t === tab) {
            panel.style.display = 'block';
            btn.className = 'dashboard-tab active flex-1 px-4 py-3.5 text-sm font-semibold text-' + colors[t] + '-400 border-b-2 border-' + colors[t] + '-500 bg-white/5 transition-all';
        } else {
            panel.style.display = 'none';
            btn.className = 'dashboard-tab flex-1 px-4 py-3.5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-' + colors[t] + '-400 transition-all';
        }
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* --- HOME VIEW --- */
function HomeView() {
    return '<div class="flex flex-col">' +
        /* Hero */
        '<section class="w-full bg-[#1a0b2e] text-white relative min-h-[85vh] flex items-center overflow-hidden">' +
            '<div class="absolute inset-0 overflow-hidden">' +
                '<div class="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/4"><div class="absolute inset-0 bg-gradient-to-l from-purple-600/40 via-purple-500/20 to-transparent rounded-full blur-[100px]"></div><div class="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-transparent rounded-full blur-[80px] animate-pulse"></div></div>' +
                '<div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-700/20 rounded-full blur-[80px]"></div>' +
            '</div>' +
            '<div class="relative py-20 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12">' +
                '<div class="flex-1 text-left space-y-8 z-10">' +
                    '<h1 class="hero-font text-5xl md:text-7xl font-bold text-white animate-text-spring leading-[1.1] hero-glow"><span class="text-white animate-shimmer">World\'s First</span><br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 animate-gradient">Integrated Platform</span></h1>' +
                    '<p class="hero-font text-xl md:text-2xl text-gray-300 animate-text-spring delay-100 max-w-xl leading-relaxed">Connecting <span class="text-purple-400 font-semibold animate-pulse-text">Founders</span>, <span class="text-cyan-400 font-semibold animate-pulse-text delay-200">Job Seekers</span> & <span class="text-emerald-400 font-semibold animate-pulse-text delay-400">Investors</span> in one single platform.</p>' +
                    '<div class="flex flex-wrap gap-4 animate-text-spring delay-200"><button onclick="navigateTo(\'signup\')" class="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-semibold px-8 py-4 rounded-full text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-purple-500/40">Sign up with email</button></div>' +
                    '<p class="text-gray-400 text-sm animate-text-spring delay-300">By signing up, you agree to Foundera\'s <a href="#" class="text-gray-300 underline hover:text-white">Terms of Service</a>.</p>' +
                '</div>' +
                /* Orbit Animation */
                '<div class="flex-1 w-full relative h-[350px] md:h-[500px] z-10 flex items-center justify-center">' +
                    '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg pointer-events-none scale-[0.6] md:scale-100 transition-transform">' +
                        '<div class="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-tr from-fuchsia-500 to-purple-500 rounded-full blur-[100px] animate-[center-glow_4s_infinite] opacity-50"></div>' +
                        '<div class="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full blur-[60px] animate-[center-glow_3s_infinite] opacity-20"></div>' +
                        '<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-particle"></div>' +
                        '<div class="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-particle delay-300"></div>' +
                        '<div class="absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-particle delay-500"></div>' +
                        '<div class="absolute top-1/2 left-1/2 w-[200px] h-[200px] -mt-[100px] -ml-[100px] border border-dashed border-purple-400/50 rounded-full animate-orbit"><div class="absolute top-0 left-1/2 -mt-8 -ml-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center animate-counter shadow-xl shadow-purple-500/40"><i data-lucide="lightbulb" class="text-white w-7 h-7"></i><span class="absolute -bottom-6 text-xs text-purple-300 font-medium whitespace-nowrap">Founders</span></div></div>' +
                        '<div class="absolute top-1/2 left-1/2 w-[320px] h-[320px] -mt-[160px] -ml-[160px] border border-dashed border-cyan-400/40 rounded-full animate-orbit-reverse"><div class="absolute top-[10%] -left-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center animate-counter-reverse shadow-xl shadow-cyan-500/40"><i data-lucide="users" class="text-white w-7 h-7"></i><span class="absolute -bottom-6 text-xs text-cyan-300 font-medium whitespace-nowrap">Job Seekers</span></div><div class="absolute bottom-[15%] -right-6 w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center animate-counter-reverse shadow-lg shadow-blue-500/30 animate-bounce-slow"><i data-lucide="briefcase" class="text-white w-6 h-6"></i></div></div>' +
                        '<div class="absolute top-1/2 left-1/2 w-[440px] h-[440px] -mt-[220px] -ml-[220px] border border-dashed border-emerald-400/30 rounded-full animate-orbit" style="animation-duration:50s"><div class="absolute bottom-[5%] left-1/2 -ml-8 w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center animate-counter shadow-xl shadow-emerald-500/40" style="animation-duration:50s"><i data-lucide="trending-up" class="text-white w-7 h-7"></i><span class="absolute -bottom-6 text-xs text-emerald-300 font-medium whitespace-nowrap">Investors</span></div><div class="absolute top-[20%] -right-5 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center animate-counter shadow-lg shadow-amber-500/30 animate-pulse" style="animation-duration:50s"><i data-lucide="dollar-sign" class="text-white w-5 h-5"></i></div></div>' +
                        '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-slow border-4 border-white/20"><i data-lucide="rocket" class="text-white w-8 h-8"></i></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>' +

        /* Platform Preview — Dashboard Screenshot Showcase */
        '<section class="w-full bg-[#1a0b2e] relative overflow-hidden pb-24">' +
            '<div class="absolute inset-0"><div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]"></div><div class="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"></div></div>' +
            '<div class="max-w-6xl mx-auto px-6 relative z-10">' +
                '<div class="text-center mb-14 scroll-reveal reveal-up">' +
                    '<div class="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-5 py-2 mb-8"><span class="text-purple-400 text-sm font-semibold">Inside Foundera</span><span class="text-gray-300 text-sm">Experience the platform →</span></div>' +
                    '<h2 class="hero-font text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">Your Dashboard,<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">Your Command Center</span></h2>' +
                    '<p class="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">Every role gets a personalized experience. Here\'s a real look at what you\'ll get inside Foundera.</p>' +
                '</div>' +
                /* Screenshot Tabs */
                '<div class="scroll-reveal reveal-scale relative">' +
                    '<div class="absolute -inset-6 bg-gradient-to-b from-purple-600/25 via-purple-500/10 to-transparent rounded-[36px] blur-2xl"></div>' +
                    '<div class="relative bg-gradient-to-b from-[#2d1b69]/80 to-[#1a0b2e]/90 rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-900/50">' +
                        /* Tab bar */
                        '<div class="flex items-center gap-0 bg-black/40 border-b border-white/5">' +
                            '<button onclick="switchDashboardTab(\'founder\')" id="dtab-founder" class="dashboard-tab active flex-1 px-4 py-4 text-sm font-semibold text-purple-400 border-b-2 border-purple-500 bg-white/5 transition-all"><i data-lucide="lightbulb" class="w-4 h-4 inline mr-1.5"></i>Founder Dashboard</button>' +
                            '<button onclick="switchDashboardTab(\'seeker\')" id="dtab-seeker" class="dashboard-tab flex-1 px-4 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-cyan-400 transition-all"><i data-lucide="briefcase" class="w-4 h-4 inline mr-1.5"></i>Job Seeker</button>' +
                            '<button onclick="switchDashboardTab(\'investor\')" id="dtab-investor" class="dashboard-tab flex-1 px-4 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-emerald-400 transition-all"><i data-lucide="trending-up" class="w-4 h-4 inline mr-1.5"></i>Investor</button>' +
                        '</div>' +
                        /* Founder Panel — Screenshots */
                        '<div id="dpanel-founder" class="dashboard-panel p-4 md:p-6">' +
                            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
                                '<div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/20">' +
                                    '<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4"><span class="text-white text-sm font-medium">Dashboard Overview</span></div>' +
                                    '<img src="images/founderdashboard.png" alt="Founder Dashboard Overview" class="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105">' +
                                '</div>' +
                                '<div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/20">' +
                                    '<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4"><span class="text-white text-sm font-medium">Share Your Idea</span></div>' +
                                    '<img src="images/ideashare.png" alt="Founder Share Idea" class="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105">' +
                                '</div>' +
                            '</div>' +
                            '<div class="mt-4 flex items-center justify-center gap-3"><div class="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2"><i data-lucide="lightbulb" class="w-4 h-4 text-purple-400"></i><span class="text-purple-300 text-xs font-medium">Post Ideas • Build Teams • Get AI Roadmaps • Find Investors</span></div></div>' +
                        '</div>' +
                        /* Job Seeker Panel — Screenshot */
                        '<div id="dpanel-seeker" class="dashboard-panel p-4 md:p-6" style="display:none">' +
                            '<div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/20 max-w-3xl mx-auto">' +
                                '<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4"><span class="text-white text-sm font-medium">Job Seeker Command Center</span></div>' +
                                '<img src="images/jobseekerdashboard.png" alt="Job Seeker Dashboard" class="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105">' +
                            '</div>' +
                            '<div class="mt-4 flex items-center justify-center gap-3"><div class="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2"><i data-lucide="briefcase" class="w-4 h-4 text-cyan-400"></i><span class="text-cyan-300 text-xs font-medium">Apply to Startups • Track Applications • Showcase Skills</span></div></div>' +
                        '</div>' +
                        /* Investor Panel — Screenshot */
                        '<div id="dpanel-investor" class="dashboard-panel p-4 md:p-6" style="display:none">' +
                            '<div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/20 max-w-3xl mx-auto">' +
                                '<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4"><span class="text-white text-sm font-medium">Investor Command Center</span></div>' +
                                '<img src="images/investordashboard.png" alt="Investor Dashboard" class="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105">' +
                            '</div>' +
                            '<div class="mt-4 flex items-center justify-center gap-3"><div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2"><i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i><span class="text-emerald-300 text-xs font-medium">Browse Deals • Track Portfolio • Deploy Capital</span></div></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>' +

        /* Dream to Reality */
        '<section class="bg-gradient-to-b from-[#1a0b2e] to-[#1E1B4B] py-24 px-6 relative overflow-hidden">' +
            '<div class="absolute top-0 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]"></div><div class="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>' +
            '<div class="max-w-6xl mx-auto relative z-10">' +
                '<div class="text-center mb-16"><h2 class="text-4xl md:text-6xl font-extrabold text-white mb-4 animate-text-spring"><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400">Dream</span> to <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">Reality</span></h2><p class="text-xl md:text-2xl text-gray-400 animate-text-spring delay-100">Want to make your dreams come true?</p></div>' +
                '<div class="grid md:grid-cols-3 gap-8">' +
                    /* Card 1 */
                    '<div class="group relative animate-slide-up"><div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div><div class="relative glass-card rounded-3xl p-8 h-full border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2"><div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform"><i data-lucide="lightbulb" class="text-white w-8 h-8"></i></div><h3 class="text-2xl font-bold text-white mb-3">Share Your Idea</h3><p class="text-gray-400 mb-6 leading-relaxed">Got a groundbreaking startup idea? Share it with the world and find the perfect co-founders & team.</p><div class="flex items-center text-purple-400 font-medium group-hover:text-purple-300"><span>Start as Founder</span><i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i></div></div></div>' +
                    /* Card 2 */
                    '<div class="group relative animate-slide-up delay-100"><div class="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div><div class="relative glass-card rounded-3xl p-8 h-full border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2"><div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform"><i data-lucide="briefcase" class="text-white w-8 h-8"></i></div><h3 class="text-2xl font-bold text-white mb-3">Get Your Dream Job</h3><p class="text-gray-400 mb-6 leading-relaxed">Connect with innovative startups that match your skills and passion.</p><div class="flex items-center text-cyan-400 font-medium group-hover:text-cyan-300"><span>Find Opportunities</span><i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i></div></div></div>' +
                    /* Card 3 */
                    '<div class="group relative animate-slide-up delay-200"><div class="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div><div class="relative glass-card rounded-3xl p-8 h-full border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2"><div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform"><i data-lucide="trending-up" class="text-white w-8 h-8"></i></div><h3 class="text-2xl font-bold text-white mb-3">Find Startups to Invest</h3><p class="text-gray-400 mb-6 leading-relaxed">Discover promising startups and invest in the next big thing.</p><div class="flex items-center text-emerald-400 font-medium group-hover:text-emerald-300"><span>Explore Deals</span><i data-lucide="arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"></i></div></div></div>' +
                '</div>' +
                '<div class="text-center mt-12 animate-slide-up delay-300"><button onclick="navigateTo(\'signup\')" class="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-700 hover:via-violet-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">Get Started Now</button></div>' +
            '</div>' +
        '</section>' +

        /* Vision & Mission */
        '<section id="vision-mission" class="bg-[#1E1B4B] py-32 px-6 relative overflow-hidden">' +
            '<div class="absolute top-1/4 left-10 w-40 h-40 bg-purple-500/25 rounded-3xl blur-3xl animate-float"></div><div class="absolute bottom-1/4 right-10 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl animate-float delay-500"></div><div class="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-purple-600/10 to-transparent rounded-full blur-[120px]"></div>' +
            '<div class="max-w-7xl mx-auto relative z-10">' +
                '<div class="text-center mb-20 scroll-reveal reveal-up">' +
                    '<div class="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-5 py-2 mb-6"><i data-lucide="sparkles" class="w-4 h-4 text-purple-400"></i><span class="text-purple-300 text-sm font-semibold">What Drives Us</span></div>' +
                    '<h2 class="text-4xl md:text-6xl font-black text-white mb-6">Our Vision & <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">Mission</span></h2>' +
                    '<p class="text-slate-400 max-w-xl mx-auto text-lg">Building a future where tech, talent, and capital thrive together.</p>' +
                '</div>' +
                '<div class="grid md:grid-cols-2 gap-12">' +
                    '<div class="scroll-reveal reveal-left vm-card-vision relative group">' +
                        '<div class="absolute -inset-1 bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-transparent rounded-[44px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>' +
                        '<div class="relative glass-card rounded-[40px] p-12 border border-blue-500/15 hover:border-blue-400/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/15 overflow-hidden">' +
                            '<div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/8 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>' +
                            '<div class="relative z-10">' +
                                '<div class="bg-gradient-to-br from-blue-500 to-cyan-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-500"><i data-lucide="eye" class="text-white w-8 h-8"></i></div>' +
                                '<h3 class="text-3xl font-bold text-white mb-6">Our Vision</h3>' +
                                '<p class="text-xl text-slate-300 leading-relaxed font-light">To create a world where <span class="text-blue-400 font-semibold">everyone</span>—whether you have a big idea, specialized skills, or capital—can work together effortlessly.</p>' +
                                '<div class="mt-10 flex items-center gap-3">' +
                                    '<div class="h-1.5 w-14 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full group-hover:w-24 transition-all duration-700 shadow-lg shadow-blue-500/30"></div>' +
                                    '<div class="h-1.5 w-4 bg-slate-700 rounded-full group-hover:bg-blue-500/40 transition-all duration-500"></div>' +
                                    '<div class="h-1.5 w-4 bg-slate-700 rounded-full group-hover:bg-blue-500/20 transition-all duration-500 delay-100"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="scroll-reveal reveal-right vm-card-mission relative group" style="animation-delay:200ms">' +
                        '<div class="absolute -inset-1 bg-gradient-to-br from-purple-500/30 via-pink-400/20 to-transparent rounded-[44px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>' +
                        '<div class="relative glass-card rounded-[40px] p-12 border border-purple-500/15 hover:border-purple-400/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/15 overflow-hidden">' +
                            '<div class="absolute top-0 right-0 w-40 h-40 bg-purple-500/8 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>' +
                            '<div class="relative z-10">' +
                                '<div class="bg-gradient-to-br from-purple-500 to-pink-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-500"><i data-lucide="target" class="text-white w-8 h-8"></i></div>' +
                                '<h3 class="text-3xl font-bold text-white mb-6">Our Mission</h3>' +
                                '<p class="text-xl text-slate-300 leading-relaxed font-light">To <span class="text-purple-400 font-semibold">connect</span> the right people so ideas can grow, workers find dream jobs, and investors find the next big startups.</p>' +
                                '<div class="mt-10 flex items-center gap-3">' +
                                    '<div class="h-1.5 w-4 bg-slate-700 rounded-full group-hover:bg-purple-500/20 transition-all duration-500 delay-100"></div>' +
                                    '<div class="h-1.5 w-14 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full group-hover:w-24 transition-all duration-700 shadow-lg shadow-purple-500/30"></div>' +
                                    '<div class="h-1.5 w-4 bg-slate-700 rounded-full group-hover:bg-purple-500/40 transition-all duration-500"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>' +

        /* How It Works */
        '<section class="relative bg-[#FFEFD5] py-32 px-6 overflow-hidden">' +
            '<div class="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>' +
            '<div class="max-w-7xl mx-auto relative z-10 text-center">' +
                '<h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 animate-slide-up">How Foundera Works</h2>' +
                '<p class="text-gray-600 max-w-2xl mx-auto text-lg mb-20 animate-slide-up delay-100">A seamless ecosystem designed to bring ideas to life.</p>' +
                '<div class="grid md:grid-cols-3 gap-8">' +
                    [{ id: 1, title: 'Create Profile', desc: 'Sign up and tell us your goals.', icon: 'user-circle', color: 'blue' },
                     { id: 2, title: 'Discover & Match', desc: 'Our algorithm connects you with the right partners.', icon: 'search', color: 'emerald' },
                     { id: 3, title: 'Build & Grow', desc: 'Form your team, secure funding, and scale.', icon: 'globe', color: 'purple' }
                    ].map(function (s) {
                        return '<div class="relative bg-white/70 backdrop-blur-2xl p-10 rounded-3xl border border-white shadow-xl group hover:-translate-y-2 transition-all"><div class="absolute -right-6 -top-10 text-[180px] font-black text-gray-200/50 z-0 pointer-events-none">' + s.id + '</div><div class="relative z-10 text-left"><div class="w-16 h-16 bg-' + s.color + '-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"><i data-lucide="' + s.icon + '"></i></div><h3 class="text-2xl font-bold mb-4 text-gray-900">' + s.title + '</h3><p class="text-gray-600 text-sm">' + s.desc + '</p></div></div>';
                    }).join('') +
                '</div>' +
            '</div>' +
        '</section>' +

        /* Synergy */
        '<section class="bg-white py-24 px-6 border-t border-gray-100">' +
            '<div class="max-w-7xl mx-auto text-center">' +
                '<h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-16">When the Right People Meet</h2>' +
                '<div class="relative bg-gray-50 rounded-3xl p-8 md:p-16 border border-gray-100">' +
                    '<div class="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-300 via-green-300 to-purple-300 transform -translate-y-1/2 opacity-40"></div>' +
                    '<div class="grid md:grid-cols-3 gap-8 items-center relative z-10">' +
                        '<div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 hover:-translate-y-2 transition-all"><div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><i data-lucide="lightbulb" class="text-blue-600"></i></div><div><h4 class="font-bold">The Visionary</h4><p class="text-xs text-gray-500">Founder</p></div></div><p class="text-sm text-gray-600">"I have a game-changing idea, but I need a technical partner."</p></div>' +
                        '<div class="bg-gray-900 text-white p-8 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-all"><i data-lucide="star" class="text-yellow-400 w-8 h-8 mb-2"></i><h3 class="text-xl font-bold">Your Startup</h3><p class="text-gray-400 text-[10px] mt-2 uppercase">Brought To Life</p></div>' +
                        '<div class="space-y-6"><div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500 text-left"><h4 class="font-bold">The Builder</h4><p class="text-sm text-gray-600">"I have the skills to build impactful products."</p></div><div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500 text-left"><h4 class="font-bold">The Backer</h4><p class="text-sm text-gray-600">"I\'m looking to invest in early-stage startups."</p></div></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>' +
    '</div>';
}

/* --- AUTH VIEW --- */
function AuthView(type) {
    var isLogin = type === 'login';
    return '<div class="min-h-screen flex flex-col lg:flex-row">' +
        /* Left branding panel — visible on all screens */
        '<div class="w-full lg:w-1/2 bg-gradient-to-br from-[#1a0b2e] via-[#1E1B4B] to-[#1a0b2e] relative overflow-hidden">' +
            '<div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>' +
            '<div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]"></div>' +
            '<div class="relative z-10 flex flex-col justify-center px-8 md:px-12 py-12 lg:py-0 lg:min-h-screen max-w-xl mx-auto">' +
                '<div class="mb-6 flex items-center gap-2"><img src="images/founderaLogo.jpeg" alt="Foundera" class="w-9 h-9 rounded-lg object-cover"><span class="text-2xl logo-gradient tracking-tight">Foundera</span></div>' +
                '<h1 class="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">One Platform.<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Three Goals.</span></h1>' +
                '<div class="space-y-4 mb-8">' +
                    '<div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="lightbulb" class="w-6 h-6 text-white"></i></div><div><h3 class="text-white font-semibold">For Founders</h3><p class="text-gray-400 text-sm">Share your idea & build your dream team</p></div></div>' +
                    '<div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="briefcase" class="w-6 h-6 text-white"></i></div><div><h3 class="text-white font-semibold">For Job Seekers</h3><p class="text-gray-400 text-sm">Find your dream job at exciting startups</p></div></div>' +
                    '<div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="trending-up" class="w-6 h-6 text-white"></i></div><div><h3 class="text-white font-semibold">For Investors</h3><p class="text-gray-400 text-sm">Discover & invest in the next big thing</p></div></div>' +
                '</div>' +
                '<div class="flex flex-wrap gap-3">' +
                    '<span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"><i data-lucide="lightbulb" class="w-4 h-4 text-purple-400"></i> Share Ideas</span>' +
                    '<span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"><i data-lucide="users" class="w-4 h-4 text-cyan-400"></i> Find Talent</span>' +
                    '<span class="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"><i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i> Get Funded</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        /* Right form panel */
        '<div class="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">' +
            '<div class="w-full max-w-md">' +
                '<div class="text-center mb-8">' +
                    '<h2 class="text-3xl font-bold text-gray-900 mb-2">' + (isLogin ? 'Welcome Back' : 'Create Your Account') + '</h2>' +
                    '<p class="text-gray-500 text-sm">' + (isLogin ? 'Sign in to access your dashboard' : 'Join thousands building the future') + '</p>' +
                '</div>' +
                '<form onsubmit="handleAuth(event, \'' + type + '\')" class="space-y-5">' +
                    (!isLogin ? '<div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label><input name="firstName" required placeholder="John" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"></div><div><label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label><input name="lastName" required placeholder="Doe" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"></div></div>' : '') +
                    '<div><label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label><div class="relative"><input name="email" required type="email" placeholder="yourname@gmail.com" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all pr-10" oninput="validateEmailField(this,' + !isLogin + ')" /><span id="email-check-icon" class="absolute right-3 top-1/2 -translate-y-1/2"></span></div>' + (!isLogin ? '<p id="email-hint" class="text-xs text-gray-400 mt-1.5">Only @gmail.com emails are accepted</p>' : '') + '</div>' +
                    '<div><label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label><div class="relative"><input name="password" required type="password" placeholder="••••••••" minlength="6" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all pr-10" ' + (!isLogin ? 'oninput="updatePasswordStrength(this.value)"' : '') + ' /><button type="button" onclick="togglePasswordVisibility(this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' + (!isLogin ? '<div id="password-strength" class="mt-2 hidden"><div class="flex items-center gap-2"><div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div id="strength-bar" class="h-full rounded-full" style="width:0%"></div></div><span id="strength-text" class="text-xs font-medium min-w-[70px] text-right"></span></div></div>' : '<div class="text-right mt-2"><button type="button" onclick="showForgotPasswordModal()" class="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">Forgot password?</button></div>') + '</div>' +
                    (!isLogin ? '<div><label class="block text-sm font-medium text-gray-700 mb-2">I want to</label><div class="grid grid-cols-3 gap-2" id="role-cards"><div onclick="selectRoleCard(this,\'Founder\')" class="role-card cursor-pointer border-2 border-purple-500 bg-purple-50 rounded-xl p-3 text-center transition-all hover:shadow-md"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-500 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg><span class="text-xs font-semibold text-gray-700 block">Founder</span></div><div onclick="selectRoleCard(this,\'Job Seeker\')" class="role-card cursor-pointer border-2 border-gray-200 rounded-xl p-3 text-center transition-all hover:shadow-md hover:border-cyan-300"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cyan-500 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span class="text-xs font-semibold text-gray-700 block">Job Seeker</span></div><div onclick="selectRoleCard(this,\'Investor\')" class="role-card cursor-pointer border-2 border-gray-200 rounded-xl p-3 text-center transition-all hover:shadow-md hover:border-emerald-300"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-500 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg><span class="text-xs font-semibold text-gray-700 block">Investor</span></div></div><input type="hidden" name="role" id="selected-role-input" value="Founder" /></div><p class="text-xs text-gray-500">By signing up you agree to our <a href="#" class="text-purple-600 hover:underline">Terms</a> and <a href="#" class="text-purple-600 hover:underline">Privacy Policy</a>.</p>' : '') +
                    '<button type="submit" class="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/20 text-base">' + (isLogin ? 'Sign In' : 'Create Account') + '</button>' +
                '</form>' +
                '<div class="mt-6 text-center text-sm text-gray-500">' + (isLogin ? "Don't have an account? " : "Already have an account? ") + '<button onclick="navigateTo(\'' + (isLogin ? 'signup' : 'login') + '\')" class="text-purple-600 font-semibold hover:underline">' + (isLogin ? 'Sign up' : 'Log in') + '</button></div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

/* --- ROLE CARD SELECTOR --- */
function selectRoleCard(el, role) {
    document.getElementById('selected-role-input').value = role;
    var cards = document.querySelectorAll('.role-card');
    var colors = { 'Founder': 'border-purple-500 bg-purple-50', 'Job Seeker': 'border-cyan-500 bg-cyan-50', 'Investor': 'border-emerald-500 bg-emerald-50' };
    cards.forEach(function(c) { c.className = 'role-card cursor-pointer border-2 border-gray-200 rounded-xl p-3 text-center transition-all hover:shadow-md'; });
    el.className = 'role-card cursor-pointer border-2 ' + colors[role] + ' rounded-xl p-3 text-center transition-all hover:shadow-md';
}

function FounderDashboard() {
    var tab = state.founderTab;
    return '<div class="max-w-7xl mx-auto px-4 py-8"><div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"><div><h1 class="text-3xl font-bold">Welcome, Founder ' + state.currentUser.name + '!</h1></div><button onclick="setFounderTab(\'post\')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 transition-all"><i data-lucide="plus-circle" class="mr-2"></i> Post Idea</button></div>' +
        '<div class="flex border-b border-gray-200 mb-6 space-x-6"><button onclick="setFounderTab(\'ideas\')" class="pb-3 text-sm font-medium ' + (tab === 'ideas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500') + '">My Ideas</button><button onclick="setFounderTab(\'talent\')" class="pb-3 text-sm font-medium ' + (tab === 'talent' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500') + '">Find Talent</button><button onclick="setFounderTab(\'investors\')" class="pb-3 text-sm font-medium ' + (tab === 'investors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500') + '">Investors</button></div>' +
        (tab === 'ideas' ? '<div class="grid md:grid-cols-2 gap-6">' + state.ideas.map(function (i) { return '<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"><h3 class="text-xl font-bold mb-2">' + i.title + '</h3><p class="text-gray-600 text-sm mb-4 line-clamp-2">' + i.description + '</p><div class="flex justify-between items-center mt-6 pt-4 border-t"><span class="text-green-600 font-medium">Funding: ' + i.fundingNeeded + '</span><button class="text-blue-600 text-sm font-bold">Edit</button></div></div>'; }).join('') + '</div>'
        : tab === 'talent' ? '<div class="grid md:grid-cols-3 gap-6">' + mockSeekers.map(function (s) { return '<div class="bg-white p-5 rounded-xl border border-gray-200 text-center hover:shadow-md transition-all"><i data-lucide="user-circle" class="w-12 h-12 text-green-600 mx-auto mb-3"></i><h3 class="font-bold">' + s.name + '</h3><p class="text-sm text-gray-500 mb-3">' + s.role + '</p><div class="flex flex-wrap justify-center gap-1 mb-4">' + s.skills.map(function (sk) { return '<span class="bg-gray-100 text-[10px] px-2 py-1 rounded">' + sk + '</span>'; }).join('') + '</div><button class="w-full bg-gray-900 text-white py-2 rounded-lg text-sm">Message</button></div>'; }).join('') + '</div>'
        : tab === 'investors' ? '<div class="grid md:grid-cols-2 gap-6">' + mockInvestors.map(function (inv) { return '<div class="bg-white p-6 rounded-xl border border-gray-200 flex items-start hover:shadow-md transition-all"><div class="bg-purple-100 p-3 rounded-lg mr-4"><i data-lucide="trending-up" class="text-purple-600"></i></div><div><h3 class="font-bold text-lg">' + inv.name + '</h3><p class="text-sm text-gray-500 mb-2">Ticket: ' + inv.ticketSize + '</p><div class="flex gap-2">' + inv.focus.map(function (f) { return '<span class="text-xs border border-purple-200 text-purple-700 px-2 py-1 rounded-full font-medium">' + f + '</span>'; }).join('') + '</div></div></div>'; }).join('') + '</div>'
        : '<div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto text-left"><h2 class="text-2xl font-bold mb-6">Launch Your Idea</h2><form onsubmit="postNewIdea(event)" class="space-y-4"><div><label class="block text-sm font-medium mb-1">Title</label><input name="title" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"></div><div><label class="block text-sm font-medium mb-1">Description</label><textarea name="description" required rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"></textarea></div><div><label class="block text-sm font-medium mb-1">Skills (comma separated)</label><input name="skills" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="React, UI/UX"></div><div><label class="block text-sm font-medium mb-1">Funding Target</label><input name="funding" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="$10,000"></div><button type="submit" class="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-all">Publish Idea</button></form></div>'
        ) +
    '</div>';
}

function JobSeekerDashboard() {
    return '<div class="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8"><div class="w-full md:w-1/3"><div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24 text-center"><div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-blue-600 shadow-inner">' + state.currentUser.name[0] + '</div><h2 class="text-xl font-bold">' + state.currentUser.name + '</h2><p class="text-gray-500 text-sm mb-4">Software Engineer</p><div class="w-full border-t border-gray-100 pt-4 mt-2 space-y-2"><div class="flex justify-between text-sm"><span>Skills:</span><span class="font-medium">React, JS</span></div><div class="flex justify-between text-sm"><span>Status:</span><span class="font-medium text-green-600 bg-green-50 px-2 rounded">Active</span></div><button class="w-full mt-4 border border-blue-600 text-blue-600 py-2 rounded-lg font-medium transition-colors hover:bg-blue-50">Update CV</button></div></div></div><div class="w-full md:w-2/3"><h2 class="text-2xl font-bold mb-6">Recommended Startups</h2><div class="space-y-6">' + state.ideas.map(function (i) { return '<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"><h3 class="text-xl font-bold text-blue-700 mb-2">' + i.title + '</h3><p class="text-xs text-gray-500 mb-4 flex items-center"><i data-lucide="user" class="w-3 h-3 mr-1"></i> Founder: ' + i.founder + '</p><p class="text-gray-700 mb-4">' + i.description + '</p><div class="flex flex-wrap gap-2 mb-6">' + i.skillsNeeded.map(function (s) { return '<span class="bg-gray-50 border text-xs px-2 py-1 rounded">' + s + '</span>'; }).join('') + '</div><button class="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">Apply Now</button></div>'; }).join('') + '</div></div></div>';
}

function InvestorDashboard() {
    return '<div class="max-w-7xl mx-auto px-4 py-8"><h1 class="text-3xl font-bold mb-8">Investment Opportunities</h1><div class="grid md:grid-cols-3 gap-6">' + state.ideas.map(function (i) { return '<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col transition-shadow hover:shadow-md"><div class="flex justify-between items-start mb-4"><span class="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest">' + i.industry + '</span><i data-lucide="star" class="w-5 h-5 text-gray-300"></i></div><h3 class="text-xl font-bold mb-2">' + i.title + '</h3><p class="text-xs text-gray-500 mb-4">By ' + i.founder + '</p><p class="text-gray-600 text-sm mb-6 flex-1 line-clamp-2">' + i.description + '</p><div class="border-t pt-4 mt-auto space-y-4"><div class="flex justify-between items-center"><span class="text-xs text-gray-400 font-bold uppercase">Ask</span><span class="font-bold text-green-600 text-lg">' + i.fundingNeeded + '</span></div><div class="grid grid-cols-2 gap-2"><button class="bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors">Pitch Deck</button><button class="border border-gray-300 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">Contact</button></div></div></div>'; }).join('') + '</div></div>';
}

/* --- FOOTER --- */
function Footer() {
    return '<footer class="bg-gray-900 text-gray-400 py-12 px-6 mt-auto">' +
        '<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-800 pb-8 mb-8">' +
            '<div class="col-span-1 md:col-span-2"><div class="flex items-center mb-4 gap-2"><img src="images/founderaLogo.jpeg" alt="Foundera" class="w-9 h-9 rounded-lg object-cover"><span class="text-2xl logo-gradient tracking-tight">Foundera</span></div><p class="text-sm max-w-sm leading-relaxed">Empowering the next generation of innovators by connecting founders, talent, and capital in one unified ecosystem.</p></div>' +
            '<div><h4 class="text-white font-semibold mb-4">Platform</h4><ul class="space-y-2 text-sm"><li><a href="index.html#signup" class="hover:text-white transition-colors">Founders</a></li><li><a href="index.html#signup" class="hover:text-white transition-colors">Job Seekers</a></li><li><a href="index.html#signup" class="hover:text-white transition-colors">Investors</a></li></ul></div>' +
            '<div><h4 class="text-white font-semibold mb-4">Company</h4><ul class="space-y-2 text-sm"><li><a href="about-us.html" class="hover:text-white transition-colors">About</a></li><li><a href="join-foundera.html" class="hover:text-white transition-colors">Careers</a></li><li>Privacy</li><li>Terms</li></ul></div>' +
        '</div>' +
        '<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm"><p>&copy; 2026 Foundera Inc. All rights reserved.</p><div class="flex items-center mt-4 md:mt-0 space-x-2"><i data-lucide="shield" class="w-4 h-4"></i><span>Secure & Trusted Platform</span></div></div>' +
    '</footer>';
}

/* --- RENDERER --- */
function render() {
    var app = document.getElementById('app-root');
    var nav = document.getElementById('navbar-root');
    var footer = document.getElementById('footer-root');

    // Hide nav/footer on verification screen for clean UX
    if (state.currentScreen === 'verify') {
        nav.innerHTML = '';
        footer.innerHTML = '';
        return;
    }

    nav.innerHTML = Navbar();
    footer.innerHTML = Footer();

    if (state.currentScreen === 'home') app.innerHTML = HomeView();
    else if (state.currentScreen === 'login') app.innerHTML = AuthView('login');
    else if (state.currentScreen === 'signup') app.innerHTML = AuthView('signup');
    else if (state.currentScreen === 'dashboard') {
        if (!state.currentUser) { navigateTo('home'); return; }
        var role = state.currentUser.role;
        if (role === 'Founder') app.innerHTML = FounderDashboard();
        else if (role === 'Job Seeker') app.innerHTML = JobSeekerDashboard();
        else if (role === 'Investor') app.innerHTML = InvestorDashboard();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();

    initScrollReveal();
    initNavScroll();
}

function initNavScroll() {
    var nav = document.getElementById('main-nav');
    if (!nav) return;
    var scrolled = false;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50 && !scrolled) {
            nav.classList.add('nav-scrolled');
            scrolled = true;
        } else if (window.scrollY <= 50 && scrolled) {
            nav.classList.remove('nav-scrolled');
            scrolled = false;
        }
    });
}

function initScrollReveal() {
    var reveals = document.querySelectorAll('.scroll-reveal');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var delay = entry.target.style.animationDelay || '0ms';
                entry.target.style.animationDelay = delay;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
}

window.onload = function () {
    // Check URL hash for direct navigation (e.g. index.html#login)
    var hash = window.location.hash.replace('#', '');
    if (hash === 'login' || hash === 'signup') {
        state.currentScreen = hash;
    }
    render();
    setTimeout(initGoogleSignIn, 500);

    // Listen for auth state changes 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Check if user is stuck in pending state without verified DB flag
            var pendingData = localStorage.getItem('pendingSignup');
            if (pendingData && state.currentScreen !== 'verify') {
                try {
                    var pd = JSON.parse(pendingData);
                    if (pd.email === user.email) {
                        lookupUserRole(user.email).then(function(res) {
                            if (!res || !res.user.emailVerified) {
                                showVerificationScreen(user, pd.name, pd.email, pd.role);
                            } else {
                                localStorage.removeItem('pendingSignup');
                            }
                        });
                    }
                } catch(e) {}
            }
        }
    });

    // Listen for hash changes
    window.addEventListener('hashchange', function () {
        var h = window.location.hash.replace('#', '');
        if (h === 'login' || h === 'signup') {
            state.currentScreen = h;
            render();
        }
    });
};