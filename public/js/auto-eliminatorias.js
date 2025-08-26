// Función para verificar si todos los partidos de grupo han sido jugados
// y generar eliminatorias automáticamente si es el caso
async function verificarGenerarEliminatorias() {
    try {
        console.log("Verificando si se pueden generar eliminatorias automáticamente...");
        
        // Obtener los grupos y verificar todos los partidos
        const grupos = await fetchAPI('/api/grupos');
        if (!grupos || !Array.isArray(grupos)) {
            console.error("Error al obtener grupos");
            return;
        }
        
        // Verificar si todos los partidos han sido jugados
        let todosPartidosJugados = true;
        let partidosFaltantes = [];
        
        // Para cada grupo, verificar que todos los jugadores hayan jugado entre sí
        grupos.forEach(grupo => {
            const jugadores = grupo.jugadores;
            
            // Crear todas las combinaciones posibles de partidos
            for (let i = 0; i < jugadores.length; i++) {
                for (let j = i + 1; j < jugadores.length; j++) {
                    const partidoJugado = grupo.partidos && grupo.partidos.some(partido => 
                        (partido.jugador1._id === jugadores[i]._id && partido.jugador2._id === jugadores[j]._id) || 
                        (partido.jugador1._id === jugadores[j]._id && partido.jugador2._id === jugadores[i]._id)
                    );
                    
                    if (!partidoJugado) {
                        todosPartidosJugados = false;
                        partidosFaltantes.push({
                            grupo: grupo.nombre,
                            jugador1: jugadores[i].nombre,
                            jugador2: jugadores[j].nombre
                        });
                    }
                }
            }
        });
        
        console.log("¿Todos los partidos han sido jugados?", todosPartidosJugados);
        
        // Si no se han jugado todos los partidos, no hacemos nada
        if (!todosPartidosJugados) {
            return;
        }
        
        // Verificar si ya existen eliminatorias para no volver a generarlas
        const eliminatorias = await fetchAPI('/api/eliminatorias');
        if (eliminatorias && eliminatorias.length > 0) {
            console.log("Ya existen eliminatorias, no es necesario generarlas nuevamente");
            return;
        }
        
        // Todos los partidos jugados y no hay eliminatorias, generar automáticamente
        console.log("Todos los partidos de grupos han sido jugados, generando eliminatorias automáticamente...");
        
        // Llamar a la API para generar eliminatorias usando fetchAPI
        try {
            const resultado = await fetchAPI('/api/eliminatorias/generar', 'POST');
            
            if (!resultado) {
                console.error("Error al generar eliminatorias: no se obtuvo respuesta");
                return;
            }
            
            if (resultado.error) {
                console.error("Error al generar eliminatorias:", resultado.error);
                return;
            }
            
            console.log("Eliminatorias generadas exitosamente:", resultado);
        } catch (error) {
            console.error("Error al generar eliminatorias:", error);
            return;
        }
        
        // Mostrar mensaje de éxito
        mostrarMensaje('success', '¡Fase de grupos completada! Eliminatorias generadas automáticamente.');
        
        // Ofrecer al usuario ir a la página de eliminatorias después de un breve retraso
        setTimeout(() => {
            const confirmacion = confirm("¿Deseas ir a la página de eliminatorias para ver el cuadro?");
            if (confirmacion) {
                window.location.href = '/eliminatorias';
            }
        }, 1500);
        
    } catch (error) {
        console.error("Error al verificar/generar eliminatorias:", error);
    }
}
