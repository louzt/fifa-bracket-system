// Cliente para manejar configuraciones con la base de datos
export class ConfiguracionAPI {
  static async obtenerConfiguracion(clave: string) {
    try {
      const response = await fetch(`/api/configuraciones?action=obtener&clave=${clave}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return null;
    }
  }

  static async guardarConfiguracion(clave: string, valor: any) {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guardar', clave, valor })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error guardando configuración:', error);
      return false;
    }
  }

  static async eliminarConfiguracion(clave: string) {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', clave })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error eliminando configuración:', error);
      return false;
    }
  }

  static async cargarTodasLasConfiguraciones() {
    try {
      const response = await fetch('/api/configuraciones?action=cargar-todas');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error cargando todas las configuraciones:', error);
      return null;
    }
  }

  // Específicos para configuración de grupos
  static async guardarConfiguracionGrupos(data: any) {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guardar-grupos', data })
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error guardando configuración de grupos:', error);
      return null;
    }
  }

  static async obtenerConfiguracionGruposActiva() {
    try {
      const response = await fetch('/api/configuraciones?action=obtener-grupos-activa');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error obteniendo configuración de grupos activa:', error);
      return null;
    }
  }

  static async actualizarConfiguracionGrupos(data: any) {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'actualizar-grupos', data })
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error actualizando configuración de grupos:', error);
      return null;
    }
  }

  // Migración
  static async migrarDesdeLocalStorage() {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrar' })
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ Migración completada exitosamente');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en migración:', error);
      return false;
    }
  }

  static async limpiarLocalStorage() {
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'limpiar-localStorage' })
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ localStorage limpiado exitosamente');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }
}

// Funciones helper para reemplazar localStorage
export async function obtenerJugadoresDB() {
  return await ConfiguracionAPI.obtenerConfiguracion('jugadores') || [];
}

export async function guardarJugadoresDB(jugadores: any[]) {
  return await ConfiguracionAPI.guardarConfiguracion('jugadores', jugadores);
}

export async function obtenerConfiguracionTorneoDB() {
  return await ConfiguracionAPI.obtenerConfiguracion('configuracion-torneo') || {};
}

export async function guardarConfiguracionTorneoDB(config: any) {
  return await ConfiguracionAPI.guardarConfiguracion('configuracion-torneo', config);
}

export async function obtenerUltimoSorteoDB() {
  return await ConfiguracionAPI.obtenerConfiguracion('ultimo-sorteo') || null;
}

export async function guardarUltimoSorteoDB(sorteo: any) {
  return await ConfiguracionAPI.guardarConfiguracion('ultimo-sorteo', sorteo);
}

// Función para migrar todo automáticamente
export async function migrarTodoABaseDatos() {
  console.log('🔄 Iniciando migración automática...');
  
  try {
    // Migrar torneo activo usando TorneoService
    const torneoActivo = localStorage.getItem('torneoActivo');
    if (torneoActivo) {
      const response = await fetch('/api/torneos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrar' })
      });
      if (response.ok) {
        console.log('✅ Torneo activo migrado');
      }
    }

    // Migrar configuraciones usando ConfigService
    const exito = await ConfiguracionAPI.migrarDesdeLocalStorage();
    
    if (exito) {
      // Limpiar localStorage solo si la migración fue exitosa
      await ConfiguracionAPI.limpiarLocalStorage();
      localStorage.removeItem('torneoActivo'); // Limpiar también el torneo
      
      console.log('🎉 Migración completa exitosa!');
      return true;
    } else {
      console.log('⚠️ Migración parcial o con errores');
      return false;
    }
  } catch (error) {
    console.error('💥 Error en migración automática:', error);
    return false;
  }
}
