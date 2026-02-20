import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const PatientProfile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        emergencyContact: '',
        profilePhoto: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?._id || storedUser?.id;

                // Role guard: only patients should use this page
                if (!storedUser || storedUser.role !== 'patient') {
                    navigate('/login');
                    return;
                }

                if (!userId) {
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/patients/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch profile');

                const data = await response.json();
                const patientData = data.patient;

                setProfile({
                    name: patientData.name || '',
                    email: patientData.email || '',
                    phone: patientData.phone || '',
                    emergencyContact: patientData.emergencyContact || '',
                    profilePhoto: patientData.profilePhoto || ''
                });
                setPhotoPreview(patientData.profilePhoto || null);
            } catch (error) {
                console.error("Error fetching patient profile:", error);
                setToast({ message: 'Failed to load profile data', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePhotoClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: 'Image must be less than 2MB', type: 'error' });
            return;
        }

        setUploadingPhoto(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPhotoPreview(base64);
            setProfile(prev => ({ ...prev, profilePhoto: base64 }));
            setUploadingPhoto(false);
        };
        reader.onerror = () => {
            setToast({ message: 'Failed to read image file', type: 'error' });
            setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');

                // 1. Delete from MongoDB
                const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': token
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete account data');
                }

                // 2. Delete from Firebase
                if (currentUser) {
                    await deleteUser(currentUser);
                }

                // 3. Logout locally
                logout();
                navigate('/login');
                alert('Account deleted successfully.');
            } catch (error) {
                console.error('Error deleting account:', error);

                if (error.code === 'auth/requires-recent-login') {
                    alert('Please log out and log in again to verify your identity before deleting your account.');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?._id || storedUser?.id;

            if (!userId) return;

            const response = await fetch(`${API_BASE_URL}/api/patients/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();

            setProfile(prev => ({
                ...prev,
                name: updatedUser.name || prev.name,
                email: updatedUser.email || prev.email,
                phone: updatedUser.phone || prev.phone,
                emergencyContact: updatedUser.emergencyContact || prev.emergencyContact,
                profilePhoto: updatedUser.profilePhoto || prev.profilePhoto
            }));

            setPhotoPreview(updatedUser.profilePhoto || photoPreview);
            setIsEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });

        } catch (error) {
            console.error('Error updating patient profile:', error);
            setToast({ message: 'Failed to update profile.', type: 'error' });
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <BreadcrumbTrail />
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">My Profile</h1>
                <p className="mt-2 text-gray-600">Manage your personal information.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className={`relative group ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={handlePhotoClick}
                        title={isEditing ? 'Click to change photo' : ''}
                    >
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center border-4 border-white shadow-md">
                                <span className="text-white text-2xl font-bold">{getInitials(profile.name)}</span>
                            </div>
                        )}

                        {/* Hover overlay — only shown in edit mode */}
                        {isEditing && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingPhoto ? (
                                    <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-white text-xs font-medium">Change</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-800">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                    {isEditing && (
                        <p className="mt-1 text-xs text-gray-400">Click photo to upload (max 2MB)</p>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                disabled={true}
                                className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                            <input
                                type="text"
                                name="emergencyContact"
                                value={profile.emergencyContact}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Danger Zone for Patients */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mt-8">
                <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-red-900 font-medium">Delete Account</h4>
                        <p className="text-sm text-red-700 mt-1">Permanently delete your account and all of your content.</p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
