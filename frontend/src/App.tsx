
import { Route, Routes,  BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/Landing'
import Register from './pages/auth/register'
import Login from './pages/auth/login';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from 'sonner'
// Citizen
import {CitizenDashboard} from './pages/citizen/CitizenDashboard';
import IssueFeed from './pages/citizen/IssueFeed';
import Rewards from './pages/citizen/Rewards';
import Notifications from './pages/citizen/Notifications';


// Departments
// import { DepartmentAdminDashboard } from './pages/departments/DepartmentsDashboard';
import { DepartmentAdminDashboard } from './pages/departments/DepartmentsDashboard';
import DepartmentIssues from './pages/departments/DepartmentIssues';
import Reports from './pages/departments/Reports';
import StaffManagement from './pages/departments/StaffManagement';


//Staff
import { StaffDashboard } from './pages/staff/StaffDashboard';
import Completed from './pages/staff/Completed';
import MyTasks from './pages/staff/MyTasks';
import TaskMap from './pages/staff/TaskMap';
import PrivateRoute from './components/auth/PrivateRoute';
import CityOverview from './pages/superadmin/CityOverview';
import AllIssues from './pages/superadmin/AllIssues';
import Analytics from './pages/superadmin/Analytics';
import UserManagement from './pages/superadmin/UserManagement';
import Departments from './pages/superadmin/Departments';



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
              <Route index element={<CitizenDashboard />} />
              <Route path="issues" element={<IssueFeed />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>


     <Route element={<PrivateRoute allowedRoles={['DEPARTMENT_ADMIN']} />}>
             <Route path="/departments" element={<AppLayout />}>
             <Route index element={<DepartmentAdminDashboard />} /> 
             <Route path="department-issues" element={<DepartmentIssues />} />
             <Route path="reports" element={<Reports />} />
             <Route path="staff" element={<StaffManagement />} />
     </Route>
      </Route>


     <Route element={<PrivateRoute allowedRoles={['STAFF']} />}>
            <Route path="/staff" element={<AppLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="completed" element={<Completed />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="task-map" element={<TaskMap />} />
            </Route>
          </Route>

     // Super Admin Routes
    <Route element={<PrivateRoute allowedRoles={['SUPER_ADMIN']} />}>
      <Route path="/superadmin" element={<AppLayout />}>
        <Route index element={<CityOverview />} /> 
        <Route path="all-issues" element={<AllIssues />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="departments" element={<Departments />} />
        </Route>
      </Route>

  </Routes>

    <Toaster position="top-right" richColors />
  </AuthProvider>
</BrowserRouter>
  )
}

export default App
