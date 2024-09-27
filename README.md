# GestorInventory

Este es un sistema de gestión de productos que permite consultar, editar, gestionar inventario y manejar archivos CSV de productos directamente en el navegador utilizando JavaScript, IndexedDB y QuaggaJS.

## Características

- **Consulta de Productos**: Búsqueda de productos por categoría, código, nombre o marca.
- **Edición de Productos**: Modificación de atributos de productos existentes.
- **Gestión de Inventario**: Actualización de inventarios con atributos como cantidad, fecha de caducidad, y comentarios.
- **Manejo de Archivos CSV**: Carga y descarga de plantillas CSV.
- **Escaneo de Códigos de Barras**: Utilización de QuaggaJS para leer códigos de barras desde la cámara del dispositivo.

## Requisitos

- Navegador moderno con soporte para IndexedDB y acceso a cámara (Chrome, Firefox, Edge).
- Conexión a internet para cargar QuaggaJS desde CDN o acceso local al archivo `assets/Quagga.min.js`.

## Instalación

1. Clonar el repositorio o descargar los archivos necesarios.
2. Abrir `index.html` en un navegador compatible.

## Uso

1. Navegar al menú principal.
2. Seleccionar la opción deseada (consulta, edición, inventario, archivos).
3. Para la consulta, utiliza los campos de búsqueda o el escáner de códigos de barras.
4. Para la edición, modifica los atributos y guarda los cambios.
5. Para inventario, actualiza los datos de productos y añade nueva información.
6. Para archivos, carga o descarga archivos CSV como plantillas de datos.

## Problemas Comunes

- **Cámara no disponible**: Asegúrate de que el navegador tenga permisos para acceder a la cámara.
- **Error al cargar CSV**: Verifica que el archivo CSV esté en el formato correcto y no esté vacío.
