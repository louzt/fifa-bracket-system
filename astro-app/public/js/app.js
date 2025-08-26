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

// Función para mostrar mensajes con contenido HTML
function mostrarMensajeHTML(tipo, mensaje) {
    const div = document.createElement('div');
    div.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white max-w-md`;
    div.innerHTML = mensaje;
    document.body.appendChild(div);
    
    // Para mensajes de error, mostramos por más tiempo
    const tiempoVisible = tipo === 'error' ? 8000 : 3000;
    
    setTimeout(() => {
        div.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(div);
        }, 500);
    }, tiempoVisible);
}

// Variables y elementos del DOM
const btnAgregarJugador = document.getElementById('btnAgregarJugador');
const formAgregarJugador = document.getElementById('formAgregarJugador');
const jugadorForm = document.getElementById('jugadorForm');
const btnCancelarJugador = document.getElementById('btnCancelarJugador');
const tablaJugadores = document.getElementById('tablaJugadores');

const btnAgregarPartido = document.getElementById('btnAgregarPartido');
const formAgregarPartido = document.getElementById('formAgregarPartido');
const partidoForm = document.getElementById('partidoForm');
const btnCancelarPartido = document.getElementById('btnCancelarPartido');
const listaPartidos = document.getElementById('listaPartidos');
const jugador1Select = document.getElementById('jugador1');
const jugador2Select = document.getElementById('jugador2');

const btnGenerarGrupos = document.getElementById('btnGenerarGrupos');
const btnGenerarEliminatorias = document.getElementById('btnGenerarEliminatorias');
const btnResetearTorneo = document.getElementById('btnResetearTorneo');

const modalConfirmacion = document.getElementById('modalConfirmacion');
const modalTitulo = document.getElementById('modalTitulo');
const modalMensaje = document.getElementById('modalMensaje');
const btnCancelarModal = document.getElementById('btnCancelarModal');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');

// Funciones para jugadores
async function cargarJugadores() {
    const jugadores = await fetchAPI('/api/jugadores');
    if (!jugadores) return;
    
    tablaJugadores.innerHTML = '';
    
    if (jugadores.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="table-cell text-center py-4 text-gray-500">No hay jugadores registrados</td>`;
        tablaJugadores.appendChild(tr);
        return;
    }
    
    jugadores.forEach(jugador => {
        const tr = document.createElement('tr');
        const partidosJugados = jugador.victorias + jugador.empates + jugador.derrotas;
        
        // Determinar qué mostrar en la celda de equipo
        let equipoDisplay = jugador.equipo;
        if (!equipoDisplay || equipoDisplay === 'null' || equipoDisplay === 'undefined') {
            equipoDisplay = '<span class="text-gray-400 italic">Sin equipo</span>';
        }
        
        tr.innerHTML = `
            <td class="table-cell"><span class="nombre-jugador">${jugador.nombre}</span></td>
            <td class="table-cell">${equipoDisplay}</td>
            <td class="table-cell font-bold">${jugador.puntos || 0}</td>
            <td class="table-cell">${partidosJugados || 0}</td>
            <td class="table-cell">
                <button class="text-blue-400 hover:text-blue-200 mr-2 editar-jugador" data-id="${jugador._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-400 hover:text-red-200 eliminar-jugador" data-id="${jugador._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tablaJugadores.appendChild(tr);
    });
    
    // Actualizar selectores de jugadores
    actualizarSelectoresJugadores(jugadores);
    
    // Agregar event listeners a los botones de editar y eliminar
    document.querySelectorAll('.editar-jugador').forEach(btn => {
        btn.addEventListener('click', () => editarJugador(btn.dataset.id));
    });
    
    document.querySelectorAll('.eliminar-jugador').forEach(btn => {
        btn.addEventListener('click', () => confirmarEliminarJugador(btn.dataset.id));
    });
}

function actualizarSelectoresJugadores(jugadores) {
    // Limpiar selectores
    jugador1Select.innerHTML = '<option value="">Selecciona jugador</option>';
    jugador2Select.innerHTML = '<option value="">Selecciona jugador</option>';
    
    // Agregar jugadores a los selectores
    jugadores.forEach(jugador => {
        const option1 = document.createElement('option');
        option1.value = JSON.stringify(jugador);
        option1.textContent = jugador.nombre;
        jugador1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = JSON.stringify(jugador);
        option2.textContent = jugador.nombre;
        jugador2Select.appendChild(option2);
    });
}

async function guardarJugador(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const equipo = document.getElementById('equipo').value.trim();
    
    // Validar que el nombre no esté vacío
    if (!nombre) {
        mostrarMensaje('error', 'El nombre del jugador es obligatorio');
        return;
    }
    
    // Crear objeto jugador (equipo puede estar vacío)
    const jugador = { 
        nombre,
        equipo: equipo || null // Si está vacío, establecer como null explícitamente
    };
    
    try {
        const jugadorGuardado = await fetchAPI('/api/jugadores', 'POST', jugador);
        if (jugadorGuardado) {
            mostrarMensaje('success', 'Jugador guardado correctamente');
            jugadorForm.reset();
            formAgregarJugador.classList.add('hidden');
            cargarJugadores();
        }
    } catch (error) {
        console.error('Error al guardar jugador:', error);
        mostrarMensaje('error', 'Error al guardar el jugador');
    }
}

async function editarJugador(id) {
    try {
        // Obtener datos del jugador
        const jugador = await fetchAPI(`/api/jugadores/${id}`);
        if (!jugador) {
            mostrarMensaje('error', 'Error al obtener los datos del jugador');
            return;
        }

        // Obtener los equipos para el selector
        let equipos = await fetchAPI('/api/equipos');
        if (!Array.isArray(equipos)) {
            equipos = equiposFIFA || []; // Usar la variable global si está disponible
        }

        // Mostrar el modal
        const modalEditarJugador = document.getElementById('modalEditarJugador');
        const formEditarJugador = document.getElementById('formEditarJugador');
        const editarJugadorId = document.getElementById('editarJugadorId');
        const editarNombre = document.getElementById('editarNombre');
        const editarEquipo = document.getElementById('editarEquipo');
        const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

        // Llenar el selector de equipos
        editarEquipo.innerHTML = '<option value="">Sin equipo</option>';
        equipos.forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo.nombre;
            option.textContent = equipo.nombre;
            if (jugador.equipo === equipo.nombre) {
                option.selected = true;
            }
            editarEquipo.appendChild(option);
        });

        // Llenar el formulario con los datos actuales
        editarJugadorId.value = id;
        editarNombre.value = jugador.nombre || '';

        // Mostrar el modal
        modalEditarJugador.classList.remove('hidden');

        // Manejar el envío del formulario
        formEditarJugador.onsubmit = async (e) => {
            e.preventDefault();
            
            const datosActualizados = {
                nombre: editarNombre.value,
                equipo: editarEquipo.value || null
            };
            
            const resultado = await fetchAPI(`/api/jugadores/${id}`, 'PUT', datosActualizados);
            
            if (resultado && resultado.success) {
                mostrarMensaje('success', 'Jugador actualizado correctamente');
                modalEditarJugador.classList.add('hidden');
                cargarJugadores(); // Recargar la tabla de jugadores
            } else {
                mostrarMensaje('error', 'Error al actualizar el jugador');
            }
        };

        // Manejar el botón de cancelar
        btnCancelarEdicion.onclick = () => {
            modalEditarJugador.classList.add('hidden');
        };
    } catch (error) {
        console.error('Error al editar jugador:', error);
        mostrarMensaje('error', 'Error al procesar la solicitud');
    }
}

function confirmarEliminarJugador(id) {
    modalTitulo.textContent = 'Eliminar Jugador';
    modalMensaje.textContent = '¿Estás seguro de que deseas eliminar este jugador? Esta acción no se puede deshacer.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        await eliminarJugador(id);
        modalConfirmacion.classList.add('hidden');
    };
}

async function eliminarJugador(id) {
    const resultado = await fetchAPI(`/api/jugadores/${id}`, 'DELETE');
    if (resultado && resultado.success) {
        mostrarMensaje('success', 'Jugador eliminado correctamente');
        cargarJugadores();
    }
}

// Funciones para partidos
async function cargarPartidos() {
    const partidos = await fetchAPI('/api/partidos');
    if (!partidos) return;
    
    listaPartidos.innerHTML = '';
    
    if (partidos.length === 0) {
        listaPartidos.innerHTML = '<p class="text-center py-4 text-gray-500">No hay partidos registrados</p>';
        return;
    }
    
    // Mostrar solo los últimos 5 partidos
    const ultimosPartidos = partidos.slice(0, 5);
    
    ultimosPartidos.forEach(partido => {
        const div = document.createElement('div');
        div.className = 'partido-reciente shadow-neon-blue';
        
        const fecha = new Date(partido.fecha);
        const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="text-sm text-gamer-neon">${fechaFormateada}</div>
                ${partido.grupo ? `<div class="text-sm text-gamer-blue">Grupo ${partido.grupo}</div>` : ''}
            </div>
            <div class="flex justify-between items-center mt-2">
                <div class="flex-1">
                    <p class="font-bold text-white nombre-jugador">${partido.jugador1.nombre}</p>
                    <p class="text-sm text-gamer-blue">${partido.jugador1.equipo}</p>
                </div>
                <div class="px-4">
                    <span class="text-xl font-bold text-gamer-neon glow-text">${partido.golesJugador1} - ${partido.golesJugador2}</span>
                </div>
                <div class="flex-1 text-right">
                    <p class="font-bold text-white nombre-jugador">${partido.jugador2.nombre}</p>
                    <p class="text-sm text-gamer-blue">${partido.jugador2.equipo}</p>
                </div>
            </div>
        `;
        
        listaPartidos.appendChild(div);
    });
    
    // Si hay más de 5 partidos, agregar botón para ver más
    if (partidos.length > 5) {
        const verMas = document.createElement('button');
        verMas.className = 'w-full text-fifa-blue hover:underline';
        verMas.textContent = 'Ver todos los partidos';
        verMas.onclick = () => window.location.href = '/estadisticas';
        listaPartidos.appendChild(verMas);
    }
}

async function guardarPartido(e) {
    e.preventDefault();
    
    const jugador1 = JSON.parse(document.getElementById('jugador1').value);
    const jugador2 = JSON.parse(document.getElementById('jugador2').value);
    const golesJugador1 = parseInt(document.getElementById('golesJugador1').value);
    const golesJugador2 = parseInt(document.getElementById('golesJugador2').value);
    
    if (jugador1._id === jugador2._id) {
        mostrarMensaje('error', 'No puedes registrar un partido entre el mismo jugador');
        return;
    }
    
    const partido = { jugador1, jugador2, golesJugador1, golesJugador2 };
    
    const partidoGuardado = await fetchAPI('/api/partidos', 'POST', partido);
    if (partidoGuardado) {
        mostrarMensaje('success', 'Partido guardado correctamente');
        partidoForm.reset();
        formAgregarPartido.classList.add('hidden');
        cargarPartidos();
        cargarJugadores(); // Actualizar estadísticas de jugadores
    }
}

// Funciones para el torneo
async function generarGrupos() {
    modalTitulo.textContent = 'Generar Grupos';
    modalMensaje.textContent = '¿Estás seguro de que deseas generar nuevos grupos? Esto borrará los grupos existentes.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        const resultado = await fetchAPI('/api/grupos/generar', 'POST');
        if (resultado) {
            mostrarMensaje('success', 'Grupos generados correctamente');
            setTimeout(() => {
                window.location.href = '/grupos';
            }, 1500);
        }
        modalConfirmacion.classList.add('hidden');
    };
}

async function generarEliminatorias() {
    modalTitulo.textContent = 'Generar Eliminatorias';
    modalMensaje.textContent = '¿Estás seguro de que deseas generar las eliminatorias? Esto tomará los resultados actuales de los grupos.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        try {
            const response = await fetch(`${API_URL}/api/eliminatorias/generar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const resultado = await response.json();
            
            if (!response.ok) {
                if (resultado.error === "No todos los partidos de grupo han sido jugados") {
                    modalConfirmacion.classList.add('hidden');
                    
                    // Mostrar mensaje detallado con partidos faltantes
                    let mensajeFaltantes = "Faltan los siguientes partidos por jugar:<br><ul class='list-disc pl-5 mt-2'>";
                    resultado.partidosFaltantes.forEach(partido => {
                        mensajeFaltantes += `<li>${partido.jugador1} vs ${partido.jugador2} (${partido.grupo})</li>`;
                    });
                    mensajeFaltantes += "</ul>";
                    
                    mostrarMensajeHTML('error', `<div class="font-bold mb-1">No se pueden generar las eliminatorias</div>${mensajeFaltantes}`);
                    return;
                }
                throw new Error(resultado.error || 'Error al generar eliminatorias');
            }
            
            mostrarMensaje('success', 'Eliminatorias generadas correctamente');
            setTimeout(() => {
                window.location.href = '/eliminatorias';
            }, 1500);
        } catch (error) {
            mostrarMensaje('error', `Error: ${error.message}`);
        }
        modalConfirmacion.classList.add('hidden');
    };
}

function confirmarResetearTorneo() {
    modalTitulo.textContent = 'Resetear Torneo';
    modalMensaje.textContent = '¿Estás seguro de que deseas resetear el torneo? Esto eliminará todos los datos de grupos, eliminatorias y resultados. Los jugadores se mantendrán intactos.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        try {
            const resultado = await fetchAPI('/api/torneo/reset', 'POST');
            if (resultado && resultado.success) {
                mostrarMensaje('success', resultado.message || 'Torneo reseteado correctamente');
                
                // Recargar la página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                mostrarMensaje('error', 'Error al resetear el torneo');
            }
        } catch (error) {
            console.error('Error al resetear torneo:', error);
            mostrarMensaje('error', 'Error al resetear el torneo: ' + (error.message || 'Error desconocido'));
        } finally {
            modalConfirmacion.classList.add('hidden');
        }
    };
}

function confirmarResetearCompleto() {
    modalTitulo.textContent = 'Reinicio Completo';
    modalMensaje.textContent = '¡ATENCIÓN! Esto eliminará TODOS los datos: jugadores, grupos, eliminatorias, resultados y sorteos. Esta acción no se puede deshacer.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        try {
            const resultado = await fetchAPI('/api/torneo/reset-completo', 'POST');
            if (resultado && resultado.success) {
                mostrarMensaje('success', resultado.message || 'Reinicio completo exitoso');
                
                // Recargar la página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                mostrarMensaje('error', 'Error al realizar reinicio completo');
            }
        } catch (error) {
            console.error('Error al reiniciar completamente:', error);
            mostrarMensaje('error', 'Error al reiniciar completamente: ' + (error.message || 'Error desconocido'));
        } finally {
            modalConfirmacion.classList.add('hidden');
        }
    };
}

function confirmarSimularTorneo() {
    modalTitulo.textContent = 'Simular Torneo Completo';
    modalMensaje.textContent = '¿Estás seguro de que deseas simular un torneo completo? Esto reseteará el torneo actual y generará automáticamente grupos, partidos y eliminatorias con resultados aleatorios.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        try {
            // Mostrar mensaje de carga
            mostrarMensaje('success', 'Simulando torneo, por favor espera...');
            
            const resultado = await fetchAPI('/api/torneo/simular', 'POST');
            if (resultado && resultado.success) {
                mostrarMensajeHTML('success', `<b>Torneo simulado correctamente</b><br>
                    Se han creado ${resultado.gruposCreados || 'varios'} grupos y se han simulado 
                    ${resultado.partidosSimulados || 'múltiples'} partidos`);
                
                // Recargar la página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 2500);
            } else {
                mostrarMensaje('error', resultado?.error || 'Error al simular el torneo');
            }
        } catch (error) {
            console.error('Error al simular torneo:', error);
            mostrarMensaje('error', 'Error al simular torneo: ' + (error.message || 'Error desconocido'));
        } finally {
            modalConfirmacion.classList.add('hidden');
        }
    };
}

// Función para cargar partidos pendientes
async function cargarPartidosPendientes() {
    const partidosPendientesDiv = document.getElementById('partidosPendientes');
    if (!partidosPendientesDiv) {
        console.log('No se encontró el elemento #partidosPendientes');
        return;
    }
    
    // Mensaje de carga inicial
    partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">Cargando partidos pendientes...</p>';
    
    try {
        // Obtener los grupos
        const grupos = await fetchAPI('/api/grupos');
        if (!grupos) {
            console.error('Error al cargar los grupos: grupos es null o undefined');
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">Error al cargar los grupos</p>';
            return;
        }
        
        if (grupos.length === 0) {
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay grupos generados</p>';
            return;
        }
        
        // Obtener todos los jugadores para tener datos actualizados
        let jugadores;
        try {
            jugadores = await fetchAPI('/api/jugadores');
            if (!jugadores) {
                console.error('Error al cargar jugadores: jugadores es null o undefined');
                partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">Error al cargar datos de jugadores</p>';
                return;
            }
            
            if (!Array.isArray(jugadores)) {
                console.error('Error: jugadores no es un array', jugadores);
                partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">Error en formato de datos de jugadores</p>';
                return;
            }
            
            if (jugadores.length === 0) {
                partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay jugadores registrados</p>';
                return;
            }
        } catch (err) {
            console.error('Error al procesar jugadores:', err);
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-red-400">Error al procesar datos de jugadores</p>';
            return;
        }
        
        // Crear lista de partidos pendientes
        let partidosPendientes = [];
        
        // Verificación adicional de grupos
        if (!Array.isArray(grupos)) {
            console.error('Error: grupos no es un array', grupos);
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-red-400">Error en el formato de los grupos</p>';
            return;
        }
        
        grupos.forEach(grupo => {
            // Verificar que el grupo tenga la estructura correcta
            if (!grupo || !grupo.nombre) {
                console.error('Grupo sin nombre o inválido:', grupo);
                return;
            }
            
            if (!grupo.jugadores || !Array.isArray(grupo.jugadores)) {
                console.error(`Grupo "${grupo.nombre}" no tiene jugadores o jugadores no es un array`);
                return;
            }
            
            // Filtrar jugadores nulos o indefinidos
            const jugadoresGrupo = grupo.jugadores.filter(jugador => jugador && typeof jugador === 'object');
            
            if (jugadoresGrupo.length < 2) {
                console.log(`Grupo "${grupo.nombre}" tiene menos de 2 jugadores, se omite`);
                return;
            }
            
            // Crear todas las combinaciones posibles de partidos
            for (let i = 0; i < jugadoresGrupo.length; i++) {
                for (let j = i + 1; j < jugadoresGrupo.length; j++) {
                    // Verificación exhaustiva de IDs de jugador
                    const jugador1 = jugadoresGrupo[i];
                    const jugador2 = jugadoresGrupo[j];
                    
                    if (!jugador1 || !jugador1._id || !jugador2 || !jugador2._id) {
                        console.error('Jugador sin ID en grupo:', grupo.nombre, 
                                     'Jugador 1:', jugador1, 
                                     'Jugador 2:', jugador2);
                        continue;
                    }
                    
                    let partidoJugado = false;
                    
                    // Verificar si el partido ya se jugó
                    if (grupo.partidos && Array.isArray(grupo.partidos)) {
                        const id1 = jugador1._id;
                        const id2 = jugador2._id;
                        
                        partidoJugado = grupo.partidos.some(partido => {
                            // Verificación exhaustiva para evitar errores
                            return partido && 
                                   partido.jugador1 && partido.jugador1._id && 
                                   partido.jugador2 && partido.jugador2._id &&
                                  ((partido.jugador1._id === id1 && partido.jugador2._id === id2) || 
                                   (partido.jugador1._id === id2 && partido.jugador2._id === id1));
                        });
                    }
                    
                    if (!partidoJugado) {
                        // Buscar los datos actualizados de los jugadores con verificación adicional
                        let jugador1Actualizado, jugador2Actualizado;
                        
                        try {
                            const jugador1EnGrupo = jugadoresGrupo[i];
                            const jugador2EnGrupo = jugadoresGrupo[j];
                            
                            // Verificar y buscar jugador 1
                            if (jugador1EnGrupo && jugador1EnGrupo._id) {
                                const idJugador1 = jugador1EnGrupo._id;
                                jugador1Actualizado = jugadores.find(jugador => jugador && jugador._id && jugador._id === idJugador1);
                                // Si no se encuentra, usar los datos originales siempre que sean válidos
                                if (!jugador1Actualizado && jugador1EnGrupo.nombre) {
                                    jugador1Actualizado = jugador1EnGrupo;
                                }
                            }
                            
                            // Verificar y buscar jugador 2
                            if (jugador2EnGrupo && jugador2EnGrupo._id) {
                                const idJugador2 = jugador2EnGrupo._id;
                                jugador2Actualizado = jugadores.find(jugador => jugador && jugador._id && jugador._id === idJugador2);
                                // Si no se encuentra, usar los datos originales siempre que sean válidos
                                if (!jugador2Actualizado && jugador2EnGrupo.nombre) {
                                    jugador2Actualizado = jugador2EnGrupo;
                                }
                            }
                        } catch (err) {
                            console.error('Error al buscar jugadores actualizados:', err);
                        }
                        
                        // Verificar que ambos jugadores tengan datos válidos antes de añadirlos
                        if (jugador1Actualizado && jugador2Actualizado && 
                            jugador1Actualizado.nombre && jugador2Actualizado.nombre) {
                            partidosPendientes.push({
                                grupo: grupo.nombre.replace('Grupo ', ''),
                                jugador1: jugador1Actualizado,
                                jugador2: jugador2Actualizado
                            });
                        }
                    }
                }
            }
        });
        
        if (partidosPendientes.length === 0) {
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">¡Todos los partidos de grupo han sido jugados!</p>';
            return;
        }
        
        // Mostrar los partidos pendientes
        partidosPendientesDiv.innerHTML = '';
        
        // Verificar que haya partidos pendientes válidos
        const partidosValidos = partidosPendientes.filter(partido => 
            partido && partido.jugador1 && partido.jugador1.nombre && 
            partido.jugador2 && partido.jugador2.nombre);
            
        if (partidosValidos.length === 0) {
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay partidos pendientes con datos válidos</p>';
            return;
        }
        
        // Mostrar los primeros 5 partidos válidos
        partidosValidos.slice(0, 5).forEach(partido => {
            const div = document.createElement('div');
            div.className = 'partido-reciente shadow-neon-blue hover:shadow-neon-blue/80 transition-all';
            
            try {
                // Verificación adicional antes de mostrar el partido
                if (!partido || !partido.grupo || !partido.jugador1?.nombre || !partido.jugador2?.nombre) {
                    console.error('Datos de partido incompletos:', partido);
                    return;
                }
                
                div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div class="text-gamer-neon">Grupo ${partido.grupo}</div>
                        <button class="btn-registrar-partido text-xs bg-gamer-blue/50 hover:bg-gamer-blue text-white px-3 py-1 rounded-md transition-colors" 
                                data-grupo="${partido.grupo}" 
                                data-jugador1='${JSON.stringify(partido.jugador1)}' 
                                data-jugador2='${JSON.stringify(partido.jugador2)}'>
                            <i class="fas fa-plus-circle mr-1"></i> Registrar resultado
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex-1">
                            <p class="font-bold text-white nombre-jugador">${partido.jugador1.nombre}</p>
                            <p class="text-sm text-gamer-blue">${partido.jugador1.equipo || 'Sin equipo'}</p>
                        </div>
                        <div class="px-4">
                            <span class="text-lg font-bold text-gamer-blue">VS</span>
                        </div>
                        <div class="flex-1 text-right">
                            <p class="font-bold text-white nombre-jugador">${partido.jugador2.nombre}</p>
                            <p class="text-sm text-gamer-blue">${partido.jugador2.equipo || 'Sin equipo'}</p>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error al generar HTML del partido:', error, partido);
                div.innerHTML = '<p class="text-red-500">Error al mostrar este partido</p>';
            }
            
            partidosPendientesDiv.appendChild(div);
            
            // Añadir event listener al botón
            div.querySelector('.btn-registrar-partido')?.addEventListener('click', function() {
                try {
                    const grupo = this.getAttribute('data-grupo');
                    const jugador1Data = this.getAttribute('data-jugador1');
                    const jugador2Data = this.getAttribute('data-jugador2');
                    
                    if (!jugador1Data || !jugador2Data) {
                        console.error('Datos de jugadores faltantes en botón');
                        return;
                    }
                    
                    const jugador1 = JSON.parse(jugador1Data);
                    const jugador2 = JSON.parse(jugador2Data);
                    
                    // Abrir modal para registrar partido
                    abrirModalRegistroRapido(grupo, jugador1, jugador2);
                } catch (error) {
                    console.error('Error al procesar click en registro de partido:', error);
                    alert('Error al abrir el formulario de registro. Por favor, intenta nuevamente.');
                }
            });
        });
        
        // Si hay más de 5 partidos pendientes válidos, mostrar botón para ver más
        if (partidosValidos.length > 5) {
            const masPartidosDiv = document.createElement('div');
            masPartidosDiv.className = 'text-center mt-3';
            masPartidosDiv.innerHTML = `<a href="/grupos" class="text-gamer-neon hover:underline">Ver todos los ${partidosValidos.length} partidos pendientes</a>`;
            partidosPendientesDiv.appendChild(masPartidosDiv);
        }
    } catch (error) {
        console.error('Error cargando partidos pendientes:', error);
        
        // Mostrar detalles del error para facilitar depuración
        let mensajeError = 'Error al cargar los partidos pendientes';
        if (error && error.message) {
            mensajeError += ': ' + error.message;
        }
        
        // Formatear mensaje de error con más información pero amigable para usuario
        partidosPendientesDiv.innerHTML = `
            <div class="text-center py-4">
                <p class="text-red-400 font-bold">${mensajeError}</p>
                <p class="text-gamer-blue text-sm mt-1">Por favor, recarga la página o contacta al administrador.</p>
            </div>
        `;
    }
}

// Función para abrir modal de registro rápido de resultado
function abrirModalRegistroRapido(grupo, jugador1, jugador2) {
    try {
        // Validar que los datos necesarios estén presentes
        if (!grupo || !jugador1 || !jugador2 || !jugador1.nombre || !jugador2.nombre) {
            console.error('Datos incompletos para registro de partido:', { grupo, jugador1, jugador2 });
            alert('No se pueden cargar los datos de los jugadores. Por favor, intenta nuevamente.');
            return;
        }
        
        // Verificar si ya existe un modal de registro rápido, si no, crearlo
        let modalRegistroRapido = document.getElementById('modalRegistroRapido');
    
        if (!modalRegistroRapido) {
            try {
                // Crear modal
                modalRegistroRapido = document.createElement('div');
                modalRegistroRapido.id = 'modalRegistroRapido';
                modalRegistroRapido.className = 'fixed inset-0 bg-gray-900 bg-opacity-80 hidden z-50 flex items-center justify-center';
                modalRegistroRapido.innerHTML = `
                    <div class="bg-dark-card p-6 rounded-2xl shadow-neon-blue max-w-md w-full border border-gamer-blue">
                        <h3 class="text-lg font-bold mb-4 text-gamer-neon">Registrar Resultado</h3>
                        <form id="formRegistroRapido">
                            <input type="hidden" id="rapidoGrupo">
                            <input type="hidden" id="rapidoJugador1">
                            <input type="hidden" id="rapidoJugador2">
                            
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="font-bold text-white" id="nombreJugador1">Jugador 1</p>
                                    <p class="text-sm text-gamer-blue mb-2" id="equipoJugador1">Equipo</p>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Goles</label>
                                        <input type="number" id="rapidoGolesJugador1" class="input-field" min="0" required>
                                    </div>
                                </div>
                                <div>
                                    <p class="font-bold text-white" id="nombreJugador2">Jugador 2</p>
                                    <p class="text-sm text-gamer-blue mb-2" id="equipoJugador2">Equipo</p>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Goles</label>
                                        <input type="number" id="rapidoGolesJugador2" class="input-field" min="0" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-end space-x-2">
                                <button type="button" id="btnCancelarRegistroRapido" class="btn-warning">Cancelar</button>
                                <button type="submit" class="btn-success">Guardar</button>
                            </div>
                        </form>
                    </div>
                `;
                
                document.body.appendChild(modalRegistroRapido);
                
                // Agregar eventos
                document.getElementById('btnCancelarRegistroRapido')?.addEventListener('click', () => {
                    document.getElementById('formRegistroRapido')?.reset();
                    modalRegistroRapido.classList.add('hidden');
                });
                
                document.getElementById('formRegistroRapido')?.addEventListener('submit', registrarPartidoRapido);
            } catch (err) {
                console.error('Error al crear modal de registro rápido:', err);
                alert('Error al preparar el formulario. Por favor, recarga la página e intenta nuevamente.');
                return;
            }
        }
        
        try {
            // Rellenar datos del formulario
            document.getElementById('rapidoGrupo').value = grupo;
            document.getElementById('rapidoJugador1').value = JSON.stringify(jugador1);
            document.getElementById('rapidoJugador2').value = JSON.stringify(jugador2);
            
            document.getElementById('nombreJugador1').textContent = jugador1.nombre;
            document.getElementById('equipoJugador1').textContent = jugador1.equipo || 'Sin equipo';
            document.getElementById('nombreJugador2').textContent = jugador2.nombre;
            document.getElementById('equipoJugador2').textContent = jugador2.equipo || 'Sin equipo';
            
            // Mostrar modal
            modalRegistroRapido.classList.remove('hidden');
        } catch (err) {
            console.error('Error al rellenar datos del formulario:', err);
            alert('Error al cargar los datos de los jugadores. Por favor, intenta nuevamente.');
        }
    } catch (err) {
        console.error('Error general en abrirModalRegistroRapido:', err);
        alert('Ocurrió un error inesperado. Por favor, recarga la página e intenta nuevamente.');
    }
}

// Función para registrar partido rápidamente
async function registrarPartidoRapido(e) {
    e.preventDefault();
    
    try {
        // Validar que los elementos existen en el DOM
        const rapidoGrupoEl = document.getElementById('rapidoGrupo');
        const rapidoJugador1El = document.getElementById('rapidoJugador1');
        const rapidoJugador2El = document.getElementById('rapidoJugador2');
        const rapidoGolesJugador1El = document.getElementById('rapidoGolesJugador1');
        const rapidoGolesJugador2El = document.getElementById('rapidoGolesJugador2');
        
        if (!rapidoGrupoEl || !rapidoJugador1El || !rapidoJugador2El || !rapidoGolesJugador1El || !rapidoGolesJugador2El) {
            console.error('Faltan elementos en el formulario');
            alert('Error en el formulario. Por favor, recarga la página e intenta nuevamente.');
            return;
        }
        
        const grupo = rapidoGrupoEl.value;
        
        // Usar try-catch para el parse JSON
        let jugador1, jugador2;
        try {
            jugador1 = JSON.parse(rapidoJugador1El.value);
            jugador2 = JSON.parse(rapidoJugador2El.value);
        } catch (err) {
            console.error('Error al parsear datos de jugadores:', err);
            alert('Error en los datos del partido. Por favor, recarga la página e intenta nuevamente.');
            return;
        }
        
        // Validar que los valores sean números
        const golesJugador1 = parseInt(rapidoGolesJugador1El.value);
        const golesJugador2 = parseInt(rapidoGolesJugador2El.value);
        
        if (isNaN(golesJugador1) || isNaN(golesJugador2) || golesJugador1 < 0 || golesJugador2 < 0) {
            alert('Los goles deben ser números no negativos');
            return;
        }
        
        // Validar que los datos están completos
        if (!jugador1._id || !jugador2._id) {
            console.error('Datos incompletos de jugadores:', jugador1, jugador2);
            alert('Datos de jugadores incompletos. Por favor, recarga la página e intenta nuevamente.');
            return;
        }
        
        // Crear objeto partido
        const partido = { 
            jugador1, 
            jugador2, 
            golesJugador1, 
            golesJugador2,
            grupo
        };
        
        // Enviar partido a la API con manejo de errores
        try {
            const partidoGuardado = await fetchAPI('/api/partidos', 'POST', partido);
            
            if (partidoGuardado) {
                mostrarMensaje('success', 'Resultado registrado correctamente');
                
                // Cerrar modal y resetear formulario
                const modalRegistroRapido = document.getElementById('modalRegistroRapido');
                document.getElementById('formRegistroRapido')?.reset();
                modalRegistroRapido?.classList.add('hidden');
                
                // Recargar datos
                setTimeout(() => {
                    cargarPartidos();
                    cargarJugadores();
                    cargarPartidosPendientes();
                }, 500);
            } else {
                throw new Error('La API no devolvió datos');
            }
        } catch (err) {
            console.error('Error al guardar partido:', err);
            alert('Error al guardar el resultado. Por favor, intenta nuevamente.');
        }
    } catch (err) {
        console.error('Error general al registrar partido rápido:', err);
        alert('Ocurrió un error inesperado. Por favor, recarga la página e intenta nuevamente.');
    }
}

// Función para cargar equipos en el selector
function cargarEquiposEnSelect() {
    const equipoSelect = document.getElementById('equipo');
    if (!equipoSelect) return;
    
    // Asegurarse de que equiposFIFA esté disponible (definido en el HTML)
    if (typeof equiposFIFA !== 'undefined' && Array.isArray(equiposFIFA)) {
        // Mantener la opción "Sin equipo"
        equipoSelect.innerHTML = '<option value="">-- Sin equipo --</option>';
        
        // Ordenar equipos alfabéticamente
        const equiposOrdenados = [...equiposFIFA].sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Agregar opciones de equipos
        equiposOrdenados.forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo.nombre;
            option.textContent = equipo.nombre;
            equipoSelect.appendChild(option);
        });
    } else {
        console.warn('Variable equiposFIFA no disponible para cargar el selector de equipos');
    }
}

// Event listeners
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar datos principales en secuencia para evitar problemas
        await cargarJugadores();
        await cargarPartidos();
        await cargarPartidosPendientes();
        
        // Cargar equipos en el selector
        cargarEquiposEnSelect();
        
        // Cargar sorteo si la función existe
        if (typeof cargarDatosSorteo === 'function') {
            await cargarDatosSorteo();
        }
    } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
    }
    
    btnAgregarJugador.addEventListener('click', () => {
        formAgregarJugador.classList.remove('hidden');
    });
    
    btnCancelarJugador.addEventListener('click', () => {
        jugadorForm.reset();
        formAgregarJugador.classList.add('hidden');
    });
    
    jugadorForm.addEventListener('submit', guardarJugador);
    
    btnAgregarPartido.addEventListener('click', () => {
        formAgregarPartido.classList.remove('hidden');
    });
    
    btnCancelarPartido.addEventListener('click', () => {
        partidoForm.reset();
        formAgregarPartido.classList.add('hidden');
    });
    
    partidoForm.addEventListener('submit', guardarPartido);
    
    btnGenerarGrupos.addEventListener('click', generarGrupos);
    btnGenerarEliminatorias.addEventListener('click', generarEliminatorias);
    btnResetearTorneo.addEventListener('click', confirmarResetearTorneo);
    
    // Botón para reinicio completo (elimina jugadores, grupos, partidos, etc.)
    const btnResetearCompleto = document.getElementById('btnResetearCompleto');
    if (btnResetearCompleto) {
        btnResetearCompleto.addEventListener('click', confirmarResetearCompleto);
    }
    
    // Botón para simular torneo completo
    const btnSimularTorneo = document.getElementById('btnSimularTorneo');
    if (btnSimularTorneo) {
        btnSimularTorneo.addEventListener('click', confirmarSimularTorneo);
    }
    
    btnCancelarModal.addEventListener('click', () => {
        modalConfirmacion.classList.add('hidden');
    });
});
