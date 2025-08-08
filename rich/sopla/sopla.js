const balloon = document.getElementById('balloon');
const message = document.getElementById('message');
const title = document.getElementById('title');
const testBtn = document.getElementById('test-btn');

let size = 100;
const maxSize = 300;
let lastInflate = 0;
let blowStart = 0;

async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        function detectBlow() {
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            let volume = sum / bufferLength;

            let total = dataArray.reduce((a, b) => a + b, 0) || 1;
            let entropy = 0;
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > 0) {
                    let p = dataArray[i] / total;
                    entropy -= p * Math.log2(p);
                }
            }

            message.textContent = `Volumen: ${volume.toFixed(1)} | Entropía: ${entropy.toFixed(2)}`;

            const now = Date.now();
            const isBlow = volume > 120 && entropy > 5.5;

            if (isBlow) {
                if (blowStart === 0) blowStart = now;
                if (now - blowStart > 200 && now - lastInflate > 300) {
                    inflateBalloon();
                    lastInflate = now;
                }
            } else {
                blowStart = 0;
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    } catch (err) {
        message.textContent = "Necesitas permitir el micrófono para jugar.";
    }
}

function inflateBalloon() {
    size += 10;
    balloon.style.width = size + "px";
    balloon.style.height = size * 1.3 + "px";

    if (size >= maxSize) explodeBalloon();
}

function explodeBalloon() {
    if (typeof Enabler !== "undefined") {
        Enabler.counter('GloboInfladoCompletamente');
        console.log("Evento registrado: GloboInfladoCompletamente");
    }

    createExplosionParticles(balloon.offsetLeft + balloon.offsetWidth / 2, balloon.offsetTop + balloon.offsetHeight / 2);

    balloon.style.display = "none";
    message.style.display = "none";
    testBtn.style.display = "none";

    title.textContent = "¡Felicidades por ganar!";
    title.style.color = "#28a745";
    title.style.fontSize = "3rem";
    title.style.marginTop = "20px";
    title.style.animation = "bounce 0.8s ease";
    title.style.display = "block";
}

// Crear partículas de explosión
function createExplosionParticles(x, y) {
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.background = getRandomColor();
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 150 + 50;
        const finalX = x + distance * Math.cos(angle);
        const finalY = y + distance * Math.sin(angle);

        particle.animate([
            { transform: `translate(0,0)`, opacity: 1 },
            { transform: `translate(${finalX - x}px, ${finalY - y}px)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'ease-out',
            fill: 'forwards'
        });

        setTimeout(() => particle.remove(), 1500);
    }
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

initMic();

/* ==== TRACKING CON ENABLER ==== */
let primeraInteraccion = false;
function enablerInitHandler() {
    const originalInflate = inflateBalloon;
    inflateBalloon = function () {
        if (!primeraInteraccion) {
            primeraInteraccion = true;
            if (typeof Enabler !== "undefined") {
                Enabler.counter('PrimerSoplido');
                console.log("Evento registrado: PrimerSoplido");
            }
        }
        originalInflate();
    };
}
if (typeof Enabler !== "undefined") {
    if (Enabler.isInitialized()) enablerInitHandler();
    else Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
}

/* ==== BOTÓN PROBAR SIN SOPLAR ==== */
testBtn.addEventListener('click', () => {
    size = maxSize;
    explodeBalloon();
    console.log("Explosión forzada por botón de prueba");
});
