// Middleware para Astro - deshabilitado porque usamos APIs nativas de Astro
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Para todas las solicitudes, continuar normalmente
  // Las APIs de Astro se manejan automáticamente en src/pages/api/
  return next();
});
