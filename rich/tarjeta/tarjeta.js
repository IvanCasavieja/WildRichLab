// Referencias DOM
const slider = document.getElementById('slider');
const monto = document.getElementById('monto');
const container = document.querySelector('.ad-container');

// Flags de interacción
let sliderInteraccion = false;

// Evento de movimiento del slider
slider.addEventListener('input', () => {
    const valor = slider.value;
    monto.textContent = `$${valor},000`;

    // Registrar primera interacción con el slider
    if (!sliderInteraccion) {
        sliderInteraccion = true;
        if (typeof Enabler !== "undefined") {
            Enabler.counter('SliderInteraccion');
            console.log("Evento registrado: SliderInteraccion");
        }
    }

    // Si llega al máximo, lanzar dinero + tracking
    if (valor == 200) {
        lanzarDinero();
        if (typeof Enabler !== "undefined") {
            Enabler.counter('SliderMaximo');
            console.log("Evento registrado: SliderMaximo");
        }
    }
});

// Función para lanzar el dinero
function lanzarDinero() {
    for (let i = 0; i < 30; i++) {
        let money = document.createElement('div');
        money.className = 'money';
        money.style.left = Math.random() * (container.clientWidth - 60) + 'px';
        money.style.top = -80 + 'px';
        let duracion = 1.5 + Math.random() * 1.5;
        money.style.animation = `fall ${duracion}s linear forwards`;
        container.appendChild(money);
        setTimeout(() => money.remove(), duracion * 1000);
    }
}

// ClickThrough en la tarjeta
document.querySelector('.tarjeta').addEventListener('click', () => {
    if (typeof Enabler !== "undefined") {
        Enabler.exit('ClickThrough');
        console.log("Evento registrado: ClickThrough");
    } else {
        window.location.href = "https://tu-landing.com"; // URL alternativa en local
    }
});
