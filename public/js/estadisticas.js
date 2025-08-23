// Funciones de utilidad
// fetchAPI se importa desde fetchAPI.js

// Función para mostrar mensajes temporales
function mostrarMensaje(tipo, mensaje) {
    const div = document.createElement('div');
    div.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(div);
        }, 500);
    }, 3000);
}

// Variables y elementos del DOM
const tablaClasificacion = document.getElementById('tablaClasificacion');
const maximosGoleadores = document.getElementById('maximosGoleadores');
const promedioGoles = document.getElementById('promedioGoles');
const historialPartidos = document.getElementById('historialPartidos');
const mejorOfensiva = document.getElementById('mejorOfensiva');
const mejorDefensiva = document.getElementById('mejorDefensiva');
const rachas = document.getElementById('rachas');

// Funciones para cargar estadísticas
async function cargarEstadisticas() {
    const [jugadores, partidos] = await Promise.all([
        fetchAPI('/api/jugadores'),
        fetchAPI('/api/partidos')
    ]);
    
    if (!jugadores || !partidos) return;
    
    // Cargar clasificación general
    cargarClasificacionGeneral(jugadores);
    
    // Cargar máximos goleadores
    cargarMaximosGoleadores(jugadores);
    
    // Cargar promedio de goles por partido
    cargarPromedioGoles(jugadores, partidos);
    
    // Cargar historial de partidos
    cargarHistorialPartidos(partidos);
    
    // Cargar mejor ofensiva y defensiva
    cargarEficienciaOfensivaDefensiva(jugadores);
    
    // Cargar rachas
    cargarRachas(jugadores, partidos);
}

function cargarClasificacionGeneral(jugadores) {
    tablaClasificacion.innerHTML = '';
    
    if (jugadores.length === 0) {
        tablaClasificacion.innerHTML = '<tr><td colspan="10" class="table-cell text-center py-4">No hay jugadores registrados</td></tr>';
        return;
    }
    
    // Ordenar jugadores por puntos
    const jugadoresOrdenados = ordenarJugadoresPorPuntos(jugadores);
    
    jugadoresOrdenados.forEach((jugador, index) => {
        const tr = document.createElement('tr');
        const partidosJugados = jugador.victorias + jugador.empates + jugador.derrotas;
        const diferenciaGoles = jugador.golesFavor - jugador.golesContra;
        
        tr.innerHTML = `
            <td class="table-cell">${index + 1}</td>
            <td class="table-cell">
                <div>
                    <p class="font-medium text-white">${jugador.nombre}</p>
                    <p class="text-xs text-gamer-blue">${jugador.equipo}</p>
                </div>
            </td>
            <td class="table-cell font-bold text-gamer-neon">${jugador.puntos}</td>
            <td class="table-cell">${partidosJugados}</td>
            <td class="table-cell">${jugador.victorias}</td>
            <td class="table-cell">${jugador.empates}</td>
            <td class="table-cell">${jugador.derrotas}</td>
            <td class="table-cell">${jugador.golesFavor}</td>
            <td class="table-cell">${jugador.golesContra}</td>
            <td class="table-cell ${diferenciaGoles > 0 ? 'text-green-400' : diferenciaGoles < 0 ? 'text-red-400' : ''}">
                ${diferenciaGoles > 0 ? '+' : ''}${diferenciaGoles}
            </td>
        `;
        
        tablaClasificacion.appendChild(tr);
    });
}

function cargarMaximosGoleadores(jugadores) {
    maximosGoleadores.innerHTML = '';
    
    if (jugadores.length === 0) {
        maximosGoleadores.innerHTML = '<p class="text-center py-4">No hay jugadores registrados</p>';
        return;
    }
    
    // Ordenar jugadores por goles
    const jugadoresOrdenados = [...jugadores].sort((a, b) => b.golesFavor - a.golesFavor);
    
    // Tomar los 5 primeros o menos si no hay suficientes
    const top5 = jugadoresOrdenados.slice(0, 5);
    
    top5.forEach((jugador, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 partido-reciente mb-2';
        
        div.innerHTML = `
            <div class="flex items-center">
                <div class="bg-gamer-blue text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold">
                    ${index + 1}
                </div>
                <div>
                    <p class="font-medium text-white">${jugador.nombre}</p>
                    <p class="text-xs text-gamer-blue">${jugador.equipo}</p>
                </div>
            </div>
            <div class="font-bold text-lg text-gamer-neon glow-text">${jugador.golesFavor}</div>
        `;
        
        maximosGoleadores.appendChild(div);
    });
}

function cargarPromedioGoles(jugadores, partidos) {
    promedioGoles.innerHTML = '';
    
    if (jugadores.length === 0 || partidos.length === 0) {
        promedioGoles.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        return;
    }
    
    // Calcular promedio de goles por partido
    const totalGoles = partidos.reduce((sum, partido) => sum + partido.golesJugador1 + partido.golesJugador2, 0);
    const promedioGeneral = totalGoles / partidos.length;
    
    // Crear estadísticas por jugador
    const estadisticasJugadores = jugadores.map(jugador => {
        const partidosJugados = jugador.victorias + jugador.empates + jugador.derrotas;
        return {
            nombre: jugador.nombre,
            equipo: jugador.equipo,
            promedio: partidosJugados > 0 ? jugador.golesFavor / partidosJugados : 0
        };
    }).sort((a, b) => b.promedio - a.promedio);
    
    // Estadística general
    const divGeneral = document.createElement('div');
    divGeneral.className = 'p-4 partido-reciente mb-4';
    divGeneral.innerHTML = `
        <h4 class="font-bold text-lg mb-2 text-gamer-neon">Promedio General</h4>
        <div class="flex justify-between items-center">
            <span class="text-white">Total de partidos:</span>
            <span class="font-medium text-gamer-blue">${partidos.length}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-white">Total de goles:</span>
            <span class="font-medium text-gamer-blue">${totalGoles}</span>
        </div>
        <div class="flex justify-between items-center mt-2">
            <span class="text-white">Promedio por partido:</span>
            <span class="font-bold text-lg text-gamer-neon glow-text">${promedioGeneral.toFixed(2)}</span>
        </div>
    `;
    promedioGoles.appendChild(divGeneral);
    
    // Top 3 jugadores con mejor promedio
    const top3 = estadisticasJugadores.filter(j => j.promedio > 0).slice(0, 3);
    
    if (top3.length > 0) {
        const divTop = document.createElement('div');
        divTop.className = 'p-4 bg-gray-800 rounded-lg shadow-neon-blue border border-gamer-blue/30';
        divTop.innerHTML = `<h4 class="font-bold text-lg mb-2 text-gamer-neon">Mejores Promedios</h4>`;
        
        top3.forEach((jugador, index) => {
            const jugadorDiv = document.createElement('div');
            jugadorDiv.className = 'flex justify-between items-center mb-2';
            jugadorDiv.innerHTML = `
                <div>
                    <p class="font-medium text-white">${jugador.nombre}</p>
                    <p class="text-xs text-gamer-blue">${jugador.equipo}</p>
                </div>
                <div class="font-bold text-gamer-neon">${jugador.promedio.toFixed(2)}</div>
            `;
            divTop.appendChild(jugadorDiv);
        });
        
        promedioGoles.appendChild(divTop);
    }
}

function cargarHistorialPartidos(partidos) {
    historialPartidos.innerHTML = '';
    
    if (partidos.length === 0) {
        historialPartidos.innerHTML = '<p class="text-center py-4">No hay partidos registrados</p>';
        return;
    }
    
    // Ordenar partidos por fecha (más recientes primero)
    const partidosOrdenados = [...partidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    partidosOrdenados.forEach(partido => {
        const div = document.createElement('div');
        div.className = 'partido-reciente mb-3';
        
        const fecha = new Date(partido.fecha);
        const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="text-sm text-gamer-neon">${fechaFormateada}</div>
                ${partido.grupo ? `<div class="text-sm font-medium bg-gamer-blue/50 text-white px-2 py-1 rounded">Grupo ${partido.grupo}</div>` : ''}
            </div>
            <div class="flex justify-between items-center mt-2">
                <div class="flex-1">
                    <p class="font-bold text-white">${partido.jugador1.nombre}</p>
                    <p class="text-sm text-gamer-blue">${partido.jugador1.equipo}</p>
                </div>
                <div class="px-4">
                    <span class="text-xl font-bold text-gamer-neon glow-text">${partido.golesJugador1} - ${partido.golesJugador2}</span>
                </div>
                <div class="flex-1 text-right">
                    <p class="font-bold text-white">${partido.jugador2.nombre}</p>
                    <p class="text-sm text-gamer-blue">${partido.jugador2.equipo}</p>
                </div>
            </div>
        `;
        
        historialPartidos.appendChild(div);
    });
}

function cargarEficienciaOfensivaDefensiva(jugadores) {
    mejorOfensiva.innerHTML = '';
    mejorDefensiva.innerHTML = '';
    
    if (jugadores.length === 0) {
        mejorOfensiva.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        mejorDefensiva.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        return;
    }
    
    // Filtrar jugadores con partidos jugados
    const jugadoresConPartidos = jugadores.filter(j => (j.victorias + j.empates + j.derrotas) > 0);
    
    if (jugadoresConPartidos.length === 0) {
        mejorOfensiva.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        mejorDefensiva.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        return;
    }
    
    // Calcular estadísticas de eficiencia
    const estadisticas = jugadoresConPartidos.map(jugador => {
        const partidosJugados = jugador.victorias + jugador.empates + jugador.derrotas;
        return {
            ...jugador,
            promedioGolesFavor: jugador.golesFavor / partidosJugados,
            promedioGolesContra: jugador.golesContra / partidosJugados
        };
    });
    
    // Ordenar por mejor ofensiva (más goles por partido)
    const mejorOfensivaJugadores = [...estadisticas]
        .sort((a, b) => b.promedioGolesFavor - a.promedioGolesFavor)
        .slice(0, 3);
    
    // Ordenar por mejor defensiva (menos goles en contra por partido)
    const mejorDefensivaJugadores = [...estadisticas]
        .sort((a, b) => a.promedioGolesContra - b.promedioGolesContra)
        .slice(0, 3);
    
    // Mostrar mejores ofensivas
    mejorOfensivaJugadores.forEach((jugador, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 partido-reciente mb-2';
        
        div.innerHTML = `
            <div>
                <p class="font-medium text-white">${jugador.nombre}</p>
                <p class="text-xs text-gamer-blue">${jugador.equipo}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg text-gamer-neon glow-text">${jugador.promedioGolesFavor.toFixed(2)}</p>
                <p class="text-xs text-gamer-blue">goles por partido</p>
            </div>
        `;
        
        mejorOfensiva.appendChild(div);
    });
    
    // Mostrar mejores defensivas
    mejorDefensivaJugadores.forEach((jugador, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 partido-reciente mb-2';
        
        div.innerHTML = `
            <div>
                <p class="font-medium text-white">${jugador.nombre}</p>
                <p class="text-xs text-gamer-blue">${jugador.equipo}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg text-gamer-neon glow-text">${jugador.promedioGolesContra.toFixed(2)}</p>
                <p class="text-xs text-gamer-blue">goles en contra por partido</p>
            </div>
        `;
        
        mejorDefensiva.appendChild(div);
    });
}

function cargarRachas(jugadores, partidos) {
    rachas.innerHTML = '';
    
    if (jugadores.length === 0 || partidos.length === 0) {
        rachas.innerHTML = '<p class="text-center py-4">No hay datos suficientes</p>';
        return;
    }
    
    // Aquí implementaríamos la lógica para calcular rachas de victoria, derrota, etc.
    // pero requeriría más datos sobre los partidos en orden cronológico por jugador
    // Por ahora mostramos un mensaje
    
    rachas.innerHTML = `
        <div class="p-4 bg-gray-800 rounded-lg shadow-neon-blue border border-gamer-blue/30">
            <p class="text-center text-gamer-neon">Las rachas se calcularán cuando haya más partidos registrados</p>
        </div>
    `;
}

function ordenarJugadoresPorPuntos(jugadores) {
    return [...jugadores].sort((a, b) => {
        // Ordenar primero por puntos
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        
        // En caso de empate, por diferencia de goles
        const difGolA = a.golesFavor - a.golesContra;
        const difGolB = b.golesFavor - b.golesContra;
        if (difGolB !== difGolA) return difGolB - difGolA;
        
        // En caso de empate, por goles a favor
        return b.golesFavor - a.golesFavor;
    });
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
});
