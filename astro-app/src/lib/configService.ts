import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConfiguracionGruposData {
  id?: string;
  nombre: string;
  configuracion: any;
  grupos: any;
  esActiva?: boolean;
}

export class ConfigService {
  
  // Métodos para Configuración general
  static async guardarConfiguracion(clave: string, valor: any): Promise<void> {
    try {
      await prisma.configuracion.upsert({
        where: { clave },
        update: { 
          valor: JSON.stringify(valor)
        },
        create: { 
          clave, 
          valor: JSON.stringify(valor)
        }
      });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw error;
    }
  }

  static async obtenerConfiguracion(clave: string): Promise<any | null> {
    try {
      const config = await prisma.configuracion.findUnique({
        where: { clave }
      });

      if (!config) return null;

      try {
        return JSON.parse(config.valor);
      } catch {
        return config.valor;
      }
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return null;
    }
  }

  static async eliminarConfiguracion(clave: string): Promise<void> {
    try {
      await prisma.configuracion.deleteMany({
        where: { clave }
      });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      throw error;
    }
  }

  // Métodos para Configuración de Grupos
  static async guardarConfiguracionGrupos(data: ConfiguracionGruposData): Promise<ConfiguracionGruposData> {
    try {
      // Desactivar otras configuraciones si esta es activa
      if (data.esActiva) {
        await prisma.configuracionGrupos.updateMany({
          data: { esActiva: false }
        });
      }

      const config = await prisma.configuracionGrupos.create({
        data: {
          nombre: data.nombre,
          configuracion: JSON.stringify(data.configuracion),
          grupos: JSON.stringify(data.grupos),
          esActiva: data.esActiva ?? true
        }
      });

      return {
        ...config,
        configuracion: JSON.parse(config.configuracion),
        grupos: JSON.parse(config.grupos)
      };
    } catch (error) {
      console.error('Error al guardar configuración de grupos:', error);
      throw error;
    }
  }

  static async obtenerConfiguracionGruposActiva(): Promise<ConfiguracionGruposData | null> {
    try {
      const config = await prisma.configuracionGrupos.findFirst({
        where: { esActiva: true },
        orderBy: { updatedAt: 'desc' }
      });

      if (!config) return null;

      return {
        ...config,
        configuracion: JSON.parse(config.configuracion),
        grupos: JSON.parse(config.grupos)
      };
    } catch (error) {
      console.error('Error al obtener configuración de grupos activa:', error);
      return null;
    }
  }

  static async actualizarConfiguracionGrupos(id: string, data: Partial<ConfiguracionGruposData>): Promise<ConfiguracionGruposData> {
    try {
      const updateData: any = {};
      
      if (data.nombre) updateData.nombre = data.nombre;
      if (data.configuracion) updateData.configuracion = JSON.stringify(data.configuracion);
      if (data.grupos) updateData.grupos = JSON.stringify(data.grupos);
      if (data.esActiva !== undefined) updateData.esActiva = data.esActiva;

      // Si se está activando, desactivar otras
      if (data.esActiva) {
        await prisma.configuracionGrupos.updateMany({
          where: { id: { not: id } },
          data: { esActiva: false }
        });
      }

      const config = await prisma.configuracionGrupos.update({
        where: { id },
        data: updateData
      });

      return {
        ...config,
        configuracion: JSON.parse(config.configuracion),
        grupos: JSON.parse(config.grupos)
      };
    } catch (error) {
      console.error('Error al actualizar configuración de grupos:', error);
      throw error;
    }
  }

  // Método de migración completa desde localStorage
  static async migrarTodoDesdeLocalStorage(): Promise<void> {
    try {
      console.log('Iniciando migración completa desde localStorage...');

      // 1. Migrar jugadores
      const jugadoresLocal = localStorage.getItem('jugadores');
      if (jugadoresLocal) {
        try {
          const jugadores = JSON.parse(jugadoresLocal);
          await this.guardarConfiguracion('jugadores', jugadores);
          console.log('✅ Jugadores migrados a la base de datos');
        } catch (error) {
          console.error('❌ Error al migrar jugadores:', error);
        }
      }

      // 2. Migrar configuración de grupos
      const gruposConfigLocal = localStorage.getItem('gruposConfig');
      if (gruposConfigLocal) {
        try {
          const gruposData = JSON.parse(gruposConfigLocal);
          const configExistente = await this.obtenerConfiguracionGruposActiva();
          
          if (!configExistente) {
            await this.guardarConfiguracionGrupos({
              nombre: 'Configuración Migrada',
              configuracion: gruposData.configuracion || gruposData,
              grupos: gruposData.grupos || {},
              esActiva: true
            });
            console.log('✅ Configuración de grupos migrada a la base de datos');
          } else {
            console.log('⚠️ Ya existe configuración de grupos activa');
          }
        } catch (error) {
          console.error('❌ Error al migrar configuración de grupos:', error);
        }
      }

      // 3. Migrar configuración general
      const configTorneoLocal = localStorage.getItem('configuracion-torneo');
      if (configTorneoLocal) {
        try {
          const config = JSON.parse(configTorneoLocal);
          await this.guardarConfiguracion('configuracion-torneo', config);
          console.log('✅ Configuración de torneo migrada a la base de datos');
        } catch (error) {
          console.error('❌ Error al migrar configuración de torneo:', error);
        }
      }

      // 4. Migrar último sorteo
      const ultimoSorteoLocal = localStorage.getItem('ultimo-sorteo');
      if (ultimoSorteoLocal) {
        try {
          const sorteo = JSON.parse(ultimoSorteoLocal);
          await this.guardarConfiguracion('ultimo-sorteo', sorteo);
          console.log('✅ Último sorteo migrado a la base de datos');
        } catch (error) {
          console.error('❌ Error al migrar último sorteo:', error);
        }
      }

      console.log('🎉 Migración completa finalizada');
    } catch (error) {
      console.error('💥 Error en la migración completa desde localStorage:', error);
      throw error;
    }
  }

  // Método para limpiar localStorage después de migración exitosa
  static async limpiarLocalStorageMigrado(): Promise<void> {
    try {
      const keysALimpiar = [
        'jugadores',
        'gruposConfig', 
        'configuracion-torneo',
        'ultimo-sorteo'
      ];

      keysALimpiar.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('🧹 localStorage limpiado después de migración exitosa');
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  // Método para verificar y cargar configuraciones desde DB
  static async cargarConfiguracionesDesdeDB() {
    try {
      console.log('Cargando configuraciones desde la base de datos...');
      
      const configuraciones = {
        jugadores: await this.obtenerConfiguracion('jugadores'),
        configuracionTorneo: await this.obtenerConfiguracion('configuracion-torneo'),
        ultimoSorteo: await this.obtenerConfiguracion('ultimo-sorteo'),
        gruposConfig: await this.obtenerConfiguracionGruposActiva()
      };

      return configuraciones;
    } catch (error) {
      console.error('Error al cargar configuraciones desde DB:', error);
      return null;
    }
  }
}

export default ConfigService;
