/* Striped background switch */
const STORAGE_KEY = 'animationEnabled';
const toggle = document.getElementById('animToggle');
const bg = document.querySelector('.striped-bg');
const liveRegion = document.getElementById('liveRegion');

// ── Apply state ─────────────────────────────────────────────────────────
function setAnimation(enabled, announce = false) {
    toggle.checked = enabled;
    const warning = document.querySelector('.warning-notice');
    const warningWrapper = document.getElementById('warningWrapper');
    if (enabled) {

        warningWrapper.classList.add('hidden');
        setTimeout(() => { warningWrapper.style.display = 'none'; }, 350);
        bg.style.background = "url('images/stripes/pink and green two.jpg') 0 0/contain no-repeat, url('images/stripes/gray six.jpg') center 100%/contain repeat";
    } else {
        if (!enabled) {
            document.querySelector('.switch-label-group').classList.remove('sr-only');
        }
        warningWrapper.style.display = '';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => warningWrapper.classList.remove('hidden'));
        });
        bg.style.background = "#484248";

    }
    // Update label text
    document.querySelector('.switch-label').textContent = enabled
        ? 'Disable background'
        : 'Enable background';

    //document.querySelector('.switch-label').classList.toggle('hidden', enabled);

    // Persist
    try {
        localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (_) { /* storage unavailable, fail silently */ }

    // Announce to screen readers only when the user explicitly toggles
    if (announce) {
        liveRegion.textContent = enabled
            ? 'Animated background enabled.'
            : 'Animated background disabled.';
        // Clear after a moment so the same message can repeat
        setTimeout(() => { liveRegion.textContent = ''; }, 1500);
    }
}
window.addEventListener('scroll', () => {
    const label = document.querySelector('.switch-label-group');
    if (toggle.checked && window.scrollY > 40) {
        label.classList.add('sr-only');
        document.querySelector('.switch-row').classList.add('scrolled');
    } else {
        label.classList.remove('sr-only');
        document.querySelector('.switch-row').classList.remove('scrolled');
    }
}, { passive: true });
// ── Restore saved preference (default: off) ──────────────────────────────
let saved = false; // default OFF
try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '1') saved = true;
} catch (_) { /* storage unavailable */ }

setAnimation(saved, false);

// ── Handle toggle ────────────────────────────────────────────────────────
toggle.addEventListener('change', () => {
    console.log('Toggle changed, new value:', toggle.checked);
    setAnimation(toggle.checked, true);
});