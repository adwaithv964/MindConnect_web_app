import React from 'react';
import BreadcrumbTrail from '../../../components/ui/BreadcrumbTrail';

const SettingsGeneral = () => {
    return (
        <div className="space-y-6">
            <BreadcrumbTrail />
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">General Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account settings and configurations.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Language</h3>
                            <p className="text-sm text-gray-500">Select your preferred language for the interface.</p>
                        </div>
                        <select className="form-select rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Time Zone</h3>
                            <p className="text-sm text-gray-500">Set your local time zone.</p>
                        </div>
                        <select className="form-select rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                            <option>(GMT-08:00) Pacific Time</option>
                            <option>(GMT-05:00) Eastern Time</option>
                            <option>(GMT+00:00) UTC</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsGeneral;
