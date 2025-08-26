// Tipos para el sorteo de equipos
import type { Equipo } from '../types/index';

interface EquipoTipo extends Equipo {
  bandera?: string;
  tipo?: 'seleccion' | 'club';
}

// Variables globales
let equiposDisponibles: EquipoTipo[] = [];
let jugadorActualId: string | null = null;
let jugadorActualNombre: string | null = null;
let girando = false;

// Lista de equipos FIFA
const equiposFIFA: EquipoTipo[] = [
  { id: 'argentina', nombre: 'Argentina', bandera: '🇦🇷', tipo: 'seleccion' },
  { id: 'brasil', nombre: 'Brasil', bandera: '🇧🇷', tipo: 'seleccion' },
  { id: 'alemania', nombre: 'Alemania', bandera: '🇩🇪', tipo: 'seleccion' },
  { id: 'francia', nombre: 'Francia', bandera: '🇫🇷', tipo: 'seleccion' },
  { id: 'espana', nombre: 'España', bandera: '🇪🇸', tipo: 'seleccion' },
  { id: 'italia', nombre: 'Italia', bandera: '🇮🇹', tipo: 'seleccion' },
  { id: 'holanda', nombre: 'Holanda', bandera: '🇳🇱', tipo: 'seleccion' },
  { id: 'portugal', nombre: 'Portugal', bandera: '🇵🇹', tipo: 'seleccion' },
  { id: 'inglaterra', nombre: 'Inglaterra', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tipo: 'seleccion' },
  { id: 'belgica', nombre: 'Bélgica', bandera: '🇧🇪', tipo: 'seleccion' },
  { id: 'real-madrid', nombre: 'Real Madrid', bandera: '👑', tipo: 'club' },
  { id: 'barcelona', nombre: 'Barcelona', bandera: '🔵', tipo: 'club' },
  { id: 'bayern', nombre: 'Bayern Munich', bandera: '🔴', tipo: 'club' },
  { id: 'liverpool', nombre: 'Liverpool', bandera: '❤️', tipo: 'club' },
  { id: 'man-city', nombre: 'Manchester City', bandera: '💙', tipo: 'club' },
  { id: 'psg', nombre: 'Paris Saint-Germain', bandera: '💜', tipo: 'club' },
  { id: 'juventus', nombre: 'Juventus', bandera: '⚫', tipo: 'club' },
  { id: 'milan', nombre: 'AC Milan', bandera: '❤️', tipo: 'club' },
  { id: 'inter', nombre: 'Inter Milan', bandera: '💙', tipo: 'club' },
  { id: 'chelsea', nombre: 'Chelsea', bandera: '💙', tipo: 'club' },
  { id: 'arsenal', nombre: 'Arsenal', bandera: '🔴', tipo: 'club' },
  { id: 'atletico', nombre: 'Atlético Madrid', bandera: '🔴', tipo: 'club' },
  { id: 'dortmund', nombre: 'Borussia Dortmund', bandera: '💛', tipo: 'club' },
  { id: 'napoli', nombre: 'Napoli', bandera: '💙', tipo: 'club' }
];

// Inicializar la ruleta
function inicializarRuleta(): void {
  const equiposRuleta = document.getElementById('equiposRuleta');
  if (!equiposRuleta) return;
  
  const totalEquipos = equiposDisponibles.length;
  equiposRuleta.innerHTML = '';
  
  equiposDisponibles.forEach((equipo, index) => {
    const angulo = (360 / totalEquipos) * index;
    const equipoElement = document.createElement('div');
    equipoElement.className = 'equipo-sector';
    equipoElement.style.transform = `rotate(${angulo}deg)`;
    equipoElement.innerHTML = `
      <div class="equipo-content">
        <img src="/img/equipos/${equipo.id}.png" alt="${equipo.nombre}" class="equipo-img">
        <span class="equipo-texto">${equipo.bandera || ''}</span>
      </div>
    `;
    equiposRuleta.appendChild(equipoElement);
  });
}

function filtrarEquipos(): void {
  const soloSelecciones = (document.getElementById('soloSelecciones') as HTMLInputElement)?.checked;
  
  if (soloSelecciones) {
    equiposDisponibles = equiposFIFA.filter(e => e.tipo === 'seleccion');
  } else {
    equiposDisponibles = [...equiposFIFA];
  }
  
  inicializarRuleta();
}

function seleccionarJugador(jugadorId: string, nombre: string): void {
  if (girando) return;
  
  // Limpiar selección anterior
  document.querySelectorAll('.jugador-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Marcar jugador actual
  const jugadorElement = document.querySelector(`[data-jugador-id="${jugadorId}"]`);
  if (jugadorElement) {
    jugadorElement.classList.add('selected');
  }
  
  jugadorActualId = jugadorId;
  jugadorActualNombre = nombre;
  
  const nombreElement = document.getElementById('nombreJugadorActual');
  const btnGirar = document.getElementById('btnGirar') as HTMLButtonElement;
  
  if (nombreElement) {
    nombreElement.textContent = nombre;
  }
  
  if (btnGirar) {
    btnGirar.disabled = false;
    btnGirar.textContent = '🎯 GIRAR RULETA';
  }
}

function girarRuleta(): void {
  if (girando || !jugadorActualId || !jugadorActualNombre) return;
  
  girando = true;
  const ruleta = document.getElementById('ruleta');
  const btnGirar = document.getElementById('btnGirar') as HTMLButtonElement;
  
  if (!ruleta || !btnGirar) return;
  
  btnGirar.disabled = true;
  btnGirar.textContent = '🎯 GIRANDO...';
  ruleta.classList.add('girando');
  
  // Calcular rotación aleatoria
  const giros = 5 + Math.random() * 5; // 5-10 giros
  const anguloFinal = Math.random() * 360;
  const rotacionTotal = giros * 360 + anguloFinal;
  
  ruleta.style.transform = `rotate(${rotacionTotal}deg)`;
  
  setTimeout(() => {
    // Determinar equipo ganador
    const equipoIndex = Math.floor((360 - (anguloFinal % 360)) / (360 / equiposDisponibles.length));
    const equipoGanador = equiposDisponibles[equipoIndex % equiposDisponibles.length];
    
    asignarEquipo(jugadorActualId!, equipoGanador);
    
    girando = false;
    ruleta.classList.remove('girando');
    btnGirar.textContent = '🎯 SELECCIONA UN JUGADOR';
    btnGirar.disabled = true;
    
    // Mostrar resultado
    mostrarResultado(equipoGanador);
    
  }, 3000);
}

async function asignarEquipo(jugadorId: string, equipo: EquipoTipo): Promise<void> {
  try {
    const response = await fetch('/api/equipos/asignar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jugador: jugadorId,
        equipo: equipo.id
      })
    });
    
    if (response.ok) {
      actualizarInterfaz(jugadorId, equipo);
      
      // Remover equipo de disponibles si no se permiten duplicados
      const permitirDuplicados = (document.getElementById('permitirDuplicados') as HTMLInputElement)?.checked;
      if (!permitirDuplicados) {
        equiposDisponibles = equiposDisponibles.filter(e => e.id !== equipo.id);
        inicializarRuleta();
      }
    }
  } catch (error) {
    console.error('Error al asignar equipo:', error);
    mostrarMensaje('error', 'Error al asignar equipo');
  }
}

function mostrarResultado(equipo: EquipoTipo): void {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-8 text-center border border-emerald-400 max-w-md animate-bounce-in">
      <h2 class="text-3xl font-bold text-emerald-400 mb-4">🎉 ¡RESULTADO!</h2>
      <img src="/img/equipos/${equipo.id}.png" class="w-24 h-24 mx-auto mb-4 rounded-lg shadow-lg">
      <h3 class="text-2xl font-bold text-white mb-2">${equipo.nombre}</h3>
      <p class="text-gray-400 mb-6 text-4xl">${equipo.bandera || ''}</p>
      <button onclick="this.parentElement.parentElement.remove()" class="btn-primary px-6 py-3 rounded-lg font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors">
        ✅ Continuar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 5000);
}

function actualizarInterfaz(jugadorId: string, equipo: EquipoTipo): void {
  // Mover jugador de sin equipo a con equipo
  const jugadorSinEquipo = document.querySelector(`[data-jugador-id="${jugadorId}"]`);
  if (jugadorSinEquipo) {
    const nombre = jugadorSinEquipo.getAttribute('data-jugador-nombre') || 'Jugador';
    jugadorSinEquipo.remove();
    
    const jugadoresConEquipo = document.getElementById('jugadoresConEquipo');
    if (jugadoresConEquipo) {
      const nuevoJugador = document.createElement('div');
      nuevoJugador.className = 'jugador-asignado';
      nuevoJugador.innerHTML = `
        <img src="/img/equipos/${equipo.id}.png" class="equipo-icon" alt="${equipo.nombre}">
        <span class="nombre">${nombre}</span>
        <span class="equipo-nombre">${equipo.nombre}</span>
        <button class="btn-cambiar" data-jugador-id="${jugadorId}" data-action="cambiar">🔄</button>
      `;
      jugadoresConEquipo.appendChild(nuevoJugador);
    }
  }
  
  // Actualizar contadores
  actualizarContadores();
  
  // Limpiar selección actual
  jugadorActualId = null;
  jugadorActualNombre = null;
  const nombreElement = document.getElementById('nombreJugadorActual');
  if (nombreElement) {
    nombreElement.textContent = 'Selecciona un jugador para continuar';
  }
}

function actualizarContadores(): void {
  const sinEquipo = document.querySelectorAll('#jugadoresSinEquipo .jugador-item').length;
  const conEquipo = document.querySelectorAll('#jugadoresConEquipo .jugador-asignado').length;
  
  const headerSinEquipo = document.querySelector('.jugadores-sin-equipo h3');
  const headerConEquipo = document.querySelector('.jugadores-con-equipo h3');
  
  if (headerSinEquipo) {
    headerSinEquipo.textContent = `👥 Jugadores Sin Equipo (${sinEquipo})`;
  }
  
  if (headerConEquipo) {
    headerConEquipo.textContent = `⚽ Jugadores Con Equipo (${conEquipo})`;
  }
}

async function sortearTodos(): Promise<void> {
  const btn = document.getElementById('btnSortearTodos') as HTMLButtonElement;
  if (!btn) return;
  
  btn.disabled = true;
  btn.textContent = '🎰 Sorteando...';
  
  const jugadoresSinEquipo = document.querySelectorAll('#jugadoresSinEquipo .jugador-item');
  const permitirDuplicados = (document.getElementById('permitirDuplicados') as HTMLInputElement)?.checked;
  
  for (const jugadorElement of jugadoresSinEquipo) {
    const jugadorId = (jugadorElement as HTMLElement).getAttribute('data-jugador-id');
    if (!jugadorId) continue;
    
    const equipoAleatorio = equiposDisponibles[Math.floor(Math.random() * equiposDisponibles.length)];
    
    await asignarEquipo(jugadorId, equipoAleatorio);
    
    if (!permitirDuplicados) {
      equiposDisponibles = equiposDisponibles.filter(e => e.id !== equipoAleatorio.id);
      if (equiposDisponibles.length === 0) break; // No hay más equipos disponibles
    }
    
    // Pequeña pausa para visualizar el proceso
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  inicializarRuleta();
  btn.disabled = false;
  btn.textContent = '🎰 Sortear Todos';
  
  mostrarMensaje('success', '¡Sorteo completado para todos los jugadores!');
}

function limpiarSorteo(): void {
  if (!confirm('¿Estás seguro de que quieres limpiar todo el sorteo?')) return;
  
  // Remover todos los equipos asignados
  const jugadoresConEquipo = document.querySelectorAll('#jugadoresConEquipo .jugador-asignado');
  const containerSinEquipo = document.getElementById('jugadoresSinEquipo');
  
  jugadoresConEquipo.forEach(jugadorElement => {
    const nombre = jugadorElement.querySelector('.nombre')?.textContent || 'Jugador';
    const jugadorId = jugadorElement.querySelector('.btn-cambiar')?.getAttribute('data-jugador-id');
    
    if (containerSinEquipo && jugadorId) {
      const nuevoItem = document.createElement('div');
      nuevoItem.className = 'jugador-item';
      nuevoItem.setAttribute('data-jugador-id', jugadorId);
      nuevoItem.setAttribute('data-jugador-nombre', nombre);
      nuevoItem.innerHTML = `
        <span class="nombre">${nombre}</span>
        <button class="btn-sortear" data-action="sortear">🎲 Sortear</button>
      `;
      containerSinEquipo.appendChild(nuevoItem);
    }
    
    jugadorElement.remove();
  });
  
  // Resetear variables
  jugadorActualId = null;
  jugadorActualNombre = null;
  equiposDisponibles = [...equiposFIFA];
  
  // Actualizar interfaz
  inicializarRuleta();
  actualizarContadores();
  
  const nombreElement = document.getElementById('nombreJugadorActual');
  const btnGirar = document.getElementById('btnGirar') as HTMLButtonElement;
  
  if (nombreElement) {
    nombreElement.textContent = 'Selecciona un jugador para comenzar';
  }
  
  if (btnGirar) {
    btnGirar.disabled = true;
    btnGirar.textContent = '🎯 SELECCIONA UN JUGADOR';
  }
  
  mostrarMensaje('info', 'Sorteo limpiado. Puedes empezar de nuevo.');
}

function mostrarMensaje(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string): void {
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
      messageDiv.className += ' bg-yellow-600 text-black';
      break;
    case 'info':
    default:
      messageDiv.className += ' bg-blue-600 text-white';
      break;
  }
  
  messageDiv.textContent = mensaje;
  document.body.appendChild(messageDiv);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}

function mostrarConfiguracion(): void {
  const modal = document.getElementById('modalConfig');
  if (modal) {
    modal.classList.add('active');
  }
}

function guardarConfiguracion(): void {
  const tipoGrupos = (document.getElementById('tipoGrupos') as HTMLSelectElement)?.value;
  const partidosGrupo = (document.getElementById('partidosGrupo') as HTMLSelectElement)?.value;
  const tipoEliminatorias = (document.getElementById('tipoEliminatorias') as HTMLSelectElement)?.value;
  
  // Validar que todos los jugadores tengan equipo
  const jugadoresSinEquipo = document.querySelectorAll('#jugadoresSinEquipo .jugador-item').length;
  
  if (jugadoresSinEquipo > 0) {
    mostrarMensaje('warning', `Aún quedan ${jugadoresSinEquipo} jugadores sin equipo asignado.`);
    return;
  }
  
  // Guardar configuración en localStorage
  const config = {
    tipoGrupos,
    partidosGrupo,
    tipoEliminatorias,
    timestamp: Date.now()
  };
  
  localStorage.setItem('torneoConfig', JSON.stringify(config));
  
  const modal = document.getElementById('modalConfig');
  if (modal) {
    modal.classList.remove('active');
  }
  
  mostrarMensaje('success', '¡Configuración guardada! Redirigiendo a grupos...');
  
  // Redirigir después de un breve delay
  setTimeout(() => {
    window.location.href = '/grupos';
  }, 1500);
}

// Inicialización cuando el DOM esté listo
export function inicializarSorteo(): void {
  equiposDisponibles = [...equiposFIFA];
  inicializarRuleta();
  
  // Event listeners
  const soloSeleccionesCheck = document.getElementById('soloSelecciones') as HTMLInputElement;
  if (soloSeleccionesCheck) {
    soloSeleccionesCheck.addEventListener('change', filtrarEquipos);
  }
  
  const btnGirar = document.getElementById('btnGirar');
  if (btnGirar) {
    btnGirar.addEventListener('click', girarRuleta);
  }
  
  // Delegación de eventos para botones dinámicos
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const action = target.getAttribute('data-action');
    
    if (action === 'sortear') {
      const jugadorItem = target.closest('.jugador-item') as HTMLElement;
      if (jugadorItem) {
        const jugadorId = jugadorItem.getAttribute('data-jugador-id');
        const jugadorNombre = jugadorItem.getAttribute('data-jugador-nombre');
        if (jugadorId && jugadorNombre) {
          seleccionarJugador(jugadorId, jugadorNombre);
        }
      }
    }
    
    if (action === 'cambiar') {
      const jugadorId = target.getAttribute('data-jugador-id');
      if (jugadorId) {
        // TODO: Implementar cambio de equipo
        mostrarMensaje('info', 'Funcionalidad de cambio de equipo próximamente');
      }
    }
  });
  
  // Botones principales
  const btnSortearTodos = document.getElementById('btnSortearTodos');
  if (btnSortearTodos) {
    btnSortearTodos.addEventListener('click', sortearTodos);
  }
  
  const btnLimpiar = document.getElementById('btnLimpiarSorteo');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarSorteo);
  }
  
  const btnConfirmar = document.getElementById('btnConfirmarSorteo');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', mostrarConfiguracion);
  }
  
  // Modal configuration
  const btnCancelar = document.getElementById('btnCancelar');
  const btnGuardar = document.getElementById('btnGuardarConfig');
  const modal = document.getElementById('modalConfig');
  
  if (btnCancelar && modal) {
    btnCancelar.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
  
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarConfiguracion);
  }
  
  // Cerrar modal al hacer click fuera
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}
