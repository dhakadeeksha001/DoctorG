// import { useState, useEffect } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { toast } from 'react-toastify'
// import { updateProfile, reset } from '../features/auth/authSlice'

// const ROLES = [
//   "MERN Stack Developer",
//   "MEAN Stack Developer",
//   "Full Stack Python",
//   "Full Stack Java",
//   "Frontend Developer",
//   "Backend Developer",
//   "Data Scientist",
//   "Data Analyst",
//   "Machine Learning Engineer",
//   "DevOps Engineer",
//   "Cloud Engineer (AWS/Azure/GCP)",
//   "Cybersecurity Engineer",
//   "Blockchain Developer",
//   "Mobile Developer (iOS/Android)",
//   "Game Developer",
//   "UI/UX Designer",
//   "QA Automation Engineer",
//   "Product Manager"
// ];
// const inputBase = 'w-full bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl p-3.5  sm-4 fornt-semibold text-slate-700 text-base transition-all focus:bg-white focus:border-teal-500 outline-none';
// const Profile = () => {
//   const dispatch = useDispatch();
//   const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state) => state.auth);

//   const [formData, setFormData] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     preferredRole: user?.preferredRole || '',
//   })

//   useEffect(() => {
//     if (!isError && !isSuccess) return
//     if (isError) toast.error(message)
//     if (isSuccess) toast.success('Profile Updated Successfully')
//     dispatch(reset())
//   }, [isError, isSuccess, message, dispatch])

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user?.name || '',
//         email: user?.email || '',
//         preferredRole: user?.preferredRole || '',
//       });
//     }
//   }, [user])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (formData.name === user.name && formData.preferredRole === user.preferredRole) {
//       toast.info('No changes to save.')
//       return
//     }
//     dispatch(updateProfile(formData))
//   }
//   return (
//     <div className='max-w-4xl mx-auto px-4 py-6 sm:py-12 pb-24'>
//       <div className='bg-white rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-12 border border-slate-100'>
//         <header className='mb-8'>
//           <h1 className='text-2xl sm:text-3xl font-black text-slate-900'>Edit Profile</h1>
//           <p className='text-sm text-slate-500 mt-1'>
//             Update your professional details and preferences
//           </p>
//         </header>

//         <form onSubmit={handleSubmit} className='space-y-6' >

//           <FormField label="Full Name">
//             <input
//               type="text"
//               className={inputBase}
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder='Enter your name'
//             />
//           </FormField>

//           <FormField label="Email Address (Fixed)" muted>
//             <input
//               type="email"
//               className='w-full bg-slate-100 rounded-xl sm:rounded-2xl p-3.5  sm-4 fornt-semibold text-slate-500 text-base cursor-not-allowed'
//               disabled
//               value={formData.email}
//               onChange={handleChange}

//             />
//           </FormField>

//           <FormField label="Target Role">
//             <div className='relative'>
//               <select name="preferredRole" value={formData.preferredRole} onChange={handleChange} className={`${inputBase} appearance-none`}>
//                 {
//                   ROLES.map((role) => (
//                     <option key={role} value={role}>{role}</option>
//                   ))
//                 }

//               </select>
//               <SelectArrow />
//             </div>
//           </FormField>

//           <div className='pt-4'>
//             <button
//               type='submit'
//               disabled={isProfileLoading}
//               className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] ${isProfileLoading ? 'bg-slate-200 text-slate-400 cursor-wait' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-100'}`}>
//               {
//                 isProfileLoading ? <Loader /> : 'Save Changes'
//               }
//             </button>
//           </div>
//         </form>
//       </div>

//     </div>
//   )
// }

// export default Profile

// function FormField({ label, children, muted }) {

//   return (
//     <div className={`space-y-1.5 ${muted ? 'opacity-60' : ''}`}>
//       <label className='ml-1 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest'>{label}</label>
//       {children}
//     </div>

//   )
// }

// function SelectArrow() {
//   return (
//     <div className='absolute right-4 top-1/2  -translate-y-1/2 pointer-events-none text-slate-400'>
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth="2.5"
//           d="M19 9l-7 7-7-7"
//         />
//       </svg>
//     </div>
//   )
// }

// function Loader() {
//   return (
//     <>
//       <span className='w-5 h-5 border-2 border-slate-400 border-t-transparent animate-spin rounded-full' />
//       <span>Saving...</span>
//     </>
//   )
// }


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { updateProfile, updateDoctorProfile, reset } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state) => state.auth);

  const isDoctor = user?.role?.toLowerCase() === 'doctor';
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'password'

  // State for the profile fields (contains both user and doctor specific fields)
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    age: '',
    city: '',
    gender: '',
    experienceYears: '',
    qualification: '',
    bio: '',
    clinicAddress: '',
    consultationFee: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Prefill details
  useEffect(() => {
    if (user) {
      if (isDoctor) {
        const fetchDoctorProfile = async () => {
          try {
            const response = await axios.get(`${API_URL}/doctor/profile`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.data && response.data.success) {
              const docData = response.data.data;
              setFormData({
                name: user.name || '',
                email: user.email || '',
                age: docData.age !== null && docData.age !== undefined ? docData.age : '',
                city: docData.city || '',
                gender: docData.gender || '',
                experienceYears: docData.experienceYears !== null && docData.experienceYears !== undefined ? docData.experienceYears : '',
                qualification: docData.qualification || '',
                bio: docData.bio || '',
                clinicAddress: docData.clinicAddress || '',
                consultationFee: docData.consultationFee !== null && docData.consultationFee !== undefined ? docData.consultationFee : ''
              });
            }
          } catch (error) {
            toast.error("Failed to load doctor profile details.");
          }
        };
        fetchDoctorProfile();
      } else {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          age: user.age !== null && user.age !== undefined ? user.age : '',
          city: user.city || '',
          gender: user.gender || '',
          experienceYears: '',
          qualification: '',
          bio: '',
          clinicAddress: '',
          consultationFee: ''
        });
      }
    }
  }, [user]);

  // Handle toast notifications
  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to update profile');
      dispatch(reset());
    }
    if (isSuccess) {
      toast.success('Profile updated successfully!');
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isDoctor) {
      dispatch(updateDoctorProfile({
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        city: formData.city,
        experienceYears: formData.experienceYears ? Number(formData.experienceYears) : null,
        qualification: formData.qualification,
        bio: formData.bio,
        clinicAddress: formData.clinicAddress,
        consultationFee: formData.consultationFee ? Number(formData.consultationFee) : null
      }));
    } else {
      // Check if changes were actually made
      const hasChanges = 
        formData.name !== (user?.name || '') ||
        Number(formData.age) !== (user?.age || 0) ||
        formData.city !== (user?.city || '') ||
        formData.gender !== (user?.gender || '');

      if (!hasChanges) {
        toast.info('No changes to save.');
        return;
      }

      dispatch(updateProfile({
        name: formData.name,
        age: formData.age ? Number(formData.age) : null,
        city: formData.city,
        gender: formData.gender
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await axios.put(`${API_URL}/doctor/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.data && response.data.success) {
        toast.success("Password updated successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to update password";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- Top Header --- */}
      <header className="bg-teal-600 text-white p-4 shadow-md shrink-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold tracking-wide">
            {isDoctor ? 'Doctor Profile Settings' : 'My Health Profile'}
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            {isDoctor ? 'Manage your medical professional settings and account details' : 'Manage your personal and demographic details'}
          </p>
        </div>
      </header>

      {/* --- Tab Navigation (Only for Doctor) --- */}
      {isDoctor && (
        <div className="max-w-3xl mx-auto mt-8 w-full px-4 sm:px-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0 w-max border border-slate-200">
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'details' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🩺 Profile Details
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'password' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🔐 Change Password
            </button>
          </div>
        </div>
      )}

      {/* --- Profile Form Area --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* Profile Details Tab */}
        {activeTab === 'details' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
              <div className="bg-teal-100 text-teal-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner">
                {isDoctor ? '🩺' : '👤'}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {isDoctor ? 'Professional Information' : 'Personal Information'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {isDoctor ? 'Update your medical settings, fee, and credentials.' : 'Update your details to help us personalize your experience.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Grid for layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name Field - Read only if Doctor */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    disabled={isDoctor}
                    className={`px-4 py-2.5 border rounded-lg focus:outline-none transition-all text-gray-800 ${
                      isDoctor 
                        ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                    }`}
                  />
                </div>

                {/* Email Field (Fixed/Disabled) */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address (Cannot be changed)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    readOnly
                    className="px-4 py-2.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed focus:outline-none"
                  />
                </div>

                {/* Age Field */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 35"
                    min="0"
                    max="120"
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>

                {/* City Field */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>

                {/* Gender Field */}
                <div className="flex flex-col space-y-1 sm:col-span-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800 bg-white"
                  >
                    <option value="" disabled>Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Doctor Specific Fields */}
                {isDoctor && (
                  <>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="experienceYears" className="text-sm font-medium text-gray-700">Years of Experience</label>
                      <input
                        type="number"
                        id="experienceYears"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        placeholder="e.g., 12"
                        min="0"
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label htmlFor="qualification" className="text-sm font-medium text-gray-700">Qualification</label>
                      <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., MBBS, MD Cardiologist"
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label htmlFor="consultationFee" className="text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                      <input
                        type="number"
                        id="consultationFee"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        placeholder="e.g., 150"
                        min="0"
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                      />
                    </div>

                    <div className="flex flex-col space-y-1 sm:col-span-2">
                      <label htmlFor="clinicAddress" className="text-sm font-medium text-gray-700">Clinic / Hospital Address</label>
                      <input
                        type="text"
                        id="clinicAddress"
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                        placeholder="e.g., Suite 404, City Heart Clinic"
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                      />
                    </div>

                    <div className="flex flex-col space-y-1 sm:col-span-2">
                      <label htmlFor="bio" className="text-sm font-medium text-gray-700">Professional Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe your background, specialty, and services..."
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                      ></textarea>
                    </div>
                  </>
                )}

              </div>

              {/* Submit Button Area */}
              <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-sm flex items-center gap-2"
                >
                  {isProfileLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full inline-block" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Change Password Tab (Only for Doctor) */}
        {isDoctor && activeTab === 'password' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
              <div className="bg-teal-100 text-teal-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner">
                🔐
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
                <p className="text-gray-500 text-sm">Update your account password. Once updated, use your new password to sign in.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-sm flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full inline-block" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

    </div>
  );
};

export default Profile;