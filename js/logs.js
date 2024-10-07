
//importaciones
import { cargarDatosEnTabla } from './db-operations.js';

// Funciones de mensajes y alertas

export function mostrarMensaje(mensaje, tipo) {
    // Mapear "exito" a "success" para SweetAlert2
    const iconType = tipo === "exito" ? "success" : tipo;
    Swal.fire({
        title: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        text: mensaje,
        icon: iconType,
        timer: 1000,
        showConfirmButton: false
    });
}

//
export function mostrarResultadoCarga(successCount, errorCount) {
    const mensaje = `Carga completada. ${successCount} productos agregados/actualizados. ${errorCount} errores.`;
    Swal.fire({
        title: errorCount > 0 ? "Advertencia" : "Éxito",
        text: mensaje,
        icon: errorCount > 0 ? "warning" : "success",
        timer: 1000,
        showConfirmButton: false
    });
    cargarDatosEnTabla();
}