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
const mensajeEliminatorias = document.getElementById('mensajeEliminatorias');
const diagramaEliminatorias = document.getElementById('diagramaEliminatorias');
const btnIrAGrupos = document.getElementById('btnIrAGrupos');

// Elementos de semifinal 1
const semifinal1Jugador1 = document.getElementById('semifinal1Jugador1');
const semifinal1Jugador2 = document.getElementById('semifinal1Jugador2');
const semifinal1Goles1 = document.getElementById('semifinal1Goles1');
const semifinal1Goles2 = document.getElementById('semifinal1Goles2');
const btnJugarSemifinal1 = document.getElementById('btnJugarSemifinal1');

// Elementos de clasificatoria
const clasificatoriaJugador1 = document.getElementById('clasificatoriaJugador1');
const clasificatoriaJugador2 = document.getElementById('clasificatoriaJugador2');
const clasificatoriaGoles1 = document.getElementById('clasificatoriaGoles1');
const clasificatoriaGoles2 = document.getElementById('clasificatoriaGoles2');
const btnJugarClasificatoria = document.getElementById('btnJugarClasificatoria');

// Elementos de semifinal 2
const semifinal2Jugador1 = document.getElementById('semifinal2Jugador1');
const semifinal2Jugador2 = document.getElementById('semifinal2Jugador2');
const semifinal2Goles1 = document.getElementById('semifinal2Goles1');
const semifinal2Goles2 = document.getElementById('semifinal2Goles2');
const btnJugarSemifinal2 = document.getElementById('btnJugarSemifinal2');

// Elementos de final
const finalJugador1 = document.getElementById('finalJugador1');
const finalJugador2 = document.getElementById('finalJugador2');
const finalGoles1 = document.getElementById('finalGoles1');
const finalGoles2 = document.getElementById('finalGoles2');
const btnJugarFinal = document.getElementById('btnJugarFinal');
const seccionCampeon = document.getElementById('seccionCampeon');
const nombreCampeon = document.getElementById('nombreCampeon');

// Modal de partido
const modalPartidoEliminatorias = document.getElementById('modalPartidoEliminatorias');
const formPartidoEliminatoria = document.getElementById('formPartidoEliminatoria');
const tituloModalEliminatoria = document.getElementById('tituloModalEliminatoria');
const faseActualInput = document.getElementById('faseActual');
const elimJugador1 = document.getElementById('elimJugador1');
const elimJugador2 = document.getElementById('elimJugador2');
const golesElimJugador1 = document.getElementById('golesElimJugador1');
const golesElimJugador2 = document.getElementById('golesElimJugador2');
const btnCancelarPartidoElim = document.getElementById('btnCancelarPartidoElim');

// Funciones para cargar las eliminatorias
async function cargarEliminatorias() {
    const eliminatorias = await fetchAPI('/api/eliminatorias');
    
    if (!eliminatorias || eliminatorias.length === 0) {
        mensajeEliminatorias.classList.remove('hidden');
        diagramaEliminatorias.classList.add('hidden');
        return;
    }
    
    const elim = eliminatorias[0]; // Tomamos el primer objeto de eliminatorias
    
    mensajeEliminatorias.classList.add('hidden');
    diagramaEliminatorias.classList.remove('hidden');
    
    // Actualizar semifinal 1
    if (elim.semifinal1) {
        if (elim.semifinal1.jugador1) {
            semifinal1Jugador1.textContent = elim.semifinal1.jugador1.nombre;
        }
        
        if (elim.semifinal1.jugador2) {
            semifinal1Jugador2.textContent = elim.semifinal1.jugador2.nombre;
        }
        
        if (elim.semifinal1.resultado) {
            semifinal1Goles1.textContent = elim.semifinal1.resultado.golesJugador1;
            semifinal1Goles2.textContent = elim.semifinal1.resultado.golesJugador2;
            btnJugarSemifinal1.disabled = true;
            btnJugarSemifinal1.textContent = 'Partido Jugado';
            btnJugarSemifinal1.classList.add('bg-gray-400');
        }
    }
    
    // Actualizar clasificatoria
    if (elim.clasificatoria) {
        if (elim.clasificatoria.jugador1) {
            clasificatoriaJugador1.textContent = elim.clasificatoria.jugador1.nombre;
        }
        
        if (elim.clasificatoria.jugador2) {
            clasificatoriaJugador2.textContent = elim.clasificatoria.jugador2.nombre;
        }
        
        if (elim.clasificatoria.resultado) {
            clasificatoriaGoles1.textContent = elim.clasificatoria.resultado.golesJugador1;
            clasificatoriaGoles2.textContent = elim.clasificatoria.resultado.golesJugador2;
            btnJugarClasificatoria.disabled = true;
            btnJugarClasificatoria.textContent = 'Partido Jugado';
            btnJugarClasificatoria.classList.add('bg-gray-400');
        }
    }
    
    // Actualizar semifinal 2
    if (elim.semifinal2) {
        if (elim.semifinal2.jugador1) {
            semifinal2Jugador1.textContent = elim.semifinal2.jugador1.nombre;
        }
        
        if (elim.semifinal2.jugador2) {
            semifinal2Jugador2.textContent = elim.semifinal2.jugador2.nombre || 'Ganador Clasificatoria';
        }
        
        if (elim.clasificatoria && elim.clasificatoria.resultado) {
            btnJugarSemifinal2.disabled = false;
        }
        
        if (elim.semifinal2.resultado) {
            semifinal2Goles1.textContent = elim.semifinal2.resultado.golesJugador1;
            semifinal2Goles2.textContent = elim.semifinal2.resultado.golesJugador2;
            btnJugarSemifinal2.disabled = true;
            btnJugarSemifinal2.textContent = 'Partido Jugado';
            btnJugarSemifinal2.classList.add('bg-gray-400');
        }
    }
    
    // Actualizar final
    if (elim.final) {
        if (elim.semifinal1 && elim.semifinal1.resultado) {
            const ganadorSF1 = elim.semifinal1.resultado.golesJugador1 > elim.semifinal1.resultado.golesJugador2 
                ? elim.semifinal1.jugador1.nombre 
                : elim.semifinal1.jugador2.nombre;
            finalJugador1.textContent = ganadorSF1;
        }
        
        if (elim.semifinal2 && elim.semifinal2.resultado) {
            const ganadorSF2 = elim.semifinal2.resultado.golesJugador1 > elim.semifinal2.resultado.golesJugador2 
                ? elim.semifinal2.jugador1.nombre 
                : elim.semifinal2.jugador2.nombre;
            finalJugador2.textContent = ganadorSF2;
            btnJugarFinal.disabled = false;
        }
        
        if (elim.final.resultado) {
            finalGoles1.textContent = elim.final.resultado.golesJugador1;
            finalGoles2.textContent = elim.final.resultado.golesJugador2;
            btnJugarFinal.disabled = true;
            btnJugarFinal.textContent = 'Partido Jugado';
            btnJugarFinal.classList.add('bg-gray-400');
            
            // Mostrar campeón
            const campeon = elim.final.resultado.golesJugador1 > elim.final.resultado.golesJugador2 
                ? finalJugador1.textContent 
                : finalJugador2.textContent;
            nombreCampeon.textContent = campeon;
            seccionCampeon.classList.remove('hidden');
        }
    }
}

// Funciones para jugar partidos
function abrirModalPartido(fase) {
    faseActualInput.value = fase;
    
    let titulo, jugador1, jugador2;
    
    switch (fase) {
        case 'semifinal1':
            titulo = 'Semifinal 1';
            jugador1 = semifinal1Jugador1.textContent;
            jugador2 = semifinal1Jugador2.textContent;
            break;
        case 'clasificatoria':
            titulo = 'Clasificatoria';
            jugador1 = clasificatoriaJugador1.textContent;
            jugador2 = clasificatoriaJugador2.textContent;
            break;
        case 'semifinal2':
            titulo = 'Semifinal 2';
            jugador1 = semifinal2Jugador1.textContent;
            jugador2 = semifinal2Jugador2.textContent;
            break;
        case 'final':
            titulo = 'Final';
            jugador1 = finalJugador1.textContent;
            jugador2 = finalJugador2.textContent;
            break;
    }
    
    tituloModalEliminatoria.textContent = `Registrar Resultado - ${titulo}`;
    elimJugador1.textContent = jugador1;
    elimJugador2.textContent = jugador2;
    
    modalPartidoEliminatorias.classList.remove('hidden');
}

async function registrarPartidoEliminatoria(e) {
    e.preventDefault();
    
    const fase = faseActualInput.value;
    const golesJugador1 = parseInt(golesElimJugador1.value);
    const golesJugador2 = parseInt(golesElimJugador2.value);
    
    // Crear objeto de resultado
    const resultado = { 
        golesJugador1, 
        golesJugador2
    };
    
    // Guardar resultado
    const resultadoGuardado = await fetchAPI(`/api/eliminatorias/${fase}`, 'PUT', resultado);
    if (resultadoGuardado) {
        mostrarMensaje('success', 'Resultado registrado correctamente');
        formPartidoEliminatoria.reset();
        modalPartidoEliminatorias.classList.add('hidden');
        
        // Recargar eliminatorias
        cargarEliminatorias();
    }
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    cargarEliminatorias();
    
    btnIrAGrupos.addEventListener('click', () => {
        window.location.href = '/grupos';
    });
    
    btnJugarSemifinal1.addEventListener('click', () => abrirModalPartido('semifinal1'));
    btnJugarClasificatoria.addEventListener('click', () => abrirModalPartido('clasificatoria'));
    btnJugarSemifinal2.addEventListener('click', () => abrirModalPartido('semifinal2'));
    btnJugarFinal.addEventListener('click', () => abrirModalPartido('final'));
    
    btnCancelarPartidoElim.addEventListener('click', () => {
        formPartidoEliminatoria.reset();
        modalPartidoEliminatorias.classList.add('hidden');
    });
    
    formPartidoEliminatoria.addEventListener('submit', registrarPartidoEliminatoria);
});
