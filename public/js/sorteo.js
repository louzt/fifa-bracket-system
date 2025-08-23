// Funciones para el sorteo de equipos
let equiposDisponibles = [];
let jugadoresParaSorteo = [];
let jugadorActual = null;
let intervaloAnimacion = null;
let equipoSeleccionado = null;

// Importación de la función fetchAPI
// Esta función está definida en fetchAPI.js y está incluida en el HTML

// Referencias del DOM
let modalSorteo;
let nombreJugadorSorteo;
let equiposRuleta;
let btnSortear;
let btnCerrarSorteo;
let resultadoSorteo;
let logoEquipoSorteado;
let nombreEquipoSorteado;
let infoEquipoSorteado;
let sorteoEquipos;
let btnSortearTodos;
let btnResetSorteo;

// Inicialización de los elementos DOM cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM para el sorteo
    modalSorteo = document.getElementById('modalSorteo');
    nombreJugadorSorteo = document.getElementById('nombreJugadorSorteo');
    equiposRuleta = document.getElementById('equiposRuleta');
    btnSortear = document.getElementById('btnSortear');
    btnCerrarSorteo = document.getElementById('btnCerrarSorteo');
    resultadoSorteo = document.getElementById('resultadoSorteo');
    logoEquipoSorteado = document.getElementById('logoEquipoSorteado');
    nombreEquipoSorteado = document.getElementById('nombreEquipoSorteado');
    infoEquipoSorteado = document.getElementById('infoEquipoSorteado');
    sorteoEquipos = document.getElementById('sorteoEquipos');

    // Botones de sorteo
    btnSortearTodos = document.getElementById('btnSortearTodos');
    btnResetSorteo = document.getElementById('btnResetSorteo');

    // Event listeners para los botones de sorteo
    if (btnSortearTodos) btnSortearTodos.addEventListener('click', iniciarSorteoTodos);
    if (btnResetSorteo) btnResetSorteo.addEventListener('click', resetearSorteo);
    if (btnSortear) btnSortear.addEventListener('click', sortearEquipo);
    if (btnCerrarSorteo) btnCerrarSorteo.addEventListener('click', cerrarModalSorteo);
});

// Función para cargar los datos del sorteo
async function cargarDatosSorteo() {
    if (!sorteoEquipos) return;
    
    try {
        // Cargar jugadores
        const jugadores = await fetchAPI('/api/jugadores');
        if (!jugadores || jugadores.length === 0) {
            sorteoEquipos.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay jugadores registrados</p>';
            return;
        }
        
        // Cargar equipos disponibles
        const equipos = await fetchAPI('/api/sorteo/disponibles');
        if (!equipos || equipos.length === 0) {
            sorteoEquipos.innerHTML = '<p class="text-center py-4 text-gamer-blue">No hay equipos disponibles para sortear</p>';
            return;
        }
        
        // Cargar asignaciones actuales
        const asignados = await fetchAPI('/api/sorteo/asignados');
        
        // Crear interfaz para cada jugador
        sorteoEquipos.innerHTML = '';
        jugadores.forEach(jugador => {
            const asignacion = asignados.find(a => a.jugadorId === jugador._id);
            const equipoAsignado = asignacion ? equipos.find(e => e.id === asignacion.equipoId) || 
                                               { nombre: jugador.equipo, logo: '', jugador5Estrellas: 'Desconocido' } : null;
            
            const jugadorDiv = document.createElement('div');
            jugadorDiv.className = 'border border-gamer-blue/30 rounded-lg p-4 mb-4 shadow-neon-blue hover:shadow-neon-blue/80 transition-all';
            
            let contenido = `
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-bold text-white">${jugador.nombre}</p>
            `;
            
            if (equipoAsignado) {
                contenido += `
                    <div class="flex items-center mt-2">
                        <img src="${equipoAsignado.logo || ''}" alt="${equipoAsignado.nombre}" class="h-8 mr-3">
                        <div>
                            <p class="text-gamer-neon">${equipoAsignado.nombre}</p>
                        </div>
                    </div>
                `;
            } else {
                contenido += `<p class="text-sm text-gamer-blue mt-2">Sin equipo asignado</p>`;
            }
            
            contenido += `
                    </div>
                    <button class="btn-primary text-sm sortear-individual" data-id="${jugador._id}" data-nombre="${jugador.nombre}">
                        <i class="fas fa-random mr-1"></i> Sortear
                    </button>
                </div>
            `;
            
            jugadorDiv.innerHTML = contenido;
            sorteoEquipos.appendChild(jugadorDiv);
            
            // Event listener para sorteo individual
            jugadorDiv.querySelector('.sortear-individual').addEventListener('click', () => {
                iniciarSorteoIndividual(jugador);
            });
        });
    } catch (error) {
        console.error('Error cargando datos del sorteo:', error);
        sorteoEquipos.innerHTML = '<p class="text-center py-4 text-red-400">Error al cargar los datos del sorteo</p>';
    }
}

// Función para iniciar el sorteo individual
async function iniciarSorteoIndividual(jugador) {
    try {
        // Cargar equipos disponibles
        equiposDisponibles = await fetchAPI('/api/sorteo/disponibles');
        if (!equiposDisponibles || equiposDisponibles.length === 0) {
            mostrarMensaje('error', 'No hay equipos disponibles para sortear');
            return;
        }
        
        // Configurar el modal para el jugador
        jugadorActual = jugador;
        nombreJugadorSorteo.textContent = jugador.nombre;
        
        // Preparar la ruleta
        prepararRuleta();
        
        // Mostrar modal
        modalSorteo.classList.remove('hidden');
        resultadoSorteo.classList.add('hidden');
        
        // Habilitar botón de sortear
        btnSortear.disabled = false;
        
    } catch (error) {
        console.error('Error iniciando sorteo individual:', error);
        mostrarMensaje('error', 'Error iniciando el sorteo');
    }
}

// Función para iniciar el sorteo para todos los jugadores
function iniciarSorteoTodos() {
    modalTitulo.textContent = 'Sortear Equipos para Todos';
    modalMensaje.textContent = '¿Estás seguro de que deseas sortear equipos para todos los jugadores? Esto reemplazará las asignaciones existentes.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        modalConfirmacion.classList.add('hidden');
        
        try {
            const resultado = await fetchAPI('/api/sorteo/todos', 'POST');
            if (resultado) {
                mostrarMensaje('success', 'Equipos sorteados correctamente');
                setTimeout(() => {
                    cargarDatosSorteo();
                    cargarJugadores();  // Actualizar la lista de jugadores con los nuevos equipos
                }, 1000);
            }
        } catch (error) {
            console.error('Error en el sorteo:', error);
            mostrarMensaje('error', 'Error realizando el sorteo');
        }
    };
}

// Función para resetear el sorteo
function resetearSorteo() {
    modalTitulo.textContent = 'Resetear Sorteo de Equipos';
    modalMensaje.textContent = '¿Estás seguro de que deseas resetear el sorteo de equipos? Esto eliminará todas las asignaciones de equipos.';
    modalConfirmacion.classList.remove('hidden');
    
    btnConfirmarModal.onclick = async () => {
        modalConfirmacion.classList.add('hidden');
        
        try {
            const resultado = await fetchAPI('/api/sorteo/reset', 'POST');
            if (resultado) {
                mostrarMensaje('success', 'Sorteo reseteado correctamente');
                setTimeout(() => {
                    cargarDatosSorteo();
                }, 1000);
            }
        } catch (error) {
            console.error('Error reseteando el sorteo:', error);
            mostrarMensaje('error', 'Error reseteando el sorteo');
        }
    };
}

// Función para preparar la ruleta con los equipos disponibles
function prepararRuleta() {
    equiposRuleta.innerHTML = '';
    equiposRuleta.style.transform = 'translateY(0)';
    
    // Duplicar y mezclar equipos para crear efecto más aleatorio
    const equiposMezclados = [...equiposDisponibles, ...equiposDisponibles];
    const equiposAlterados = mezclarArray(equiposMezclados);
    
    // Crear elementos de la ruleta
    equiposAlterados.forEach(equipo => {
        const equipoDiv = document.createElement('div');
        equipoDiv.className = 'flex items-center p-3 border-b border-gamer-blue/30';
        equipoDiv.dataset.id = equipo.id;
        equipoDiv.innerHTML = `
            <img src="${equipo.logo}" alt="${equipo.nombre}" class="h-12 w-12 object-contain mr-4">
            <div>
                <p class="font-bold text-white">${equipo.nombre}</p>
            </div>
        `;
        equiposRuleta.appendChild(equipoDiv);
    });
}

// Función para sortear un equipo
async function sortearEquipo() {
    if (!jugadorActual || equiposDisponibles.length === 0) return;
    
    // Desactivar botón mientras se sortea
    btnSortear.disabled = true;
    
    // Iniciar animación de ruleta
    let duracion = 3000; // Duración de la animación en ms
    let startTime = null;
    const totalHeight = equiposRuleta.scrollHeight;
    const itemHeight = totalHeight / equiposRuleta.childElementCount;
    
    // Seleccionar un equipo aleatorio
    equipoSeleccionado = equiposDisponibles[Math.floor(Math.random() * equiposDisponibles.length)];
    
    // Calcular la posición final para que el equipo seleccionado quede en el centro
    const equipoElements = Array.from(equiposRuleta.children);
    const equipoIndex = equipoElements.findIndex(el => el.dataset.id === equipoSeleccionado.id);
    
    // Si no se encuentra, usar uno aleatorio
    const targetIndex = equipoIndex !== -1 ? equipoIndex : Math.floor(Math.random() * equipoElements.length);
    const targetPosition = -(targetIndex * itemHeight) + (window.innerHeight / 2 - itemHeight / 2);
    
    // Función de animación
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duracion, 1);
        
        // Función de easing para desaceleración
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        // Calcular posición actual
        let currentPosition;
        if (progress < 0.7) {
            // En la primera parte, aumentar velocidad y recorrer una gran distancia
            const fastProgress = progress / 0.7;
            currentPosition = -(totalHeight * 2 * fastProgress);
        } else {
            // En la parte final, desacelerar hasta la posición objetivo
            const slowProgress = (progress - 0.7) / 0.3;
            const easeSlowDown = 1 - Math.pow(1 - slowProgress, 3);
            const remainingDistance = targetPosition - (-(totalHeight * 2));
            currentPosition = -(totalHeight * 2) + (remainingDistance * easeSlowDown);
        }
        
        // Aplicar transformación
        equiposRuleta.style.transform = `translateY(${currentPosition}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animación terminada, mostrar resultado
            setTimeout(() => {
                mostrarResultadoSorteo();
            }, 500);
        }
    }
    
    // Iniciar animación
    requestAnimationFrame(animate);
}

// Función para mostrar el resultado del sorteo
async function mostrarResultadoSorteo() {
    if (!equipoSeleccionado || !jugadorActual) return;
    
    // Mostrar el equipo seleccionado
    logoEquipoSorteado.src = equipoSeleccionado.logo;
    nombreEquipoSorteado.textContent = equipoSeleccionado.nombre;
    infoEquipoSorteado.textContent = equipoSeleccionado.tipo === 'club' ? 'Club' : 'Selección Nacional';
    
    resultadoSorteo.classList.remove('hidden');
    
    // Registrar el resultado en la base de datos
    try {
        const resultado = await fetchAPI('/api/sorteo/asignar', 'POST', {
            jugadorId: jugadorActual._id,
            equipoId: equipoSeleccionado.id
        });
        
        if (resultado) {
            // Esperar un momento y cerrar el modal
            setTimeout(() => {
                cerrarModalSorteo();
                cargarDatosSorteo();
                cargarJugadores(); // Actualizar la lista de jugadores
            }, 4000);
        }
    } catch (error) {
        console.error('Error guardando el sorteo:', error);
        mostrarMensaje('error', 'Error guardando el resultado del sorteo');
    }
}

// Función para cerrar el modal de sorteo
function cerrarModalSorteo() {
    modalSorteo.classList.add('hidden');
    
    // Limpiar variables
    jugadorActual = null;
    equipoSeleccionado = null;
    
    // Detener animación si está en curso
    if (intervaloAnimacion) {
        clearInterval(intervaloAnimacion);
        intervaloAnimacion = null;
    }
}
