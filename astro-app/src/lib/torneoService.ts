import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TorneoData {
  id?: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin?: Date;
  fase: 'grupos' | 'eliminatorias' | 'finalizado';
  estado: 'activo' | 'finalizado' | 'pausado';
  configuracion: any;
  resultadosEliminatorias?: any;
}

export interface GrupoTorneoData {
  id?: string;
  torneoId: string;
  nombre: string;
  jugadores: any[];
}

export interface PartidoTorneoData {
  id?: string;
  torneoId: string;
  jugadorLocal: string;
  jugadorVisitante: string;
  equipoLocal: string;
  equipoVisitante: string;
  golesLocal?: number;
  golesVisitante?: number;
  jugado: boolean;
  ganador?: string;
  fase?: string;
  grupo?: string;
  jornada?: number;
  rondaId?: string;
  esIdaVuelta: boolean;
  partidoIda?: string;
  fechaPartido?: Date;
}

export class TorneoService {
  // Crear nuevo torneo
  static async crearTorneo(data: TorneoData): Promise<string> {
    try {
      const torneo = await prisma.torneo.create({
        data: {
          nombre: data.nombre,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          fase: data.fase,
          estado: data.estado,
          configuracion: JSON.stringify(data.configuracion),
          resultadosEliminatorias: data.resultadosEliminatorias ? JSON.stringify(data.resultadosEliminatorias) : null
        }
      });
      return torneo.id;
    } catch (error) {
      console.error('Error creando torneo:', error);
      throw error;
    }
  }

  // Obtener torneo por ID
  static async obtenerTorneo(id: string) {
    try {
      const torneo = await prisma.torneo.findUnique({
        where: { id },
        include: {
          grupos: true,
          partidos: {
            orderBy: [
              { grupo: 'asc' },
              { jornada: 'asc' }
            ]
          }
        }
      });

      if (!torneo) return null;

      return {
        ...torneo,
        configuracion: JSON.parse(torneo.configuracion),
        resultadosEliminatorias: torneo.resultadosEliminatorias ? JSON.parse(torneo.resultadosEliminatorias) : {}
      };
    } catch (error) {
      console.error('Error obteniendo torneo:', error);
      throw error;
    }
  }

  // Obtener torneo activo (el más reciente)
  static async obtenerTorneoActivo() {
    try {
      const torneo = await prisma.torneo.findFirst({
        where: { estado: 'activo' },
        orderBy: { createdAt: 'desc' },
        include: {
          grupos: true,
          partidos: {
            orderBy: [
              { grupo: 'asc' },
              { jornada: 'asc' }
            ]
          }
        }
      });

      if (!torneo) return null;

      return {
        ...torneo,
        configuracion: JSON.parse(torneo.configuracion),
        resultadosEliminatorias: torneo.resultadosEliminatorias ? JSON.parse(torneo.resultadosEliminatorias) : {}
      };
    } catch (error) {
      console.error('Error obteniendo torneo activo:', error);
      throw error;
    }
  }

  // Listar todos los torneos
  static async listarTorneos() {
    try {
      const torneos = await prisma.torneo.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              partidos: {
                where: { jugado: true }
              }
            }
          }
        }
      });

      return torneos.map(torneo => ({
        ...torneo,
        configuracion: JSON.parse(torneo.configuracion),
        partidosJugados: torneo._count.partidos
      }));
    } catch (error) {
      console.error('Error listando torneos:', error);
      throw error;
    }
  }

  // Actualizar torneo
  static async actualizarTorneo(id: string, data: Partial<TorneoData>) {
    try {
      const updateData: any = { ...data };
      
      if (data.configuracion) {
        updateData.configuracion = JSON.stringify(data.configuracion);
      }
      
      if (data.resultadosEliminatorias) {
        updateData.resultadosEliminatorias = JSON.stringify(data.resultadosEliminatorias);
      }

      return await prisma.torneo.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error actualizando torneo:', error);
      throw error;
    }
  }

  // Crear grupos del torneo
  static async crearGruposTorneo(torneoId: string, grupos: GrupoTorneoData[]) {
    try {
      const gruposCreados = await Promise.all(
        grupos.map(grupo => 
          prisma.grupoTorneo.create({
            data: {
              torneoId,
              nombre: grupo.nombre,
              jugadores: JSON.stringify(grupo.jugadores)
            }
          })
        )
      );
      return gruposCreados;
    } catch (error) {
      console.error('Error creando grupos del torneo:', error);
      throw error;
    }
  }

  // Crear partidos del torneo
  static async crearPartidosTorneo(partidos: PartidoTorneoData[]) {
    try {
      const partidosCreados = await Promise.all(
        partidos.map(partido => 
          prisma.partido.create({
            data: {
              torneoId: partido.torneoId,
              jugadorLocal: partido.jugadorLocal,
              jugadorVisitante: partido.jugadorVisitante,
              equipoLocal: partido.equipoLocal,
              equipoVisitante: partido.equipoVisitante,
              golesLocal: partido.golesLocal,
              golesVisitante: partido.golesVisitante,
              jugado: partido.jugado,
              ganador: partido.ganador,
              fase: partido.fase,
              grupo: partido.grupo,
              jornada: partido.jornada,
              rondaId: partido.rondaId,
              esIdaVuelta: partido.esIdaVuelta,
              partidoIda: partido.partidoIda,
              fechaPartido: partido.fechaPartido
            }
          })
        )
      );
      return partidosCreados;
    } catch (error) {
      console.error('Error creando partidos del torneo:', error);
      throw error;
    }
  }

  // Actualizar resultado de partido
  static async actualizarPartido(id: string, data: Partial<PartidoTorneoData>) {
    try {
      return await prisma.partido.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error('Error actualizando partido:', error);
      throw error;
    }
  }

  // Obtener partidos de un torneo
  static async obtenerPartidosTorneo(torneoId: string) {
    try {
      return await prisma.partido.findMany({
        where: { torneoId },
        orderBy: [
          { grupo: 'asc' },
          { jornada: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Error obteniendo partidos del torneo:', error);
      throw error;
    }
  }

  // Migrar datos del localStorage a la base de datos
  static async migrarDesdeLocalStorage() {
    try {
      // Obtener datos del localStorage
      const torneoGuardado = localStorage.getItem('torneoActivo');
      const configGrupos = localStorage.getItem('gruposConfig');
      
      if (!torneoGuardado || !configGrupos) {
        console.log('No hay datos en localStorage para migrar');
        return null;
      }

      const datosToneo = JSON.parse(torneoGuardado);
      const datosConfig = JSON.parse(configGrupos);

      // Crear torneo en la base de datos
      const torneoId = await this.crearTorneo({
        nombre: datosToneo.nombre || 'Torneo Migrado',
        fechaInicio: new Date(datosToneo.fechaInicio || Date.now()),
        fase: datosToneo.fase || 'grupos',
        estado: 'activo',
        configuracion: datosConfig.configuracion || {},
        resultadosEliminatorias: datosToneo.resultadosEliminatorias || {}
      });

      // Crear grupos
      if (datosToneo.grupos) {
        await this.crearGruposTorneo(torneoId, datosToneo.grupos.map((grupo: any) => ({
          torneoId,
          nombre: grupo.nombre,
          jugadores: grupo.jugadores || []
        })));
      }

      // Crear partidos
      if (datosToneo.partidos) {
        await this.crearPartidosTorneo(datosToneo.partidos.map((partido: any) => ({
          ...partido,
          torneoId,
          esIdaVuelta: false // Por defecto
        })));
      }

      console.log('Datos migrados exitosamente a la base de datos');
      return torneoId;
    } catch (error) {
      console.error('Error migrando datos:', error);
      throw error;
    }
  }
}

export default TorneoService;
