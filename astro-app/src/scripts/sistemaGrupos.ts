// Sistema avanzado de grupos para el torneo FIFA
import type { Jugador, Grupo, ConfiguracionTorneo } from '../types/index';

interface GrupoGenerado {
  nombre: string;
  jugadores: string[];
  capacidad: number;
}

// Configuración de grupos según cantidad de jugadores
const configuracionesGrupos: Record<number, { grupos: number; distribucion: number[] }> = {
  4: { grupos: 1, distribucion: [4] },
  5: { grupos: 1, distribucion: [5] },
  6: { grupos: 2, distribucion: [3, 3] },
  7: { grupos: 1, distribucion: [7] },
  8: { grupos: 2, distribucion: [4, 4] },
  9: { grupos: 3, distribucion: [3, 3, 3] }, // ✅ Optimizado: 3 grupos perfectos de 3
  10: { grupos: 3, distribucion: [4, 3, 3] }, // ✅ Optimizado: 1 grupo de 4 + 2 grupos de 3
  11: { grupos: 3, distribucion: [4, 4, 3] }, // ✅ Optimizado: 2 grupos de 4 + 1 grupo de 3
  12: { grupos: 3, distribucion: [4, 4, 4] }, // ✅ Optimizado: 3 grupos perfectos de 4
  13: { grupos: 3, distribucion: [5, 4, 4] },
  14: { grupos: 4, distribucion: [4, 4, 3, 3] },
  15: { grupos: 3, distribucion: [5, 5, 5] },
  16: { grupos: 4, distribucion: [4, 4, 4, 4] },
  18: { grupos: 4, distribucion: [5, 5, 4, 4] },
  20: { grupos: 4, distribucion: [5, 5, 5, 5] },
  24: { grupos: 6, distribucion: [4, 4, 4, 4, 4, 4] }
};

export class SistemaGrupos {
  private jugadores: Jugador[] = [];
  private configuracion: ConfiguracionTorneo | null = null;

  constructor(jugadores: Jugador[], configuracion?: ConfiguracionTorneo) {
    this.jugadores = jugadores.filter(j => j.equipo); // Solo jugadores con equipo
    this.configuracion = configuracion || this.obtenerConfiguracionGuardada();
  }

  private obtenerConfiguracionGuardada(): ConfiguracionTorneo {
    const configGuardada = localStorage.getItem('torneoConfig');
    if (configGuardada) {
      return JSON.parse(configGuardada);
    }
    
    return {
      tipoGrupos: 'automatico',
      partidosGrupo: 'ida',
      tipoEliminatorias: 'automatico',
      permitirDuplicados: false,
      soloSelecciones: false
    };
  }

  /**
   * Genera grupos automáticamente según la cantidad de jugadores
   */
  generarGruposAutomatico(): GrupoGenerado[] {
    const totalJugadores = this.jugadores.length;
    
    if (totalJugadores < 4) {
      throw new Error('Se necesitan al menos 4 jugadores para formar grupos');
    }

    const config = configuracionesGrupos[totalJugadores] || this.calcularDistribucionOptima(totalJugadores);
    const grupos: GrupoGenerado[] = [];
    
    // Barajar jugadores para distribución aleatoria
    const jugadoresBarajados = this.barajarArray([...this.jugadores]);
    
    let indiceJugador = 0;
    const nombresGrupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    config.distribucion.forEach((capacidad, indice) => {
      const jugadoresGrupo = jugadoresBarajados
        .slice(indiceJugador, indiceJugador + capacidad)
        .map(j => j._id);
      
      grupos.push({
        nombre: `Grupo ${nombresGrupos[indice]}`,
        jugadores: jugadoresGrupo,
        capacidad
      });
      
      indiceJugador += capacidad;
    });

    return grupos;
  }

  /**
   * Calcula la distribución óptima para cualquier cantidad de jugadores
   */
  private calcularDistribucionOptima(totalJugadores: number): { grupos: number; distribucion: number[] } {
    // Preferir grupos de 4-5 jugadores
    let mejorConfig = { grupos: 1, distribucion: [totalJugadores] };
    let menorDiferencia = Infinity;

    for (let numGrupos = 2; numGrupos <= Math.floor(totalJugadores / 3); numGrupos++) {
      const jugadoresPorGrupo = Math.floor(totalJugadores / numGrupos);
      const jugadoresExtra = totalJugadores % numGrupos;
      
      const distribucion: number[] = [];
      for (let i = 0; i < numGrupos; i++) {
        distribucion.push(jugadoresPorGrupo + (i < jugadoresExtra ? 1 : 0));
      }
      
      // Calcular la diferencia máxima entre grupos
      const diferencia = Math.max(...distribucion) - Math.min(...distribucion);
      
      // Preferir configuraciones más equilibradas
      if (diferencia < menorDiferencia && jugadoresPorGrupo >= 3) {
        menorDiferencia = diferencia;
        mejorConfig = { grupos: numGrupos, distribucion };
      }
    }

    return mejorConfig;
  }

  /**
   * Genera todos los partidos para los grupos
   */
  generarPartidos(grupos: GrupoGenerado[]): any[] {
    const partidos: any[] = [];
    const esIdaVuelta = this.configuracion?.partidosGrupo === 'ida-vuelta';
    
    grupos.forEach(grupo => {
      const jugadoresGrupo = grupo.jugadores;
      
      // Generar enfrentamientos todos contra todos
      for (let i = 0; i < jugadoresGrupo.length; i++) {
        for (let j = i + 1; j < jugadoresGrupo.length; j++) {
          const jugador1 = jugadoresGrupo[i];
          const jugador2 = jugadoresGrupo[j];
          
          // Partido de ida
          partidos.push({
            jugador1,
            jugador2,
            grupo: grupo.nombre,
            jornada: 1,
            tipo: 'grupo',
            fecha: new Date().toISOString()
          });
          
          // Partido de vuelta si está configurado
          if (esIdaVuelta) {
            partidos.push({
              jugador1: jugador2,
              jugador2: jugador1,
              grupo: grupo.nombre,
              jornada: 2,
              tipo: 'grupo',
              fecha: new Date().toISOString()
            });
          }
        }
      }
    });

    return partidos;
  }

  /**
   * Calcula clasificados para eliminatorias según configuración de grupos
   */
  calcularClasificados(grupos: GrupoGenerado[]): { estructura: string; clasificados: number } {
    const totalJugadores = this.jugadores.length;
    const numGrupos = grupos.length;
    
    let clasificadosPorGrupo: number;
    let totalClasificados: number;
    
    // Determinar clasificados según el número de grupos
    if (numGrupos === 1) {
      // Todos pasan a eliminatorias o top 4/8
      if (totalJugadores <= 8) {
        clasificadosPorGrupo = Math.min(4, totalJugadores);
        totalClasificados = clasificadosPorGrupo;
      } else {
        clasificadosPorGrupo = 8;
        totalClasificados = 8;
      }
    } else if (numGrupos === 2) {
      // 2 clasificados por grupo (4 total) o top 2-3 por grupo
      clasificadosPorGrupo = totalJugadores >= 8 ? 2 : Math.floor(totalJugadores / numGrupos);
      totalClasificados = clasificadosPorGrupo * numGrupos;
    } else if (numGrupos >= 3) {
      // 1-2 clasificados por grupo
      clasificadosPorGrupo = totalJugadores >= 12 ? 2 : 1;
      totalClasificados = clasificadosPorGrupo * numGrupos;
    } else {
      clasificadosPorGrupo = 2;
      totalClasificados = 8;
    }

    // Asegurar que el número de clasificados sea potencia de 2 para eliminatorias
    const potenciasDe2 = [2, 4, 8, 16, 32];
    totalClasificados = potenciasDe2.find(p => p >= totalClasificados) || totalClasificados;

    return {
      estructura: `${clasificadosPorGrupo} clasificado(s) por grupo`,
      clasificados: totalClasificados
    };
  }

  /**
   * Genera estructura de eliminatorias adaptada a los clasificados
   */
  generarEstructuraEliminatorias(totalClasificados: number): any {
    const estructuras: Record<number, any> = {
      2: {
        fases: ['final'],
        partidos: 1,
        descripcion: 'Final directa'
      },
      4: {
        fases: ['semifinal', 'final'],
        partidos: 3,
        descripcion: 'Semifinales + Final + 3er puesto'
      },
      8: {
        fases: ['cuartos', 'semifinal', 'final'],
        partidos: 7,
        descripcion: 'Cuartos + Semifinales + Final + 3er puesto'
      },
      16: {
        fases: ['octavos', 'cuartos', 'semifinal', 'final'],
        partidos: 15,
        descripcion: 'Octavos + Cuartos + Semifinales + Final + 3er puesto'
      }
    };

    return estructuras[totalClasificados] || estructuras[8];
  }

  /**
   * Utilidad para barajar array
   */
  private barajarArray<T>(array: T[]): T[] {
    const resultado = [...array];
    for (let i = resultado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  }

  /**
   * Obtiene información completa del sistema de grupos
   */
  obtenerInformacionCompleta(): any {
    const grupos = this.generarGruposAutomatico();
    const partidos = this.generarPartidos(grupos);
    const clasificacion = this.calcularClasificados(grupos);
    const eliminatorias = this.generarEstructuraEliminatorias(clasificacion.clasificados);

    return {
      grupos,
      partidos,
      clasificacion,
      eliminatorias,
      resumen: {
        totalJugadores: this.jugadores.length,
        totalGrupos: grupos.length,
        partidosGrupo: partidos.length,
        clasificados: clasificacion.clasificados,
        configuracion: this.configuracion
      }
    };
  }
}

// Función para mostrar información del sistema
export function mostrarInformacionSistema(jugadores: Jugador[]): void {
  const sistema = new SistemaGrupos(jugadores);
  const info = sistema.obtenerInformacionCompleta();
  
  console.group('🏆 Sistema de Torneo FIFA');
  console.log('📊 Resumen:', info.resumen);
  console.log('👥 Grupos:', info.grupos);
  console.log('⚽ Partidos:', `${info.partidos.length} partidos en fase de grupos`);
  console.log('🏅 Clasificación:', info.clasificacion);
  console.log('⚔️ Eliminatorias:', info.eliminatorias);
  console.groupEnd();
  
  return info;
}
