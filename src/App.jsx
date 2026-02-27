import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from "./Pages/Contact"
import Login from './Pages/Login'
import Register from './Pages/Register'
import Myappointment from './Pages/Myappointment'
import Appointment from './Pages/Appointment'

import AdminDashboard from './Pages/AdminDashboard'
import DoctorDashboard from './Pages/DoctorDashboard'
import PatientDashboard from './Pages/PatientDahboard'
import Doctors from './Pages/Doctors'
import MyProfileDoctor from './Pages/MyProfileDoctor'
import MyProfileAdmin from './Pages/MyProfileAdmin'
import MyProfilePatient from './Pages/MyProfilePatient'
import Header from './component/Header'
import Footer from './component/Footer'

import AdminAppointment from './component/AdminAppointment'
import ProtectedRoute from './ProtectedRoute'
import PatientAppointments from './component/PatientAppointments'
import DAppointment from './component/DAppointment'
import Totalpatient from './component/Totalpatient'
import PendingAppointment from './component/PendingAppointment'
import Pendingdoctors from './component/Pendingdoctors'
import FemalePatient from './component/FemalePatient'
import MalePatient from './component/MalePatient'


function App() {
  return (
    <div>
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={ <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/doctor" element={ <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/patient" element={ <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/myprofiledoctor" element={<ProtectedRoute role="doctor"><MyProfileDoctor /></ProtectedRoute>} />
          <Route path="/myprofileadmin" element={<ProtectedRoute role="admin"><MyProfileAdmin /></ProtectedRoute>} />
          <Route path="/myprofilepatient" element={<ProtectedRoute role="patient"><MyProfilePatient /></ProtectedRoute>} />
          <Route path="/myappointment" element={<Myappointment />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/doctors" element={<Doctors />} />
           <Route path="/pendingappointment" element={<PendingAppointment/>}/>
          <Route path="/adminappointment" element={<AdminAppointment />} />
                    <Route path="/patientappointment" element={<PatientAppointments />} />
                                        <Route path="/appointmentss" element={<DAppointment />} />
                                                  <Route path="/totalpatient" element={<Totalpatient />} />
           <Route path="/pendingdoctors" element={<Pendingdoctors/>}/>
           <Route path="/femalepatients" element={<FemalePatient/>}/>
           <Route path="/malepatients" element={<MalePatient/>}/>








        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  )
}

export default App
