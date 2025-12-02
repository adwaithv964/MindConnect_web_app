import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/AuthLayout';
import Icon from '../../components/AppIcon';

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
    const navigate = useNavigate();

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
            // Remove confirmPassword before sending
            const { confirmPassword, ...submitData } = formData;
            const res = await axios.post('http://localhost:5001/api/auth/register', submitData);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'counsellor') {
                navigate('/counsellor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6 text-center lg:text-left">
                    Create Your Secure Account
                </h2>

                {/* Role Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                    <button
                        type="button"
                        onClick={() => toggleRole('patient')}
                        className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${role === 'patient'
                                ? 'bg-[#008080] text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        I am seeking support
                        <span className="block text-xs opacity-80 font-normal">(User/Patient)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleRole('counsellor')}
                        className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${role === 'counsellor'
                                ? 'bg-[#008080] text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        I am a Mental Health Professional
                        <span className="block text-xs opacity-80 font-normal">(Counsellor/Doctor)</span>
                    </button>
                </div>

                <div className="mb-6 text-center text-sm text-gray-600">
                    Join our community to build your trusted circle and access wellness tools.
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
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Password"
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
                        <p>We prioritize your privacy using end-to-end encryption and strong data protection measures.</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#008080] hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Icon name="Loader" size={16} className="animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                'Get Started'
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
