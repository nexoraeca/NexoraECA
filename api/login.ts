// Vercel Serverless Function for /api/login
import type { IncomingMessage, ServerResponse } from 'http';

interface VercelReq extends IncomingMessage {
  body?: any;
  query?: any;
  method?: string;
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (data: any) => void;
  send: (body: any) => void;
  setHeader: (name: string, value: string) => this;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Parse body if it came as a string or stream
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  } else if (!body) {
    body = {};
  }

  const rawUsername = (body.username || body.email || body.loginId || '').trim();
  const rawPassword = (body.password || '').trim();
  const inputUser = rawUsername.toLowerCase();

  if (!rawUsername || !rawPassword) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  // Master credentials
  // 1. Super Admin
  if (
    (inputUser === 'nexoraeca@gmail.com' || inputUser === 'superadmin' || inputUser === 'director@educonnectindia.in' || inputUser === 'super_admin') &&
    (rawPassword === 'Bharath@123' || rawPassword === 'superadmin123' || rawPassword === 'super123' || rawPassword === 'SaiBharath@2026')
  ) {
    res.status(200).json({
      role: 'super_admin',
      fullName: 'Dr. R. K. Varma (Chief Executive & Super Admin)',
      username: 'nexoraeca@gmail.com',
      email: 'nexoraeca@gmail.com'
    });
    return;
  }

  // 2. Admin
  if (
    (inputUser === 'admin' || inputUser === 'admin@educonnectindia.in') &&
    (rawPassword === 'Bharath@123' || rawPassword === 'admin123' || rawPassword === 'admin')
  ) {
    res.status(200).json({
      role: 'admin',
      fullName: 'Prof. Rajesh Sengupta (Admissions Admin)',
      username: 'admin',
      email: 'admin@educonnectindia.in'
    });
    return;
  }

  // 3. Counsellor
  if (
    (inputUser === 'counsellor' || inputUser === 'counselor' || inputUser === 'lakshmi.prasad@educonnect.in' || inputUser === 'lakshmi@educonnect.in') &&
    (rawPassword === 'counsel123' || rawPassword === 'counsellor123' || rawPassword === 'Bharath@123')
  ) {
    res.status(200).json({
      role: 'counsellor',
      fullName: 'Dr. Lakshmi Prasad',
      username: 'counsellor',
      email: 'lakshmi.prasad@educonnect.in',
      counsellor: {
        id: 'COUNSEL-001',
        fullName: 'Dr. Lakshmi Prasad',
        email: 'lakshmi.prasad@educonnect.in',
        phone: '+91 98450 12345',
        specialization: 'Admissions & Engineering Counseling',
        status: 'available',
        activeCases: 12
      }
    });
    return;
  }

  // 4. Student (Aryan Sharma / demo student)
  if (
    (inputUser === 'aryan@example.com' || inputUser === 'student' || inputUser === 'edu-2026-001' || inputUser === 'student123') &&
    (rawPassword === 'student123' || rawPassword === 'password123' || rawPassword === 'student' || rawPassword === 'Bharath@123')
  ) {
    res.status(200).json({
      role: 'student',
      fullName: 'Aryan Sharma',
      username: 'student',
      email: 'aryan@example.com',
      student: {
        id: 'EDU-2026-001',
        fullName: 'Aryan Sharma',
        email: 'aryan@example.com',
        mobile: '+91 98765 43210',
        city: 'Hyderabad',
        state: 'Telangana',
        marks12th: 88,
        interestedCourse: 'B.Tech Computer Science & AI',
        preferredState: 'Telangana',
        admissionStatus: 'Counseling',
        examScore: 82,
        assignedCounsellorName: 'Dr. Lakshmi Prasad'
      }
    });
    return;
  }

  // 5. Additional demo students
  if (
    inputUser === 'priyapatel36' &&
    (rawPassword === 'pass1428' || rawPassword === 'student123' || rawPassword === 'Bharath@123')
  ) {
    res.status(200).json({
      role: 'student',
      fullName: 'Priya Patel',
      username: 'priyapatel36',
      email: 'priyapatel@example.com',
      student: {
        id: 'user-1786892124687',
        fullName: 'Priya Patel',
        email: 'priyapatel@example.com',
        mobile: '+91 98765 11223',
        city: 'Ahmedabad',
        state: 'Gujarat',
        marks12th: 92,
        interestedCourse: 'B.Tech IT',
        preferredState: 'Gujarat',
        admissionStatus: 'Eligible',
        examScore: 89,
        assignedCounsellorName: 'Dr. Lakshmi Prasad'
      }
    });
    return;
  }

  res.status(401).json({ error: 'Invalid Login ID or Password.' });
}
