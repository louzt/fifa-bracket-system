/**
 * Utilidades del lado del cliente para la aplicación Astro
 */

// Función para mezclar un array aleatoriamente (algoritmo Fisher-Yates)
export function mezclarArray(array) {
  const nuevoArray = [...array];
  for (let i = nuevoArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
  }
  return nuevoArray;
}

// Función para ordenar jugadores por puntos, diferencia de goles, goles a favor
export function ordenarJugadoresPorPuntos(jugadores) {
  return [...jugadores].sort((a, b) => {
    // Ordenar por puntos
    if (b.estadisticas?.puntos !== a.estadisticas?.puntos) {
      return (b.estadisticas?.puntos || 0) - (a.estadisticas?.puntos || 0);
    }
    
    // Si tienen los mismos puntos, ordenar por diferencia de goles
    const difGolA = ((a.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesContra || 0));
    const difGolB = ((b.estadisticas?.golesFavor || 0) - (b.estadisticas?.golesContra || 0));
    if (difGolB !== difGolA) {
      return difGolB - difGolA;
    }
    
    // Si tienen la misma diferencia de goles, ordenar por goles a favor
    return (b.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesFavor || 0);
  });
}

// Función para formatear fechas
export function formatearFecha(fecha) {
  if (!fecha) return '';
  
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('es-ES', opciones).format(new Date(fecha));
}

// Función para capitalizar texto
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para obtener el color de la posición en la tabla
export function obtenerColorPosicion(posicion, totalJugadores) {
  // Los primeros 2 lugares se clasifican siempre
  if (posicion <= 2) {
    return 'text-green-400'; // Verde para clasificados
  }
  
  // El último lugar
  if (posicion === totalJugadores) {
    return 'text-red-400'; // Rojo para último lugar
  }
  
  // Posiciones intermedias
  return 'text-gray-300'; // Gris normal
}

// Función para calcular la diferencia de goles
export function calcularDiferenciaGoles(jugador) {
  const golesFavor = jugador.estadisticas?.golesFavor || 0;
  const golesContra = jugador.estadisticas?.golesContra || 0;
  const diferencia = golesFavor - golesContra;
  
  if (diferencia > 0) return `+${diferencia}`;
  return diferencia.toString();
}

// Función para validar un resultado de partido
export function validarResultadoPartido(goles1, goles2) {
  const errores = [];
  
  if (goles1 === null || goles1 === undefined || goles1 === '') {
    errores.push('Los goles del primer jugador son requeridos');
  } else if (goles1 < 0) {
    errores.push('Los goles no pueden ser negativos');
  } else if (!Number.isInteger(Number(goles1))) {
    errores.push('Los goles deben ser números enteros');
  }
  
  if (goles2 === null || goles2 === undefined || goles2 === '') {
    errores.push('Los goles del segundo jugador son requeridos');
  } else if (goles2 < 0) {
    errores.push('Los goles no pueden ser negativos');
  } else if (!Number.isInteger(Number(goles2))) {
    errores.push('Los goles deben ser números enteros');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

// Función para obtener el resultado de un partido (V, E, D)
export function obtenerResultadoPartido(golesLocal, golesVisitante, esLocal) {
  if (golesLocal > golesVisitante) {
    return esLocal ? 'V' : 'D'; // Victoria o Derrota según perspectiva
  } else if (golesLocal < golesVisitante) {
    return esLocal ? 'D' : 'V'; // Derrota o Victoria según perspectiva
  } else {
    return 'E'; // Empate
  }
}

// Función para generar un ID único
export function generarId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Función para debounce (evitar ejecuciones múltiples rápidas)
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para throttle (limitar ejecuciones por tiempo)
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Función para scrollear suavemente a un elemento
export function scrollToElement(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
}

// Función para copiar texto al portapapeles
export async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea');
    textArea.value = texto;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Función para detectar si estamos en móvil
export function esMobile() {
  return window.innerWidth <= 768;
}

// Función para obtener parámetros de la URL
export function obtenerParametroUrl(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

// Función para establecer un parámetro en la URL sin recargar la página
export function establecerParametroUrl(nombre, valor) {
  const url = new URL(window.location);
  if (valor) {
    url.searchParams.set(nombre, valor);
  } else {
    url.searchParams.delete(nombre);
  }
  window.history.pushState({}, '', url);
}

// Función para formatear números con separadores de miles
export function formatearNumero(numero) {
  return new Intl.NumberFormat('es-ES').format(numero);
}

// Función para obtener el emoji de la bandera de un país
export function obtenerEmojiPais(codigoPais) {
  const codigosPais = {
    'ARG': '🇦🇷', 'BRA': '🇧🇷', 'ESP': '🇪🇸', 'FRA': '🇫🇷',
    'GER': '🇩🇪', 'ITA': '🇮🇹', 'POR': '🇵🇹', 'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'NED': '🇳🇱', 'BEL': '🇧🇪'
  };
  
  return codigosPais[codigoPais] || '🏳️';
}
