/**
 * Airport Search Wrapper
 * Wraps aircodes package with flag emoji support
 */
import { findAirport, getAirportByIata } from 'aircodes';
import flag from 'country-code-emoji';

// Country name → ISO code mapping (aircodes returns full country name)
const COUNTRY_CODES: Record<string, string> = {
  // Pacific
  'Fiji': 'FJ',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Samoa': 'WS',
  'American Samoa': 'AS',
  'Tonga': 'TO',
  'Vanuatu': 'VU',
  'New Caledonia': 'NC',
  'French Polynesia': 'PF',
  'Papua New Guinea': 'PG',
  'Solomon Islands': 'SB',
  'Kiribati': 'KI',
  'Marshall Islands': 'MH',
  'Micronesia': 'FM',
  'Palau': 'PW',
  'Guam': 'GU',
  'Northern Mariana Islands': 'MP',
  'Nauru': 'NR',
  'Tuvalu': 'TV',
  'Cook Islands': 'CK',
  'Niue': 'NU',
  'Wallis and Futuna': 'WF',
  'Norfolk Island': 'NF',
  
  // Asia
  'Singapore': 'SG',
  'Hong Kong': 'HK',
  'Japan': 'JP',
  'South Korea': 'KR',
  'China': 'CN',
  'Taiwan': 'TW',
  'Thailand': 'TH',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Cambodia': 'KH',
  'Laos': 'LA',
  'Myanmar': 'MM',
  'India': 'IN',
  'Sri Lanka': 'LK',
  'Bangladesh': 'BD',
  'Nepal': 'NP',
  'Maldives': 'MV',
  'Brunei': 'BN',
  'Timor-Leste': 'TL',
  
  // Middle East
  'United Arab Emirates': 'AE',
  'Qatar': 'QA',
  'Saudi Arabia': 'SA',
  'Bahrain': 'BH',
  'Kuwait': 'KW',
  'Oman': 'OM',
  'Israel': 'IL',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Turkey': 'TR',
  
  // Americas
  'United States': 'US',
  'Canada': 'CA',
  'Mexico': 'MX',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Peru': 'PE',
  'Colombia': 'CO',
  'Ecuador': 'EC',
  'Venezuela': 'VE',
  'Panama': 'PA',
  'Costa Rica': 'CR',
  'Jamaica': 'JM',
  'Bahamas': 'BS',
  'Puerto Rico': 'PR',
  'Dominican Republic': 'DO',
  'Cuba': 'CU',
  'Trinidad and Tobago': 'TT',
  'Barbados': 'BB',
  'Aruba': 'AW',
  
  // Europe
  'United Kingdom': 'GB',
  'France': 'FR',
  'Germany': 'DE',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Spain': 'ES',
  'Italy': 'IT',
  'Portugal': 'PT',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Ireland': 'IE',
  'Greece': 'GR',
  'Denmark': 'DK',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Finland': 'FI',
  'Iceland': 'IS',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Serbia': 'RS',
  'Russia': 'RU',
  
  // Africa
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Morocco': 'MA',
  'Kenya': 'KE',
  'Ethiopia': 'ET',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'Tanzania': 'TZ',
  'Uganda': 'UG',
  'Rwanda': 'RW',
  'Mauritius': 'MU',
  'Seychelles': 'SC',
  'Madagascar': 'MG',
  'Zimbabwe': 'ZW',
  'Zambia': 'ZM',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Mozambique': 'MZ',
  'Tunisia': 'TN',
  'Algeria': 'DZ',
  'Senegal': 'SN',
  'Ivory Coast': 'CI',
  'Reunion': 'RE',
};

export interface AirportResult {
  iata: string;
  city: string;
  country: string;
  flag: string;
}

/**
 * Search airports by city name or IATA code
 * Returns formatted results with flag emojis
 */
export function searchAirports(query: string, limit: number = 8): AirportResult[] {
  if (!query || query.length < 2) return [];
  
  try {
    const results = findAirport(query);
    if (!results || !Array.isArray(results)) return [];
    
    return results.slice(0, limit).map(airport => {
      const countryCode = COUNTRY_CODES[airport.country] || '';
      let flagEmoji = '🏳️'; // Default flag
      
      try {
        if (countryCode) {
          flagEmoji = flag(countryCode);
        }
      } catch {
        // Keep default flag if conversion fails
      }
      
      return {
        iata: airport.iata,
        city: airport.city,
        country: airport.country,
        flag: flagEmoji,
      };
    });
  } catch (error) {
    console.error('Airport search error:', error);
    return [];
  }
}

/**
 * Get single airport by exact IATA code
 */
export function getAirport(iata: string): AirportResult | null {
  if (!iata || iata.length !== 3) return null;
  
  try {
    const airport = getAirportByIata(iata.toUpperCase());
    if (!airport) return null;
    
    const countryCode = COUNTRY_CODES[airport.country] || '';
    let flagEmoji = '🏳️';
    
    try {
      if (countryCode) {
        flagEmoji = flag(countryCode);
      }
    } catch {
      // Keep default
    }
    
    return {
      iata: airport.iata,
      city: airport.city,
      country: airport.country,
      flag: flagEmoji,
    };
  } catch (error) {
    console.error('Get airport error:', error);
    return null;
  }
}