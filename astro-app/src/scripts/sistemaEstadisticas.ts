// Sistema de estadísticas avanzadas para el torneo FIFA
import type { Jugador, Partido } from '../types/index';

interface EstadisticaJugador {
  jugadorId: string;
  nombre: string;
  equipo?: string;
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciadeGoles: number;
  puntos: number;
  promedioGoles: number;
  porcentajeVictorias: number;
  rachaActual: string; // "V-V-E-D-V"
  mejorVictoria?: { rival: string; goles: string };
  peorDerrota?: { rival: string; goles: string };
}

interface EstadisticaEquipo {
  equipo: string;
  vecesUsado: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAFavor: number;
  golesEnContra: number;
  rendimiento: number; // porcentaje de efectividad
  mejorJugador?: string;
}

interface TopGoleador {
  jugadorId: string;
  nombre: string;
  goles: number;
  partidos: number;
  promedioGoles: number;
}

interface EstadisticasGenerales {
  totalPartidos: number;
  totalGoles: number;
  promedioGolesPorPartido: number;
  partidoConMasGoles: { partido: string; goles: number };
  mayorGoleada: { ganador: string; perdedor: string; marcador: string };
  equipoMasEfectivo: string;
  equipoMenosEfectivo: string;
}

export class SistemaEstadisticas {
  private partidos: Partido[] = [];
  private jugadores: Jugador[] = [];

  constructor(partidos: Partido[], jugadores: Jugador[]) {
    this.partidos = partidos.filter(p => p.golesJugador1 !== undefined && p.golesJugador2 !== undefined);
    this.jugadores = jugadores;
  }

  /**
   * Calcula estadísticas individuales de cada jugador
   */
  calcularEstadisticasJugadores(): EstadisticaJugador[] {
    const estadisticas: Map<string, EstadisticaJugador> = new Map();

    // Inicializar estadísticas
    this.jugadores.forEach(jugador => {
      estadisticas.set(jugador._id, {
        jugadorId: jugador._id,
        nombre: jugador.nombre,
        equipo: typeof jugador.equipo === 'string' ? jugador.equipo : jugador.equipo?.nombre,
        partidosJugados: 0,
        victorias: 0,
        empates: 0,
        derrotas: 0,
        golesAFavor: 0,
        golesEnContra: 0,
        diferenciadeGoles: 0,
        puntos: 0,
        promedioGoles: 0,
        porcentajeVictorias: 0,
        rachaActual: ''
      });
    });

    // Procesar partidos
    this.partidos.forEach(partido => {
      const est1 = estadisticas.get(partido.jugador1);
      const est2 = estadisticas.get(partido.jugador2);

      if (!est1 || !est2) return;

      const goles1 = partido.golesJugador1 || 0;
      const goles2 = partido.golesJugador2 || 0;

      // Actualizar estadísticas básicas
      est1.partidosJugados++;
      est2.partidosJugados++;
      est1.golesAFavor += goles1;
      est1.golesEnContra += goles2;
      est2.golesAFavor += goles2;
      est2.golesEnContra += goles1;

      // Determinar resultado
      if (goles1 > goles2) {
        // Jugador 1 gana
        est1.victorias++;
        est1.puntos += 3;
        est2.derrotas++;
        this.actualizarMejorPeor(est1, est2, `${goles1}-${goles2}`, 'victoria');
        this.actualizarMejorPeor(est2, est1, `${goles2}-${goles1}`, 'derrota');
      } else if (goles2 > goles1) {
        // Jugador 2 gana
        est2.victorias++;
        est2.puntos += 3;
        est1.derrotas++;
        this.actualizarMejorPeor(est2, est1, `${goles2}-${goles1}`, 'victoria');
        this.actualizarMejorPeor(est1, est2, `${goles1}-${goles2}`, 'derrota');
      } else {
        // Empate
        est1.empates++;
        est2.empates++;
        est1.puntos += 1;
        est2.puntos += 1;
      }
    });

    // Calcular estadísticas derivadas
    estadisticas.forEach(est => {
      est.diferenciadeGoles = est.golesAFavor - est.golesEnContra;
      est.promedioGoles = est.partidosJugados > 0 ? 
        parseFloat((est.golesAFavor / est.partidosJugados).toFixed(2)) : 0;
      est.porcentajeVictorias = est.partidosJugados > 0 ? 
        parseFloat(((est.victorias / est.partidosJugados) * 100).toFixed(1)) : 0;
      est.rachaActual = this.calcularRacha(est.jugadorId);
    });

    return Array.from(estadisticas.values())
      .sort((a, b) => {
        // Ordenar por puntos, luego por diferencia de goles, luego por goles a favor
        if (a.puntos !== b.puntos) return b.puntos - a.puntos;
        if (a.diferenciadeGoles !== b.diferenciadeGoles) return b.diferenciadeGoles - a.diferenciadeGoles;
        return b.golesAFavor - a.golesAFavor;
      });
  }

  /**
   * Calcula el top de goleadores
   */
  calcularTopGoleadores(limite: number = 10): TopGoleador[] {
    const goleadores: Map<string, TopGoleador> = new Map();

    this.partidos.forEach(partido => {
      const jugador1 = this.jugadores.find(j => j._id === partido.jugador1);
      const jugador2 = this.jugadores.find(j => j._id === partido.jugador2);

      if (jugador1) {
        const current = goleadores.get(partido.jugador1) || {
          jugadorId: partido.jugador1,
          nombre: jugador1.nombre,
          goles: 0,
          partidos: 0,
          promedioGoles: 0
        };
        current.goles += partido.golesJugador1 || 0;
        current.partidos++;
        goleadores.set(partido.jugador1, current);
      }

      if (jugador2) {
        const current = goleadores.get(partido.jugador2) || {
          jugadorId: partido.jugador2,
          nombre: jugador2.nombre,
          goles: 0,
          partidos: 0,
          promedioGoles: 0
        };
        current.goles += partido.golesJugador2 || 0;
        current.partidos++;
        goleadores.set(partido.jugador2, current);
      }
    });

    // Calcular promedio y ordenar
    return Array.from(goleadores.values())
      .map(g => ({
        ...g,
        promedioGoles: parseFloat((g.goles / g.partidos).toFixed(2))
      }))
      .sort((a, b) => {
        if (a.goles !== b.goles) return b.goles - a.goles;
        return b.promedioGoles - a.promedioGoles;
      })
      .slice(0, limite);
  }

  /**
   * Calcula estadísticas por equipo
   */
  calcularEstadisticasEquipos(): EstadisticaEquipo[] {
    const equipos: Map<string, EstadisticaEquipo> = new Map();

    this.partidos.forEach(partido => {
      const jugador1 = this.jugadores.find(j => j._id === partido.jugador1);
      const jugador2 = this.jugadores.find(j => j._id === partido.jugador2);

      if (jugador1?.equipo) {
        const equipo1 = typeof jugador1.equipo === 'string' ? jugador1.equipo : jugador1.equipo.nombre;
        this.actualizarEstadisticaEquipo(equipos, equipo1, 
          partido.golesJugador1 || 0, partido.golesJugador2 || 0, jugador1.nombre);
      }

      if (jugador2?.equipo) {
        const equipo2 = typeof jugador2.equipo === 'string' ? jugador2.equipo : jugador2.equipo.nombre;
        this.actualizarEstadisticaEquipo(equipos, equipo2, 
          partido.golesJugador2 || 0, partido.golesJugador1 || 0, jugador2.nombre);
      }
    });

    // Calcular rendimiento
    equipos.forEach(est => {
      const totalPartidos = est.victorias + est.empates + est.derrotas;
      est.rendimiento = totalPartidos > 0 ? 
        parseFloat(((est.victorias * 3 + est.empates) / (totalPartidos * 3) * 100).toFixed(1)) : 0;
    });

    return Array.from(equipos.values())
      .sort((a, b) => b.rendimiento - a.rendimiento);
  }

  /**
   * Calcula estadísticas generales del torneo
   */
  calcularEstadisticasGenerales(): EstadisticasGenerales {
    const totalGoles = this.partidos.reduce((total, p) => 
      total + ((p.golesJugador1 || 0) + (p.golesJugador2 || 0)), 0);
    
    const promedioGolesPorPartido = this.partidos.length > 0 ? 
      parseFloat((totalGoles / this.partidos.length).toFixed(2)) : 0;

    // Encontrar partido con más goles
    const partidoMasGoles = this.partidos.reduce((max, partido) => {
      const golesPartido = (partido.golesJugador1 || 0) + (partido.golesJugador2 || 0);
      if (golesPartido > max.goles) {
        const j1 = this.jugadores.find(j => j._id === partido.jugador1);
        const j2 = this.jugadores.find(j => j._id === partido.jugador2);
        return {
          partido: `${j1?.nombre || 'N/A'} vs ${j2?.nombre || 'N/A'}`,
          goles: golesPartido
        };
      }
      return max;
    }, { partido: 'N/A', goles: 0 });

    // Encontrar mayor goleada
    const mayorGoleada = this.partidos.reduce((max, partido) => {
      const diferencia = Math.abs((partido.golesJugador1 || 0) - (partido.golesJugador2 || 0));
      if (diferencia > max.diferencia) {
        const j1 = this.jugadores.find(j => j._id === partido.jugador1);
        const j2 = this.jugadores.find(j => j._id === partido.jugador2);
        const ganador = (partido.golesJugador1 || 0) > (partido.golesJugador2 || 0) ? j1?.nombre : j2?.nombre;
        const perdedor = (partido.golesJugador1 || 0) > (partido.golesJugador2 || 0) ? j2?.nombre : j1?.nombre;
        return {
          diferencia,
          ganador: ganador || 'N/A',
          perdedor: perdedor || 'N/A',
          marcador: `${partido.golesJugador1 || 0}-${partido.golesJugador2 || 0}`
        };
      }
      return max;
    }, { diferencia: 0, ganador: 'N/A', perdedor: 'N/A', marcador: '0-0' });

    const estadisticasEquipos = this.calcularEstadisticasEquipos();

    return {
      totalPartidos: this.partidos.length,
      totalGoles,
      promedioGolesPorPartido,
      partidoConMasGoles: partidoMasGoles,
      mayorGoleada: {
        ganador: mayorGoleada.ganador,
        perdedor: mayorGoleada.perdedor,
        marcador: mayorGoleada.marcador
      },
      equipoMasEfectivo: estadisticasEquipos[0]?.equipo || 'N/A',
      equipoMenosEfectivo: estadisticasEquipos[estadisticasEquipos.length - 1]?.equipo || 'N/A'
    };
  }

  /**
   * Obtiene el historial de enfrentamientos entre dos jugadores
   */
  obtenerHistorialEnfrentamiento(jugador1Id: string, jugador2Id: string): any {
    const enfrentamientos = this.partidos.filter(p => 
      (p.jugador1 === jugador1Id && p.jugador2 === jugador2Id) ||
      (p.jugador1 === jugador2Id && p.jugador2 === jugador1Id)
    );

    let victoriasJ1 = 0, victoriasJ2 = 0, empates = 0;
    let golesJ1 = 0, golesJ2 = 0;

    enfrentamientos.forEach(partido => {
      if (partido.jugador1 === jugador1Id) {
        golesJ1 += partido.golesJugador1 || 0;
        golesJ2 += partido.golesJugador2 || 0;
        if ((partido.golesJugador1 || 0) > (partido.golesJugador2 || 0)) victoriasJ1++;
        else if ((partido.golesJugador2 || 0) > (partido.golesJugador1 || 0)) victoriasJ2++;
        else empates++;
      } else {
        golesJ1 += partido.golesJugador2 || 0;
        golesJ2 += partido.golesJugador1 || 0;
        if ((partido.golesJugador2 || 0) > (partido.golesJugador1 || 0)) victoriasJ1++;
        else if ((partido.golesJugador1 || 0) > (partido.golesJugador2 || 0)) victoriasJ2++;
        else empates++;
      }
    });

    const jugador1 = this.jugadores.find(j => j._id === jugador1Id);
    const jugador2 = this.jugadores.find(j => j._id === jugador2Id);

    return {
      jugador1: jugador1?.nombre || 'N/A',
      jugador2: jugador2?.nombre || 'N/A',
      enfrentamientos: enfrentamientos.length,
      victoriasJ1,
      victoriasJ2,
      empates,
      golesJ1,
      golesJ2,
      ultimoEnfrentamiento: enfrentamientos[enfrentamientos.length - 1] || null
    };
  }

  // Métodos auxiliares privados

  private actualizarMejorPeor(jugador: EstadisticaJugador, rival: EstadisticaJugador, 
    marcador: string, tipo: 'victoria' | 'derrota'): void {
    const rivalInfo = { rival: rival.nombre, goles: marcador };
    
    if (tipo === 'victoria') {
      if (!jugador.mejorVictoria || 
          this.compararMarcador(marcador, jugador.mejorVictoria.goles) > 0) {
        jugador.mejorVictoria = rivalInfo;
      }
    } else {
      if (!jugador.peorDerrota || 
          this.compararMarcador(marcador, jugador.peorDerrota.goles, true) < 0) {
        jugador.peorDerrota = rivalInfo;
      }
    }
  }

  private compararMarcador(marcador1: string, marcador2: string, esDerrota: boolean = false): number {
    const [g1a, g1c] = marcador1.split('-').map(Number);
    const [g2a, g2c] = marcador2.split('-').map(Number);
    
    const diferencia1 = esDerrota ? g1c - g1a : g1a - g1c;
    const diferencia2 = esDerrota ? g2c - g2a : g2a - g2c;
    
    return diferencia1 - diferencia2;
  }

  private calcularRacha(jugadorId: string): string {
    const partidosJugador = this.partidos
      .filter(p => p.jugador1 === jugadorId || p.jugador2 === jugadorId)
      .slice(-5); // Últimos 5 partidos

    return partidosJugador.map(partido => {
      const esJugador1 = partido.jugador1 === jugadorId;
      const golesJugador = esJugador1 ? (partido.golesJugador1 || 0) : (partido.golesJugador2 || 0);
      const golesRival = esJugador1 ? (partido.golesJugador2 || 0) : (partido.golesJugador1 || 0);
      
      if (golesJugador > golesRival) return 'V';
      if (golesJugador < golesRival) return 'D';
      return 'E';
    }).join('-');
  }

  private actualizarEstadisticaEquipo(equipos: Map<string, EstadisticaEquipo>, 
    equipo: string, golesPro: number, golesContra: number, jugador: string): void {
    
    const est = equipos.get(equipo) || {
      equipo,
      vecesUsado: 0,
      victorias: 0,
      empates: 0,
      derrotas: 0,
      golesAFavor: 0,
      golesEnContra: 0,
      rendimiento: 0
    };

    est.vecesUsado++;
    est.golesAFavor += golesPro;
    est.golesEnContra += golesContra;

    if (golesPro > golesContra) est.victorias++;
    else if (golesPro < golesContra) est.derrotas++;
    else est.empates++;

    equipos.set(equipo, est);
  }
}

// Función para mostrar reporte completo de estadísticas
export function generarReporteCompleto(partidos: Partido[], jugadores: Jugador[]): any {
  const sistema = new SistemaEstadisticas(partidos, jugadores);
  
  const reporte = {
    jugadores: sistema.calcularEstadisticasJugadores(),
    goleadores: sistema.calcularTopGoleadores(5),
    equipos: sistema.calcularEstadisticasEquipos(),
    generales: sistema.calcularEstadisticasGenerales(),
    fechaGeneracion: new Date().toISOString()
  };

  console.group('📊 Reporte de Estadísticas FIFA');
  console.log('🏆 Top 3 Jugadores:', reporte.jugadores.slice(0, 3));
  console.log('⚽ Top 3 Goleadores:', reporte.goleadores.slice(0, 3));
  console.log('🏅 Mejor Equipo:', reporte.equipos[0]);
  console.log('📈 Estadísticas Generales:', reporte.generales);
  console.groupEnd();

  return reporte;
}
