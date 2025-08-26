import type { APIRoute } from 'astro'
import { prisma } from '../../lib/prisma'

export const GET: APIRoute = async ({ url }) => {
  try {
    const jugadores = await prisma.jugador.findMany({
      orderBy: {
        nombre: 'asc'
      }
    })
    
    return new Response(JSON.stringify(jugadores), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error al obtener jugadores:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener jugadores' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔥 POST /api/jugadores - Iniciando...')
    const body = await request.json()
    console.log('📝 Datos recibidos:', body)
    
    if (Array.isArray(body)) {
      // Guardado masivo de jugadores
      console.log('📋 Guardado masivo de', body.length, 'jugadores')
      await prisma.jugador.deleteMany()
      const jugadores = await prisma.jugador.createMany({
        data: body.map(j => ({
          nombre: j.nombre,
          equipo: j.equipo,
          goles: j.goles || 0,
          partidos: j.partidos || 0
        }))
      })
      console.log('✅ Guardado masivo exitoso:', jugadores.count, 'jugadores')
      return new Response(JSON.stringify({ message: 'Jugadores guardados', count: jugadores.count }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      // Crear jugador individual
      console.log('👤 Creando jugador individual:', body.nombre)
      const jugador = await prisma.jugador.create({
        data: {
          nombre: body.nombre,
          equipo: body.equipo || null,
          goles: body.goles || 0,
          partidos: body.partidos || 0
        }
      })
      console.log('✅ Jugador creado exitosamente:', jugador)
      return new Response(JSON.stringify(jugador), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  } catch (error) {
    console.error('Error al guardar jugador:', error)
    return new Response(JSON.stringify({ 
      error: 'Error al guardar jugador', 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const jugador = await prisma.jugador.update({
      where: { id: body.id },
      data: {
        nombre: body.nombre,
        equipo: body.equipo,
        goles: body.goles,
        partidos: body.partidos
      }
    })
    
    return new Response(JSON.stringify(jugador), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error al actualizar jugador:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar jugador' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id')
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    await prisma.jugador.delete({
      where: { id }
    })
    
    return new Response(JSON.stringify({ message: 'Jugador eliminado' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error al eliminar jugador:', error)
    return new Response(JSON.stringify({ error: 'Error al eliminar jugador' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
