const slides = document.querySelectorAll('.slide');
const slider = document.getElementById('form-slider');
const recommendation = document.getElementById('recommendation');
const ctaBtn = document.getElementById('cta-btn');

let currentSlide = 0;
let answers = {
    energia: '',
    cuidado: '',
    sueno: '',
    productos: ''
};

// --- Inicialización de Enabler ---
function enablerInitHandler() {
    if (typeof Enabler !== "undefined") {
        console.log("Enabler listo para tracking");
    }
}
if (typeof Enabler !== "undefined") {
    if (Enabler.isInitialized()) enablerInitHandler();
    else Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
}

function nextSlide() {
    currentSlide++;
    slider.style.transform = `translateX(-${currentSlide * (100 / slides.length)}%)`;
}

// Asignar respuestas y avanzar
document.querySelectorAll('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;

        // Guardar respuesta según slide actual
        if (currentSlide === 0) {
            answers.energia = value;
            if (typeof Enabler !== "undefined") Enabler.counter('Pregunta1_Contestada');
        }
        if (currentSlide === 1) {
            answers.cuidado = value;
            if (typeof Enabler !== "undefined") Enabler.counter('Pregunta2_Contestada');
        }
        if (currentSlide === 2) {
            answers.sueno = value;
            if (typeof Enabler !== "undefined") Enabler.counter('Pregunta3_Contestada');
        }
        if (currentSlide === 3) {
            answers.productos = value;
            if (typeof Enabler !== "undefined") Enabler.counter('Pregunta4_Contestada');
        }

        // Si es la última pregunta, generar recomendación y evento de finalización
        if (currentSlide === 3) {
            let mensaje = "Te recomendamos explorar productos enfocados en ";
            if (answers.productos === "vitaminas") mensaje += "vitaminas y suplementos para mejorar tu energía.";
            if (answers.productos === "belleza") mensaje += "cuidado personal y belleza para tu rutina diaria.";
            if (answers.productos === "bienestar") mensaje += "bienestar y relajación para mejorar tu calidad de vida.";
            recommendation.textContent = mensaje;

            if (typeof Enabler !== "undefined") Enabler.counter('Formulario_Completado');
        }

        nextSlide();
    });
});

// CTA: Ir a la web
ctaBtn.addEventListener('click', () => {
    if (typeof Enabler !== "undefined") Enabler.exit('Click_CTA_Explorar');
    window.open("https://www.farmashop.com.uy/", "_blank");
});
