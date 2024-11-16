
// importaciones 
import { db, dbInventario } from './db-operations.js';
import { mostrarMensaje } from './logs.js';
import { cargarDatosEnTabla } from './db-operations.js';

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
    document.getElementById("nombreProductoInventario").value = producto.nombre;
    // Aquí puedes añadir lógica para cargar datos de inventario existentes si es necesario
}
// Funciones para agregar producto
export function agregarProducto(evento) {
    evento.preventDefault();

    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombre").value;
    const categoria = document.getElementById("categoria").value;
    const marca = document.getElementById("marca").value;

    const producto = { codigo, nombre, categoria, marca };

    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");

    const request = objectStore.add(producto);

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
            document.getElementById("nombreEditar").value = producto.nombre;
            document.getElementById("categoriaEditar").value = producto.categoria;
            document.getElementById("marcaEditar").value = producto.marca;
            document.getElementById("formularioEdicion").style.display = "block";
        } else {
            mostrarMensaje("Producto no encontrado", "error");
        }
    };
}

export function guardarCambios() {
    const codigo = document.getElementById("codigoEditar").value;
    const nombre = document.getElementById("nombreEditar").value;
    const categoria = document.getElementById("categoriaEditar").value;
    const marca = document.getElementById("marcaEditar").value;

    const transaction = db.transaction(["productos"], "readwrite");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.put({
        codigo,
        nombre,
        categoria,
        marca
    });

    request.onsuccess = () => {
        mostrarMensaje("Producto actualizado correctamente", "exito");
        cargarDatosEnTabla();
    };

    request.onerror = () => {
        mostrarMensaje("Error al actualizar el producto", "error");
    };
}

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
    document.getElementById("codigoInventario").value = "";
    document.getElementById("nombreInventario").value = "";
    document.getElementById("cantidadTipo").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("fechaCaducidad").value = "";
    document.getElementById("comentarios").value = "";
    document.getElementById("datosInventario").style.display = "none";
    
    // Remover el input de lote si existe
    const loteInput = document.getElementById("loteInventario");
    if (loteInput) {
        loteInput.remove();
    }
}


// funcion para guardar productos en la base de datos para inventariar
// Actualizar la función guardarInventario para manejar lotes
export function guardarInventario() {
    const codigo = document.getElementById("codigoInventario").value;
    const lote = document.getElementById("loteInventario")?.value || "1";
    
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = event => {
        const producto = event.target.result;
        if (producto) {
            const inventarioData = {
                id: `${codigo}-${lote}`, // Crear ID único combinando código y lote
                codigo: producto.codigo,
                nombre: producto.nombre,
                categoria: producto.categoria,
                marca: producto.marca,
                lote: lote,
                tipoQuantidad: document.getElementById("cantidadTipo").value,
                cantidad: document.getElementById("cantidad").value,
                fechaCaducidad: document.getElementById("fechaCaducidad").value,
                comentarios: document.getElementById("comentarios").value
            };

            const inventarioTransaction = dbInventario.transaction(
                ["inventario"],
                "readwrite"
            );
            const inventarioObjectStore = inventarioTransaction.objectStore(
                "inventario"
            );
            
            const addRequest = inventarioObjectStore.put(inventarioData);

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
    const codigo = document.getElementById("codigoInventario").value;
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
    document.getElementById("codigoInventario").value = productoOriginal.codigo;
    document.getElementById("nombreProductoInventario").value = productoOriginal.nombre;
    // Limpiar campos de inventario
    document.getElementById("cantidadTipo").value = "";
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
    document.getElementById("codigoInventario").value = "";
    document.getElementById("nombreInventario").value = "";
    document.getElementById("marcaInventario").value = "";
    document.getElementById("datosInventario").style.display = "none";
}
