export const departments = [
  {
    id: 'dept_roads',
    name: 'Roads & Buildings',
    nameGu: 'માર્ગ અને મકાન',
    totalResolved: 45,
    totalAttempts: 52,
    autoReopens: 4,
    disputedByCitizen: 3,
    avgResolutionDays: 3.2,
    qualityScore: 78,
    officers: ['dept1']
  },
  {
    id: 'dept_water',
    name: 'Water Supply',
    nameGu: 'પાણી પુરવઠો',
    totalResolved: 38,
    totalAttempts: 40,
    autoReopens: 1,
    disputedByCitizen: 1,
    avgResolutionDays: 1.8,
    qualityScore: 91,
    officers: ['dept2']
  },
  {
    id: 'dept_elec',
    name: 'Electricity',
    nameGu: 'વીજળી',
    totalResolved: 30,
    totalAttempts: 38,
    autoReopens: 5,
    disputedByCitizen: 3,
    avgResolutionDays: 4.5,
    qualityScore: 62,
    officers: []
  },
  {
    id: 'dept_san',
    name: 'Sanitation',
    nameGu: 'સ્વચ્છતા',
    totalResolved: 55,
    totalAttempts: 60,
    autoReopens: 2,
    disputedByCitizen: 3,
    avgResolutionDays: 2.1,
    qualityScore: 84,
    officers: []
  },
  {
    id: 'dept_health',
    name: 'Health',
    nameGu: 'આરોગ્ય',
    totalResolved: 20,
    totalAttempts: 28,
    autoReopens: 6,
    disputedByCitizen: 2,
    avgResolutionDays: 5.0,
    qualityScore: 48,
    officers: []
  },
  {
    id: 'dept_edu',
    name: 'Education',
    nameGu: 'શિક્ષણ',
    totalResolved: 15,
    totalAttempts: 16,
    autoReopens: 0,
    disputedByCitizen: 1,
    avgResolutionDays: 2.5,
    qualityScore: 90,
    officers: []
  }
];

export const categories = [
  { id: 'roads', name: 'Roads', nameGu: 'રોડ / માર્ગ', department: 'Roads & Buildings' },
  { id: 'water', name: 'Water Supply', nameGu: 'પાણી', department: 'Water Supply' },
  { id: 'electricity', name: 'Electricity', nameGu: 'વીજળી', department: 'Electricity' },
  { id: 'sanitation', name: 'Sanitation', nameGu: 'સ્વચ્છતા', department: 'Sanitation' },
  { id: 'health', name: 'Health', nameGu: 'આરોગ્ય', department: 'Health' },
  { id: 'education', name: 'Education', nameGu: 'શિક્ષણ', department: 'Education' },
];
