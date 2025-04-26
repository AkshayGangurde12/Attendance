import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateMobile = (mobile) => {
        return /^\d{10}$/.test(mobile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!validateMobile(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            // Get registered users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user with matching email and mobile
            const user = users.find(u => u.email === email && u.mobile === mobile);
            
            if (user) {
                // Store authentication state
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.name);
                navigate('/');
            } else {
                setError('Invalid email or mobile number. Please check your credentials or sign up.');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    return (
        <div className='container-fluid bg-primary vh-100 vw-100 d-flex align-items-center justify-content-center'>
            <div className='card' style={{ width: '400px' }}>
                <div className='card-body'>
                    <h3 className='card-title text-center mb-4'>Login</h3>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor='email' className='form-label'>Email Address</label>
                            <input
                                type='email'
                                className='form-control'
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email'
                                required
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='mobile' className='form-label'>Mobile Number</label>
                            <input
                                type='tel'
                                className='form-control'
                                id='mobile'
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder='Enter your mobile number'
                                required
                                maxLength={10}
                            />
                        </div>
                        <button type='submit' className='btn btn-success w-100 mb-3'>Login</button>
                        <div className='text-center'>
                            <p>Don't have an account? <Link to="/signup" className='text-success'>Sign Up</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login; 