import React, { useState } from 'react';

// --- Mock Data ---
const MOCK_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Sarah Jenkins", specialty: "Cardiologist", date: "Oct 24, 2024", time: "10:30 AM", status: "Upcoming" },
  { id: 2, doctor: "Dr. Arvind Kumar", specialty: "General Physician", date: "Oct 28, 2024", time: "02:00 PM", status: "Upcoming" },
  { id: 3, doctor: "Dr. Emily Chen", specialty: "Dermatologist", date: "Sep 15, 2024", time: "11:15 AM", status: "Completed" },
];

const MOCK_DOCTORS = [
  { id: 101, name: "Dr. Sarah Jenkins", specialty: "Cardiologist", experience: "12 Years", rating: "4.9", location: "City Heart Institute" },
  { id: 102, name: "Dr. Arvind Kumar", specialty: "General Physician", experience: "8 Years", rating: "4.7", location: "DoctorG Virtual Clinic" },
  { id: 103, name: "Dr. Emily Chen", specialty: "Dermatologist", experience: "15 Years", rating: "4.8", location: "SkinCare Central" },
  { id: 104, name: "Dr. Marcus Thorne", specialty: "Neurologist", experience: "20 Years", rating: "5.0", location: "Neuro Health Center" },
  { id: 105, name: "Dr. Priya Sharma", specialty: "Pediatrician", experience: "10 Years", rating: "4.9", location: "Sunrise Children's Hospital" },
  { id: 106, name: "Dr. James Wilson", specialty: "Orthopedist", experience: "14 Years", rating: "4.6", location: "Joint & Spine Clinic" },
];

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('my-appointments'); // 'my-appointments' | 'find-doctor'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter doctors based on search query
  const filteredDoctors = MOCK_DOCTORS.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 sm:pb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">
            Manage your bookings or consult with top specialists.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('my-appointments')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'my-appointments' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Appointments
          </button>
          <button 
            onClick={() => setActiveTab('find-doctor')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'find-doctor' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Find a Doctor
          </button>
        </div>
      </div>

      {/* --- View 1: My Appointments --- */}
      {activeTab === 'my-appointments' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">📅</span>
            Scheduled Visits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_APPOINTMENTS.map((apt) => (
              <div key={apt.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                    apt.status === 'Upcoming' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                
                {/* Doctor Info */}
                <h3 className="text-xl font-black text-slate-900">{apt.doctor}</h3>
                <p className="text-sm font-bold text-teal-600 mt-1">{apt.specialty}</p>
                
                {/* Date & Time Box */}
                <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center text-slate-600 text-sm font-semibold">
                    <span className="w-5 text-slate-400 mr-2">📅</span> {apt.date}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-semibold">
                    <span className="w-5 text-slate-400 mr-2">🕒</span> {apt.time}
                  </div>
                </div>

                {/* Actions */}
                {apt.status === 'Upcoming' && (
                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:border-slate-300 hover:text-slate-800 transition-all">
                      Reschedule
                    </button>
                    <button className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- View 2: Find a Doctor --- */}
      {activeTab === 'find-doctor' && (
        <div className="space-y-8">
          
          {/* Search Bar */}
          <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xl">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search Specialists</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name or specialty (e.g., Cardiologist)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2">
            <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mr-3 text-xl">🩺</span>
            Available Doctors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{doc.name}</h3>
                      <p className="text-sm font-bold text-teal-600 mt-1">{doc.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Experience</span>
                      <span className="font-semibold text-slate-700">{doc.experience}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Rating</span>
                      <span className="font-bold text-amber-500 flex items-center gap-1">⭐ {doc.rating}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 mt-0.5">Location</span>
                      <span className="font-semibold text-slate-700 flex-1">{doc.location}</span>
                    </div>
                  </div>

                  <button className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all">
                    Book Appointment
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p className="text-slate-400 font-bold text-lg">No doctors found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;