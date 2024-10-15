// Importaciones (mantén las existentes)
import { buscarProducto, buscarProductoParaEditar, buscarProductoInventario } from './product-operations.js';

// Variables globales
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
  #scanner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
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
  #scanner-container {
    position: relative;
  }
  #cerrarEscaner {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
`;

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

// Modificar la función toggleEscaner
export function toggleEscaner(inputId) {
    const scannerContainer = document.getElementById("scanner-container");
    if (escanerActivo) {
        detenerEscaner();
    } else {
        scannerContainer.style.display = "block";
        iniciarEscaneo(inputId);
    }
}

// Nueva función para detener el escáner
export function detenerEscaner() {
    Quagga.stop();
    const scannerContainer = document.getElementById("scanner-container");
    scannerContainer.style.display = "none";
    escanerActivo = false;
}

// Modificar la función iniciarEscaneo
export function iniciarEscaneo(inputId) {
    const scannerContainer = document.getElementById("scanner-container");

    // Asegurarse de que el overlay se añada solo una vez
    if (!document.getElementById('scanner-overlay')) {
        scannerContainer.appendChild(scannerOverlay);
    }

    // Asegurarse de que los estilos se añadan solo una vez
    if (!document.getElementById('scanner-styles')) {
        style.id = 'scanner-styles';
        document.head.appendChild(style);
    }

    Quagga.init(
        {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerContainer,
                constraints: {
                    width: 480,
                    height: 320,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
            }
        },
        function (err) {
            if (err) {
                console.error("Error al iniciar Quagga:", err);
                Swal.fire({
                    title: "Error",
                    text: "Error al iniciar el escáner. Por favor, asegúrese de que su dispositivo tiene una cámara y ha dado los permisos necesarios.",
                    icon: "error",
                    timer: 3000,
                    showConfirmButton: false
                });
                return;
            }
            console.log("Escáner inicializado correctamente");
            Quagga.start();
            escanerActivo = true;
        }
    );

    Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        document.getElementById(inputId).value = code;

        // Reproducir sonido de éxito
        playTone(880, 0.1); // La5, 100ms

        // Vibrar si está soportado
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }

        detenerEscaner();
        Swal.fire({
            title: "Éxito",
            text: "Código de barras detectado: " + code,
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        // Lógica existente para diferentes páginas
        if (inputId === "codigoConsulta") {
            buscarProducto();
        } else if (inputId === "codigoEditar") {
            buscarProductoParaEditar();
        } else if (inputId === "codigoInventario") {
            buscarProductoInventario();
        }
    });

    // Simular la detección de un código potencial
    const readyInterval = setInterval(() => {
        if (escanerActivo) {
            const isReady = Math.random() > 0.5;
            setScannerReady(isReady);
            if (isReady) {
                playTone(440, 0.05); // La4, 50ms - tono corto para indicar que está listo
            }
        } else {
            clearInterval(readyInterval);
        }
    }, 2000);

    // Agregar evento al botón de cerrar
    const cerrarEscanerBtn = document.getElementById('cerrarEscaner');
    if (cerrarEscanerBtn) {
        cerrarEscanerBtn.addEventListener('click', detenerEscaner);
    }
}