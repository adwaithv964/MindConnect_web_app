import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/AuthLayout';
import Icon from '../../components/AppIcon';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // 1. Login with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Get user profile from MongoDB
            const res = await axios.post('http://localhost:5001/api/auth/firebase-login', {
                email: firebaseUser.email,
                firebaseUid: firebaseUser.uid
            });

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'counsellor') {
                navigate('/counsellor-dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: 'Users',
            title: 'Supportive Community',
            description: 'Connect with peers in a moderated environment to break stigma.'
        },
        {
            icon: 'Stethoscope',
            title: 'Professional Access',
            description: 'Directly engage with verified counselors and doctors.'
        },
        {
            icon: 'Smile',
            title: 'Wellness Tools',
            description: 'Utilize features like mood tracking and a private journal for self-reflection.'
        }
    ];

    return (
        <AuthLayout
            title="Your integrated path to mental wellness."
            subtitle="Welcome to a safe, non-judgmental space that brings together a supportive community, professional guidance, and personal self-help tools in one accessible platform."
            features={features}
            quote="Helping you feel connected and understood in an increasingly isolated world."
        >
            <div className="w-full">
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2 text-center lg:text-left">
                    Welcome back, friend.
                </h2>

                <form className="space-y-6" onSubmit={onSubmit}>
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

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <div className="relative">
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
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
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
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#4A90E2] hover:text-[#357ABD]">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#008080] hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Icon name="Loader" size={16} className="animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-500 mt-4">
                        <Icon name="Lock" size={14} className="mt-0.5" />
                        <p>Your privacy is protected through end-to-end encryption.</p>
                    </div>
                </form>

                <div className="mt-8 bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-medium text-[#008080] hover:text-[#006666] underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
