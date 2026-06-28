import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// --- Mock Initial Data ---
const MOCK_STATS = {
  totalPatients: 1245,
  activeSessions: 12
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add'
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Add Doctor Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: ''
  });

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/doctors/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to fetch doctors";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialty
      };

      const response = await axios.post(`${API_URL}/admin/doctors`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success(`${formData.name} added successfully!`);
        // Reset form and switch tab
        setFormData({ name: '', email: '', password: '', specialty: '' });
        setActiveTab('manage');
        fetchDoctors();
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to add doctor";
      toast.error(msg);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the platform?`)) {
      try {
        const response = await axios.delete(`${API_URL}/admin/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          toast.error(`${name} has been removed.`);
          fetchDoctors();
        }
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to remove doctor";
        toast.error(msg);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 sm:pb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">
            Manage platform users and healthcare professionals.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'manage' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview & Manage
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'add' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            + Add Doctor
          </button>
        </div>
      </div>

      {/* --- View 1: Overview & Manage --- */}
      {activeTab === 'manage' && (
        <div className="space-y-10">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-teal-600 p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2">Total Patients</p>
              <h3 className="text-4xl font-black">{MOCK_STATS.totalPatients}</h3>
            </div>
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registered Doctors</p>
              <h3 className="text-4xl font-black">{doctors.length}</h3>
            </div>
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active AI Sessions</p>
              <h3 className="text-4xl font-black text-slate-900">{MOCK_STATS.activeSessions}</h3>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2 mb-6">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">👨‍⚕️</span>
              Manage Doctors
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full">
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900">{doc.name}</h3>
                    <p className="text-sm font-bold text-teal-600 mt-1">{doc.specialization || doc.specialty || 'General Practitioner'}</p>
                    <p className="text-xs text-slate-400 mt-1">{doc.email}</p>
                  </div>
                  
                  <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 flex-1">
                    <div className="flex items-center text-slate-600 text-sm font-semibold">
                      <span className="w-5 text-slate-400 mr-2">⭐</span> Experience: {doc.experienceYears !== undefined && doc.experienceYears !== null ? `${doc.experienceYears} Years` : (doc.experience || 'N/A')}
                    </div>
                    <div className="flex items-start text-slate-600 text-sm font-semibold">
                      <span className="w-5 text-slate-400 mr-2 mt-0.5">🏥</span> <span className="flex-1">{doc.clinicAddress || doc.location || 'Online / Remote'}</span>
                    </div>
                  </div>

                  {/* Delete Action */}
                  <div className="mt-6">
                    <button 
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-[0.98]"
                    >
                      Remove Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- View 2: Add Doctor Form --- */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
              Register New Doctor
            </h2>
          </div>
          
          <form onSubmit={handleAddDoctor} className="p-8 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Dr. John Doe"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="doctor@doctorg.com"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Temporary Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="********"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Specialty</label>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} required placeholder="e.g. Neurologist"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button type="submit" className="w-full sm:w-auto px-10 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-[0.98]">
                Create Doctor Account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;