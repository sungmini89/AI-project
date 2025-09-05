// Vercel Serverless Function for Color API Proxy with Enhanced Performance

// Korean Color Keywords with Caching
const koreanColorMap = {
  '바다': ['#0077BE', '#006994', '#4A90B8', '#87CEEB', '#20B2AA'],
  '하늘': ['#87CEEB', '#4A90E2', '#6BB6FF', '#B0E0E6', '#ADD8E6'],
  '숲': ['#228B22', '#32CD32', '#90EE90', '#98FB98', '#00FF7F'],
  '불': ['#FF6347', '#FF4500', '#DC143C', '#B22222', '#8B0000'],
  '태양': ['#FFD700', '#FFFF00', '#FFA500', '#FF8C00', '#DAA520'],
  '달': ['#F5F5F5', '#E6E6FA', '#D3D3D3', '#C0C0C0', '#B0C4DE'],
  '꽃': ['#FFB6C1', '#FF69B4', '#FF1493', '#DC143C', '#FFC0CB'],
  '나무': ['#8B4513', '#A0522D', '#CD853F', '#D2B48C', '#F4A460'],
  '구름': ['#FFFFFF', '#F0F8FF', '#E0E6E8', '#D3D3D3', '#C0C0C0'],
  '잔디': ['#7CFC00', '#32CD32', '#00FF00', '#ADFF2F', '#9ACD32'],
  '장미': ['#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000'],
  '바위': ['#696969', '#708090', '#2F4F4F', '#36454F', '#4682B4'],
  '모래': ['#F4A460', '#DEB887', '#D2B48C', '#BC9A6A', '#A0522D'],
  '눈': ['#FFFAFA', '#F0F8FF', '#F5F5F5', '#E0E6E8', '#DCDCDC'],
  '얼음': ['#B0E0E6', '#AFEEEE', '#E0FFFF', '#F0FFFF', '#87CEEB'],
  '석양': ['#FF6347', '#FF4500', '#FF8C00', '#FFA500', '#FFD700'],
  '새벽': ['#FFB6C1', '#FFA07A', '#F0E68C', '#E6E6FA', '#D8BFD8'],
  '밤': ['#191970', '#000080', '#4B0082', '#2E2B5F', '#36454F']
};

// Color harmony algorithms
const generateColorHarmony = (baseColor, type) => {
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  const hslToHex = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const [h, s, l] = hexToHsl(baseColor);
  
  switch (type) {
    case 'complementary':
      return [
        baseColor,
        hslToHex((h + 180) % 360, s, l),
        hslToHex(h, s * 0.8, l * 1.2),
        hslToHex((h + 180) % 360, s * 0.8, l * 0.8),
        hslToHex(h, s * 0.6, l * 0.9)
      ];
    
    case 'analogous':
      return [
        baseColor,
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h + 60) % 360, s * 0.8, l),
        hslToHex((h - 60 + 360) % 360, s * 0.8, l)
      ];
    
    case 'triadic':
      return [
        baseColor,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex(h, s * 0.7, l * 1.1),
        hslToHex((h + 180) % 360, s * 0.6, l * 0.9)
      ];
    
    case 'monochromatic':
      return [
        baseColor,
        hslToHex(h, s, Math.min(95, l * 1.3)),
        hslToHex(h, s, Math.max(10, l * 0.7)),
        hslToHex(h, s * 0.8, l * 1.1),
        hslToHex(h, s * 0.6, l * 0.9)
      ];
    
    default:
      return [baseColor];
  }
};

// Rate limiting with edge storage
const rateLimiter = {
  requests: new Map(),
  
  isAllowed(ip) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, [now]);
      return true;
    }
    
    const requests = this.requests.get(ip).filter(time => time > windowStart);
    
    if (requests.length >= 100) { // 100 requests per minute
      return false;
    }
    
    requests.push(now);
    this.requests.set(ip, requests);
    return true;
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress ||
               'unknown';
    
    if (!rateLimiter.isAllowed(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { keyword, harmony: harmonyType = 'complementary', count = '5' } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    // Check Korean color mapping first
    const koreanColors = koreanColorMap[keyword.toLowerCase()];
    let palette;
    const colorCount = Math.min(parseInt(count), 10);

    if (koreanColors) {
      // Use predefined Korean colors
      palette = koreanColors.slice(0, colorCount);
    } else {
      // Generate colors based on keyword hash
      const hashCode = keyword.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const baseHue = Math.abs(hashCode) % 360;
      const baseSaturation = 60 + (Math.abs(hashCode >> 8) % 40);
      const baseLightness = 45 + (Math.abs(hashCode >> 16) % 30);
      
      const baseColor = `hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%)`;
      
      // Convert HSL to HEX for harmony generation
      const tempDiv = { style: {} };
      tempDiv.style.color = baseColor;
      
      // Simple HSL to HEX conversion for server-side
      const hslToHex = (h, s, l) => {
        h /= 360; s /= 100; l /= 100;
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        let r, g, b;
        if (s === 0) {
          r = g = b = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = (c) => {
          const hex = Math.round(c * 255).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };
      
      const baseHexColor = hslToHex(baseHue, baseSaturation, baseLightness);
      palette = generateColorHarmony(baseHexColor, harmonyType).slice(0, colorCount);
    }

    // Performance metrics
    const startTime = Date.now();
    
    const response = {
      success: true,
      data: {
        keyword,
        harmonyType,
        colors: palette,
        metadata: {
          cached: !!koreanColors,
          generatedAt: new Date().toISOString(),
          region: process.env.VERCEL_REGION || 'local',
          responseTime: `${Date.now() - startTime}ms`
        }
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}