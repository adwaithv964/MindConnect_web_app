import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const CounsellorProfile = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        emergencyContact: '',
        bio: '',
        specializations: '',
        experienceYears: '',
        qualifications: '',
        languages: '',
        patientCount: '',
        profilePhoto: '',
        registrationNumber: '',
        registrationYear: '',
        stateMedicalCouncil: '',
        nmcVerificationStatus: 'unverified'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?._id || storedUser?.id;

                // Role guard: only counsellors should use this page
                if (!storedUser || storedUser.role !== 'counsellor') {
                    navigate('/login');
                    return;
                }

                if (!userId) {
                    console.error("User ID not found");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/counsellor/profile/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch profile');

                const data = await response.json();

                setProfile({
                    name: data.userId?.name || '',
                    email: data.userId?.email || '',
                    emergencyContact: data.userId?.emergencyContact || '',
                    bio: data.bio || '',
                    specializations: Array.isArray(data.specializations) ? data.specializations.join(', ') : (data.specializations || ''),
                    experienceYears: data.experienceYears || '',
                    qualifications: data.qualifications || '',
                    languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
                    patientCount: data.patientCount || '',
                    profilePhoto: data.profilePhoto || '',
                    registrationNumber: data.registrationNumber || '',
                    registrationYear: data.registrationYear || '',
                    stateMedicalCouncil: data.stateMedicalCouncil || '',
                    stateMedicalCouncil: data.stateMedicalCouncil || '',
                    nmcVerificationStatus: data.nmcVerificationStatus || 'unverified',
                    verifiedName: data.verifiedName || data.userId?.name || '' // Use verifiedName, fallback to user name
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setToast({ message: 'Failed to load profile data', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        if (location.state?.message) {
            setToast({ message: location.state.message, type: 'warning' });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: 'File size too large. Please upload an image under 2MB.', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile({ ...profile, profilePhoto: reader.result });
        };
        reader.readAsDataURL(file);
    };

    // Note: handleNMCVerify removed as verification happens at registration now.
    // We only display the status here.

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?._id || storedUser?.id;

            if (!userId) return;

            // Note: name and email are NMC-verified and cannot be changed
            const { name, email, ...editableProfile } = profile;

            const response = await fetch(`${API_BASE_URL}/api/counsellor/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editableProfile,
                    specializations: profile.specializations.split(',').map(s => s.trim()),
                    languages: profile.languages.split(',').map(s => s.trim())
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            setToast({ message: 'Profile updated successfully!', type: 'success' });

        } catch (error) {
            console.error('Error updating profile:', error);
            setToast({ message: 'Failed to update profile.', type: 'error' });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <BreadcrumbTrail />

            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-800 mb-2">Public Profile Preview</h2>
                            <p className="text-sm text-blue-600 mb-4">This is how patients will see your profile information.</p>
                        </div>
                        {/* Profile Photo Preview */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-md relative">
                                {profile.profilePhoto ? (
                                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label className="mt-2 cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Change Photo</span>
                                <input type="file" className="sr-only" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                            <p className="text-xs text-gray-400 mt-1">Max 2MB</p>
                        </div>
                    </div>

                    {/* Medical Registration / NMC Verification Display Only */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Medical Registration (NMC)</h3>
                            {profile.nmcVerificationStatus === 'verified' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Unverified
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Your medical registration details verified during registration.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                                <input
                                    type="text"
                                    value={profile.verifiedName || ''}
                                    readOnly
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                <input
                                    type="text"
                                    value={profile.registrationNumber || ''}
                                    readOnly
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year of Registration</label>
                                <input
                                    type="text"
                                    value={profile.registrationYear || ''}
                                    readOnly
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State Medical Council</label>
                                <input
                                    type="text"
                                    value={profile.stateMedicalCouncil || ''}
                                    readOnly
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">🔒 NMC locked</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.verifiedName || profile.name}
                                    readOnly
                                    title="Name is locked to your NMC-verified identity and cannot be changed."
                                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">🔒 locked</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    readOnly
                                    title="Email cannot be changed after registration."
                                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                <input
                                    type="text"
                                    name="emergencyContact"
                                    value={profile.emergencyContact}
                                    onChange={handleChange}
                                    placeholder="Phone number or name"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                                <input
                                    type="text"
                                    name="qualifications"
                                    value={profile.qualifications}
                                    onChange={handleChange}
                                    placeholder="e.g. LCSW, Licensed Clinical Social Worker"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    value={profile.experienceYears}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Patient Count (Approx)</label>
                                <input
                                    type="number"
                                    name="patientCount"
                                    value={profile.patientCount}
                                    onChange={handleChange}
                                    placeholder="e.g. 500"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Extended Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Expertise & Bio</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specializations (comma separated)</label>
                            <input
                                type="text"
                                name="specializations"
                                value={profile.specializations}
                                onChange={handleChange}
                                placeholder="e.g. Anxiety, Depression, Grief"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Languages Spoken (comma separated)</label>
                            <input
                                type="text"
                                name="languages"
                                value={profile.languages}
                                onChange={handleChange}
                                placeholder="e.g. English, Spanish, Hindi"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Write a short bio about your approach and background..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-md font-medium">
                            Save Profile Changes
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CounsellorProfile;
