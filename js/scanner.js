// Funciones del escáner
// importaciones
import { buscarProducto, buscarProductoParaEditar, buscarProductoInventario } from './product-operations.js';

// Variables globales
let escanerActivo = false;

// Funciones para el escáner de códigos de barras
export function toggleEscaner(inputId) {
    const scannerContainer = document.getElementById("scanner-container");
    if (escanerActivo) {
        Quagga.stop();
        scannerContainer.style.display = "none";
        escanerActivo = false;
    } else {
        scannerContainer.style.display = "block";
        iniciarEscaneo(inputId);
    }
}

// funcion para iniciar escaner 
export function iniciarEscaneo(inputId) {
    Quagga.init(
        {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector("#scanner-container"),
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
                    text:
                        "Error al iniciar el escáner. Por favor, asegúrese de que su dispositivo tiene una cámara y ha dado los permisos necesarios.",
                    icon: "error",
                    timer: 1000,
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
        toggleEscaner(inputId);
        Swal.fire({
            title: "Éxito",
            text: "Código de barras detectado: " + code,
            icon: "success",
            timer: 1000,
            showConfirmButton: false
        });
        // Aquí puedes añadir lógica adicional según la página en la que estés
        if (inputId === "codigoConsulta") {
            buscarProducto();
        } else if (inputId === "codigoEditar") {
            buscarProductoParaEditar();
        } else if (inputId === "codigoInventario") {
            buscarProductoInventario();
        }
    });
}