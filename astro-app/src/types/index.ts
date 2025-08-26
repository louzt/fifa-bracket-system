// Tipos para el sistema de torneo FIFA
export interface Jugador {
  _id: string;
  id?: string; // Para compatibilidad con nueva gestión
  nombre: string;
  equipo?: Equipo | string | null;
  equipoPreferido?: string | null; // Equipo preferido para sorteo
  goles?: number;
  partidos?: number;
  estadisticas?: {
    puntos?: number;
    partidosJugados?: number;
    victorias?: number;
    empates?: number;
    derrotas?: number;
    golesFavor?: number;
    golesContra?: number;
  };
}

export interface Equipo {
  id: string;
  nombre: string;
  bandera?: string;
  tipo?: 'seleccion' | 'club';
}

export interface Partido {
  _id: string;
  jugador1: string;
  jugador2: string;
  resultado1?: number;
  resultado2?: number;
  golesJugador1?: number;
  golesJugador2?: number;
  fecha?: string;
  jornada?: number;
  grupo?: string;
  tipo?: string;
  ronda?: string;
  ganador?: string;
  estado?: 'pendiente' | 'jugado' | 'programado';
}

export interface Grupo {
  _id: string;
  nombre: string;
  jugadores: string[];
  partidos?: string[];
}

export interface ConfiguracionTorneo {
  tipoGrupos: 'automatico' | 'manual';
  partidosGrupo: 'ida' | 'ida-vuelta';
  tipoEliminatorias: 'automatico' | 'manual';
  permitirDuplicados: boolean;
  soloSelecciones: boolean;
}

export interface EquipoAsignado {
  jugador: string;
  jugadorId: string;
  equipo: Equipo | string;
}
