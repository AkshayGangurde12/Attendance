import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        setSuccess('');

        if (!name || name.length < 2) {
            setError('Name must be at least 2 characters long');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!validateMobile(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            // For demo purposes, we'll just store the data in localStorage
            // In a real application, you would send this to your backend
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                setError('Email already registered. Please login instead.');
                return;
            }

            // Add new user
            users.push({ name, email, mobile });
            localStorage.setItem('users', JSON.stringify(users));
            
            setSuccess('Registration successful! Please login to continue.');
            
            // Clear form
            setName('');
            setEmail('');
            setMobile('');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('An error occurred during sign up');
        }
    };

    return (
        <div className='container-fluid bg-primary vh-100 vw-100 d-flex align-items-center justify-content-center'>
            <div className='card' style={{ width: '400px' }}>
                <div className='card-body'>
                    <h3 className='card-title text-center mb-4'>Sign Up</h3>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    {success && <div className='alert alert-success'>{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor='name' className='form-label'>Full Name</label>
                            <input
                                type='text'
                                className='form-control'
                                id='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Enter your full name'
                                required
                                minLength={2}
                            />
                        </div>
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
                        <button type='submit' className='btn btn-success w-100 mb-3'>Sign Up</button>
                        <div className='text-center'>
                            <p>Already have an account? <Link to="/login" className='text-success'>Login</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp; 