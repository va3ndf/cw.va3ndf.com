// POTA/SOTA phrase and QSO generator

const PREFIXES = ['K', 'W', 'N', 'KA', 'KB', 'KC', 'WA', 'WB', 'VE', 'VA'];
const SUFFIXES = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ'];
const DISTRICTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const PARK_PREFIXES = ['K-', 'US-', 'VE-'];
const STATE_CODES = ['0001', '0012', '0023', '0045', '0067', '0089', '0123', '0234', '0456'];

const NAMES = ['BOB', 'SUE', 'TOM', 'ANN', 'JIM', 'PAT', 'SAM', 'MAX', 'LIZ', 'RAY'];
const STATES = ['GA', 'NC', 'TN', 'VA', 'CA', 'TX', 'FL', 'NY', 'WA', 'CO'];
const CITIES = ['ATL', 'NYC', 'LA', 'CHI', 'DAL', 'MIA', 'SEA', 'DEN', 'PHX', 'BOS'];

const CW_PHRASES = [
  'CQ POTA DE',
  'CQ SOTA DE', 
  'UR 599',
  'TNX FER CALL',
  'NAME IS',
  'QTH IS',
  'RIG IS',
  'ANT IS',
  'WX IS',
  'TEMP IS',
  'PWR IS',
  'TU',
  '73',
  'HPE CUAGN',
  'GB',
  'SK'
];

export interface QSOExchange {
  callsign: string;
  report: string;
  name: string;
  qth: string;
  park?: string;
}

const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateCallsign = (): string => {
  const prefix = random(PREFIXES);
  const district = random(DISTRICTS);
  const suffix = random(SUFFIXES);
  return `${prefix}${district}${suffix}`;
};

export const generateParkNumber = (): string => {
  const prefix = random(PARK_PREFIXES);
  const code = random(STATE_CODES);
  return `${prefix}${code}`;
};

export const generateQSO = (type: 'cq' | 'response' | 'exchange' | 'final'): string => {
  const myCall = generateCallsign();
  const theirCall = generateCallsign();

  switch (type) {
    case 'cq':
      return `CQ POTA DE ${myCall} ${myCall} POTA K`;
    
    case 'response':
      return `${theirCall} DE ${myCall} UR 599 599 NAME ${random(NAMES)} QTH ${random(STATES)} BK`;
    
    case 'exchange':
      return `R ${myCall} DE ${theirCall} UR 599 NAME ${random(NAMES)} ${random(NAMES)} QTH ${random(CITIES)} ${random(STATES)} BK`;
    
    case 'final':
      return `${theirCall} DE ${myCall} TU 73 ${myCall} SK`;
    
    default:
      return '';
  }
};

export const generateFullQSO = (): string[] => {
  return [
    generateQSO('cq'),
    generateQSO('response'),
    generateQSO('exchange'),
    generateQSO('final')
  ];
};

export const generatePracticePhrase = (): string => {
  const phrases = [
    `CQ POTA DE ${generateCallsign()} ${generateCallsign()} POTA K`,
    `${generateCallsign()} DE ${generateCallsign()} UR 599 ${generateParkNumber()} BK`,
    `TNX ${random(NAMES)} UR 599 NAME ${random(NAMES)} QTH ${random(STATES)}`,
    `RIG IS 100W ANT IS DIPOLE WX ${random(['SUNNY', 'CLOUDY', 'RAIN'])}`,
    `TU ${generateCallsign()} 73 GL ${generateCallsign()} SK`
  ];
  
  return random(phrases);
};

export const CW_ABBREVIATIONS: Record<string, string> = {
  'CQ': 'Calling any station',
  'DE': 'From / This is',
  'K': 'Invitation to transmit',
  'BK': 'Break / Back to you',
  'SK': 'End of contact',
  'UR': 'Your / You are',
  'TU': 'Thank you',
  'TNX': 'Thanks',
  'POTA': 'Parks On The Air',
  'SOTA': 'Summits On The Air',
  'QTH': 'Location',
  'QSL': 'Acknowledge receipt',
  'PSE': 'Please',
  'WX': 'Weather',
  'RIG': 'Radio equipment',
  'ANT': 'Antenna',
  'PWR': 'Power',
  'GL': 'Good luck',
  'GB': 'Goodbye',
  'HPE': 'Hope',
  'CUAGN': 'See you again',
  '73': 'Best regards',
  '599': 'Perfect signal report',
  'R': 'Roger / Received',
  'FB': 'Fine business / Excellent'
};
