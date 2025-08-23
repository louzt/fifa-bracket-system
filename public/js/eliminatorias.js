// Funciones de utilidad
// fetchAPI se importa desde fetchAPI.js

// Función para mostrar mensajes temporales
function mostrarMensaje(tipo, mensaje) {
    const div = docume                // Imprimir el objeto jugador completo para depuración
                console.log("Clasificatoria J1 completo:", elim.clasificatoria.jugador1);
                
                const grupo = elim.clasificatoria.jugador1.grupo || '';
                // Simplificamos para mostrar solo el grupo sin la posición
                clasificatoriaGrupo1.textContent = grupo;ment('div');
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
const semifinal1Grupo1 = document.getElementById('semifinal1Grupo1');
const semifinal1Grupo2 = document.getElementById('semifinal1Grupo2');
const btnJugarSemifinal1 = document.getElementById('btnJugarSemifinal1');

// Elementos de clasificatoria
const clasificatoriaJugador1 = document.getElementById('clasificatoriaJugador1');
const clasificatoriaJugador2 = document.getElementById('clasificatoriaJugador2');
const clasificatoriaGoles1 = document.getElementById('clasificatoriaGoles1');
const clasificatoriaGoles2 = document.getElementById('clasificatoriaGoles2');
const clasificatoriaGrupo1 = document.getElementById('clasificatoriaGrupo1');
const clasificatoriaGrupo2 = document.getElementById('clasificatoriaGrupo2');
const btnJugarClasificatoria = document.getElementById('btnJugarClasificatoria');

// Elementos de semifinal 2
const semifinal2Jugador1 = document.getElementById('semifinal2Jugador1');
const semifinal2Jugador2 = document.getElementById('semifinal2Jugador2');
const semifinal2Goles1 = document.getElementById('semifinal2Goles1');
const semifinal2Goles2 = document.getElementById('semifinal2Goles2');
const semifinal2Grupo1 = document.getElementById('semifinal2Grupo1');
const semifinal2Grupo2 = document.getElementById('semifinal2Grupo2');
const btnJugarSemifinal2 = document.getElementById('btnJugarSemifinal2');

// Elementos de final
const finalJugador1 = document.getElementById('finalJugador1');
const finalJugador2 = document.getElementById('finalJugador2');
const finalGoles1 = document.getElementById('finalGoles1');
const finalGoles2 = document.getElementById('finalGoles2');
const finalGrupo1 = document.getElementById('finalGrupo1');
const finalGrupo2 = document.getElementById('finalGrupo2');
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
    try {
        console.log("Cargando eliminatorias...");
        const eliminatorias = await fetchAPI('/api/eliminatorias');
        
        if (!eliminatorias || eliminatorias.length === 0) {
            mensajeEliminatorias.classList.remove('hidden');
            diagramaEliminatorias.classList.add('hidden');
            console.log("No hay eliminatorias disponibles");
            return;
        }
        
        const elim = eliminatorias[0]; // Tomamos el primer objeto de eliminatorias
        console.log("Eliminatorias cargadas:", elim);
        
        // Verificamos si estamos en cuartos o semifinales
        const esCuartos = elim.cuartos1 && (elim.cuartos1.jugador1 || elim.cuartos1.jugador2);
        
        // Si tenemos cuartos, actualizar semifinales desde los cuartos
        if (esCuartos) {
            console.log("Estructura de eliminatorias con cuartos detectada");
            
            // Aquí procesaríamos la estructura para mostrar cuartos de final
            // Por ahora nos enfocamos en semifinales
            
            // Actualizamos semifinal1 y semifinal2 con la información de los cuartos
            if (!elim.semifinal1.jugador1 && !elim.semifinal1.jugador2) {
                elim.semifinal1.jugador1 = elim.cuartos1.jugador1;
                elim.semifinal1.jugador2 = elim.cuartos2.jugador1;
            }
            
            if (!elim.semifinal2.jugador1 && !elim.semifinal2.jugador2) {
                elim.semifinal2.jugador1 = elim.cuartos3.jugador1;
                elim.semifinal2.jugador2 = elim.cuartos4.jugador1;
            }
        }
        
        mensajeEliminatorias.classList.add('hidden');
        diagramaEliminatorias.classList.remove('hidden');
    
        // Actualizar semifinal 1
        if (elim.semifinal1) {
        if (elim.semifinal1.jugador1) {
            semifinal1Jugador1.textContent = elim.semifinal1.jugador1.nombre;
            
            // Añadir información del grupo
            if (semifinal1Grupo1) {
                const grupo = elim.semifinal1.jugador1.grupo || '';
                const posicion = elim.semifinal1.jugador1.posicion === 1 ? "Primero" : "Segundo";
                semifinal1Grupo1.textContent = grupo;
                console.log(`SF1 J1: ${elim.semifinal1.jugador1.nombre}, grupo:`, grupo);
            }
        } else {
            semifinal1Jugador1.textContent = "Pendiente";
            if (semifinal1Grupo1) semifinal1Grupo1.textContent = "Pendiente";
        }
        
        if (elim.semifinal1.jugador2) {
            semifinal1Jugador2.textContent = elim.semifinal1.jugador2.nombre;
            
            // Añadir información del grupo
            if (semifinal1Grupo2) {
                const grupo = elim.semifinal1.jugador2.grupo || '';
                const posicion = elim.semifinal1.jugador2.posicion === 1 ? "Primero" : "Segundo";
                semifinal1Grupo2.textContent = grupo;
                console.log(`SF1 J2: ${elim.semifinal1.jugador2.nombre}, grupo:`, grupo);
            }
        } else {
            semifinal1Jugador2.textContent = "Pendiente";
            if (semifinal1Grupo2) semifinal1Grupo2.textContent = "Pendiente";
        }
        
        if (elim.semifinal1.resultado) {
            semifinal1Goles1.textContent = elim.semifinal1.resultado.golesJugador1;
            semifinal1Goles2.textContent = elim.semifinal1.resultado.golesJugador2;
            btnJugarSemifinal1.disabled = true;
            btnJugarSemifinal1.textContent = 'Partido Jugado';
            btnJugarSemifinal1.classList.add('bg-gray-500');
            btnJugarSemifinal1.classList.remove('btn-primary');
            
            // Destacar ganador
            if (elim.semifinal1.resultado.golesJugador1 > elim.semifinal1.resultado.golesJugador2) {
                semifinal1Jugador1.classList.add('text-gamer-neon', 'font-bold');
                semifinal1Goles1.classList.add('bg-gamer-neon');
            } else {
                semifinal1Jugador2.classList.add('text-gamer-neon', 'font-bold');
                semifinal1Goles2.classList.add('bg-gamer-neon');
            }
        }
    }
    
    // Actualizar clasificatoria
    if (elim.clasificatoria) {
        // Si estamos en estructura de cuartos, asignamos los jugadores de los cuartos a la clasificatoria
        if (elim.cuartos1 && elim.cuartos1.jugador2 && !elim.clasificatoria.jugador1) {
            elim.clasificatoria.jugador1 = elim.cuartos2.jugador2;
            elim.clasificatoria.jugador2 = elim.cuartos3.jugador2 || elim.cuartos4.jugador2;
        }
        
        if (elim.clasificatoria.jugador1) {
            clasificatoriaJugador1.textContent = elim.clasificatoria.jugador1.nombre;
            
            // Añadir información del grupo
            if (clasificatoriaGrupo1) {
                // Imprimir el objeto jugador completo para depuración
                console.log("Clasificatoria J1 completo:", elim.clasificatoria.jugador1);
                
                const grupo = elim.clasificatoria.jugador1.grupo || '';
                // Determinar la posición
                let posicion = "Segundo"; // Por defecto asumimos segundo
                
                if (elim.clasificatoria.jugador1.posicion) {
                    posicion = elim.clasificatoria.jugador1.posicion === 1 ? "Primero" : "Segundo";
                }
                
                clasificatoriaGrupo1.textContent = grupo;
            }
        } else {
            clasificatoriaJugador1.textContent = "Pendiente";
            if (clasificatoriaGrupo1) clasificatoriaGrupo1.textContent = "Pendiente";
        }
        
        if (elim.clasificatoria.jugador2) {
            clasificatoriaJugador2.textContent = elim.clasificatoria.jugador2.nombre;
            
            // Añadir información del grupo
            if (clasificatoriaGrupo2) {
                // Imprimir el objeto jugador completo para depuración
                console.log("Clasificatoria J2 completo:", elim.clasificatoria.jugador2);
                
                const grupo = elim.clasificatoria.jugador2.grupo || '';
                // Simplificamos para mostrar solo el grupo
                clasificatoriaGrupo2.textContent = grupo;
            }
        } else {
            clasificatoriaJugador2.textContent = "Pendiente";
            if (clasificatoriaGrupo2) clasificatoriaGrupo2.textContent = "Pendiente";
        }
        
        if (elim.clasificatoria.resultado) {
            clasificatoriaGoles1.textContent = elim.clasificatoria.resultado.golesJugador1;
            clasificatoriaGoles2.textContent = elim.clasificatoria.resultado.golesJugador2;
            btnJugarClasificatoria.disabled = true;
            btnJugarClasificatoria.textContent = 'Partido Jugado';
            btnJugarClasificatoria.classList.add('bg-gray-500');
            btnJugarClasificatoria.classList.remove('btn-primary');
            
            // Destacar ganador
            if (elim.clasificatoria.resultado.golesJugador1 > elim.clasificatoria.resultado.golesJugador2) {
                clasificatoriaJugador1.classList.add('text-gamer-neon', 'font-bold');
                clasificatoriaGoles1.classList.add('bg-gamer-neon');
            } else {
                clasificatoriaJugador2.classList.add('text-gamer-neon', 'font-bold');
                clasificatoriaGoles2.classList.add('bg-gamer-neon');
            }
        }
    }
    
    // Actualizar semifinal 2
    if (elim.semifinal2) {
        if (elim.semifinal2.jugador1) {
            semifinal2Jugador1.textContent = elim.semifinal2.jugador1.nombre;
            
            // Añadir información del grupo
            if (semifinal2Grupo1) {
                const grupo = elim.semifinal2.jugador1.grupo || '';
                semifinal2Grupo1.textContent = grupo;
                console.log(`Jugador1 semifinal2 completo:`, elim.semifinal2.jugador1);
            }
        } else {
            semifinal2Jugador1.textContent = "Pendiente";
            if (semifinal2Grupo1) semifinal2Grupo1.textContent = "Pendiente";
        }
        
        // Para el jugador 2 de la semifinal 2 (ganador de clasificatoria)
        if (elim.clasificatoria && elim.clasificatoria.resultado) {
            // Si ya se jugó la clasificatoria, mostramos el nombre del ganador
            const golesClasificatoria1 = elim.clasificatoria.resultado.golesJugador1;
            const golesClasificatoria2 = elim.clasificatoria.resultado.golesJugador2;
            
            // Determinar el ganador según los goles
            let ganadorClasificatoria;
            let infoGanadorClasificatoria = "";
            
            if (golesClasificatoria1 > golesClasificatoria2) {
                // Ganó el jugador 1
                ganadorClasificatoria = elim.clasificatoria.jugador1.nombre;
                // Mostrar información completa del jugador para depuración
                console.log("Ganador clasificatoria J1 completo:", elim.clasificatoria.jugador1);
                const grupoGanador = elim.clasificatoria.jugador1.grupo || '';
                infoGanadorClasificatoria = grupoGanador;
            } else {
                // Ganó el jugador 2
                ganadorClasificatoria = elim.clasificatoria.jugador2.nombre;
                // Mostrar información completa del jugador para depuración
                console.log("Ganador clasificatoria J2 completo:", elim.clasificatoria.jugador2);
                const grupoGanador = elim.clasificatoria.jugador2.grupo || '';
                infoGanadorClasificatoria = grupoGanador;
            }
            
            // Actualizar el nombre del jugador en la semifinal 2
            semifinal2Jugador2.textContent = ganadorClasificatoria;
            
            // Actualizar la información del grupo
            if (semifinal2Grupo2) {
                semifinal2Grupo2.textContent = infoGanadorClasificatoria;
            }
        } else if (elim.semifinal2.jugador2) {
            // Si no se ha jugado la clasificatoria pero hay datos en semifinal2.jugador2
            semifinal2Jugador2.textContent = elim.semifinal2.jugador2.nombre || 'Ganador Clasificatoria';
            
            if (semifinal2Grupo2) {
                if (elim.semifinal2.jugador2.grupo) {
                    const posicion = elim.semifinal2.jugador2.posicion === 1 ? "Primero" : "Segundo";
                    semifinal2Grupo2.textContent = `Grupo ${elim.semifinal2.jugador2.grupo} - ${posicion}`;
                } else {
                    semifinal2Grupo2.textContent = 'Ganador Clasificatoria';
                }
            }
        } else {
            // Si no hay datos, mostramos texto por defecto
            semifinal2Jugador2.textContent = 'Pendiente';
            
            if (semifinal2Grupo2) {
                semifinal2Grupo2.textContent = 'Ganador Clasificatoria';
            }
        }
        
        if (elim.clasificatoria && elim.clasificatoria.resultado) {
            btnJugarSemifinal2.disabled = false;
            btnJugarSemifinal2.classList.add('hover:shadow-glow-blue');
        }
        
        if (elim.semifinal2.resultado) {
            semifinal2Goles1.textContent = elim.semifinal2.resultado.golesJugador1;
            semifinal2Goles2.textContent = elim.semifinal2.resultado.golesJugador2;
            btnJugarSemifinal2.disabled = true;
            btnJugarSemifinal2.textContent = 'Partido Jugado';
            btnJugarSemifinal2.classList.add('bg-gray-500');
            btnJugarSemifinal2.classList.remove('btn-primary');
            
            // Destacar ganador
            if (elim.semifinal2.resultado.golesJugador1 > elim.semifinal2.resultado.golesJugador2) {
                semifinal2Jugador1.classList.add('text-gamer-neon', 'font-bold');
                semifinal2Goles1.classList.add('bg-gamer-neon');
            } else {
                semifinal2Jugador2.classList.add('text-gamer-neon', 'font-bold');
                semifinal2Goles2.classList.add('bg-gamer-neon');
            }
        }
    }
    
    // Actualizar final
    if (elim.final) {
        if (elim.semifinal1 && elim.semifinal1.resultado) {
            const esGanador1SF1 = elim.semifinal1.resultado.golesJugador1 > elim.semifinal1.resultado.golesJugador2;
            const ganadorSF1 = esGanador1SF1 ? 
                elim.semifinal1.jugador1.nombre : 
                elim.semifinal1.jugador2.nombre;
            finalJugador1.textContent = ganadorSF1;
            
            // Actualizar grupo para final
            const ganadorInfo = esGanador1SF1 ? 
                elim.semifinal1.jugador1 : 
                elim.semifinal1.jugador2;
            
            console.log("Ganador SF1 completo:", ganadorInfo);
            
            if (finalGrupo1) {
                if (ganadorInfo && ganadorInfo.grupo) {
                    finalGrupo1.textContent = `Grupo ${ganadorInfo.grupo} - Ganador`;
                } else {
                    finalGrupo1.textContent = 'Ganador Semifinal 1';
                }
            }
        }
        
        if (elim.semifinal2 && elim.semifinal2.resultado) {
            const esGanador1SF2 = elim.semifinal2.resultado.golesJugador1 > elim.semifinal2.resultado.golesJugador2;
            const ganadorSF2 = esGanador1SF2 ? 
                elim.semifinal2.jugador1.nombre : 
                elim.semifinal2.jugador2.nombre;
            finalJugador2.textContent = ganadorSF2;
            
            // Actualizar grupo para final
            const ganadorInfo = esGanador1SF2 ? 
                elim.semifinal2.jugador1 : 
                elim.semifinal2.jugador2;
            
            console.log("Ganador SF2 completo:", ganadorInfo);
            
            if (finalGrupo2) {
                // Si el ganador tiene información de grupo, mostrarla
                if (ganadorInfo && ganadorInfo.grupo) {
                    finalGrupo2.textContent = `Grupo ${ganadorInfo.grupo} - Ganador`;
                } else {
                    // Si no hay grupo o viene de clasificatoria
                    finalGrupo2.textContent = 'Ganador Semifinal 2';
                }
            }
            
            // Habilitar botón de jugar final solo cuando ambas semifinales están jugadas
            if (elim.semifinal1.resultado) {
                btnJugarFinal.disabled = false;
                btnJugarFinal.classList.add('hover:shadow-glow-neon');
            }
        }
        
        if (elim.final.resultado) {
            finalGoles1.textContent = elim.final.resultado.golesJugador1;
            finalGoles2.textContent = elim.final.resultado.golesJugador2;
            btnJugarFinal.disabled = true;
            btnJugarFinal.textContent = 'Partido Jugado';
            btnJugarFinal.classList.add('bg-gray-500');
            btnJugarFinal.classList.remove('btn-primary');
            
            // Destacar ganador
            const esGanador1 = elim.final.resultado.golesJugador1 > elim.final.resultado.golesJugador2;
            if (esGanador1) {
                finalJugador1.classList.add('text-gamer-neon', 'font-bold');
                finalGoles1.classList.add('bg-gamer-neon', 'shadow-glow-neon');
            } else {
                finalJugador2.classList.add('text-gamer-neon', 'font-bold');
                finalGoles2.classList.add('bg-gamer-neon', 'shadow-glow-neon');
            }
            
            // Mostrar campeón
            const campeon = esGanador1 ? finalJugador1.textContent : finalJugador2.textContent;
            nombreCampeon.textContent = campeon;
            seccionCampeon.classList.remove('hidden');
            seccionCampeon.classList.add('animate__animated', 'animate__fadeIn');
        }
    }
    } catch (error) {
        console.error("Error al cargar eliminatorias:", error);
        mostrarMensaje('error', 'Error al cargar las eliminatorias');
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
