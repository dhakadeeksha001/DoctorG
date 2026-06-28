import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// --- Mock Initial Data for Doctor ---
const MOCK_APPOINTMENTS = [
  { id: 201, patientName: "John Doe", age: 34, gender: "Male", date: "Oct 24, 2026", time: "10:30 AM", status: "Confirmed", condition: "Heart checkup" },
  { id: 202, patientName: "Alice Smith", age: 29, gender: "Female", date: "Oct 28, 2026", time: "02:00 PM", status: "Pending", condition: "Skin allergy" },
  { id: 203, patientName: "Robert Johnson", age: 45, gender: "Male", date: "Oct 30, 2026", time: "11:15 AM", status: "Confirmed", condition: "General consultation" },
];

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'patients'

  const handleStatusChange = (id, newStatus) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    toast.success(`Appointment status updated to ${newStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-24">
      
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
          <p className="text-3xl font-black text-slate-900">{appointments.filter(a => a.status === 'Confirmed').length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Pending Requests</p>
          <p className="text-3xl font-black text-slate-900">{appointments.filter(a => a.status === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">Total Care Hours</p>
          <p className="text-3xl font-black text-slate-900">48 hrs</p>
        </div>
      </div>

      {/* --- View 1: Appointments --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">📅</span>
            Upcoming Schedule
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                    apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900">{apt.patientName}</h3>
                <p className="text-sm font-bold text-teal-600 mt-1">{apt.condition} (Age: {apt.age}, {apt.gender})</p>
                
                <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center text-slate-600 text-sm font-semibold">
                    <span className="w-5 text-slate-400 mr-2">📅</span> {apt.date}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-semibold">
                    <span className="w-5 text-slate-400 mr-2">🕒</span> {apt.time}
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {apt.status === 'Pending' && (
                    <button 
                      onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                      className="flex-1 bg-teal-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-teal-700 transition-all"
                    >
                      Accept
                    </button>
                  )}
                  <button 
                    onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                    className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- View 2: Patients --- */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">👥</span>
            Patient Records
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-100/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                    <th className="p-6">Patient</th>
                    <th className="p-6">Demographics</th>
                    <th className="p-6">Last Visit</th>
                    <th className="p-6">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {appointments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-bold text-slate-900">{p.patientName}</td>
                      <td className="p-6">{p.gender}, {p.age} Years</td>
                      <td className="p-6">{p.date}</td>
                      <td className="p-6"><span className="text-teal-600 font-bold">{p.condition}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
