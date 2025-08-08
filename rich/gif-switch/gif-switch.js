const previewImg = document.getElementById('preview-img');
const switchBtn = document.getElementById('switch-btn');
const gifContainer = document.getElementById('loading-container');
const finalImg = document.getElementById('final-img');
const finalBtn = document.getElementById('final-btn');

switchBtn.addEventListener('click', () => {
    // Ocultar imagen inicial y botón
    previewImg.classList.add('hidden');
    switchBtn.classList.add('hidden');

    // Mostrar el GIF y mensaje
    gifContainer.classList.remove('hidden');

    // Después de 3 segundos, mostrar la imagen final y el botón
    setTimeout(() => {
        gifContainer.classList.add('hidden');
        finalImg.classList.remove('hidden');
        finalBtn.style.display = 'inline-block'; // Mostrar botón final
    }, 3000);
});

// Acción del botón final
finalBtn.addEventListener('click', () => {
    alert("Redirigidooooooo");
    // window.location.href = "https://tu-beneficio.com"; // Ejemplo de redirección
});

/* ==== TRACKING CON ENABLER ==== */
function enablerInitHandler() {
    // Interacción inicial
    switchBtn.addEventListener('click', () => {
        if (typeof Enabler !== "undefined") {
            Enabler.counter('InteraccionInicial');
            console.log("Evento registrado: InteraccionInicial");
        }
    });

    // Animación completada
    const originalSetTimeout = setTimeout;
    setTimeout(() => {
        if (typeof Enabler !== "undefined") {
            Enabler.counter('AnimacionCompletada');
            console.log("Evento registrado: AnimacionCompletada");
        }
    }, 3000);

    // ClickThrough
    finalBtn.addEventListener('click', () => {
        if (typeof Enabler !== "undefined") {
            Enabler.exit('ClickThrough');
            console.log("Evento registrado: ClickThrough");
        }
    });
}

if (typeof Enabler !== "undefined") {
    if (Enabler.isInitialized()) enablerInitHandler();
    else Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
}
