/**
 * Bingo Questions with Self Protocol Disclosure Mappings
 *
 * Each question maps to specific Self Protocol disclosures that must be verified
 * when a player clicks on that square.
 *
 * IMPORTANT: Self Protocol uses ISO 3166-1 alpha-3 (3-letter) country codes.
 * Always use 3-letter codes like 'USA', 'CAN', 'MEX' instead of 2-letter codes.
 */

export interface DisclosureRequirement {
  minimumAge?: number;
  ofac?: boolean;
  excludedCountries?: string[]; // ISO 3166-1 alpha-3 (3-letter) codes: 'USA', 'CAN', etc.
  name?: boolean;
  issuing_state?: boolean | string[]; // true for any, or array of 3-letter ISO codes: ['USA', 'CAN']
  nationality?: boolean | string[]; // true for any, or array of 3-letter ISO codes: ['USA', 'CAN']
  gender?: boolean;
  date_of_birth?: boolean;
  birth_year_range?: { min: number; max: number }; // For generation verification
  passport_number?: boolean;
  expiry_date?: boolean;
}

export interface BingoQuestion {
  id: string;
  question: string;
  disclosures: DisclosureRequirement;
}

/**
 * 25 bingo questions with Self Protocol disclosure requirements
 * Square 13 (middle) is always FREE with no verification required
 */
export const BINGO_QUESTIONS: BingoQuestion[] = [
  // Age-based questions
  {
    id: '1',
    question: 'Age 18+',
    disclosures: {
      minimumAge: 18
    }
  },
  {
    id: '2',
    question: 'Age 21+',
    disclosures: {
      minimumAge: 21
    }
  },
  {
    id: '3',
    question: 'Age 25+',
    disclosures: {
      minimumAge: 25
    }
  },

  // Geographic/Nationality questions
  {
    id: '4',
    question: 'From Europe',
    disclosures: {
      nationality: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE']
    }
  },
  {
    id: '5',
    question: 'Not from USA',
    disclosures: {
      excludedCountries: ['USA'],
      nationality: true
    }
  },
  {
    id: '6',
    question: 'From Latin America',
    disclosures: {
      nationality: ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'CRI', 'CUB', 'DOM', 'ECU', 'SLV', 'GTM', 'HND', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'URY', 'VEN']
    }
  },
  {
    id: '7',
    question: 'From Asia',
    disclosures: {
      nationality: ['CHN', 'IND', 'IDN', 'JPN', 'KOR', 'MYS', 'PHL', 'SGP', 'THA', 'VNM', 'PAK', 'BGD']
    }
  },
  {
    id: '8',
    question: 'From Africa',
    disclosures: {
      nationality: ['DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV', 'CAF', 'TCD', 'COM', 'COG', 'COD', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'SWZ', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE']
    }
  },

  // Compliance/Security questions
  {
    id: '9',
    question: 'Not on OFAC list',
    disclosures: {
      ofac: false
    }
  },
  {
    id: '10',
    question: 'Valid passport',
    disclosures: {
      passport_number: true,
      expiry_date: true
    }
  },

  // Identity verification questions
  {
    id: '11',
    question: 'Name verified',
    disclosures: {
      name: true
    }
  },
  {
    id: '12',
    question: 'DOB verified',
    disclosures: {
      date_of_birth: true
    }
  },

  // FREE square (middle)
  {
    id: '13',
    question: 'FREE',
    disclosures: {} // No verification required
  },

  // Combination questions
  {
    id: '14',
    question: 'EU citizen 18+',
    disclosures: {
      minimumAge: 18,
      nationality: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE']
    }
  },
  {
    id: '15',
    question: 'Safe traveler',
    disclosures: {
      ofac: false,
      expiry_date: true
    }
  },

  // More geographic variations
  {
    id: '16',
    question: 'From North America',
    disclosures: {
      nationality: ['USA', 'CAN', 'MEX'] // ISO 3166-1 alpha-3 codes (3-letter) for Self Protocol
    }
  },
  {
    id: '17',
    question: 'From Oceania',
    disclosures: {
      nationality: ['AUS', 'NZL', 'FJI', 'PNG', 'SLB', 'VUT', 'NCL', 'PYF', 'WSM', 'GUM', 'KIR', 'MHL', 'FSM', 'NRU', 'MNP', 'PLW', 'TKL', 'TON', 'TUV', 'WLF']
    }
  },

  // Additional age thresholds
  {
    id: '18',
    question: 'Gen Z (1997-2012)',
    disclosures: {
      date_of_birth: true,
      birth_year_range: { min: 1997, max: 2012 }
    }
  },
  {
    id: '19',
    question: 'Millennial (1981-1996)',
    disclosures: {
      date_of_birth: true,
      birth_year_range: { min: 1981, max: 1996 }
    }
  },

  // Identity completeness
  {
    id: '20',
    question: 'Full identity verified',
    disclosures: {
      name: true,
      date_of_birth: true,
      nationality: true,
      passport_number: true
    }
  },
  {
    id: '21',
    question: 'Gender verified',
    disclosures: {
      gender: true
    }
  },

  // Issuing state questions
  {
    id: '22',
    question: 'US passport',
    disclosures: {
      issuing_state: ['USA'], // ISO 3166-1 alpha-3 codes (3-letter) for Self Protocol
      passport_number: true
    }
  },
  {
    id: '23',
    question: 'EU passport',
    disclosures: {
      issuing_state: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'],
      passport_number: true
    }
  },

  // Complex verification
  {
    id: '24',
    question: 'Verified adult',
    disclosures: {
      minimumAge: 18,
      name: true,
      date_of_birth: true,
      gender: true,
      ofac: false
    }
  },
  {
    id: '25',
    question: 'International citizen',
    disclosures: {
      nationality: true,
      issuing_state: true,
      passport_number: true,
      expiry_date: true,
      ofac: false
    }
  }
];

/**
 * Get disclosure requirements for a specific square ID
 */
export function getDisclosuresForSquare(squareId: string): DisclosureRequirement {
  const question = BINGO_QUESTIONS.find(q => q.id === squareId);
  return question?.disclosures || {};
}

/**
 * Check if a square requires any verification (FREE square doesn't)
 */
export function requiresVerification(squareId: string): boolean {
  const disclosures = getDisclosuresForSquare(squareId);
  return Object.keys(disclosures).length > 0;
}
