import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";//NOTE: Admin dashboard single-page 'activeTab' state approach par kaam karta hai. Yahan alag se App.jsx me routes banane ke bajaye, saare admin sections (Control, Queue, Doctors, Reception, Patients, Settings) yahi is component ke andar dynamically render hote hain.
import PatientDashboard from "./pages/patient/PatientDashboard"; // Apne file path ke hisaab se import karein
import BookAppointment from "./pages/patient/BookAppointment"; // 👈 Ye import karein
import MyTokens from "./pages/patient/MyTokens"; // 👈 Ye import karein
import AppointmentHistory from "./pages/patient/AppointmentHistory"; // 👈 Ye import karein
import PatientProfile from "./pages/patient/PatientProfile";




function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book-appointment" element={<BookAppointment />} /> {/* 👈 Ye route add karein */}
            <Route path="/patient/mytokens" element={<MyTokens/>} /> {/* 👈 Ye route add karein */}
            <Route path="/patient/appointmenthistory" element={<AppointmentHistory/>} /> {/* 👈 Ye route add karein */}
            <Route path="/patient/profile" element={<PatientProfile />} />


        </Routes>
      </BrowserRouter>
  );
}

export default App;