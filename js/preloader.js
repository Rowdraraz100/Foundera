/* ============================================
   FOUNDERA — Shared Preloader Script
   Handles preloader dismiss on all pages
   ============================================ */

function dismissPreloader() {
    var p = document.getElementById('foundera-preloader');
    if (p) {
        p.classList.add('preloader-hidden');
        setTimeout(function () { p.remove(); }, 600);
    }
}

window.addEventListener('load', function () {
    setTimeout(dismissPreloader, 1200);
});
