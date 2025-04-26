import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function Read() {
    const [student, setStudent] = useState(null)
    const { id } = useParams()

    useEffect(() => {
        axios.get(`http://localhost:5001/student/${id}`)
            .then(res => {
                setStudent(res.data)
            })
            .catch(err => console.log(err))
    }, [id])

    if (!student) {
        return <div>Loading...</div>
    }

    return (
        <div className='container-fluid bg-primary vh-100 vw-100'>
            <div className='row'>
                <div className='col-md-6 offset-md-3'>
                    <h3>Student Details</h3>
                    <div className='card'>
                        <div className='card-body'>
                            <h5 className='card-title'>{student.NAME}</h5>
                            <p className='card-text'>Email: {student.EMAIL}</p>
                            <p className='card-text'>Age: {student.AGE}</p>
                            <p className='card-text'>Gender: {student.GENDER}</p>
                            <Link to='/' className='btn btn-success'>Back to List</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Read
