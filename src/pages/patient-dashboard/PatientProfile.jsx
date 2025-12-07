import React, { useState, useEffect } from 'react';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import { useAuth } from '../../context/AuthContext'; // Assuming context is available

const PatientProfile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        emergencyContact: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?._id || storedUser?.id;

                if (!userId) {
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/patients/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch profile');

                const data = await response.json();
                // data returned is { patient: {...}, moodLogs: [...] }
                const patientData = data.patient;

                setProfile({
                    name: patientData.name || '',
                    email: patientData.email || '',
                    phone: patientData.phone || '',
                    emergencyContact: patientData.emergencyContact || ''
                });
            } catch (error) {
                console.error("Error fetching patient profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?._id || storedUser?.id;

            if (!userId) return;

            const response = await fetch(`http://localhost:5001/api/patients/${userId}`, {
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

            // Update local state if needed, though we generally rely on fetch or manual update
            setProfile(prev => ({
                ...prev,
                name: updatedUser.name || prev.name,
                email: updatedUser.email || prev.email,
                phone: updatedUser.phone || prev.phone,
                emergencyContact: updatedUser.emergencyContact || prev.emergencyContact
            }));

            setIsEditing(false);
            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Error updating patient profile:', error);
            alert('Failed to update profile.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <BreadcrumbTrail />
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">My Profile</h1>
                <p className="mt-2 text-gray-600">Manage your personal information.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
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
                                disabled={true} // Usually email is not editable directly
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
        </div>
    );
};

export default PatientProfile;
