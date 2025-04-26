import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Attendance() {
    const [view, setView] = useState('select');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceView, setAttendanceView] = useState('daily'); // daily, subject

    // Updated subjects data
    const sampleSubjects = [
        { id: 1, name: 'Advanced Mainframe', teacher: 'Yogesh Sharma' },
        { id: 2, name: 'CC', teacher: 'Priyanka More' },
        { id: 3, name: 'LPCC', teacher: 'Nagraju bogiri' },
        { id: 4, name: 'AMD', teacher: 'Vikas Maral' },
        { id: 5, name: 'AML', teacher: 'Manisha Mali' }
    ];

    // Load subjects
    useEffect(() => {
        setSubjects(sampleSubjects);
    }, []);

    // Load students
    const loadStudents = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('http://localhost:5001/students');
            setStudents(response.data);
        } catch (err) {
            setError('Failed to load students. Please try again.');
            console.error('Error loading students:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle student ID submission
    const handleStudentIdSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!studentId.trim()) {
            setError('Please enter your student ID');
            return;
        }

        try {
            setLoading(true);
            await loadStudents();
            const student = students.find(s => s.ID === parseInt(studentId));
            
            if (!student) {
                setError('Student not found. Please check your ID and try again.');
                return;
            }
            
            setView('student');
        } catch (err) {
            setError('Failed to load student data. Please try again.');
            console.error('Error in student submission:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle teacher login
    const handleTeacherLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await loadStudents();
            setView('teacher');
        } catch (err) {
            setError('Failed to load teacher data. Please try again.');
            console.error('Error in teacher login:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle subject selection
    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setView('teacher-attendance');
    };

    // Mark attendance
    const markAttendance = async (studentId, status) => {
        try {
            const student = students.find(s => s.ID === studentId);
            if (!student) {
                setError('Student not found');
                return;
            }

            const currentTime = new Date().toISOString();
            
            const attendanceData = {
                studentId: parseInt(studentId), // Ensure studentId is a number
                name: student.NAME,
                email: student.EMAIL,
                subjectId: selectedSubject.id,
                subjectName: selectedSubject.name,
                status: status,
                timestamp: currentTime,
                date: selectedDate
            };

            // Get existing records
            const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
            
            // Check if attendance already marked for the selected date
            const alreadyMarked = existingRecords.some(record => 
                record.date === selectedDate && 
                record.studentId === parseInt(studentId) && 
                record.subjectId === selectedSubject.id
            );

            if (alreadyMarked) {
                setError(`${student.NAME} has already been marked ${status.toLowerCase()} for ${selectedDate}`);
                return;
            }

            // Add new record
            existingRecords.push(attendanceData);
            localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));
            
            setSuccess(`${student.NAME} marked as ${status.toLowerCase()} successfully for ${selectedDate}!`);
            
            // Refresh the student list to show updated status
            loadStudents();
        } catch (err) {
            setError('Error marking attendance');
            console.error('Error marking attendance:', err);
        }
    };

    // Calculate attendance percentage
    const calculateAttendancePercentage = (studentId, subjectId, date = null) => {
        const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        let filteredRecords = records.filter(record => 
            record.studentId === studentId && 
            record.subjectId === subjectId
        );

        if (date) {
            filteredRecords = filteredRecords.filter(record => record.date === date);
        }

        if (filteredRecords.length === 0) return 0;

        const presentCount = filteredRecords.filter(record => record.status === 'Present').length;
        return (presentCount / filteredRecords.length) * 100;
    };

    // Get date-wise attendance
    const getDateWiseAttendance = (studentId) => {
        try {
            const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
            return records.filter(record => 
                record.studentId === parseInt(studentId) && 
                record.date === selectedDate
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (err) {
            console.error('Error getting date-wise attendance:', err);
            return [];
        }
    };

    // Get subject-wise attendance
    const getSubjectWiseAttendance = (studentId) => {
        try {
            const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
            const studentRecords = records.filter(record => record.studentId === parseInt(studentId));

            return subjects.map(subject => {
                const subjectRecords = studentRecords.filter(record => record.subjectId === subject.id);
                const presentCount = subjectRecords.filter(record => record.status === 'Present').length;
                const percentage = subjectRecords.length > 0 ? (presentCount / subjectRecords.length) * 100 : 0;

                return {
                    subject,
                    percentage,
                    totalClasses: subjectRecords.length,
                    presentClasses: presentCount
                };
            });
        } catch (err) {
            console.error('Error getting subject-wise attendance:', err);
            return [];
        }
    };

    // Render view selection
    if (view === 'select') {
        return (
            <div className='container-fluid bg-primary vh-100 vw-100 d-flex align-items-center justify-content-center'>
                <div className='card' style={{ width: '400px' }}>
                    <div className='card-body'>
                        <h3 className='card-title text-center mb-4'>Attendance System</h3>
                        <div className='d-grid gap-3'>
                            <button 
                                className='btn btn-success btn-lg'
                                onClick={handleTeacherLogin}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Teacher Login'}
                            </button>
                            <button 
                                className='btn btn-primary btn-lg'
                                onClick={() => setView('student-login')}
                                disabled={loading}
                            >
                                Student Login
                            </button>
                            <Link to='/' className='btn btn-secondary btn-lg'>Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render teacher view
    if (view === 'teacher') {
        if (!selectedSubject) {
            return (
                <div className='container-fluid bg-primary vh-100 vw-100'>
                    <div className='row'>
                        <div className='col-md-8 offset-md-2'>
                            <div className='card mt-4'>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between align-items-center mb-4'>
                                        <h3 className='card-title'>Select Subject</h3>
                                        <Link to='/' className='btn btn-success'>Home</Link>
                                    </div>
                                    {error && <div className='alert alert-danger'>{error}</div>}
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : (
                                        <div className='list-group'>
                                            {subjects.map(subject => (
                                                <button
                                                    key={subject.id}
                                                    className='list-group-item list-group-item-action'
                                                    onClick={() => handleSubjectSelect(subject)}
                                                >
                                                    <h5>{subject.name}</h5>
                                                    <p className='mb-0'>Teacher: {subject.teacher}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className='container-fluid bg-primary vh-100 vw-100'>
                <div className='row'>
                    <div className='col-md-10 offset-md-1'>
                        <div className='card mt-4'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-center mb-4'>
                                    <h3 className='card-title'>{selectedSubject.name} - Attendance</h3>
                                    <div>
                                        <button 
                                            className='btn btn-secondary me-2'
                                            onClick={() => setSelectedSubject(null)}
                                        >
                                            Back to Subjects
                                        </button>
                                        <Link to='/' className='btn btn-success'>Home</Link>
                                    </div>
                                </div>
                                
                                {error && <div className='alert alert-danger'>{error}</div>}
                                {success && <div className='alert alert-success'>{success}</div>}

                                <div className='mb-4'>
                                    <label className='form-label'>Select Date:</label>
                                    <input
                                        type='date'
                                        className='form-control'
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>

                                <div className='table-responsive'>
                                    <table className='table table-striped'>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => {
                                                const todayRecord = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
                                                    .find(record => 
                                                        record.date === selectedDate && 
                                                        record.studentId === student.ID &&
                                                        record.subjectId === selectedSubject.id
                                                    );

                                                return (
                                                    <tr key={student.ID}>
                                                        <td>{student.ID}</td>
                                                        <td>{student.NAME}</td>
                                                        <td>{student.EMAIL}</td>
                                                        <td>
                                                            {todayRecord ? (
                                                                <span className={`badge ${todayRecord.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                                                                    {todayRecord.status}
                                                                </span>
                                                            ) : (
                                                                <span className='badge bg-secondary'>Not Marked</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {!todayRecord && (
                                                                <>
                                                                    <button 
                                                                        className='btn btn-success btn-sm me-2'
                                                                        onClick={() => markAttendance(student.ID, 'Present')}
                                                                    >
                                                                        Present
                                                                    </button>
                                                                    <button 
                                                                        className='btn btn-danger btn-sm'
                                                                        onClick={() => markAttendance(student.ID, 'Absent')}
                                                                    >
                                                                        Absent
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render student login
    if (view === 'student-login') {
        return (
            <div className='container-fluid bg-primary vh-100 vw-100'>
                <div className='row'>
                    <div className='col-md-6 offset-md-3'>
                        <div className='card mt-4'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-center mb-4'>
                                    <h3 className='card-title'>Student Login</h3>
                                    <Link to='/' className='btn btn-success'>Home</Link>
                                </div>
                                {error && <div className='alert alert-danger'>{error}</div>}
                                <form onSubmit={handleStudentIdSubmit}>
                                    <div className='mb-3'>
                                        <label htmlFor='studentId' className='form-label'>Enter Student ID</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='studentId'
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <button 
                                        type='submit' 
                                        className='btn btn-primary w-100'
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'View Attendance'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render teacher attendance view
    if (view === 'teacher-attendance') {
        return (
            <div className='container-fluid bg-primary vh-100 vw-100'>
                <div className='row'>
                    <div className='col-md-10 offset-md-1'>
                        <div className='card mt-4'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-center mb-4'>
                                    <h3 className='card-title'>{selectedSubject.name} - Attendance</h3>
                                    <div>
                                        <button 
                                            className='btn btn-secondary me-2'
                                            onClick={() => setView('teacher')}
                                        >
                                            Back to Subjects
                                        </button>
                                        <Link to='/' className='btn btn-success'>Home</Link>
                                    </div>
                                </div>
                                
                                {error && <div className='alert alert-danger'>{error}</div>}
                                {success && <div className='alert alert-success'>{success}</div>}

                                <div className='mb-4'>
                                    <label className='form-label'>Select Date:</label>
                                    <input
                                        type='date'
                                        className='form-control'
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>

                                <div className='table-responsive'>
                                    <table className='table table-striped'>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => {
                                                const todayRecord = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
                                                    .find(record => 
                                                        record.date === selectedDate && 
                                                        record.studentId === student.ID &&
                                                        record.subjectId === selectedSubject.id
                                                    );

                                                return (
                                                    <tr key={student.ID}>
                                                        <td>{student.ID}</td>
                                                        <td>{student.NAME}</td>
                                                        <td>{student.EMAIL}</td>
                                                        <td>
                                                            {todayRecord ? (
                                                                <span className={`badge ${todayRecord.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                                                                    {todayRecord.status}
                                                                </span>
                                                            ) : (
                                                                <span className='badge bg-secondary'>Not Marked</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {!todayRecord && (
                                                                <>
                                                                    <button 
                                                                        className='btn btn-success btn-sm me-2'
                                                                        onClick={() => markAttendance(student.ID, 'Present')}
                                                                    >
                                                                        Present
                                                                    </button>
                                                                    <button 
                                                                        className='btn btn-danger btn-sm'
                                                                        onClick={() => markAttendance(student.ID, 'Absent')}
                                                                    >
                                                                        Absent
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render student view
    if (view === 'student') {
        const student = students.find(s => s.ID === parseInt(studentId));
        
        if (!student) {
            return (
                <div className='container-fluid bg-primary vh-100 vw-100'>
                    <div className='row'>
                        <div className='col-md-8 offset-md-2'>
                            <div className='card mt-4'>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between align-items-center mb-4'>
                                        <h3 className='card-title'>Student Not Found</h3>
                                        <div>
                                            <button 
                                                className='btn btn-secondary me-2'
                                                onClick={() => setStudentId('')}
                                            >
                                                Back
                                            </button>
                                            <Link to='/' className='btn btn-success'>Home</Link>
                                        </div>
                                    </div>
                                    <div className='alert alert-danger'>
                                        No student found with ID: {studentId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className='container-fluid bg-primary vh-100 vw-100'>
                <div className='row'>
                    <div className='col-md-10 offset-md-1'>
                        <div className='card mt-4'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-center mb-4'>
                                    <div>
                                        <h3 className='card-title'>Student Attendance Report</h3>
                                        <p className='text-muted mb-0'>
                                            Name: {student.NAME} | ID: {student.ID} | Email: {student.EMAIL}
                                        </p>
                                    </div>
                                    <div>
                                        <button 
                                            className='btn btn-secondary me-2'
                                            onClick={() => setStudentId('')}
                                        >
                                            Back
                                        </button>
                                        <Link to='/' className='btn btn-success'>Home</Link>
                                    </div>
                                </div>

                                <div className='mb-4'>
                                    <div className='btn-group'>
                                        <button 
                                            className={`btn ${attendanceView === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setAttendanceView('daily')}
                                        >
                                            Daily View
                                        </button>
                                        <button 
                                            className={`btn ${attendanceView === 'subject' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setAttendanceView('subject')}
                                        >
                                            Subject View
                                        </button>
                                    </div>
                                </div>

                                {attendanceView === 'daily' && (
                                    <div className='mb-4'>
                                        <label className='form-label'>Select Date:</label>
                                        <input
                                            type='date'
                                            className='form-control'
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </div>
                                )}
                                
                                {error && <div className='alert alert-danger'>{error}</div>}
                                
                                <div className='table-responsive'>
                                    <table className='table table-striped'>
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Teacher</th>
                                                {attendanceView === 'daily' ? (
                                                    <>
                                                        <th>Status</th>
                                                        <th>Time</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th>Attendance %</th>
                                                        <th>Total Classes</th>
                                                        <th>Present</th>
                                                        <th>Absent</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceView === 'daily' ? (
                                                getDateWiseAttendance(studentId).map((record, index) => (
                                                    <tr key={index}>
                                                        <td>{record.subjectName}</td>
                                                        <td>{subjects.find(s => s.id === record.subjectId)?.teacher}</td>
                                                        <td>
                                                            <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                getSubjectWiseAttendance(studentId).map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{data.subject.name}</td>
                                                        <td>{data.subject.teacher}</td>
                                                        <td>
                                                            <div className='progress'>
                                                                <div 
                                                                    className={`progress-bar ${data.percentage >= 75 ? 'bg-success' : 'bg-warning'}`}
                                                                    role='progressbar'
                                                                    style={{ width: `${data.percentage}%` }}
                                                                >
                                                                    {data.percentage.toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{data.totalClasses}</td>
                                                        <td>{data.presentClasses}</td>
                                                        <td>{data.totalClasses - data.presentClasses}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {attendanceView === 'subject' && (
                                    <div className='mt-4'>
                                        <h5>Overall Attendance Summary</h5>
                                        <div className='row'>
                                            <div className='col-md-4'>
                                                <div className='card bg-light'>
                                                    <div className='card-body'>
                                                        <h6 className='card-title'>Total Classes</h6>
                                                        <p className='card-text h3'>
                                                            {getSubjectWiseAttendance(studentId).reduce((sum, data) => sum + data.totalClasses, 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-4'>
                                                <div className='card bg-light'>
                                                    <div className='card-body'>
                                                        <h6 className='card-title'>Present Classes</h6>
                                                        <p className='card-text h3'>
                                                            {getSubjectWiseAttendance(studentId).reduce((sum, data) => sum + data.presentClasses, 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-4'>
                                                <div className='card bg-light'>
                                                    <div className='card-body'>
                                                        <h6 className='card-title'>Overall Percentage</h6>
                                                        <p className='card-text h3'>
                                                            {(() => {
                                                                const total = getSubjectWiseAttendance(studentId).reduce((sum, data) => sum + data.totalClasses, 0);
                                                                const present = getSubjectWiseAttendance(studentId).reduce((sum, data) => sum + data.presentClasses, 0);
                                                                return total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '0%';
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {attendanceView === 'daily' && (
                                    <div className='mt-4'>
                                        <h5>Daily Summary</h5>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className='card bg-light'>
                                                    <div className='card-body'>
                                                        <h6 className='card-title'>Classes for {selectedDate}</h6>
                                                        <p className='card-text h3'>
                                                            {getDateWiseAttendance(studentId).length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='card bg-light'>
                                                    <div className='card-body'>
                                                        <h6 className='card-title'>Present Classes</h6>
                                                        <p className='card-text h3'>
                                                            {getDateWiseAttendance(studentId).filter(record => record.status === 'Present').length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Attendance; 