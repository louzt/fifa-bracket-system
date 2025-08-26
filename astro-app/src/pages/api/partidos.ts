import type { APIRoute } from 'astro'
import { prisma } from '../../lib/prisma'

export const GET: APIRoute = async ({ url }) => {
  try {
    const partidos = await prisma.partido.findMany({
      include: {
        jugador1: true,
        jugador2: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return new Response(JSON.stringify(partidos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener partidos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    
    if (Array.isArray(body)) {
      // Guardado masivo de partidos
      const partidos = await prisma.partido.createMany({
        data: body.map(p => ({
          jugador1Id: p.jugador1,
          jugador2Id: p.jugador2,
          golesJugador1: p.golesJugador1,
          golesJugador2: p.golesJugador2,
          ganador: p.ganador,
          estado: p.estado || 'pendiente',
          fase: p.fase,
          grupo: p.grupo
        }))
      })
      return new Response(JSON.stringify({ message: 'Partidos guardados', count: partidos.count }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      // Crear partido individual
      const partido = await prisma.partido.create({
        data: {
          jugador1Id: body.jugador1,
          jugador2Id: body.jugador2,
          golesJugador1: body.golesJugador1,
          golesJugador2: body.golesJugador2,
          ganador: body.ganador,
          estado: body.estado || 'pendiente',
          fase: body.fase,
          grupo: body.grupo
        },
        include: {
          jugador1: true,
          jugador2: true
        }
      })
      return new Response(JSON.stringify(partido), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  } catch (error) {
    console.error('Error al guardar partido:', error)
    return new Response(JSON.stringify({ error: 'Error al guardar partido' }), {
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
    const partido = await prisma.partido.update({
      where: { id: body.id },
      data: {
        golesJugador1: body.golesJugador1,
        golesJugador2: body.golesJugador2,
        ganador: body.ganador,
        estado: body.estado
      },
      include: {
        jugador1: true,
        jugador2: true
      }
    })
    
    return new Response(JSON.stringify(partido), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error al actualizar partido:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar partido' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
