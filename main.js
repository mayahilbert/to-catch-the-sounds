// ============================================
// CORE STATE
// ============================================
const videoSections = document.querySelectorAll('.video-section');
const introText = document.querySelector('header');
const secondaryNav = document.querySelector('.secondary-nav');

let currentActiveSection = 0;
let isScrolling = false;
let isDialogOpen = false;
let hasInteracted = false;
let isProgrammaticScroll = false;

// ============================================
// STATE FUNCTIONS
// ============================================
function applyState(isHome, activeSectionIndex, isOpen) {
    // Header + nav
    if (isHome) {
        introText?.classList.remove('fade-out');
        secondaryNav.style.display = 'none';
    } else {
        introText?.classList.add('fade-out');
        secondaryNav.style.display = 'flex';
    }

    // Sections
    videoSections.forEach((s, i) => {
        if (i === activeSectionIndex) {
            if (isHome && i === 0) {
                s.classList.remove('active', 'closing');
                s.classList.add('partial-closed');
            } else if (isOpen) {
                s.classList.remove('partial-closed', 'closing');
                s.classList.add('active');
            } else {
                s.classList.remove('active', 'partial-closed');
                s.classList.add('closing');
                setTimeout(() => s.classList.remove('closing'), 2000);
            }
        } else {
            s.classList.remove('active', 'partial-closed', 'closing');
        }
    });
}

// ============================================
// INTERSECTION OBSERVER
// ============================================
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
}, { threshold: 0.5, rootMargin: '0px' });

videoSections.forEach(section => sectionObserver.observe(section));

// ============================================
// ON LOAD
// ============================================
window.addEventListener('load', () => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    try { window.scrollTo(0, 0); } catch (e) { }
    applyState(true, 0, false);
});

// ============================================
// NAVIGATION
// ============================================
function navigateSections(direction) {
    if (isScrolling || isDialogOpen) return;

    hasInteracted = true;
    const currentSectionEl = videoSections[currentActiveSection];
    const isOpen = currentSectionEl?.classList.contains('active');

    const isAtTopEdge = currentActiveSection === 0 && direction < 0;
    const isAtBottomEdge = currentActiveSection === videoSections.length - 1 && direction > 0;

    if (isAtTopEdge) {
        hasInteracted = false;
        applyState(true, 0, false);
        return;
    }
    if (isAtBottomEdge) return;

    if (!isOpen) {
        applyState(false, currentActiveSection, true);
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 100);
        return;
    }

    // Move to next section
    isScrolling = true;
    const nextSection = Math.max(0, Math.min(videoSections.length - 1, currentActiveSection + direction));

    applyState(false, currentActiveSection, false); // close current

    setTimeout(() => {
        if (nextSection !== currentActiveSection) {
            videoSections[nextSection].scrollIntoView({ behavior: 'auto', block: 'start' });
            currentActiveSection = nextSection;

            setTimeout(() => {
                const isReturningHome = currentActiveSection === 0 && direction < 0;
                if (isReturningHome) hasInteracted = false;
                applyState(isReturningHome, currentActiveSection, !isReturningHome);
                isScrolling = false;
            }, 600);
        } else {
            applyState(false, currentActiveSection, true);
            isScrolling = false;
        }
    }, 800);
}

// ============================================
// MOUSE WHEEL
// ============================================
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isDialogOpen) return;
    navigateSections(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

// ============================================
// SECTION CLICK
// ============================================
videoSections.forEach((section, index) => {
    section.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, textarea, select, video, iframe, .video-container')) return;

        const isCurrentActive = section.classList.contains('active');
        const isCurrentSection = currentActiveSection === index;

        if (!isCurrentSection) {
            navigateSections(index > currentActiveSection ? 1 : -1);
        } else if (!isCurrentActive) {
            navigateSections(0);
        } else {
            navigateSections(1);
        }
    });
});

// ============================================
// HEADER CLICK (opens first section)
// ============================================
const firstSection = videoSections[0];
const header = document.querySelector('header');
if (firstSection && header) {
    header.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, textarea, select')) return;
        if (firstSection.classList.contains('partial-closed')) {
            hasInteracted = true;
            applyState(false, 0, true);
        }
    });
}

// ============================================
// BACK TO TOP — single listener, defined once
// ============================================
document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    sectionObserver.disconnect();
    isProgrammaticScroll = true;
    isScrolling = false;
    hasInteracted = false;
    currentActiveSection = 0;

    window.scrollTo({ top: 0, behavior: 'auto' });
    applyState(true, 0, false);

    setTimeout(() => {
        applyState(true, 0, false);
        isProgrammaticScroll = false;
        isScrolling = false;
        videoSections.forEach(section => sectionObserver.observe(section));
    }, 900);
});

// ============================================
// DRAG (Mouse)
// ============================================
let dragState = {
    isDragging: false,
    startY: 0,
    startTime: 0,
    currentY: 0,
    threshold: 50,
};

document.addEventListener('mousedown', (e) => {
    if (isDialogOpen) return;
    if (e.target.closest('a, button, input, textarea, select')) return;
    dragState.isDragging = true;
    dragState.startY = e.clientY;
    dragState.currentY = e.clientY;
    dragState.startTime = Date.now();
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!dragState.isDragging) return;
    dragState.currentY = e.clientY;
});

document.addEventListener('mouseup', (e) => {
    if (!dragState.isDragging) return;
    const deltaY = dragState.startY - dragState.currentY;
    if (Math.abs(deltaY) > dragState.threshold) {
        navigateSections(deltaY > 0 ? 1 : -1);
    }
    dragState.isDragging = false;
});

// ============================================
// DRAG (Touch)
// ============================================
let touchState = { isTouching: false, startY: 0, currentY: 0 };

document.addEventListener('touchstart', (e) => {
    if (isDialogOpen) return;
    if (e.target.closest('a, button, input, textarea, select, video, iframe, .video-container')) return;
    touchState.isTouching = true;
    touchState.startY = e.touches[0].clientY;
    touchState.currentY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!touchState.isTouching) return;
    touchState.currentY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
    if (!touchState.isTouching) return;
    const deltaY = touchState.startY - touchState.currentY;
    if (Math.abs(deltaY) > dragState.threshold) {
        navigateSections(deltaY > 0 ? 1 : -1);
    }
    touchState.isTouching = false;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (touchState.isTouching) e.preventDefault();
}, { passive: false });

/* descriptive text is now shown inside its own overlay dialog; tooltip code removed */

/* ============================================
   DIALOG / OVERLAY SYSTEM
   ============================================ */
function openDialog(dialog) {
    isDialogOpen = true;
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.querySelector("#homepage").classList.add("overlay-open");
    dialog.showModal();
    history.pushState({ dialogId: dialog.id }, "");
    const iframe = dialog.querySelector("iframe");
    if (iframe) new Vimeo.Player(iframe).play();
}

function closeDialog(dialog) {
    isDialogOpen = false;
    const scrollY = document.body.dataset.scrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, parseInt(scrollY || 0));
    dialog.close();
    const iframe = dialog.querySelector("iframe");
    if (iframe) new Vimeo.Player(iframe).pause();
    document.querySelector("#homepage").classList.remove("overlay-open");
}

document.querySelectorAll("[data-dialog-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const dialog = document.getElementById(btn.dataset.dialogTarget);
        if (dialog) openDialog(dialog);
    });
});

document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => closeDialog(btn.closest("dialog")));
});

document.querySelectorAll("dialog.overlay").forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => {
        const iframe = dialog.querySelector("iframe");
        if (iframe) new Vimeo.Player(iframe).pause();
        document.querySelector("#homepage").classList.remove("overlay-open");
    });
});

window.addEventListener("popstate", (event) => {
    const openDialogs = Array.from(document.querySelectorAll("dialog[open]"));
    if (event.state?.dialogId) {
        const dlg = document.getElementById(event.state.dialogId);
        if (dlg && !dlg.open) openDialog(dlg);
    } else if (openDialogs.length) {
        closeDialog(openDialogs[openDialogs.length - 1]);
    }
});