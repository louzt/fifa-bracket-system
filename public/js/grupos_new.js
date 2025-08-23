// Funciones de utilidad
// fetchAPI se importa desde fetchAPI.js

// Función para mostrar mensajes temporales
function mostrarMensaje(tipo, mensaje) {
    const div = document.createElement('div');
    div.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        tipo === 'success' ? 'bg-green-500' : 
        tipo === 'info' ? 'bg-blue-500' : 'bg-red-500'
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

// Función para sincronizar los datos de los jugadores con los grupos
async function sincronizarDatos() {
    try {
        const resultado = await fetchAPI('/api/grupos/sincronizar', 'POST');
        if (resultado && resultado.success) {
            mostrarMensaje('success', resultado.message || 'Datos sincronizados correctamente');
            await cargarGrupos();
        } else {
            mostrarMensaje('error', 'Error al sincronizar los datos');
        }
    } catch (error) {
        console.error('Error al sincronizar datos:', error);
        mostrarMensaje('error', 'Error al sincronizar los datos');
    }
}

// Funciones para cargar los datos de los grupos
async function cargarGrupos() {
    try {
        // Mostrar mensajes de carga
        tablaGrupoA.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-gamer-blue">Cargando datos...</td></tr>';
        tablaGrupoB.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-gamer-blue">Cargando datos...</td></tr>';
        tablaGrupoC.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-gamer-blue">Cargando datos...</td></tr>';
        
        partidosGrupoA.innerHTML = '<p class="text-center text-sm text-gamer-blue py-2">Cargando partidos...</p>';
        partidosGrupoB.innerHTML = '<p class="text-center text-sm text-gamer-blue py-2">Cargando partidos...</p>';
        partidosGrupoC.innerHTML = '<p class="text-center text-sm text-gamer-blue py-2">Cargando partidos...</p>';
        
        // Obtener los datos de los grupos desde la API
        const grupos = await fetchAPI('/api/grupos');
        if (!grupos) {
            mostrarMensaje('error', 'Error al cargar los datos de los grupos');
            return;
        }
        
        // Mostrar los datos en las tablas
        mostrarDatosGrupos(grupos);
        
    } catch (error) {
        console.error("Error al cargar grupos:", error);
        mostrarMensaje('error', 'Error al cargar los datos de los grupos');
        
        // Mostrar mensajes de error en las tablas
        tablaGrupoA.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-error">Error al cargar los datos</td></tr>';
        tablaGrupoB.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-error">Error al cargar los datos</td></tr>';
        tablaGrupoC.innerHTML = '<tr><td colspan="9" class="table-cell text-center py-4 text-error">Error al cargar los datos</td></tr>';
        
        partidosGrupoA.innerHTML = '<p class="text-center text-sm text-error py-2">Error al cargar partidos</p>';
        partidosGrupoB.innerHTML = '<p class="text-center text-sm text-error py-2">Error al cargar partidos</p>';
        partidosGrupoC.innerHTML = '<p class="text-center text-sm text-error py-2">Error al cargar partidos</p>';
    }
}

// Función para mostrar los partidos de un grupo
function mostrarPartidosGrupo(grupo, partidosContainer) {
    if (!grupo || !partidosContainer) {
        console.error('Parámetros inválidos para mostrar partidos');
        return;
    }
    
    if (grupo.partidos && grupo.partidos.length > 0) {
        // Limpiar cualquier contenido anterior
        partidosContainer.innerHTML = '';
        
        // Ordenar partidos por fecha (más reciente primero)
        const partidosOrdenados = [...grupo.partidos].sort((a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
            const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
            return fechaB - fechaA; // Ordenar descendente
        });
        
        partidosOrdenados.forEach(partido => {
            try {
                // Asegurarse de tener los datos completos de jugadores
                if (!partido.jugador1 || !partido.jugador2 || 
                    typeof partido.golesJugador1 === 'undefined' || 
                    typeof partido.golesJugador2 === 'undefined') {
                    console.error('Partido con datos incompletos:', partido);
                    return;
                }
                
                // Acceder a los nombres con seguridad
                const nombreJugador1 = partido.jugador1.nombre || 'Jugador 1';
                const nombreJugador2 = partido.jugador2.nombre || 'Jugador 2';
                
                const partidoDiv = document.createElement('div');
                partidoDiv.className = 'partido-reciente mb-2 p-2 bg-gray-800/40 rounded';
                
                // Formatear fecha si está disponible
                let fechaStr = '';
                if (partido.fecha) {
                    const fecha = new Date(partido.fecha);
                    if (!isNaN(fecha)) {
                        fechaStr = `<div class="text-xs text-gray-400 mt-1">${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
                    }
                }
                
                // Añadir marcador y destacar ganador
                const esEmpate = partido.golesJugador1 === partido.golesJugador2;
                const claseJugador1 = esEmpate ? 'text-gray-300' : (partido.golesJugador1 > partido.golesJugador2 ? 'text-gamer-neon font-bold' : 'text-gray-400');
                const claseJugador2 = esEmpate ? 'text-gray-300' : (partido.golesJugador2 > partido.golesJugador1 ? 'text-gamer-neon font-bold' : 'text-gray-400');
                
                partidoDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="${claseJugador1}">${nombreJugador1}</span>
                        <span class="font-bold px-2 text-white">${partido.golesJugador1} - ${partido.golesJugador2}</span>
                        <span class="${claseJugador2}">${nombreJugador2}</span>
                    </div>
                    ${fechaStr}
                `;
                
                partidosContainer.appendChild(partidoDiv);
            } catch (error) {
                console.error('Error al mostrar partido:', error, partido);
            }
        });
    } else {
        partidosContainer.innerHTML = '<p class="text-center text-sm text-gamer-blue py-2">No hay partidos registrados</p>';
    }
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
    // Obtener referencia al botón
    const btnActualizarGrupos = document.getElementById('btnActualizarGrupos');
    
    // Mostrar indicador visual de carga
    if (btnActualizarGrupos) {
        const textoOriginal = btnActualizarGrupos.innerHTML;
        btnActualizarGrupos.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Actualizando...';
        btnActualizarGrupos.disabled = true;
    }
    
    mostrarMensaje('info', 'Sincronizando datos de grupos...');
    
    try {
        // Primer paso: sincronizar estadísticas de jugadores en los grupos
        const resultadoSincronizacion = await fetchAPI('/api/grupos/sincronizar', 'POST');
        
        if (!resultadoSincronizacion) {
            throw new Error("No se pudo sincronizar los datos");
        }
        
        // Segundo paso: obtener los grupos actualizados con sus partidos
        // En vez de usar cargarGrupos() que podría tener problemas con la variable 'grupos',
        // hacemos la carga aquí directamente
        const grupos = await fetchAPI('/api/grupos');
        if (!grupos || !Array.isArray(grupos)) {
            throw new Error("No se pudieron cargar los grupos correctamente");
        }
        
        // Ahora que tenemos los grupos, mostrar los datos
        mostrarDatosGrupos(grupos);
        
        // Mensaje de éxito con detalles del resultado
        const mensaje = resultadoSincronizacion?.message || 'Datos actualizados correctamente';
        const detalles = resultadoSincronizacion?.detalles ? 
            `: ${resultadoSincronizacion.detalles.jugadoresActualizados || 0} jugadores y ${resultadoSincronizacion.detalles.partidosActualizados || 0} partidos actualizados` : '';
            
        mostrarMensaje('success', `${mensaje}${detalles}`);
    } catch (error) {
        console.error('Error al sincronizar grupos:', error);
        mostrarMensaje('error', 'Error al actualizar los datos: ' + (error.message || 'Error desconocido'));
    } finally {
        // Restaurar el botón
        if (btnActualizarGrupos) {
            btnActualizarGrupos.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Actualizar Datos';
            btnActualizarGrupos.disabled = false;
        }
    }
}

// Nueva función separada para mostrar los datos de los grupos
function mostrarDatosGrupos(grupos) {
    if (!grupos || !Array.isArray(grupos)) {
        console.error("No hay datos de grupos para mostrar");
        return;
    }
    
    // Limpiar tablas
    tablaGrupoA.innerHTML = '';
    tablaGrupoB.innerHTML = '';
    tablaGrupoC.innerHTML = '';
    
    partidosGrupoA.innerHTML = '';
    partidosGrupoB.innerHTML = '';
    partidosGrupoC.innerHTML = '';
    
    // Verificar si hay grupos para mostrar
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
        let tabla, partidosContainer;
        
        // Determinar qué elementos corresponden a este grupo
        if (grupo.nombre === 'Grupo A') {
            tabla = tablaGrupoA;
            partidosContainer = partidosGrupoA;
            btnRegistrarPartidoGrupoA.disabled = false;
        } else if (grupo.nombre === 'Grupo B') {
            tabla = tablaGrupoB;
            partidosContainer = partidosGrupoB;
            btnRegistrarPartidoGrupoB.disabled = false;
        } else if (grupo.nombre === 'Grupo C') {
            tabla = tablaGrupoC;
            partidosContainer = partidosGrupoC;
            btnRegistrarPartidoGrupoC.disabled = false;
        } else {
            return;
        }
        
        // Ordenar jugadores por puntos
        const jugadoresOrdenados = ordenarJugadoresPorPuntos(grupo.jugadores);
        
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
        mostrarPartidosGrupo(grupo, partidosContainer);
    });
}

// Event Listeners
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificar que todos los elementos del DOM existen
        if (!tablaGrupoA || !tablaGrupoB || !tablaGrupoC || 
            !partidosGrupoA || !partidosGrupoB || !partidosGrupoC || 
            !btnRegistrarPartidoGrupoA || !btnRegistrarPartidoGrupoB || !btnRegistrarPartidoGrupoC || 
            !modalPartidoGrupo || !formPartidoGrupo || !grupoActualInput || 
            !jugador1GrupoSelect || !jugador2GrupoSelect || !btnCancelarPartidoGrupo) {
            console.error("Error: No se encontraron todos los elementos del DOM necesarios");
            return;
        }

        // Al cargar la página, primero cargar los grupos y luego sincronizar
        await cargarGrupos();
        
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
    } catch (error) {
        console.error("Error al inicializar la página de grupos:", error);
        mostrarMensaje('error', 'Error al cargar la página. Por favor, recarga.');
    }
});
