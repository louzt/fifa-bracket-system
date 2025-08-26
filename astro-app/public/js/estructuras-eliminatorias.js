// Función para renderizar la estructura específica con clasificatoria
function renderizarEstructuraClasificatoria(elim) {
    console.log("Renderizando estructura con clasificatoria:", elim);
    
    // Asegurar que mostramos la estructura correcta en el HTML
    if (document.querySelector('.estructura-cuartos')) {
        document.querySelector('.estructura-cuartos').classList.add('hidden');
    }
    if (document.querySelector('.estructura-clasificatoria')) {
        document.querySelector('.estructura-clasificatoria').classList.remove('hidden');
    }
    
    // Actualizar semifinal 1
    if (elim.semifinal1) {
        if (elim.semifinal1.jugador1) {
            semifinal1Jugador1.textContent = elim.semifinal1.jugador1.nombre;
        } else {
            semifinal1Jugador1.textContent = "Pendiente";
        }
        
        if (elim.semifinal1.jugador2) {
            semifinal1Jugador2.textContent = elim.semifinal1.jugador2.nombre;
        } else {
            semifinal1Jugador2.textContent = "Pendiente";
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
        if (elim.clasificatoria.jugador1) {
            clasificatoriaJugador1.textContent = elim.clasificatoria.jugador1.nombre;
        } else {
            clasificatoriaJugador1.textContent = "Pendiente";
        }
        
        if (elim.clasificatoria.jugador2) {
            clasificatoriaJugador2.textContent = elim.clasificatoria.jugador2.nombre;
        } else {
            clasificatoriaJugador2.textContent = "Pendiente";
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
        } else {
            semifinal2Jugador1.textContent = "Pendiente";
        }
        
        if (elim.semifinal2.jugador2) {
            semifinal2Jugador2.textContent = elim.semifinal2.jugador2.nombre;
        } else {
            semifinal2Jugador2.textContent = "Ganador Clasificatoria";
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
        // Jugador 1 de la final
        if (elim.final.jugador1) {
            finalJugador1.textContent = elim.final.jugador1.nombre;
        } else if (elim.semifinal1 && elim.semifinal1.resultado) {
            const ganador = elim.semifinal1.resultado.golesJugador1 > elim.semifinal1.resultado.golesJugador2 ?
                elim.semifinal1.jugador1 : elim.semifinal1.jugador2;
            finalJugador1.textContent = ganador ? ganador.nombre : "Pendiente";
        } else {
            finalJugador1.textContent = "Ganador SF1";
        }
        
        // Jugador 2 de la final
        if (elim.final.jugador2) {
            finalJugador2.textContent = elim.final.jugador2.nombre;
        } else if (elim.semifinal2 && elim.semifinal2.resultado) {
            const ganador = elim.semifinal2.resultado.golesJugador1 > elim.semifinal2.resultado.golesJugador2 ?
                elim.semifinal2.jugador1 : elim.semifinal2.jugador2;
            finalJugador2.textContent = ganador ? ganador.nombre : "Pendiente";
        } else {
            finalJugador2.textContent = "Ganador SF2";
        }
        
        if (elim.final.resultado) {
            finalGoles1.textContent = elim.final.resultado.golesJugador1;
            finalGoles2.textContent = elim.final.resultado.golesJugador2;
            btnJugarFinal.disabled = true;
            btnJugarFinal.textContent = 'Partido Jugado';
            btnJugarFinal.classList.add('bg-gray-500');
            btnJugarFinal.classList.remove('btn-primary');
            
            // Destacar ganador
            if (elim.final.resultado.golesJugador1 > elim.final.resultado.golesJugador2) {
                finalJugador1.classList.add('text-gamer-neon', 'font-bold');
                finalGoles1.classList.add('bg-gamer-neon');
            } else {
                finalJugador2.classList.add('text-gamer-neon', 'font-bold');
                finalGoles2.classList.add('bg-gamer-neon');
            }
        }
    }
}

// Función para renderizar en modo compatibilidad (cuando hay cuartos pero debería ser clasificatoria)
function renderizarEstructuraCompatibilidad(elim) {
    console.log("MODO DE COMPATIBILIDAD: Creando clasificatoria a partir de cuartos");
    
    // Intentar identificar los "segundos lugares" en los cuartos para armar la clasificatoria
    const segundosLugares = [];
    
    // Revisar cada uno de los cuartos para encontrar jugadores
    if (elim.cuartos2 && elim.cuartos2.jugador2) {
        console.log("Encontrado segundo lugar en cuartos2:", elim.cuartos2.jugador2.nombre);
        segundosLugares.push(elim.cuartos2.jugador2);
    }
    
    if (elim.cuartos3 && elim.cuartos3.jugador2) {
        console.log("Encontrado segundo lugar en cuartos3:", elim.cuartos3.jugador2.nombre);
        segundosLugares.push(elim.cuartos3.jugador2);
    }
    
    console.log("Total de segundos lugares encontrados:", segundosLugares.length);
    
    // Crear estructura sintética para clasificatoria
    const nuevaEstructura = {
        semifinal1: elim.semifinal1,
        clasificatoria: {
            jugador1: segundosLugares[0] || null,
            jugador2: segundosLugares[1] || null,
            resultado: null
        },
        semifinal2: elim.semifinal2,
        final: elim.final,
        _id: elim._id
    };
    
    // Renderizar usando la estructura sintética
    renderizarEstructuraClasificatoria(nuevaEstructura);
}
