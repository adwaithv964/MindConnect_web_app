import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import axios from 'axios';

const PatientRecords = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?._id || storedUser?.id;
            if (!userId) return;

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/patients?counsellorId=${userId}`);
            setPatients(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching patients:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const toggleVerification = async (patientId, currentStatus) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/${patientId}/verify`, {
                isPatientVerified: !currentStatus
            });
            // Update local state
            setPatients(prev => prev.map(p =>
                p._id === patientId ? { ...p, isPatientVerified: !currentStatus } : p
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update verification status");
        }
    };

    return (
        <div className="p-6">
            <BreadcrumbTrail />
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Patient Records</h1>
            {loading ? (
                <div className="text-center p-8">Loading records...</div>
            ) : patients.length === 0 ? (
                <div className="text-center p-8 text-gray-500">No patients found. Patients will appear here after they book an appointment with you.</div>
            ) : (
                <div className="grid gap-4">
                    {patients.map(patient => (
                        <div key={patient._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                {/* Profile Photo Avatar */}
                                {patient.profilePhoto ? (
                                    <img
                                        src={patient.profilePhoto}
                                        alt={patient.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                                        <span className="text-white text-sm font-bold">
                                            {patient.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                                        {patient.isPatientVerified ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">{patient.email}</p>
                                    {patient.phone && <p className="text-gray-400 text-xs">{patient.phone}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => toggleVerification(patient._id, patient.isPatientVerified)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${patient.isPatientVerified
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {patient.isPatientVerified ? 'Unverify' : 'Verify Patient'}
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
