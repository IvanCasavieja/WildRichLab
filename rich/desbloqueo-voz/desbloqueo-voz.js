const startBtn = document.getElementById('start-btn');
const testBtn = document.getElementById('test-btn');
const statusText = document.getElementById('status-text');
const lockImg = document.getElementById('lock-img');
const keyImg = document.getElementById('key-img');
const tapadorImg = document.getElementById('tapador-img');
const discountContainer = document.getElementById('discount-container');
const discountCircle = document.getElementById('discount-circle');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        statusText.textContent = "Escuchando... di 'abrir' o 'desbloquear'.";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        statusText.textContent = `Detectado: "${transcript}"`;

        if (transcript.includes("abrir") || transcript.includes("desbloquear")) {
            animateUnlock();
        } else {
            statusText.textContent = "No entendí, intenta otra vez.";
        }
    };

    recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
            statusText.textContent = "Acceso al micrófono denegado.";
        } else {
            statusText.textContent = "Error: " + event.error;
        }
    };
} else {
    startBtn.disabled = true;
    statusText.textContent = "Tu navegador no soporta reconocimiento de voz.";
}

startBtn.addEventListener('click', () => {
    if (recognition) recognition.start();
});

testBtn.addEventListener('click', () => {
    statusText.textContent = "¡Probando desbloqueo!";
    animateUnlock();
});

function animateUnlock() {
    // 1. Entrada controlada de la llave
    setTimeout(() => {
        keyImg.style.transition = "left 1s ease, opacity 1s ease";
        keyImg.style.left = "-90px";
        keyImg.style.opacity = 1;
    }, 100);

    // 2. Vibrar el candado
    setTimeout(() => { lockImg.classList.add('vibrate'); }, 1500);

    // 3. Llave desaparece
    setTimeout(() => { keyImg.style.opacity = 0; }, 2500);

    // 4. Tapador desaparece
    setTimeout(() => { tapadorImg.style.opacity = 0; }, 3000);

    // 5. Candado abierto + confeti + TRACKING
    setTimeout(() => {
        lockImg.src = "candado-abierto.png";
        statusText.textContent = "¡Candado abierto!";
        launchConfetti();
        if (typeof Enabler !== "undefined") {
            Enabler.counter('CandadoDesbloqueado');
            console.log("Evento registrado: CandadoDesbloqueado");
        }
    }, 3100);

    // 6. Candado desaparece
    setTimeout(() => { lockImg.style.opacity = 0; }, 3500);

    // 7. Ocultar todo el contenido
    setTimeout(() => {
        document.querySelector('h2').style.display = "none";
        document.querySelector('.lock-container').style.display = "none";
        startBtn.style.display = "none";
        testBtn.style.display = "none";
        statusText.style.display = "none";
    },3600);

    // 8. Mostrar el descuento con efecto bounce
    setTimeout(() => {
        discountContainer.style.display = "flex";
        discountContainer.classList.add('show');
        discountCircle.classList.add('show');
        discountCircle.style.animation = "bounce 0.6s ease";
    }, 3700);
}

/* ---- Confeti ---- */
let confettis = [];

function launchConfetti() {
    resizeCanvas();
    for (let i = 0; i < 150; i++) {
        confettis.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight - window.innerHeight,
            w: 10,
            h: 20,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speed: Math.random() * 3 + 2
        });
    }
    requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettis.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        c.y += c.speed;
    });
    confettis = confettis.filter(c => c.y < window.innerHeight);
    if (confettis.length > 0) requestAnimationFrame(drawConfetti);
}

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

/* ==== CLICKTHROUGH EN DESCUENTO ==== */
discountCircle.addEventListener('click', () => {
    if (typeof Enabler !== "undefined") {
        Enabler.exit('ClickThrough');
        console.log("Evento registrado: ClickThrough");
    } else {
        window.location.href = "https://tu-landing.com";
    }
});
