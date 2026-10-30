export const DEFAULT_COURSE_STREAMS = [
  'Engineering',
  'Management',
  'Computer Applications',
  'Commerce',
  'Healthcare',
  'B.Com (Finance, Analytics, Taxation, Computers)',
  'BBA & BBA Business Analytics',
  'B.Sc Computer Science',
  'B.Sc Economics',
  'BA Fashion & Interior Design',
  'B.Tech Engineering (CSE, AI, IT)',
  'Integrated Degree (Civil Services & Bank Jobs)'
];

export function deriveCourseStreamsFromCollege(college: Partial<College>): string[] {
  if (Array.isArray(college.courseStreams) && college.courseStreams.length > 0) {
    return college.courseStreams;
  }
  const streams = new Set<string>();
  const courses = college.courses || [];
  courses.forEach(co => {
    const name = (co.name || '').toLowerCase();
    const type = (co.type || '').toLowerCase();

    if (name.includes('b.tech') || name.includes('cse') || name.includes('engineering') || name.includes('it') || name.includes('ai')) {
      streams.add('Engineering');
      streams.add('B.Tech Engineering (CSE, AI, IT)');
    }
    if (name.includes('bba') || name.includes('mba') || name.includes('management') || name.includes('pgdm')) {
      streams.add('Management');
      if (name.includes('bba')) streams.add('BBA & BBA Business Analytics');
    }
    if (name.includes('bca') || name.includes('mca') || name.includes('software') || name.includes('computer application')) {
      streams.add('Computer Applications');
    }
    if (name.includes('b.sc computer') || name.includes('computer science')) {
      streams.add('B.Sc Computer Science');
      streams.add('Computer Applications');
    }
    if (name.includes('b.com') || name.includes('commerce') || name.includes('accounting') || name.includes('finance')) {
      streams.add('Commerce');
      streams.add('B.Com (Finance, Analytics, Taxation, Computers)');
    }
    if (name.includes('nursing') || name.includes('pharma') || name.includes('health') || name.includes('medical') || name.includes('ayurveda') || name.includes('physiotherapy')) {
      streams.add('Healthcare');
    }
    if (name.includes('ias') || name.includes('civil') || name.includes('integrated') || name.includes('upsc') || name.includes('bank')) {
      streams.add('Integrated Degree (Civil Services & Bank Jobs)');
    }
    if (name.includes('fashion') || name.includes('design') || name.includes('interior')) {
      streams.add('BA Fashion & Interior Design');
    }
    if (name.includes('economics')) {
      streams.add('B.Sc Economics');
    }
  });

  return Array.from(streams);
}

export interface College {
  id: string;
  name: string;
  state: string;
  city: string;
  naacGrade: string;
  nbaAccredited: boolean;
  shortDescription: string;
  about: string;
  imageUrl: string;
  gallery: string[];
  highestPackage: string;
  averagePackage: string;
  placementRate: string;
  recruiters: string[];
  courses: { name: string; duration: string; type?: string; fees?: string }[];
  courseStreams?: string[];
  infrastructure: string[];
  hostelInfo: string;
  sportsFacilities: string[];
  facultyCount: number;
  locationMapEmbed?: string;
  reviews: { author: string; rating: number; text: string }[];
  admissionProcess: string;
  campusLocations?: string[];
  eligibility?: string;
  qualificationsAccepted?: string[];
  admissionDetails?: string;
  contactInfo?: {
    phone: string;
    email: string;
    address: string;
  };
  websiteUrl?: string;
}

export interface Registration {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  gender: string;
  dob: string;
  college12th: string;
  board: string;
  marks12th: number;
  address: string;
  city: string;
  state: string;
  interestedCourse: string;
  preferredState: string;
  preferredCollege: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Student {
  id: string; // login id (usually formatted e.g., EDU-2026-001)
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  college12th: string;
  marks12th: number;
  interestedCourse: string;
  preferredState: string;
  assignedExamId?: string;
  assignedCounsellor?: string;
  counsellorNotes?: string;
  admissionStatus: 'Applied' | 'Counseling' | 'Exam Pending' | 'Exam Completed' | 'Offered' | 'Confirmed';
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'true-false' | 'single-choice' | 'multiple-choice';
  options: string[];
  correctAnswers: number[]; // Index of correct option(s)
}

export type ExamStatus = 
  | 'Draft' 
  | 'Published' 
  | 'Registration Open' 
  | 'Booking Open' 
  | 'Scheduled' 
  | 'Live' 
  | 'Completed' 
  | 'Results Scheduled' 
  | 'Results Published' 
  | 'Closed'
  | 'active'
  | 'draft';

export interface ExamSlot {
  id: string;
  examId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status?: 'available' | 'full';
}

export interface ExamRegistration {
  id: string;
  studentId: string;
  examId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  amount?: number;
  paidAt?: string;
  selectedSlotId?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduledAt?: string;
  registrationStatus: 'pending_payment' | 'paid_pending_slot' | 'slot_booked' | 'attempted' | 'completed';
}

export type AttemptStatus = 
  | 'Not Started'
  | 'Scheduled'
  | 'In Progress'
  | 'Submitted'
  | 'Auto Submitted'
  | 'Suspended'
  | 'Under Evaluation'
  | 'Evaluated'
  | 'Result Published';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  course: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  passPercentage: number;
  fee?: number;
  bookingStart?: string;
  bookingEnd?: string;
  resultPublishAt?: string;
  questions: Question[];
  status: ExamStatus;
  slots?: ExamSlot[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamAttempt {
  id?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentCourse?: string;
  examId: string;
  examTitle?: string;
  registrationId?: string;
  answers: { [questionId: string]: number[] };
  questionMarks?: { [questionId: string]: number };
  questionFeedback?: { [questionId: string]: string };
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  status?: AttemptStatus;
  startedAt?: string;
  submittedAt?: string;
  attemptedAt: string;
  timeSpentSeconds?: number;
  securityViolation?: boolean;
  violationCount?: number;
  autoSubmitReason?: string;
  rank?: number;
  evaluationStatus?: 'Pending Review' | 'Under Review' | 'Graded & Verified';
  evaluatorRemarks?: string;
  evaluatorName?: string;
  evaluatedAt?: string;
  isPublished?: boolean;
  resultStatus?: 'Pending' | 'Published';
  scoreVisibleToStudent?: boolean;
  displayScoreOnlyPass?: boolean;
}

export interface CollegeRecommendation {
  id: string;
  studentId: string;
  collegeId: string;
  college?: College;
  recommendedBy: string;
  recommendedByRole: 'super_admin' | 'admin' | 'counsellor';
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  studentId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'counsellor' | 'admin' | 'super_admin';
  message: string;
  timestamp: string;
  sentAt?: string;
  readAt?: string;
  read: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  targetStudentId?: string; // empty means all
  createdAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'counsellor' | 'student';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  mobile?: string;
  studentId?: string;
  specialization?: string;
  status?: 'active' | 'suspended';
  isSuspended?: boolean;
  createdAt?: string;
}

export interface Counsellor {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  specialization: string;
  assignedStudentsCount?: number;
  rating?: number;
  availableDays?: string[];
  active?: boolean;
}

export interface PasswordResetLog {
  id: string;
  timestamp: string;
  eventType: 'otp_requested' | 'reset_success' | 'reset_failed' | 'password_changed' | 'password_change_failed' | 'admin_manual_reset' | 'account_created';
  eventTitle: string;
  userIdentifier: string;
  targetEmail?: string;
  userRole?: string;
  status: 'SUCCESS' | 'FAILED' | 'ATTEMPT';
  ipAddress?: string;
  details: string;
  deliveryService?: 'firebase_auth' | 'resend' | 'brevo' | 'sendgrid' | 'smtp' | 'simulated';
  deliveryStatus?: 'delivered' | 'sent' | 'pending' | 'failed' | 'simulated';
  messageId?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  school12th: string;
  city: string;
  admittedCollege: string;
  course: string;
  packageOrRank: string;
  rating: number;
  avatarUrl?: string;
  initials?: string;
  badgeColor?: string;
  quote: string;
  year: string;
}

export const COURSES = [
  {
    category: "Engineering (B.Tech)",
    items: ["Computer Science & Eng (CSE)", "Electronics & Comm (ECE)", "Information Technology (IT)", "Mechanical Engineering", "Civil Engineering"]
  },
  {
    category: "Management (BBA/MBA)",
    items: ["BBA Finance", "BBA Marketing", "MBA General", "MBA Business Analytics", "MBA Human Resources"]
  },
  {
    category: "Medical & Allied (B.Sc/B.Pharma)",
    items: ["Bachelor of Pharmacy", "B.Sc Biotechnology", "B.Sc Nursing", "B.Sc Food Technology", "B.Sc Microbiology"]
  },
  {
    category: "Computer Apps (BCA/MCA)",
    items: ["BCA Software Systems", "BCA Cloud Computing", "MCA Applications", "MCA Cyber Security", "MCA Artificial Intelligence"]
  },
  {
    category: "Commerce & Professional Degrees (B.Com/BBA)",
    items: [
      "B.Com (Finance, Taxation & Computer Applications)",
      "B.Com Business Analytics",
      "BBA (Bachelor of Business Administration)",
      "BBA Business Analytics",
      "B.Com Honors / Accounting"
    ]
  },
  {
    category: "Sciences, Economics & Creative Design (B.Sc/BA)",
    items: [
      "B.Sc Computer Science",
      "B.Sc Economics",
      "BA Interior Design",
      "BA Fashion Designing",
      "BA Journalism & English"
    ]
  },
  {
    category: "Integrated Degree (IAS / IPS & Bank Jobs)",
    items: ["BA + Civil Services Foundation (IAS/IPS Focus)", "B.Com + Banking & Insurance (IBPS/SBI PO & Clerk)", "B.Sc + UPSC / State PSC Civil Services", "Integrated BBA + Competitive Exams Coaching", "Degree + Aptitude, Reasoning & Bank Exam Mentorship"]
  }
];

