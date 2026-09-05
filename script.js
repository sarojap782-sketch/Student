// ==========================================================
// SMART ATTENDANCE SYSTEM
// HTML + CSS + JAVASCRIPT
// ==========================================================


// ==========================================================
// COLLEGE LOCATION
// ==========================================================

// Change these coordinates to your college/classroom.

const COLLEGE_LATITUDE = 8.1790;

const COLLEGE_LONGITUDE = 77.4320;

// Allowed distance in metres

const ALLOWED_RADIUS = 100;


// ==========================================================
// STORAGE
// ==========================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendance =
    JSON.parse(localStorage.getItem("attendance")) || [];

let currentStudent =
    JSON.parse(localStorage.getItem("currentStudent")) || null;


// ==========================================================
// PAGE FUNCTIONS
// ==========================================================

function showRegister() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.remove("hidden");
}


function showLogin() {

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ==========================================================
// STUDENT REGISTRATION
// ==========================================================

function registerStudent() {

    const name =
        document.getElementById("studentName").value.trim();

    const roll =
        document.getElementById("studentRoll").value.trim();

    const email =
        document.getElementById("studentEmail").value.trim();

    const password =
        document.getElementById("studentPassword").value;

    if (!name || !roll || !email || !password) {

        alert("Please fill all fields.");

        return;
    }


    // Check duplicate roll number

    const existingStudent = students.find(
        student => student.roll === roll
    );

    if (existingStudent) {

        alert("Roll number already registered.");

        return;
    }


    const newStudent = {

        id: Date.now(),

        name: name,

        roll: roll,

        email: email,

        password: password

    };


    students.push(newStudent);


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    alert("Registration successful!");

    showLogin();
}


// ==========================================================
// STUDENT LOGIN
// ==========================================================

function loginStudent() {

    const roll =
        document.getElementById("loginRollNo").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    const student = students.find(
        student =>
            student.roll === roll &&
            student.password === password
    );


    if (!student) {

        alert("Invalid Roll Number or Password.");

        return;
    }


    currentStudent = student;


    localStorage.setItem(
        "currentStudent",
        JSON.stringify(student)
    );


    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("studentDashboard")
        .classList.remove("hidden");


    loadStudentDashboard();
}


// ==========================================================
// TEACHER LOGIN
// ==========================================================

function teacherLogin() {

    const password =
        prompt("Enter Teacher Password:");

    // Demo password
    if (password !== "admin123") {

        alert("Incorrect teacher password.");

        return;
    }


    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("teacherDashboard")
        .classList.remove("hidden");


    loadTeacherDashboard();
}


// ==========================================================
// LOGOUT
// ==========================================================

function logout() {

    currentStudent = null;

    localStorage.removeItem("currentStudent");

    document
        .getElementById("studentDashboard")
        .classList.add("hidden");

    document
        .getElementById("teacherDashboard")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ==========================================================
// STUDENT DASHBOARD
// ==========================================================

function loadStudentDashboard() {

    document.getElementById(
        "studentDisplayName"
    ).innerText = currentStudent.name;


    document.getElementById(
        "studentDisplayRoll"
    ).innerText = currentStudent.roll;


    updateStudentStatistics();

    displayStudentAttendance();
}


// ==========================================================
// STUDENT STATISTICS
// ==========================================================

function updateStudentStatistics() {

    const studentRecords = attendance.filter(
        record =>
            record.roll === currentStudent.roll
    );


    const totalClasses = getTotalClasses();

    const presentClasses =
        studentRecords.filter(
            record => record.status === "Present"
        ).length;


    const absentClasses =
        Math.max(
            0,
            totalClasses - presentClasses
        );


    let percentage = 0;

    if (totalClasses > 0) {

        percentage =
            (presentClasses / totalClasses) * 100;
    }


    document.getElementById(
        "totalClasses"
    ).innerText = totalClasses;


    document.getElementById(
        "presentClasses"
    ).innerText = presentClasses;


    document.getElementById(
        "absentClasses"
    ).innerText = absentClasses;


    document.getElementById(
        "attendancePercentage"
    ).innerText =
        percentage.toFixed(1) + "%";
}


// ==========================================================
// TOTAL CLASSES
// ==========================================================

function getTotalClasses() {

    const dates = [
        ...new Set(
            attendance.map(
                record => record.date
            )
        )
    ];

    return dates.length;
}


// ==========================================================
// DISPLAY STUDENT ATTENDANCE
// ==========================================================

function displayStudentAttendance() {

    const table =
        document.getElementById(
            "attendanceTable"
        );

    table.innerHTML = "";


    const records = attendance
        .filter(
            record =>
                record.roll === currentStudent.roll
        )
        .sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    records.forEach(record => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${record.date}</td>

            <td>${record.time}</td>

            <td>${record.status}</td>

            <td>${record.distance} m</td>

        `;


        table.appendChild(row);

    });
}


// ==========================================================
// TEACHER - GENERATE QR
// ==========================================================

function generateQR() {

    const qrContainer =
        document.getElementById("qrcode");


    qrContainer.innerHTML = "";


    // Create a unique attendance session

    const token =
        "ATT-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8);


    new QRCode(qrContainer, {

        text: token,

        width: 280,

        height: 280

    });


    localStorage.setItem(
        "activeQR",
        token
    );


    document.getElementById(
        "qrStatus"
    ).innerText =
        "QR Code generated. Students can scan it now.";
}


// ==========================================================
// START QR SCANNER
// ==========================================================

function startScanner() {

    const reader =
        document.getElementById("reader");


    reader.innerHTML = "";


    const scanner =
        new Html5Qrcode("reader");


    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: 250
        },

        qrCodeMessage => {

            scanner.stop();

            processQRCode(qrCodeMessage);

        },

        errorMessage => {

            // Ignore scanning errors
        }

    ).catch(error => {

        alert(
            "Camera could not be started. Please allow camera permission."
        );

        console.error(error);

    });
}


// ==========================================================
// PROCESS QR CODE
// ==========================================================

function processQRCode(token) {

    const activeQR =
        localStorage.getItem("activeQR");


    if (!activeQR) {

        showAttendanceMessage(
            "No active attendance session."
        );

        return;
    }


    if (token !== activeQR) {

        showAttendanceMessage(
            "Invalid QR Code."
        );

        return;
    }


    showAttendanceMessage(
        "QR verified. Checking location..."
    );


    verifyLocation(token);
}


// ==========================================================
// LOCATION VERIFICATION
// ==========================================================

function verifyLocation(token) {

    if (!navigator.geolocation) {

        showAttendanceMessage(
            "Geolocation is not supported by this browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    COLLEGE_LATITUDE,
                    COLLEGE_LONGITUDE
                );


            document.getElementById(
                "locationStatus"
            ).innerText =
                "Distance from college: " +
                distance.toFixed(2) +
                " metres";


            if (distance > ALLOWED_RADIUS) {

                showAttendanceMessage(
                    "❌ Attendance rejected. You are outside the allowed location."
                );

                return;
            }


            markAttendance(
                token,
                distance
            );

        },

        function(error) {

            showAttendanceMessage(
                "❌ Location permission is required."
            );

        },

        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );
}


// ==========================================================
// DISTANCE CALCULATION
// ==========================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;


    const latitude1 =
        lat1 * Math.PI / 180;

    const latitude2 =
        lat2 * Math.PI / 180;


    const differenceLatitude =
        (lat2 - lat1) *
        Math.PI / 180;


    const differenceLongitude =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(
            differenceLatitude / 2
        ) *
        Math.sin(
            differenceLatitude / 2
        )
        +
        Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(
            differenceLongitude / 2
        ) *
        Math.sin(
            differenceLongitude / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


// ==========================================================
// MARK ATTENDANCE
// ==========================================================

function markAttendance(
    token,
    distance
) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const time =
        new Date()
            .toLocaleTimeString();


    // Prevent duplicate attendance

    const alreadyMarked =
        attendance.find(
            record =>
                record.roll === currentStudent.roll &&
                record.date === today
        );


    if (alreadyMarked) {

        showAttendanceMessage(
            "⚠️ Attendance already marked today."
        );

        return;
    }


    const record = {

        id: Date.now(),

        name: currentStudent.name,

        roll: currentStudent.roll,

        date: today,

        time: time,

        status: "Present",

        distance:
            distance.toFixed(2),

        qrToken: token

    };


    attendance.push(record);


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    showAttendanceMessage(
        "✅ Attendance marked successfully!"
    );


    updateStudentStatistics();

    displayStudentAttendance();
}


// ==========================================================
// ATTENDANCE MESSAGE
// ==========================================================

function showAttendanceMessage(message) {

    document.getElementById(
        "attendanceMessage"
    ).innerText = message;
}


// ==========================================================
// TEACHER DASHBOARD
// ==========================================================

function loadTeacherDashboard() {

    updateTeacherStatistics();

    displayStudentMonitoring();

    displayTeacherAttendance();
}


// ==========================================================
// TEACHER STATISTICS
// ==========================================================

function updateTeacherStatistics() {

    const totalStudents =
        students.length;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const presentToday =
        attendance.filter(
            record =>
                record.date === today &&
                record.status === "Present"
        ).length;


    const absentToday =
        Math.max(
            0,
            totalStudents - presentToday
        );


    let rate = 0;

    if (totalStudents > 0) {

        rate =
            (presentToday /
                totalStudents) *
            100;
    }


    document.getElementById(
        "teacherTotalStudents"
    ).innerText = totalStudents;


    document.getElementById(
        "teacherPresentToday"
    ).innerText = presentToday;


    document.getElementById(
        "teacherAbsentToday"
    ).innerText = absentToday;


    document.getElementById(
        "teacherAttendanceRate"
    ).innerText =
        rate.toFixed(1) + "%";
}


// ==========================================================
// STUDENT MONITORING
// ==========================================================

function displayStudentMonitoring() {

    const table =
        document.getElementById(
            "studentMonitoringTable"
        );


    table.innerHTML = "";


    students.forEach(student => {

        const records =
            attendance.filter(
                record =>
                    record.roll === student.roll
            );


        const present =
            records.filter(
                record =>
                    record.status === "Present"
            ).length;


        const total =
            getTotalClasses();


        let percentage = 0;


        if (total > 0) {

            percentage =
                (present / total) * 100;
        }


        let status = "Good";


        if (percentage < 75) {

            status = "Low Attendance";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${student.name}</td>

            <td>${student.roll}</td>

            <td>${student.email}</td>

            <td>${percentage.toFixed(1)}%</td>

            <td>${status}</td>

        `;


        table.appendChild(row);

    });
}


// ==========================================================
// TEACHER ATTENDANCE TABLE
// ==========================================================

function displayTeacherAttendance() {

    const table =
        document.getElementById(
            "teacherAttendanceTable"
        );


    table.innerHTML = "";


    attendance
        .slice()
        .reverse()
        .forEach(record => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${record.name}</td>

                <td>${record.roll}</td>

                <td>${record.date}</td>

                <td>${record.time}</td>

                <td>${record.status}</td>

                <td>${record.distance} m</td>

            `;


            table.appendChild(row);

        });
}