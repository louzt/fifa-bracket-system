// Script para descargar imágenes de equipos
const fs = require('fs');
const path = require('path');
const https = require('https');
const equipos = require('./data/equipos');

// Colores para los equipos
const TEAM_COLORS = {
    'Real Madrid': ['#FFFFFF', '#00529F'],
    'Manchester City': ['#6CABDD', '#1C2C5B'],
    'Paris Saint-Germain': ['#004170', '#DA291C'],
    'Liverpool': ['#C8102E', '#00B2A9'],
    'FC Barcelona': ['#A50044', '#004D98'],
    'Bayern Munich': ['#DC052D', '#0066B2'],
    'Chelsea': ['#034694', '#DBA111'],
    'Inter de Milán': ['#0057B8', '#000000'],
    'Arsenal': ['#EF0107', '#063672'],
    'Atlético de Madrid': ['#D71920', '#262e62'],
    'Juventus': ['#000000', '#FFFFFF'],
    'AC Milan': ['#FB090B', '#000000'],
    'Borussia Dortmund': ['#FDE100', '#000000'],
    'Napoli': ['#12A0D7', '#003C80'],
    // Selecciones nacionales
    'Brasil': ['#FFDF00', '#009C3B'],
    'Francia': ['#002654', '#ED2939'],
    'Inglaterra': ['#CF081F', '#FFFFFF'],
    'Argentina': ['#75AADB', '#FFFFFF'],
    'Portugal': ['#006600', '#FF0000'],
    'Bélgica': ['#000000', '#FDDA24'],
    'Holanda': ['#FF9B00', '#CC0000'],
    'España': ['#FF0000', '#FFFF00'],
    'Alemania': ['#000000', '#DD0000'],
    'Italia': ['#0066CC', '#FFFFFF'],
};

// Directorio de destino
const IMG_DIR = path.join(__dirname, 'public', 'img', 'equipos');

// Asegurarse de que el directorio existe
if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
}

// Función para descargar una imagen
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Error al descargar la imagen. Código de estado: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Imagen descargada: ${filepath}`);
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => {}); // Eliminar archivo en caso de error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Función para obtener la URL del logo de un equipo - ahora usamos placeholder
async function getTeamLogoUrl(teamName) {
    // Obtenemos los colores del equipo o usamos colores predeterminados
    const colors = TEAM_COLORS[teamName] || ['#1E88E5', '#004D99'];
    const bgColor = colors[0].replace('#', '');
    const textColor = colors[1].replace('#', '');
    
    // Crear un placeholder con las iniciales y colores del equipo
    const iniciales = getInitials(teamName);
    const placeholderUrl = `https://placehold.co/200x200/${bgColor}/${textColor}.png?text=${encodeURIComponent(iniciales)}`;
    
    return placeholderUrl;
}

// Función para obtener un logo de país desde una API diferente
async function getCountryFlag(countryName) {
    const countryCode = getCountryCode(countryName);
    if (countryCode) {
        return `https://flagcdn.com/w320/${countryCode}.png`;
    }
    return null;
}

// Mapeo básico de nombres de países a códigos ISO
function getCountryCode(countryName) {
    const countryMap = {
        'argentina': 'ar',
        'brasil': 'br',
        'brazil': 'br',
        'alemania': 'de',
        'germany': 'de',
        'españa': 'es',
        'spain': 'es',
        'francia': 'fr',
        'france': 'fr',
        'inglaterra': 'gb-eng',
        'england': 'gb-eng',
        'italia': 'it',
        'italy': 'it',
        'portugal': 'pt',
        'netherlands': 'nl',
        'holanda': 'nl',
        'belgica': 'be',
        'belgium': 'be',
        'croacia': 'hr',
        'croatia': 'hr',
        'uruguay': 'uy',
        'mexico': 'mx',
        'estados unidos': 'us',
        'usa': 'us'
    };
    
    const normalizedName = countryName.toLowerCase();
    return countryMap[normalizedName];
}

// Función principal para descargar todas las imágenes
async function downloadAllImages() {
    console.log('🔄 Iniciando descarga de imágenes de equipos...');
    
    for (const equipo of equipos) {
        const fileName = path.basename(equipo.logo);
        const filePath = path.join(IMG_DIR, fileName);
        
        console.log(`🔍 Generando logo para: ${equipo.nombre}`);
        
        try {
            // Obtener URL del logo (siempre devuelve una URL válida)
            const logoUrl = await getTeamLogoUrl(equipo.nombre);
            
            // Descargar la imagen
            await downloadImage(logoUrl, filePath);
            console.log(`✅ Logo generado para: ${equipo.nombre}`);
        } catch (error) {
            console.error(`❌ Error al procesar ${equipo.nombre}:`, error.message);
        }
    }
    
    console.log('✅ Proceso de descarga finalizado');
}

// Ya no necesitamos esta función porque getTeamLogoUrl siempre devuelve una URL
// Función para crear un logo alternativo con iniciales
async function createAlternativeLogo(teamName, filePath) {
    // Ahora simplemente llamamos a getTeamLogoUrl y descargamos la imagen
    const logoUrl = await getTeamLogoUrl(teamName);
    return downloadImage(logoUrl, filePath);
}

// Función para obtener las iniciales de un nombre
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
}

// Ejecutar el script
downloadAllImages().catch(error => {
    console.error('Error en el script:', error);
});
