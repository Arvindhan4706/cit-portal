const fs = require('fs');

function generateStudents(count) {
    let csv = 'name,email,password,role,roll_no,department\n';
    const depts = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'BME', 'AI-DS'];
    for (let i = 1; i <= count; i++) {
        const dept = depts[Math.floor(Math.random() * depts.length)];
        const year = ['21', '22', '23', '24'][Math.floor(Math.random() * 4)];
        const rollNum = `${year}${dept}${String(i).padStart(3, '0')}`;
        const name = `Student ${i}`;
        const email = `student${i}@citchennai.net`;
        const password = `password123`;
        csv += `${name},${email},${password},STUDENT,${rollNum},${dept}\n`;
    }
    fs.writeFileSync('students_sample.csv', csv);
    console.log(`Generated students_sample.csv with ${count} records.`);
}

function generateFaculty(count) {
    let csv = 'name,email,password,role,department\n';
    const depts = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'BME', 'AI-DS'];
    for (let i = 1; i <= count; i++) {
        const dept = depts[Math.floor(Math.random() * depts.length)];
        const name = `Faculty ${i}`;
        const email = `faculty${i}@citchennai.net`;
        const password = `password123`;
        csv += `${name},${email},${password},FACULTY,${dept}\n`;
    }
    fs.writeFileSync('faculty_sample.csv', csv);
    console.log(`Generated faculty_sample.csv with ${count} records.`);
}

function generateCoordinators(count) {
    let csv = 'name,email,password,role,department,club_name\n';
    const clubs = ['Coding Club', 'Robotics Club', 'IoT Club', 'AI Club', 'Cybersecurity Club', 'Dance Club', 'Music Club', 'Drama Club', 'Literary Club', 'Photography Club'];
    for (let i = 1; i <= count; i++) {
        const name = `Coordinator ${i}`;
        const email = `coordinator${i}@citchennai.net`;
        const password = `password123`;
        const clubName = clubs[i % clubs.length] + (i >= clubs.length ? ` ${Math.floor(i/clubs.length)}` : '');
        csv += `${name},${email},${password},COORDINATOR,,${clubName}\n`;
    }
    fs.writeFileSync('coordinators_sample.csv', csv);
    console.log(`Generated coordinators_sample.csv with ${count} records.`);
}

generateStudents(1000);
generateFaculty(200);
generateCoordinators(20);
