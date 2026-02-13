
// Scroll-based panel management
const videoSections = document.querySelectorAll('.video-section');
let currentActiveSection = 0;
let isScrolling = false;

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

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
    // prevent the browser from restoring previous scroll position
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    try { window.scrollTo(0, 0); } catch (e) {}
    // clear any accidental partial-closed classes and only add to first
    videoSections.forEach((s, i) => {
        s.classList.remove('partial-closed');
        if (i === 0) s.classList.add('partial-closed');
    });
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

    if (!isOpen) {
        // open current section (panels slide off-screen)
        if (currentSectionEl) {
            currentSectionEl.classList.remove('partial-closed');
            currentSectionEl.classList.add('active');
        }
        isScrolling = true;
        // lock while open animation runs
        setTimeout(() => { isScrolling = false; }, 800);
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
            videoSections[nextSection].scrollIntoView({ behavior: 'smooth', block: 'start' });
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

document.addEventListener("DOMContentLoaded", () => {
    //Start overlay

    const dialogs = document.querySelectorAll("dialog");

    function openDialog(dialog, theme) {
        console.log("open dialog")
        if (theme == "light") {
            document.querySelector("#homepage").classList.add('overlay-open-light');
        } else {
            document.querySelector("#homepage").classList.add('overlay-open');
        }

        dialog.showModal();
        history.pushState({ dialogId: dialog.id }, ""); // store which dialog is open
        if (dialog.querySelectorAll("iframe")[0]) {
            var vimeoPlayer = new Vimeo.Player(dialog.querySelectorAll("iframe")[0]);
            vimeoPlayer.play();
        }

    }

    function closeDialog(dialog) {
        dialog.close();
        console.log("close dialog")
        if (dialog.querySelectorAll("iframe")[0]) {
            var vimeoPlayer = new Vimeo.Player(dialog.querySelectorAll("iframe")[0]);
            vimeoPlayer.pause();
        }
        document.querySelector("#homepage").classList.remove('overlay-open');
        document.querySelector("#homepage").classList.remove('overlay-open-light');
    }

    const minderOpenEl = document.getElementById("minders-open");
    if (minderOpenEl) {
        minderOpenEl.addEventListener("click", () => {
            console.log("clicked minders")
            openDialog(document.getElementById("minders-overlay"));
        });
    }

    const usageOpenEl = document.getElementById("usage-open");
    if (usageOpenEl) {
        usageOpenEl.addEventListener("click", () => {
            console.log("clicked usage")
            openDialog(document.getElementById("usage-overlay"));
        });
    }

    const clingOpenEl = document.getElementById("cling-open");
    if (clingOpenEl) {
        clingOpenEl.addEventListener("click", () => {
            console.log("clicked cling")
            openDialog(document.getElementById("cling-overlay"));
        });
    }

    const dosOpenEl = document.getElementById("dos-open");
    if (dosOpenEl) {
        dosOpenEl.addEventListener("click", () => {
            console.log("clicked dos")
            openDialog(document.getElementById("dos-overlay"));
        });
    }

    let gnawImgs = document.querySelectorAll(".floating-img");
    gnawImgs.forEach((gnawImg) => {
        gnawImg.addEventListener("click", () => {
            const gnawMain = document.getElementById("gnaw-main");
            if (gnawMain) {
                gnawMain.setAttribute('src', gnawImg.getAttribute('src'));
            }
            console.log("clicked gnaw")
            openDialog(document.getElementById("gnaw-overlay"), "light");
        });
    });
    
    // Close buttons
    let closeBtns = document.querySelectorAll(".close-btn")

    closeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            closeDialog(btn.closest("dialog"));
        });
    });
    let gnawOverlay = document.getElementById("gnaw-overlay");
    if (gnawOverlay) {
        gnawOverlay.addEventListener('click', function (event) {
            console.log("clicked outside dialog")
            closeDialog(gnawOverlay);
        });
    }
    // Handle back/forward navigation
    window.addEventListener("popstate", (event) => {
        const openStates = Array.from(dialogs).filter(d => d.open);

        if (event.state && event.state.dialogId) {
            const dlg = document.getElementById(event.state.dialogId);
            if (!dlg.open) dlg.openDialog();
        } else if (openStates.length) {
            closeDialog(openStates[openStates.length - 1]);
        }
    });
    //End overlay
});