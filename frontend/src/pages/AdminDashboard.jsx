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

  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add' | 'resources'
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingList, setViewingList] = useState('doctors'); // 'doctors' | 'patients'
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeSessions: 0,
    totalDoctors: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // State for Add Doctor Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: ''
  });

  // State for Vector DB Resources
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

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

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await axios.get(`${API_URL}/medical-advice/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      const msg = error.response?.data?.message || error.message || "Failed to fetch documents";
      toast.error(msg);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchStats();
      fetchPatients();
      fetchDocuments();
    }
  }, [token]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadInputChange = (e) => {
    if (e.target.name === 'file') {
      setUploadFormData({ ...uploadFormData, file: e.target.files[0] });
    } else {
      setUploadFormData({ ...uploadFormData, [e.target.name]: e.target.value });
    }
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
        fetchStats();
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
          fetchStats();
        }
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to remove doctor";
        toast.error(msg);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.file) {
      toast.error("Please select a PDF file to upload");
      return;
    }
    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadFormData.file);
      formDataToSend.append('title', uploadFormData.title);
      if (uploadFormData.description) {
        formDataToSend.append('description', uploadFormData.description);
      }

      const response = await axios.post(`${API_URL}/medical-advice/upload`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Document uploaded successfully!");
        setUploadFormData({ title: '', description: '', file: null });
        // Reset file input element
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) fileInput.value = '';
        fetchDocuments();
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove document "${title}"?`)) {
      try {
        const response = await axios.delete(`${API_URL}/medical-advice/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          toast.error(`"${title}" has been removed.`);
          fetchDocuments();
        }
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to delete document";
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
            Manage platform users, healthcare professionals, and resources.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
          <button
            onClick={() => { setActiveTab('manage'); setShowRegistry(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'manage'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Overview & Manage
          </button>
          <button
            onClick={() => { setActiveTab('add'); setShowRegistry(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'add'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            + Add Doctor
          </button>
          <button
            onClick={() => { setActiveTab('resources'); setShowRegistry(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'resources'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* --- View 1: Overview & Manage --- */}
      {activeTab === 'manage' && (
        <div className="space-y-10">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setViewingList('patients')}
              className={`p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] ${viewingList === 'patients' ? 'bg-teal-600 ring-4 ring-teal-200' : 'bg-teal-700/80 hover:bg-teal-600'
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2">Total Patients</p>
              <h3 className="text-4xl font-black">{stats.totalPatients}</h3>
            </div>
            <div
              onClick={() => setViewingList('doctors')}
              className={`p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] ${viewingList === 'doctors' ? 'bg-slate-900 ring-4 ring-slate-400' : 'bg-slate-800 hover:bg-slate-900'
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registered Doctors</p>
              <h3 className="text-4xl font-black">{stats.totalDoctors || doctors.length}</h3>
            </div>
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active AI Sessions</p>
              <h3 className="text-4xl font-black text-slate-900">{stats.activeSessions}</h3>
            </div>
          </div>

          {viewingList === 'doctors' ? (
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
          ) : (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center px-2 mb-6">
                <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">👥</span>
                Registered Patients
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((pat) => (
                  <div key={pat.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                          👤
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">{pat.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{pat.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center text-slate-600 text-sm font-semibold">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">Age</span>
                          <span className="font-semibold text-slate-700">{pat.age ? `${pat.age} Years` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-slate-600 text-sm font-semibold">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">Gender</span>
                          <span className="font-semibold text-slate-700">{pat.gender || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-slate-600 text-sm font-semibold">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">City</span>
                          <span className="font-semibold text-slate-700">{pat.city || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* --- View 3: Vector DB Resources Management --- */}
      {activeTab === 'resources' && (
        <div className="space-y-10">
          {!showRegistry ? (
            /* Ingestion/Upload View */
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">🚀</span>
                  Ingestion
                </h2>
                <button
                  onClick={() => setShowRegistry(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 active:scale-[0.98]"
                >
                  📋 Go to Document Registry ({documents.length})
                </button>
              </div>

              {/* Upload Form */}
              <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
                    Upload New Document
                  </h2>
                </div>

                <form onSubmit={handleUploadSubmit} className="p-8 sm:p-10 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Document Title</label>
                      <input type="text" name="title" value={uploadFormData.title} onChange={handleUploadInputChange} required placeholder="Medical Guidelines v2"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 text-sm" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select PDF File</label>
                      <input type="file" id="file-upload-input" name="file" accept=".pdf" onChange={handleUploadInputChange} required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 text-xs" />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Description</label>
                      <textarea name="description" value={uploadFormData.description} onChange={handleUploadInputChange} placeholder="Optional brief description of this resource..." rows="4"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 text-sm resize-none" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-10 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed">
                      {isUploading ? "Uploading & Ingesting..." : "Upload & Ingest PDF"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Document Registry List View */
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                  onClick={() => setShowRegistry(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  ← Back to Ingestion
                </button>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-xl">📋</span>
                  Document Registry ({documents.length})
                </h2>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
                  <h2 className="text-md font-bold text-white flex items-center">
                    <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
                    Registered Documents
                  </h2>
                  <button onClick={fetchDocuments} className="text-xs font-bold text-teal-400 hover:text-teal-300">Refresh</button>
                </div>

                {isLoadingDocs ? (
                  <div className="p-12 flex justify-center items-center">
                    <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">
                    No documents found in DataBase.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Title / Desc</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">File Info</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded At</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded By</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-6">
                              <div className="font-bold text-slate-800 text-sm">{doc.title}</div>
                              {doc.description && <div className="text-xs text-slate-400 mt-1 max-w-[300px] truncate">{doc.description}</div>}
                            </td>
                            <td className="p-6">
                              <div className="font-semibold text-slate-700 text-xs truncate max-w-[200px]">{doc.fileName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatBytes(doc.fileSize)}</div>
                            </td>
                            <td className="p-6 text-xs font-semibold text-slate-600">
                              {formatDate(doc.uploadedAt)}
                            </td>
                            <td className="p-6">
                              <div className="font-bold text-slate-800 text-xs">{doc.uploadedBy?.name || 'Admin'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{doc.uploadedBy?.email}</div>
                            </td>
                            <td className="p-6 text-center">
                              <button onClick={() => handleDeleteDocument(doc.id, doc.title)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.95]">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;