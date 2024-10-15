
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
// Funciones para inventario
export function buscarProductoInventario() {
    const codigo = document.getElementById("codigoInventario").value;
    const nombre = document.getElementById("nombreInventario").value;
    const marca = document.getElementById("marcaInventario").value;

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

        mostrarResultadosInventario(resultados);
    };

    request.onerror = event => {
        console.error("Error al buscar productos:", event.target.error);
        Swal.fire({
            title: "Error",
            text: "Error al buscar productos",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
        });
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

export function limpiarFormularioInventario() {
    document.getElementById("codigoInventario").value = "";
    document.getElementById("nombreInventario").value = "";
    document.getElementById("cantidadTipo").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("fechaCaducidad").value = "";
    document.getElementById("comentarios").value = "";
    document.getElementById("datosInventario").style.display = "none";
}

// Función para guardar inventario en nueva base de datos
export function guardarInventario() {
    const codigo = document.getElementById("codigoInventario").value;
    const transaction = db.transaction(["productos"], "readonly");
    const objectStore = transaction.objectStore("productos");
    const request = objectStore.get(codigo);

    request.onsuccess = event => {
        const producto = event.target.result;
        if (producto) {
            const inventarioData = {
                codigo: producto.codigo,
                nombre: producto.nombre,
                categoria: producto.categoria,
                marca: producto.marca,
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
                    text: "Inventario guardado correctamente",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: false
                });
                // Limpiar el formulario y ocultarlo
                limpiarFormularioInventario();
            };
            addRequest.onerror = error => {
                console.error("Error al guardar el inventario:", error);
                Swal.fire({
                    title: "Error",
                    text: "Error al guardar el inventario",
                    icon: "error",
                    timer: 1000,
                    showConfirmButton: false
                });
            };
        } else {
            Swal.fire({
                title: "Error",
                text: "Producto no encontrado",
                icon: "error",
                timer: 1000,
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
            timer: 1000,
            showConfirmButton: false
        });
    };
}