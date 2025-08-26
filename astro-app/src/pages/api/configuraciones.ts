import type { APIRoute } from 'astro';
import ConfigService from '../../lib/configService';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const clave = url.searchParams.get('clave');

    switch (action) {
      case 'obtener':
        if (!clave) {
          return new Response(JSON.stringify({ error: 'Clave requerida' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const config = await ConfigService.obtenerConfiguracion(clave);
        return new Response(JSON.stringify({ data: config }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'cargar-todas':
        const configuraciones = await ConfigService.cargarConfiguracionesDesdeDB();
        return new Response(JSON.stringify({ data: configuraciones }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'obtener-grupos-activa':
        const gruposConfig = await ConfigService.obtenerConfiguracionGruposActiva();
        return new Response(JSON.stringify({ data: gruposConfig }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Acción no válida' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error en GET /api/configuraciones:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, clave, valor, data } = body;

    switch (action) {
      case 'guardar':
        if (!clave || valor === undefined) {
          return new Response(JSON.stringify({ error: 'Clave y valor requeridos' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        await ConfigService.guardarConfiguracion(clave, valor);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'guardar-grupos':
        if (!data) {
          return new Response(JSON.stringify({ error: 'Datos requeridos' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const gruposGuardados = await ConfigService.guardarConfiguracionGrupos(data);
        return new Response(JSON.stringify({ data: gruposGuardados }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'actualizar-grupos':
        if (!data || !data.id) {
          return new Response(JSON.stringify({ error: 'ID y datos requeridos' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const gruposActualizados = await ConfigService.actualizarConfiguracionGrupos(data.id, data);
        return new Response(JSON.stringify({ data: gruposActualizados }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'migrar':
        await ConfigService.migrarTodoDesdeLocalStorage();
        return new Response(JSON.stringify({ success: true, message: 'Migración completada' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'limpiar-localStorage':
        await ConfigService.limpiarLocalStorageMigrado();
        return new Response(JSON.stringify({ success: true, message: 'localStorage limpiado' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'eliminar':
        if (!clave) {
          return new Response(JSON.stringify({ error: 'Clave requerida' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        await ConfigService.eliminarConfiguracion(clave);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Acción no válida' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error en POST /api/configuraciones:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
