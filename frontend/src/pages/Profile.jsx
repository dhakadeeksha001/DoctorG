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
import { updateProfile, reset } from '../features/auth/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state) => state.auth);

  // State for the profile fields
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    age: '',
    city: '',
    gender: ''
  });

  // Prefill user details when page loads or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age !== null && user.age !== undefined ? user.age : '',
        city: user.city || '',
        gender: user.gender || ''
      });
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

    // Call update API
    dispatch(updateProfile({
      name: formData.name,
      age: formData.age ? Number(formData.age) : null,
      city: formData.city,
      gender: formData.gender
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- Top Header --- */}
      <header className="bg-teal-600 text-white p-4 shadow-md shrink-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold tracking-wide">My Health Profile</h1>
          <p className="text-teal-100 text-sm mt-1">Manage your personal and demographic details</p>
        </div>
      </header>

      {/* --- Profile Form Area --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="bg-teal-100 text-teal-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              <p className="text-gray-500 text-sm">Update your details to help us personalize your experience.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grid for two-column layout on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Name Field */}
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
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800"
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
                  placeholder="e.g., 28"
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
      </main>

    </div>
  );
};

export default Profile;