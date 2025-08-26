// Funciones avanzadas para generación dinámica de grupos
export class TorneoManager {
    constructor() {
        this.configuracion = {
            tipoGrupos: 'automatico',
            partidosGrupo: 'todos-contra-todos',
            tipoEliminatorias: 'automatico',
            idaVuelta: false
        };
    }

    /**
     * Calcula la distribución óptima de grupos según el número de jugadores
     */
    calcularDistribucionGrupos(numJugadores) {
        const distribuciones = {
            4: [4], // 1 grupo de 4
            5: [5], // 1 grupo de 5
            6: [3, 3], // 2 grupos de 3
            7: [4, 3], // 1 grupo de 4, 1 de 3
            8: [4, 4], // 2 grupos de 4
            9: [3, 3, 3], // 3 grupos de 3
            10: [4, 3, 3], // 1 grupo de 4, 2 de 3
            11: [4, 4, 3], // 2 grupos de 4, 1 de 3
            12: [4, 4, 4], // 3 grupos de 4
            13: [4, 3, 3, 3], // 1 grupo de 4, 3 de 3
            14: [4, 4, 3, 3], // 2 grupos de 4, 2 de 3
            15: [5, 5, 5], // 3 grupos de 5
            16: [4, 4, 4, 4] // 4 grupos de 4
        };

        return distribuciones[numJugadores] || this.calcularDistribucionPersonalizada(numJugadores);
    }

    /**
     * Calcula distribución personalizada para números no estándar
     */
    calcularDistribucionPersonalizada(numJugadores) {
        const grupos = [];
        let restantes = numJugadores;
        
        // Preferir grupos de 4, luego de 3
        while (restantes >= 4) {
            if (restantes === 5 || restantes === 7) {
                // Casos especiales para evitar grupos de 1 o 2
                grupos.push(3);
                restantes -= 3;
            } else {
                grupos.push(4);
                restantes -= 4;
            }
        }
        
        if (restantes === 3) {
            grupos.push(3);
        } else if (restantes === 2) {
            // Redistribuir: quitar 1 del último grupo y hacer un grupo de 3
            if (grupos.length > 0 && grupos[grupos.length - 1] === 4) {
                grupos[grupos.length - 1] = 3;
                grupos.push(3);
            } else {
                grupos.push(2); // Como último recurso
            }
        }
        
        return grupos.sort((a, b) => b - a); // Ordenar de mayor a menor
    }

    /**
     * Genera partidos para un grupo específico
     */
    generarPartidosGrupo(jugadores, nombreGrupo, idaVuelta = false) {
        const partidos = [];
        const n = jugadores.length;
        
        // Generar todas las combinaciones posibles
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                // Partido de ida
                partidos.push({
                    jugador1: jugadores[i],
                    jugador2: jugadores[j],
                    grupo: nombreGrupo,
                    tipo: 'grupo',
                    ida: true,
                    fecha: null,
                    resultado1: null,
                    resultado2: null
                });
                
                // Partido de vuelta si está habilitado
                if (idaVuelta) {
                    partidos.push({
                        jugador1: jugadores[j],
                        jugador2: jugadores[i],
                        grupo: nombreGrupo,
                        tipo: 'grupo',
                        ida: false,
                        fecha: null,
                        resultado1: null,
                        resultado2: null
                    });
                }
            }
        }
        
        return partidos;
    }

    /**
     * Calcula la estructura de eliminatorias según los grupos
     */
    calcularEstructuraEliminatorias(distribuciones) {
        const totalGrupos = distribuciones.length;
        const totalClasificados = totalGrupos * 2; // 2 mejores de cada grupo
        
        let estructura = {};
        
        if (totalClasificados >= 16) {
            // Octavos de final
            estructura = {
                octavos: this.generarOctavos(totalClasificados),
                cuartos: this.generarEtapaEliminatoria('cuartos', 4),
                semifinal: this.generarEtapaEliminatoria('semifinal', 2),
                final: this.generarEtapaEliminatoria('final', 1)
            };
        } else if (totalClasificados >= 8) {
            // Cuartos de final
            estructura = {
                cuartos: this.generarCuartos(totalClasificados),
                semifinal: this.generarEtapaEliminatoria('semifinal', 2),
                final: this.generarEtapaEliminatoria('final', 1)
            };
        } else if (totalClasificados >= 4) {
            // Semifinales
            estructura = {
                semifinal: this.generarSemifinales(totalClasificados),
                final: this.generarEtapaEliminatoria('final', 1)
            };
        } else {
            // Final directa
            estructura = {
                final: this.generarEtapaEliminatoria('final', 1)
            };
        }
        
        // Casos especiales para distribuciones irregulares
        if (this.esDistribucionIrregular(distribuciones)) {
            estructura = this.ajustarEstructuraIrregular(estructura, distribuciones);
        }
        
        return estructura;
    }

    /**
     * Detecta si la distribución necesita partidos clasificatorios
     */
    esDistribucionIrregular(distribuciones) {
        // Ejemplos: [4,3,3], [4,4,3], etc.
        const grupos4 = distribuciones.filter(g => g === 4).length;
        const grupos3 = distribuciones.filter(g => g === 3).length;
        
        // Si hay mix de grupos de 3 y 4, puede necesitar clasificatorias
        return grupos3 > 0 && grupos4 > 0 && distribuciones.length === 3;
    }

    /**
     * Ajusta la estructura para casos irregulares
     */
    ajustarEstructuraIrregular(estructura, distribuciones) {
        if (distribuciones.length === 3) {
            // Caso especial: 3 grupos = 6 clasificados
            // Necesitamos reducir a 4 para semifinales
            return {
                clasificatoria: {
                    partidos: [
                        { fase: 'clasificatoria', descripcion: '2° mejor entre grupos de 3 vs 2° grupo de 4' }
                    ]
                },
                semifinal: estructura.semifinal,
                final: estructura.final
            };
        }
        
        return estructura;
    }

    /**
     * Calcula estadísticas avanzadas
     */
    calcularEstadisticasAvanzadas(jugadores, partidos) {
        const stats = {
            totalPartidos: partidos.length,
            partidosJugados: partidos.filter(p => p.resultado1 !== null).length,
            totalGoles: 0,
            promedioGolesPorPartido: 0,
            maximoGoleador: null,
            menosGoleado: null,
            mejorDiferencia: null
        };
        
        // Calcular goles totales
        partidos.forEach(partido => {
            if (partido.resultado1 !== null && partido.resultado2 !== null) {
                stats.totalGoles += partido.resultado1 + partido.resultado2;
            }
        });
        
        stats.promedioGolesPorPartido = stats.partidosJugados > 0 ? 
            (stats.totalGoles / stats.partidosJugados).toFixed(2) : 0;
        
        // Encontrar máximo goleador
        let maxGoles = 0;
        let minGolesConcedidos = Infinity;
        let mejorDif = -Infinity;
        
        jugadores.forEach(jugador => {
            const golesFavor = jugador.estadisticas?.golesFavor || 0;
            const golesContra = jugador.estadisticas?.golesContra || 0;
            const diferencia = golesFavor - golesContra;
            
            if (golesFavor > maxGoles) {
                maxGoles = golesFavor;
                stats.maximoGoleador = jugador;
            }
            
            if (golesContra < minGolesConcedidos) {
                minGolesConcedidos = golesContra;
                stats.menosGoleado = jugador;
            }
            
            if (diferencia > mejorDif) {
                mejorDif = diferencia;
                stats.mejorDiferencia = jugador;
            }
        });
        
        return stats;
    }

    /**
     * Genera calendario de partidos optimizado
     */
    generarCalendario(partidos, configuracion = {}) {
        const { 
            fechaInicio = new Date(),
            diasEntreFechas = 1,
            partidosPorFecha = 2 
        } = configuracion;
        
        const calendario = [];
        let fechaActual = new Date(fechaInicio);
        
        for (let i = 0; i < partidos.length; i += partidosPorFecha) {
            const jornada = {
                fecha: new Date(fechaActual),
                partidos: partidos.slice(i, i + partidosPorFecha),
                numeroJornada: Math.floor(i / partidosPorFecha) + 1
            };
            
            calendario.push(jornada);
            fechaActual.setDate(fechaActual.getDate() + diasEntreFechas);
        }
        
        return calendario;
    }

    // Métodos auxiliares privados
    generarOctavos(total) {
        const partidos = [];
        for (let i = 0; i < 8; i++) {
            partidos.push({
                id: `octavos_${i + 1}`,
                jugador1: null,
                jugador2: null,
                resultado: null
            });
        }
        return partidos;
    }

    generarCuartos(total) {
        const partidos = [];
        for (let i = 0; i < 4; i++) {
            partidos.push({
                id: `cuartos_${i + 1}`,
                jugador1: null,
                jugador2: null,
                resultado: null
            });
        }
        return partidos;
    }

    generarSemifinales(total) {
        return [
            { id: 'semifinal_1', jugador1: null, jugador2: null, resultado: null },
            { id: 'semifinal_2', jugador1: null, jugador2: null, resultado: null }
        ];
    }

    generarEtapaEliminatoria(nombre, cantidad) {
        const partidos = [];
        for (let i = 0; i < cantidad; i++) {
            partidos.push({
                id: `${nombre}_${i + 1}`,
                jugador1: null,
                jugador2: null,
                resultado: null
            });
        }
        return partidos;
    }
}

// Funciones de utilidad para ordenación
export function ordenarJugadoresPorPuntos(jugadores) {
    return [...jugadores].sort((a, b) => {
        const puntosA = a.estadisticas?.puntos || 0;
        const puntosB = b.estadisticas?.puntos || 0;
        
        if (puntosA !== puntosB) return puntosB - puntosA;
        
        // Criterios de desempate
        const difA = (a.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesContra || 0);
        const difB = (b.estadisticas?.golesFavor || 0) - (b.estadisticas?.golesContra || 0);
        
        if (difA !== difB) return difB - difA;
        
        // Goles a favor
        const golesA = a.estadisticas?.golesFavor || 0;
        const golesB = b.estadisticas?.golesFavor || 0;
        
        return golesB - golesA;
    });
}

// Simulador de partidos mejorado
export class SimuladorPartidos {
    static simularPartido(jugador1, jugador2) {
        // Calcular probabilidades basadas en estadísticas
        const nivel1 = this.calcularNivel(jugador1);
        const nivel2 = this.calcularNivel(jugador2);
        
        // Generar resultado realista
        const probabilidad1 = nivel1 / (nivel1 + nivel2);
        
        let goles1, goles2;
        
        if (Math.random() < probabilidad1) {
            // Jugador 1 gana
            goles1 = Math.floor(Math.random() * 3) + 1; // 1-3 goles
            goles2 = Math.floor(Math.random() * goles1); // 0 a goles1-1
        } else {
            // Jugador 2 gana o empate
            goles2 = Math.floor(Math.random() * 3) + 1;
            goles1 = Math.floor(Math.random() * goles2);
        }
        
        // Posibilidad de empate (15%)
        if (Math.random() < 0.15) {
            const empate = Math.floor(Math.random() * 3);
            goles1 = goles2 = empate;
        }
        
        return { goles1, goles2 };
    }
    
    static calcularNivel(jugador) {
        const stats = jugador.estadisticas || {};
        const partidosJugados = stats.partidosJugados || 1;
        const promedio = (stats.puntos || 0) / partidosJugados;
        
        return Math.max(1, promedio * 10); // Nivel base mínimo de 1
    }
}
