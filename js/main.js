// Variables globales
let db;
let escanerActivo = false;
let dbInventario;

// Nombre y versión de la base de datos
const dbName = 'ProductosDB';
const dbVersion = 1;

// Inicialización de la base de datos
function inicializarDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Base de datos abierta exitosamente");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const objectStore = db.createObjectStore("productos", { keyPath: "codigo" });
            objectStore.createIndex("codigo", "codigo", { unique: true });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("marca", "marca", { unique: false });
            console.log("Base de datos creada/actualizada");
        };
    });
}
// Función para mostrar secciones
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(div => div.style.display = 'none');
    document.getElementById(seccion).style.display = 'block';
    if (seccion === 'archivos') {
        cargarDatosEnTabla();
    }
}


// Funciones para agregar producto
async function agregarProducto(evento) {
    evento.preventDefault();

    const producto = {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value
    };

    try {
        const transaction = db.transaction(["productos"], "readwrite");
        const objectStore = transaction.objectStore("productos");
        await objectStore.add(producto);
        
        mostrarMensaje("Producto agregado exitosamente", "success");
        document.getElementById('formAgregarProducto').reset();
        cargarDatosEnTabla(); // Refrescar la tabla después de agregar producto
    } catch (error) {
        console.error("Error al agregar producto", error);
        mostrarMensaje("Error al agregar el producto. Es posible que el código ya exista.", "error");
    }
}

// Funciones para consulta de producto
function buscarProducto() {
    const codigo = document.getElementById('codigoConsulta').value;
    const nombre = document.getElementById('nombreConsulta').value;
    const categoria = document.getElementById('categoriaConsulta').value;

    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");

    if (codigo) {
        const request = objectStore.get(codigo);
        request.onsuccess = (event) => {
            mostrarResultados([event.target.result]);
        };
    } else {
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
            let resultados = event.target.result.filter(producto => 
                (!nombre || producto.nombre.toLowerCase().includes(nombre.toLowerCase())) &&
                (!categoria || producto.categoria.toLowerCase().includes(categoria.toLowerCase()))
            );
            mostrarResultados(resultados);
        };
    }
}
function mostrarResultados(resultados) {
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = ''; // Limpiar resultados previos

    if (resultados && resultados.length > 0) {
        resultados.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-6', 'mb-4', 'border', 'border-gray-200');
            productoDiv.innerHTML = `
                <h3 class="text-xl font-semibold mb-2">${producto.nombre}</h3>
                <p><strong>Código/PLU:</strong> ${producto.codigo}</p>
                <p><strong>Categoría:</strong> ${producto.categoria}</p>
                <p><strong>Marca:</strong> ${producto.marca}</p>
            `;
            resultadoDiv.appendChild(productoDiv);
        });
    } else {
        resultadoDiv.innerHTML = '<p class="text-red-500">No se encontraron productos.</p>';
    }
}

function mostrarMensaje(mensaje, tipo) {
    Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : 'Error',
        text: mensaje,
        icon: tipo,
        timer: 2000,
        showConfirmButton: false,
        background: tipo === 'success' ? '#e0f7fa' : '#ffebee',
        iconColor: tipo === 'success' ? '#00796b' : '#c62828'
    });
}

// Funciones para edición de producto
function buscarProductoParaEditar() {
    const codigo = document.getElementById('codigoEditar').value;
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = (event) => {
        const producto = event.target.result;
        if (producto) {
            document.getElementById('nombreEditar').value = producto.nombre;
            document.getElementById('categoriaEditar').value = producto.categoria;
            document.getElementById('marcaEditar').value = producto.marca;
            document.getElementById('formularioEdicion').style.display = 'block';
        } else {
            mostrarMensaje('Producto no encontrado', 'error');
        }
    };
}

function guardarCambios() {
    const codigo = document.getElementById('codigoEditar').value;
    const nombre = document.getElementById('nombreEditar').value;
    const categoria = document.getElementById('categoriaEditar').value;
    const marca = document.getElementById('marcaEditar').value;

    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.put({
        codigo, nombre, categoria, marca
    });

    request.onsuccess = () => {
        mostrarMensaje('Producto actualizado correctamente', 'exito');
        cargarDatosEnTabla();
    };

    request.onerror = () => {
        mostrarMensaje('Error al actualizar el producto', 'error');
    };
}

function eliminarProducto() {
    const codigo = document.getElementById('codigoEditar').value;
    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.delete(codigo);

    request.onsuccess = () => {
        mostrarMensaje('Producto eliminado correctamente', 'exito');
        document.getElementById('formularioEdicion').style.display = 'none';
        cargarDatosEnTabla();
    };

    request.onerror = () => {
        mostrarMensaje('Error al eliminar el producto', 'error');
    };
}

// Funciones para inventario
function buscarProductoInventario() {
    const codigo = document.getElementById('codigoInventario').value;
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = (event) => {
        const producto = event.target.result;
        if (producto) {
            document.getElementById('nombreInventario').value = producto.nombre;
            document.getElementById('datosInventario').style.display = 'block';
            if (producto.inventario) {
                document.getElementById('cantidadTipo').value = producto.inventario.tipo;
                document.getElementById('cantidad').value = producto.inventario.cantidad;
                document.getElementById('fechaCaducidad').value = producto.inventario.fechaCaducidad;
                document.getElementById('comentarios').value = producto.inventario.comentarios;
            } else {
                // Si no hay datos de inventario, limpiar los campos
                document.getElementById('cantidadTipo').value = '';
                document.getElementById('cantidad').value = '';
                document.getElementById('fechaCaducidad').value = '';
                document.getElementById('comentarios').value = '';
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Producto no encontrado',
                icon: 'error',
                timer:1000,
                showConfirmButton: false 
            });
        }
    };
}

function limpiarFormularioInventario() {
    document.getElementById('codigoInventario').value = '';
    document.getElementById('nombreInventario').value = '';
    document.getElementById('cantidadTipo').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('fechaCaducidad').value = '';
    document.getElementById('comentarios').value = '';
    document.getElementById('datosInventario').style.display = 'none';
}

// 
function cargarCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');

        // Check if the CSV structure is correct
        if (headers.length !== 4 || 
            !headers.includes('Código') || 
            !headers.includes('Nombre') || 
            !headers.includes('Categoría') || 
            !headers.includes('Marca')) {
            mostrarMensaje("El formato del archivo CSV no es correcto. Por favor, use la plantilla proporcionada.", "error");
            return;
        }

        const transaction = db.transaction(["productos"], "readwrite");
        const objectStore = transaction.objectStore("productos");

        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue; // Skip empty lines

            const values = lines[i].split(',');
            const producto = {
                codigo: values[0].trim(),
                nombre: values[1].trim(),
                categoria: values[2].trim(),
                marca: values[3].trim()
            };

            const request = objectStore.put(producto);

            request.onsuccess = function() {
                successCount++;
                if (i === lines.length - 1) {
                    mostrarResultadoCarga(successCount, errorCount);
                }
            };

            request.onerror = function() {
                errorCount++;
                if (i === lines.length - 1) {
                    mostrarResultadoCarga(successCount, errorCount);
                }
            };
        }
    };

    reader.onerror = function() {
        mostrarMensaje("Error al leer el archivo CSV", "error");
    };

    reader.readAsText(file);
}
// 
function mostrarResultadoCarga(successCount, errorCount) {
    const mensaje = `Carga completada. ${successCount} productos agregados/actualizados. ${errorCount} errores.`;
    Swal.fire({
        title: errorCount > 0 ? 'Advertencia' : 'Éxito',
        text: mensaje,
        icon: errorCount > 0 ? 'warning' : 'success',
        timer:1000,
        showConfirmButton: false 
    });
    cargarDatosEnTabla();
}

// Función para resetear la base de datos
function resetearBaseDatos() {
    Swal.fire({
        title: '¿Qué base de datos deseas resetear?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Productos',
        cancelButtonText: 'Inventario',
        showCloseButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            confirmarReseteo('productos');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            confirmarReseteo('inventario');
        }
    });
}

function confirmarReseteo(tipo) {
    Swal.fire({
        title: `¿Deseas descargar una copia de la base de datos de ${tipo} antes de resetear?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, descargar y resetear',
        cancelButtonText: 'No, solo resetear'
    }).then((result) => {
        if (result.isConfirmed) {
            descargarYResetear(tipo);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resetearSinDescargar(tipo);
        }
    });
}

function descargarYResetear(tipo) {
    if (tipo === 'productos') {
        descargarCSV().then(() => resetearBaseDeDatos(db, 'productos'));
    } else {
        descargarInventarioCSV().then(() => resetearBaseDeDatos(dbInventario, 'inventario'));
    }
}

function resetearSinDescargar(tipo) {
    if (tipo === 'productos') {
        resetearBaseDeDatos(db, 'productos');
    } else {
        resetearBaseDeDatos(dbInventario, 'inventario');
    }
}

function resetearBaseDeDatos(database, storeName) {
    const transaction = database.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.clear();

    request.onsuccess = function(event) {
        console.log(`Base de datos de ${storeName} limpiada correctamente`);
        mostrarMensaje(`Base de datos de ${storeName} reseteada correctamente`, 'exito');
        if (storeName === 'productos') {
            cargarDatosEnTabla();
        } else {
            cargarDatosInventarioEnTablaPlantilla();
        }
    };

    request.onerror = function(event) {
        console.error(`Error al limpiar la base de datos de ${storeName}:`, event.target.error);
        mostrarMensaje(`Error al resetear la base de datos de ${storeName}`, 'error');
    };
}

// Función para guardar inventario en nueva base de datos
function guardarInventario() {
    const codigo = document.getElementById('codigoInventario').value;
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = (event) => {
        const producto = event.target.result;
        if (producto) {
            const inventarioData = {
                codigo: producto.codigo,
                nombre: producto.nombre,
                categoria: producto.categoria,
                marca: producto.marca,
                tipoQuantidad: document.getElementById('cantidadTipo').value,
                cantidad: document.getElementById('cantidad').value,
                fechaCaducidad: document.getElementById('fechaCaducidad').value,
                comentarios: document.getElementById('comentarios').value
            };

            const inventarioTransaction = dbInventario.transaction(["inventario"], "readwrite");
            const inventarioObjectStore = inventarioTransaction.objectStore("inventario");
            const addRequest = inventarioObjectStore.put(inventarioData);

            addRequest.onsuccess = () => {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Inventario guardado correctamente',
                    icon: 'success',
                    timer:1000,
                    showConfirmButton: false 
                });
                // Limpiar el formulario y ocultarlo
                limpiarFormularioInventario();
            };
            addRequest.onerror = (error) => {
                console.error("Error al guardar el inventario:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al guardar el inventario',
                    icon: 'error',
                    timer:1000,
                    showConfirmButton: false 
                });
            };
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Producto no encontrado',
                icon: 'error',
                timer:1000,
                showConfirmButton: false 
            });
        }
    };

    request.onerror = (error) => {
        console.error("Error al obtener el producto:", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al obtener el producto',
            icon: 'error',
            timer:1000,
            showConfirmButton: false
        });
    };
}
// Función para generar hoja de inventario
function generarHojaInventario() {
    Swal.fire({
        title: 'Generar Hoja de Inventario',
        text: "Selecciona el formato de descarga:",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'CSV',
        cancelButtonText: 'PDF'
    }).then((result) => {
        if (result.isConfirmed) {
            descargarInventarioCSV();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            descargarInventarioPDF();
        }
    });
}
function descargarInventarioCSV() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const inventario = event.target.result;
        let csv = 'codigo,Nombre,Categoría,Marca,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Comentarios\n';
        inventario.forEach(item => {
            csv += `${item.codigo},${item.nombre},${item.categoria},${item.marca},${item.tipoQuantidad},${item.cantidad},${item.fechaCaducidad},${item.comentarios}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "inventario.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
}
function descargarInventarioPDF() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const inventario = event.target.result;
        console.log(window.jspdf);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Inventario", 10, 10);
        
        let yPos = 20;
        inventario.forEach(item => {
            doc.text(`Código: ${item.codigo}`, 10, yPos);
            doc.text(`Nombre: ${item.nombre}`, 10, yPos + 5);
            doc.text(`Cantidad: ${item.cantidad} ${item.tipoQuantidad}`, 10, yPos + 10);
            doc.text(`Fecha de Caducidad: ${item.fechaCaducidad}`, 10, yPos + 15);
            yPos += 25;

            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save("inventario.pdf");
    };
}

// Inicialización de la base de datos de inventario
function inicializarDBInventario() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("InventarioDB", 1);

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos de inventario", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInventario = event.target.result;
            console.log("Base de datos de inventario abierta exitosamente");
            resolve(dbInventario);
        };

        request.onupgradeneeded = (event) => {
            dbInventario = event.target.result;
            const objectStore = dbInventario.createObjectStore("inventario", { keyPath: "codigo" });
            objectStore.createIndex("codigo", "codigo", { unique: true });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("marca", "marca", { unique: false });
            objectStore.createIndex("tipoQuantidad", "tipoQuantidad", { unique: false });
            objectStore.createIndex("cantidad", "cantidad", { unique: false });
            objectStore.createIndex("fechaCaducidad", "fechaCaducidad", { unique: false });
            objectStore.createIndex("comentarios", "comentarios", { unique: false });
            console.log("Base de datos de inventario creada/actualizada");
        };
    });
}

// Modificar la función descargarCSV para que retorne una promesa
function descargarCSV() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["productos"], "readonly");
        const objectStore = transaction.objectStore("productos");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const productos = event.target.result;
            let csv = 'Código,Nombre,Categoría,Marca\n';
            productos.forEach(producto => {
                csv += `${producto.codigo},${producto.nombre},${producto.categoria},${producto.marca}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "productos.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve();
            } else {
                reject(new Error("El navegador no soporta la descarga de archivos"));
            }
        };

        request.onerror = (error) => {
            reject(error);
        };
    });
}

// Funciones para el escáner de códigos de barras
function toggleEscaner(inputId) {
    const scannerContainer = document.getElementById('scanner-container');
    if (escanerActivo) {
        Quagga.stop();
        scannerContainer.style.display = 'none';
        escanerActivo = false;
    } else {
        scannerContainer.style.display = 'block';
        iniciarEscaneo(inputId);
    }
}

function iniciarEscaneo(inputId) {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader"],
            debug: {
                drawBoundingBox: true,
                showFrequency: true,
                drawScanline: true,
                showPattern: true
            }
        },
        locate: true,
        locator: {
            patchSize: "medium",
            halfSample: true,
            area: {
                top: "30%",
                right: "70%",
                left: "30%",
                bottom: "70%"
            }
        }
    }, function(err) {
        if (err) {
            console.error("Error al iniciar Quagga:", err);
            mostrarMensaje("Error al iniciar el escáner. Verifique la cámara y los permisos.", "error");
            return;
        }
        console.log("Escáner inicializado correctamente");
        Quagga.start();
        escanerActivo = true;
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        document.getElementById(inputId).value = code;
        toggleEscaner(inputId);
        mostrarMensaje(`Código de barras detectado: ${code}`, "success");
        realizarAccionSegunPagina(inputId);
    });
}

function realizarAccionSegunPagina(inputId) {
    if (inputId === 'codigo') {
        // Estamos en la página de agregar producto
        document.getElementById('nombre').focus();
    } else if (inputId === 'codigoConsulta') {
        buscarProducto();
    } else if (inputId === 'codigoEditar') {
        buscarProductoParaEditar();
    } else if (inputId === 'codigoInventario') {
        buscarProductoInventario();
    }
}

function toggleFlash(turnOn) {
    const track = Quagga.CameraAccess.getActiveTrack();
    if (track && track.getCapabilities().torch) {
        track.applyConstraints({
            advanced: [{ torch: turnOn }]
        });
    } else {
        console.log("El flash no es compatible en este dispositivo.");
    }
}
// Función para cargar datos en la tabla de la página de archivos
async function cargarDatosEnTabla() {
    if (!document.getElementById('databaseBody')) return;
    
    try {
        const productos = await obtenerProductos();
        const tbody = document.getElementById("databaseBody");
        tbody.innerHTML = "";

        productos.forEach(function(producto) {
            const row = tbody.insertRow();
            row.insertCell().textContent = producto.codigo;
            row.insertCell().textContent = producto.nombre;
            row.insertCell().textContent = producto.categoria;
            row.insertCell().textContent = producto.marca;
        });
    } catch (error) {
        console.error("Error al cargar datos en la tabla:", error);
        mostrarMensaje("Error al cargar los datos de la base de datos", "error");
    }
}

function obtenerProductos() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["productos"], "readonly");
        const objectStore = transaction.objectStore("productos");
        const request = objectStore.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (error) => reject(error);
    });
}
//  Función para cargar  datos en la tabla de la página de archivos 
function cargarDatosInventarioEnTablaPlantilla() {
    const transaction = dbInventario.transaction(["inventario"], "readonly");
    const objectStore = transaction.objectStore("inventario");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const inventario = event.target.result;
        const tbody = document.querySelector('#estructura-plantilla tbody');
        tbody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

        inventario.forEach(function(item) {
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

    request.onerror = function(event) {
        console.error("Error al cargar datos de inventario en la tabla:", event.target.error);
        mostrarMensaje("Error al cargar los datos del inventario", "error");
    };
}
// Función de inicialización
async function init() {
    try {
        await inicializarDB();
        await inicializarDBInventario();
        // Event listeners para los formularios
        const formAgregar = document.getElementById('formAgregarProducto');
        if (formAgregar) {
            formAgregar.addEventListener('submit', agregarProducto);
        }

        // Event listeners para los botones de escaneo
        const botonesEscanear = document.querySelectorAll('[id^="escanearBtn"]');
        botonesEscanear.forEach(boton => {
            boton.addEventListener('click', function() {
                const inputId = this.previousElementSibling.id;
                toggleEscaner(inputId);
            });
        });

        // Event listeners para los botones de búsqueda
        const botonBuscarConsulta = document.getElementById('buscarConsulta');
        if (botonBuscarConsulta) {
            botonBuscarConsulta.addEventListener('click', buscarProducto);
        }

        const botonBuscarEditar = document.getElementById('buscarEditar');
        if (botonBuscarEditar) {
            botonBuscarEditar.addEventListener('click', buscarProductoParaEditar);
        }

        const botonBuscarInventario = document.getElementById('buscarInventario');
        if (botonBuscarInventario) {
            botonBuscarInventario.addEventListener('click', buscarProductoInventario);
        }

        // Event listeners para los botones de edición
        const botonGuardarCambios = document.getElementById('guardarCambios');
        if (botonGuardarCambios) {
            botonGuardarCambios.addEventListener('click', guardarCambios);
        }

        const botonEliminarProducto = document.getElementById('eliminarProducto');
        if (botonEliminarProducto) {
            botonEliminarProducto.addEventListener('click', eliminarProducto);
        }

        // Event listener para guardar inventario
        const botonGuardarInventario = document.getElementById('guardarInventario');
        if (botonGuardarInventario) {
            botonGuardarInventario.addEventListener('click', guardarInventario);
        }

        // Event listeners para la gestión de archivos
        const inputCSV = document.getElementById('csvFile');
        if (inputCSV) {
            inputCSV.addEventListener('change', cargarCSV);
        }

        const formAgregar = document.getElementById('formAgregarProducto');
        if (formAgregar) {
            formAgregar.addEventListener('submit', agregarProducto);
        }

        const botonesEscanear = document.querySelectorAll('[id^="escanearBtn"]');
        botonesEscanear.forEach(boton => {
            boton.addEventListener('click', function() {
                const inputId = this.previousElementSibling.id;
                toggleEscaner(inputId);
            });
        });

        const botonDescargarCSV = document.getElementById('descargarCSV');
        if (botonDescargarCSV) {
            botonDescargarCSV.addEventListener('click', descargarCSV);
        }

        // Cargar datos en la tabla si estamos en la página de archivos
        if (document.getElementById('archivos')) {
            cargarDatosEnTabla();
            cargarDatosInventarioEnTablaPlantilla(); // Nueva llamada
        }
        const botonResetearBaseDatos = document.getElementById('resetearBaseDatos');
        if (botonResetearBaseDatos) {
            botonResetearBaseDatos.addEventListener('click', resetearBaseDatos);
        }

        const botonGenerarHojaInventario = document.getElementById('generarHojaInventario');
        if (botonGenerarHojaInventario) {
            botonGenerarHojaInventario.addEventListener('click', generarHojaInventario);
        }
        if (document.getElementById('archivos')) {
            await cargarDatosEnTabla();
            await cargarDatosInventarioEnTablaPlantilla();
        }
    } catch (error) {
        console.error("Error initializing the application:", error);
        mostrarMensaje("Error al inicializar la aplicación. Por favor, recargue la página.", "error");
    }
}

// Llamar a la función de inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
        console.error("Error during initialization:", error);
        mostrarMensaje("Error al inicializar la aplicación. Por favor, recargue la página.", "error");
    });
});

// Función para generar plantilla de inventario
function generarPlantillaInventario() {
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const productos = event.target.result;
        let csv = 'Código,Nombre,Tipo de Cantidad,Cantidad,Fecha de Caducidad,Fecha de Ingreso,Comentarios\n';
        productos.forEach(producto => {
            const { inventario = {} } = producto; // Agregar inventario si existe
            csv += `${producto.codigo},${producto.nombre},${inventario.tipo || ''},${inventario.cantidad || ''},${inventario.fechaCaducidad || ''},${inventario.comentarios || ''}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "plantilla_inventario_completa.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    request.onerror = function(event) {
        console.error("Error al generar la plantilla de inventario:", event.target.error);
        mostrarMensaje("Error al generar la plantilla de inventario", "error");
    };
}

// En la función init(), añade este event listener:
const botonGenerarPlantilla = document.getElementById('generarPlantilla');
if (botonGenerarPlantilla) {
    botonGenerarPlantilla.addEventListener('click', generarPlantillaInventario);
}
// Llamar a la función de inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', init);