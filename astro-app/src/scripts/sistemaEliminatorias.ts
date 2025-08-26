// Sistema de eliminatorias avanzado para el torneo FIFA
import type { Jugador, Partido, ConfiguracionTorneo } from '../types/index';

interface PartidoEliminatoria {
  id: string;
  jugador1: string | null;
  jugador2: string | null;
  jugador1Nombre?: string;
  jugador2Nombre?: string;
  ganador?: string;
  golesJugador1?: number;
  golesJugador2?: number;
  fase: string;
  ronda: number;
  posicion: number;
  fecha: string;
  estado: 'pendiente' | 'jugado' | 'programado';
  esIdaVuelta: boolean;
  partidoVuelta?: string; // ID del partido de vuelta si aplica
}

interface FaseEliminatoria {
  nombre: string;
  partidos: PartidoEliminatoria[];
  completada: boolean;
  siguienteFase?: string;
}

export class SistemaEliminatorias {
  private clasificados: Jugador[] = [];
  private configuracion: ConfiguracionTorneo;
  private fases: Map<string, FaseEliminatoria> = new Map();

  constructor(clasificados: Jugador[], configuracion: ConfiguracionTorneo) {
    this.clasificados = clasificados;
    this.configuracion = configuracion;
    this.inicializarEstructura();
  }

  /**
   * Inicializa la estructura de eliminatorias según el número de clasificados
   */
  private inicializarEstructura(): void {
    const totalClasificados = this.clasificados.length;
    const esIdaVuelta = this.configuracion.partidosGrupo === 'ida-vuelta';

    // Ajustar a la potencia de 2 más cercana
    const siguientePotencia = this.obtenerSiguientePotenciaDe2(totalClasificados);
    
    if (siguientePotencia !== totalClasificados) {
      console.warn(`⚠️ Ajustando ${totalClasificados} clasificados a ${siguientePotencia} para estructura de eliminatorias`);
    }

    this.crearFases(siguientePotencia, esIdaVuelta);
  }

  /**
   * Obtiene la siguiente potencia de 2
   */
  private obtenerSiguientePotenciaDe2(numero: number): number {
    const potencias = [2, 4, 8, 16, 32];
    return potencias.find(p => p >= numero) || 32;
  }

  /**
   * Crea todas las fases de eliminatorias
   */
  private crearFases(totalClasificados: number, esIdaVuelta: boolean): void {
    const nombresFases = this.obtenerNombresFases(totalClasificados);
    
    nombresFases.forEach((nombre, indice) => {
      const equiposEnFase = totalClasificados / Math.pow(2, indice);
      const partidosEnFase = equiposEnFase / 2;
      
      const fase: FaseEliminatoria = {
        nombre,
        partidos: this.crearPartidosFase(nombre, partidosEnFase, indice, esIdaVuelta),
        completada: false,
        siguienteFase: nombresFases[indice + 1] || undefined
      };
      
      this.fases.set(nombre, fase);
    });

    // Crear partido por el tercer puesto si hay semifinales
    if (this.fases.has('Semifinales')) {
      this.crearPartidoTercerPuesto(esIdaVuelta);
    }
  }

  /**
   * Obtiene los nombres de las fases según el número de equipos
   */
  private obtenerNombresFases(totalEquipos: number): string[] {
    const todas = ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'];
    
    switch (totalEquipos) {
      case 2: return ['Final'];
      case 4: return ['Semifinales', 'Final'];
      case 8: return ['Cuartos de Final', 'Semifinales', 'Final'];
      case 16: return ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'];
      default: return todas;
    }
  }

  /**
   * Crea los partidos para una fase específica
   */
  private crearPartidosFase(nombreFase: string, numeroPartidos: number, indice: number, esIdaVuelta: boolean): PartidoEliminatoria[] {
    const partidos: PartidoEliminatoria[] = [];
    
    for (let i = 0; i < numeroPartidos; i++) {
      const partidoId = `${nombreFase.toLowerCase().replace(/\s/g, '_')}_${i + 1}`;
      
      const partido: PartidoEliminatoria = {
        id: partidoId,
        jugador1: null,
        jugador2: null,
        fase: nombreFase,
        ronda: indice + 1,
        posicion: i + 1,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        esIdaVuelta
      };

      partidos.push(partido);

      // Crear partido de vuelta si es ida y vuelta y no es la final
      if (esIdaVuelta && nombreFase !== 'Final') {
        const partidoVuelta: PartidoEliminatoria = {
          id: `${partidoId}_vuelta`,
          jugador1: null,
          jugador2: null,
          fase: `${nombreFase} (Vuelta)`,
          ronda: indice + 1,
          posicion: i + 1,
          fecha: new Date().toISOString(),
          estado: 'pendiente',
          esIdaVuelta: true
        };
        
        partido.partidoVuelta = partidoVuelta.id;
        partidos.push(partidoVuelta);
      }
    }
    
    return partidos;
  }

  /**
   * Crea el partido por el tercer puesto
   */
  private crearPartidoTercerPuesto(esIdaVuelta: boolean): void {
    const tercerPuesto: FaseEliminatoria = {
      nombre: 'Tercer Puesto',
      partidos: [{
        id: 'tercer_puesto',
        jugador1: null,
        jugador2: null,
        fase: 'Tercer Puesto',
        ronda: 999, // Número alto para que sea después de semifinales
        posicion: 1,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        esIdaVuelta: false // El tercer puesto nunca es ida y vuelta
      }],
      completada: false
    };
    
    this.fases.set('Tercer Puesto', tercerPuesto);
  }

  /**
   * Asigna los clasificados a la primera fase
   */
  asignarClasificados(): void {
    const primeraFase = Array.from(this.fases.values())[0];
    if (!primeraFase) return;

    const clasificadosBarajados = this.barajarArray([...this.clasificados]);
    
    primeraFase.partidos.forEach((partido, indice) => {
      if (partido.fase === primeraFase.nombre) { // Solo partidos de ida
        const jugador1 = clasificadosBarajados[indice * 2];
        const jugador2 = clasificadosBarajados[indice * 2 + 1];
        
        if (jugador1 && jugador2) {
          partido.jugador1 = jugador1._id;
          partido.jugador2 = jugador2._id;
          partido.jugador1Nombre = jugador1.nombre;
          partido.jugador2Nombre = jugador2.nombre;
          partido.estado = 'programado';
          
          // Asignar también al partido de vuelta si existe
          if (partido.partidoVuelta) {
            const partidoVuelta = primeraFase.partidos.find(p => p.id === partido.partidoVuelta);
            if (partidoVuelta) {
              partidoVuelta.jugador1 = jugador2._id;
              partidoVuelta.jugador2 = jugador1._id;
              partidoVuelta.jugador1Nombre = jugador2.nombre;
              partidoVuelta.jugador2Nombre = jugador1.nombre;
              partidoVuelta.estado = 'programado';
            }
          }
        }
      }
    });
  }

  /**
   * Avanza ganadores a la siguiente fase
   */
  avanzarGanadores(fase: string): void {
    const faseActual = this.fases.get(fase);
    if (!faseActual || !faseActual.siguienteFase) return;

    const siguienteFase = this.fases.get(faseActual.siguienteFase);
    if (!siguienteFase) return;

    const ganadores: string[] = [];
    const perdedores: string[] = [];
    
    // Obtener ganadores de la fase actual
    faseActual.partidos.forEach(partido => {
      if (partido.ganador && partido.fase === fase) { // Solo partidos de ida o únicos
        ganadores.push(partido.ganador);
        
        // Obtener perdedor para semifinales -> tercer puesto
        const perdedor = partido.ganador === partido.jugador1 ? partido.jugador2 : partido.jugador1;
        if (perdedor && fase === 'Semifinales') {
          perdedores.push(perdedor);
        }
      }
    });

    // Asignar ganadores a la siguiente fase
    siguienteFase.partidos.forEach((partido, indice) => {
      if (partido.fase === siguienteFase.nombre) { // Solo partidos principales
        const jugador1 = ganadores[indice * 2];
        const jugador2 = ganadores[indice * 2 + 1];
        
        if (jugador1 && jugador2) {
          partido.jugador1 = jugador1;
          partido.jugador2 = jugador2;
          partido.estado = 'programado';
          
          // Buscar nombres de los jugadores
          const j1 = this.clasificados.find(j => j._id === jugador1);
          const j2 = this.clasificados.find(j => j._id === jugador2);
          
          if (j1) partido.jugador1Nombre = j1.nombre;
          if (j2) partido.jugador2Nombre = j2.nombre;
        }
      }
    });

    // Asignar perdedores de semifinales al tercer puesto
    if (fase === 'Semifinales' && perdedores.length === 2) {
      const tercerPuesto = this.fases.get('Tercer Puesto');
      if (tercerPuesto && tercerPuesto.partidos[0]) {
        const partido = tercerPuesto.partidos[0];
        partido.jugador1 = perdedores[0];
        partido.jugador2 = perdedores[1];
        partido.estado = 'programado';
        
        // Buscar nombres
        const j1 = this.clasificados.find(j => j._id === perdedores[0]);
        const j2 = this.clasificados.find(j => j._id === perdedores[1]);
        
        if (j1) partido.jugador1Nombre = j1.nombre;
        if (j2) partido.jugador2Nombre = j2.nombre;
      }
    }

    faseActual.completada = true;
  }

  /**
   * Obtiene el estado actual de las eliminatorias
   */
  obtenerEstado(): any {
    const estado = {
      fases: Array.from(this.fases.entries()).map(([nombre, fase]) => ({
        nombre,
        partidos: fase.partidos.length,
        completada: fase.completada,
        partidosJugados: fase.partidos.filter(p => p.estado === 'jugado').length,
        partidosPendientes: fase.partidos.filter(p => p.estado === 'programado').length
      })),
      totalPartidos: Array.from(this.fases.values()).reduce((total, fase) => 
        total + fase.partidos.length, 0),
      partidosCompletados: Array.from(this.fases.values()).reduce((total, fase) => 
        total + fase.partidos.filter(p => p.estado === 'jugado').length, 0)
    };

    return estado;
  }

  /**
   * Obtiene todos los partidos de una fase
   */
  obtenerPartidosFase(nombreFase: string): PartidoEliminatoria[] {
    const fase = this.fases.get(nombreFase);
    return fase ? fase.partidos : [];
  }

  /**
   * Obtiene todas las fases
   */
  obtenerTodasLasFases(): Map<string, FaseEliminatoria> {
    return this.fases;
  }

  /**
   * Registra el resultado de un partido
   */
  registrarResultado(partidoId: string, golesJugador1: number, golesJugador2: number): boolean {
    for (const fase of this.fases.values()) {
      const partido = fase.partidos.find(p => p.id === partidoId);
      if (partido) {
        partido.golesJugador1 = golesJugador1;
        partido.golesJugador2 = golesJugador2;
        partido.ganador = golesJugador1 > golesJugador2 ? partido.jugador1! : partido.jugador2!;
        partido.estado = 'jugado';
        
        // Si es un partido ida y vuelta, verificar si también se jugó la vuelta
        if (partido.partidoVuelta) {
          const partidoVuelta = fase.partidos.find(p => p.id === partido.partidoVuelta);
          if (partidoVuelta && partidoVuelta.estado === 'jugado') {
            this.calcularGanadorIdaVuelta(partido, partidoVuelta);
          }
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * Calcula el ganador en partidos de ida y vuelta
   */
  private calcularGanadorIdaVuelta(partidoIda: PartidoEliminatoria, partidoVuelta: PartidoEliminatoria): void {
    const golesLocalIda = partidoIda.golesJugador1!;
    const golesVisitanteIda = partidoIda.golesJugador2!;
    const golesLocalVuelta = partidoVuelta.golesJugador2!; // Intercambiados en vuelta
    const golesVisitanteVuelta = partidoVuelta.golesJugador1!;
    
    const totalLocal = golesLocalIda + golesLocalVuelta;
    const totalVisitante = golesVisitanteIda + golesVisitanteVuelta;
    
    if (totalLocal !== totalVisitante) {
      // Hay ganador por marcador global
      partidoIda.ganador = totalLocal > totalVisitante ? partidoIda.jugador1! : partidoIda.jugador2!;
    } else {
      // Empate - aplicar regla de gol de visitante o penales (simplificado a goles de visitante)
      const golesVisitanteLocal = golesVisitanteIda;
      const golesVisitanteVisitante = golesLocalVuelta;
      
      partidoIda.ganador = golesVisitanteVisitante > golesVisitanteLocal ? 
        partidoIda.jugador2! : partidoIda.jugador1!;
    }
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
}

// Función para simular desarrollo automático de eliminatorias
export function simularEliminatorias(clasificados: Jugador[], configuracion: ConfiguracionTorneo): SistemaEliminatorias {
  const sistema = new SistemaEliminatorias(clasificados, configuracion);
  sistema.asignarClasificados();
  
  console.group('⚔️ Sistema de Eliminatorias');
  console.log('📊 Estado inicial:', sistema.obtenerEstado());
  console.log('🏆 Fases creadas:', Array.from(sistema.obtenerTodasLasFases().keys()));
  console.groupEnd();
  
  return sistema;
}
