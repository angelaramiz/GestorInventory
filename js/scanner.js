// Importaciones
import { buscarProducto, buscarProductoParaEditar, buscarProductoInventario } from './product-operations.js';

// Variables globales
let scanner = null;
let escanerActivo = false;
let audioContext;

// Crear elementos para la superposición visual
const scannerOverlay = document.createElement('div');
scannerOverlay.id = 'scanner-overlay';
scannerOverlay.innerHTML = `
    <div class="scanner-area"></div>
    <div class="scanner-line"></div>
    <div id="scanner-ready-indicator"></div>
`;

// Agregar estilos
const style = document.createElement('style');
style.textContent = `
    #scanner-container {
        position: relative;
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
        overflow: hidden;
    }
    #reader {
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 4/3;
    }
    #reader video {
        width: 100% !important;
        height: auto !important;
    }
    #scanner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }
    .scanner-area {
        position: absolute;
        top: 20%;
        left: 20%;
        width: 60%;
        height: 60%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }
    .scanner-line {
        position: absolute;
        left: 20%;
        width: 60%;
        height: 2px;
        background-color: #00ff00;
        animation: scan 2s linear infinite;
    }
    @keyframes scan {
        0% { top: 20%; }
        50% { top: 80%; }
        100% { top: 20%; }
    }
    #scanner-ready-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: red;
        transition: background-color 0.3s ease;
    }
    #cerrarEscaner {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
    }
    /* Ocultar elementos innecesarios de html5-qrcode */
    .html5-qrcode-element {
        display: none !important;
    }
`;

// Función para inicializar el escáner
export function inicializarEscaner() {
    const scannerContainer = document.getElementById("scanner-container");
    if (!scannerContainer) {
        console.error('No se encontró el contenedor del escáner');
        return;
    }
    console.log('Escáner inicializado');
}

// Función para cambiar el indicador de "listo para escanear"
function setScannerReady(isReady) {
    const indicator = document.getElementById('scanner-ready-indicator');
    if (indicator) {
        indicator.style.backgroundColor = isReady ? 'green' : 'red';
    }
}

// Función para reproducir un tono
function playTone(frequency, duration, type = 'sine') {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 0.01);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Función para toggle del escáner
export function toggleEscaner(inputId) {
    console.log('Toggle escáner para:', inputId);
    if (escanerActivo) {
        detenerEscaner();
    } else {
        iniciarEscaneo(inputId);
    }
}

// Función para detener el escáner
export function detenerEscaner() {
    if (scanner) {
        scanner.stop().then(() => {
            scanner.clear();
            scanner = null;
            document.getElementById("scanner-container").style.display = "none";
            escanerActivo = false;
            console.log('Escáner detenido');
        }).catch((err) => {
            console.error("Error al detener el escáner:", err);
        });
    }
}

// Función para iniciar el escaneo
// Función para iniciar el escaneo con configuración mejorada
export function iniciarEscaneo(inputId) {
    try {
        const scannerContainer = document.getElementById("scanner-container");
        scannerContainer.style.display = "block";
        
        scanner = new Html5Qrcode("reader");

        scanner.start(
            { facingMode: "environment" },
            {fps: 20,
            qrbox: { width: 250, height: 200 }},
            (decodedText) => {
                console.log("Código detectado:", decodedText);
                console.log(inputId)
                document.getElementById(inputId).value = decodedText;
                detenerEscaner();
                
                // Notificar al usuario
                Swal.fire({
                    title: "Éxito",
                    text: "Código detectado: " + decodedText,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Lógica existente para diferentes páginas
                if (inputId === "codigoConsulta") {
                  buscarProducto();
                } else if (inputId === "codigoEditar") {
                  buscarProductoParaEditar();
                } else if (inputId === "codigo") {
                  buscarProductoInventario();
                }
            },
            (error) => {
                console.log("Error de escaneo:", error);
            }
        ).catch((err) => {
            console.error("Error al iniciar el escáner:", err);
            Swal.fire({
                title: "Error",
                text: "Error al iniciar el escáner. Verifica los permisos de la cámara.",
                icon: "error"
            });
        });

        escanerActivo = true;
    } catch (error) {
        console.error("Error en iniciarEscaneo:", error);
    }
}
