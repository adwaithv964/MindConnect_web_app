import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/AuthLayout';
import Icon from '../../components/AppIcon';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        // Only redirect if:
        // 1. Auth context is done loading
        // 2. We have a current user
        // 3. We are NOT currently submitting the form (loading state)
        //    This prevents redirecting before the role is fully set in localStorage/state during the registration process itself.
        if (!authLoading && currentUser && !loading && userRole) {
            if (userRole === 'counsellor') {
                navigate('/counsellor-dashboard');
            } else if (userRole === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        }
    }, [currentUser, userRole, authLoading, loading, navigate]);

    const { name, email, password, confirmPassword, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const toggleRole = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 1. Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Create user in MongoDB
            const { confirmPassword, ...submitData } = formData;

            // UPDATED: Uses environment variable for API URL
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
                ...submitData,
                firebaseUid: firebaseUser.uid
            });

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'counsellor') {
                navigate('/counsellor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
            setLoading(false); // Only set loading to false on error, so we don't trigger the useEffect redirect too early
        }
        // Note: We intentionally don't set loading(false) on success because we are navigating away.
        // If we set it to false, the useEffect might kick in with incomplete context data.
    };

    const features = [
        {
            icon: 'Shield',
            title: 'Safe & Moderated Community',
            description: 'Engage in non-judgmental discussions in a secure environment designed to break stigma.'
        },
        {
            icon: 'Stethoscope',
            title: 'Integrated Professional Guidance',
            description: 'Directly connect privately with verified professional counsellors and doctors.'
        },
        {
            icon: 'Smile',
            title: 'Personal Wellness Tools',
            description: 'Understand your emotions with features like mood tracking and guided journaling for self-reflection.'
        },
        {
            icon: 'BookOpen',
            title: 'Curated Resource Library',
            description: 'Access trusted self-care materials, including articles, videos, and guided meditations.'
        }
    ];

    return (
        <AuthLayout
            title="Navigate Your Path to Mental Wellness, Together."
            subtitle="Bridge the gap between fragmented support systems. Experience a holistic platform that integrates a supportive peer community, professional guidance, and accessible self-help tools in one safe environment."
            features={features}
            quote="Find peace of mind knowing you have a supportive community and reliable resources at your fingertips, helping you feel connected in an isolated world."
        >
            <div className="w-full">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2 text-center lg:text-left">
                    Create Your Secure Account
                </h2>
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Step 1 of 2</p>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#008080] w-1/2 rounded-full"></div>
                    </div>
                </div>

                {/* Role Toggle */}
                <div className="flex gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => toggleRole('patient')}
                        className={`flex-1 py-4 px-4 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center gap-2 ${role === 'patient'
                            ? 'border-[#008080] bg-[#E0F2F1] text-[#008080]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <div className={`p-2 rounded-full ${role === 'patient' ? 'bg-[#008080] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon name="Users" size={20} />
                        </div>
                        <div>
                            <span className="block text-sm font-bold">I am seeking support</span>
                            <span className="block text-xs opacity-80 font-normal mt-1 leading-tight">(For Patients/Users wanting to build a trusted circle)</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleRole('counsellor')}
                        className={`flex-1 py-4 px-4 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center gap-2 ${role === 'counsellor'
                            ? 'border-[#008080] bg-[#E0F2F1] text-[#008080]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <div className={`p-2 rounded-full ${role === 'counsellor' ? 'bg-[#008080] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon name="Stethoscope" size={20} />
                        </div>
                        <div>
                            <span className="block text-sm font-bold">I am a Mental Health Professional</span>
                            <span className="block text-xs opacity-80 font-normal mt-1 leading-tight">(For Counsellors/Doctors requiring verification)</span>
                        </div>
                    </button>
                </div>

                <form className="space-y-4" onSubmit={onSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Icon name="AlertCircle" size={20} className="text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Full Name"
                            value={name}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Email Address"
                            value={email}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="sr-only">Create Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Create Password"
                            value={password}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={onChange}
                        />
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
                        <Icon name="Lock" size={14} className="mt-0.5 flex-shrink-0" />
                        <p>We maintain strong privacy protection and a strict verification process for professionals</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#80CBC4] hover:bg-[#4DB6AC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#80CBC4] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Icon name="Loader" size={16} className="animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Already a member?{' '}
                        <Link to="/login" className="font-medium text-[#008080] hover:text-[#006666] underline">
                            Log In here
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;