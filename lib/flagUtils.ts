/**
 * Flag Utility - Centralized flag management
 * Uses flagcdn.com for reliable country flag images
 */

export interface FlagConfig {
    size: 'small' | 'medium' | 'large';
}

const FLAG_SIZES = {
    small: 'w20',   // 20px width
    medium: 'w40',  // 40px width  
    large: 'w80',   // 80px width
};

/**
 * Get a flag image URL for a given country code
 * @param countryCode - ISO 3166-1 alpha-2 code (lowercase)
 * @param size - Size of the flag image
 */
export function getFlagUrl(countryCode: string, size: FlagConfig['size'] = 'medium'): string {
    const sizeParam = FLAG_SIZES[size];
    return `https://flagcdn.com/${sizeParam}/${countryCode.toLowerCase()}.png`;
}

/**
 * Get flag URL with fallback for missing flags
 */
export function getFlagUrlWithFallback(countryCode: string, size: FlagConfig['size'] = 'medium'): string {
    // flagcdn.com typically has all ISO country codes
    // For edge cases, we could add a fallback placeholder
    return getFlagUrl(countryCode, size);
}

/**
 * Country code to country name mapping (commonly used)
 */
export const COUNTRY_NAMES: Record<string, string> = {
    'sg': 'Singapore',
    'jp': 'Japan',
    'de': 'Germany',
    'fr': 'France',
    'it': 'Italy',
    'es': 'Spain',
    'kr': 'South Korea',
    'fi': 'Finland',
    'at': 'Austria',
    'se': 'Sweden',
    'gb': 'United Kingdom',
    'us': 'USA',
    'au': 'Australia',
    'nz': 'New Zealand',
    'ae': 'UAE',
    'ch': 'Switzerland',
    'ca': 'Canada',
    'pt': 'Portugal',
    'nl': 'Netherlands',
    'be': 'Belgium',
    'my': 'Malaysia',
    'br': 'Brazil',
    'mx': 'Mexico',
    'ar': 'Argentina',
    'cl': 'Chile',
    'za': 'South Africa',
    'th': 'Thailand',
    'tr': 'Turkey',
    'cn': 'China',
    'in': 'India',
    'ng': 'Nigeria',
    'gh': 'Ghana',
    'ke': 'Kenya',
    'eg': 'Egypt',
    'pk': 'Pakistan',
    'bd': 'Bangladesh',
    'et': 'Ethiopia',
    'tz': 'Tanzania',
    'ug': 'Uganda',
    'rw': 'Rwanda',
    'sn': 'Senegal',
    'cm': 'Cameroon',
    'dz': 'Algeria',
    'ma': 'Morocco',
    'tn': 'Tunisia',
    'jo': 'Jordan',
    'lb': 'Lebanon',
    'lk': 'Sri Lanka',
    'np': 'Nepal',
    'af': 'Afghanistan',
};

export function getCountryName(code: string): string {
    return COUNTRY_NAMES[code.toLowerCase()] || code.toUpperCase();
}
