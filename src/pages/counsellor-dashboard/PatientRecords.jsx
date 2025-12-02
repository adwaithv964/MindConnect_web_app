import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import axios from 'axios';

const PatientRecords = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch patients from API
        // const fetchPatients = async () => {
        //   try {
        //     const res = await axios.get('http://localhost:5001/api/patients?counsellorId=...');
        //     setPatients(res.data);
        //     setLoading(false);
        //   } catch (err) {
        //     console.error(err);
        //     setLoading(false);
        //   }
        // };
        // fetchPatients();

        // Mock data
        setPatients([
            { _id: '1', name: 'Sarah Johnson', email: 'sarah@example.com' },
            { _id: '2', name: 'Michael Chen', email: 'michael@example.com' }
        ]);
        setLoading(false);
    }, []);

    return (
        <>
            <BreadcrumbTrail />
            <h1 className="text-3xl font-bold mb-6">Patient Records</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid gap-4">
                    {patients.map(patient => (
                        <div key={patient._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">{patient.name}</h3>
                                <p className="text-gray-600">{patient.email}</p>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-800">View Details</button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default PatientRecords;
