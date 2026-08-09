import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'patients'

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to fetch appointments";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/doctor/appointments/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to update status";
      toast.error(msg);
    }
  };

  // --- Dynamic Stats ---
  const todayStr = new Date().toISOString().split('T')[0];
  const todayConfirmedCount = appointments.filter(
    a => (a.status === 'CONFIRMED' || a.status === 'UPCOMING') && a.appointmentDate === todayStr
  ).length;

  const pendingRequestsCount = appointments.filter(
    a => a.status === 'PENDING'
  ).length;

  const totalPatientsCount = new Set(appointments.map(a => a.patientId)).size;

  // --- Extract Distinct Patients for "My Patients" Tab ---
  const getPatientRecords = () => {
    const patientsMap = {};
    appointments.forEach(apt => {
      const pId = apt.patientId;
      if (!patientsMap[pId]) {
        patientsMap[pId] = {
          id: pId,
          patientName: apt.patientName,
          age: apt.patientAge,
          gender: apt.patientGender,
          lastVisit: apt.appointmentDate,
          condition: apt.reason || 'General Consultation'
        };
      } else {
        // If this appointment is newer, update the last visit date & reason
        const currentLastVisit = new Date(patientsMap[pId].lastVisit);
        const aptDate = new Date(apt.appointmentDate);
        if (aptDate > currentLastVisit) {
          patientsMap[pId].lastVisit = apt.appointmentDate;
          patientsMap[pId].condition = apt.reason || 'General Consultation';
        }
      }
    });
    return Object.values(patientsMap);
  };

  const patientRecords = getPatientRecords();

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'UPCOMING':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getFriendlyStatus = (status) => {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-24 font-sans">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 sm:pb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Doctor Portal: <span className="text-teal-600">Dr. {user?.name || 'Healthcare Professional'}</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">
            Manage your patients, view appointments, and consult.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'appointments' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Appointments
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'patients' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Patients
          </button>
        </div>
      </div>

      {/* --- Quick Stats --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
          <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-1">Today's Appointments</p>
          <p className="text-3xl font-black text-slate-900">{todayConfirmedCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Pending Requests</p>
          <p className="text-3xl font-black text-slate-900">{pendingRequestsCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">Total Unique Patients</p>
          <p className="text-3xl font-black text-slate-900">{totalPatientsCount}</p>
        </div>
      </div>

      {/* --- View 1: Appointments --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">📅</span>
            Upcoming Schedule
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-500 rounded-full"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getStatusBadgeStyle(apt.status)}`}>
                        {getFriendlyStatus(apt.status)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900">{apt.patientName}</h3>
                    <p className="text-sm font-bold text-teal-600 mt-1">
                      Reason: {apt.reason || 'General Consultation'} (Age: {apt.patientAge || 'N/A'}, {apt.patientGender || 'N/A'})
                    </p>
                    
                    <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center text-slate-600 text-sm font-semibold">
                        <span className="w-5 text-slate-400 mr-2">📅</span> {apt.appointmentDate}
                      </div>
                      <div className="flex items-center text-slate-600 text-sm font-semibold">
                        <span className="w-5 text-slate-400 mr-2">🕒</span> {apt.appointmentTime}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    {apt.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                        className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-teal-700 transition-all"
                      >
                        Accept
                      </button>
                    )}
                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'UPCOMING') && (
                      <button 
                        onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                        className="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-slate-400 font-bold text-lg">No appointments found.</p>
            </div>
          )}
        </div>
      )}

      {/* --- View 2: Patients --- */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">👥</span>
            Patient Records
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-500 rounded-full"></div>
            </div>
          ) : patientRecords.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-100/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                      <th className="p-6">Patient</th>
                      <th className="p-6">Demographics</th>
                      <th className="p-6">Last Visit</th>
                      <th className="p-6">Latest Condition / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {patientRecords.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 font-bold text-slate-900">{p.patientName}</td>
                        <td className="p-6">{p.gender || 'N/A'}, {p.age || 'N/A'} Years</td>
                        <td className="p-6">{p.lastVisit}</td>
                        <td className="p-6"><span className="text-teal-600 font-bold">{p.condition}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-slate-400 font-bold text-lg">No patient records found.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
