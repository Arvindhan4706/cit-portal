const API_URL = 'http://localhost:5001/api';

async function request(path, method = 'GET', body = null, token = null) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

async function runWorkflow() {
  console.log('--- Starting E2E Workflow Test ---');

  try {
    // 1. Coordinator Logs in
    console.log('1. Logging in as Coordinator...');
    const coordLogin = await request('/auth/login', 'POST', {
      email: 'admin@citchennai.net', // The mock admin
      password: 'admin',
      expectedRole: 'FACULTY' // Coordinators use FACULTY login flow in AuthForm
    });
    const coordToken = coordLogin.token;
    console.log('   Coordinator Login Success!');

    // 2. Coordinator creates an event
    console.log('\n2. Creating an Event...');
    const eventCreate = await request('/events', 'POST', {
      title: 'E2E Integration Summit',
      date: new Date(Date.now() + 86400000).toISOString(),
      venue: 'Main Auditorium',
      capacity: 100
    }, coordToken);
    const eventId = eventCreate.id;
    console.log(`   Event Created! ID: ${eventId}`);

    // 3. Coordinator uploads registrations
    console.log('\n3. Uploading Student Registrations...');
    const importReq = await request(`/events/${eventId}/import`, 'POST', {
      emails: ['alice@citchennai.net', 'bob@citchennai.net']
    }, coordToken);
    console.log(`   Import Result: ${importReq.message}`);

    // 4. Student Logs In
    console.log('\n4. Logging in as Student (alice@citchennai.net)...');
    const studentLogin = await request('/auth/login', 'POST', {
      email: 'alice@citchennai.net',
      password: 'password123', // From mock data
      expectedRole: 'STUDENT'
    });
    const studentToken = studentLogin.token;
    console.log('   Student Login Success!');

    // 5. Student fetches their pass
    console.log('\n5. Fetching Student Digital Pass (QR)...');
    const qrReq = await request(`/events/qr/${eventId}`, 'GET', null, studentToken);
    const qrToken = qrReq.qrToken;
    console.log('   QR Token Generated Successfully!');

    // 6. Faculty scans and verifies the pass
    console.log('\n6. Faculty Verifying the pass (Classroom Check)...');
    const verifyReq = await request('/scan/verify', 'POST', {
      token: qrToken
    }, coordToken);
    console.log(`   Verification Success: ${verifyReq.student.name} is registered for ${verifyReq.event.title}`);

    // 7. Coordinator scans the pass at the venue
    console.log('\n7. Coordinator Scanning the pass (Venue Check)...');
    const scanReq = await request('/scan', 'POST', {
      token: qrToken,
      eventId: eventId
    }, coordToken);
    console.log(`   Scan Success: ${scanReq.message}`);

    console.log('\n--- E2E Workflow Test Completed Successfully! ---');

  } catch (error) {
    console.error('\n--- E2E WORKFLOW FAILED ---');
    console.error(error.message);
  }
}

runWorkflow();
