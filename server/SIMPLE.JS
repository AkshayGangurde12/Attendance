const ibmdb = require("ibm_db");
const readline = require('readline');

// Database connection string
const connectionString = "DATABASE=STUDENTS;HOSTNAME=localhost;UID=AKSHAY;PWD=12345;PORT=25000;PROTOCOL=TCPIP";

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Function to validate age
function isValidAge(age) {
    const numAge = parseInt(age);
    return !isNaN(numAge) && numAge > 0 && numAge < 150;
}

// Function to validate gender
function isValidGender(gender) {
    return ['M', 'F', 'O'].includes(gender.toUpperCase());
}

// Function to get user input with validation
function getUserInput() {
    return new Promise((resolve) => {
        const student = {};
        
        function getName() {
            rl.question('Please enter student name (minimum 2 characters): ', (name) => {
                if (name.length < 2) {
                    console.log('Name must be at least 2 characters long. Try again.');
                    getName();
                } else {
                    student.name = name;
                    getEmail();
                }
            });
        }

        function getEmail() {
            rl.question('Please enter valid email address: ', (email) => {
                if (!isValidEmail(email)) {
                    console.log('Invalid email format. Try again.');
                    getEmail();
                } else {
                    student.email = email;
                    getAge();
                }
            });
        }

        function getAge() {
            rl.question('Please enter age (1-150): ', (age) => {
                if (!isValidAge(age)) {
                    console.log('Invalid age. Please enter a number between 1 and 150.');
                    getAge();
                } else {
                    student.age = parseInt(age);
                    getGender();
                }
            });
        }

        function getGender() {
            rl.question('Please enter gender (M/F/O): ', (gender) => {
                if (!isValidGender(gender)) {
                    console.log('Invalid gender. Please enter M, F, or O.');
                    getGender();
                } else {
                    student.gender = gender.toUpperCase();
                    resolve(student);
                }
            });
        }

        getName();
    });
}

// Function to check if table exists
async function checkTableExists(conn, tableName) {
    try {
        const checkSQL = `SELECT 1 FROM SYSCAT.TABLES WHERE TABSCHEMA = CURRENT SCHEMA AND TABNAME = '${tableName}'`;
        const result = await conn.query(checkSQL);
        return result.length > 0;
    } catch (err) {
        console.error("Error checking table existence:", err);
        throw err;
    }
}

// Function to create table if not exists
async function createTableIfNotExists(conn) {
    const tableName = 'STUDENT_DETAILS';
    
    try {
        const tableExists = await checkTableExists(conn, tableName);
        
        if (!tableExists) {
            const createTableSQL = `
                CREATE TABLE ${tableName} (
                    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
                    NAME VARCHAR(100) NOT NULL,
                    EMAIL VARCHAR(100) NOT NULL UNIQUE,
                    AGE INTEGER NOT NULL,
                    GENDER CHAR(1) NOT NULL,
                    PRIMARY KEY (ID)
                )
            `;
            await conn.query(createTableSQL);
            console.log("Table created successfully");
        } else {
            console.log("Table already exists, proceeding with operations");
        }
    } catch (err) {
        if (err.sqlcode === 4136) {
            console.log("Table already exists, proceeding with operations");
        } else {
            console.error("Error creating table:", err);
            throw err;
        }
    }
}

// Function to insert student data
async function insertStudent(conn, studentData) {
    const insertSQL = `
        INSERT INTO STUDENT_DETAILS (NAME, EMAIL, AGE, GENDER) 
        VALUES (?, ?, ?, ?)
    `;
    
    try {
        await conn.query(insertSQL, [studentData.name, studentData.email, studentData.age, studentData.gender]);
        console.log("Student data inserted successfully");
    } catch (err) {
        if (err.sqlcode === -803) {
            console.error("Error: Email already exists in database");
        } else {
            console.error("Error inserting data:", err);
        }
        throw err;
    }
}

// Function to read all students
async function readAllStudents(conn) {
    const selectSQL = "SELECT * FROM STUDENT_DETAILS";
    try {
        const result = await conn.query(selectSQL);
        console.log("\nAll Students:");
        result.forEach(student => {
            console.log(`ID: ${student.ID}, Name: ${student.NAME}, Email: ${student.EMAIL}, Age: ${student.AGE}, Gender: ${student.GENDER}`);
        });
    } catch (err) {
        console.error("Error reading students:", err);
        throw err;
    }
}

// Function to update student
async function updateStudent(conn, id, studentData) {
    const updateSQL = `
        UPDATE STUDENT_DETAILS 
        SET NAME = ?, EMAIL = ?, AGE = ?, GENDER = ? 
        WHERE ID = ?
    `;
    
    try {
        await conn.query(updateSQL, [studentData.name, studentData.email, studentData.age, studentData.gender, id]);
        console.log("Student updated successfully");
    } catch (err) {
        console.error("Error updating student:", err);
        throw err;
    }
}

// Function to delete student
async function deleteStudent(conn, id) {
    const deleteSQL = "DELETE FROM STUDENT_DETAILS WHERE ID = ?";
    try {
        await conn.query(deleteSQL, [id]);
        console.log("Student deleted successfully");
    } catch (err) {
        console.error("Error deleting student:", err);
        throw err;
    }
}

// Function to get student ID
function getStudentId() {
    return new Promise((resolve) => {
        rl.question('Please enter student ID: ', (id) => {
            const numId = parseInt(id);
            if (isNaN(numId) || numId <= 0) {
                console.log('Invalid ID. Please enter a positive number.');
                getStudentId();
            } else {
                resolve(numId);
            }
        });
    });
}

// Main function
async function main() {
    let connection;
    
    try {
        console.log("Connecting to DB2...");
        connection = await ibmdb.open(connectionString);
        console.log("Connected to DB2 successfully");

        // Create table if it doesn't exist
        await createTableIfNotExists(connection);

        while (true) {
            console.log("\nStudent Management System");
            console.log("1. Add Student");
            console.log("2. View All Students");
            console.log("3. Update Student");
            console.log("4. Delete Student");
            console.log("5. Exit");

            const choice = await new Promise(resolve => {
                rl.question('Enter your choice (1-5): ', resolve);
            });

            switch (choice) {
                case '1':
                    const studentData = await getUserInput();
                    await insertStudent(connection, studentData);
                    break;
                case '2':
                    await readAllStudents(connection);
                    break;
                case '3':
                    const updateId = await getStudentId();
                    const updateData = await getUserInput();
                    await updateStudent(connection, updateId, updateData);
                    break;
                case '4':
                    const deleteId = await getStudentId();
                    await deleteStudent(connection, deleteId);
                    break;
                case '5':
                    console.log("Exiting program...");
                    return;
                default:
                    console.log("Invalid choice. Please try again.");
            }
        }

    } catch (err) {
        console.error("\nError:", err.message || err);
    } finally {
        if (connection) {
            await connection.close();
            console.log("Database connection closed");
        }
        rl.close();
    }
}

// Run the program
console.log("Starting Student Management System...\n");
main();