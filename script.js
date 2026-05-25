/* =============================================================
       SCRIPT — all JS inlined
       ============================================================= */

    (function () {
        'use strict';

        /* ----------------------------------------------------------
           THEME TOGGLE
           Saves choice to localStorage
        ---------------------------------------------------------- */
        const THEME_KEY = 'cosmic-bloom-theme';
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');

        function applyTheme(theme) {
            body.setAttribute('data-theme', theme);
            localStorage.setItem(THEME_KEY, theme);
            themeBtn.textContent = theme === 'day' ? 'Toggle Lunar Cycle' : 'Toggle Solar Cycle';
        }

        applyTheme(localStorage.getItem(THEME_KEY) || 'day');

        themeBtn.addEventListener('click', () => {
            applyTheme(body.getAttribute('data-theme') === 'day' ? 'night' : 'day');
        });

        /* ----------------------------------------------------------
           PRE-LOADER
           Fades out after all assets load OR minimum 1s, whichever
           is later. Prevents flicker.
        ---------------------------------------------------------- */
        const preloader = document.getElementById('preloader');
        let assetsReady = false;
        let timerReady  = false;

        function tryHidePreloader() {
            if (assetsReady && timerReady) {
                preloader.classList.add('fade-out');
                // Remove from DOM after transition so it doesn't block tabbing
                preloader.addEventListener('transitionend', () => {
                    preloader.remove();
                }, { once: true });
            }
        }

        setTimeout(() => { timerReady = true; tryHidePreloader(); }, 1200);

        if (document.readyState === 'complete') {
            assetsReady = true;
            tryHidePreloader();
        } else {
            window.addEventListener('load', () => { assetsReady = true; tryHidePreloader(); });
        }

        /* ----------------------------------------------------------
           CUSTOM CURSOR
           FIX: Uses requestAnimationFrame for smooth 60fps tracking
           Skipped on touch/no-hover devices via CSS media query
        ---------------------------------------------------------- */
        const cursor = document.getElementById('custom-cursor');
        let mouseX = -100, mouseY = -100;
        let cursorX = -100, cursorY = -100;

        // Only activate if device supports hover (not touchscreen)
        const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        if (supportsHover) {
            document.addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            // Smooth following via lerp in RAF
            function animateCursor() {
                cursorX += (mouseX - cursorX) * 0.18;
                cursorY += (mouseY - cursorY) * 0.18;
                cursor.style.left = cursorX + 'px';
                cursor.style.top  = cursorY + 'px';
                requestAnimationFrame(animateCursor);
            }
            requestAnimationFrame(animateCursor);

            // Hover state on interactive elements
            const interactives = 'a, button, input, textarea, .service-card, .skills-list li';
            document.querySelectorAll(interactives).forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });

            // Click burst
            document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
            document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
        } else {
            cursor.style.display = 'none';
        }

        /* ----------------------------------------------------------
           SCROLL REVEAL
           FIX: Initial hidden state set in CSS (.reveal-item)
           FIX: .revealed class defined in CSS (opacity:1, transform:none)
           FIX: No random inline transitionDelay from JS
        ---------------------------------------------------------- */
        const revealItems = document.querySelectorAll('.reveal-item');

        // Bail out if IntersectionObserver not available (very old browsers)
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px', threshold: 0.12 });

            revealItems.forEach(item => revealObserver.observe(item));
        } else {
            // Fallback: show all immediately
            revealItems.forEach(item => item.classList.add('revealed'));
        }

        /* ----------------------------------------------------------
           CONTACT FORM — client-side validation + simulated submit
        ---------------------------------------------------------- */
        const contactForm = document.getElementById('contact-form');
        const feedback    = document.getElementById('form-feedback');

        function showError(inputEl, errorEl, msg) {
            inputEl.classList.add('invalid');
            errorEl.textContent = msg;
            errorEl.classList.add('visible');
        }
        function clearError(inputEl, errorEl) {
            inputEl.classList.remove('invalid');
            errorEl.classList.remove('visible');
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // FIX: prevent page reload

            const nameEl    = document.getElementById('name');
            const emailEl   = document.getElementById('email');
            const msgEl     = document.getElementById('message');
            const nameErr   = document.getElementById('name-error');
            const emailErr  = document.getElementById('email-error');
            const msgErr    = document.getElementById('message-error');

            let valid = true;

            // Name validation
            if (!nameEl.value.trim()) {
                showError(nameEl, nameErr, 'Please enter your name.');
                valid = false;
            } else {
                clearError(nameEl, nameErr);
            }

            // Email validation
            if (!emailEl.value.trim()) {
                showError(emailEl, emailErr, 'Please enter your email address.');
                valid = false;
            } else if (!validateEmail(emailEl.value.trim())) {
                showError(emailEl, emailErr, 'Please enter a valid email address.');
                valid = false;
            } else {
                clearError(emailEl, emailErr);
            }

            // Message validation
            if (!msgEl.value.trim()) {
                showError(msgEl, msgErr, 'Please describe your project.');
                valid = false;
            } else {
                clearError(msgEl, msgErr);
            }

            if (!valid) return;

            // Simulate async submission
            const submitBtn = contactForm.querySelector('[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Transmitting…';

            setTimeout(() => {
                // Simulated success (swap to error branch to test error state)
                const success = true;
                feedback.className = success ? 'success' : 'error';
                feedback.textContent = success
                    ? '✦ Your cosmic pulse has been received! I\'ll be in touch soon.'
                    : '✦ Transmission failed. Please try again shortly.';

                if (success) contactForm.reset();

                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Send Cosmic Pulse';

                // Auto-hide feedback after 6s
                setTimeout(() => { feedback.className = ''; feedback.textContent = ''; }, 6000);
            }, 1400);
        });

        // Live field validation (clear errors as user types)
        ['name', 'email', 'message'].forEach(id => {
            const el  = document.getElementById(id);
            const err = document.getElementById(id + '-error');
            if (el && err) {
                el.addEventListener('input', () => clearError(el, err));
            }
        });

        /* ----------------------------------------------------------
           HAMBURGER MENU
        ---------------------------------------------------------- */
        const hamburgerBtn = document.getElementById('hamburger');
        const mobileMenu   = document.getElementById('mobile-menu');

        // Create and append backdrop element
        const backdrop = document.createElement('div');
        backdrop.className = 'menu-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        function openMenu() {
            mobileMenu.classList.add('open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');
            backdrop.classList.add('visible');
            document.body.style.overflow = 'hidden'; // prevent scroll behind
        }

        function closeMenu() {
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
            backdrop.classList.remove('visible');
            document.body.style.overflow = '';
        }

        hamburgerBtn.addEventListener('click', () => {
            const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            isOpen ? closeMenu() : openMenu();
        });

        // Close on backdrop click
        backdrop.addEventListener('click', closeMenu);

        // Close when a nav link is clicked
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && hamburgerBtn.getAttribute('aria-expanded') === 'true') {
                closeMenu();
                hamburgerBtn.focus();
            }
        });

        // Re-register cursor hover on hamburger (added after initial DOM scan)
        if (supportsHover && hamburgerBtn) {
            hamburgerBtn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            hamburgerBtn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        }

    })();