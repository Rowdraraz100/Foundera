// ==========================================
// COMMUNITY FEED — Shared across all dashboards
// ==========================================
(function() {
    'use strict';

    // --- COMMUNITY STATE ---
    window._communityPosts = [];
    window._communityListener = null;
    window._communityFilter = 'all';
    window._communityLoaded = false;
    window._communityAnimated = false;

    // --- LOAD CACHED POSTS FROM LOCALSTORAGE FOR INSTANT DISPLAY ---
    try {
        var cachedPosts = localStorage.getItem('foundera_community_cache');
        if (cachedPosts) {
            window._communityPosts = JSON.parse(cachedPosts);
            if (window._communityPosts.length > 0) window._communityLoaded = true;
        }
    } catch(e) { window._communityPosts = []; }

    // --- IMAGE COMPRESSION UTILITY (shared) ---
    window.compressImageFile = function(file, maxWidth, maxHeight, quality) {
        return new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onload = function(readerEvent) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var w = img.width;
                    var h = img.height;
                    if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                    if (h > maxHeight) { w = Math.round(w * maxHeight / h); h = maxHeight; }
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality || 0.7));
                };
                img.src = readerEvent.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // --- GET USER'S COMMUNITY POSTS ---
    window.getUserCommunityPosts = function(userKey) {
        if (!window._communityPosts || !userKey) return [];
        return window._communityPosts.filter(function(p) { return p.authorKey === userKey; });
    };

    // --- RENDER USER'S POSTS FOR PROFILE VIEW ---
    window.renderUserCommunityPosts = function(userKey, userName) {
        var posts = window.getUserCommunityPosts(userKey);
        if (posts.length === 0) {
            return '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">' +
                '<h2 class="text-xl font-bold text-white mb-4 flex items-center"><i data-lucide="message-circle" class="w-5 h-5 mr-2 text-indigo-400"></i>Community Posts</h2>' +
                '<div class="text-center py-8">' +
                    '<div class="w-16 h-16 mx-auto mb-4 bg-gray-700/30 rounded-full flex items-center justify-center"><i data-lucide="message-circle" class="w-8 h-8 text-gray-600"></i></div>' +
                    '<p class="text-gray-500 text-sm">No community posts yet.</p>' +
                '</div>' +
            '</div>';
        }
        var postsHtml = posts.map(function(post) {
            var cat = CATEGORIES[post.category] || CATEGORIES.general;
            var cm = COLOR_MAP[cat.color] || COLOR_MAP.gray;
            var timeAgo = _timeAgo(post.timestamp);
            var reactions = post.reactions || {};
            var totalReactions = 0;
            Object.values(reactions).forEach(function() { totalReactions++; });
            var comments = post.comments ? Object.keys(post.comments).length : 0;
            return '<div class="bg-gray-900/40 rounded-xl border border-gray-700/40 p-4 community-animate-slide-up hover:border-indigo-500/20 transition-all">' +
                '<div class="flex items-center justify-between mb-3">' +
                    '<span class="text-xs px-2 py-0.5 rounded-full font-semibold ' + cm.bg + ' ' + cm.text + ' border ' + cm.border + '">' + cat.emoji + ' ' + cat.label + '</span>' +
                    '<span class="text-xs text-gray-500">' + timeAgo + '</span>' +
                '</div>' +
                '<p class="text-gray-200 text-sm leading-relaxed whitespace-pre-line mb-3">' + _escHtml(post.content) + '</p>' +
                (post.imageBase64 ? '<div class="mb-3 rounded-lg overflow-hidden border border-gray-700/50 bg-gray-900/50"><img src="' + post.imageBase64 + '" class="w-full max-h-96 object-contain"></div>' : '') +
                '<div class="flex items-center gap-4 text-xs text-gray-500">' +
                    (totalReactions > 0 ? '<span class="flex items-center gap-1">\u{1F44D} ' + totalReactions + ' reactions</span>' : '') +
                    (comments > 0 ? '<span class="flex items-center gap-1">\u{1F4AC} ' + comments + ' comments</span>' : '') +
                '</div>' +
            '</div>';
        }).join('');
        return '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 sm:p-8 shadow-lg">' +
            '<h2 class="text-xl font-bold text-white mb-6 flex items-center"><i data-lucide="message-circle" class="w-5 h-5 mr-2 text-indigo-400"></i>Community Posts <span class="ml-2 text-sm font-normal text-gray-400">(' + posts.length + ')</span></h2>' +
            '<div class="space-y-4">' + postsHtml + '</div>' +
        '</div>';
    };

    // Category config
    var CATEGORIES = {
        growth:       { emoji: '\u{1F331}', label: 'Growth',        color: 'green' },
        learning:     { emoji: '\u{1F4DA}', label: 'Learning',      color: 'blue' },
        achievement:  { emoji: '\u{1F3C6}', label: 'Achievement',   color: 'yellow' },
        curiosity:    { emoji: '\u{1F914}', label: 'Curiosity',     color: 'cyan' },
        hiring:       { emoji: '\u{1F4BC}', label: 'Hiring',        color: 'red' },
        skill_sharing:{ emoji: '\u{1F4A1}', label: 'Skill Sharing', color: 'purple' },
        general:      { emoji: '\u{1F4AC}', label: 'Random',        color: 'gray' }
    };

    var COLOR_MAP = {
        green:  { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30' },
        blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
        yellow: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        cyan:   { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   border: 'border-cyan-500/30' },
        red:    { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30' },
        purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
        gray:   { bg: 'bg-gray-500/15',   text: 'text-gray-400',   border: 'border-gray-500/30' }
    };

    // --- UTILITIES ---
    function _escHtml(text) {
        if (!text) return '';
        return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function _timeAgo(timestamp) {
        if (!timestamp) return '';
        var diff = Date.now() - timestamp;
        var mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        var hours = Math.floor(mins / 60);
        if (hours < 24) return hours + 'h ago';
        var days = Math.floor(hours / 24);
        if (days < 7) return days + 'd ago';
        var weeks = Math.floor(days / 7);
        if (weeks < 4) return weeks + 'w ago';
        return new Date(timestamp).toLocaleDateString();
    }

    // Get current user info from whatever dashboard context
    function _getUser() {
        // Try jobseeker
        if (typeof profileData !== 'undefined' && profileData.email) {
            var role = 'Job Seeker';
            if (window.location.pathname.indexOf('founder') !== -1) role = 'Founder';
            if (window.location.pathname.indexOf('investor') !== -1) role = 'Investor';
            return {
                email: profileData.email,
                key: profileData.email.replace(/[.#$\[\]]/g, '_'),
                name: profileData.name || 'Anonymous',
                title: profileData.title || role,
                pic: profileData.profilePic || profileData.picture || '',
                role: role
            };
        }
        return { email: '', key: '', name: 'Anonymous', title: '', pic: '', role: 'User' };
    }

    // Role badge colors
    function _roleBadge(role) {
        if (role === 'Founder') return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Founder</span>';
        if (role === 'Investor') return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Investor</span>';
        return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">Job Seeker</span>';
    }

    // --- FIREBASE REAL-TIME LISTENER ---
    window.fetchCommunityPosts = function() {
        if (typeof firebase === 'undefined' || !firebase.database) return;
        var ref = firebase.database().ref('community_posts');
        if (window._communityListener) ref.off('value', window._communityListener);
        window._communityListener = ref.orderByChild('timestamp').on('value', function(snap) {
            window._communityPosts = [];
            var data = snap.val();
            if (data) {
                Object.keys(data).forEach(function(key) {
                    var post = data[key];
                    post._key = key;
                    window._communityPosts.push(post);
                });
                window._communityPosts.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
            }
            window._communityLoaded = true;
            // Cache top 30 posts to localStorage for instant load next time
            try {
                var toCache = window._communityPosts.slice(0, 30).map(function(p) {
                    var c = {};
                    for (var k in p) { if (k !== 'imageBase64' && k !== 'pdfBase64') c[k] = p[k]; }
                    return c;
                });
                localStorage.setItem('foundera_community_cache', JSON.stringify(toCache));
            } catch(e) { /* storage full — ignore */ }
            // Update notifications & badge on every data change
            window.buildNotifications();
            updateNotifBadge();
            if (typeof currentTab !== 'undefined' && currentTab === 'community') {
                // Direct DOM update without opacity fade to prevent layout shift/jump
                var contentEl = document.getElementById('content');
                if (contentEl) {
                    window._communityAnimated = true;
                    contentEl.innerHTML = window.renderCommunity();
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        });
    };

    // --- CREATE POST ---
    window.createCommunityPost = function(event) {
        event.preventDefault();
        if (typeof firebase === 'undefined' || !firebase.database) { alert('Firebase not available'); return; }
        var contentEl = document.getElementById('community-post-content');
        var categoryEl = document.getElementById('community-post-category');
        var content = contentEl.value.trim();
        var category = categoryEl.value;
        if (!content) return;

        var user = _getUser();
        var postData = {
            authorEmail: user.email,
            authorKey: user.key,
            authorName: user.name,
            authorTitle: user.title,
            authorPic: user.pic,
            authorRole: user.role,
            content: content,
            category: category,
            timestamp: Date.now(),
            reactions: {},
            comments: {}
        };

        // Handle image upload
        var imgInput = document.getElementById('community-img-input');
        var pdfInput = document.getElementById('community-pdf-input');

        var imgPromise = Promise.resolve(null);
        var pdfPromise = Promise.resolve(null);

        if (imgInput && imgInput.files && imgInput.files[0]) {
            var imgFile = imgInput.files[0];
            imgPromise = window.compressImageFile(imgFile, 1200, 1200, 0.75);
        }
        if (pdfInput && pdfInput.files && pdfInput.files[0]) {
            var pdfFile = pdfInput.files[0];
            if (pdfFile.size > 5000000) { alert('PDF must be under 5MB.'); return; }
            pdfPromise = new Promise(function(resolve) {
                var reader = new FileReader();
                reader.onload = function(e) { resolve({ data: e.target.result, name: pdfFile.name }); };
                reader.readAsDataURL(pdfFile);
            });
        }

        // Disable button
        var btn = event.target.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Posting...'; }

        Promise.all([imgPromise, pdfPromise]).then(function(results) {
            if (results[0]) postData.imageBase64 = results[0];
            if (results[1]) { postData.pdfBase64 = results[1].data; postData.pdfFileName = results[1].name; }
            return firebase.database().ref('community_posts').push(postData);
        }).then(function() {
            contentEl.value = '';
            if (imgInput) imgInput.value = '';
            if (pdfInput) pdfInput.value = '';
            // Reset previews
            var imgPrev = document.getElementById('community-img-preview');
            var pdfPrev = document.getElementById('community-pdf-preview');
            if (imgPrev) imgPrev.classList.add('hidden');
            if (pdfPrev) pdfPrev.classList.add('hidden');
        }).catch(function(e) {
            console.error('Error creating community post:', e);
            alert('Failed to create post.');
        }).finally(function() {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Post'; }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    };

    // --- REACTIONS ---
    window.toggleCommunityReaction = function(postKey, reactionType) {
        if (typeof firebase === 'undefined' || !firebase.database) return;
        var user = _getUser();
        var ref = firebase.database().ref('community_posts/' + postKey + '/reactions/' + user.key);
        ref.once('value').then(function(snap) {
            if (snap.val() === reactionType) { ref.remove(); } else { ref.set(reactionType); }
        });
    };

    // --- COMMENTS ---
    window.addCommunityComment = function(event, postKey) {
        event.preventDefault();
        if (typeof firebase === 'undefined' || !firebase.database) return;
        var input = event.target.querySelector('input[name="comment"]');
        var text = input.value.trim();
        if (!text) return;
        var user = _getUser();
        var commentData = {
            authorEmail: user.email,
            authorKey: user.key,
            authorName: user.name,
            authorPic: user.pic,
            authorRole: user.role,
            text: text,
            timestamp: Date.now()
        };
        firebase.database().ref('community_posts/' + postKey + '/comments').push(commentData)
            .then(function() { input.value = ''; })
            .catch(function(e) { console.error('Error adding comment:', e); });
    };

    // --- DELETE POST ---
    window.deleteCommunityPost = function(postKey) {
        if (!confirm('Delete this post?')) return;
        firebase.database().ref('community_posts/' + postKey).remove();
    };

    // --- TOGGLE COMMENTS VISIBILITY ---
    window.toggleCommunityComments = function(postKey) {
        var el = document.getElementById('comments-' + postKey);
        if (el) el.classList.toggle('hidden');
    };

    // --- FILTER ---
    window.setCommunityFilter = function(filter) {
        window._communityFilter = filter;
        // Direct DOM update without opacity fade to prevent flicker
        var contentEl = document.getElementById('content');
        if (contentEl) {
            contentEl.innerHTML = window.renderCommunity();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    // --- FILE PREVIEW HANDLERS ---
    window.previewCommunityImage = function(input) {
        var preview = document.getElementById('community-img-preview');
        var previewImg = document.getElementById('community-img-preview-img');
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
    };
    window.removeCommunityImagePreview = function() {
        var input = document.getElementById('community-img-input');
        var preview = document.getElementById('community-img-preview');
        if (input) input.value = '';
        if (preview) preview.classList.add('hidden');
    };
    window.previewCommunityPdf = function(input) {
        var preview = document.getElementById('community-pdf-preview');
        var nameEl = document.getElementById('community-pdf-name');
        if (input.files && input.files[0]) {
            nameEl.textContent = input.files[0].name;
            preview.classList.remove('hidden');
        }
    };
    window.removeCommunityPdfPreview = function() {
        var input = document.getElementById('community-pdf-input');
        var preview = document.getElementById('community-pdf-preview');
        if (input) input.value = '';
        if (preview) preview.classList.add('hidden');
    };

    // --- RENDER COMMUNITY ---
    window.renderCommunity = function() {
        var user = _getUser();
        var myKey = user.key;
        var filter = window._communityFilter || 'all';

        // Filter posts
        var posts = window._communityPosts;
        if (filter !== 'all') {
            posts = posts.filter(function(p) { return p.category === filter; });
        }

        // Build filter tabs
        var filterHtml = '<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">' +
            '<button onclick="setCommunityFilter(\'all\')" class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ' + (filter === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 border border-gray-700/50') + '">All Posts</button>';
        Object.keys(CATEGORIES).forEach(function(key) {
            var cat = CATEGORIES[key];
            filterHtml += '<button onclick="setCommunityFilter(\'' + key + '\')" class="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ' +
                (filter === key ? COLOR_MAP[cat.color].bg + ' ' + COLOR_MAP[cat.color].text + ' border ' + COLOR_MAP[cat.color].border + ' shadow-lg' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 border border-gray-700/50') +
                '">' + cat.emoji + ' ' + cat.label + '</button>';
        });
        filterHtml += '</div>';

        // Build posts HTML
        var postsHtml = '';
        if (!window._communityLoaded && posts.length === 0) {
            // Show loading skeleton while Firebase is fetching
            postsHtml = '<div class="space-y-4">';
            for (var sk = 0; sk < 3; sk++) {
                postsHtml += '<div class="community-post-card animate-pulse"><div class="p-5 sm:p-6">' +
                    '<div class="flex items-center gap-3 mb-4"><div class="w-11 h-11 bg-gray-700/60 rounded-full"></div><div class="flex-1"><div class="h-3.5 bg-gray-700/60 rounded w-32 mb-2"></div><div class="h-2.5 bg-gray-700/40 rounded w-20"></div></div></div>' +
                    '<div class="space-y-2 mb-4"><div class="h-3 bg-gray-700/40 rounded w-full"></div><div class="h-3 bg-gray-700/40 rounded w-4/5"></div><div class="h-3 bg-gray-700/40 rounded w-3/5"></div></div>' +
                    '<div class="flex gap-2"><div class="h-7 bg-gray-700/30 rounded-lg w-16"></div><div class="h-7 bg-gray-700/30 rounded-lg w-20"></div><div class="h-7 bg-gray-700/30 rounded-lg w-18"></div></div>' +
                '</div></div>';
            }
            postsHtml += '</div>';
        } else if (posts.length === 0) {
            postsHtml = '<div class="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/30 community-post-enter" style="animation-delay:0.1s">' +
                '<div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center"><i data-lucide="message-circle" class="w-10 h-10 text-indigo-400"></i></div>' +
                '<h3 class="text-xl font-bold text-white mb-2">No Posts Yet</h3>' +
                '<p class="text-gray-500 text-sm max-w-md mx-auto">Be the first to share something with the Foundera community! Your thoughts, achievements, and questions are welcome here.</p>' +
            '</div>';
        } else {
            postsHtml = posts.map(function(post, idx) {
                var timeAgo = _timeAgo(post.timestamp);
                var cat = CATEGORIES[post.category] || CATEGORIES.general;
                var cm = COLOR_MAP[cat.color] || COLOR_MAP.gray;
                var reactions = post.reactions || {};
                var likeCount = 0, celebrateCount = 0, insightfulCount = 0, supportCount = 0;
                var myReaction = reactions[myKey] || null;
                Object.values(reactions).forEach(function(r) {
                    if (r === 'like') likeCount++;
                    if (r === 'celebrate') celebrateCount++;
                    if (r === 'insightful') insightfulCount++;
                    if (r === 'support') supportCount++;
                });
                var totalReactions = likeCount + celebrateCount + insightfulCount + supportCount;

                var comments = post.comments ? Object.keys(post.comments).map(function(k) { var c = post.comments[k]; c._key = k; return c; }).sort(function(a,b) { return (a.timestamp||0) - (b.timestamp||0); }) : [];
                var isMyPost = post.authorKey === myKey;
                var delay = Math.min(idx * 0.06, 0.6);

                var animCls = window._communityAnimated ? '' : ' community-post-enter community-animate-slide-up';
                var animStyle = window._communityAnimated ? '' : 'animation-delay:' + delay + 's';
                var html = '<div class="community-post-card' + animCls + '" style="' + animStyle + '">' +
                    '<div class="p-4 sm:p-6">' +
                        // Header
                        '<div class="flex items-start justify-between gap-2 mb-4">' +
                            '<div class="flex items-center gap-2 sm:gap-3 min-w-0">' +
                                '<div class="community-author-clickable shrink-0 cursor-pointer" onclick="viewCommunityProfile(\'' + _escHtml(post.authorKey || '') + '\',\'' + _escHtml(post.authorRole || 'Job Seeker') + '\')">' +
                                (post.authorPic ? '<img src="' + post.authorPic + '" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-gray-700/50 shadow-lg" onclick="event.stopPropagation();openAvatarFullView(\'' + post.authorPic.replace(/'/g, "\\'") + '\',\'' + _escHtml(post.authorName || '') + '\')">' : '<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white ring-2 ring-indigo-500/30 shadow-lg">' + (post.authorName ? post.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                                '</div>' +
                                '<div class="min-w-0">' +
                                    '<div class="flex items-center gap-2 flex-wrap">' +
                                        '<h4 class="font-bold text-white text-sm truncate community-author-clickable cursor-pointer hover:underline" onclick="viewCommunityProfile(\'' + _escHtml(post.authorKey || '') + '\',\'' + _escHtml(post.authorRole || 'Job Seeker') + '\')">' + _escHtml(post.authorName || 'Anonymous') + '</h4>' +
                                        _roleBadge(post.authorRole || 'Job Seeker') +
                                    '</div>' +
                                    '<p class="text-xs text-gray-500 mt-0.5 truncate">' + _escHtml(post.authorTitle || '') + ' \u00B7 ' + timeAgo + '</p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="flex items-center gap-1 sm:gap-2 shrink-0">' +
                                '<span class="hidden sm:inline text-xs px-2.5 py-1 rounded-full font-semibold ' + cm.bg + ' ' + cm.text + ' border ' + cm.border + '">' + cat.emoji + ' ' + cat.label + '</span>' +
                                '<span class="sm:hidden text-xs px-1.5 py-0.5 rounded-full ' + cm.bg + ' ' + cm.text + '">' + cat.emoji + '</span>' +
                                (isMyPost ? '<button onclick="deleteCommunityPost(\'' + post._key + '\')" class="text-gray-600 hover:text-red-400 p-1 transition-colors" title="Delete post"><i data-lucide="trash-2" class="w-4 h-4"></i></button>' : '') +
                            '</div>' +
                        '</div>' +
                        // Content
                        '<div class="mb-4">' +
                            '<p class="text-gray-200 text-sm leading-relaxed whitespace-pre-line">' + _escHtml(post.content) + '</p>' +
                        '</div>' +
                        // Image attachment
                        (post.imageBase64 ? '<div class="mb-4 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900/50"><img src="' + post.imageBase64 + '" class="w-full max-h-96 object-contain cursor-pointer hover:opacity-90 transition" onclick="openImageLightbox(this.src)"></div>' : '') +
                        // PDF attachment
                        (post.pdfBase64 ? '<div class="mb-4 flex items-center gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-700/50"><div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0"><i data-lucide="file-text" class="w-5 h-5 text-red-400"></i></div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">' + _escHtml(post.pdfFileName || 'Document.pdf') + '</p><p class="text-xs text-gray-500">PDF Attachment</p></div><a href="' + post.pdfBase64 + '" download="' + _escHtml(post.pdfFileName || 'document.pdf') + '" class="text-indigo-400 hover:text-indigo-300 p-2 transition"><i data-lucide="download" class="w-5 h-5"></i></a></div>' : '') +
                        // Reaction summary — clickable to see who reacted
                        (totalReactions > 0 ? '<div onclick="showReactionViewer(\'' + post._key + '\')" class="flex items-center gap-3 text-xs text-gray-400 mb-3 pb-3 border-b border-gray-700/30 cursor-pointer hover:text-gray-300 transition">' +
                            (likeCount > 0 ? '<span class="flex items-center gap-1">\u{1F44D} ' + likeCount + '</span>' : '') +
                            (celebrateCount > 0 ? '<span class="flex items-center gap-1">\u{1F389} ' + celebrateCount + '</span>' : '') +
                            (insightfulCount > 0 ? '<span class="flex items-center gap-1">\u{1F9E0} ' + insightfulCount + '</span>' : '') +
                            (supportCount > 0 ? '<span class="flex items-center gap-1">\u{2764}\u{FE0F} ' + supportCount + '</span>' : '') +
                            '<span class="ml-auto text-gray-600">' + totalReactions + ' reaction' + (totalReactions > 1 ? 's' : '') + '</span>' +
                        '</div>' : '') +
                        // Reaction buttons & comment toggle
                        '<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-700/30">' +
                            '<div class="flex items-center flex-wrap gap-1">' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'like\')" class="community-reaction-btn ' + (myReaction === 'like' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F44D} Like</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'celebrate\')" class="community-reaction-btn ' + (myReaction === 'celebrate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F389} Celebrate</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'insightful\')" class="community-reaction-btn ' + (myReaction === 'insightful' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F9E0} Insightful</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'support\')" class="community-reaction-btn ' + (myReaction === 'support' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{2764}\u{FE0F} Support</button>' +
                            '</div>' +
                            '<button onclick="toggleCommunityComments(\'' + post._key + '\')" class="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> ' + comments.length + '</button>' +
                        '</div>' +
                        // Comments section with fixed max-height and scrollbar (Hidden by default)
                        '<div id="comments-' + post._key + '" class="hidden">' +
                            (comments.length > 0 ? '<div class="space-y-2.5 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2">' + comments.map(function(c) {
                                return '<div class="flex items-start gap-2.5 community-comment-enter">' +
                                    (c.authorPic ? '<img src="' + c.authorPic + '" class="w-7 h-7 rounded-full object-cover mt-0.5 ring-1 ring-gray-700 cursor-pointer hover:opacity-80 transition" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' : '<div class="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 mt-0.5 shrink-0 cursor-pointer hover:opacity-80 transition" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + (c.authorName ? c.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                                    '<div class="bg-gray-900/50 px-3 py-2 rounded-xl flex-1">' +
                                        '<div class="flex items-center gap-2">' +
                                            '<span class="text-xs font-bold text-white cursor-pointer hover:underline" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + _escHtml(c.authorName || 'Anonymous') + '</span>' +
                                            _roleBadge(c.authorRole || '') +
                                            '<span class="text-[10px] text-gray-600">' + _timeAgo(c.timestamp) + '</span>' +
                                        '</div>' +
                                        '<p class="text-xs text-gray-300 mt-0.5 leading-relaxed">' + _escHtml(c.text) + '</p>' +
                                    '</div></div>';
                            }).join('') + '</div>' : '') +
                            // Comment form
                            '<form onsubmit="addCommunityComment(event, \'' + post._key + '\')" class="flex items-center gap-2">' +
                                (user.pic ? '<img src="' + user.pic + '" class="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-gray-700">' : '<div class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">' + (user.name ? user.name.charAt(0).toUpperCase() : '?') + '</div>') +
                                '<input type="text" name="comment" placeholder="Write a comment..." class="flex-1 px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 placeholder-gray-600 transition">' +
                                '<button type="submit" class="text-indigo-400 hover:text-indigo-300 p-1.5 transition hover:bg-indigo-500/10 rounded-lg"><i data-lucide="send" class="w-4 h-4"></i></button>' +
                            '</form>' +
                        '</div>' +
                    '</div></div>';
                return html;
            }).join('');
        }

        // Category select options
        var catOptions = '';
        Object.keys(CATEGORIES).forEach(function(key) {
            var cat = CATEGORIES[key];
            catOptions += '<option value="' + key + '">' + cat.emoji + ' ' + cat.label + '</option>';
        });

        // Build compose card
        var composeAnimCls = window._communityAnimated ? '' : ' community-post-enter community-animate-slide-up';
        var composeHtml = '<div class="community-compose-card' + composeAnimCls + '"' + (window._communityAnimated ? '' : ' style="animation-delay:0.1s"') + '>' +
            '<div class="p-4 sm:p-6">' +
                '<div class="flex items-start gap-2 sm:gap-4">' +
                    '<div class="shrink-0 hidden sm:block">' +
                        (user.pic ? '<img src="' + user.pic + '" class="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700/50 shadow-lg">' : '<div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-indigo-500/30 shadow-lg">' + (user.name ? user.name.charAt(0).toUpperCase() : '?') + '</div>') +
                    '</div>' +
                    '<form onsubmit="createCommunityPost(event)" class="flex-1 space-y-3">' +
                        '<textarea id="community-post-content" rows="3" required placeholder="Share something with the Foundera community..." class="w-full px-3 sm:px-4 py-3 bg-gray-900/60 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 outline-none text-white text-sm resize-none placeholder-gray-600 transition"></textarea>' +
                        // Image preview
                        '<div id="community-img-preview" class="hidden relative">' +
                            '<img id="community-img-preview-img" class="max-h-48 w-full rounded-xl border border-gray-700/50 object-contain bg-gray-900/50">' +
                            '<button type="button" onclick="removeCommunityImagePreview()" class="absolute top-2 right-2 bg-black/70 hover:bg-red-500/80 text-white p-1 rounded-lg transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
                        '</div>' +
                        // PDF preview
                        '<div id="community-pdf-preview" class="hidden flex items-center gap-2 bg-gray-900/60 p-2 rounded-xl border border-gray-700/50">' +
                            '<i data-lucide="file-text" class="w-5 h-5 text-red-400 shrink-0"></i>' +
                            '<span id="community-pdf-name" class="text-xs text-gray-300 truncate flex-1"></span>' +
                            '<button type="button" onclick="removeCommunityPdfPreview()" class="text-gray-500 hover:text-red-400 p-1 transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
                        '</div>' +
                        '<div class="flex items-center justify-between flex-wrap gap-2 sm:gap-3">' +
                            '<div class="flex items-center gap-1 sm:gap-2">' +
                                '<select id="community-post-category" class="px-2 sm:px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 transition max-w-[120px] sm:max-w-none">' + catOptions + '</select>' +
                                '<label class="cursor-pointer p-2 hover:bg-gray-700/60 rounded-lg transition text-gray-500 hover:text-indigo-400" title="Attach Image">' +
                                    '<i data-lucide="image" class="w-4.5 h-4.5"></i>' +
                                    '<input type="file" id="community-img-input" accept="image/*" onchange="previewCommunityImage(this)" class="hidden">' +
                                '</label>' +
                                '<label class="cursor-pointer p-2 hover:bg-gray-700/60 rounded-lg transition text-gray-500 hover:text-red-400" title="Attach PDF">' +
                                    '<i data-lucide="paperclip" class="w-4.5 h-4.5"></i>' +
                                    '<input type="file" id="community-pdf-input" accept=".pdf,application/pdf" onchange="previewCommunityPdf(this)" class="hidden">' +
                                '</label>' +
                            '</div>' +
                            '<button type="submit" class="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"><i data-lucide="send" class="w-4 h-4"></i> Post</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>' +
        '</div>';

        // Community header with animation
        var headerAnimCls = window._communityAnimated ? '' : ' community-post-enter community-animate-fade-scale';
        var headerHtml = '<div class="community-header-banner' + headerAnimCls + '">' +
            '<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/20 p-4 sm:p-8 mb-2">' +
                '<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>' +
                '<div class="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>' +
                '<div class="community-particle community-particle-1"></div>' +
                '<div class="community-particle community-particle-2"></div>' +
                '<div class="community-particle community-particle-3"></div>' +
                '<div class="relative">' +
                    '<div class="flex items-center gap-3 mb-3">' +
                        '<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25"><i data-lucide="users" class="w-5 h-5 text-white"></i></div>' +
                        '<div>' +
                            '<h2 class="text-lg sm:text-2xl font-bold text-white">Community Feed</h2>' +
                            '<p class="text-xs text-gray-400">Founders \u00B7 Investors \u00B7 Job Seekers \u2014 all in one place</p>' +
                        '</div>' +
                    '</div>' +
                    '<p class="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">Share your growth, learnings, achievements, and connect with the entire Foundera ecosystem.</p>' +
                    '<div class="flex items-center gap-4 mt-4 text-xs text-gray-500">' +
                        '<span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3.5 h-3.5"></i> ' + window._communityPosts.length + ' posts</span>' +
                        '<span class="flex items-center gap-1"><i data-lucide="globe" class="w-3.5 h-3.5"></i> Cross-dashboard</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // Mark animated after first render so subsequent renders skip entrance animations
        if (!window._communityAnimated) {
            setTimeout(function() { window._communityAnimated = true; }, 800);
        }

        return '<div class="max-w-3xl mx-auto space-y-5">' +
            headerHtml +
            composeHtml +
            '<div class="mt-1 mb-2">' + filterHtml + '</div>' +
            postsHtml +
        '</div>';
    };

    // ============================================================
    // NOTIFICATION SYSTEM
    // ============================================================
    window._notifications = [];
    window._notifLastSeen = parseInt(localStorage.getItem('foundera_notif_seen') || '0', 10);
    window._notifPanelOpen = false;
    window._notifListener = null;

    // Generate notifications from community posts where current user is the author and someone reacted/commented
    window.buildNotifications = function() {
        var user = _getUser();
        if (!user.key) return [];
        var notifs = [];
        window._communityPosts.forEach(function(post) {
            if (post.authorKey !== user.key) return;
            // Reactions
            var reactions = post.reactions || {};
            Object.keys(reactions).forEach(function(reactorKey) {
                if (reactorKey === user.key) return;
                var reactionType = reactions[reactorKey];
                var emoji = reactionType === 'like' ? '\u{1F44D}' : reactionType === 'celebrate' ? '\u{1F389}' : reactionType === 'insightful' ? '\u{1F9E0}' : '\u{2764}\u{FE0F}';
                notifs.push({
                    type: 'reaction',
                    emoji: emoji,
                    reactorKey: reactorKey,
                    reactionType: reactionType,
                    postKey: post._key,
                    postContent: (post.content || '').substring(0, 50),
                    timestamp: post.timestamp || 0,
                    // We'll find names from known data
                    actorName: '',
                    actorPic: ''
                });
            });
            // Comments
            var comments = post.comments || {};
            Object.keys(comments).forEach(function(cKey) {
                var c = comments[cKey];
                if (c.authorKey === user.key) return;
                notifs.push({
                    type: 'comment',
                    emoji: '\u{1F4AC}',
                    commenterKey: c.authorKey || '',
                    commentText: (c.text || '').substring(0, 60),
                    postKey: post._key,
                    postContent: (post.content || '').substring(0, 50),
                    timestamp: c.timestamp || post.timestamp || 0,
                    actorName: c.authorName || 'Someone',
                    actorPic: c.authorPic || ''
                });
            });
        });
        // Also scan for reactions on posts — find actor names from all posts' authors
        var knownUsers = {};
        window._communityPosts.forEach(function(p) {
            if (p.authorKey && p.authorName) {
                knownUsers[p.authorKey] = { name: p.authorName, pic: p.authorPic || '' };
            }
            var coms = p.comments || {};
            Object.keys(coms).forEach(function(ck) {
                var c = coms[ck];
                if (c.authorKey && c.authorName) {
                    knownUsers[c.authorKey] = { name: c.authorName, pic: c.authorPic || '' };
                }
            });
        });
        // Fill in actor names for reactions
        notifs.forEach(function(n) {
            if (n.type === 'reaction' && n.reactorKey && knownUsers[n.reactorKey]) {
                n.actorName = knownUsers[n.reactorKey].name;
                n.actorPic = knownUsers[n.reactorKey].pic;
            }
            if (!n.actorName) n.actorName = 'Someone';
        });
        notifs.sort(function(a, b) { return b.timestamp - a.timestamp; });
        window._notifications = notifs;
        return notifs;
    };

    window.getUnreadNotifCount = function() {
        var lastSeen = window._notifLastSeen || 0;
        var count = 0;
        window._notifications.forEach(function(n) {
            if (n.timestamp > lastSeen) count++;
        });
        return count;
    };

    window.markNotifsRead = function() {
        window._notifLastSeen = Date.now();
        localStorage.setItem('foundera_notif_seen', String(window._notifLastSeen));
        updateNotifBadge();
    };

    function updateNotifBadge() {
        var badge = document.getElementById('notif-count-badge');
        var count = window.getUnreadNotifCount();
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    window.toggleNotifPanel = function() {
        var panel = document.getElementById('notif-panel');
        if (panel) {
            panel.remove();
            window._notifPanelOpen = false;
            return;
        }
        window._notifPanelOpen = true;
        window.markNotifsRead();
        var notifs = window._notifications.slice(0, 30);
        var itemsHtml = '';
        if (notifs.length === 0) {
            itemsHtml = '<div class="p-8 text-center"><div class="w-14 h-14 mx-auto mb-3 bg-gray-700/30 rounded-full flex items-center justify-center"><i data-lucide="bell-off" class="w-7 h-7 text-gray-600"></i></div><p class="text-gray-500 text-sm">No notifications yet</p><p class="text-gray-600 text-xs mt-1">Reactions and comments on your posts will show up here</p></div>';
        } else {
            itemsHtml = notifs.map(function(n) {
                var isUnread = n.timestamp > (window._notifLastSeen - 5000);
                var ago = _timeAgo(n.timestamp);
                var avatar = n.actorPic
                    ? '<img src="' + n.actorPic + '" class="w-9 h-9 rounded-full object-cover shrink-0">'
                    : '<div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">' + (n.actorName ? n.actorName.charAt(0).toUpperCase() : '?') + '</div>';
                if (n.type === 'reaction') {
                    return '<div class="notification-item' + (isUnread ? ' unread' : '') + '" onclick="window._goToNotifPost()">' +
                        avatar +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm text-gray-200"><span class="font-semibold text-white">' + _escHtml(n.actorName) + '</span> reacted ' + n.emoji + ' to your post</p>' +
                            '<p class="text-xs text-gray-500 mt-0.5 truncate">"' + _escHtml(n.postContent) + '..."</p>' +
                            '<p class="text-[10px] text-gray-600 mt-1">' + ago + '</p>' +
                        '</div></div>';
                } else {
                    return '<div class="notification-item' + (isUnread ? ' unread' : '') + '" onclick="window._goToNotifPost()">' +
                        avatar +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm text-gray-200"><span class="font-semibold text-white">' + _escHtml(n.actorName) + '</span> commented on your post</p>' +
                            '<p class="text-xs text-gray-400 mt-0.5 truncate">"' + _escHtml(n.commentText) + '"</p>' +
                            '<p class="text-[10px] text-gray-600 mt-1">' + ago + '</p>' +
                        '</div></div>';
                }
            }).join('');
        }
        var panelHtml = '<div id="notif-panel" class="notification-panel">' +
            '<div class="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between sticky top-0 bg-gray-800/95 backdrop-blur-sm rounded-t-xl z-10">' +
                '<h3 class="font-bold text-white text-sm">Notifications</h3>' +
                '<button onclick="toggleNotifPanel()" class="text-gray-500 hover:text-white p-1 transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
            '</div>' +
            itemsHtml +
        '</div>';
        var isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // On mobile, append to body for better positioning
            document.body.insertAdjacentHTML('beforeend', panelHtml);
        } else {
            var container = document.getElementById('notif-bell-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', panelHtml);
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // Close notif panel on outside click
    document.addEventListener('click', function(e) {
        if (window._notifPanelOpen && !e.target.closest('#notif-bell-container') && !e.target.closest('#notif-panel')) {
            var panel = document.getElementById('notif-panel');
            if (panel) panel.remove();
            window._notifPanelOpen = false;
        }
    });

    // Notification updates are now integrated into the main fetchCommunityPosts listener

    // Navigate to community tab when clicking a notification item
    window._goToNotifPost = function() {
        // Close notification panel
        var panel = document.getElementById('notif-panel');
        if (panel) panel.remove();
        window._notifPanelOpen = false;
        // Navigate to community tab
        if (typeof setTab === 'function') {
            setTab('community');
        }
    };

    // ============================================================
    // VIEW PROFILE FROM COMMUNITY POSTS
    // ============================================================
    window.viewCommunityProfile = function(authorKey, authorRole) {
        if (!authorKey) return;
        // Determine which Firebase path to check based on role
        var paths = [];
        if (authorRole === 'Founder') {
            paths = ['users/founders/' + authorKey];
        } else if (authorRole === 'Investor') {
            paths = ['users/investors/' + authorKey];
        } else {
            paths = ['users/jobseekers/' + authorKey];
        }
        // Also check all paths as fallback
        var allPaths = ['users/founders/' + authorKey, 'users/jobseekers/' + authorKey, 'users/investors/' + authorKey];

        var db = firebase.database();
        // Try primary path first
        db.ref(paths[0]).once('value').then(function(snap) {
            var data = snap.val();
            if (data) {
                showProfileModal(data, authorKey, authorRole);
            } else {
                // Fallback: try all paths
                Promise.all(allPaths.map(function(p) { return db.ref(p).once('value'); })).then(function(snaps) {
                    for (var i = 0; i < snaps.length; i++) {
                        var d = snaps[i].val();
                        if (d) {
                            var role = i === 0 ? 'Founder' : i === 1 ? 'Job Seeker' : 'Investor';
                            showProfileModal(d, authorKey, role);
                            return;
                        }
                    }
                    alert('Profile not found.');
                });
            }
        }).catch(function() { alert('Could not load profile.'); });
    };

    function showProfileModal(data, authorKey, role) {
        var existing = document.getElementById('community-profile-modal');
        if (existing) existing.remove();

        var name = data.name || 'Unknown';
        var pic = data.profilePic || data.picture || '';
        var coverPic = data.coverPic || '';
        var title = data.title || role;
        var bio = data.bio || '';
        var email = data.email || '';
        var linkedin = data.linkedin || '';
        var github = data.github || '';
        var location = data.location || '';
        var skills = data.skills || '';
        var availability = data.availability || '';
        var experiences = Array.isArray(data.experiences) ? data.experiences : [];
        var education = Array.isArray(data.education) ? data.education : [];
        var certificates = Array.isArray(data.certificates) ? data.certificates : [];

        var roleBadge = role === 'Founder'
            ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Founder</span>'
            : role === 'Investor'
            ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Investor</span>'
            : '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Job Seeker</span>';

        var coverStyle = coverPic
            ? 'background-image: url(' + coverPic + '); background-size: cover; background-position: center;'
            : 'background: linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b);';

        var profilePicHTML = pic
            ? '<img src="' + pic + '" alt="' + _escHtml(name) + '" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-900 shadow-xl cursor-pointer" onclick="openAvatarFullView(\'' + pic.replace(/'/g, "\\'") + '\',\'' + _escHtml(name) + '\')">'
            : '<div class="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-gray-900 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl">' + name.charAt(0).toUpperCase() + '</div>';

        var skillsArr = typeof skills === 'string' ? skills.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : (Array.isArray(skills) ? skills : []);
        var skillsHTML = skillsArr.length > 0
            ? skillsArr.map(function(s) { return '<span class="bg-gray-900 border border-gray-600 px-3 py-1 rounded-lg text-sm text-gray-200">' + _escHtml(s) + '</span>'; }).join('')
            : '<p class="text-gray-500 text-sm italic">No skills listed.</p>';

        var expHTML = experiences.length > 0
            ? experiences.map(function(exp) {
                return '<div class="flex items-start gap-3 border-b border-gray-700/50 pb-3 last:border-0 last:pb-0"><div class="w-9 h-9 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0"><i data-lucide="briefcase" class="w-4 h-4 text-gray-400"></i></div><div><h5 class="font-bold text-white text-sm">' + _escHtml(exp.title || '') + '</h5><p class="text-xs text-gray-400">' + _escHtml(exp.company || '') + '</p><p class="text-xs text-gray-600">' + _escHtml(exp.duration || '') + '</p></div></div>';
            }).join('')
            : '';

        var eduHTML = education.length > 0
            ? education.map(function(edu) {
                return '<div class="flex items-start gap-3 border-b border-gray-700/50 pb-3 last:border-0 last:pb-0"><div class="w-9 h-9 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0"><i data-lucide="graduation-cap" class="w-4 h-4 text-gray-400"></i></div><div><h5 class="font-bold text-white text-sm">' + _escHtml(edu.school || '') + '</h5><p class="text-xs text-gray-400">' + _escHtml(edu.degree || '') + '</p><p class="text-xs text-gray-600">' + _escHtml(edu.duration || '') + '</p></div></div>';
            }).join('')
            : '';

        var certHTML = certificates.length > 0
            ? certificates.map(function(c) {
                return '<div class="flex items-center justify-between border-b border-gray-700/50 pb-2 last:border-0 last:pb-0"><div><span class="font-bold text-white text-sm">' + _escHtml(c.name || '') + '</span><span class="text-xs text-gray-500 ml-2">' + _escHtml(c.issuer || '') + '</span></div></div>';
            }).join('')
            : '';

        var contactHTML = '<div class="flex flex-wrap gap-2">' +
            (email ? '<a href="mailto:' + _escHtml(email) + '" class="bg-gray-900 border border-gray-700 hover:border-indigo-500/50 px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-gray-300 transition"><i data-lucide="mail" class="w-3.5 h-3.5 text-red-400"></i>' + _escHtml(email) + '</a>' : '') +
            (linkedin ? '<a href="' + _escHtml(linkedin) + '" target="_blank" class="bg-gray-900 border border-gray-700 hover:border-blue-500/50 px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-gray-300 transition"><i data-lucide="linkedin" class="w-3.5 h-3.5 text-blue-400"></i>LinkedIn</a>' : '') +
            (github ? '<a href="' + _escHtml(github) + '" target="_blank" class="bg-gray-900 border border-gray-700 hover:border-gray-500/50 px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-gray-300 transition"><i data-lucide="github" class="w-3.5 h-3.5 text-gray-400"></i>GitHub</a>' : '') +
            '</div>';

        // Community posts for this user — full version with comments
        var communityPostsHTML = window.renderUserCommunityPostsFull ? window.renderUserCommunityPostsFull(authorKey, name) : (window.renderUserCommunityPosts ? window.renderUserCommunityPosts(authorKey, name) : '');

        var modal = document.createElement('div');
        modal.id = 'community-profile-modal';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-start justify-center p-2 sm:p-4 overflow-y-auto';
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

        modal.innerHTML = '<div class="bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-3xl my-4 sm:my-8 overflow-hidden animate-fade-in">' +
            '<button onclick="document.getElementById(\'community-profile-modal\').remove()" class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-gray-800/90 hover:bg-gray-700 p-2 rounded-xl text-gray-400 hover:text-white transition border border-gray-700"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '<div class="h-32 sm:h-44 relative" style="' + coverStyle + '"><div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div></div>' +
            '<div class="px-4 sm:px-8 pb-4 sm:pb-6 relative -mt-12 sm:-mt-16">' +
                '<div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">' +
                    '<div class="shrink-0">' + profilePicHTML + '</div>' +
                    '<div class="flex-1 text-center sm:text-left pt-1 sm:pt-2">' +
                        '<h2 class="text-xl sm:text-2xl font-bold text-white">' + _escHtml(name) + '</h2>' +
                        '<div class="flex items-center justify-center sm:justify-start gap-2 mt-1">' +
                            '<p class="text-indigo-400 font-medium text-sm">' + _escHtml(title) + '</p>' +
                            roleBadge +
                        '</div>' +
                        (location ? '<p class="text-gray-500 text-xs flex items-center justify-center sm:justify-start mt-1"><i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>' + _escHtml(location) + '</p>' : '') +
                        (availability ? '<span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">' + _escHtml(availability) + '</span>' : '') +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="px-4 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6">' +
                (bio ? '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-2 flex items-center"><i data-lucide="user" class="w-4 h-4 mr-2 text-indigo-400"></i>About</h4><p class="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">' + _escHtml(bio) + '</p></div>' : '') +
                (skillsArr.length > 0 ? '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-3 flex items-center"><i data-lucide="code" class="w-4 h-4 mr-2 text-yellow-400"></i>Skills</h4><div class="flex flex-wrap gap-2">' + skillsHTML + '</div></div>' : '') +
                (expHTML ? '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-3 flex items-center"><i data-lucide="briefcase" class="w-4 h-4 mr-2 text-blue-400"></i>Experience</h4><div class="space-y-3">' + expHTML + '</div></div>' : '') +
                (eduHTML ? '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-3 flex items-center"><i data-lucide="graduation-cap" class="w-4 h-4 mr-2 text-purple-400"></i>Education</h4><div class="space-y-3">' + eduHTML + '</div></div>' : '') +
                (certHTML ? '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-3 flex items-center"><i data-lucide="award" class="w-4 h-4 mr-2 text-orange-400"></i>Certifications</h4><div class="space-y-3">' + certHTML + '</div></div>' : '') +
                '<div class="bg-gray-800/40 rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6"><h4 class="font-bold text-sm sm:text-base text-white mb-3 flex items-center"><i data-lucide="phone" class="w-4 h-4 mr-2 text-blue-400"></i>Contact</h4>' + contactHTML + '</div>' +
                communityPostsHTML +
            '</div></div>';

        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ============================================================
    // IMAGE LIGHTBOX — for post images and avatars
    // ============================================================
    window.openImageLightbox = function(src) {
        if (!src) return;
        var existing = document.getElementById('foundera-lightbox');
        if (existing) existing.remove();
        var lightbox = document.createElement('div');
        lightbox.id = 'foundera-lightbox';
        lightbox.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-[80] flex items-center justify-center p-4 cursor-zoom-out';
        lightbox.onclick = function(e) { if (e.target === lightbox || e.target.tagName === 'IMG') lightbox.remove(); };
        lightbox.innerHTML =
            '<button onclick="document.getElementById(\'foundera-lightbox\').remove()" class="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-700 text-white p-2.5 rounded-full transition border border-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '<img src="' + src + '" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" style="animation: lightboxZoomIn 0.25s ease-out">';
        document.body.appendChild(lightbox);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // Avatar click — show full profile photo
    window.openAvatarFullView = function(src, name) {
        if (!src) return;
        var existing = document.getElementById('foundera-lightbox');
        if (existing) existing.remove();
        var lightbox = document.createElement('div');
        lightbox.id = 'foundera-lightbox';
        lightbox.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4 cursor-zoom-out';
        lightbox.onclick = function(e) { if (e.target === lightbox) lightbox.remove(); };
        lightbox.innerHTML =
            '<button onclick="document.getElementById(\'foundera-lightbox\').remove()" class="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-700 text-white p-2.5 rounded-full transition border border-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '<img src="' + src + '" class="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-full shadow-2xl border-4 border-gray-700" style="animation: lightboxZoomIn 0.25s ease-out">' +
            (name ? '<p class="text-white font-bold text-lg mt-4">' + _escHtml(name) + '</p>' : '');
        document.body.appendChild(lightbox);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // ============================================================
    // REACTION VIEWER — Show who reacted to a post
    // ============================================================
    window.showReactionViewer = function(postKey) {
        var post = window._communityPosts.find(function(p) { return p._key === postKey; });
        if (!post || !post.reactions) return;
        var reactions = post.reactions;
        var reactorKeys = Object.keys(reactions);
        if (reactorKeys.length === 0) return;

        // Build known users map
        var knownUsers = {};
        window._communityPosts.forEach(function(p) {
            if (p.authorKey && p.authorName) knownUsers[p.authorKey] = { name: p.authorName, pic: p.authorPic || '', role: p.authorRole || 'Job Seeker' };
            var coms = p.comments || {};
            Object.keys(coms).forEach(function(ck) {
                var c = coms[ck];
                if (c.authorKey && c.authorName) knownUsers[c.authorKey] = { name: c.authorName, pic: c.authorPic || '', role: c.authorRole || 'Job Seeker' };
            });
        });

        var emojiMap = { like: '\u{1F44D}', celebrate: '\u{1F389}', insightful: '\u{1F9E0}', support: '\u{2764}\u{FE0F}' };
        var itemsHtml = reactorKeys.map(function(rk) {
            var user = knownUsers[rk] || { name: 'Someone', pic: '', role: 'Job Seeker' };
            var emoji = emojiMap[reactions[rk]] || '\u{1F44D}';
            var avatar = user.pic
                ? '<img src="' + user.pic + '" class="w-9 h-9 rounded-full object-cover shrink-0">'
                : '<div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">' + (user.name ? user.name.charAt(0).toUpperCase() : '?') + '</div>';
            return '<div class="reaction-user-item" onclick="document.getElementById(\'reaction-viewer-overlay\').remove();viewCommunityProfile(\'' + _escHtml(rk) + '\',\'' + _escHtml(user.role) + '\')">' +
                avatar +
                '<div class="flex-1 min-w-0"><p class="text-sm font-semibold text-white truncate">' + _escHtml(user.name) + '</p><p class="text-xs text-gray-500">' + _escHtml(user.role) + '</p></div>' +
                '<span class="text-lg">' + emoji + '</span>' +
            '</div>';
        }).join('');

        var existing = document.getElementById('reaction-viewer-overlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'reaction-viewer-overlay';
        overlay.className = 'reaction-viewer-overlay';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = '<div class="reaction-viewer-modal">' +
            '<div class="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between sticky top-0 bg-gray-800 rounded-t-xl z-10">' +
                '<h3 class="font-bold text-white text-sm">\u{1F44D} Reactions (' + reactorKeys.length + ')</h3>' +
                '<button onclick="document.getElementById(\'reaction-viewer-overlay\').remove()" class="text-gray-500 hover:text-white p-1 transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
            '</div>' +
            itemsHtml +
        '</div>';
        document.body.appendChild(overlay);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // ============================================================
    // MY POSTS — View, Edit, Delete own community posts
    // ============================================================
    window._editingPostKey = null;

    window.renderMyPosts = function() {
        var user = _getUser();
        if (!user.key) return '<div class="text-center py-20"><p class="text-gray-500">Please log in to see your posts.</p></div>';
        var myPosts = window._communityPosts.filter(function(p) { return p.authorKey === user.key; });

        if (myPosts.length === 0) {
            return '<div class="max-w-3xl mx-auto">' +
                '<div class="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/30">' +
                    '<div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center"><i data-lucide="file-text" class="w-10 h-10 text-indigo-400"></i></div>' +
                    '<h3 class="text-xl font-bold text-white mb-2">No Posts Yet</h3>' +
                    '<p class="text-gray-500 text-sm max-w-md mx-auto mb-6">You haven\'t posted anything in the community yet. Go to the Community tab to share something!</p>' +
                    '<button onclick="setTab(\'community\')" class="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition">Go to Community</button>' +
                '</div>' +
            '</div>';
        }

        var postsHtml = myPosts.map(function(post) {
            var timeAgo = _timeAgo(post.timestamp);
            var cat = CATEGORIES[post.category] || CATEGORIES.general;
            var cm = COLOR_MAP[cat.color] || COLOR_MAP.gray;
            var reactions = post.reactions || {};
            var totalReactions = Object.keys(reactions).length;
            var comments = post.comments ? Object.keys(post.comments).map(function(k) { var c = post.comments[k]; c._key = k; return c; }).sort(function(a,b) { return (a.timestamp||0) - (b.timestamp||0); }) : [];

            return '<div class="my-post-card community-animate-slide-up">' +
                '<div class="p-4 sm:p-6">' +
                    // Header with actions
                    '<div class="flex items-start justify-between gap-2 mb-3">' +
                        '<div class="flex items-center gap-2">' +
                            '<span class="text-xs px-2 py-0.5 rounded-full font-semibold ' + cm.bg + ' ' + cm.text + ' border ' + cm.border + '">' + cat.emoji + ' ' + cat.label + '</span>' +
                            '<span class="text-xs text-gray-500">' + timeAgo + '</span>' +
                        '</div>' +
                        '<div class="flex items-center gap-1">' +
                            '<button onclick="startEditPost(\'' + post._key + '\')" class="text-gray-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-500/10 transition" title="Edit post"><i data-lucide="pencil" class="w-4 h-4"></i></button>' +
                            '<button onclick="deleteCommunityPost(\'' + post._key + '\')" class="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition" title="Delete post"><i data-lucide="trash-2" class="w-4 h-4"></i></button>' +
                        '</div>' +
                    '</div>' +
                    // Content
                    '<div id="my-post-content-' + post._key + '">' +
                        '<p class="text-gray-200 text-sm leading-relaxed whitespace-pre-line mb-3">' + _escHtml(post.content) + '</p>' +
                    '</div>' +
                    // Image
                    (post.imageBase64 ? '<div class="mb-3 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900/50"><img src="' + post.imageBase64 + '" class="w-full max-h-96 object-contain cursor-pointer" onclick="openImageLightbox(this.src)"></div>' : '') +
                    // PDF
                    (post.pdfBase64 ? '<div class="mb-3 flex items-center gap-2 bg-gray-900/60 p-2 rounded-xl border border-gray-700/50 text-xs"><i data-lucide="file-text" class="w-4 h-4 text-red-400 shrink-0"></i><span class="text-gray-300 truncate flex-1">' + _escHtml(post.pdfFileName || 'Document.pdf') + '</span></div>' : '') +
                    // Stats
                    '<div class="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-700/30">' +
                        (totalReactions > 0 ? '<span onclick="showReactionViewer(\'' + post._key + '\')" class="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition">\u{1F44D} ' + totalReactions + ' reaction' + (totalReactions > 1 ? 's' : '') + '</span>' : '<span class="text-gray-600">No reactions yet</span>') +
                        '<span onclick="toggleCommunityComments(\'' + post._key + '\')" class="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> ' + comments.length + ' comment' + (comments.length !== 1 ? 's' : '') + '</span>' +
                    '</div>' +
                    // Comments viewer (Hidden by default)
                    (comments.length > 0 ? '<div id="comments-' + post._key + '" class="hidden mt-3 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">' + comments.map(function(c) {
                        return '<div class="flex items-start gap-2">' +
                            (c.authorPic ? '<img src="' + c.authorPic + '" class="w-6 h-6 rounded-full object-cover mt-0.5 cursor-pointer hover:opacity-80" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' : '<div class="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-400 mt-0.5 shrink-0 cursor-pointer" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + (c.authorName ? c.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                            '<div class="bg-gray-900/40 px-2.5 py-1.5 rounded-lg flex-1">' +
                                '<span class="text-[11px] font-bold text-white cursor-pointer hover:underline" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + _escHtml(c.authorName || 'Anonymous') + '</span>' +
                                '<span class="text-[10px] text-gray-600 ml-2">' + _timeAgo(c.timestamp) + '</span>' +
                                '<p class="text-[11px] text-gray-300 mt-0.5">' + _escHtml(c.text) + '</p>' +
                            '</div>' +
                        '</div>';
                    }).join('') + '</div>' : '') +
                '</div>' +
            '</div>';
        }).join('');

        return '<div class="max-w-3xl mx-auto space-y-4">' +
            '<div class="flex items-center justify-between mb-2">' +
                '<p class="text-sm text-gray-400"><i data-lucide="file-text" class="w-4 h-4 inline mr-1"></i> You have <strong class="text-white">' + myPosts.length + '</strong> post' + (myPosts.length !== 1 ? 's' : '') + '</p>' +
                '<button onclick="setTab(\'community\')" class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"><i data-lucide="plus" class="w-3.5 h-3.5"></i> New Post</button>' +
            '</div>' +
            postsHtml +
        '</div>';
    };

    // Start editing a post
    window.startEditPost = function(postKey) {
        var post = window._communityPosts.find(function(p) { return p._key === postKey; });
        if (!post) return;
        window._editingPostKey = postKey;

        var existing = document.getElementById('edit-post-modal');
        if (existing) existing.remove();

        var catOptions = '';
        Object.keys(CATEGORIES).forEach(function(key) {
            var cat = CATEGORIES[key];
            catOptions += '<option value="' + key + '"' + (post.category === key ? ' selected' : '') + '>' + cat.emoji + ' ' + cat.label + '</option>';
        });

        var modal = document.createElement('div');
        modal.id = 'edit-post-modal';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-2 sm:p-4';
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
        modal.innerHTML = '<div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">' +
            '<div class="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">' +
                '<h2 class="text-lg font-bold text-white flex items-center gap-2"><i data-lucide="pencil" class="w-5 h-5 text-indigo-400"></i> Edit Post</h2>' +
                '<button onclick="document.getElementById(\'edit-post-modal\').remove()" class="text-gray-400 hover:text-white p-1"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '</div>' +
            '<form onsubmit="saveEditPost(event)" class="p-4 sm:p-6 space-y-4">' +
                '<textarea id="edit-post-content" rows="5" required class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm resize-none placeholder-gray-600">' + _escHtml(post.content) + '</textarea>' +
                '<select id="edit-post-category" class="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500">' + catOptions + '</select>' +
                '<div class="flex gap-3 pt-2">' +
                    '<button type="button" onclick="document.getElementById(\'edit-post-modal\').remove()" class="px-5 py-2.5 border border-gray-600 rounded-xl font-medium text-sm hover:bg-gray-700 transition text-gray-300">Cancel</button>' +
                    '<button type="submit" class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-2"><i data-lucide="save" class="w-4 h-4"></i> Save Changes</button>' +
                '</div>' +
            '</form>' +
        '</div>';
        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // Save edited post
    window.saveEditPost = function(event) {
        event.preventDefault();
        if (!window._editingPostKey) return;
        var content = document.getElementById('edit-post-content').value.trim();
        var category = document.getElementById('edit-post-category').value;
        if (!content) return;

        firebase.database().ref('community_posts/' + window._editingPostKey).update({
            content: content,
            category: category
        }).then(function() {
            var modal = document.getElementById('edit-post-modal');
            if (modal) modal.remove();
            window._editingPostKey = null;
        }).catch(function(e) {
            console.error('Error updating post:', e);
            alert('Failed to update post.');
        });
    };

    // ============================================================
    // ENHANCED PROFILE COMMUNITY POSTS — Full posts with comments
    // ============================================================
    window.renderUserCommunityPostsFull = function(userKey, userName) {
        var posts = window.getUserCommunityPosts(userKey);
        if (posts.length === 0) {
            return '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8 shadow-lg">' +
                '<h2 class="text-xl font-bold text-white mb-4 flex items-center"><i data-lucide="message-circle" class="w-5 h-5 mr-2 text-indigo-400"></i>Community Posts</h2>' +
                '<div class="text-center py-8">' +
                    '<div class="w-16 h-16 mx-auto mb-4 bg-gray-700/30 rounded-full flex items-center justify-center"><i data-lucide="message-circle" class="w-8 h-8 text-gray-600"></i></div>' +
                    '<p class="text-gray-500 text-sm">No community posts yet.</p>' +
                '</div>' +
            '</div>';
        }
        var postsHtml = posts.map(function(post) {
            var cat = CATEGORIES[post.category] || CATEGORIES.general;
            var cm = COLOR_MAP[cat.color] || COLOR_MAP.gray;
            var timeAgo = _timeAgo(post.timestamp);
            var reactions = post.reactions || {};
            var totalReactions = Object.keys(reactions).length;
            var comments = post.comments ? Object.keys(post.comments).map(function(k) { var c = post.comments[k]; c._key = k; return c; }).sort(function(a,b) { return (a.timestamp||0) - (b.timestamp||0); }) : [];

            var commentsHtml = '';
            if (comments.length > 0) {
                commentsHtml = '<div id="comments-' + post._key + '" class="hidden mt-3 pt-3 border-t border-gray-700/30 space-y-2 max-h-60 overflow-y-auto overscroll-contain pr-2">' +
                    '<p class="text-xs text-gray-500 font-semibold mb-1"><i data-lucide="message-square" class="w-3 h-3 inline mr-1"></i> Comments (' + comments.length + ')</p>' +
                    comments.map(function(c) {
                        return '<div class="flex items-start gap-2">' +
                            (c.authorPic ? '<img src="' + c.authorPic + '" class="w-6 h-6 rounded-full object-cover mt-0.5 cursor-pointer hover:opacity-80" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' : '<div class="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-400 mt-0.5 shrink-0 cursor-pointer" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + (c.authorName ? c.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                            '<div class="bg-gray-900/40 px-2.5 py-1.5 rounded-lg flex-1">' +
                                '<span class="text-[11px] font-bold text-white cursor-pointer hover:underline" onclick="viewCommunityProfile(\'' + _escHtml(c.authorKey || '') + '\',\'' + _escHtml(c.authorRole || 'Job Seeker') + '\')">' + _escHtml(c.authorName || 'Anonymous') + '</span>' +
                                '<span class="text-[10px] text-gray-600 ml-2">' + _timeAgo(c.timestamp) + '</span>' +
                                '<p class="text-[11px] text-gray-300 mt-0.5">' + _escHtml(c.text) + '</p>' +
                            '</div>' +
                        '</div>';
                    }).join('') +
                '</div>';
            }

            return '<div class="bg-gray-900/40 rounded-xl border border-gray-700/40 p-4 community-animate-slide-up hover:border-indigo-500/20 transition-all">' +
                '<div class="flex items-center justify-between mb-3">' +
                    '<span class="text-xs px-2 py-0.5 rounded-full font-semibold ' + cm.bg + ' ' + cm.text + ' border ' + cm.border + '">' + cat.emoji + ' ' + cat.label + '</span>' +
                    '<span class="text-xs text-gray-500">' + timeAgo + '</span>' +
                '</div>' +
                '<p class="text-gray-200 text-sm leading-relaxed whitespace-pre-line mb-3">' + _escHtml(post.content) + '</p>' +
                (post.imageBase64 ? '<div class="mb-3 rounded-lg overflow-hidden border border-gray-700/50 bg-gray-900/50"><img src="' + post.imageBase64 + '" class="w-full max-h-96 object-contain cursor-pointer" onclick="openImageLightbox(this.src)"></div>' : '') +
                '<div class="flex items-center gap-4 text-xs text-gray-500">' +
                    (totalReactions > 0 ? '<span onclick="showReactionViewer(\'' + post._key + '\')" class="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition">\u{1F44D} ' + totalReactions + ' reactions</span>' : '') +
                    '<span onclick="toggleCommunityComments(\'' + post._key + '\')" class="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition"><i data-lucide="message-square" class="w-3 h-3"></i> ' + comments.length + ' comments</span>' +
                '</div>' +
                commentsHtml +
            '</div>';
        }).join('');
        return '<div class="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6 sm:p-8 shadow-lg">' +
            '<h2 class="text-xl font-bold text-white mb-6 flex items-center"><i data-lucide="message-circle" class="w-5 h-5 mr-2 text-indigo-400"></i>Community Posts <span class="ml-2 text-sm font-normal text-gray-400">(' + posts.length + ')</span></h2>' +
            '<div class="space-y-4">' + postsHtml + '</div>' +
        '</div>';
    };

})();