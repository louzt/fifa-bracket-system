// URL de la API
const API_URL = '';

/**
 * Función para hacer peticiones a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Datos a enviar en la petición
 * @returns {Promise<object|null>} - Respuesta de la API o null si hay error
 */
async function fetchAPI(endpoint, method = 'GET', data = null) {
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
                
            throw new Error(errorMessage);
        }
        
        // Asegurarnos que la respuesta sea parseable como JSON
        try {
            return await response.json();
        } catch (jsonError) {
            console.error('Error al parsear respuesta JSON:', jsonError);
            throw new Error('El servidor respondió con un formato incorrecto');
        }
    } catch (error) {
        console.error('Error en fetchAPI:', error, 'Endpoint:', endpoint, 'Método:', method);
        if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('error', `Error: ${error.message}`);
        }
        return null;
    }
}

/**
 * Función para mostrar mensajes temporales
 * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
 * @param {string} texto - Texto del mensaje
 */
function mostrarMensaje(tipo, texto) {
    const mensajeDiv = document.getElementById('mensaje');
    if (!mensajeDiv) {
        console.error('No se encontró el elemento para mostrar mensajes');
        return;
    }
    
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = texto;
    mensajeDiv.classList.add('visible');
    
    setTimeout(() => {
        mensajeDiv.classList.remove('visible');
    }, 3000);
}
