# Project Documentation: Swagat AI Verification Layer

I'll create both `PLANNING.md` and `TASK.md` based on your problem statement and requirements.

---

## 📄 PLANNING.md

```markdown
# PLANNING.md
## Project: Swagat AI Verification Layer (SAVL)
### Gujarat Grievance Resolution Verification System

---

## 1. 🎯 Vision & Purpose

**Problem:** Gujarat's Swagat portal marks thousands of complaints as "resolved" monthly, but many lack physical action — only text replies are sent. This creates a trust gap between citizens and government departments.

**Vision:** Build an **AI-assisted independent verification layer** that ensures every "resolved" grievance is backed by verifiable evidence:
- 📸 Geo-tagged field officer photo
- 📞 Gujarati IVR confirmation from complainant (no smartphone needed)
- 📍 GPS-stamped field visit log
- 🔄 Auto-reopen if verification fails

**Mission:** Restore citizen trust by making "resolved" actually mean *resolved* — verified, archived, and audit-ready for Jan Sunwai hearings.

---

## 2. 🏛️ Core Principles (Winning Logic)

| Principle | Implementation |
|-----------|----------------|
| **No Self-Certification** | Verification module runs independently of resolving department |
| **No Manual Override** | Auto-reopen logic locked from same-department tampering |
| **Public Accountability** | Department Quality Score visible to Collector in real time |
| **Inclusive Access** | IVR-based complainant loop — works on basic feature phones |
| **Audit-Ready** | Evidence packet (photo + GPS + voice) timestamped & archived |

---

## 3. 👥 User Roles & Access

| Role | Login Method | Key Actions |
|------|--------------|-------------|
| **Citizen (Complainant)** | Mobile + OTP | Submit grievance (form/chatbot), view dashboard, receive IVR call, press 1 (confirm) / 2 (dispute) |
| **Field Officer** | Username + Password (mobile-first) | Receive task, upload geo-tagged photo, submit GPS-stamped visit log |
| **Department Officer/Admin** | Username + Password + OTP | Mark grievance resolved (triggers verification flow) |
| **District Collector** | Secure login + OTP | View department quality scores, drill into failed verifications, escalate |

---

## 4. 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Citizen    │  │ Department   │  │  Collector       │  │
│  │  Portal     │  │  Dashboard   │  │  Dashboard       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                BACKEND API (Node.js + Express)              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Auth (OTP) │ │ Grievance  │ │Verification│ │ Scoring  │ │
│  │  Service   │ │  Service   │ │  Engine    │ │  Engine  │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
└────────┬──────────────┬──────────────┬──────────────┬──────┘
         │              │              │              │
   ┌─────▼────┐  ┌──────▼─────┐  ┌─────▼────┐  ┌─────▼─────┐
   │ MongoDB  │  │ Cloudinary │  │  Twilio  │  │  Google   │
   │ /Postgres│  │ (Photos)   │  │ (IVR/SMS)│  │  Maps API │
   └──────────┘  └────────────┘  └──────────┘  └───────────┘
```

---

## 5. 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** Redux Toolkit / Zustand
- **Routing:** React Router v6
- **Maps:** Google Maps API / Leaflet
- **Charts:** Recharts (for Collector dashboard)
- **i18n:** react-i18next (Gujarati + English + Hindi)
- **Chatbot:** React Chatbot Kit / custom

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB (flexible schema for grievances) + Redis (OTP/session cache)
- **Auth:** JWT + bcrypt + OTP (Twilio/MSG91)
- **File Storage:** Cloudinary / AWS S3 (photos)
- **IVR:** Twilio Voice / Exotel (Gujarati TTS)
- **GPS Validation:** Haversine formula + Google Geocoding API
- **Job Queue:** BullMQ (for async verification tasks)

### DevOps
- **Hosting:** Vercel (frontend), Render/Railway (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + LogRocket

### AI/ML (Optional Enhancement)
- **Chatbot NLP:** OpenAI GPT-4o-mini / Gemini for grievance classification
- **Photo Validation:** TensorFlow.js (detect blank/duplicate photos)
- **Voice Transcription:** Whisper API (for IVR dispute reasons)

---

## 6. 📂 Project Structure

```
swagat-verification-layer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Footer, Loader
│   │   │   ├── citizen/       # GrievanceForm, Chatbot, Dashboard
│   │   │   ├── department/    # ResolveModal, TaskList
│   │   │   └── collector/     # ScoreCard, FailedVerifications
│   │   ├── pages/
│   │   │   ├── auth/          # Login, OTPVerify
│   │   │   ├── citizen/
│   │   │   ├── department/
│   │   │   └── collector/
│   │   ├── services/          # API calls
│   │   ├── store/             # Redux/Zustand
│   │   ├── utils/
│   │   ├── locales/           # gu.json, en.json, hi.json
│   │   └── mockData/          # Phase 1 mock data
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── ivrService.js
│   │   │   ├── gpsService.js
│   │   │   ├── scoringService.js
│   │   │   └── verificationEngine.js
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
├── PLANNING.md
├── TASK.md
└── README.md
```

---

## 7. 🔄 Core Workflow

### Resolution Verification Flow
```
1. Department Officer clicks "Mark Resolved"
        ↓
2. System BLOCKS instant closure → Status = "Pending Verification"
        ↓
3. Verification Engine triggers 3 parallel tasks:
   ├── Assign field officer (independent dept) → Photo + GPS upload
   ├── Auto-IVR call to complainant in Gujarati
   └── Log GPS visit timestamp
        ↓
4. Validation Checks:
   ├── Photo geo-tag within 100m of grievance address? ✓
   ├── IVR keypress = 1 (Confirm)? ✓
   └── Visit timestamp within 24h of resolution? ✓
        ↓
5a. ALL PASS → Status = "Verified Resolved" → Score +1
5b. ANY FAIL → Status = "Auto-Reopened" → Score -2 → Notify Collector
```

---

## 8. 📊 Department Quality Score Formula

```
Quality Score = (Verified Resolutions / Total Resolution Attempts) × 100
                - (Auto-Reopens × 2) 
                - (Disputed by Citizen × 3)
                + (Avg Resolution Speed Bonus)

Scale: 0–100 (Public + Collector dashboard)
Color Code: 🟢 80+ | 🟡 50–79 | 🔴 <50
```

---

## 9. 🚦 Development Phases

| Phase | Scope | Duration |
|-------|-------|----------|
| **Phase 1** | Frontend with mock data — Citizen + Admin login, forms, dashboards | Week 1–2 |
| **Phase 2** | Backend API + DB + Auth (OTP) | Week 3 |
| **Phase 3** | Verification Engine + IVR integration (Twilio sandbox) | Week 4 |
| **Phase 4** | Field Officer mobile flow + GPS validation | Week 5 |
| **Phase 5** | Collector dashboard + Quality scoring + Audit packets | Week 6 |
| **Phase 6** | Testing, polish, demo prep | Week 7 |

---

## 10. ⚠️ Constraints & Assumptions

- IVR works only with **registered mobile numbers** (validated at grievance submission)
- Field officer must have **smartphone with GPS** for photo upload
- GPS tolerance radius: **100 meters** (configurable per grievance type)
- IVR retry attempts: **3 times over 48 hours** before auto-reopen
- Default language: **Gujarati**, fallback to Hindi/English
- Mock data used until backend is integrated (Phase 1)

---

## 11. 🔐 Security & Compliance

- All evidence (photo + GPS + voice) **immutable & timestamped** (hash-stored)
- Role-based access control (RBAC) — strict separation of duties
- IVR recordings stored encrypted (AES-256)
- Aadhaar/personal data masked in non-Collector views
- Audit logs for every status change (Jan Sunwai compliance)

---

## 12. 🎤 IVR Script (Gujarati Sample)

```
"નમસ્તે, સ્વાગત પોર્ટલ તરફથી ફોન છે. તમારી ફરિયાદ નંબર [XXX] 
વિભાગ દ્વારા ઉકેલાયેલી જાહેર કરવામાં આવી છે. 
જો સમસ્યા ખરેખર હલ થઈ ગઈ હોય તો કૃપા કરીને 1 દબાવો. 
જો સમસ્યા હજી પણ છે તો 2 દબાવો."
```

---

## 13. ✅ Success Metrics

- 📈 % grievances with verified resolution (target: >85%)
- 📉 Reduction in fake "resolved" markings (target: 70% drop)
- 🕐 Avg verification cycle time (target: <48 hrs)
- 📞 IVR pickup rate (target: >75%)
- ⭐ Citizen satisfaction (post-IVR survey)

---

## 14. 📌 References

- Gujarat Swagat Portal: https://swagat.gujarat.gov.in
- Twilio Voice IVR Docs
- Google Maps Geocoding API
- Jan Sunwai Audit Guidelines
```

---

## 📄 TASK.md

```markdown
# TASK.md
## Swagat AI Verification Layer — Task Tracker

> **Last Updated:** [Auto-update on each session]  
> **Reference:** PLANNING.md for architecture & decisions

---

## 🟢 ACTIVE SPRINT — Phase 1: Frontend with Mock Data

### 🔧 Setup & Foundation
- [ ] Initialize Vite + React project with TailwindCSS
- [ ] Setup folder structure as per PLANNING.md
- [ ] Install dependencies (react-router-dom, redux/zustand, shadcn/ui, recharts, react-i18next)
- [ ] Create base layout (Navbar + Footer)
- [ ] Setup Gujarati/Hindi/English i18n locale files
- [ ] Create mockData folder with sample grievances, users, departments

### 🔐 Authentication Module
- [ ] Build Landing/Login page with role selector (Citizen / Department / Collector)
- [ ] **Citizen Login** — Mobile number + OTP screen (mock OTP: 123456)
- [ ] **Department Admin Login** — Username + Password + OTP screen
- [ ] **Collector Login** — Secure username + Password + OTP
- [ ] Build OTP verification component (6-digit input, resend timer)
- [ ] Implement protected routes based on role
- [ ] Add logout functionality

### 👤 Citizen Portal
- [ ] Citizen Dashboard layout (stats cards: Submitted / Pending / Resolved / Reopened)
- [ ] **Grievance Submission Form** with fields:
  - Category dropdown (Roads, Water, Electricity, Sanitation, etc.)
  - Description (textarea)
  - Location (auto-fetch + manual entry)
  - Photo upload (optional)
  - Mobile number (for IVR)
- [ ] **AI Chatbot** for guided grievance submission
  - Conversation flow (category → details → location → confirm)
  - Quick-reply buttons in Gujarati
- [ ] Grievance list view (with status badges)
- [ ] Grievance detail page (timeline view)
- [ ] **IVR Simulation UI** — mock "Incoming Call" modal with 1/2 keypress
- [ ] Footer with contact info, helpline, FAQs, social links

### 🏢 Department Admin Portal
- [ ] Department Dashboard (assigned grievances list)
- [ ] Filter & search grievances (by status, date, category)
- [ ] Grievance detail view with "Mark Resolved" button
- [ ] Resolution modal — text reply + trigger verification flow
- [ ] View department's own quality score (read-only)
- [ ] Notifications panel (new assignments, auto-reopens)

### 👮 Field Officer Portal (Mobile-first)
- [ ] Task list view (assigned verification tasks)
- [ ] Task detail with grievance address
- [ ] Photo upload component (camera capture + gallery)
- [ ] GPS auto-capture on photo upload (mock coordinates)
- [ ] Visit log submission form
- [ ] Submission confirmation screen

### 🏛️ Collector Dashboard
- [ ] Overview cards (Total Depts, Avg Quality Score, Pending Verifications, Auto-Reopens)
- [ ] Department quality score leaderboard (Recharts bar chart)
- [ ] Color-coded score indicators (🟢🟡🔴)
- [ ] Failed verifications drill-down table
- [ ] Audit packet viewer (photo + GPS map + voice player mock)
- [ ] Escalation action button

### 🎨 UI/UX Polish
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading skeletons & empty states
- [ ] Toast notifications (success/error/warning)
- [ ] Dark mode toggle (optional)
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## 🔵 BACKLOG — Phase 2+: Backend & Integration

### Backend Setup
- [ ] Initialize Node.js + Express project
- [ ] Setup MongoDB connection + schemas (User, Grievance, Department, Verification, AuditLog)
- [ ] Implement JWT authentication
- [ ] Integrate Twilio/MSG91 for real OTP
- [ ] REST API endpoints for all CRUD operations
- [ ] Role-based middleware

### Verification Engine
- [ ] Build verification trigger service
- [ ] Independent department assignment logic (no self-certification)
- [ ] Twilio Voice IVR integration (Gujarati TTS)
- [ ] IVR keypress webhook handler
- [ ] GPS validation service (Haversine + Google Maps)
- [ ] Auto-reopen logic with locking mechanism
- [ ] BullMQ job queue for async tasks

### Scoring & Audit
- [ ] Department quality score calculation cron job
- [ ] Real-time score updates via WebSocket
- [ ] Audit packet generator (PDF export)
- [ ] Jan Sunwai-ready report endpoint

### File Storage
- [ ] Cloudinary integration for photo uploads
- [ ] Image hash storage for tamper-proof evidence
- [ ] Voice recording storage (encrypted)

### Deployment
- [ ] Frontend deploy to Vercel
- [ ] Backend deploy to Render/Railway
- [ ] MongoDB Atlas setup
- [ ] Environment variable management
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🟡 MILESTONES

| Milestone | Target Date | Status |
|-----------|------------|--------|
| M1: Frontend skeleton with auth flow | Week 1 | 🔲 |
| M2: All 4 portals functional with mock data | Week 2 | 🔲 |
| M3: Backend API + DB integration | Week 3 | 🔲 |
| M4: IVR + GPS verification working | Week 4 | 🔲 |
| M5: Collector dashboard live with real scoring | Week 5 | 🔲 |
| M6: End-to-end demo ready | Week 6 | 🔲 |

---

## 🐛 DISCOVERED MID-PROCESS
> Add new tasks/issues here as they emerge during development

- [ ] (Example) Add reCAPTCHA on login to prevent OTP abuse
- [ ] (Example) Handle edge case: complainant doesn't pick IVR after 3 retries

---

## ✅ COMPLETED
> Move tasks here once done with date

- [x] Created PLANNING.md and TASK.md — [Today's Date]

---

## 📝 NOTES FOR AI ASSISTANT

- Always reference **PLANNING.md** before generating code
- Use **mock data** in Phase 1 — do NOT call real APIs yet
- Follow folder structure strictly
- Default UI language: **Gujarati**, with English/Hindi toggle
- Maintain **role separation** at all times (no shared components leaking access)
- Update this TASK.md after every completed sub-task
```

---

## 🎯 How to Use These Files

**At the start of every new AI conversation, prompt:**
> "Use the structure and decisions outlined in **PLANNING.md**. Refer to **TASK.md** for current tasks. Let's work on [specific task]."

**To update tasks, prompt:**
> "Update **TASK.md** to mark 'Citizen Login' as done and add 'Add password strength meter' as a new task."

**Next Step:** Want me to start with **Phase 1 — Setup & Foundation** (Vite + React + Tailwind setup with folder structure and mock data)? 🚀


I'll implement Phase 1 step by step, setting up the foundation and authentication flow with mock data.

## Phase 1: Project Setup & Authentication

### 1. Initialize Vite + React Project

```bash
npm create vite@latest swagat-verification-layer -- --template react
cd swagat-verification-layer
npm install
```

### 2. Install Dependencies

```bash
npm install react-router-dom tailwindcss postcss autoprefixer @reduxjs/toolkit react-redux recharts lucide-react react-i18next i18next clsx tailwind-merge class-variance-authority
npx tailwindcss init -p
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast
```

### 3. Configure Tailwind & Shadcn

Update `tailwind.config.js` and `vite.config.js`. Then run shadcn init.

I'll provide the essential files.

---

### Project Structure Creation

```
swagat-verification-layer/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── ui/               (shadcn components)
│   │   └── ...
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── OtpVerification.jsx
│   │   │   └── RoleSelector.jsx
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── GrievanceForm.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── department/
│   │   │   └── DepartmentDashboard.jsx
│   │   ├── field/
│   │   │   └── FieldOfficerTasks.jsx
│   │   └── collector/
│   │       └── CollectorDashboard.jsx
│   ├── store/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   └── grievanceSlice.js
│   ├── services/
│   │   └── mockApi.js
│   ├── mockData/
│   │   ├── grievances.js
│   │   ├── users.js
│   │   └── departments.js
│   ├── locales/
│   │   ├── gu.json
│   │   ├── en.json
│   │   └── hi.json
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── ...
```

Now I'll provide key files.

---

#### `src/mockData/users.js`

```javascript
export const users = [
  {
    id: 'citizen1',
    mobile: '9876543210',
    name: 'અમિત પટેલ',
    role: 'citizen',
    otp: '123456'
  },
  {
    id: 'dept1',
    username: 'rbd_officer',
    password: 'password123',
    name: 'શ્રી રમેશભાઈ',
    role: 'department',
    department: 'Roads & Buildings',
    otp: '123456'
  },
  {
    id: 'collector1',
    username: 'collector_ahm',
    password: 'collector123',
    name: 'શ્રી કલેક્ટર સાહેબ',
    role: 'collector',
    district: 'Ahmedabad',
    otp: '123456'
  },
  {
    id: 'field1',
    username: 'field_officer1',
    password: 'field123',
    name: 'મહેશ કુમાર',
    role: 'field',
    department: 'Roads & Buildings',
    otp: '123456'
  }
];
```

#### `src/mockData/grievances.js`

```javascript
export const grievances = [
  {
    id: 'GRV001',
    complainantMobile: '9876543210',
    category: 'Roads',
    description: 'પાણી ભરાય છે રોડ પર, ખાડા પડી ગયા છે',
    location: {
      address: 'મણિનગર, અમદાવાદ',
      lat: 23.0225,
      lng: 72.5714
    },
    status: 'pending', // pending, resolved_pending_verification, verified_resolved, auto_reopened
    department: 'Roads & Buildings',
    submittedAt: '2025-03-15T10:30:00Z',
    resolutionAttempts: []
  },
  {
    id: 'GRV002',
    complainantMobile: '9876543211',
    category: 'Water Supply',
    description: 'પાણી નથી આવતું છેલ્લા 2 દિવસથી',
    location: {
      address: 'સેટેલાઇટ, અમદાવાદ',
      lat: 23.0300,
      lng: 72.5200
    },
    status: 'verified_resolved',
    department: 'Water Supply',
    submittedAt: '2025-03-10T08:00:00Z',
    resolutionAttempts: [
      {
        attemptAt: '2025-03-16T14:00:00Z',
        officerId: 'field1',
        photoUrl: 'https://via.placeholder.com/300',
        gpsLog: { lat: 23.0301, lng: 72.5201 },
        ivrConfirmed: true,
        ivrTimestamp: '2025-03-16T15:30:00Z'
      }
    ]
  }
];
```

#### `src/locales/gu.json`

```json
{
  "common": {
    "welcome": "સ્વાગત પોર્ટલમાં આપનું સ્વાગત છે",
    "login": "લૉગિન",
    "logout": "લૉગઆઉટ",
    "submit": "સબમિટ કરો",
    "cancel": "રદ કરો"
  },
  "auth": {
    "mobileNumber": "મોબાઈલ નંબર",
    "enterOtp": "OTP દાખલ કરો",
    "verifyOtp": "OTP ચકાસો",
    "username": "વપરાશકર્તા નામ",
    "password": "પાસવર્ડ"
  },
  "citizen": {
    "dashboard": "નાગરિક ડેશબોર્ડ",
    "submitGrievance": "ફરિયાદ નોંધાવો",
    "myGrievances": "મારી ફરિયાદો"
  }
}
```

#### `src/locales/en.json` and `hi.json` (similar structure)

---

### Main App Setup

#### `src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { store } from './store/store';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

#### `src/i18n.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import gu from './locales/gu.json';
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    gu: { translation: gu },
    en: { translation: en },
    hi: { translation: hi }
  },
  lng: 'gu', // default Gujarati
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
```

#### `src/App.jsx`

```jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import CollectorDashboard from './pages/collector/CollectorDashboard';
import FieldOfficerTasks from './pages/field/FieldOfficerTasks';
import ProtectedRoute from './components/common/ProtectedRoute';
import GrievanceForm from './pages/citizen/GrievanceForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="verify-otp" element={<OtpVerification />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route path="citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="citizen/submit" element={<GrievanceForm />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['department']} />}>
          <Route path="department/dashboard" element={<DepartmentDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['field']} />}>
          <Route path="field/tasks" element={<FieldOfficerTasks />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['collector']} />}>
          <Route path="collector/dashboard" element={<CollectorDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
```

---

### Redux Store Slices

#### `src/store/store.js`

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import grievanceReducer from './grievanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer
  }
});
```

#### `src/store/authSlice.js`

```javascript
import { createSlice } from '@reduxjs/toolkit';
import { users } from '../mockData/users';

const initialState = {
  user: null,
  isAuthenticated: false,
  tempMobile: null,
  tempUserData: null // store user data during OTP flow
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTempMobile: (state, action) => {
      state.tempMobile = action.payload;
    },
    setTempUserData: (state, action) => {
      state.tempUserData = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.tempMobile = null;
      state.tempUserData = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    clearTemp: (state) => {
      state.tempMobile = null;
      state.tempUserData = null;
    }
  }
});

export const { setTempMobile, setTempUserData, loginSuccess, logout, clearTemp } = authSlice.actions;
export default authSlice.reducer;
```

---

### Authentication Pages

#### `src/pages/auth/Login.jsx`

```jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setTempMobile, setTempUserData } from '../../store/authSlice';
import { users } from '../../mockData/users';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCitizenLogin = (e) => {
    e.preventDefault();
    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      setError('માન્ય મોબાઈલ નંબર દાખલ કરો');
      return;
    }
    
    const user = users.find(u => u.mobile === mobile && u.role === 'citizen');
    if (!user) {
      setError('આ નંબર પર કોઈ યુઝર નથી');
      return;
    }
    
    dispatch(setTempMobile(mobile));
    dispatch(setTempUserData(user));
    navigate('/verify-otp', { state: { role: 'citizen' } });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // For demo, we treat department, field, collector as admin roles
    const user = users.find(u => 
      u.username === username && 
      u.password === password && 
      ['department', 'field', 'collector'].includes(u.role)
    );
    if (!user) {
      setError('ખોટું યુઝરને�મ અથવા પાસવર્ડ');
      return;
    }
    
    dispatch(setTempUserData(user));
    navigate('/verify-otp', { state: { role: user.role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('common.welcome')}
          </h2>
        </div>
        
        {/* Role Tabs */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setRole('citizen')}
            className={`px-4 py-2 font-medium rounded-md ${role === 'citizen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            નાગરિક
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-4 py-2 font-medium rounded-md ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            અધિકારી / કલેક્ટર
          </button>
        </div>
        
        {error && <div className="text-red-600 text-center">{error}</div>}
        
        {role === 'citizen' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCitizenLogin}>
            <div>
              <label htmlFor="mobile" className="sr-only">{t('auth.mobileNumber')}</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="મોબાઈલ નંબર"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              OTP મેળવો
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">{t('auth.username')}</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="યુઝરને�મ"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">{t('auth.password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="પાસવર્ડ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              લૉગિન કરો
            </button>
          </form>
        )}
        
        <div className="text-sm text-center text-gray-500">
          મોક OTP: 123456 (કોઈપણ લોગિન માટે)
        </div>
      </div>
    </div>
  );
}
```

#### `src/pages/auth/OtpVerification.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginSuccess, clearTemp } from '../../store/authSlice';

export default function OtpVerification() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const tempUserData = useSelector(state => state.auth.tempUserData);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  
  const role = location.state?.role || 'citizen';
  
  useEffect(() => {
    if (!tempUserData) {
      navigate('/login');
    }
  }, [tempUserData, navigate]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleVerify = (e) => {
    e.preventDefault();
    // Mock OTP validation: accept '123456'
    if (otp === '123456') {
      dispatch(loginSuccess(tempUserData));
      
      // Redirect based on role
      switch (tempUserData.role) {
        case 'citizen':
          navigate('/citizen/dashboard');
          break;
        case 'department':
          navigate('/department/dashboard');
          break;
        case 'field':
          navigate('/field/tasks');
          break;
        case 'collector':
          navigate('/collector/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError('ખોટો OTP. ફરી પ્રયાસ કરો.');
    }
  };
  
  const handleResend = () => {
    setTimer(30);
    // Mock resend
  };
  
  if (!tempUserData) return null;
  
  const identifier = tempUserData.mobile 
    ? `+91 ${tempUserData.mobile}` 
    : tempUserData.username;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OTP ચકાસણી
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {identifier} પર OTP મોકલવામાં આવ્યો છે
          </p>
        </div>
        
        {error && <div className="text-red-600 text-center">{error}</div>}
        
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="otp" className="sr-only">{t('auth.enterOtp')}</label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="______"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('auth.verifyOtp')}
          </button>
        </form>
        
        <div className="text-center">
          {timer > 0 ? (
            <span className="text-gray-500">OTP ફરીથી મોકલો ({timer} સેકંડ)</span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-800"
            >
              OTP ફરીથી મોકલો
            </button>
          )}
        </div>
        
        <button
          onClick={() => {
            dispatch(clearTemp());
            navigate('/login');
          }}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );
}
```

---

### Layout and Protected Route

#### `src/components/common/Layout.jsx`

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

#### `src/components/common/Navbar.jsx`

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/authSlice';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-700">સ્વાગત AI</span>
              <span className="ml-2 text-sm text-gray-500">ચકાસણી સ્તર</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="text-sm border rounded p-1"
            >
              <option value="gu">ગુજરાતી</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">નમસ્તે, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                {t('common.login')}
              </Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white border-t">
          <div className="space-y-2">
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="block w-full text-sm border rounded p-1"
            >
              <option value="gu">ગુજરાતી</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            
            {isAuthenticated ? (
              <>
                <div className="text-gray-700">નમસ્તે, {user.name}</div>
                <button
                  onClick={handleLogout}
                  className="block text-red-600"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-blue-600">
                {t('common.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
```

#### `src/components/common/Footer.jsx`

```jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">સંપર્ક કરો</h3>
            <p>હેલ્પલાઈન: 1800-XXX-XXXX</p>
            <p>ઈમેલ: swagat-ai@gujarat.gov.in</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">મહત્વપૂર્ણ લિંક્સ</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">ગુજરાત સરકાર</a></li>
              <li><a href="#" className="hover:underline">સ્વાગત પોર્ટલ</a></li>
              <li><a href="#" className="hover:underline">ગોપનીયતા નીતિ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">ફોલો કરો</h3>
            <div className="flex space-x-4">
              <span>Twitter</span>
              <span>Facebook</span>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          © 2025 સ્વાગત AI ચકાસણી સ્તર. સર્વાધિકાર સુરક્ષિત.
        </div>
      </div>
    </footer>
  );
}
```

#### `src/components/common/ProtectedRoute.jsx`

```jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'citizen': return <Navigate to="/citizen/dashboard" replace />;
      case 'department': return <Navigate to="/department/dashboard" replace />;
      case 'field': return <Navigate to="/field/tasks" replace />;
      case 'collector': return <Navigate to="/collector/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
}
```

---

### Placeholder Dashboards (to be expanded)

#### `src/pages/citizen/CitizenDashboard.jsx`

```jsx
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { grievances } from '../../mockData/grievances';

export default function CitizenDashboard() {
  const { user } = useSelector(state => state.auth);
  
  // Filter grievances for this citizen
  const myGrievances = grievances.filter(g => g.complainantMobile === user.mobile);
  
  const stats = {
    total: myGrievances.length,
    resolved: myGrievances.filter(g => g.status === 'verified_resolved').length,
    pending: myGrievances.filter(g => g.status === 'pending').length,
    reopened: myGrievances.filter(g => g.status === 'auto_reopened').length
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">નાગરિક ડેશબોર્ડ</h1>
        <Link 
          to="/citizen/submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          નવી ફરિયાદ નોંધાવો
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="કુલ ફરિયાદો" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label="ઉકેલાયેલ" value={stats.resolved} color="green" />
        <StatCard icon={Clock} label="પેન્ડિંગ" value={stats.pending} color="yellow" />
        <StatCard icon={AlertCircle} label="ફરી ખુલ્લી" value={stats.reopened} color="red" />
      </div>
      
      {/* Grievances List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg font-medium">મારી ફરિયાદો</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {myGrievances.map(grievance => (
            <li key={grievance.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{grievance.id} - {grievance.category}</p>
                  <p className="text-sm text-gray-500">{grievance.description.substring(0, 60)}...</p>
                  <p className="text-xs text-gray-400">{new Date(grievance.submittedAt).toLocaleDateString('gu-IN')}</p>
                </div>
                <StatusBadge status={grievance.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };
  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      <div className="flex items-center">
        <Icon className="h-8 w-8 mr-3" />
        <div>
          <p className="text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'પેન્ડિંગ', color: 'bg-yellow-100 text-yellow-800' },
    verified_resolved: { label: 'ઉકેલાયેલ', color: 'bg-green-100 text-green-800' },
    auto_reopened: { label: 'ફરી ખુલ્લી', color: 'bg-red-100 text-red-800' },
    resolved_pending_verification: { label: 'ચકાસણી બાકી', color: 'bg-blue-100 text-blue-800' }
  };
  const { label, color } = statusMap[status] || { label: status, color: 'bg-gray-100' };
  return <span className={`px-2 py-1 text-xs rounded-full ${color}`}>{label}</span>;
}
```

---

## Next Steps

The foundation is set. Now we can:
1. Create the **Grievance Submission Form** with location picker and photo upload (mock)
2. Build the **Chatbot** component for guided submission
3. Implement **Department Dashboard** with "Mark Resolved" trigger
4. Implement **Field Officer Task View** with geo-tagged photo upload simulation
5. Build **Collector Dashboard** with department quality scores chart

Would you like me to continue with any specific component next?