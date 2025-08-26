// Migración del archivo fetchAPI.js para la aplicación Astro
// URL de la API (vacía para rutas relativas)
const API_URL = '';

/**
 * Función para hacer peticiones a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Datos a enviar en la petición
 * @returns {Promise<object|null>} - Respuesta de la API o null si hay error
 */
export async function fetchAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        try {
            options.body = JSON.stringify(data);
        } catch (err) {
            console.error('Error al convertir datos a JSON:', err, data);
            mostrarMensaje('error', 'Error al procesar los datos de la solicitud');
            return null;
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!response) {
            console.error('La respuesta de fetch es undefined o null');
            throw new Error('No se recibió respuesta del servidor');
        }
        
        if (!response.ok) {
            // Intentar obtener más detalles del error
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || errorData.error || '';
            } catch (e) {
                // Si no se puede parsear el JSON, simplemente usamos el status
            }
            
            const errorMessage = errorDetails 
                ? `Error ${response.status}: ${errorDetails}`
                : `Error en la petición: ${response.status}`;
                
            console.error(errorMessage);
            mostrarMensaje('error', errorMessage);
            return null;
        }

        // Intentar parsear la respuesta como JSON
        try {
            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Error al parsear JSON de la respuesta:', err);
            mostrarMensaje('error', 'Error al procesar la respuesta del servidor');
            return null;
        }
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        
        // Diferentes tipos de errores de red
        if (error.name === 'TypeError') {
            mostrarMensaje('error', 'Error de conexión. Verifica tu conexión a internet.');
        } else if (error.name === 'AbortError') {
            mostrarMensaje('error', 'La petición fue cancelada');
        } else {
            mostrarMensaje('error', `Error: ${error.message}`);
        }
        
        return null;
    }
}

/**
 * Función para mostrar mensajes al usuario
 * @param {string} tipo - Tipo de mensaje ('success', 'error', 'info', 'warning')
 * @param {string} mensaje - Mensaje a mostrar
 */
export function mostrarMensaje(tipo, mensaje) {
    // Crear el elemento del mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform`;
    
    // Estilos según el tipo
    switch (tipo) {
        case 'success':
            messageDiv.className += ' bg-green-600 text-white';
            break;
        case 'error':
            messageDiv.className += ' bg-red-600 text-white';
            break;
        case 'warning':
            messageDiv.className += ' bg-yellow-600 text-white';
            break;
        case 'info':
        default:
            messageDiv.className += ' bg-blue-600 text-white';
            break;
    }
    
    messageDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${mensaje}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                ✕
            </button>
        </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(messageDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Funciones específicas para cada endpoint
export const api = {
    // Jugadores
    async obtenerJugadores() {
        return await fetchAPI('/api/jugadores');
    },
    
    async obtenerJugador(id) {
        return await fetchAPI(`/api/jugadores/${id}`);
    },
    
    async crearJugador(jugador) {
        return await fetchAPI('/api/jugadores', 'POST', jugador);
    },
    
    async actualizarJugador(id, jugador) {
        return await fetchAPI(`/api/jugadores/${id}`, 'PUT', jugador);
    },
    
    async eliminarJugador(id) {
        return await fetchAPI(`/api/jugadores/${id}`, 'DELETE');
    },
    
    // Grupos
    async obtenerGrupos() {
        return await fetchAPI('/api/grupos');
    },
    
    async generarGrupos() {
        return await fetchAPI('/api/grupos/generar', 'POST');
    },
    
    async sincronizarGrupos() {
        return await fetchAPI('/api/grupos/sincronizar', 'POST');
    },
    
    // Partidos
    async obtenerPartidos() {
        return await fetchAPI('/api/partidos');
    },
    
    async registrarPartido(partido) {
        return await fetchAPI('/api/partidos', 'POST', partido);
    },
    
    // Eliminatorias
    async obtenerEliminatorias() {
        return await fetchAPI('/api/eliminatorias');
    },
    
    async generarEliminatorias() {
        return await fetchAPI('/api/eliminatorias/generar', 'POST');
    },
    
    async actualizarFaseEliminatorias(fase, resultado) {
        return await fetchAPI(`/api/eliminatorias/${fase}`, 'PUT', resultado);
    },
    
    // Equipos y sorteo
    async obtenerEquipos() {
        return await fetchAPI('/api/equipos');
    },
    
    async obtenerEquiposDisponibles() {
        return await fetchAPI('/api/equipos/disponibles');
    },
    
    async obtenerEquiposAsignados() {
        return await fetchAPI('/api/equipos/asignados');
    },
    
    async asignarEquipo(jugador, equipo) {
        return await fetchAPI('/api/equipos/asignar', 'POST', { jugador, equipo });
    },

    // Sorteo
    async sortearTodosEquipos() {
        return await fetchAPI('/api/sorteo/todos', 'POST');
    },

    async resetearSorteo() {
        return await fetchAPI('/api/sorteo/reset', 'POST');
    },

    async configurarTorneo(config) {
        return await fetchAPI('/api/torneo/configurar', 'POST', config);
    }
};
