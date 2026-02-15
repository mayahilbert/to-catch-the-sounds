
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

document.querySelector('.back-to-top')?.addEventListener('click', (e) => {     // Reset all sections
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
})

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
// Also update the load event to ensure intro text is visible initially:
window.addEventListener('load', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    try { window.scrollTo(0, 0); } catch (e) { }
    videoSections.forEach((s, i) => {
        s.classList.remove('partial-closed');
        if (i === 0) s.classList.add('partial-closed');
    });

    // Ensure intro text is visible on load
    if (introText) {
        introText.classList.remove('fade-out');
        secondaryNav.style.display = 'none';

    }
});



// Scroll snapping with keyboard/wheel
let scrollTimeout;
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    // mark that the user has interacted so the observer will open panels
    hasInteracted = true;
    if (isScrolling) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const currentSectionEl = videoSections[currentActiveSection];

    // If current section is not open, first scroll should open it (no snapping)
    const isOpen = currentSectionEl && currentSectionEl.classList.contains('active');

    // Check if we're at an edge trying to scroll further
    const isAtTopEdge = currentActiveSection === 0 && direction < 0;
    const isAtBottomEdge = currentActiveSection === videoSections.length - 1 && direction > 0;

    // If at edge and trying to scroll further, do nothing
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
                console.log(direction);
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
}, { passive: false });

