/* ============================================
   FOUNDERA — Shared Mobile Nav Drawer
   Used on blog, about-us, success-stories pages
   Hamburger button is already in each page's HTML.
   This script creates the slide-in drawer + overlay.
   ============================================ */

(function () {
    var overlay, drawer;

    function buildDrawer() {
        if (document.getElementById('mobile-nav-overlay')) return;

        var currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Overlay
        overlay = document.createElement('div');
        overlay.id = 'mobile-nav-overlay';
        overlay.className = 'mobile-nav-overlay';

        // Drawer
        drawer = document.createElement('div');
        drawer.id = 'mobile-nav-drawer';
        drawer.className = 'mobile-nav-drawer';

        drawer.innerHTML =
            '<div class="flex justify-between items-center mb-8">' +
                '<div class="flex items-center gap-2">' +
                    '<img src="images/founderaLogo.jpeg" alt="Foundera" class="w-8 h-8 rounded-lg object-cover">' +
                    '<span class="text-xl logo-gradient">Foundera</span>' +
                '</div>' +
                '<button id="mobile-nav-close" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</div>' +
            '<nav class="space-y-2">' +
                '<a href="index.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium ' + (currentPage === 'index.html' ? 'text-white bg-white/10' : '') + '">Home</a>' +
                '<a href="blog.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium ' + (currentPage === 'blog.html' ? 'text-white bg-white/10' : '') + '">Blog</a>' +
                '<a href="success-stories.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium ' + (currentPage === 'success-stories.html' ? 'text-white bg-white/10' : '') + '">Success Stories</a>' +
                '<a href="about-us.html" class="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium ' + (currentPage === 'about-us.html' ? 'text-white bg-white/10' : '') + '">About Us</a>' +
            '</nav>' +
            '<div class="mt-8 space-y-3">' +
                '<a href="index.html#login" class="block text-center px-4 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all">Log in</a>' +
                '<a href="index.html#signup" class="block text-center px-4 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-semibold transition-all">Sign up for free</a>' +
            '</div>';

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        overlay.addEventListener('click', closeMobileNav);
        document.getElementById('mobile-nav-close').addEventListener('click', closeMobileNav);
    }

    function openMobileNav() {
        buildDrawer();
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        if (!overlay) return;
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Expose global toggle (called by inline onclick on hamburger button)
    window.toggleMobileNav = function () {
        if (drawer && drawer.classList.contains('active')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    };
})();
