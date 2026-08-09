import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import QueueOperations from './pages/QueueOperations';
import DoctorSection from './pages/DoctorSection.jsx';
import ReceptionistSection from './pages/ReceptionistSection.jsx';
import AdminPatientsection from './pages/AdminPatientSection.jsx';



function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/queue-operations" element={<QueueOperations />} />
            <Route path="/admin/doctors" element={<DoctorSection />} />
            <Route path="/admin/receptionist" element={<ReceptionistSection/>} />
            <Route path="/admin/patient" element={<AdminPatientsection/>} />


        </Routes>
      </BrowserRouter>
  );
}

export default App;