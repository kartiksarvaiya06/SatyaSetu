export const grievances = [
  {
    id: 'GRV001',
    complainantName: 'અમિત પટેલ',
    complainantMobile: '9876543210',
    category: 'Roads',
    description: 'પાણી ભરાય છે રોડ પર, ખાડા પડી ગયા છે. છેલ્લા ત્રણ મહિનાથી આ સમસ્યા છે.',
    location: {
      address: 'મણિનગર, અમદાવાદ',
      lat: 23.0225,
      lng: 72.5714
    },
    status: 'pending',
    department: 'Roads & Buildings',
    submittedAt: '2025-03-15T10:30:00Z',
    priority: 'high',
    resolutionAttempts: []
  },
  {
    id: 'GRV002',
    complainantName: 'પ્રિયા શાહ',
    complainantMobile: '9876543211',
    category: 'Water Supply',
    description: 'પાણી નથી આવતું છેલ્લા 2 દિવસથી. ટેન્કર પણ નથી મોકલ્યું.',
    location: {
      address: 'સેટેલાઇટ, અમદાવાદ',
      lat: 23.0300,
      lng: 72.5200
    },
    status: 'verified_resolved',
    department: 'Water Supply',
    submittedAt: '2025-03-10T08:00:00Z',
    priority: 'medium',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-16T14:00:00Z',
        officerId: 'field1',
        photoUrl: '/placeholder-photo.jpg',
        gpsLog: { lat: 23.0301, lng: 72.5201 },
        ivrConfirmed: true,
        ivrTimestamp: '2025-03-16T15:30:00Z',
        resolution: 'પાઈપલાઈન રિપેર કરવામાં આવી'
      }
    ]
  },
  {
    id: 'GRV003',
    complainantName: 'અમિત પટેલ',
    complainantMobile: '9876543210',
    category: 'Electricity',
    description: 'સ્ટ્રીટ લાઇટ બંધ છે. રાત્રે અંધારું રહે છે.',
    location: {
      address: 'નારોલ, અમદાવાદ',
      lat: 22.9800,
      lng: 72.5900
    },
    status: 'resolved_pending_verification',
    department: 'Electricity',
    submittedAt: '2025-03-12T14:00:00Z',
    priority: 'medium',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-18T10:00:00Z',
        officerId: 'field1',
        photoUrl: null,
        gpsLog: null,
        ivrConfirmed: null,
        ivrTimestamp: null,
        resolution: 'લાઈટ બદલવામાં આવી'
      }
    ]
  },
  {
    id: 'GRV004',
    complainantName: 'રાજુ ભાઈ',
    complainantMobile: '9876543212',
    category: 'Sanitation',
    description: 'ગટર ભરાઈ ગઈ છે, પાણી રોડ પર આવે છે.',
    location: {
      address: 'વસ્ત્રાપુર, અમદાવાદ',
      lat: 23.0400,
      lng: 72.5300
    },
    status: 'auto_reopened',
    department: 'Sanitation',
    submittedAt: '2025-03-08T09:00:00Z',
    priority: 'high',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-14T16:00:00Z',
        officerId: 'field1',
        photoUrl: '/placeholder-photo.jpg',
        gpsLog: { lat: 23.0600, lng: 72.5500 },
        ivrConfirmed: false,
        ivrTimestamp: '2025-03-14T17:00:00Z',
        resolution: 'ગટર સાફ કરી (denied by citizen)'
      }
    ]
  },
  {
    id: 'GRV005',
    complainantName: 'મીના બહેન',
    complainantMobile: '9876543213',
    category: 'Roads',
    description: 'ફૂટપાથ તૂટેલી છે, ચાલવું મુશ્કેલ છે.',
    location: {
      address: 'પાલડી, અમદાવાદ',
      lat: 23.0150,
      lng: 72.5600
    },
    status: 'pending',
    department: 'Roads & Buildings',
    submittedAt: '2025-03-20T11:00:00Z',
    priority: 'low',
    resolutionAttempts: []
  },
  {
    id: 'GRV006',
    complainantName: 'અમિત પટેલ',
    complainantMobile: '9876543210',
    category: 'Water Supply',
    description: 'પાણીનું પ્રેશર ઓછું છે, ઉપરના માળે પાણી નથી આવતું.',
    location: {
      address: 'બોડકદેવ, અમદાવાદ',
      lat: 23.0350,
      lng: 72.5100
    },
    status: 'pending',
    department: 'Water Supply',
    submittedAt: '2025-03-22T07:30:00Z',
    priority: 'medium',
    resolutionAttempts: []
  },
  {
    id: 'GRV007',
    complainantName: 'વિક્રમ સિંહ',
    complainantMobile: '9876543214',
    category: 'Electricity',
    description: 'ટ્રાન્સફોર્મર બળી ગયું છે, 50 ઘરોમાં વીજળી નથી.',
    location: {
      address: 'ઇસનપુર, અમદાવાદ',
      lat: 22.9900,
      lng: 72.6100
    },
    status: 'resolved_pending_verification',
    department: 'Electricity',
    submittedAt: '2025-03-18T16:00:00Z',
    priority: 'critical',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-20T09:00:00Z',
        officerId: 'field1',
        photoUrl: '/placeholder-photo.jpg',
        gpsLog: { lat: 22.9901, lng: 72.6102 },
        ivrConfirmed: null,
        ivrTimestamp: null,
        resolution: 'નવું ટ્રાન્સફોર્મર બેસાડ્યું'
      }
    ]
  },
  {
    id: 'GRV008',
    complainantName: 'ગીતા બેન',
    complainantMobile: '9876543215',
    category: 'Sanitation',
    description: 'કચરો ઉપાડવામાં નથી આવતો, 4 દિવસથી.',
    location: {
      address: 'ઘાટલોડીયા, અમદાવાદ',
      lat: 23.0600,
      lng: 72.5500
    },
    status: 'verified_resolved',
    department: 'Sanitation',
    submittedAt: '2025-03-05T06:00:00Z',
    priority: 'medium',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-07T08:00:00Z',
        officerId: 'field1',
        photoUrl: '/placeholder-photo.jpg',
        gpsLog: { lat: 23.0601, lng: 72.5501 },
        ivrConfirmed: true,
        ivrTimestamp: '2025-03-07T10:00:00Z',
        resolution: 'કચરો ઉપાડી લેવાયો'
      }
    ]
  }
];
