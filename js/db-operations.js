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
        const request = indexedDB.open("InventarioDB", 2); // Incrementamos la versión para forzar la actualización

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
            
            // Si existe el almacén anterior, lo eliminamos
            if (dbInventario.objectStoreNames.contains("inventario")) {
                dbInventario.deleteObjectStore("inventario");
            }

            // Crear el nuevo almacén con la estructura actualizada
            const objectStore = dbInventario.createObjectStore("inventario", {
                keyPath: "id" // Cambiamos keyPath a "id" para manejar la combinación código-lote
            });

            // Crear índices
            objectStore.createIndex("id", "id", { unique: true });
            objectStore.createIndex("codigo", "codigo", { unique: false });
            objectStore.createIndex("lote", "lote", { unique: false });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("marca", "marca", { unique: false });
            objectStore.createIndex("tipoQuantidad", "tipoQuantidad", { unique: false });
            objectStore.createIndex("cantidad", "cantidad", { unique: false });
            objectStore.createIndex("fechaCaducidad", "fechaCaducidad", { unique: false });
            objectStore.createIndex("comentarios", "comentarios", { unique: false });
            
            // Crear índice compuesto para código y lote
            objectStore.createIndex("codigo_lote", ["codigo", "lote"], { unique: true });

            console.log("Base de datos de inventario creada/actualizada con nuevo esquema");
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
            "Código,Nombre,Categoría,Marca,Lote,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Comentarios\n";
        inventario.forEach(item => {
            csv += `${item.codigo},${item.nombre},${item.categoria},${item.marca},${item.lote},${item.tipoQuantidad},${item.cantidad},${item.fechaCaducidad},${item.comentarios}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-');
            const nombreArchivo = `reporte de inventario de ${fecha}.csv`;
            link.setAttribute("href", url);
            link.setAttribute("download", nombreArchivo);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
}

export function descargarInventarioPDF() {
    Swal.fire({
        title: 'Opciones de Generación de PDF',
        html: `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Ordenar por:</label>
                <select id="swal-orden" class="swal2-input">
                    <option value="caducidad">Fecha de caducidad (próximos a caducar primero)</option>
                    <option value="nombre">Nombre del producto</option>
                    <option value="categoria">Categoría</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Filtrar por caducidad:</label>
                <select id="swal-filtro-caducidad" class="swal2-input">
                    <option value="todos">Mostrar todos</option>
                    <option value="proximos">Próximos a caducar (30 días)</option>
                    <option value="mes">Por mes específico</option>
                </select>
            </div>
            <div id="mes-especifico" style="display: none;">
                <label class="block text-sm font-medium text-gray-700">Seleccionar mes:</label>
                <input type="month" id="swal-mes" class="swal2-input" value="${new Date().toISOString().slice(0, 7)}">
            </div>
        `,
        didOpen: () => {
            const filtroSelect = document.getElementById('swal-filtro-caducidad');
            const mesDiv = document.getElementById('mes-especifico');

            filtroSelect.addEventListener('change', (e) => {
                mesDiv.style.display = e.target.value === 'mes' ? 'block' : 'none';
            });
        },
        showCancelButton: true,
        confirmButtonText: 'Generar PDF',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: () => {
            return {
                orden: document.getElementById('swal-orden').value,
                filtroCaducidad: document.getElementById('swal-filtro-caducidad').value,
                mesEspecifico: document.getElementById('swal-mes').value
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            generarPDFConOpciones(result.value);
        }
    });
}

function generarPDFConOpciones(opciones) {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        let inventario = event.target.result;

        // Aplicar filtros según las opciones seleccionadas
        inventario = filtrarInventario(inventario, opciones);

        // Ordenar según la opción seleccionada
        inventario = ordenarInventario(inventario, opciones.orden);

        // Generar el PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar el título y la fecha del reporte
        doc.setFontSize(16);
        doc.text("Reporte de Inventario", 10, 10);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, 20);

        // Agregar información del filtro aplicado
        let filtroTexto = "Filtro aplicado: ";
        switch (opciones.filtroCaducidad) {
            case 'proximos':
                filtroTexto += "Productos próximos a caducar (30 días)";
                break;
            case 'mes':
                const fecha = new Date(opciones.mesEspecifico);
                filtroTexto += `Mes específico: ${fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
                break;
            default:
                filtroTexto += "Todos los productos";
        }
        doc.text(filtroTexto, 10, 30);

        // Agregar los productos al PDF
        let yPos = 40;
        inventario.forEach(item => {
            // Verificar si hay espacio suficiente en la página actual
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.text(`Código: ${item.codigo}`, 10, yPos);
            doc.text(`Nombre: ${item.nombre}`, 10, yPos + 5);
            doc.text(`Cantidad: ${item.cantidad} ${item.tipoQuantidad}`, 10, yPos + 10);
            doc.text(`Marca: ${item.marca}`, 10, yPos + 15);
            doc.text(`Fecha de Caducidad: ${item.fechaCaducidad}`, 10, yPos + 20);
            doc.setFontSize(10);
            doc.text(`Comentarios: ${item.comentarios || 'N/A'}`, 10, yPos + 25);

            yPos += 35;
        });

        // Obtener la fecha actual para el nombre del archivo
        const fechaActual = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-');
        const nombreArchivo = `reporte de inventario de ${fechaActual}.pdf`;

        // Guardar el archivo PDF con el nombre ajustado
        doc.save(nombreArchivo);
    };

    request.onerror = function (error) {
        console.error("Error al obtener los datos del inventario:", error);
        Swal.fire({
            title: "Error",
            text: "No se pudo generar el PDF",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
        });
    };
}

function filtrarInventario(inventario, opciones) {
    return inventario.filter(item => {
        const fechaCaducidad = new Date(item.fechaCaducidad);
        const hoy = new Date();

        switch(opciones.filtroCaducidad) {
            case 'proximos':
                const treintaDias = new Date();
                treintaDias.setDate(treintaDias.getDate() + 30);
                return fechaCaducidad <= treintaDias && fechaCaducidad >= hoy;

            case 'mes':
                const mesSeleccionado = new Date(opciones.mesEspecifico);
                return fechaCaducidad.getMonth() === mesSeleccionado.getMonth() &&
                       fechaCaducidad.getFullYear() === mesSeleccionado.getFullYear();

            default:
                return true; // Mostrar todos
        }
    });
}

function ordenarInventario(inventario, orden) {
    return inventario.sort((a, b) => {
        switch(orden) {
            case 'caducidad':
                return new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad);
                
            case 'nombre':
                return a.nombre.localeCompare(b.nombre);
                
            case 'categoria':
                return a.categoria.localeCompare(b.categoria);
                
            default:
                return 0;
        }
    });
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
            "Código,Nombre,Lote,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Comentarios\n";
        productos.forEach(producto => {
            const { inventario = {} } = producto;
            csv += `${producto.codigo},${producto.nombre},1,${inventario.tipo || ""},${inventario.cantidad || ""},${inventario.fechaCaducidad || ""},${inventario.comentarios || ""}\n`;
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
}

