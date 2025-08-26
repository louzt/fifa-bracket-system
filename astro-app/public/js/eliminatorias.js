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
        
        // Verificamos la estructura del torneo
        // Para torneos con 3 grupos, tenemos una estructura específica:
        // - Semifinal 1: 1° Grupo A vs 2° Grupo B
        // - Clasificatoria: Segundos lugares restantes juegan entre sí
        // - Semifinal 2: 1° Grupo B vs Ganador Clasificatoria
        
        // Determinar la estructura del torneo basada en los datos
        console.log("Detectando estructura del torneo...");
        
        // Verificar la estructura real para depurar
        console.log("Propiedades del objeto eliminatorias:", Object.keys(elim));
        
        // Verificar si es la estructura correcta con nuestro ID especial
        const esEstructuraCorrecta = elim._id === "ElIMinAtOriasNuevas";
        console.log("¿Es estructura correcta con ID especial?", esEstructuraCorrecta);
        
        // Detectar si tenemos estructura con clasificatoria (torneo de 3 grupos)
        const tieneClasificatoria = elim.hasOwnProperty('clasificatoria');
        // Detectar si tenemos estructura con cuartos (torneo de 4+ grupos)
        const tieneCuartos = elim.hasOwnProperty('cuartos1');
        
        // Si estamos usando la estructura incorrecta (con cuartos), mostrar un mensaje en consola
        if (tieneCuartos && !tieneClasificatoria) {
            console.warn("ADVERTENCIA: Se detectó una estructura con cuartos de final pero deberíamos estar usando clasificatoria para un torneo de 3 grupos");
            console.warn("Por favor recarga la página o simula un nuevo torneo para corregir la estructura");
        }
        
        // Forzar estructura correcta basada en los grupos existentes
        // Sabemos que hay 3 grupos en el sistema, por lo que deberíamos usar la estructura con clasificatoria
        const deberiaSerClasificatoria = true;
        
        // Variable necesaria para la compatibilidad con el código existente
        // Siempre forzamos esCuartos a false para manejar correctamente la estructura
        const esCuartos = false;
        
        console.log("Decisión final de estructura:", {
            tieneClasificatoria,
            tieneCuartos,
            deberiaSerClasificatoria,
            esCuartos,
            esEstructuraCorrecta
        });
        
        console.log("Estructura detectada:", {
            tieneClasificatoria,
            tieneCuartos,
            esCuartos
        });
        
        // Primero verificamos si tenemos la estructura especial con ID correcto
        if (esEstructuraCorrecta) {
            console.log("Usando estructura específica con ID ElIMinAtOriasNuevas");
            renderizarEstructuraClasificatoria(elim);
        } 
        // Si no es la estructura especial pero tiene clasificatoria, usar la estructura de clasificatoria
        else if (tieneClasificatoria) {
            console.log("Usando estructura con clasificatoria");
            renderizarEstructuraClasificatoria(elim);
        }
        // Si no tiene clasificatoria pero debería tenerla, usar modo de compatibilidad
        else if (tieneCuartos && deberiaSerClasificatoria) {
            console.log("Usando modo de compatibilidad para convertir cuartos en clasificatoria");
            renderizarEstructuraCompatibilidad(elim);
        }
        // En otros casos, usar la estructura normal
        else {
            console.log("Usando estructura estándar del servidor");
            renderizarEstructura(elim, { tieneClasificatoria, tieneCuartos, esCuartos });
        }
        
        mensajeEliminatorias.classList.add('hidden');
        diagramaEliminatorias.classList.remove('hidden');
    
        // Actualizar semifinal 1
        if (elim.semifinal1) {
        if (elim.semifinal1.jugador1) {
            semifinal1Jugador1.textContent = elim.semifinal1.jugador1.nombre;
            
            // Añadir información del grupo y posición
            if (semifinal1Grupo1) {
                const grupo = elim.semifinal1.jugador1.grupo || '';
                semifinal1Grupo1.textContent = grupo;
                // Añadir posición en el grupo como número
                if (elim.semifinal1.jugador1.posicion) {
                    semifinal1Goles1.textContent = elim.semifinal1.jugador1.posicion;
                }
                console.log(`SF1 J1: ${elim.semifinal1.jugador1.nombre}, grupo:`, grupo, `posición:`, elim.semifinal1.jugador1.posicion);
            }
        } else {
            semifinal1Jugador1.textContent = "Pendiente";
            if (semifinal1Grupo1) semifinal1Grupo1.textContent = "Pendiente";
        }
        
        if (elim.semifinal1.jugador2) {
            semifinal1Jugador2.textContent = elim.semifinal1.jugador2.nombre;
            
            // Añadir información del grupo y posición
            if (semifinal1Grupo2) {
                const grupo = elim.semifinal1.jugador2.grupo || '';
                semifinal1Grupo2.textContent = grupo;
                // Añadir posición en el grupo como número
                if (elim.semifinal1.jugador2.posicion) {
                    semifinal1Goles2.textContent = elim.semifinal1.jugador2.posicion;
                }
                console.log(`SF1 J2: ${elim.semifinal1.jugador2.nombre}, grupo:`, grupo, `posición:`, elim.semifinal1.jugador2.posicion);
            }
        } else {
            semifinal1Jugador2.textContent = "Pendiente";
            if (semifinal1Grupo2) semifinal1Grupo2.textContent = "Pendiente";
        }
        
        if (elim.semifinal1.resultado) {
            console.log("Resultado de semifinal1:", elim.semifinal1.resultado);
            // Guardamos las posiciones actuales antes de sobrescribirlas
            const posicion1 = semifinal1Goles1.textContent;
            const posicion2 = semifinal1Goles2.textContent;
            
            // Actualizamos con los resultados
            semifinal1Goles1.textContent = elim.semifinal1.resultado.golesJugador1;
            semifinal1Goles2.textContent = elim.semifinal1.resultado.golesJugador2;
            
            // Guardamos los resultados para luego (por si necesitamos restaurarlos)
            semifinal1Goles1.dataset.resultadoGoles = elim.semifinal1.resultado.golesJugador1;
            semifinal1Goles2.dataset.resultadoGoles = elim.semifinal1.resultado.golesJugador2;
            
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
    if (elim.clasificatoria || tieneCuartos) {
        console.log("Actualizando clasificatoria");
        
        // Si tenemos una fase clasificatoria explícita
        if (elim.clasificatoria && elim.clasificatoria.jugador1 && elim.clasificatoria.jugador2) {
            console.log("Usando estructura con clasificatoria explícita");
            
            // Jugador 1
            clasificatoriaJugador1.textContent = elim.clasificatoria.jugador1.nombre || "Pendiente";
            clasificatoriaGrupo1.textContent = elim.clasificatoria.jugador1.grupo || '';
            if (clasificatoriaGoles1.textContent === "-" && elim.clasificatoria.jugador1.posicion) {
                clasificatoriaGoles1.textContent = elim.clasificatoria.jugador1.posicion;
            }
            
            // Jugador 2
            clasificatoriaJugador2.textContent = elim.clasificatoria.jugador2.nombre || "Pendiente";
            clasificatoriaGrupo2.textContent = elim.clasificatoria.jugador2.grupo || '';
            if (clasificatoriaGoles2.textContent === "-" && elim.clasificatoria.jugador2.posicion) {
                clasificatoriaGoles2.textContent = elim.clasificatoria.jugador2.posicion;
            }
        }
        // Si tenemos estructura con cuartos pero no clasificatoria (modo de compatibilidad)
        else if (tieneCuartos) {
            console.log("MODO DE COMPATIBILIDAD: Creando clasificatoria a partir de cuartos");
            // Recolectar todos los segundos clasificados de los grupos
            const segundosClasificados = [];
            
            // Recolectar todos los jugadores con posición=2 de los cuartos
            if (elim.cuartos1 && elim.cuartos1.jugador2) {
                segundosClasificados.push(elim.cuartos1.jugador2);
                console.log("Encontrado segundo lugar en cuartos1:", elim.cuartos1.jugador2.nombre);
            }
            if (elim.cuartos2 && elim.cuartos2.jugador2) {
                segundosClasificados.push(elim.cuartos2.jugador2);
                console.log("Encontrado segundo lugar en cuartos2:", elim.cuartos2.jugador2.nombre);
            }
            if (elim.cuartos3 && elim.cuartos3.jugador2) {
                segundosClasificados.push(elim.cuartos3.jugador2);
                console.log("Encontrado segundo lugar en cuartos3:", elim.cuartos3.jugador2.nombre);
            }
            if (elim.cuartos4 && elim.cuartos4.jugador2) {
                segundosClasificados.push(elim.cuartos4.jugador2);
                console.log("Encontrado segundo lugar en cuartos4:", elim.cuartos4.jugador2.nombre);
            }
            
            console.log(`Total de segundos lugares encontrados: ${segundosClasificados.length}`);
            
            // Seleccionar los dos mejores segundos clasificados (normalmente los dos primeros)
            if (segundosClasificados.length >= 2) {
                clasificatoriaJugador1.textContent = segundosClasificados[0].nombre;
                clasificatoriaJugador2.textContent = segundosClasificados[1].nombre;
                
                // Añadir información de sus grupos
                clasificatoriaGrupo1.textContent = segundosClasificados[0].grupo || '';
                clasificatoriaGrupo2.textContent = segundosClasificados[1].grupo || '';
                
                // Mostrar posición en el grupo
                if (segundosClasificados[0].posicion) {
                    clasificatoriaGoles1.textContent = segundosClasificados[0].posicion;
                }
                if (segundosClasificados[1].posicion) {
                    clasificatoriaGoles2.textContent = segundosClasificados[1].posicion;
                }
            } else if (segundosClasificados.length === 1) {
                clasificatoriaJugador1.textContent = segundosClasificados[0].nombre;
                clasificatoriaGrupo1.textContent = segundosClasificados[0].grupo || '';
                
                // Mostrar posición en el grupo
                if (segundosClasificados[0].posicion) {
                    clasificatoriaGoles1.textContent = segundosClasificados[0].posicion;
                }
                
                // Si solo hay un segundo clasificado, buscar entre los primeros clasificados sobrantes
                // para el segundo puesto de la clasificatoria
                if (elim.cuartos4 && elim.cuartos4.jugador1 && !elim.cuartos4.jugador2) {
                    clasificatoriaJugador2.textContent = elim.cuartos4.jugador1.nombre;
                    clasificatoriaGrupo2.textContent = elim.cuartos4.jugador1.grupo || '';
                    
                    // Mostrar posición en el grupo
                    if (elim.cuartos4.jugador1.posicion) {
                        clasificatoriaGoles2.textContent = elim.cuartos4.jugador1.posicion;
                    }
                }
            }
            
        } else if (elim.clasificatoria && elim.clasificatoria.jugador1) {
            // Si hay información específica de clasificatoria en la estructura
            clasificatoriaJugador1.textContent = elim.clasificatoria.jugador1.nombre || "Pendiente";
            
            // Añadir información del grupo y posición
            if (clasificatoriaGrupo1) {
                console.log("Clasificatoria J1 completo:", elim.clasificatoria.jugador1);
                // Intentamos obtener el grupo directamente del jugador
                let grupo = '';
                if (elim.clasificatoria.jugador1.grupo) {
                    grupo = elim.clasificatoria.jugador1.grupo;
                }
                clasificatoriaGrupo1.textContent = grupo || 'Grupo Desconocido';
                
                // Mostrar posición en el grupo
                if (elim.clasificatoria.jugador1.posicion) {
                    clasificatoriaGoles1.textContent = elim.clasificatoria.jugador1.posicion;
                    console.log("Asignando posición al jugador 1 clasificatoria:", elim.clasificatoria.jugador1.posicion);
                }
            }
        } else {
            // Caso donde no hay información suficiente
            console.log("No hay información suficiente para la clasificatoria, mostrando mensaje pendiente");
            clasificatoriaJugador1.textContent = "Pendiente";
            if (clasificatoriaGrupo1) clasificatoriaGrupo1.textContent = "Pendiente";
        }
        
        // El jugador 2 de la clasificatoria ya se manejó en el bloque anterior si estamos en estructura de cuartos
        if (!esCuartos && elim.clasificatoria && elim.clasificatoria.jugador2) {
            // Si tenemos el jugador 2 definido específicamente en la clasificatoria
            clasificatoriaJugador2.textContent = elim.clasificatoria.jugador2.nombre || "Pendiente";
            
            // Añadir información del grupo y posición
            if (clasificatoriaGrupo2) {
                console.log("Clasificatoria J2 completo:", elim.clasificatoria.jugador2);
                // Intentamos obtener el grupo directamente del jugador
                let grupo = '';
                if (elim.clasificatoria.jugador2.grupo) {
                    grupo = elim.clasificatoria.jugador2.grupo;
                }
                clasificatoriaGrupo2.textContent = grupo || 'Grupo Desconocido';
                
                // Mostrar posición en el grupo
                if (elim.clasificatoria.jugador2.posicion) {
                    clasificatoriaGoles2.textContent = elim.clasificatoria.jugador2.posicion;
                    console.log("Asignando posición al jugador 2 clasificatoria:", elim.clasificatoria.jugador2.posicion);
                }
            }
        } else if (clasificatoriaJugador2.textContent === "Pendiente" || clasificatoriaJugador2.textContent === "") {
            // Si aún no se ha asignado un valor al jugador 2 de clasificatoria
            clasificatoriaJugador2.textContent = "Pendiente";
            if (clasificatoriaGrupo2) clasificatoriaGrupo2.textContent = "Pendiente";
        }
        
        // Asegurarnos que se muestran las posiciones correctamente
        if (elim.clasificatoria && elim.clasificatoria.jugador1) {
            if (!clasificatoriaGoles1.textContent || clasificatoriaGoles1.textContent === "-") {
                console.log("Actualizando posición jugador 1 clasificatoria:", elim.clasificatoria.jugador1.posicion);
                if (elim.clasificatoria.jugador1.posicion) {
                    clasificatoriaGoles1.textContent = elim.clasificatoria.jugador1.posicion;
                }
            }
        }
        
        if (elim.clasificatoria && elim.clasificatoria.jugador2) {
            if (!clasificatoriaGoles2.textContent || clasificatoriaGoles2.textContent === "-") {
                console.log("Actualizando posición jugador 2 clasificatoria:", elim.clasificatoria.jugador2.posicion);
                if (elim.clasificatoria.jugador2.posicion) {
                    clasificatoriaGoles2.textContent = elim.clasificatoria.jugador2.posicion;
                }
            }
        }
        
        if (elim.clasificatoria && elim.clasificatoria.resultado) {
            // Guardamos las posiciones actuales antes de sobrescribirlas
            const posicion1 = clasificatoriaGoles1.textContent;
            const posicion2 = clasificatoriaGoles2.textContent;
            
            // Actualizamos con los resultados
            clasificatoriaGoles1.textContent = elim.clasificatoria.resultado.golesJugador1;
            clasificatoriaGoles2.textContent = elim.clasificatoria.resultado.golesJugador2;
            
            // Guardamos los resultados para luego (por si necesitamos restaurarlos)
            clasificatoriaGoles1.dataset.resultadoGoles = elim.clasificatoria.resultado.golesJugador1;
            clasificatoriaGoles2.dataset.resultadoGoles = elim.clasificatoria.resultado.golesJugador2;
            
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
        } else {
            // Si no hay resultado pero hay jugadores, habilitar el botón para jugar
            if ((elim.clasificatoria && elim.clasificatoria.jugador1 && elim.clasificatoria.jugador2) || 
                (esCuartos && clasificatoriaJugador1.textContent !== "Pendiente" && clasificatoriaJugador2.textContent !== "Pendiente")) {
                btnJugarClasificatoria.disabled = false;
            } else {
                btnJugarClasificatoria.disabled = true;
            }
        }
    }
    
    // Actualizar semifinal 2
    if (elim.semifinal2) {
        if (elim.semifinal2.jugador1) {
            semifinal2Jugador1.textContent = elim.semifinal2.jugador1.nombre;
            
            // Añadir información del grupo y posición
            if (semifinal2Grupo1) {
                const grupo = elim.semifinal2.jugador1.grupo || '';
                semifinal2Grupo1.textContent = grupo;
                
                // Mostrar posición en el grupo
                if (elim.semifinal2.jugador1.posicion) {
                    semifinal2Goles1.textContent = elim.semifinal2.jugador1.posicion;
                }
                
                console.log(`Jugador1 semifinal2 completo:`, elim.semifinal2.jugador1);
            }
        } else {
            semifinal2Jugador1.textContent = "Pendiente";
            if (semifinal2Grupo1) semifinal2Grupo1.textContent = "Pendiente";
        }
        
        // Para el jugador 2 de la semifinal 2 (ganador de clasificatoria o segundo jugador)
        if (elim.clasificatoria && elim.clasificatoria.resultado) {
            console.log("Procesando resultado de clasificatoria para semifinal 2");
            // Si ya se jugó la clasificatoria, mostramos el nombre del ganador
            const golesClasificatoria1 = elim.clasificatoria.resultado.golesJugador1;
            const golesClasificatoria2 = elim.clasificatoria.resultado.golesJugador2;
            
            console.log(`Resultado clasificatoria: ${golesClasificatoria1}-${golesClasificatoria2}`);
            console.log("Jugadores clasificatoria:", elim.clasificatoria.jugador1, elim.clasificatoria.jugador2);
            
            // Determinar el ganador según los goles
            let ganadorClasificatoria;
            let infoGanadorClasificatoria = "";
            
            // Determinar el jugador ganador directamente de los datos en memoria
            if (golesClasificatoria1 > golesClasificatoria2) {
                // Ganó el jugador 1
                if (elim.clasificatoria.jugador1) {
                    ganadorClasificatoria = elim.clasificatoria.jugador1.nombre;
                    infoGanadorClasificatoria = elim.clasificatoria.jugador1.grupo || '';
                    console.log("Ganador clasificatoria: Jugador 1 -", ganadorClasificatoria, infoGanadorClasificatoria);
                    
                    // Asignar al jugador ganador a semifinal 2
                    if (elim.semifinal2) {
                        elim.semifinal2.jugador2 = elim.clasificatoria.jugador1;
                    }
                } else {
                    ganadorClasificatoria = clasificatoriaJugador1.textContent;
                    infoGanadorClasificatoria = clasificatoriaGrupo1.textContent;
                    console.log("Ganador clasificatoria (desde DOM): Jugador 1 -", ganadorClasificatoria);
                }
            } else {
                // Ganó el jugador 2
                if (elim.clasificatoria.jugador2) {
                    ganadorClasificatoria = elim.clasificatoria.jugador2.nombre;
                    infoGanadorClasificatoria = elim.clasificatoria.jugador2.grupo || '';
                    console.log("Ganador clasificatoria: Jugador 2 -", ganadorClasificatoria, infoGanadorClasificatoria);
                    
                    // Asignar al jugador ganador a semifinal 2
                    if (elim.semifinal2) {
                        elim.semifinal2.jugador2 = elim.clasificatoria.jugador2;
                    }
                } else {
                    ganadorClasificatoria = clasificatoriaJugador2.textContent;
                    infoGanadorClasificatoria = clasificatoriaGrupo2.textContent;
                    console.log("Ganador clasificatoria (desde DOM): Jugador 2 -", ganadorClasificatoria);
                }
            }
            
            // Actualizar el nombre del jugador en la semifinal 2
            semifinal2Jugador2.textContent = ganadorClasificatoria;
            
            // Actualizar la información del grupo
            if (semifinal2Grupo2) {
                semifinal2Grupo2.textContent = infoGanadorClasificatoria;
                
                // Buscar información de la posición para el ganador de clasificatoria
                let posicionGanador = '';
                if (elim.clasificatoria.resultado.golesJugador1 > elim.clasificatoria.resultado.golesJugador2) {
                    if (elim.clasificatoria.jugador1 && elim.clasificatoria.jugador1.posicion) {
                        posicionGanador = elim.clasificatoria.jugador1.posicion;
                    } else {
                        // Buscar en la estructura de cuartos si estamos en ese modo
                        if (esCuartos && clasificatoriaJugador1.textContent) {
                            const nombreGanador = clasificatoriaJugador1.textContent;
                            ['cuartos1', 'cuartos2', 'cuartos3', 'cuartos4'].forEach(cuartoKey => {
                                if (elim[cuartoKey]) {
                                    if (elim[cuartoKey].jugador1 && elim[cuartoKey].jugador1.nombre === nombreGanador) {
                                        posicionGanador = elim[cuartoKey].jugador1.posicion || '';
                                    } else if (elim[cuartoKey].jugador2 && elim[cuartoKey].jugador2.nombre === nombreGanador) {
                                        posicionGanador = elim[cuartoKey].jugador2.posicion || '';
                                    }
                                }
                            });
                        }
                    }
                } else {
                    if (elim.clasificatoria.jugador2 && elim.clasificatoria.jugador2.posicion) {
                        posicionGanador = elim.clasificatoria.jugador2.posicion;
                    } else {
                        // Buscar en la estructura de cuartos si estamos en ese modo
                        if (esCuartos && clasificatoriaJugador2.textContent) {
                            const nombreGanador = clasificatoriaJugador2.textContent;
                            ['cuartos1', 'cuartos2', 'cuartos3', 'cuartos4'].forEach(cuartoKey => {
                                if (elim[cuartoKey]) {
                                    if (elim[cuartoKey].jugador1 && elim[cuartoKey].jugador1.nombre === nombreGanador) {
                                        posicionGanador = elim[cuartoKey].jugador1.posicion || '';
                                    } else if (elim[cuartoKey].jugador2 && elim[cuartoKey].jugador2.nombre === nombreGanador) {
                                        posicionGanador = elim[cuartoKey].jugador2.posicion || '';
                                    }
                                }
                            });
                        }
                    }
                }
                
                // Mostrar la posición en los goles solo si no hay resultado ya registrado
                if (posicionGanador && semifinal2Goles2.textContent === "-") {
                    semifinal2Goles2.textContent = posicionGanador;
                }
            }
        } else if (elim.semifinal2.jugador2) {
            // Si no se ha jugado la clasificatoria pero hay datos directos en semifinal2.jugador2
            semifinal2Jugador2.textContent = elim.semifinal2.jugador2.nombre || 'Ganador Clasificatoria';
            
            if (semifinal2Grupo2) {
                if (elim.semifinal2.jugador2.grupo) {
                    semifinal2Grupo2.textContent = elim.semifinal2.jugador2.grupo;
                    
                    // Si hay información de posición, mostrarla
                    if (elim.semifinal2.jugador2.posicion && semifinal2Goles2.textContent === "-") {
                        console.log("Asignando posición al jugador 2 semifinal2:", elim.semifinal2.jugador2.posicion);
                        semifinal2Goles2.textContent = elim.semifinal2.jugador2.posicion;
                    }
                } else {
                    semifinal2Grupo2.textContent = 'Ganador Clasificatoria';
                }
            }
        } else if (esCuartos && clasificatoriaJugador1.textContent !== "Pendiente" && clasificatoriaJugador2.textContent !== "Pendiente") {
            // Si estamos en estructura de cuartos y hay jugadores en clasificatoria
            semifinal2Jugador2.textContent = "Ganador Clasificatoria";
            if (semifinal2Grupo2) semifinal2Grupo2.textContent = "Por definir";
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
            // Guardamos las posiciones actuales antes de sobrescribirlas
            const posicion1 = semifinal2Goles1.textContent;
            const posicion2 = semifinal2Goles2.textContent;
            
            // Actualizamos con los resultados
            semifinal2Goles1.textContent = elim.semifinal2.resultado.golesJugador1;
            semifinal2Goles2.textContent = elim.semifinal2.resultado.golesJugador2;
            
            // Guardamos los resultados para luego (por si necesitamos restaurarlos)
            semifinal2Goles1.dataset.resultadoGoles = elim.semifinal2.resultado.golesJugador1;
            semifinal2Goles2.dataset.resultadoGoles = elim.semifinal2.resultado.golesJugador2;
            
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
            // Verificar que los jugadores no sean null antes de acceder a sus propiedades
            if (elim.semifinal1.jugador1 && elim.semifinal1.jugador2) {
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
                        finalGrupo1.textContent = ganadorInfo.grupo;
                        
                        // Si tiene posición, mostrarla en los goles
                        if (ganadorInfo.posicion && finalGoles1.textContent === "-") {
                            finalGoles1.textContent = ganadorInfo.posicion;
                        }
                    } else {
                        finalGrupo1.textContent = 'Ganador Semifinal 1';
                }
            }
            } else {
                console.log("No hay información de jugadores en semifinal1");
                // Verificar si hay un resultado para mostrar información más útil
                if (elim.semifinal1.resultado) {
                    // Si hay resultado pero no jugadores asignados, intentamos reconstruir la información
                    // desde los datos de cuartos si están disponibles
                    if (tieneEstructuraCuartos && elim.cuartos1 && elim.cuartos1.jugador1 && elim.cuartos2 && elim.cuartos2.jugador1) {
                        const golesJ1 = elim.semifinal1.resultado.golesJugador1;
                        const golesJ2 = elim.semifinal1.resultado.golesJugador2;
                        console.log(`Resultado semifinal1: ${golesJ1}-${golesJ2}`);
                        
                        // Determinar ganador según los goles
                        if (golesJ1 > golesJ2) {
                            finalJugador1.textContent = elim.cuartos1.jugador1.nombre;
                            if (finalGrupo1) finalGrupo1.textContent = elim.cuartos1.jugador1.grupo || 'Cuartos 1';
                        } else {
                            finalJugador1.textContent = elim.cuartos2.jugador1.nombre;
                            if (finalGrupo1) finalGrupo1.textContent = elim.cuartos2.jugador1.grupo || 'Cuartos 2';
                        }
                    } else {
                        // Si no podemos reconstruir desde cuartos, mostramos info genérica
                        finalJugador1.textContent = 'Ganador Semifinal 1';
                        if (finalGrupo1) finalGrupo1.textContent = 'No identificado';
                    }
                } else {
                    finalJugador1.textContent = 'Pendiente';
                    if (finalGrupo1) finalGrupo1.textContent = 'Pendiente';
                }
            }
        }
        
        if (elim.semifinal2 && elim.semifinal2.resultado) {
            // Verificar que los jugadores no sean null antes de acceder a sus propiedades
            if (elim.semifinal2.jugador1 && elim.semifinal2.jugador2) {
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
                        finalGrupo2.textContent = ganadorInfo.grupo;
                        
                        // Si tiene posición, mostrarla en los goles
                        if (ganadorInfo.posicion && finalGoles2.textContent === "-") {
                            finalGoles2.textContent = ganadorInfo.posicion;
                        }
                    } else {
                        // Si no hay grupo o viene de clasificatoria
                        finalGrupo2.textContent = 'Ganador Semifinal 2';
                    }
                }
            } else {
                console.log("No hay información de jugadores en semifinal2");
                // Verificar si hay un resultado para mostrar información más útil
                if (elim.semifinal2.resultado) {
                    // Si hay resultado pero no jugadores asignados, intentamos reconstruir la información
                    // desde los datos de cuartos si están disponibles
                    if (tieneEstructuraCuartos && elim.cuartos3 && elim.cuartos3.jugador1 && elim.cuartos4 && elim.cuartos4.jugador1) {
                        const golesJ1 = elim.semifinal2.resultado.golesJugador1;
                        const golesJ2 = elim.semifinal2.resultado.golesJugador2;
                        console.log(`Resultado semifinal2: ${golesJ1}-${golesJ2}`);
                        
                        // Determinar ganador según los goles
                        if (golesJ1 > golesJ2) {
                            finalJugador2.textContent = elim.cuartos3.jugador1.nombre;
                            if (finalGrupo2) finalGrupo2.textContent = elim.cuartos3.jugador1.grupo || 'Cuartos 3';
                        } else {
                            finalJugador2.textContent = elim.cuartos4.jugador1.nombre;
                            if (finalGrupo2) finalGrupo2.textContent = elim.cuartos4.jugador1.grupo || 'Cuartos 4';
                        }
                    } else {
                        // Si no podemos reconstruir desde cuartos, mostramos info genérica
                        finalJugador2.textContent = 'Ganador Semifinal 2';
                        if (finalGrupo2) finalGrupo2.textContent = 'No identificado';
                    }
                } else {
                    finalJugador2.textContent = 'Pendiente';
                    if (finalGrupo2) finalGrupo2.textContent = 'Pendiente';
                }
            }
            
            // Habilitar botón de jugar final solo cuando ambas semifinales están jugadas
            if (elim.semifinal1.resultado) {
                btnJugarFinal.disabled = false;
                btnJugarFinal.classList.add('hover:shadow-glow-neon');
            }
        }
        
        if (elim.final.resultado) {
            // Guardamos las posiciones actuales antes de sobrescribirlas
            const posicion1 = finalGoles1.textContent;
            const posicion2 = finalGoles2.textContent;
            
            // Actualizamos con los resultados
            finalGoles1.textContent = elim.final.resultado.golesJugador1;
            finalGoles2.textContent = elim.final.resultado.golesJugador2;
            
            // Guardamos los resultados para luego (por si necesitamos restaurarlos)
            finalGoles1.dataset.resultadoGoles = elim.final.resultado.golesJugador1;
            finalGoles2.dataset.resultadoGoles = elim.final.resultado.golesJugador2;
            
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
    
    // Verificar si tenemos la estructura correcta para jugar
    if (fase === 'clasificatoria') {
        fetchAPI('/api/eliminatorias').then(datos => {
            const elim = datos[0];
            if (!elim || !elim.clasificatoria) {
                mostrarMensaje('error', 'Error en la estructura del torneo. Por favor recarga la página.');
                console.error("Error: La estructura del torneo no contiene la fase clasificatoria");
                return;
            }
            // Continuar con el juego si la estructura es correcta
            continuarConPartido(fase);
        }).catch(error => {
            mostrarMensaje('error', 'Error al cargar datos. Por favor recarga la página.');
            console.error("Error al verificar estructura:", error);
        });
    } else {
        // Para otras fases, continuar directamente
        continuarConPartido(fase);
    }
}

function continuarConPartido(fase) {
    let titulo, jugador1, jugador2;
    
    switch (fase) {
        case 'semifinal1':
            titulo = 'Semifinal 1';
            jugador1 = semifinal1Jugador1.textContent;
            jugador2 = semifinal1Jugador2.textContent;
            // Verificar si los jugadores son válidos
            if (jugador1 === "Pendiente" || jugador2 === "Pendiente") {
                mostrarMensaje('error', 'No se puede jugar un partido con jugadores pendientes');
                return;
            }
            break;
        case 'clasificatoria':
            titulo = 'Clasificatoria';
            jugador1 = clasificatoriaJugador1.textContent;
            jugador2 = clasificatoriaJugador2.textContent;
            // Verificar si los jugadores son válidos
            if (jugador1 === "Pendiente" || jugador2 === "Pendiente") {
                mostrarMensaje('error', 'No se pueden registrar resultados para jugadores pendientes');
                return;
            }
            break;
        case 'semifinal2':
            titulo = 'Semifinal 2';
            jugador1 = semifinal2Jugador1.textContent;
            jugador2 = semifinal2Jugador2.textContent;
            // Si el jugador2 es "Ganador Clasificatoria" pero la clasificatoria no se ha jugado
            if (jugador2 === "Ganador Clasificatoria" && clasificatoriaGoles1.textContent === "-") {
                mostrarMensaje('error', 'Primero debe jugarse la clasificatoria');
                return;
            }
            // Verificar si los jugadores son válidos
            if (jugador1 === "Pendiente" || jugador2 === "Pendiente") {
                mostrarMensaje('error', 'No se puede jugar un partido con jugadores pendientes');
                return;
            }
            break;
        case 'final':
            titulo = 'Final';
            jugador1 = finalJugador1.textContent;
            jugador2 = finalJugador2.textContent;
            // Verificar si los jugadores son válidos
            if (jugador1 === "Pendiente" || jugador2 === "Pendiente") {
                mostrarMensaje('error', 'No se puede jugar un partido con jugadores pendientes');
                return;
            }
            break;
    }
    
    tituloModalEliminatoria.textContent = `Registrar Resultado - ${titulo}`;
    elimJugador1.textContent = jugador1;
    elimJugador2.textContent = jugador2;
    
    // Verificar nuevamente la estructura para casos de clasificatoria
    if (fase === 'clasificatoria') {
        const verifStructBtn = document.createElement('button');
        verifStructBtn.textContent = "Verificar estructura";
        verifStructBtn.classList.add("btn-secondary", "mt-2", "w-full");
        verifStructBtn.onclick = async (e) => {
            e.preventDefault();
            const eliminatorias = await fetchAPI('/api/eliminatorias');
            if (eliminatorias.length > 0) {
                const elim = eliminatorias[0];
                console.log("Estructura actual:", elim);
                if (elim.clasificatoria) {
                    mostrarMensaje('success', 'La estructura es correcta y contiene fase clasificatoria');
                } else {
                    mostrarMensaje('error', 'Error: La estructura no contiene fase clasificatoria');
                }
            }
        };
        
        // Agregar el botón solo si no existe ya
        const existingBtn = document.querySelector('#verifStructBtn');
        if (!existingBtn) {
            modalPartidoEliminatorias.querySelector('form').appendChild(verifStructBtn);
            verifStructBtn.id = 'verifStructBtn';
        }
    }
    
    modalPartidoEliminatorias.classList.remove('hidden');
}

async function registrarPartidoEliminatoria(e) {
    e.preventDefault();
    
    const fase = faseActualInput.value;
    const golesJugador1 = parseInt(golesElimJugador1.value);
    const golesJugador2 = parseInt(golesElimJugador2.value);
    
    // Verificar que los goles sean números válidos
    if (isNaN(golesJugador1) || isNaN(golesJugador2) || golesJugador1 < 0 || golesJugador2 < 0) {
        mostrarMensaje('error', 'Por favor ingrese goles válidos');
        return;
    }
    
    // Crear objeto de resultado
    const resultado = { 
        golesJugador1, 
        golesJugador2
    };
    
    try {
        // Si es una clasificatoria y estamos en estructura de cuartos, necesitamos enviar información adicional
        if (fase === 'clasificatoria') {
            // Obtener los nombres de los jugadores en la fase clasificatoria
            resultado.jugador1Nombre = clasificatoriaJugador1.textContent;
            resultado.jugador2Nombre = clasificatoriaJugador2.textContent;
        }
        
        // Guardar resultado
        const resultadoGuardado = await fetchAPI(`/api/eliminatorias/${fase}`, 'PUT', resultado);
        
        if (resultadoGuardado) {
            mostrarMensaje('success', 'Resultado registrado correctamente');
            formPartidoEliminatoria.reset();
            modalPartidoEliminatorias.classList.add('hidden');
            
            // Recargar eliminatorias
            cargarEliminatorias();
        }
    } catch (error) {
        console.error("Error al registrar partido:", error);
        mostrarMensaje('error', 'Error al registrar el resultado');
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
