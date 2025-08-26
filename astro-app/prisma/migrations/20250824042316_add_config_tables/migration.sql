-- CreateTable
CREATE TABLE "jugadores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "equipo" TEXT,
    "goles" INTEGER NOT NULL DEFAULT 0,
    "partidos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "fase" TEXT NOT NULL DEFAULT 'grupos',
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "configuracion" TEXT NOT NULL,
    "resultadosEliminatorias" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "grupos_torneo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "torneoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "jugadores" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "grupos_torneo_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "torneoId" TEXT NOT NULL,
    "jugador1Id" TEXT,
    "jugador2Id" TEXT,
    "jugadorLocal" TEXT NOT NULL,
    "jugadorVisitante" TEXT NOT NULL,
    "equipoLocal" TEXT NOT NULL,
    "equipoVisitante" TEXT NOT NULL,
    "golesLocal" INTEGER,
    "golesVisitante" INTEGER,
    "jugado" BOOLEAN NOT NULL DEFAULT false,
    "ganador" TEXT,
    "fase" TEXT,
    "grupo" TEXT,
    "jornada" INTEGER,
    "rondaId" TEXT,
    "esIdaVuelta" BOOLEAN NOT NULL DEFAULT false,
    "partidoIda" TEXT,
    "fechaPartido" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "partidos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "partidos_jugador1Id_fkey" FOREIGN KEY ("jugador1Id") REFERENCES "jugadores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "partidos_jugador2Id_fkey" FOREIGN KEY ("jugador2Id") REFERENCES "jugadores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "jugadores" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'global',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "configuracion_grupos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL DEFAULT 'Configuración por defecto',
    "configuracion" TEXT NOT NULL,
    "grupos" TEXT NOT NULL,
    "esActiva" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");
