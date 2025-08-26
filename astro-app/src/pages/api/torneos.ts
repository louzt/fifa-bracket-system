import type { APIRoute } from 'astro';
import TorneoService, { type TorneoData, type PartidoTorneoData } from '../../lib/torneoService';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const id = url.searchParams.get('id');

  try {
    switch (action) {
      case 'obtenerActivo':
        const torneoActivo = await TorneoService.obtenerTorneoActivo();
        return new Response(JSON.stringify(torneoActivo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'obtener':
        if (!id) {
          return new Response(JSON.stringify({ error: 'ID requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const torneo = await TorneoService.obtenerTorneo(id);
        return new Response(JSON.stringify(torneo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'listar':
        const torneos = await TorneoService.listarTorneos();
        return new Response(JSON.stringify(torneos), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'migrar':
        const torneoMigrado = await TorneoService.migrarDesdeLocalStorage();
        return new Response(JSON.stringify({ success: true, torneoId: torneoMigrado }), {
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
    console.error('Error en API de torneos:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'crear':
        const torneoId = await TorneoService.crearTorneo(data as TorneoData);
        return new Response(JSON.stringify({ success: true, torneoId }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'actualizar':
        const { id, ...updateData } = data;
        await TorneoService.actualizarTorneo(id, updateData);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'crearGrupos':
        const { torneoId: tId, grupos } = data;
        await TorneoService.crearGruposTorneo(tId, grupos);
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'crearPartidos':
        const { partidos } = data;
        await TorneoService.crearPartidosTorneo(partidos);
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'actualizarPartido':
        const { partidoId, ...partidoData } = data;
        await TorneoService.actualizarPartido(partidoId, partidoData);
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
    console.error('Error en POST de torneos:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
