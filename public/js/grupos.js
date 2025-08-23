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
const tablaGrupoA = document.getElementById('tablaGrupoA');
const tablaGrupoB = document.getElementById('tablaGrupoB');
const tablaGrupoC = document.getElementById('tablaGrupoC');

const partidosGrupoA = document.getElementById('partidosGrupoA');
const partidosGrupoB = document.getElementById('partidosGrupoB');
const partidosGrupoC = document.getElementById('partidosGrupoC');

const btnRegistrarPartidoGrupoA = document.getElementById('btnRegistrarPartidoGrupoA');
const btnRegistrarPartidoGrupoB = document.getElementById('btnRegistrarPartidoGrupoB');
const btnRegistrarPartidoGrupoC = document.getElementById('btnRegistrarPartidoGrupoC');

const modalPartidoGrupo = document.getElementById('modalPartidoGrupo');
const formPartidoGrupo = document.getElementById('formPartidoGrupo');
const grupoActualInput = document.getElementById('grupoActual');
const jugador1GrupoSelect = document.getElementById('jugador1Grupo');
const jugador2GrupoSelect = document.getElementById('jugador2Grupo');
const btnCancelarPartidoGrupo = document.getElementById('btnCancelarPartidoGrupo');

// Funciones para cargar los datos de los grupos
async function cargarGrupos() {
    const grupos = await fetchAPI('/api/grupos');
    if (!grupos) return;
    
    // Limpiar tablas
    tablaGrupoA.innerHTML = '';
    tablaGrupoB.innerHTML = '';
    tablaGrupoC.innerHTML = '';
    
    partidosGrupoA.innerHTML = '';
    partidosGrupoB.innerHTML = '';
    partidosGrupoC.innerHTML = '';
    
    // Si no hay grupos, mostrar mensaje
    if (grupos.length === 0) {
        const mensaje = 'No se han generado los grupos. Ve a la página de inicio para generarlos.';
        tablaGrupoA.innerHTML = `<tr><td colspan="9" class="table-cell text-center py-4 text-error">${mensaje}</td></tr>`;
        tablaGrupoB.innerHTML = `<tr><td colspan="9" class="table-cell text-center py-4 text-error">${mensaje}</td></tr>`;
        tablaGrupoC.innerHTML = `<tr><td colspan="9" class="table-cell text-center py-4 text-error">${mensaje}</td></tr>`;
        
        btnRegistrarPartidoGrupoA.disabled = true;
        btnRegistrarPartidoGrupoB.disabled = true;
        btnRegistrarPartidoGrupoC.disabled = true;
        
        return;
    }
    
    // Cargar cada grupo
    grupos.forEach(grupo => {
        let tabla, partidosContainer, jugadoresOrdenados;
        
        // Determinar qué elementos corresponden a este grupo
        if (grupo.nombre === 'Grupo A') {
            tabla = tablaGrupoA;
            partidosContainer = partidosGrupoA;
        } else if (grupo.nombre === 'Grupo B') {
            tabla = tablaGrupoB;
            partidosContainer = partidosGrupoB;
        } else if (grupo.nombre === 'Grupo C') {
            tabla = tablaGrupoC;
            partidosContainer = partidosGrupoC;
        } else {
            return;
        }
        
        // Ordenar jugadores por puntos
        jugadoresOrdenados = ordenarJugadoresPorPuntos(grupo.jugadores);
        
        // Llenar tabla con jugadores
        jugadoresOrdenados.forEach((jugador, index) => {
            const tr = document.createElement('tr');
            const partidosJugados = jugador.victorias + jugador.empates + jugador.derrotas;
            const diferenciaGoles = jugador.golesFavor - jugador.golesContra;
            
            tr.innerHTML = `
                <td class="table-cell ${index < 2 ? 'font-bold bg-green-900/60 text-gamer-neon' : ''} nombre-jugador">${jugador.nombre}</td>
                <td class="table-cell ${index < 2 ? 'font-bold bg-green-900/60 text-gamer-neon' : ''}">${jugador.puntos}</td>
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
            
            tabla.appendChild(tr);
        });
        
        // Cargar partidos del grupo
        if (grupo.partidos && grupo.partidos.length > 0) {
            grupo.partidos.forEach(partido => {
                const partidoDiv = document.createElement('div');
                partidoDiv.className = 'partido-reciente';
                
                partidoDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gamer-neon">${partido.jugador1.nombre}</span>
                        <span class="font-bold px-2 text-white">${partido.golesJugador1} - ${partido.golesJugador2}</span>
                        <span class="font-medium text-gamer-neon">${partido.jugador2.nombre}</span>
                    </div>
                `;
                
                partidosContainer.appendChild(partidoDiv);
            });
        } else {
            partidosContainer.innerHTML = '<p class="text-center text-sm text-gamer-blue py-2">No hay partidos registrados</p>';
        }
    });
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

// Funciones para registrar partidos
function abrirModalPartido(grupo) {
    grupoActualInput.value = grupo;
    
    // Buscar los jugadores del grupo
    fetchAPI('/api/grupos').then(grupos => {
        if (!grupos) return;
        
        const grupoSeleccionado = grupos.find(g => g.nombre === `Grupo ${grupo}`);
        if (!grupoSeleccionado) return;
        
        // Limpiar selectores
        jugador1GrupoSelect.innerHTML = '<option value="">Selecciona jugador</option>';
        jugador2GrupoSelect.innerHTML = '<option value="">Selecciona jugador</option>';
        
        // Agregar jugadores a los selectores
        grupoSeleccionado.jugadores.forEach(jugador => {
            const option1 = document.createElement('option');
            option1.value = JSON.stringify(jugador);
            option1.textContent = jugador.nombre;
            jugador1GrupoSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = JSON.stringify(jugador);
            option2.textContent = jugador.nombre;
            jugador2GrupoSelect.appendChild(option2);
        });
        
        // Mostrar modal
        modalPartidoGrupo.classList.remove('hidden');
    });
}

async function registrarPartidoGrupo(e) {
    e.preventDefault();
    
    const grupo = grupoActualInput.value;
    
    // Verificar que se hayan seleccionado jugadores
    if (!jugador1GrupoSelect.value || !jugador2GrupoSelect.value) {
        mostrarMensaje('error', 'Debes seleccionar ambos jugadores');
        return;
    }
    
    const jugador1 = JSON.parse(jugador1GrupoSelect.value);
    const jugador2 = JSON.parse(jugador2GrupoSelect.value);
    const golesJugador1 = parseInt(document.getElementById('golesJugador1Grupo').value);
    const golesJugador2 = parseInt(document.getElementById('golesJugador2Grupo').value);
    
    if (jugador1._id === jugador2._id) {
        mostrarMensaje('error', 'No puedes registrar un partido entre el mismo jugador');
        return;
    }
    
    // Verificar que los grupos existan y sean consistentes
    const grupos = await fetchAPI('/api/grupos');
    const grupoSeleccionado = grupos.find(g => g.nombre === `Grupo ${grupo}`);
    
    if (!grupoSeleccionado) {
        mostrarMensaje('error', 'Grupo no encontrado');
        return;
    }
    
    // Verificar si el partido ya existe
    const partidoExistente = grupoSeleccionado.partidos && grupoSeleccionado.partidos.some(p => 
        (p.jugador1._id === jugador1._id && p.jugador2._id === jugador2._id) ||
        (p.jugador1._id === jugador2._id && p.jugador2._id === jugador1._id)
    );
    
    if (partidoExistente) {
        mostrarMensaje('error', 'Este partido ya ha sido registrado');
        return;
    }
    
    // Crear objeto de partido
    const partido = { 
        jugador1, 
        jugador2, 
        golesJugador1, 
        golesJugador2,
        grupo
    };
    
    // Guardar partido
    const partidoGuardado = await fetchAPI('/api/partidos', 'POST', partido);
    if (partidoGuardado) {
        mostrarMensaje('success', 'Partido registrado correctamente');
        formPartidoGrupo.reset();
        modalPartidoGrupo.classList.add('hidden');
        
        // Recargar grupos para mostrar el nuevo partido y estadísticas actualizadas
        setTimeout(() => cargarGrupos(), 500); // Pequeño retraso para asegurar que la BD se actualice
    }
}

// Función para sincronizar datos de jugadores con grupos
async function sincronizarDatosGrupos() {
    mostrarMensaje('success', 'Sincronizando datos de grupos...');
    
    try {
        // Endpoint para sincronizar jugadores en los grupos
        await fetchAPI('/api/grupos/sincronizar', 'POST');
        
        // Recargar los datos de los grupos
        cargarGrupos();
        
        mostrarMensaje('success', 'Datos actualizados correctamente');
    } catch (error) {
        console.error('Error al sincronizar grupos:', error);
        mostrarMensaje('error', 'Error al actualizar los datos');
    }
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    cargarGrupos();
    
    // Botón de actualizar datos
    const btnActualizarGrupos = document.getElementById('btnActualizarGrupos');
    if (btnActualizarGrupos) {
        btnActualizarGrupos.addEventListener('click', sincronizarDatosGrupos);
    }
    
    btnRegistrarPartidoGrupoA.addEventListener('click', () => abrirModalPartido('A'));
    btnRegistrarPartidoGrupoB.addEventListener('click', () => abrirModalPartido('B'));
    btnRegistrarPartidoGrupoC.addEventListener('click', () => abrirModalPartido('C'));
    
    btnCancelarPartidoGrupo.addEventListener('click', () => {
        formPartidoGrupo.reset();
        modalPartidoGrupo.classList.add('hidden');
    });
    
    formPartidoGrupo.addEventListener('submit', registrarPartidoGrupo);
});
