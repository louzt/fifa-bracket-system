// Script de prueba para verificar que Prisma funciona
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Probando conexión a base de datos...')
    
    // Crear un jugador de prueba
    const testPlayer = await prisma.jugador.create({
      data: {
        nombre: 'Test Player ' + Date.now(),
        equipo: null,
        goles: 0,
        partidos: 0
      }
    })
    console.log('✅ Jugador creado:', testPlayer)
    
    // Obtener todos los jugadores
    const allPlayers = await prisma.jugador.findMany()
    console.log('📋 Total de jugadores en DB:', allPlayers.length)
    console.log('📋 Jugadores:', allPlayers)
    
    // Eliminar el jugador de prueba
    await prisma.jugador.delete({
      where: { id: testPlayer.id }
    })
    console.log('🗑️ Jugador de prueba eliminado')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
