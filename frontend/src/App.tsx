import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/Landing';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from 'sonner';
import ScanWaste from './pages/citizen/ScanWaste';
import IssueFeed from './pages/citizen/IssueFeed';
import Rewards from './pages/citizen/Rewards';
import Notifications from './pages/citizen/Notifications';
import PartnerPickups from './pages/partner/PartnerPickups';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import Completed from './pages/staff/Completed';
import MyTasks from './pages/staff/MyTasks';
import TaskMap from './pages/staff/TaskMap';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/citizen" element={<AppLayout />}>
              <Route index element={<ScanWaste />} />
              <Route path="history" element={<IssueFeed />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={['WASTE_STAFF', 'ADMIN']} />}>
            <Route path="/staff" element={<AppLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="completed" element={<Completed />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="task-map" element={<TaskMap />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={['RECYCLING_PARTNER', 'ADMIN']} />}>
            <Route path="/partner" element={<AppLayout />}>
              <Route index element={<PartnerPickups />} />
            </Route>
          </Route>
        </Routes>

        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
