const fill = document.getElementById("fill");
const sliderContainer = document.getElementById("slider");
const bannerDescuentoWrapper = document.querySelector(".banner-descuento-wrapper");
let dragging = false;

function updateBrightness(y) {
    let rect = sliderContainer.getBoundingClientRect();
    let relativeY = rect.bottom - y;
    relativeY = Math.max(0, Math.min(relativeY, sliderContainer.clientHeight));
    let brightness = Math.round((relativeY / sliderContainer.clientHeight) * 100);

    fill.style.height = brightness + "%";
    bannerDescuentoWrapper.style.opacity = brightness / 100;
}

sliderContainer.addEventListener("mousedown", (e) => { updateBrightness(e.clientY); dragging = true; });
sliderContainer.addEventListener("mousemove", (e) => { if (!dragging) return; updateBrightness(e.clientY); });
window.addEventListener("mouseup", () => dragging = false);
sliderContainer.addEventListener("touchstart", (e) => { updateBrightness(e.touches[0].clientY); dragging = true; });
sliderContainer.addEventListener("touchmove", (e) => { if (!dragging) return; updateBrightness(e.touches[0].clientY); });
window.addEventListener("touchend", () => dragging = false);

/* ==== TRACKING CON ENABLER ==== */
let brilloInteraccionRegistrada = false;

function enablerInitHandler() {
    function registrarInteraccion() {
        if (!brilloInteraccionRegistrada) {
            brilloInteraccionRegistrada = true;
            if (typeof Enabler !== "undefined") {
                Enabler.counter('InteraccionControlBrillo');
                console.log("Evento registrado: InteraccionControlBrillo");
            }
        }
    }

    // Detectar el primer clic o toque
    sliderContainer.addEventListener("mousedown", registrarInteraccion, { once: true });
    sliderContainer.addEventListener("touchstart", registrarInteraccion, { once: true });
}

if (typeof Enabler !== "undefined") {
    if (Enabler.isInitialized()) enablerInitHandler();
    else Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
}
