// Funciones de base de datos
// impoetaciones 
import { mostrarMensaje } from './logs.js';

// variables globales
export let db;
export let dbInventario;
// Nombre y versión de la base de datos
const dbName = "ProductosDB";
const dbVersion = 1;


// Inicialización de la base de datos
export function inicializarDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = event => {
            console.error("Error al abrir la base de datos", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = event => {
            db = event.target.result;
            console.log("Base de datos abierta exitosamente");
            resolve(db);
        };

        request.onupgradeneeded = event => {
            db = event.target.result;
            const objectStore = db.createObjectStore("productos", {
                keyPath: "codigo"
            });
            objectStore.createIndex("codigo", "codigo", { unique: true });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("marca", "marca", { unique: false });
            console.log("Base de datos creada/actualizada");
        };
    });
}

// Inicialización de la base de datos de inventario
export function inicializarDBInventario() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("InventarioDB", 1);

        request.onerror = event => {
            console.error(
                "Error al abrir la base de datos de inventario",
                event.target.error
            );
            reject(event.target.error);
        };

        request.onsuccess = event => {
            dbInventario = event.target.result;
            console.log("Base de datos de inventario abierta exitosamente");
            resolve(dbInventario);
        };

        request.onupgradeneeded = event => {
            dbInventario = event.target.result;
            const objectStore = dbInventario.createObjectStore("inventario", {
                keyPath: "codigo"
            });
            objectStore.createIndex("codigo", "codigo", { unique: true });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("marca", "marca", { unique: false });
            objectStore.createIndex("tipoQuantidad", "tipoQuantidad", {
                unique: false
            });
            objectStore.createIndex("cantidad", "cantidad", { unique: false });
            objectStore.createIndex("fechaCaducidad", "fechaCaducidad", {
                unique: false
            });
            objectStore.createIndex("comentarios", "comentarios", { unique: false });
            console.log("Base de datos de inventario creada/actualizada");
        };
    });
}

export function resetearBaseDeDatos(database, storeName) {
    const transaction = database.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.clear();

    request.onsuccess = function (event) {
        console.log(`Base de datos de ${storeName} limpiada correctamente`);
        mostrarMensaje(
            `Base de datos de ${storeName} reseteada correctamente`,
            "exito"
        );
        if (storeName === "productos") {
            cargarDatosEnTabla();
        } else {
            cargarDatosInventarioEnTablaPlantilla();
        }
    };

    request.onerror = function (event) {
        console.error(
            `Error al limpiar la base de datos de ${storeName}:`,
            event.target.error
        );
        mostrarMensaje(
            `Error al resetear la base de datos de ${storeName}`,
            "error"
        );
    };
}

// funcion para cargar  datos de la base de datos
export function cargarCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const csv = e.target.result;
        const lines = csv.split("\n");
        const headers = lines[0].split(",");

        // Check if the CSV structure is correct
        if (
            headers.length !== 4 ||
            !headers.includes("Código") ||
            !headers.includes("Nombre") ||
            !headers.includes("Categoría") ||
            !headers.includes("Marca")
        ) {
            mostrarMensaje(
                "El formato del archivo CSV no es correcto. Por favor, use la plantilla proporcionada.",
                "error"
            );
            return;
        }

        const transaction = db.transaction(["productos"], "readwrite");
        const objectStore = transaction.objectStore("productos");

        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === "") continue; // Skip empty lines

            const values = lines[i].split(",");
            const producto = {
                codigo: values[0].trim(),
                nombre: values[1].trim(),
                categoria: values[2].trim(),
                marca: values[3].trim()
            };

            const request = objectStore.put(producto);

            request.onsuccess = function () {
                successCount++;
                if (i === lines.length - 1) {
                    mostrarResultadoCarga(successCount, errorCount);
                }
            };

            request.onerror = function () {
                errorCount++;
                if (i === lines.length - 1) {
                    mostrarResultadoCarga(successCount, errorCount);
                }
            };
        }
    };

    reader.onerror = function () {
        mostrarMensaje("Error al leer el archivo CSV", "error");
    };

    reader.readAsText(file);
}

// Modificar la función descargarCSV para que retorne una promesa
export function descargarCSV() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["productos"], "readonly");
        const objectStore = transaction.objectStore("productos");
        const request = objectStore.getAll();

        request.onsuccess = event => {
            const productos = event.target.result;
            let csv = "Código,Nombre,Categoría,Marca\n";
            productos.forEach(producto => {
                csv += `${producto.codigo},${producto.nombre},${producto.categoria},${producto.marca}\n`;
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "productos.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve();
            } else {
                reject(new Error("El navegador no soporta la descarga de archivos"));
            }
        };

        request.onerror = error => {
            reject(error);
        };
    });
}

export function descargarInventarioCSV() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const inventario = event.target.result;
        let csv =
            "codigo,Nombre,Categoría,Marca,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Comentarios\n";
        inventario.forEach(item => {
            csv += `${item.codigo},${item.nombre},${item.categoria},${item.marca},${item.tipoQuantidad},${item.cantidad},${item.fechaCaducidad},${item.comentarios}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "inventario.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
}

export function descargarInventarioPDF() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const inventario = event.target.result;
        console.log(window.jspdf);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Inventario", 10, 10);

        let yPos = 20;
        inventario.forEach(item => {
            doc.text(`Código: ${item.codigo}`, 10, yPos);
            doc.text(`Nombre: ${item.nombre}`, 10, yPos + 5);
            doc.text(
                `Cantidad: ${item.cantidad} ${item.tipoQuantidad}`,
                10,
                yPos + 10
            );
            doc.text(`Fecha de Caducidad: ${item.fechaCaducidad}`, 10, yPos + 15);
            yPos += 25;
            doc.text(`Comentarios: ${item.comentarios}`, 10, yPos);
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save("inventario.pdf");
    };
}

// Función para cargar datos en la tabla de la página de archivos
export function cargarDatosEnTabla() {
    const tbody = document.getElementById("databaseBody");
    if (!tbody) {
        console.log("Elemento 'databaseBody' no encontrado. Posiblemente no estamos en la página correcta.");
        return; // Salir de la función si el elemento no existe
    }

    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const productos = event.target.result;
        tbody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

        productos.forEach(function(producto) {
            const row = tbody.insertRow();
            row.insertCell().textContent = producto.codigo;
            row.insertCell().textContent = producto.nombre;
            row.insertCell().textContent = producto.categoria;
            row.insertCell().textContent = producto.marca;
        });
    };

    request.onerror = function(event) {
        console.error("Error al cargar datos en la tabla:", event.target.error);
        mostrarMensaje("Error al cargar los datos de la base de datos", "error");
    };
}

//  Función para cargar  datos en la tabla de la página de archivos
export function cargarDatosInventarioEnTablaPlantilla() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const inventario = event.target.result;
        const tbody = document.querySelector("#estructura-plantilla tbody");
        tbody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

        inventario.forEach(function (item) {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.codigo;
            row.insertCell().textContent = item.nombre;
            row.insertCell().textContent = item.categoria;
            row.insertCell().textContent = item.marca;
            row.insertCell().textContent = item.tipoQuantidad;
            row.insertCell().textContent = item.cantidad;
            row.insertCell().textContent = item.fechaCaducidad;
            row.insertCell().textContent = item.comentarios;
        });
    };

    request.onerror = function (event) {
        console.error(
            "Error al cargar datos de inventario en la tabla:",
            event.target.error
        );
        mostrarMensaje("Error al cargar los datos del inventario", "error");
    };
}

// Función para generar plantilla de inventario
export function generarPlantillaInventario() {
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const productos = event.target.result;
        let csv =
            "Código,Nombre,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Fecha de Ingreso,Comentarios\n";
        productos.forEach(producto => {
            const { inventario = {} } = producto; // Agregar inventario si existe
            csv += `${producto.codigo},${producto.nombre},${inventario.tipo ||
                ""},${inventario.cantidad || ""},${inventario.fechaCaducidad ||
                ""},${inventario.comentarios || ""}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "plantilla_inventario_completa.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    request.onerror = function (event) {
        console.error(
            "Error al generar la plantilla de inventario:",
            event.target.error
        );
        mostrarMensaje("Error al generar la plantilla de inventario", "error");
    };
}
