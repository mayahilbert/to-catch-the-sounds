// Scroll-based panel management
const videoSections = document.querySelectorAll('.video-section');
const introText = document.querySelector('header');
const secondaryNav = document.querySelector('.secondary-nav');
let currentActiveSection = 0;
let isScrolling = false;

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
    // Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Reset all sections
    videoSections.forEach((s, i) => {
        s.classList.remove('active');
        s.classList.remove('partial-closed');
        if (i === 0) {
            s.classList.add('partial-closed');
        }
    });

    // Reset state variables
    currentActiveSection = 0;
    hasInteracted = false;
    isScrolling = false;

    if (introText) {
        introText.classList.remove('fade-out');
        secondaryNav.style.display = 'none';
    }
});

// do not auto-open panels until the user interacts
let hasInteracted = false;

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && hasInteracted) {
            const sectionIndex = parseInt(entry.target.getAttribute('data-section'));
            const activeSection = document.querySelector('.video-section.active');

            if (activeSection && activeSection !== entry.target) {
                activeSection.classList.remove('active');
            }

            entry.target.classList.add('active');
            currentActiveSection = sectionIndex;
        }
    });
}, observerOptions);

videoSections.forEach(section => {
    sectionObserver.observe(section);
});

// On load: reset scroll to top and set the first section to partially-closed
window.addEventListener('load', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    try { window.scrollTo(0, 0); } catch (e) { }
    videoSections.forEach((s, i) => {
        s.classList.remove('partial-closed');
        if (i === 0) {
            s.classList.add('partial-closed');
            // Ensure intro text is visible on load
            if (introText) {
                introText.classList.remove('fade-out');
                secondaryNav.style.display = 'none';
            }
        }
    });


});

// ============================================
// UNIFIED NAVIGATION FUNCTION
// ============================================
function navigateSections(direction) {
    if (isScrolling) return;

    hasInteracted = true;
    const currentSectionEl = videoSections[currentActiveSection];
    const isOpen = currentSectionEl && currentSectionEl.classList.contains('active');

    // Check if we're at an edge trying to scroll further
    const isAtTopEdge = currentActiveSection === 0 && direction < 0;
    const isAtBottomEdge = currentActiveSection === videoSections.length - 1 && direction > 0;

    if (isAtTopEdge) {
    introText.classList.remove('fade-out');
    secondaryNav.style.display = 'none';
    // Close the first section back to partial-closed
    if (currentSectionEl && currentSectionEl.classList.contains('active')) {
        currentSectionEl.classList.remove('active');
        currentSectionEl.classList.add('partial-closed');
    }
}
    if (isAtTopEdge || isAtBottomEdge) {
        return;
    }

    if (!isOpen) {
        // open current section (panels slide off-screen)
        if (currentSectionEl) {
            currentSectionEl.classList.remove('partial-closed');
            currentSectionEl.classList.add('active');

            // Hide intro text when first section opens
            if (introText) {
                introText.classList.add('fade-out');
                secondaryNav.style.display = 'flex';
            }
        }
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 100);
        return;
    }

    // If current section is open, second scroll closes it then moves to next
    isScrolling = true;
    const nextSection = Math.max(0, Math.min(videoSections.length - 1, currentActiveSection + direction));

    // close current immediately so panels fully cover it
    if (currentSectionEl) {
        currentSectionEl.classList.remove('active');
        currentSectionEl.classList.remove('partial-closed');
    }

    // Wait for panels to close animation, then snap to next and open it
    setTimeout(() => {
        if (nextSection !== currentActiveSection) {
            videoSections[nextSection].scrollIntoView({ behavior: 'auto', block: 'start' });
            currentActiveSection = nextSection;

            // open new section after scroll has started
            setTimeout(() => {
                const newEl = videoSections[currentActiveSection];
                if (newEl) {
                    // If we've returned to the very first section (index 0) via scrolling up,
                    // keep it partially-closed instead of fully open.
                    if (currentActiveSection === 0 && direction < 0) {
                        newEl.classList.remove('active');
                        newEl.classList.add('partial-closed');

                        if (introText) {
                            introText.classList.remove('fade-out');
                            secondaryNav.style.display = 'none';
                        }
                    } else {
                        newEl.classList.remove('partial-closed');
                        newEl.classList.add('active');
                    }
                }
                isScrolling = false;
            }, 600);
        } else {
            // no next section (edge) - reopen current after close
            const cur = videoSections[currentActiveSection];
            if (cur) {
                setTimeout(() => { cur.classList.add('active'); isScrolling = false; }, 300);
            } else {
                isScrolling = false;
            }
        }
    }, 800);
}

// ============================================
// MOUSE WHEEL SUPPORT
// ============================================
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    navigateSections(direction);
}, { passive: false });

// ============================================
// CLICK SUPPORT
// ============================================
videoSections.forEach((section, index) => {
    section.addEventListener('click', (e) => {
        // Prevent clicks on interactive elements from triggering navigation
        if (e.target.closest('a, button, input, textarea, select, video')) {
            return;
        }

        const isCurrentActive = section.classList.contains('active');
        const isCurrentSection = currentActiveSection === index;

        if (!isCurrentSection) {
            // Clicked on a different section - navigate to it
            const direction = index > currentActiveSection ? 1 : -1;
            navigateSections(direction);
        } else if (!isCurrentActive) {
            // Clicked on current section but it's not open - open it
            navigateSections(0); // This will open without moving
        } else {
            // Clicked on current open section - move to next
            navigateSections(1);
        }
    });
});

// ============================================
// DRAG SUPPORT (Mouse & Touch)
// ============================================
let dragState = {
    isDragging: false,
    startY: 0,
    startTime: 0,
    currentY: 0,
    threshold: 50, // pixels to trigger navigation
    slowDragTime: 300, // ms - anything slower than this is a "slow drag"
};

// Mouse drag
document.addEventListener('mousedown', (e) => {
    // Don't interfere with text selection or interactive elements
    if (e.target.closest('a, button, input, textarea, select')) {
        return;
    }

    dragState.isDragging = true;
    dragState.startY = e.clientY;
    dragState.currentY = e.clientY;
    dragState.startTime = Date.now();

    // Prevent text selection during drag
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!dragState.isDragging) return;
    dragState.currentY = e.clientY;
});

document.addEventListener('mouseup', (e) => {
    if (!dragState.isDragging) return;

    const deltaY = dragState.startY - dragState.currentY;
    const deltaTime = Date.now() - dragState.startTime;
    const absDelta = Math.abs(deltaY);

    // Check if drag exceeds threshold
    if (absDelta > dragState.threshold) {
        const direction = deltaY > 0 ? 1 : -1; // Drag up = scroll down (next)
        navigateSections(direction);
    }

    dragState.isDragging = false;
});

// Touch drag
let touchState = {
    isTouching: false,
    startY: 0,
    startTime: 0,
    currentY: 0,
};

document.addEventListener('touchstart', (e) => {
    // Don't interfere with interactive elements
    if (e.target.closest('a, button, input, textarea, select')) {
        return;
    }

    touchState.isTouching = true;
    touchState.startY = e.touches[0].clientY;
    touchState.currentY = e.touches[0].clientY;
    touchState.startTime = Date.now();
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!touchState.isTouching) return;
    touchState.currentY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!touchState.isTouching) return;

    const deltaY = touchState.startY - touchState.currentY;
    const deltaTime = Date.now() - touchState.startTime;
    const absDelta = Math.abs(deltaY);

    // Check if swipe exceeds threshold
    if (absDelta > dragState.threshold) {
        const direction = deltaY > 0 ? 1 : -1; // Swipe up = scroll down (next)
        navigateSections(direction);
    }

    touchState.isTouching = false;
}, { passive: true });

// Prevent default touch behavior on the document to avoid conflicts
document.addEventListener('touchmove', (e) => {
    if (dragState.isDragging || touchState.isTouching) {
        e.preventDefault();
    }
}, { passive: false });

const firstSection = videoSections[0];
const header = document.querySelector('header');
if (firstSection && header) {
    header.addEventListener('click', (e) => {
        console.log('First section clicked');
        if (e.target.closest('a, button, input, textarea, select')) {
            return;
        }
        // Only open if it's partial-closed (not already active)
        if (firstSection.classList.contains('partial-closed')) {
            hasInteracted = true;
            firstSection.classList.remove('partial-closed');
            firstSection.classList.add('active');

            // Hide intro text
            if (introText) {
                introText.classList.add('fade-out');
                secondaryNav.style.display = 'flex';
            }
        }
    });
}

/* INFO TOOLTIP MANAGEMENT */
function isSmall() { return window.matchMedia('(max-width: 800px)').matches; }

document.querySelectorAll('.info-wrap').forEach(wrap => {
    const btn = wrap.querySelector('.info-btn');
    const tip = document.getElementById(btn.getAttribute('aria-describedby'));

    function show() { tip.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }
    function hide() { tip.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); }

    let closeTimer;
    function scheduleHide() { closeTimer = setTimeout(hide, 100); }
    function cancelHide() { clearTimeout(closeTimer); }

    btn.addEventListener('click', () => tip.hidden ? show() : hide());
    btn.addEventListener('mouseenter', show);
    tip.addEventListener('mouseenter', show);
    btn.addEventListener('mouseleave', scheduleHide);
    tip.addEventListener('mouseleave', scheduleHide);
    btn.addEventListener('mouseenter', cancelHide);
    tip.addEventListener('mouseenter', cancelHide);
    btn.addEventListener('focus', show);
    btn.addEventListener('blur', hide);
});

// Escape closes all
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('[role="tooltip"]').forEach(tip => tip.hidden = true);
        document.querySelectorAll('.info-btn').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }
});

// On load and resize, remove hidden on large screens so CSS takes over
function syncLargeScreen() {
    const isLarge = window.matchMedia('(min-width: 768px)').matches;
    document.querySelectorAll('[role="tooltip"]').forEach(tip => {
        isLarge ? tip.removeAttribute('hidden') : tip.setAttribute('hidden', '');
    });
}

window.matchMedia('(min-width: 768px)').addEventListener('change', syncLargeScreen);
syncLargeScreen();