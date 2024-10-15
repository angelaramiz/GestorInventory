// Importaciones
import { db, dbInventario, inicializarDB, inicializarDBInventario, cargarCSV, descargarCSV, cargarDatosEnTabla, cargarDatosInventarioEnTablaPlantilla, resetearBaseDeDatos, generarPlantillaInventario, descargarInventarioPDF, descargarInventarioCSV } from './db-operations.js';
import { mostrarMensaje } from './logs.js';
import {agregarProducto, buscarProducto, buscarProductoParaEditar,buscarProductoInventario,guardarCambios,eliminarProducto,guardarInventario,} from './product-operations.js';
import { toggleEscaner, detenerEscaner,inicializarEscaner } from './scanner.js';

// Función de inicialización
async function init() {
    try {
        await inicializarDB();
        await inicializarDBInventario();
        inicializarEscaner();
        // Event listeners para los formularios
        const formAgregar = document.getElementById("formAgregarProducto");
        if (formAgregar) {
            formAgregar.addEventListener("submit", agregarProducto);
        }

        // Event listeners para los botones de escaneo
        const botonesEscanear = document.querySelectorAll('[id^="escanearBtn"]');
        botonesEscanear.forEach(boton => {
            boton.addEventListener("click", function () {
                const inputId = this.previousElementSibling.id;
                toggleEscaner(inputId);
            });
        });

        // Event listeners para los botones de búsqueda
        const botonBuscarConsulta = document.getElementById("buscarConsulta");
        if (botonBuscarConsulta) {
            botonBuscarConsulta.addEventListener("click", buscarProducto);
        }

        const botonBuscarEditar = document.getElementById("buscarEditar");
        if (botonBuscarEditar) {
            botonBuscarEditar.addEventListener("click", buscarProductoParaEditar);
        }

        // Event listeners para los botones de edición
        const botonGuardarCambios = document.getElementById("guardarCambios");
        if (botonGuardarCambios) {
            botonGuardarCambios.addEventListener("click", guardarCambios);
        }

        const botonEliminarProducto = document.getElementById("eliminarProducto");
        if (botonEliminarProducto) {
            botonEliminarProducto.addEventListener("click", eliminarProducto);
        }

        // Event listener para guardar inventario
        const botonGuardarInventario = document.getElementById("guardarInventario");
        if (botonGuardarInventario) {
            botonGuardarInventario.addEventListener("click", guardarInventario);
        }

        // Event listeners para la gestión de archivos
        const inputCSV = document.getElementById("csvFile");
        if (inputCSV) {
            inputCSV.addEventListener("change", cargarCSV);
        }

        const botonDescargarCSV = document.getElementById("descargarCSV");
        if (botonDescargarCSV) {
            botonDescargarCSV.addEventListener("click", descargarCSV);
        }
        const botonGenerarPlantilla = document.getElementById("generarPlantilla");
        if (botonGenerarPlantilla) {
            botonGenerarPlantilla.addEventListener(
                "click",
                generarPlantillaInventario
            );
        }
        // Cargar datos en la tabla si estamos en la página de archivos
        // En la función init() o donde sea apropiado
        if (window.location.pathname.includes('archivos.html')) {
            cargarDatosEnTabla();
            cargarDatosInventarioEnTablaPlantilla();
        }
        const botonResetearBaseDatos = document.getElementById("resetearBaseDatos");
        if (botonResetearBaseDatos) {
            botonResetearBaseDatos.addEventListener("click", resetearBaseDatos);
        }

        const botonGenerarHojaInventario = document.getElementById(
            "generarHojaInventario"
        );
        if (botonGenerarHojaInventario) {
            botonGenerarHojaInventario.addEventListener(
                "click",
                generarHojaInventario
            );
        }
        // Event listener para el botón de cerrar escáner
        const cerrarEscanerBtn = document.getElementById('cerrarEscaner');
        if (cerrarEscanerBtn) {
            cerrarEscanerBtn.addEventListener('click', detenerEscaner);
        }
        const botonBuscarInventario = document.getElementById("buscarInventario");
        if (botonBuscarInventario) {
            botonBuscarInventario.addEventListener("click", buscarProductoInventario);
        }
    } catch (error) {
        console.error("Error initializing the application:", error);
        mostrarMensaje(
            "Error al inicializar la aplicación. Por favor, recargue la página.",
            "error"
        );
    }
}
// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Llamar a la función de inicialización cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    init().catch(error => {
        console.error("Error during initialization:", error);
        mostrarMensaje(
            "Error al inicializar la aplicación. Por favor, recargue la página.",
            "error"
        );
    });
});

// Otras funciones generales
// Función para mostrar secciones
function mostrarSeccion(seccion) {
    document
        .querySelectorAll(".seccion")
        .forEach(div => (div.style.display = "none"));
    document.getElementById(seccion).style.display = "block";
    if (seccion === "archivos") {
        cargarDatosEnTabla();
    }
}

// Función para resetear la base de datos
function resetearBaseDatos() {
    Swal.fire({
        title: "¿Qué base de datos deseas resetear?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Productos",
        cancelButtonText: "Inventario",
        showCloseButton: true
    }).then(result => {
        if (result.isConfirmed) {
            confirmarReseteo("productos");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            confirmarReseteo("inventario");
        }
    });
}

function confirmarReseteo(tipo) {
    Swal.fire({
        title: `¿Deseas descargar una copia de la base de datos de ${tipo} antes de resetear?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, descargar y resetear",
        cancelButtonText: "No, solo resetear"
    }).then(result => {
        if (result.isConfirmed) {
            descargarYResetear(tipo);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resetearSinDescargar(tipo);
        }
    });
}

function descargarYResetear(tipo) {
    if (tipo === "productos") {
        descargarCSV().then(() => resetearBaseDeDatos(db, "productos"));
    } else {
        descargarInventarioCSV().then(() =>
            resetearBaseDeDatos(dbInventario, "inventario")
        );
    }
}

function resetearSinDescargar(tipo) {
    if (tipo === "productos") {
        resetearBaseDeDatos(db, "productos");
    } else {
        resetearBaseDeDatos(dbInventario, "inventario");
    }
}

// Función para generar hoja de inventario
function generarHojaInventario() {
    Swal.fire({
        title: "Generar Hoja de Inventario",
        text: "Selecciona el formato de descarga:",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "CSV",
        cancelButtonText: "PDF"
    }).then(result => {
        if (result.isConfirmed) {
            descargarInventarioCSV();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            descargarInventarioPDF();
        }
    });
}

