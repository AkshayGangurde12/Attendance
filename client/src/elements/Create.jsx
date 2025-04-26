import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Create() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault()
        axios.post('http://localhost:5001/add_student', {
            name,
            email,
            age: parseInt(age),
            gender
        })
            .then(res => {
                console.log(res)
                navigate('/')
            })
            .catch(err => console.log(err))
    }

    return (
        <div className='container-fluid bg-primary vh-100 vw-100'>
            <div className='row'>
                <div className='col-md-6 offset-md-3'>
                    <h3>Add Student</h3>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor='name' className='form-label'>Name</label>
                            <input
                                type='text'
                                className='form-control'
                                id='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='email' className='form-label'>Email</label>
                            <input
                                type='email'
                                className='form-control'
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='age' className='form-label'>Age</label>
                            <input
                                type='number'
                                className='form-control'
                                id='age'
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                                min={1}
                                max={150}
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='gender' className='form-label'>Gender</label>
                            <select
                                className='form-control'
                                id='gender'
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <button type='submit' className='btn btn-success'>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Create