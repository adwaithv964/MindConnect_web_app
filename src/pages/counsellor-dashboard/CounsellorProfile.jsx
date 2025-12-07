import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import { useAuth } from '../../context/AuthContext';

const CounsellorProfile = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        emergencyContact: '',
        bio: '',
        specializations: '',
        experienceYears: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                // Fallback to checking currentUser only if we track Mongo ID there, but usually localStorage is the way given AuthContext logic
                const userId = storedUser?._id || storedUser?.id;

                if (!userId) {
                    console.error("User ID not found");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/counsellor/profile/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch profile');

                const data = await response.json();

                setProfile({
                    name: data.userId?.name || '',
                    email: data.userId?.email || '',
                    emergencyContact: data.userId?.emergencyContact || '',
                    bio: data.bio || '',
                    specializations: Array.isArray(data.specializations) ? data.specializations.join(', ') : (data.specializations || ''),
                    experienceYears: data.experienceYears || ''
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
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

            const response = await fetch(`http://localhost:5001/api/counsellor/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...profile,
                    specializations: profile.specializations.split(',').map(s => s.trim())
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <BreadcrumbTrail />
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Specializations (comma separated)</label>
                        <input
                            type="text"
                            name="specializations"
                            value={profile.specializations}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                        <input
                            type="number"
                            name="experienceYears"
                            value={profile.experienceYears}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Save Profile
                    </button>
                </form>
            </div>
        </>
    );
};

export default CounsellorProfile;
