import React, { useState } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const ProfileEditor = () => {
    const [profile, setProfile] = useState({
        bio: '',
        specializations: '',
        experienceYears: ''
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Saving profile:', profile);
        // API call to save profile
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <RoleBasedSidebar userRole="counsellor" />
                <main className="main-content">
                    <BreadcrumbTrail />
                    <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
                    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                </main>
            </div>
        </SidebarProvider>
    );
};

export default ProfileEditor;
