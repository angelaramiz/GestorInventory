
# GestorInventory

GestorInventory es un sistema de gestión de productos basado en web que permite consultar, editar, gestionar inventario y manejar archivos CSV de productos directamente en el navegador. Utiliza tecnologías modernas como JavaScript, IndexedDB para almacenamiento local y QuaggaJS para escaneo de códigos de barras.

## Características

- **Consulta de Productos**: Búsqueda de productos por categoría, código, nombre o marca.
- **Edición de Productos**: Modificación de atributos de productos existentes.
- **Gestión de Inventario**: Actualización de inventarios con atributos como cantidad, tipo de cantidad, fecha de caducidad y comentarios.
- **Manejo de Archivos CSV**: Carga y descarga de plantillas CSV para productos e inventario.
- **Escaneo de Códigos de Barras**: Utilización de QuaggaJS para leer códigos de barras desde la cámara del dispositivo.
- **Generación de Reportes**: Opción para generar y descargar hojas de inventario en formato CSV o PDF.

## Requisitos

- Navegador web moderno con soporte para IndexedDB y acceso a cámara (Chrome, Firefox, Edge, Safari).
- Conexión a internet para cargar las dependencias externas (QuaggaJS, SweetAlert2, jsPDF).

## Estructura del Proyecto

- `index.html`: Página principal con enlaces a todas las funcionalidades.
- `js/`:
  - `main.js`: Punto de entrada principal y manejo de eventos.
  - `db-operations.js`: Operaciones relacionadas con IndexedDB.
  - `product-operations.js`: Lógica de manejo de productos.
  - `scanner.js`: Configuración y manejo del escáner de códigos de barras.
  - `logs.js`: Funciones para mostrar mensajes y alertas.
- `plantillas/`: Archivos HTML para cada funcionalidad (consulta, editar, inventario, agregar, archivos).

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/GestorInventory.git
   ```
2. Navega al directorio del proyecto:
   ```
   cd GestorInventory
   ```
3. Abre `index.html` en tu navegador web preferido.

## Uso

1. Desde la página principal, selecciona la funcionalidad deseada:
   - Consulta de Producto
   - Editar Producto
   - Inventario
   - Agregar Productos
   - Administración de Archivos
2. Sigue las instrucciones en pantalla para cada funcionalidad.
3. Utiliza el escáner de códigos de barras cuando esté disponible para una entrada rápida de datos.

## Solución de Problemas

- **La cámara no funciona**: Asegúrate de que tu navegador tenga permisos para acceder a la cámara del dispositivo.
- **Errores al cargar CSV**: Verifica que el archivo CSV esté en el formato correcto y no esté vacío.
- **La base de datos no se inicializa**: Asegúrate de que tu navegador soporte IndexedDB y no tenga el almacenamiento local desactivado.

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de crear un pull request.

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.
