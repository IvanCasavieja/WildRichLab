// Cargar galería
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const gallery = document.querySelector('.gallery-grid');
    gallery.innerHTML = '';
    data.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('gallery-item');
      div.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="gallery-info"><h3>${item.title}</h3></div>
      `;
      div.addEventListener('click', () => {
        if (item.url !== "#") openEditor(item);
        else alert('Pronto disponible.');
      });
      gallery.appendChild(div);
    });
  });

// Abrir editor
let currentItem = null;
function openEditor(item) {
    currentItem = item;
    document.querySelector('.gallery').classList.add('hidden');
    const viewer = document.getElementById('viewer');
    viewer.classList.remove('hidden');
    document.getElementById('viewer-title').innerText = item.title;
    const iframe = document.getElementById('viewer-frame');
    iframe.src = `${item.url}/${item.files.html}`;
    iframe.onload = () => buildEditor(iframe.contentDocument);

    // Mostrar/ocultar botón de plantillas
    const downloadAssetsBtn = document.getElementById('download-assets');
    if (item.requiredFiles && item.requiredFiles.length > 0) {
        downloadAssetsBtn.classList.remove('hidden');
    } else {
        downloadAssetsBtn.classList.add('hidden');
    }
}

// Construir panel dinámico
function buildEditor(doc) {
    const panel = document.getElementById('editor-fields');
    panel.innerHTML = '';

    const createField = (label, content, wrapperClass = '') => {
        const field = document.createElement('div');
        field.classList.add('editor-field');
        if (wrapperClass) field.classList.add(wrapperClass);
        field.innerHTML = `<label>${label}</label>`;
        field.appendChild(content);
        return field;
    };

    const sortByPosition = (elements) => {
        return Array.from(elements).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    };

    // === TEXTOS & BOTONES ===
    const textEls = sortByPosition(doc.querySelectorAll('h1,h2,h3,p,span,a,button,input[type="button"],input[type="submit"]'));
    textEls.forEach((el, idx) => {
        const isButton = el.tagName.toLowerCase() === 'button' || 
                         (el.tagName.toLowerCase() === 'input' && ['button','submit'].includes(el.type));

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = el.innerText || el.value || '';
        textInput.addEventListener('input', e => {
            if (el.tagName.toLowerCase() === 'input') el.value = e.target.value;
            else el.innerText = e.target.value;
        });
        panel.appendChild(createField(`Texto ${idx + 1} (${el.tagName.toLowerCase()})`, textInput));

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = rgbToHex(window.getComputedStyle(el).color);
        colorInput.addEventListener('input', e => el.style.color = e.target.value);
        panel.appendChild(createField(`Color texto ${idx + 1}`, colorInput));

        const fontSelect = document.createElement('select');
        ["Arial","Verdana","Georgia","Courier New"].forEach(font => {
            const opt = document.createElement('option');
            opt.value = font;
            opt.textContent = font;
            if (getComputedStyle(el).fontFamily.includes(font)) opt.selected = true;
            fontSelect.appendChild(opt);
        });
        fontSelect.addEventListener('change', e => el.style.fontFamily = e.target.value);
        panel.appendChild(createField(`Tipografía texto ${idx + 1}`, fontSelect));

        if (isButton) {
            const buttonBgField = createGradientField(el, `Fondo botón ${idx + 1}`);
            panel.appendChild(buttonBgField);
        }
    });

    // === IMÁGENES (sin duplicados) ===
    const imgEls = sortByPosition(doc.querySelectorAll('img'));
    const uniqueImages = new Map();
    imgEls.forEach(img => {
        const src = img.src;
        if (!uniqueImages.has(src)) uniqueImages.set(src, []);
        uniqueImages.get(src).push(img);
    });

    let imgIndex = 1;
    uniqueImages.forEach((group) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = ev => group.forEach(img => {
                img.removeAttribute('width');
                img.removeAttribute('height');
                img.style.width = '';
                img.style.height = '';
                img.src = ev.target.result;
                img.dataset.filename = file.name;
            });
            reader.readAsDataURL(file);
        });
        panel.appendChild(createField(`Imagen ${imgIndex++}`, fileInput));
    });

    // === SLIDERS ===
    const usedAsContainer = new Set();
    const inputEls = sortByPosition(doc.querySelectorAll('input[type="range"]'));
    inputEls.forEach((inp, idx) => {
        const sliderGroup = document.createElement('div');
        sliderGroup.classList.add('slider-group');

        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.min = inp.min || 0;
        rangeInput.max = inp.max || 100;
        rangeInput.value = inp.value;
        rangeInput.addEventListener('input', e => inp.value = e.target.value);
        sliderGroup.appendChild(createField(`Slider ${idx + 1} (valor)`, rangeInput));

        const trackField = createGradientField(inp, `Pista slider ${idx + 1}`, true);
        sliderGroup.appendChild(trackField);

        if (inp.parentElement) {
            const containerField = createGradientField(inp.parentElement, `Contenedor slider ${idx + 1}`);
            sliderGroup.appendChild(containerField);
            usedAsContainer.add(inp.parentElement);
        }

        panel.appendChild(sliderGroup);
    });

    // === FONDOS ===
    const bgEls = sortByPosition(doc.querySelectorAll('body,section,div[class*="container"],header,footer'));
    bgEls.forEach((el, idx) => {
        if (!usedAsContainer.has(el)) {
            panel.appendChild(createGradientField(el, `Fondo ${idx + 1} (${el.tagName.toLowerCase()})`));
        }
    });
}

// === Campo de degradado reutilizable ===
function createGradientField(el, label, isSliderTrack = false) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('editor-field');
    wrapper.innerHTML = `<label>${label}</label>`;

    const modeSelect = document.createElement('select');
    modeSelect.innerHTML = `
        <option value="solid">Color sólido</option>
        <option value="gradient">Degradado</option>
    `;
    wrapper.appendChild(modeSelect);

    const solidColor = document.createElement('input');
    solidColor.type = 'color';
    solidColor.value = rgbToHex(window.getComputedStyle(el).backgroundColor);
    wrapper.appendChild(solidColor);

    const gradientContainer = document.createElement('div');
    gradientContainer.style.display = 'none';
    gradientContainer.innerHTML = `
        <label>Color 1</label>
        <input type="color" value="#ff0000">
        <label>Color 2</label>
        <input type="color" value="#0000ff">
        <label>Dirección</label>
        <select>
            <option value="to right">Horizontal</option>
            <option value="to bottom">Vertical</option>
            <option value="45deg">Diagonal</option>
        </select>
    `;
    wrapper.appendChild(gradientContainer);

    const [gradColor1, gradColor2, gradDir] = gradientContainer.querySelectorAll('input, select');

    const applyGradient = () => {
        const gradient = `linear-gradient(${gradDir.value}, ${gradColor1.value}, ${gradColor2.value})`;
        if (isSliderTrack) {
            const styleEl = el.ownerDocument.getElementById('dynamic-slider-style') || (() => {
                const s = el.ownerDocument.createElement('style');
                s.id = 'dynamic-slider-style';
                el.ownerDocument.head.appendChild(s);
                return s;
            })();
            styleEl.innerHTML = `
                input[type="range"]::-webkit-slider-runnable-track { background: ${gradient} !important; }
                input[type="range"]::-moz-range-track { background: ${gradient} !important; }
            `;
        } else {
            el.style.background = gradient;
        }
    };

    modeSelect.addEventListener('change', e => {
        if (e.target.value === "solid") {
            gradientContainer.style.display = 'none';
            el.style.background = solidColor.value;
        } else {
            gradientContainer.style.display = 'block';
            applyGradient();
        }
    });

    [gradColor1, gradColor2, gradDir].forEach(input => input.addEventListener('input', applyGradient));
    solidColor.addEventListener('input', () => { if (modeSelect.value === "solid") el.style.background = solidColor.value; });

    return wrapper;
}

// Descargar plantillas
document.getElementById('download-assets').addEventListener('click', () => {
    if (!currentItem || !currentItem.requiredFiles || currentItem.requiredFiles.length === 0) return;
    currentItem.requiredFiles.forEach(file => {
        const link = document.createElement('a');
        link.href = file;
        link.download = file.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Descargar ZIP completo
document.getElementById('download-zip').addEventListener('click', async () => {
    const iframe = document.getElementById('viewer-frame');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    if (!iframeDoc) {
        alert("No se pudo acceder al contenido del iframe.");
        return;
    }

    const zip = new JSZip();
    const assetsFolder = zip.folder("assets");

    // Guardar imágenes
    const imgs = iframeDoc.querySelectorAll('img');
    for (let img of imgs) {
        try {
            const dataUrl = img.src;
            const filename = img.dataset.filename || ("image_" + Date.now() + ".png");
            const base64Data = dataUrl.split(',')[1];
            assetsFolder.file(filename, base64ToBlob(base64Data), { base64: true });
            img.src = "assets/" + filename; // actualizar ruta
        } catch (err) {
            console.error("Error procesando imagen:", err);
        }
    }

    // Guardar CSS vinculado
    const cssLinks = iframeDoc.querySelectorAll('link[rel="stylesheet"]');
    for (let link of cssLinks) {
        try {
            const href = link.href;
            const response = await fetch(href);
            const cssContent = await response.text();
            const filename = href.split('/').pop();
            zip.file(filename, cssContent);
            link.href = filename; // actualizar ruta
        } catch (err) {
            console.error("Error descargando CSS:", err);
        }
    }

    // Guardar JS vinculado
    const scripts = iframeDoc.querySelectorAll('script[src]');
    for (let script of scripts) {
        try {
            const src = script.src;
            const response = await fetch(src);
            const jsContent = await response.text();
            const filename = src.split('/').pop();
            zip.file(filename, jsContent);
            script.src = filename; // actualizar ruta
        } catch (err) {
            console.error("Error descargando JS:", err);
        }
    }

    // Guardar HTML actualizado
    const html = iframeDoc.documentElement.outerHTML;
    zip.file("index.html", html);

    // Generar y descargar ZIP
    zip.generateAsync({ type: "blob" }).then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "rich-media.zip";
        link.click();
    });
});

// Volver
document.getElementById('back-to-gallery').addEventListener('click', () => {
    document.querySelector('.gallery').classList.remove('hidden');
    document.getElementById('viewer').classList.add('hidden');
    document.getElementById('viewer-frame').src = '';
});

// Helpers
function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g).map(x => parseInt(x).toString(16).padStart(2, '0'));
    return `#${result.join('')}`;
}
function base64ToBlob(base64) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: 'image/png' });
}
