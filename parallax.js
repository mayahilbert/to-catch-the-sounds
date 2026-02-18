 // Parallax scrolling effect
                let lastScrollY = window.scrollY;
                let ticking = false;

                const backgroundImage = document.querySelector('body');
                const column1 = document.querySelector('.column-1');
                const column2 = document.querySelector('.column-2');

                function updateParallax() {
                    const scrollY = window.scrollY;

                    // Background scrolls 2x faster (moves up faster, revealing more of image)
                    var yOffset = window.scrollY * 1.5;

                    backgroundImage.style.backgroundPosition = '0 ' + -yOffset + 'px, 0 ' + (-yOffset * 0.5) + 'px';
                    // Column 1 scrolls slower (0.8x) - negative value to slow it down
                    column1.style.transform = `translateY(${scrollY * -0.2}px)`;

                    // Column 2 scrolls even slower (0.6x)
                    column2.style.transform = `translateY(${scrollY * -0.4}px)`;

                    ticking = false;
                }

                function onScroll() {
                    lastScrollY = window.scrollY;

                    if (!ticking) {
                        window.requestAnimationFrame(updateParallax);
                        ticking = true;
                    }
                }

                window.addEventListener('scroll', onScroll, { passive: true });

                // Initial call
                updateParallax();