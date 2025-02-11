
// importaciones 
import { db, dbInventario } from './db-operations.js';
import { mostrarMensaje } from './logs.js';
import { cargarDatosEnTabla } from './db-operations.js';
import { sanitizarProducto } from './sanitizacion.js';

//  funciones 
export function mostrarResultados(resultados) {
    const resultadoDiv = document.getElementById("resultados");
    resultadoDiv.innerHTML = ""; // Limpiar resultados previos

    if (resultados && resultados.length > 0) {
        resultados.forEach(producto => {
            const productoDiv = document.createElement("div");
            productoDiv.classList.add(
                "bg-white",
                "rounded-lg",
                "shadow-md",
                "p-6",
                "mb-4",
                "border",
                "border-gray-200"
            );
            productoDiv.innerHTML = `
                <h3 class="text-xl font-semibold mb-2">${producto.nombre}</h3>
                <p><strong>Código/PLU:</strong> ${producto.codigo}</p>
                <p><strong>Categoría:</strong> ${producto.categoria}</p>
                <p><strong>Marca:</strong> ${producto.marca}</p>
            `;
            resultadoDiv.appendChild(productoDiv);
        });
    } else {
        resultadoDiv.innerHTML =
            '<p class="text-red-500">No se encontraron productos.</p>';
    }
}
export function mostrarResultadosInventario(resultados) {
    const resultadosDiv = document.getElementById("resultadosInventario");
    resultadosDiv.innerHTML = "";

    if (resultados.length === 0) {
        resultadosDiv.innerHTML = "<p>No se encontraron productos.</p>";
        resultadosDiv.style.display = "block";
        document.getElementById("datosInventario").style.display = "none";
        return;
    }

    if (resultados.length === 1) {
        // Si solo hay un resultado, mostrar directamente el formulario de inventario
        mostrarFormularioInventario(resultados[0]);
        return;
    }

    // Mostrar múltiples resultados
    resultados.forEach(producto => {
        const productoDiv = document.createElement("div");
        productoDiv.classList.add("bg-white", "p-4", "mb-2", "cursor-pointer", "hover:bg-gray-100");
        productoDiv.innerHTML = `
            <p><strong>Código:</strong> ${producto.codigo}</p>
            <p><strong>Nombre:</strong> ${producto.nombre}</p>
            <p><strong>Marca:</strong> ${producto.marca}</p>
        `;
        productoDiv.addEventListener("click", () => mostrarFormularioInventario(producto));
        resultadosDiv.appendChild(productoDiv);
    });

    resultadosDiv.style.display = "block";
    document.getElementById("datosInventario").style.display = "none";
}
export function mostrarFormularioInventario(producto) {
    document.getElementById("resultadosInventario").style.display = "none";
    document.getElementById("datosInventario").style.display = "block";
    document.getElementById("unidadProducto").value = producto.unidad || "";
    document.getElementById("nombreProductoInventario").value = producto.nombre;

    // Aquí puedes añadir lógica para cargar datos de inventario existentes si es necesario
}
// Funciones para agregar producto
export function agregarProducto(evento) {
    evento.preventDefault();
    const productosanitizado = sanitizarProducto(producto);
    if (!productosanitizado) {
        mostrarMensaje("Error: Datos de producto invalido", "error");
        return;
    }
    const codigo = document.getElementById("codigoAgregar").value;
    const nombre = document.getElementById("nombre").value;
    const categoria = document.getElementById("categoria").value;
    const marca = document.getElementById("marca").value;

    const producto = { codigo, nombre, categoria, marca };

    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");

    objectStore.put(productosanitizado)

    request.onerror = event => {
        console.error("Error al agregar producto", event.target.error);
        mostrarMensaje(
            "Error al agregar el producto. Es posible que el código ya exista.",
            "error"
        );
    };

    request.onsuccess = event => {
        console.log("Producto agregado exitosamente");
        mostrarMensaje("Producto agregado exitosamente", "exito");
        document.getElementById("formAgregarProducto").reset();
    };
}
// Funciones para consulta de producto
export function buscarProducto() {
    const codigo = document.getElementById("codigoConsulta").value;
    const nombre = document.getElementById("nombreConsulta").value;
    const categoria = document.getElementById("categoriaConsulta").value;

    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");

    if (codigo) {
        const request = objectStore.get(codigo);
        request.onsuccess = event => {
            mostrarResultados([event.target.result]);
        };
    } else {
        const request = objectStore.getAll();
        request.onsuccess = event => {
            let resultados = event.target.result.filter(
                producto =>
                    (!nombre ||
                        producto.nombre.toLowerCase().includes(nombre.toLowerCase())) &&
                    (!categoria ||
                        producto.categoria.toLowerCase().includes(categoria.toLowerCase()))
            );
            mostrarResultados(resultados);
        };
    }
}
// Funciones para edición de producto
export function buscarProductoParaEditar() {
    const codigo = document.getElementById("codigoEditar").value;
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);


    request.onsuccess = event => {
        const producto = event.target.result;
        if (producto) {
            document.getElementById("codigoEditar").value = producto.codigo;
            document.getElementById("codigoEditar").setAttribute("data-codigo-original", producto.codigo); // Guardar el código original
            // Depuración: Mostrar el código original guardado
            document.getElementById("codigo").value = producto.codigo;
            document.getElementById("codigoEditar").value = ''; // Limpiar el campo de código
            document.getElementById("nombreEditar").value = producto.nombre;
            document.getElementById("categoriaEditar").value = producto.categoria;
            document.getElementById("marcaEditar").value = producto.marca;
            document.getElementById("formularioEdicion").style.display = "block";
        } else {
            mostrarMensaje("Producto no encontrado", "error");
        }
    };
}
// Funciones para validar código único
export function validarCodigoUnico(codigo) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["productos"], "readonly");
        const objectStore = transaction.objectStore("productos");
        const request = objectStore.get(codigo);

        request.onsuccess = function () {
            resolve(!request.result); // Resolve true si el código no existe
        };

        request.onerror = function () {
            reject("Error al validar el código.");
        };
    });
}
// Funciones para editar producto
export async function guardarCambios() {
    try {
        const codigoAntiguo = document.getElementById("codigoEditar").getAttribute("data-codigo-original"); // Código original guardado
        const codigoNuevo = document.getElementById("codigo").value; // Nuevo código ingresado por el usuario
        const nombre = document.getElementById("nombreEditar").value;
        const categoria = document.getElementById("categoriaEditar").value;
        const marca = document.getElementById("marcaEditar").value;
        const unidad = document.getElementById("unidadEditar").value || "";
        // Sanitizar y validar el producto
        const productoSanitizado = sanitizarProducto({
            codigo: codigoNuevo,
            nombre: nombre,
            categoria: categoria,
            marca: marca
        });

        if (!productoSanitizado) {
            mostrarMensaje("Error: Datos de producto inválidos.", "error");
            return;
        }

        // Validar que el nuevo código sea único
        const codigoUnico = await validarCodigoUnico(productoSanitizado.codigo);
        if (!codigoUnico && codigoAntiguo !== productoSanitizado.codigo) {
            mostrarMensaje("El código ya está en uso. Por favor, elige otro.", "error");
            return;
        }

        // Iniciar transacción
        const transaction = db.transaction(["productos"], "readwrite");
        const objectStore = transaction.objectStore("productos");

        // Eliminar el producto antiguo
        const deleteRequest = objectStore.delete(codigoAntiguo);
        deleteRequest.onsuccess = function () {

            // Agregar el producto con el nuevo código
            const addRequest = objectStore.put(productoSanitizado);
            addRequest.onsuccess = function () {
                mostrarMensaje(`Producto actualizado correctamente.\n `, "exito");
                document.getElementById("formularioEdicion").style.display = "none";
                
                // Verificar si estamos en la página correcta antes de cargar la tabla
                if (document.getElementById("databaseBody")) {
                    cargarDatosEnTabla(); // Actualizar la tabla solo si existe databaseBody
                }
            };

            addRequest.onerror = function () {
                mostrarMensaje("Error al actualizar el producto.", "error");
            };
        };

        deleteRequest.onerror = function () {
            mostrarMensaje("Error al eliminar el producto antiguo.", "error");
        };
    } catch (error) {
        console.error("Error al editar el producto:", error);
        mostrarMensaje("Error inesperado al editar el producto.", "error");
    }
}
// Funciones para eliminar producto
export function eliminarProducto() {
    const codigo = document.getElementById("codigoEditar").value;
    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.delete(codigo);

    request.onsuccess = () => {
        mostrarMensaje("Producto eliminado correctamente", "exito");
        document.getElementById("formularioEdicion").style.display = "none";
        cargarDatosEnTabla();
    };

    request.onerror = () => {
        mostrarMensaje("Error al eliminar el producto", "error");
    };
}

// Actualizar la función limpiarFormularioInventario
export function limpiarFormularioInventario() {
    if (document.getElementById("unidadProducto")) {
        document.getElementById("unidadProducto").value = "";
    }
    if (document.getElementById("codigo")) {
        document.getElementById("codigo").value = "";
    }
    if (document.getElementById("nombreInventario")) {
        document.getElementById("nombreInventario").value = "";
    }
    if (document.getElementById("cantidadTipo")) {
        document.getElementById("cantidadTipo").value = "";
    }
    if (document.getElementById("cantidad")) {
        document.getElementById("cantidad").value = "";
    }
    if (document.getElementById("fechaCaducidad")) {
        document.getElementById("fechaCaducidad").value = "";
    }
    if (document.getElementById("comentarios")) {
        document.getElementById("comentarios").value = "";
    }
    if (document.getElementById("datosInventario")) {
        document.getElementById("datosInventario").style.display = "none";
    }
}



// funcion para guardar productos en la base de datos para inventariar
// Actualizar la función guardarInventario para manejar lotes
export function guardarInventario() {
    const codigo = document.getElementById("codigo").value;
    const lote = document.getElementById("loteInventario")?.value || "1";
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = event => {
        const producto = event.target.result;
        if (producto) {
            // Obtener el valor de 'unidad' del producto
            const tipoCantidadPorDefecto = producto.unidad || "Pz"; // Valor por defecto si no hay unidad

            // Crear el objeto de inventario
            const inventarioData = {
                id: `${codigo}-${lote}`, // ID único combinando código y lote
                codigo: producto.codigo,
                nombre: producto.nombre,
                categoria: producto.categoria,
                marca: producto.marca,
                lote: lote,
                tipoQuantidad: producto.unidad || "Pz", // Valor por defecto si no hay unidad
                cantidad: document.getElementById("cantidad").value,
                fechaCaducidad: document.getElementById("fechaCaducidad").value,
                comentarios: document.getElementById("comentarios").value
            };

            // Guardar en la base de datos de inventario
            const inventarioTransaction = dbInventario.transaction(["inventario"], "readwrite");
            const inventarioObjectStore = inventarioTransaction.objectStore("inventario");
            const addRequest = inventarioObjectStore.put(inventarioData);
            if (!document.getElementById("datosInventario").style.display === "block") {
                console.warn("El formulario de inventario no está visible.");
                return;
            }
            

            addRequest.onsuccess = () => {
                Swal.fire({
                    title: "Éxito",
                    text: `Inventario guardado correctamente (Lote #${lote})`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                limpiarFormularioInventario();
            };

            addRequest.onerror = error => {
                console.error("Error al guardar el inventario:", error);
                Swal.fire({
                    title: "Error",
                    text: "Error al guardar el inventario",
                    icon: "error",
                    timer: 1500,
                    showConfirmButton: false
                });
            };
        } else {
            Swal.fire({
                title: "Error",
                text: "Producto no encontrado",
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    request.onerror = error => {
        console.error("Error al obtener el producto:", error);
        Swal.fire({
            title: "Error",
            text: "Error al obtener el producto",
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    };
}

function agregarNuevoProductoDesdeInventario(codigo) {
    Swal.fire({
        title: 'Agregar Nuevo Producto',
        html:
            '<input id="swal-codigo" class="swal2-input" placeholder="Código" value="' + codigo + '" readonly>' +
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre">' +
            '<input id="swal-categoria" class="swal2-input" placeholder="Categorí­a">' +
            '<input id="swal-marca" class="swal2-input" placeholder="Marca">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                codigo: document.getElementById('swal-codigo').value,
                nombre: document.getElementById('swal-nombre').value,
                categoria: document.getElementById('swal-categoria').value,
                marca: document.getElementById('swal-marca').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const nuevoProducto = result.value;
            agregarProductoABaseDeDatos(nuevoProducto);
        }
    });
}

export function agregarProductoABaseDeDatos(producto) {
    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.add(producto);

    request.onsuccess = event => {
        console.log("Producto agregado exitosamente");
        Swal.fire({
            title: "Éxito",
            text: "Producto agregado exitosamente",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            // Continuar con la lÃ³gica del inventario
            mostrarFormularioInventario(producto);
        });
    };

    request.onerror = event => {
        console.error("Error al agregar producto", event.target.error);
        Swal.fire({
            title: "Error",
            text: "Error al agregar el producto. Es posible que el código ya exista.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
        });
    };
}

// Función para buscar inventario en nueva base de datos
export async function buscarProductoInventario() {
    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombreInventario").value;
    const marca = document.getElementById("marcaInventario").value;

    try {
        // Primero buscar en la base de datos de productos
        const productosResultados = await buscarEnProductos(codigo, nombre, marca);

        if (productosResultados.length === 0) {
            // Si no se encuentra el producto, preguntar si desea agregarlo
            agregarNuevoProductoDesdeInventario(codigo);
            return;
        }

        // Si encontramos productos, buscar en inventario
        const inventarioResultados = await buscarEnInventario(codigo, nombre, marca);

        if (inventarioResultados.length > 0) {
            // Si existe en inventario, mostrar modal con opciones
            mostrarModalProductoExistente(productosResultados[0], inventarioResultados);
        } else {
            // Si no existe en inventario, mostrar resultados normales
            mostrarResultadosInventario(productosResultados);
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        Swal.fire({
            title: "Error",
            text: "Error al buscar el producto",
            icon: "error",
            timer: 2000
        });
    }
}

// Función para buscar en la base de datos de productos
function buscarEnProductos(codigo, nombre, marca) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["productos"], "readonly");
        const objectStore = transaction.objectStore("productos");
        const request = objectStore.getAll();

        request.onsuccess = event => {
            const productos = event.target.result;
            const resultados = productos.filter(producto =>
                (codigo && producto.codigo === codigo) ||
                (nombre && producto.nombre.toLowerCase().includes(nombre.toLowerCase())) ||
                (marca && producto.marca.toLowerCase().includes(marca.toLowerCase()))
            );
            resolve(resultados);
        };

        request.onerror = event => reject(event.target.error);
    });
}

// Función para buscar en la base de datos de inventario
function buscarEnInventario(codigo, nombre, marca) {
    return new Promise((resolve, reject) => {
        const transaction = dbInventario.transaction(["inventario"], "readonly");
        const objectStore = transaction.objectStore("inventario");
        const request = objectStore.getAll();

        request.onsuccess = event => {
            const inventario = event.target.result;
            const resultados = inventario.filter(item =>
                (codigo && item.codigo === codigo) ||
                (nombre && item.nombre.toLowerCase().includes(nombre.toLowerCase())) ||
                (marca && item.marca.toLowerCase().includes(marca.toLowerCase()))
            );
            resolve(resultados);
        };

        request.onerror = event => reject(event.target.error);
    });
}

// Función para mostrar modal cuando se encuentra un producto existente
function mostrarModalProductoExistente(productoOriginal, productosInventario) {
    const ultimoLote = obtenerUltimoLote(productosInventario);

    const productosHTML = productosInventario.map(prod => `
        <div class="border p-2 mb-2">
            <p><strong>Lote:</strong> ${prod.lote || 'N/A'}</p>
            <p><strong>Cantidad:</strong> ${prod.cantidad} ${prod.tipoQuantidad}</p>
            <p><strong>Fecha de Caducidad:</strong> ${prod.fechaCaducidad}</p>
        </div>
    `).join('');

    Swal.fire({
        title: 'Producto encontrado en inventario',
        html: `
            <div class="mb-4">
                <h3 class="text-lg font-bold">Detalles del producto:</h3>
                <p><strong>Código:</strong> ${productoOriginal.codigo}</p>
                <p><strong>Nombre:</strong> ${productoOriginal.nombre}</p>
                <p><strong>Marca:</strong> ${productoOriginal.marca}</p>
                <h3 class="text-lg font-bold mt-4">Lotes existentes:</h3>
                ${productosHTML}
            </div>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Modificar existente',
        denyButtonText: 'Nuevo lote',
        cancelButtonText: 'Buscar otro'
    }).then((result) => {
        if (result.isConfirmed) {
            // Modificar producto existente
            mostrarFormularioModificacion(productosInventario[0]);
        } else if (result.isDenied) {
            // Crear nuevo lote
            mostrarFormularioNuevoLote(productoOriginal, ultimoLote + 1);
        } else {
            // Buscar otro producto
            reiniciarBusqueda();
        }
    });
}

// Función para obtener el último número de lote
function obtenerUltimoLote(productosInventario) {
    return productosInventario.reduce((max, prod) => {
        const lote = parseInt(prod.lote) || 0;
        return lote > max ? lote : max;
    }, 0);
}

// Función para mostrar formulario de nuevo lote
function mostrarFormularioNuevoLote(productoOriginal, nuevoLote) {
    document.getElementById("datosInventario").style.display = "block";

    // Mantener los datos del producto original
    document.getElementById("codigo").value = productoOriginal.codigo;
    document.getElementById("nombreProductoInventario").value = productoOriginal.nombre;

    // Mostrar la unidad del producto
    const unidadProductoElement = document.getElementById("unidadProducto");
    unidadProductoElement.textContent = productoOriginal.unidad || "Pz"; // Valor por defecto si no hay unidad

    // Limpiar campos de inventario
    document.getElementById("cantidad").value = "";
    document.getElementById("fechaCaducidad").value = "";
    document.getElementById("comentarios").value = "";

    // Agregar número de lote
    const loteInput = document.createElement("input");
    loteInput.type = "hidden";
    loteInput.id = "loteInventario";
    loteInput.value = nuevoLote;

    // Remover lote anterior si existe
    const loteAnterior = document.getElementById("loteInventario");
    if (loteAnterior) {
        loteAnterior.remove();
    }

    document.getElementById("datosInventario").appendChild(loteInput);

    // Mostrar el número de lote al usuario
    Swal.fire({
        title: 'Nuevo Lote',
        text: `Creando lote #${nuevoLote}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}


// Función para reiniciar la búsqueda
function reiniciarBusqueda() {
    document.getElementById("codigo").value = "";
    document.getElementById("nombreInventario").value = "";
    document.getElementById("marcaInventario").value = "";
    document.getElementById("datosInventario").style.display = "none";
}


// Función para mostrar formulario de modificación de inventario
function mostrarFormularioModificacion(productoInventario) {
    document.getElementById("datosInventario").style.display = "block";

    // Establecer los valores del formulario con los datos del producto existente
    document.getElementById("codigo").value = productoInventario.codigo;
    document.getElementById("nombreProductoInventario").value = productoInventario.nombre;

    // Mostrar la unidad del producto
    const unidadProductoElement = document.getElementById("unidadProducto");
    unidadProductoElement.textContent = productoInventario.tipoQuantidad || "Pz"; // Valor por defecto si no hay unidad

    document.getElementById("cantidad").value = productoInventario.cantidad;
    document.getElementById("fechaCaducidad").value = productoInventario.fechaCaducidad;
    document.getElementById("comentarios").value = productoInventario.comentarios || "";

    // Agregar lote como input oculto
    const loteInput = document.createElement("input");
    loteInput.type = "hidden";
    loteInput.id = "loteInventario";
    loteInput.value = productoInventario.lote || "1";

    // Remover lote anterior si existe
    const loteAnterior = document.getElementById("loteInventario");
    if (loteAnterior) {
        loteAnterior.remove();
    }

    document.getElementById("datosInventario").appendChild(loteInput);

    // Mostrar mensaje de modificación
    Swal.fire({
        title: 'Modificar Inventario',
        text: `Modificando inventario de lote #${productoInventario.lote}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}
// Función para actualizar el inventario por código
export function actualizarInventarioPorCodigo(codigoAntiguo, codigoNuevo) {
    return new Promise((resolve, reject) => {
        const transaction = dbInventario.transaction(["inventario"], "readwrite");
        const objectStore = transaction.objectStore("inventario");
        const index = objectStore.index("codigo");

        const getRequest = index.getAll(codigoAntiguo);
        getRequest.onsuccess = function () {
            const registros = getRequest.result;
            registros.forEach(registro => {
                registro.codigo = codigoNuevo; // Actualizar el código
                objectStore.put(registro); // Guardar el registro actualizado
            });

            resolve();
        };

        getRequest.onerror = function () {
            reject("Error al actualizar el inventario.");
        };
    });
}
