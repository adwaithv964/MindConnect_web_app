import { useAuth } from '../../../context/AuthContext';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import BreadcrumbTrail from '../../../components/ui/BreadcrumbTrail';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SettingsGeneral = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

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

                // If firebase delete fails (e.g. requires re-auth), we still want to handle UI state
                if (error.code === 'auth/requires-recent-login') {
                    alert('Please log out and log in again to verify your identity before deleting your account.');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
            }
        }
    };

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

                    {/* Danger Zone */}
                    <div className="pt-6">
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
            </div>
        </div>
    );
};

export default SettingsGeneral;
