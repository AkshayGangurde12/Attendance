import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Home() {
    const [data, setData] = useState([])
    const [deleted, setDeleted] = useState(true)

    useEffect(() => {
        if (deleted) {
            setDeleted(false)
            axios.get('http://localhost:5001/students')
                .then((res) => {
                    setData(res.data)
                })
                .catch((err) => console.log(err))
        }
    }, [deleted])

    function handleDelete(id) {
        axios.delete(`http://localhost:5001/student/${id}`)
            .then((res) => {
                setDeleted(true)
            })
            .catch((err) => console.log(err))
    }

    return (
        <div className='container-fluid bg-primary vh-100 vw-100'>
            <div className='d-flex justify-content-between align-items-center p-3'>
                <h3>Student Management System</h3>
                <div>
                    <Link className='btn btn-success me-2' to='/attendance'>Attendance</Link>
                    <Link className='btn btn-success' to='/create'>Add Student</Link>
                </div>
            </div>
            <div className='card'>
                <div className='card-body'>
                    <table className="table table-striped table-dark">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((student) => (
                                <tr key={student.ID}>
                                    <td>{student.ID}</td>
                                    <td>{student.NAME}</td>
                                    <td>{student.EMAIL}</td>
                                    <td>{student.AGE}</td>
                                    <td>{student.GENDER}</td>
                                    <td>
                                        <Link className='btn mx-2 btn-success' to={`/read/${student.ID}`}>Read</Link>
                                        <Link className='btn mx-2 btn-success' to={`/edit/${student.ID}`}>Edit</Link>
                                        <button onClick={() => handleDelete(student.ID)} className='btn mx-2 btn-danger'>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Home