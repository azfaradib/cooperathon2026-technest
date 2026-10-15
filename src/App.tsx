import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import CustomerLayout from "./layout/CustomerLayout";
import DashboardLayout from "./layout/DashboardLayout";
import AvailTraining from "./pages/AvailTraining";
import AuditRequests from "./pages/AuditRequests";
import CommunitySupport from "./pages/CommunitySupport";
import CommunitySupportRequest from "./pages/CommunitySupportRequest";
import CustomerHome from "./pages/CustomerHome";
import Dashboard from "./pages/Dashboard";
import FileCase from "./pages/FileCase";
import IncidentReports from "./pages/IncidentReports";
import Login from "./pages/Login";
import MyRequests from "./pages/MyRequests";
import Notifications from "./pages/Notifications";
import RequestAudit from "./pages/RequestAudit";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import Setup from "./pages/Setup";
import TrainingPrograms from "./pages/TrainingPrograms";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />

          <Route
            element={
              <RequireAuth role="admin">
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="training" element={<TrainingPrograms />} />
            <Route path="incidents" element={<IncidentReports />} />
            <Route path="audits" element={<AuditRequests />} />
            <Route path="support" element={<CommunitySupport />} />
            <Route path="resources" element={<Resources />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route
            element={
              <RequireAuth role="customer">
                <CustomerLayout />
              </RequireAuth>
            }
          >
            <Route path="customer" element={<CustomerHome />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="file-case" element={<FileCase />} />
            <Route path="request-audit" element={<RequestAudit />} />
            <Route path="avail-training" element={<AvailTraining />} />
            <Route
              path="community-support"
              element={<CommunitySupportRequest />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
