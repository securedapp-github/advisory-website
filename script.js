document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Custom Cursor Logic ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        // Outline follows with slight delay (handled by CSS transition usually, but JS for position)
        if (cursorOutline) {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        }
    });

    // Hover effects for cursor
    const interactiveElements = document.querySelectorAll('a, button, input, label');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });


    // --- 2. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    // --- 3. Intersection Observer (Fade In) ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Optional: Keep watching or not
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-on-scroll').forEach(el => observer.observe(el));


    // --- 4. Three.js Background (Subtle Particles) ---
    initThreeBackground();


    // --- 5. Security Wizard Logic ---
    initWizard();

});


// --- Three.js Implementation ---
function initThreeBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // PARTICLES
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 700; // Minimal but present

    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        // Spread particles
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x00FF88, // Neon Green
        transparent: true,
        opacity: 0.6,
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // MOUSE INTERACTION
    let mouseX = 0;
    let mouseY = 0;

    // ANIMATION LOOP
    const animate = () => {
        requestAnimationFrame(animate);

        // Gentle rotation
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;

        renderer.render(scene, camera);
    };

    animate();

    // RESIZE
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}


// --- Wizard Logic ---
function initWizard() {
    const startBtn = document.getElementById('start-quiz-btn');
    const wizardContainer = document.getElementById('quiz-wizard-container');
    const wizardForm = document.getElementById('security-quiz-wizard');
    const wizardResult = document.getElementById('wizard-result');

    // Controls
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const finishBtn = document.getElementById('finish-btn');
    const errorMsg = document.getElementById('wizard-error');

    // Steps
    const steps = document.querySelectorAll('.wizard-step');
    const progressBar = document.getElementById('wizard-progress');
    const stepCountDisplay = document.getElementById('step-count');

    let currentStep = 1;
    const totalSteps = 5;

    // Start
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            wizardContainer.style.display = 'flex'; // Show card
            // Hide start button area or just scroll? 
            // UX: Let's scroll slightly
            wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Helper: Update UI
    function updateUI() {
        // Steps
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Progress
        const percent = (currentStep / totalSteps) * 100;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (stepCountDisplay) stepCountDisplay.textContent = `Question ${currentStep}/${totalSteps}`;

        // Buttons
        if (prevBtn) prevBtn.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (finishBtn) finishBtn.style.display = 'inline-block';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (finishBtn) finishBtn.style.display = 'none';
        }

        if (errorMsg) errorMsg.textContent = '';
    }

    // Helper: Check Answer
    function isAnswered(step) {
        const radios = document.getElementsByName(`q${step}`);
        for (let r of radios) {
            if (r.checked) return true;
        }
        return false;
    }

    // Next Click
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!isAnswered(currentStep)) {
                errorMsg.textContent = "Please select an option.";
                return;
            }
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            }
        });
    }

    // Prev Click
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    }

    // Finish Click
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            if (!isAnswered(currentStep)) {
                errorMsg.textContent = "Please select an option.";
                return;
            }

            calculateAndShowResult();
        });
    }

    function calculateAndShowResult() {
        let score = 0;
        // tally up
        for (let i = 1; i <= 5; i++) {
            const radios = document.getElementsByName(`q${i}`);
            for (let r of radios) {
                if (r.checked) score += parseInt(r.value);
            }
        }

        // Max 10. Percentage.
        const percentage = Math.round((score / 10) * 100);

        // Hide Form, Show Result
        wizardForm.style.display = 'none';
        wizardResult.style.display = 'flex';
        wizardResult.classList.remove('hidden');

        // Animate Count Up
        animateValue("score-text-final", 0, percentage, 1500);

        // Smart Suggestion Logic
        const recBox = document.getElementById('final-recommendation');
        if (recBox) {
            if (percentage >= 80) {
                recBox.innerHTML = "Strong foundation. <br>A 30-minute advisory ensures you're resilient at scale.";
                recBox.style.borderLeftColor = "#00FF88"; // Neon
            } else if (percentage >= 50) {
                recBox.innerHTML = "Some critical gaps may exist. <br>Clarity now prevents costly fixes later.";
                recBox.style.borderLeftColor = "#FFD700"; // Gold
            } else {
                recBox.innerHTML = "High-risk exposure. <br>Expert guidance is strongly recommended.";
                recBox.style.borderLeftColor = "#FF4D4D"; // Red
            }
        }
    }

    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}
