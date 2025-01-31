
```markdown
# GestorInventory

GestorInventory es un sistema de gestión de inventario basado en web que permite administrar productos e inventarios utilizando tecnologías modernas como JavaScript y IndexedDB para almacenamiento local.

## Características principales

### Gestión de Productos
- Agregar nuevos productos
- Consultar productos por código, nombre o categoría
- Editar información de productos existentes
- Eliminar productos

### Gestión de Inventario
- Registrar entradas de inventario con:
  - Cantidad y tipo de cantidad
  - Fecha de caducidad
  - Comentarios
  - Número de lote
- Manejo de múltiples lotes por producto
- Control de existencias

### Importación/Exportación
- Carga de productos mediante archivos CSV
- Exportación de productos e inventario a CSV
- Generación de reportes de inventario en PDF y CSV
- Plantillas descargables para carga masiva

### Escaneo de códigos
- Escaneo de códigos de barras para entrada rápida de datos
- Compatible con cámaras web

## Estructura del Proyecto

```
├── index.html          # Página principal
├── js/
│   ├── db-operations.js # Operaciones de base de datos
│   ├── logs.js          # Sistema de mensajes
│   ├── main.js          # Lógica principal
│   ├── product-operations.js # Operaciones de productos
│   └── scanner.js       # Funcionalidad de escaneo
└── plantillas/
    ├── agregar.html     # Agregar productos
    ├── archivos.html    # Gestión de archivos
    ├── consulta.html    # Consulta de productos
    ├── editar.html      # Edición de productos
    └── inventario.html  # Registro de inventario
```

## Requisitos

- Navegador moderno con soporte para:
  - IndexedDB
  - WebRTC (para escaneo)
- Conexión a internet para cargar dependencias externas

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/GestorInventory.git
   ```

2. Navegar al directorio del proyecto:
   ```bash
   cd GestorInventory
   ```

3. Abrir `index.html` en tu navegador preferido

## Uso

Desde la página principal puedes acceder a las siguientes funcionalidades:
- Agregar productos
- Consultar productos
- Editar productos
- Registrar inventario
- Gestionar archivos CSV
- Generar reportes

## Notas importantes

- La aplicación utiliza IndexedDB para almacenamiento local
- Se requieren permisos de cámara para el escaneo de códigos
- Los archivos CSV deben seguir el formato especificado en las plantillas
- Los reportes de inventario pueden filtrarse y ordenarse según diferentes criterios

## Solución de problemas

- **Problemas con la cámara**: Verificar permisos del navegador
- **Errores de CSV**: Validar formato y codificación del archivo
- **Problemas de base de datos**: Limpiar caché del navegador o resetear bases de datos desde la sección de archivos
```

Este nuevo README refleja mejor la estructura actual del proyecto y sus funcionalidades, proporcionando una visión más clara de las capacidades del sistema y cómo utilizarlo.
