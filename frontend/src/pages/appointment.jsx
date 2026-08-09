import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const TIME_SLOTS = [
  "09:00 AM",
  "09:45 AM",
  "10:30 AM",
  "11:15 AM",
  "02:00 PM",
  "02:45 PM",
  "03:30 PM",
  "04:15 PM"
];

const Appointments = () => {
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  const [activeTab, setActiveTab] = useState('my-appointments'); // 'my-appointments' | 'find-doctor'
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Modal State for Booking
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[0]);
  const [bookingReason, setBookingReason] = useState('');
  const [isBookingSubmit, setIsBookingSubmit] = useState(false);

  // Modal State for Rescheduling
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState(TIME_SLOTS[0]);
  const [isRescheduleSubmit, setIsRescheduleSubmit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch Doctors from backend
  const fetchDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const response = await axios.get(`${API_URL}/doctors/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to fetch doctors";
      toast.error(msg);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // Fetch Patient Appointments
  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const response = await axios.get(`${API_URL}/patient/appointments`, {
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
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [token]);

  // Handle Book Appointment Submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.warn("Please select a date");
      return;
    }
    setIsBookingSubmit(true);
    try {
      const payload = {
        doctorId: selectedDoctor.id,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        reason: bookingReason
      };
      const response = await axios.post(`${API_URL}/patient/appointments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        toast.success(`Successfully booked appointment with ${selectedDoctor.name}!`);
        setSelectedDoctor(null);
        setBookingDate('');
        setBookingTime(TIME_SLOTS[0]);
        setBookingReason('');
        fetchAppointments();
        setActiveTab('my-appointments');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to book appointment";
      toast.error(msg);
    } finally {
      setIsBookingSubmit(false);
    }
  };

  // Handle Reschedule Submission
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate) {
      toast.warn("Please select a date");
      return;
    }
    setIsRescheduleSubmit(true);
    try {
      const response = await axios.put(
        `${API_URL}/patient/appointments/${reschedulingAppointment.id}/reschedule?date=${rescheduleDate}&time=${rescheduleTime}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.success) {
        toast.success("Appointment rescheduled successfully!");
        setReschedulingAppointment(null);
        setRescheduleDate('');
        setRescheduleTime(TIME_SLOTS[0]);
        fetchAppointments();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to reschedule appointment";
      toast.error(msg);
    } finally {
      setIsRescheduleSubmit(false);
    }
  };

  // Handle Cancel Appointment
  const handleCancelAppointment = async (id, doctorName) => {
    if (window.confirm(`Are you sure you want to cancel your appointment with ${doctorName}?`)) {
      try {
        const response = await axios.put(`${API_URL}/patient/appointments/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          toast.info("Appointment has been cancelled.");
          fetchAppointments();
        }
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || error.message || "Failed to cancel appointment";
        toast.error(msg);
      }
    }
  };

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const activeAppointments = appointments.filter(
    (apt) => apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'UPCOMING'
  );
  
  const historyAppointments = appointments.filter(
    (apt) => apt.status === 'CANCELLED' || apt.status === 'COMPLETED'
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
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">📅</span>
              Scheduled Visits
            </h2>
            {historyAppointments.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {showHistory ? "✕ Hide Past & Cancelled" : "📜 View Past & Cancelled"}
              </button>
            )}
          </div>
          
          {isLoadingAppointments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-500 rounded-full"></div>
            </div>
          ) : activeAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAppointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getStatusBadgeStyle(apt.status)}`}>
                      {getFriendlyStatus(apt.status)}
                    </span>
                  </div>
                  
                  {/* Doctor Info */}
                  <h3 className="text-xl font-black text-slate-900">{apt.doctorName}</h3>
                  <p className="text-sm font-bold text-teal-600 mt-1">{apt.doctorSpecialty}</p>
                  
                  {/* Date & Time Box */}
                  <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center text-slate-600 text-sm font-semibold">
                      <span className="w-5 text-slate-400 mr-2">📅</span> {apt.appointmentDate}
                    </div>
                    <div className="flex items-center text-slate-600 text-sm font-semibold">
                      <span className="w-5 text-slate-400 mr-2">🕒</span> {apt.appointmentTime}
                    </div>
                  </div>

                  {/* Actions */}
                  {(apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'UPCOMING') && (
                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={() => {
                          setReschedulingAppointment(apt);
                          setRescheduleDate(apt.appointmentDate);
                          setRescheduleTime(apt.appointmentTime);
                        }}
                        className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:border-slate-300 hover:text-slate-800 transition-all"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(apt.id, apt.doctorName)}
                        className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-slate-400 font-bold text-lg">No active appointments scheduled.</p>
            </div>
          )}


          {/* Past & Cancelled Section */}
          {showHistory && historyAppointments.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-200 animate-in fade-in duration-500">
              <h3 className="text-lg font-black text-slate-700 flex items-center px-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-sm">📜</span>
                Past & Cancelled Visits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyAppointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg shadow-slate-100/30 opacity-75 hover:opacity-100 transition-all duration-300">
                    
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getStatusBadgeStyle(apt.status)}`}>
                        {getFriendlyStatus(apt.status)}
                      </span>
                    </div>
                    
                    {/* Doctor Info */}
                    <h3 className="text-xl font-black text-slate-900">{apt.doctorName}</h3>
                    <p className="text-sm font-bold text-teal-600 mt-1">{apt.doctorSpecialty}</p>
                    
                    {/* Date & Time Box */}
                    <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center text-slate-600 text-sm font-semibold">
                        <span className="w-5 text-slate-400 mr-2">📅</span> {apt.appointmentDate}
                      </div>
                      <div className="flex items-center text-slate-600 text-sm font-semibold">
                        <span className="w-5 text-slate-400 mr-2">🕒</span> {apt.appointmentTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

          {isLoadingDoctors ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-500 rounded-full"></div>
            </div>
          ) : (
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
                        <p className="text-sm font-bold text-teal-600 mt-1">{doc.specialization || doc.specialty || 'General Practitioner'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center text-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Experience</span>
                        <span className="font-semibold text-slate-700">
                          {doc.experienceYears !== null && doc.experienceYears !== undefined 
                            ? `${doc.experienceYears} Years` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Rating</span>
                        <span className="font-bold text-amber-500 flex items-center gap-1">⭐ {doc.rating || '4.8'}</span>
                      </div>
                      <div className="flex items-start text-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 mt-0.5">Location</span>
                        <span className="font-semibold text-slate-700 flex-1">
                          {doc.clinicAddress || 'Online'}
                        </span>
                      </div>
                      <div className="flex items-start text-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 mt-0.5">Fee</span>
                        <span className="font-semibold text-slate-700 flex-1 font-bold text-teal-600">
                          {doc.consultationFee !== null && doc.consultationFee !== undefined 
                            ? `$${doc.consultationFee}` 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all"
                    >
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
          )}
        </div>
      )}

      {/* --- Book Appointment Modal --- */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-teal-400 tracking-widest">Appointment Booking</p>
                <h3 className="text-xl font-black">{selectedDoctor.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Time Slot</label>
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        bookingTime === slot 
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-100' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reason for Visit / Symptoms</label>
                <textarea 
                  placeholder="e.g. Fever, muscle pain, general checkup..."
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  rows="3"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 py-3.5 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isBookingSubmit}
                  className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:bg-slate-300"
                >
                  {isBookingSubmit ? 'Booking...' : 'Confirm Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Reschedule Modal --- */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-amber-400 tracking-widest">Reschedule Appointment</p>
                <h3 className="text-xl font-black">{reschedulingAppointment.doctorName}</h3>
              </div>
              <button 
                onClick={() => setReschedulingAppointment(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select New Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select New Time Slot</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRescheduleTime(slot)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        rescheduleTime === slot 
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-100' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setReschedulingAppointment(null)}
                  className="flex-1 py-3.5 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isRescheduleSubmit}
                  className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:bg-slate-300"
                >
                  {isRescheduleSubmit ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;