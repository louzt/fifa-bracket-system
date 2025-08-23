# Xtreame 2025 - Aplicación para Torneos FIFA

Xtreame 2025 es una aplicación local para gestionar torneos de FIFA, permitiendo organizar fases de grupos y eliminatorias, registrar resultados y ver estadísticas de los participantes.

## Características

- **Gestión de Participantes:** Añadir, editar y eliminar jugadores.
- **Registro de Partidos:** Registrar los resultados de los encuentros.
- **Fase de Grupos:** Generación automática de 3 grupos (A, B, C) para 10 participantes.
- **Fase Eliminatoria:** Sistema de eliminatorias con semifinales y final.
- **Estadísticas:** Ver puntos, victorias, derrotas, goles a favor/en contra y más.
- **Clasificación General:** Tabla de clasificación ordenada por puntos.
- **Máximos Goleadores:** Seguimiento de los jugadores con más goles.

## Tecnologías Utilizadas

- **Frontend:** HTML, CSS (Tailwind CSS), JavaScript
- **Backend:** Node.js, Express
- **Base de Datos:** NeDB (base de datos local en archivos)

## Estructura del Proyecto

```
Xtreame2025/
├── data/                  # Directorio para archivos de base de datos
├── public/                # Archivos públicos (frontend)
│   ├── css/               # Estilos compilados
│   ├── js/                # JavaScript del cliente
│   └── *.html             # Páginas HTML
├── src/                   # Código fuente
│   └── css/               # Archivos fuente de CSS (Tailwind)
├── server.js              # Servidor Express
├── package.json           # Dependencias y scripts
└── tailwind.config.js     # Configuración de Tailwind CSS
```

## Instalación

1. Clona este repositorio:
   ```
   git clone <url-repositorio>
   cd Xtreame2025
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Compila los estilos CSS:
   ```
   npm run build:css
   ```

4. Inicia el servidor en modo desarrollo:
   ```
   npm run dev
   ```

5. Abre tu navegador en `http://localhost:3000`

## Guía de Uso

### 1. Página de Inicio

- **Agregar Jugadores:** Registra a los 10 participantes del torneo.
- **Registrar Partidos Amistosos:** Puedes añadir partidos que no sean de grupo o eliminatorias.
- **Generar Grupos:** Crea automáticamente los 3 grupos (A con 4 jugadores, B y C con 3 jugadores cada uno).

### 2. Fase de Grupos

- Registra los resultados de los partidos de cada grupo.
- Los dos primeros de cada grupo avanzarán a la fase eliminatoria.

### 3. Fase Eliminatoria

- **Semifinal 1:** 1° Grupo A vs 1° Grupo B
- **Clasificatoria:** 2° Grupo A vs 2° Grupo C
- **Semifinal 2:** 1° Grupo C vs Ganador Clasificatoria
- **Final:** Ganadores de las semifinales

### 4. Estadísticas

- Consulta la tabla de clasificación general
- Máximos goleadores
- Promedio de goles por partido
- Historial completo de partidos

## Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, por favor abre primero un issue para discutir qué te gustaría cambiar.

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)
