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
        
        tr.innerHTML = `
            <td class="table-cell"><span class="nombre-jugador">${jugador.nombre}</span></td>
            <td class="table-cell">${jugador.equipo}</td>
            <td class="table-cell font-bold">${jugador.puntos}</td>
            <td class="table-cell">${partidosJugados}</td>
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
    
    const nombre = document.getElementById('nombre').value;
    const equipo = document.getElementById('equipo').value;
    
    const jugador = { nombre, equipo };
    
    const jugadorGuardado = await fetchAPI('/api/jugadores', 'POST', jugador);
    if (jugadorGuardado) {
        mostrarMensaje('success', 'Jugador guardado correctamente');
        jugadorForm.reset();
        formAgregarJugador.classList.add('hidden');
        cargarJugadores();
    }
}

function editarJugador(id) {
    // Esta función se implementará después
    console.log('Editar jugador', id);
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
    modalMensaje.textContent = '¿Estás seguro de que deseas resetear el torneo? Esto eliminará todos los datos de grupos, eliminatorias y resultados.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = () => {
        // Esta función se implementará después
        console.log('Resetear torneo');
        modalConfirmacion.classList.add('hidden');
    };
}

// Función para cargar partidos pendientes
async function cargarPartidosPendientes() {
    const partidosPendientesDiv = document.getElementById('partidosPendientes');
    if (!partidosPendientesDiv) return;
    
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
        const jugadores = await fetchAPI('/api/jugadores');
        if (!jugadores) {
            console.error('Error al cargar jugadores: jugadores es null o undefined');
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">Error al cargar datos de jugadores</p>';
            return;
        }
        
        if (jugadores.length === 0) {
            partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay jugadores registrados</p>';
            return;
        }
        
        // Crear lista de partidos pendientes
        let partidosPendientes = [];
        
        grupos.forEach(grupo => {
            if (!grupo.jugadores || !Array.isArray(grupo.jugadores)) {
                console.error(`Grupo "${grupo.nombre}" no tiene jugadores o jugadores no es un array`);
                return;
            }
            
            const jugadoresGrupo = grupo.jugadores;
            
            if (jugadoresGrupo.length < 2) {
                console.log(`Grupo "${grupo.nombre}" tiene menos de 2 jugadores, se omite`);
                return;
            }
            
            // Crear todas las combinaciones posibles de partidos
            for (let i = 0; i < jugadoresGrupo.length; i++) {
                for (let j = i + 1; j < jugadoresGrupo.length; j++) {
                    if (!jugadoresGrupo[i]._id || !jugadoresGrupo[j]._id) {
                        console.error('Jugador sin ID en grupo:', grupo.nombre);
                        continue;
                    }
                    
                    const partidoJugado = grupo.partidos && Array.isArray(grupo.partidos) && grupo.partidos.some(partido => 
                        (partido.jugador1 && partido.jugador2) &&
                        ((partido.jugador1._id === jugadoresGrupo[i]._id && partido.jugador2._id === jugadoresGrupo[j]._id) || 
                        (partido.jugador1._id === jugadoresGrupo[j]._id && partido.jugador2._id === jugadoresGrupo[i]._id))
                    );
                    
                    if (!partidoJugado) {
                        // Buscar los datos actualizados de los jugadores
                        const jugador1Actualizado = jugadores.find(j => j && j._id && j._id === jugadoresGrupo[i]._id) || jugadoresGrupo[i];
                        const jugador2Actualizado = jugadores.find(j => j && j._id && j._id === jugadoresGrupo[j]._id) || jugadoresGrupo[j];
                        
                        // Verificar que ambos jugadores tengan datos válidos antes de añadirlos
                        if (jugador1Actualizado && jugador2Actualizado) {
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
        partidosPendientes.slice(0, 5).forEach(partido => {
            const div = document.createElement('div');
            div.className = 'partido-reciente shadow-neon-blue hover:shadow-neon-blue/80 transition-all';
            
            try {
                // Verificar los datos de los jugadores antes de insertar en el HTML
                if (!partido.jugador1?.nombre || !partido.jugador2?.nombre) {
                    console.error('Datos de jugador incompletos:', partido);
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
        
        // Si hay más de 5 partidos pendientes, mostrar botón para ver más
        if (partidosPendientes.length > 5) {
            const masPartidosDiv = document.createElement('div');
            masPartidosDiv.className = 'text-center mt-3';
            masPartidosDiv.innerHTML = `<a href="/grupos" class="text-gamer-neon hover:underline">Ver todos los ${partidosPendientes.length} partidos pendientes</a>`;
            partidosPendientesDiv.appendChild(masPartidosDiv);
        }
    } catch (error) {
        console.error('Error cargando partidos pendientes:', error);
        partidosPendientesDiv.innerHTML = '<p class="text-center py-4 text-red-400">Error al cargar los partidos pendientes</p>';
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

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    cargarJugadores();
    cargarPartidos();
    cargarPartidosPendientes();
    if (typeof cargarDatosSorteo === 'function') {
        cargarDatosSorteo();
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
    
    btnCancelarModal.addEventListener('click', () => {
        modalConfirmacion.classList.add('hidden');
    });
});
