// Mock data based on real MongoDB structure
export const mockScraperTargets = [
  // E-commerce principales
  { name: 'carrefour', url: 'carrefour.com.ar', enabled: true, type: 'ecommerce' },
  { name: 'coto', url: 'cotodigital3.com.ar', enabled: true, type: 'ecommerce' },
  { name: 'disco', url: 'disco.com.ar', enabled: true, type: 'ecommerce' },
  { name: 'jumbo', url: 'jumbo.com.ar', enabled: true, type: 'ecommerce' },
  { name: 'diaonline', url: 'diaonline.supermercadosdia.com.ar', enabled: false, type: 'ecommerce' },
  
  // Tecnología y electrónica
  { name: 'fravega', url: 'fravega.com', enabled: true, type: 'electronics' },
  { name: 'garbarino', url: 'garbarino.com', enabled: true, type: 'electronics' },
  { name: 'cetrogar', url: 'cetrogar.com.ar', enabled: false, type: 'electronics' },
  { name: 'compragamer', url: 'compragamer.com', enabled: false, type: 'electronics' },
  { name: 'electroventas', url: 'electroventas.com.ar', enabled: false, type: 'electronics' },
  
  // Construcción y materiales
  { name: 'materiales_moreno', url: 'materialesmoreno.com.ar', enabled: true, type: 'construction' },
  { name: 'sodimac', url: 'sodimac.com.ar', enabled: false, type: 'construction' },
  { name: 'easy', url: 'easy.com.ar', enabled: false, type: 'construction' },
  
  // Farmacias
  { name: 'farmacity', url: 'farmacity.com', enabled: false, type: 'pharmacy' },
  { name: 'farmaonline', url: 'farmaonline.com.ar', enabled: false, type: 'pharmacy' },
  { name: 'farmashop', url: 'farmashop.com.ar', enabled: false, type: 'pharmacy' },
  
  // Moda y deportes
  { name: 'solodeportes', url: 'solodeportes.com.ar', enabled: false, type: 'sports' },
  { name: 'dexter', url: 'dexter.com.ar', enabled: false, type: 'sports' },
  { name: 'netshoes', url: 'netshoes.com.ar', enabled: false, type: 'sports' },
  { name: 'distritomoda', url: 'distritomoda.com.ar', enabled: false, type: 'fashion' },
  { name: 'dafiti', url: 'dafiti.com.ar', enabled: false, type: 'fashion' },
  
  // Pinturerías
  { name: 'pintureriasprestigio', url: 'pintureriasprestigio.com', enabled: false, type: 'paint' },
  { name: 'pintureriasagitario', url: 'pintureriasagitario.com.ar', enabled: false, type: 'paint' },
  { name: 'pintureriasrex', url: 'rex.com.ar', enabled: false, type: 'paint' },
  
  // Marketplace
  { name: 'mercadolibre', url: 'mercadolibre.com.ar', enabled: false, type: 'marketplace' },
  { name: 'tiendanube', url: 'tiendanube.com', enabled: false, type: 'marketplace' },
  
  // Otros
  { name: 'naldo', url: 'naldo.com.ar', enabled: false, type: 'other' },
  { name: 'simplicity', url: 'simplicity.com.ar', enabled: false, type: 'other' },
  { name: 'cebastore', url: 'cebastore.com.ar', enabled: false, type: 'other' },
  { name: 'musimundo', url: 'musimundo.com', enabled: false, type: 'electronics' },
  { name: 'megatone', url: 'megatone.net', enabled: false, type: 'electronics' },
  { name: 'falabella', url: 'falabella.com.ar', enabled: false, type: 'department' },
  { name: 'linio', url: 'linio.com.ar', enabled: false, type: 'marketplace' },
  { name: 'walmart', url: 'walmart.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'vea', url: 'vea.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'changomas', url: 'changomas.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'makro', url: 'makro.com.ar', enabled: false, type: 'wholesale' },
  { name: 'vital', url: 'vital.com.ar', enabled: false, type: 'wholesale' },
  { name: 'maxiconsumo', url: 'maxiconsumo.com', enabled: false, type: 'wholesale' },
  { name: 'yaguar', url: 'yaguar.com.ar', enabled: false, type: 'wholesale' },
  { name: 'diarco', url: 'diarco.com.ar', enabled: false, type: 'wholesale' },
  { name: 'libertad', url: 'hiperlibertad.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'cencosud', url: 'cencosud.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'norte', url: 'norte.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'toledo', url: 'toledo.com.ar', enabled: false, type: 'ecommerce' },
  { name: 'cordiez', url: 'cordiez.com.ar', enabled: false, type: 'ecommerce' }
];

export const mockProductsBySource = {
  materiales_moreno: 30,
  carrefour: 15,
  jumbo: 8,
  garbarino: 8,
  fravega: 8,
  disco: 8,
  coto: 8
};