// ==========================================
// COMMUNITY FEED — Shared across all dashboards
// ==========================================
(function() {
    'use strict';

    // --- COMMUNITY STATE ---
    window._communityPosts = [];
    window._communityListener = null;
    window._communityFilter = 'all';

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
            if (typeof currentTab !== 'undefined' && currentTab === 'community') {
                if (typeof renderContent === 'function') renderContent();
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
            if (imgFile.size > 800000) { alert('Image must be under 800KB. Please compress it first.'); return; }
            imgPromise = new Promise(function(resolve) {
                var reader = new FileReader();
                reader.onload = function(e) { resolve(e.target.result); };
                reader.readAsDataURL(imgFile);
            });
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
        if (typeof renderContent === 'function') renderContent();
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
        if (posts.length === 0) {
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

                var html = '<div class="community-post-card community-post-enter" style="animation-delay:' + delay + 's">' +
                    '<div class="p-5 sm:p-6">' +
                        // Header
                        '<div class="flex items-start justify-between mb-4">' +
                            '<div class="flex items-center gap-3">' +
                                (post.authorPic ? '<img src="' + post.authorPic + '" class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50 shadow-lg">' : '<div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-indigo-500/30 shadow-lg">' + (post.authorName ? post.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                                '<div>' +
                                    '<div class="flex items-center gap-2 flex-wrap">' +
                                        '<h4 class="font-bold text-white text-sm">' + _escHtml(post.authorName || 'Anonymous') + '</h4>' +
                                        _roleBadge(post.authorRole || 'Job Seeker') +
                                    '</div>' +
                                    '<p class="text-xs text-gray-500 mt-0.5">' + _escHtml(post.authorTitle || '') + ' \u00B7 ' + timeAgo + '</p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="flex items-center gap-2">' +
                                '<span class="text-xs px-2.5 py-1 rounded-full font-semibold ' + cm.bg + ' ' + cm.text + ' border ' + cm.border + '">' + cat.emoji + ' ' + cat.label + '</span>' +
                                (isMyPost ? '<button onclick="deleteCommunityPost(\'' + post._key + '\')" class="text-gray-600 hover:text-red-400 p-1 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>' : '') +
                            '</div>' +
                        '</div>' +
                        // Content
                        '<div class="mb-4">' +
                            '<p class="text-gray-200 text-sm leading-relaxed whitespace-pre-line">' + _escHtml(post.content) + '</p>' +
                        '</div>' +
                        // Image attachment
                        (post.imageBase64 ? '<div class="mb-4 rounded-xl overflow-hidden border border-gray-700/50"><img src="' + post.imageBase64 + '" class="w-full max-h-96 object-cover cursor-pointer hover:opacity-90 transition" onclick="window.open(this.src)"></div>' : '') +
                        // PDF attachment
                        (post.pdfBase64 ? '<div class="mb-4 flex items-center gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-700/50"><div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0"><i data-lucide="file-text" class="w-5 h-5 text-red-400"></i></div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">' + _escHtml(post.pdfFileName || 'Document.pdf') + '</p><p class="text-xs text-gray-500">PDF Attachment</p></div><a href="' + post.pdfBase64 + '" download="' + _escHtml(post.pdfFileName || 'document.pdf') + '" class="text-indigo-400 hover:text-indigo-300 p-2 transition"><i data-lucide="download" class="w-5 h-5"></i></a></div>' : '') +
                        // Reaction summary
                        (totalReactions > 0 ? '<div class="flex items-center gap-3 text-xs text-gray-400 mb-3 pb-3 border-b border-gray-700/30">' +
                            (likeCount > 0 ? '<span class="flex items-center gap-1">\u{1F44D} ' + likeCount + '</span>' : '') +
                            (celebrateCount > 0 ? '<span class="flex items-center gap-1">\u{1F389} ' + celebrateCount + '</span>' : '') +
                            (insightfulCount > 0 ? '<span class="flex items-center gap-1">\u{1F9E0} ' + insightfulCount + '</span>' : '') +
                            (supportCount > 0 ? '<span class="flex items-center gap-1">\u{2764}\u{FE0F} ' + supportCount + '</span>' : '') +
                            '<span class="ml-auto text-gray-600">' + totalReactions + ' reaction' + (totalReactions > 1 ? 's' : '') + '</span>' +
                        '</div>' : '') +
                        // Reaction buttons & comment toggle
                        '<div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/30">' +
                            '<div class="flex items-center gap-1">' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'like\')" class="community-reaction-btn ' + (myReaction === 'like' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F44D} Like</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'celebrate\')" class="community-reaction-btn ' + (myReaction === 'celebrate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F389} Celebrate</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'insightful\')" class="community-reaction-btn ' + (myReaction === 'insightful' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{1F9E0} Insightful</button>' +
                                '<button onclick="toggleCommunityReaction(\'' + post._key + '\', \'support\')" class="community-reaction-btn ' + (myReaction === 'support' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'hover:bg-gray-700/60 text-gray-500 border-transparent') + '">\u{2764}\u{FE0F} Support</button>' +
                            '</div>' +
                            '<button onclick="toggleCommunityComments(\'' + post._key + '\')" class="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> ' + comments.length + '</button>' +
                        '</div>' +
                        // Comments section (hidden by default if > 2)
                        '<div id="comments-' + post._key + '" class="' + (comments.length > 2 ? '' : '') + '">' +
                            (comments.length > 0 ? '<div class="space-y-2.5 mb-3">' + comments.map(function(c) {
                                return '<div class="flex items-start gap-2.5 community-comment-enter">' +
                                    (c.authorPic ? '<img src="' + c.authorPic + '" class="w-7 h-7 rounded-full object-cover mt-0.5 ring-1 ring-gray-700">' : '<div class="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 mt-0.5 shrink-0">' + (c.authorName ? c.authorName.charAt(0).toUpperCase() : '?') + '</div>') +
                                    '<div class="bg-gray-900/50 px-3 py-2 rounded-xl flex-1">' +
                                        '<div class="flex items-center gap-2">' +
                                            '<span class="text-xs font-bold text-white">' + _escHtml(c.authorName || 'Anonymous') + '</span>' +
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
        var composeHtml = '<div class="community-compose-card community-post-enter">' +
            '<div class="p-5 sm:p-6">' +
                '<div class="flex items-start gap-3 sm:gap-4">' +
                    '<div class="shrink-0">' +
                        (user.pic ? '<img src="' + user.pic + '" class="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700/50 shadow-lg">' : '<div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-indigo-500/30 shadow-lg">' + (user.name ? user.name.charAt(0).toUpperCase() : '?') + '</div>') +
                    '</div>' +
                    '<form onsubmit="createCommunityPost(event)" class="flex-1 space-y-3">' +
                        '<textarea id="community-post-content" rows="3" required placeholder="Share something with the Foundera community \u2014 your growth, a question, an achievement, anything..." class="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 outline-none text-white text-sm resize-none placeholder-gray-600 transition"></textarea>' +
                        // Image preview
                        '<div id="community-img-preview" class="hidden relative">' +
                            '<img id="community-img-preview-img" class="max-h-48 rounded-xl border border-gray-700/50 object-cover">' +
                            '<button type="button" onclick="removeCommunityImagePreview()" class="absolute top-2 right-2 bg-black/70 hover:bg-red-500/80 text-white p-1 rounded-lg transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
                        '</div>' +
                        // PDF preview
                        '<div id="community-pdf-preview" class="hidden flex items-center gap-2 bg-gray-900/60 p-2 rounded-xl border border-gray-700/50">' +
                            '<i data-lucide="file-text" class="w-5 h-5 text-red-400 shrink-0"></i>' +
                            '<span id="community-pdf-name" class="text-xs text-gray-300 truncate flex-1"></span>' +
                            '<button type="button" onclick="removeCommunityPdfPreview()" class="text-gray-500 hover:text-red-400 p-1 transition"><i data-lucide="x" class="w-4 h-4"></i></button>' +
                        '</div>' +
                        '<div class="flex items-center justify-between flex-wrap gap-3">' +
                            '<div class="flex items-center gap-2">' +
                                '<select id="community-post-category" class="px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 transition">' + catOptions + '</select>' +
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
        var headerHtml = '<div class="community-header-banner community-post-enter">' +
            '<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/20 p-6 sm:p-8 mb-2">' +
                '<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>' +
                '<div class="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>' +
                '<div class="relative">' +
                    '<div class="flex items-center gap-3 mb-3">' +
                        '<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25"><i data-lucide="users" class="w-5 h-5 text-white"></i></div>' +
                        '<div>' +
                            '<h2 class="text-xl sm:text-2xl font-bold text-white">Community Feed</h2>' +
                            '<p class="text-xs text-gray-400">Founders \u00B7 Investors \u00B7 Job Seekers \u2014 all in one place</p>' +
                        '</div>' +
                    '</div>' +
                    '<p class="text-sm text-gray-300 max-w-2xl leading-relaxed">Share your growth, learnings, achievements, and connect with the entire Foundera ecosystem. Every voice matters here.</p>' +
                    '<div class="flex items-center gap-4 mt-4 text-xs text-gray-500">' +
                        '<span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3.5 h-3.5"></i> ' + window._communityPosts.length + ' posts</span>' +
                        '<span class="flex items-center gap-1"><i data-lucide="globe" class="w-3.5 h-3.5"></i> Cross-dashboard</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        return '<div class="max-w-3xl mx-auto space-y-5">' +
            headerHtml +
            composeHtml +
            '<div class="mt-1 mb-2">' + filterHtml + '</div>' +
            postsHtml +
        '</div>';
    };

})();
