import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OtpVerification from './pages/auth/OtpVerification';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import GrievanceForm from './pages/citizen/GrievanceForm';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import CollectorDashboard from './pages/collector/CollectorDashboard';
import FieldOfficerTasks from './pages/field/FieldOfficerTasks';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="verify-otp" element={<OtpVerification />} />

        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route path="citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="citizen/submit" element={<GrievanceForm />} />
        </Route>

        {/* Department Routes */}
        <Route element={<ProtectedRoute allowedRoles={['department']} />}>
          <Route path="department/dashboard" element={<DepartmentDashboard />} />
        </Route>

        {/* Field Officer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['field']} />}>
          <Route path="field/tasks" element={<FieldOfficerTasks />} />
        </Route>

        {/* Collector Routes */}
        <Route element={<ProtectedRoute allowedRoles={['collector']} />}>
          <Route path="collector/dashboard" element={<CollectorDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
