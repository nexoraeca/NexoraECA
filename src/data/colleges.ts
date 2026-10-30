import { College } from '../types';

export const DEFAULT_COLLEGES: College[] = [
  // --- GUJARAT ---
  {
    id: 'ganpat-univ',
    name: 'Ganpat University',
    state: 'Gujarat',
    city: 'Mehsana',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Leading private university offering innovative technical and professional education in North Gujarat.',
    about: 'Ganpat University (GUNI) is established under the State Act. It is a highly respected, high-tech campus spread over 300 acres of green land. GUNI is committed to academic excellence and industry-focused curriculum.',
    imageUrl: '/images/ganpat_university.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '42.0 LPA',
    averagePackage: '6.2 LPA',
    placementRate: '92%',
    recruiters: ['Tata Consultancy Services', 'Reliance Industries', 'L&T Infotech', 'Cognizant', 'Adani Group'],
    courses: [
      { name: 'B.Tech Computer Engineering', duration: '4 Years', fees: '1,20,000 / year' },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: '1,20,000 / year' },
      { name: 'IAS Integrated Degree', duration: '3 Years', fees: '75,000 / year' },
      { name: 'MBA Business Analytics', duration: '2 Years', fees: '1,10,000 / year' },
      { name: 'BBA', duration: '3 Years', fees: '65,000 / year' }
    ],
    infrastructure: ['Advanced Compute Labs', 'Robotics Innovation Center', 'Smart Classrooms', '3D Printing Lab', 'Central Library with 100,000+ books'],
    hostelInfo: 'Modern AC and Non-AC rooms with 24/7 Wi-Fi, laundry, gym, and hygienic vegetarian cafeteria.',
    sportsFacilities: ['Cricket Stadium', 'Football Turf', 'Indoor Badminton Courts', 'Olympic-size Swimming Pool', 'Gymnasium'],
    facultyCount: 450,
    reviews: [
      { author: 'Mehul Patel', rating: 5, text: 'Amazing campus with super modern laboratories. The placement team is really helpful.' },
      { author: 'Sonal Shah', rating: 4, text: 'GUNI is known for industry collaborations. I got a paid internship in my final semester!' }
    ],
    admissionProcess: 'Admission through national/state level entrance tests (GUJCET/JEE) or merit list through counseling.'
  },
  {
    id: 'gokul-univ',
    name: 'Gokul Global University',
    state: 'Gujarat',
    city: 'Siddhpur',
    naacGrade: 'B++',
    nbaAccredited: false,
    shortDescription: 'Dedicated to empowering rural and semi-urban students with top-tier education and skill development.',
    about: 'Gokul Global University provides professional, vocational, and technical education across multiple streams. Centered in historic Siddhpur, it has rapidly grown into a prominent regional education hub.',
    imageUrl: '/images/gokul_university.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '15.5 LPA',
    averagePackage: '4.1 LPA',
    placementRate: '85%',
    recruiters: ['Alembic Pharma', 'Suzuki Motors', 'TCS', 'ICICI Bank', 'Tech Mahindra'],
    courses: [
      { name: 'IAS Integrated Degree', duration: '3 Years', fees: '65,000 / year' },
      { name: 'B.Tech Civil Engineering', duration: '4 Years', fees: '85,000 / year' },
      { name: 'B.Sc Agriculture', duration: '4 Years', fees: '70,000 / year' },
      { name: 'Diploma Mechanical Engineering', duration: '3 Years', fees: '45,000 / year' },
      { name: 'B.Ed Education', duration: '2 Years', fees: '60,000 / year' }
    ],
    infrastructure: ['Soil Testing Laboratory', 'Engine Workshops', 'IT Labs', 'Central Seminar Hall'],
    hostelInfo: 'Comfortable living arrangements with nutritious mess food, regular sports access, and tight security.',
    sportsFacilities: ['Kabaddi Field', 'Volleyball Court', 'Athletic Track', 'Table Tennis Room'],
    facultyCount: 220,
    reviews: [
      { author: 'Rahul Rabari', rating: 4, text: 'Great faculty support. The practical agriculture fields are massive and extremely informative.' }
    ],
    admissionProcess: 'Merit list based on class 12th board examination marks.'
  },

  // --- MAHARASHTRA ---
  {
    id: 'sandip-univ',
    name: 'Sandip University',
    state: 'Maharashtra',
    city: 'Nashik',
    naacGrade: 'A+',
    nbaAccredited: true,
    shortDescription: 'A world-class university in Nashik offering global career exposure and state-of-the-art infrastructure.',
    about: 'Sandip University stands as an iconic educational group. Located in the beautiful, serene climate of Nashik, the campus spans 250+ acres. The university is a research-led, tech-driven institution offering international standards.',
    imageUrl: '/images/sandip_university.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '1.11 Crore/year (International)',
    averagePackage: '7.8 LPA',
    placementRate: '95%',
    recruiters: ['Amazon', 'Infosys', 'Capgemini', 'KPIT Technologies', 'Wipro', 'Persistent Systems'],
    courses: [
      { name: 'B.Tech Computer Science & Engineering', duration: '4 Years', fees: '1,80,000 / year' },
      { name: 'B.Tech AI & Machine Learning', duration: '4 Years', fees: '2,00,000 / year' },
      { name: 'Integrated Degree (BA / B.Com + UPSC & Banking Track)', duration: '3 Years', fees: '85,000 / year' },
      { name: 'MBA Global Management', duration: '2 Years', fees: '1,50,000 / year' },
      { name: 'B.Sc Allied Health Sciences', duration: '3 Years', fees: '95,000 / year' }
    ],
    infrastructure: ['Apple iOS Developer Lab', 'BMW Sponsored Automotive Engine Center', 'Amphitheater', 'Wi-Fi enabled campus'],
    hostelInfo: 'Premium apartment-style hostel clusters with study rooms, continuous security, multi-cuisine dining, and recreational lounges.',
    sportsFacilities: ['Basketball Arena', 'Cricket Academy Ground', 'Archery Range', 'Ultra-modern Gymnasium'],
    facultyCount: 510,
    reviews: [
      { author: 'Amit Deshmukh', rating: 5, text: 'Absolutely spectacular campus. Feels like a foreign university. Placements are solid!' }
    ],
    admissionProcess: 'Direct admissions through Sandip University Joint Entrance Exam (SUJEE) or scores from JEE/CET.'
  },

  // --- KARNATAKA ---
  {
    id: 'gibs-business',
    name: 'GIBS Business School',
    state: 'Karnataka',
    city: 'Bengaluru',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'One of the top-ranked premier business schools in Bengaluru, focused on grooming future leaders.',
    about: 'Global Institute of Business Studies (GIBS) has emerged as one of the elite business management institutions. Designed to deliver global standard corporate exposure, GIBS is an absolute destination for BBA and MBA/PGDM candidates.',
    imageUrl: '/images/gibs_business_school.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '18.0 LPA',
    averagePackage: '7.4 LPA',
    placementRate: '100%',
    recruiters: ['Deloitte', 'PwC', 'HDFC Bank', 'Amazon', 'Pepsico', 'Toyota', 'EY'],
    courses: [
      { name: 'BBA - Bachelor of Business Administration', duration: '3 Years', fees: '1,50,000 / year' },
      { name: 'PGDM - Dual Specialization', duration: '2 Years', fees: '3,80,000 / year' }
    ],
    infrastructure: ['Harvard-style Seminar Halls', 'In-house Innovation & Start-up Incubator', 'Corporate Board Room Simulator', 'Rich digital databases'],
    hostelInfo: 'Sophisticated safe housing for both boys and girls with study desks, high-speed fiber internet, and premium dining menu.',
    sportsFacilities: ['Indoor Snooker and Billiards Room', 'Table Tennis Area', 'Badminton Court', 'Cardio Gym Room'],
    facultyCount: 85,
    reviews: [
      { author: 'Karan Sharma', rating: 5, text: 'The Corporate Finishing School program at GIBS is a game-changer. Prepared me perfectly for PwC interviews!' }
    ],
    admissionProcess: 'Based on GIBS entrance test, group discussion, and personal interview rounds.'
  },
  {
    id: 'dhanwantari-coll',
    name: 'Dhanwantari College',
    state: 'Karnataka',
    city: 'Bengaluru',
    naacGrade: 'B+',
    nbaAccredited: false,
    shortDescription: 'Specialized healthcare and medical sciences college preparing competent nursing and allied health professionals.',
    about: 'Dhanwantari College of Nursing and Allied Health Sciences is a respected healthcare training institution in Bengaluru. The college specializes in providing highly rigorous practical internships in corporate hospitals.',
    imageUrl: '/images/dhanwantari_college.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '8.5 LPA',
    averagePackage: '4.8 LPA',
    placementRate: '98%',
    recruiters: ['Fortis Healthcare', 'Apollo Hospitals', 'Manipal Hospitals', 'Columbia Asia', 'Narayana Health'],
    courses: [
      { name: 'B.Sc Nursing', duration: '4 Years', fees: '1,10,000 / year' },
      { name: 'Bachelor of Physiotherapy (BPT)', duration: '4.5 Years', fees: '1,25,000 / year' },
      { name: 'B.Sc Medical Laboratory Technology', duration: '3 Years', fees: '85,000 / year' }
    ],
    infrastructure: ['Advanced Nursing Simulation lab', 'Anatomy and Pathology Lab', 'Dedicated Physiotherapy Clinic', 'Medical Informatics Room'],
    hostelInfo: 'Fully secure, homely hostel rooms with strictly supervised security, clean drinking water, and wholesome regional South/North foods.',
    sportsFacilities: ['Throwball court', 'Badminton Court', 'Indoor Board Games area'],
    facultyCount: 64,
    reviews: [
      { author: 'Anjali Nair', rating: 4, text: 'Amazing placement tie-ups. Most of my seniors got placed in top-tier corporate hospitals during clinical postings.' }
    ],
    admissionProcess: 'Merit-based on class 12th science marks (Biology, Chemistry, Physics).'
  },
  {
    id: 'mvm-medical',
    name: 'MVM Medical College',
    state: 'Karnataka',
    city: 'Bengaluru',
    naacGrade: 'B++',
    nbaAccredited: false,
    shortDescription: 'Premier institute for Allied Health, Nursing, and Pharmacy studies with multi-specialty clinical training.',
    about: 'MVM Group of Institutions offers highly acclaimed clinical education in Allied Health Sciences and Pharmacy. The campus is known for advanced training programs designed in alignment with international medical boards.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '9.0 LPA',
    averagePackage: '4.9 LPA',
    placementRate: '96%',
    recruiters: ['Aster DM Healthcare', 'Cloudnine Hospitals', 'HCG Oncology', 'Max Healthcare', 'Biocon'],
    courses: [
      { name: 'B.Sc Cardiac Care Technology', duration: '3.5 Years', fees: '1,40,000 / year' },
      { name: 'B.Pharma', duration: '4 Years', fees: '1,20,000 / year' },
      { name: 'B.Sc Imaging Technology', duration: '3.5 Years', fees: '95,000 / year' }
    ],
    infrastructure: ['Diagnostics Research Centre', 'Microbiology Lab', 'Pharmaceutical Chemistry lab', 'Anatomy Models Gallery'],
    hostelInfo: 'Modern living quarters with strict visitor rules, clean dining facilities, study desks, and basic clinical checkups in-house.',
    sportsFacilities: ['Basketball Court', 'Table Tennis Tables', 'Shuttle Badminton Turf'],
    facultyCount: 95,
    reviews: [
      { author: 'Vikram Gowda', rating: 5, text: 'Clinical labs are extremely well-equipped. We get to handle actual diagnostics machines in training.' }
    ],
    admissionProcess: 'Class 12th PCB marks counseling allocation.'
  },
  {
    id: 'izee-group',
    name: 'IZee Group of Institutions',
    state: 'Karnataka',
    city: 'Bengaluru',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Empowering professional development through computer applications, management, and nursing programs.',
    about: 'IZee Group is backed by IZee Manpower, a leading corporate recruiting agency. This provides the institution an unparalleled advantage in connecting students with high-profile global business internships.',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1513258496099-48168024addd?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '14.0 LPA',
    averagePackage: '5.8 LPA',
    placementRate: '100%',
    recruiters: ['IBM', 'Wipro', 'Tech Mahindra', 'Accenture', 'Cognizant', 'Standard Chartered'],
    courses: [
      { name: 'BCA (Computer Applications)', duration: '3 Years', fees: '95,000 / year' },
      { name: 'BBA - Aviation Management', duration: '3 Years', fees: '1,10,000 / year' },
      { name: 'B.Sc Nursing', duration: '4 Years', fees: '1,20,000 / year' }
    ],
    infrastructure: ['Interactive Tech Labs', 'Aviation Mock Cabin Lounge', 'Nursing Clinical ward', 'High-Speed Wi-Fi Zones'],
    hostelInfo: 'Cozy campus residential suites with separate dietary menus for diverse regional students.',
    sportsFacilities: ['Cricket nets', 'Mini Football field', 'Carrom & Chess club'],
    facultyCount: 110,
    reviews: [
      { author: 'Meghna Roy', rating: 4, text: 'Since the college is owned by a recruitment agency, the placement preparation and soft skills bootcamps start from Year 1!' }
    ],
    admissionProcess: 'Written analytical test followed by Counselor Interview.'
  },
  {
    id: 'yenepoya-univ',
    name: 'Yenepoya University',
    state: 'Karnataka',
    city: 'Mangaluru',
    naacGrade: 'A+',
    nbaAccredited: true,
    shortDescription: 'Renowned medical, dental, and health sciences university with a giant medical college campus.',
    about: 'Yenepoya is the first private university in Mangaluru. It is highly prestigious, housing over 1,000 beds in its multi-specialty medical training hospital. Offering robust medicine, nursing, dental, and advanced healthcare programs.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1582750433449-649350141f16?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '32.0 LPA',
    averagePackage: '8.2 LPA',
    placementRate: '95%',
    recruiters: ['Yenepoya Medical Hospital', 'KMC Hospital', 'Medanta', 'Apollo Lifecare', 'Aster Group'],
    courses: [
      { name: 'B.Sc Nursing Science', duration: '4 Years', fees: '1,50,000 / year' },
      { name: 'BPT (Physiotherapy)', duration: '4.5 Years', fees: '1,60,000 / year' },
      { name: 'B.Sc Medical Laboratory Technology', duration: '3 Years', fees: '1,10,000 / year' },
      { name: 'B.Sc Cyber Security & Forensics', duration: '3 Years', fees: '1,30,000 / year' }
    ],
    infrastructure: ['Yenepoya Multi-specialty Hospital', 'Dentistry simulation center', 'Robotic Surgery unit', 'Advanced Bio-Research center'],
    hostelInfo: 'AC hostel apartments with modern study lounges, high-tech cafeteria supplying nutritious customized diets.',
    sportsFacilities: ['FIFA Accredited Soccer Ground', 'Professional Tennis Courts', 'Indoor Basketball Arena', 'In-house Health Club'],
    facultyCount: 780,
    reviews: [
      { author: 'Dr. Fatima Rizwan', rating: 5, text: 'Clinical exposure at Yenepoya is unparalleled. You get to interact with thousands of outpatients under expert guidance.' }
    ],
    admissionProcess: 'Through Yenepoya Entrance Exam (YUEE) or NEET eligibility counseling.'
  },

  // --- TAMIL NADU ---
  {
    id: 'hindusthan-tech',
    name: 'Hindusthan Institute of Technology',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Center of technical innovation in Coimbatore providing top-notch computer science and engineering degrees.',
    about: 'Hindusthan Institute of Technology is dedicated to providing high-quality engineering and technology research studies. With modern infrastructural amenities, industry partnerships, and academic accolades.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '22.0 LPA',
    averagePackage: '5.2 LPA',
    placementRate: '91%',
    recruiters: ['Cognizant', 'CTS', 'ZOHO Corp', 'Infosys', 'Ford India', 'Mindtree'],
    courses: [
      { name: 'B.Tech CS & AI', duration: '4 Years', fees: '1,20,000 / year' },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: '1,20,000 / year' },
      { name: 'B.E. Electronics & Communication', duration: '4 Years', fees: '1,10,000 / year' }
    ],
    infrastructure: ['Intel IoT Center of Excellence', 'Digital Library with IEEE access', 'Heavy Machine Workshop', 'R&D Incubation Cell'],
    hostelInfo: 'Modern residential dormitories with separate dining areas serving clean, vegetarian and non-vegetarian menus.',
    sportsFacilities: ['Professional Football Turf', 'All-weather Basketball Arena', 'Indoor Table Tennis Halls'],
    facultyCount: 280,
    reviews: [
      { author: 'Vignesh Kumar', rating: 4, text: 'The Coimbatore environment combined with our outstanding technical training makes Hindusthan a great choice.' }
    ],
    admissionProcess: 'Tamil Nadu Engineering Admissions (TNEA) single-window counseling or management merit seats.'
  },
  {
    id: 'excel-engg',
    name: 'Excel Engineering College',
    state: 'Tamil Nadu',
    city: 'Namakkal',
    naacGrade: 'A+',
    nbaAccredited: true,
    shortDescription: 'An autonomous engineering campus known for experiential learning and incredible placement record.',
    about: 'Excel Group of Institutions is one of the premier educational groups in South India. Nestled in Namakkal, the autonomous college is widely admired for research labs, innovation hubs, and corporate placements.',
    imageUrl: 'https://images.unsplash.com/photo-1595799613836-3b2ff1c9003b?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '18.0 LPA',
    averagePackage: '4.8 LPA',
    placementRate: '94%',
    recruiters: ['TCS', 'Wipro', 'KPIT', 'Renault Nissan', 'Biocon', 'ZOHO Corp'],
    courses: [
      { name: 'B.E. Computer Science & Engg', duration: '4 Years', fees: '95,000 / year' },
      { name: 'B.Tech AI & Data Science', duration: '4 Years', fees: '1,05,000 / year' },
      { name: 'B.Tech Agriculture Engineering', duration: '4 Years', fees: '85,000 / year' }
    ],
    infrastructure: ['Automotive testing laboratory', 'CNC machinery cell', 'IoT and Embedded systems labs', 'Eco-friendly smart campus'],
    hostelInfo: 'Spacious individual and shared rooms with high levels of sanitization, pure drinking water filters, and balanced meals.',
    sportsFacilities: ['400m Track Field', 'Kabaddi Sand ground', 'Volleyball Turf courts'],
    facultyCount: 310,
    reviews: [
      { author: 'Prasanna Selvam', rating: 5, text: 'Practical instruction is very emphasized. The faculty members are friendly and guide you in publishing research patents.' }
    ],
    admissionProcess: 'Admissions based on TNEA Counseling merit list or Direct eligibility entrance tests.'
  },

  // --- ANDHRA PRADESH ---
  {
    id: 'vignan-univ',
    name: 'Vignan University',
    state: 'Andhra Pradesh',
    city: 'Guntur',
    naacGrade: 'A+',
    nbaAccredited: true,
    shortDescription: 'Deemed-to-be University specializing in cutting-edge engineering research and student entrepreneurship.',
    about: 'Vignans Foundation for Science, Technology & Research (Deemed to be University) provides a high-quality academic base. It promotes interdisciplinary projects, hands-on industrial experiences, and premium professional ethics.',
    imageUrl: '/images/vignan_university.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '44.0 LPA',
    averagePackage: '6.5 LPA',
    placementRate: '98%',
    recruiters: ['Amazon', 'Infosys', 'TCS', 'Capgemini', 'IBM', 'HCL', 'Accenture'],
    courses: [
      { name: 'B.Tech Computer Science & Engg', duration: '4 Years', fees: '2,10,000 / year' },
      { name: 'B.Tech Cyber Security', duration: '4 Years', fees: '1,90,000 / year' },
      { name: 'Integrated Degree (BA / B.Com + UPSC & Bank PO Foundation)', duration: '3 Years', fees: '80,000 / year' },
      { name: 'B.Tech Agricultural Engineering', duration: '4 Years', fees: '1,60,000 / year' },
      { name: 'MBA Financial Analysis', duration: '2 Years', fees: '1,20,000 / year' }
    ],
    infrastructure: ['Aeronautics simulator room', 'Bio-Informatics Research hub', 'Nvidia GPU computing lab', 'Huge Sports Complex'],
    hostelInfo: 'Superior living facilities with separate wings, organic steam-cooked food, high-speed campus fiber internet, and 24/7 security surveillance.',
    sportsFacilities: ['Athletic Stadium', 'Tennis Clay Courts', 'Volleyball Clay courts', 'Modern Weightlifting Gym'],
    facultyCount: 580,
    reviews: [
      { author: 'Chandra Sekhar', rating: 5, text: 'Vignan has changed my life. The skill-development labs and campus mock drives prepares you perfectly for recruiters.' }
    ],
    admissionProcess: 'Through Vignan Joint Entrance Exam (VSAT) or JEE Mains/AP EAPCET rank counseling.'
  },
  {
    id: 'chalapathi-inst',
    name: 'Chalapathi Institute of Pharmaceutical Sciences',
    state: 'Andhra Pradesh',
    city: 'Guntur',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'One of APs finest pharmacy education institutes, offering highly accredited Pharma.D and B.Pharm studies.',
    about: 'Chalapathi Institute (CLPT) is dedicated exclusively to training high-level pharmaceutical professionals. Affiliated with major hospitals for real Pharma.D diagnostics practice and clinical research training.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '12.0 LPA',
    averagePackage: '4.5 LPA',
    placementRate: '95%',
    recruiters: ['Dr. Reddys Laboratories', 'Aurobindo Pharma', 'Divis Labs', 'Hetero Drugs', 'Sun Pharma'],
    courses: [
      { name: 'B.Pharma', duration: '4 Years', fees: '95,000 / year' },
      { name: 'Pharma.D (Doctor of Pharmacy)', duration: '6 Years', fees: '1,80,000 / year' }
    ],
    infrastructure: ['Advanced Pharmacology testing wing', 'Instrumental Analysis center', 'Herbarium Garden', 'Machine Room'],
    hostelInfo: 'Extremely peaceful study-focused hostel accommodation with clean dining spaces and disciplined security guidelines.',
    sportsFacilities: ['Shuttle Badminton Courts', 'Tennikoit Courts', 'Carrom tables'],
    facultyCount: 78,
    reviews: [
      { author: 'Pavani Reddy', rating: 4, text: 'The drug testing labs here are highly advanced. We get real industry exposure during project submissions.' }
    ],
    admissionProcess: 'Based on rank achieved in AP EAPCET (Pharmacy stream) counseling list.'
  },
  {
    id: 'nri-tech',
    name: 'NRI Institute of Technology',
    state: 'Andhra Pradesh',
    city: 'Vijayawada',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Popular technical campus in Vijayawada offering core placements in tech and manufacturing sectors.',
    about: 'NRI Institute of Technology (NRIIT) has grown into a prime educational asset for technological development in Andhra Pradesh. Known for extensive soft-skill bootcamps and exceptional training centers.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '20.0 LPA',
    averagePackage: '5.1 LPA',
    placementRate: '93%',
    recruiters: ['TCS', 'Cognizant', 'Mindtree', 'L&T Infotech', 'Mphasis', 'ValueLabs'],
    courses: [
      { name: 'B.Tech CSE - Data Science', duration: '4 Years', fees: '1,10,000 / year' },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: '1,10,000 / year' },
      { name: 'B.Tech Electronics & Comm', duration: '4 Years', fees: '1,00,000 / year' }
    ],
    infrastructure: ['Fully centralized computer center', 'Digital libraries', 'IoT prototype hubs', 'Spacious seminar rooms'],
    hostelInfo: 'Separated girls and boys hostels on-campus with tasty Telugu meals, safety surveillance, and reading libraries.',
    sportsFacilities: ['Volleyball court', 'Throwball play field', 'Cricket nets'],
    facultyCount: 245,
    reviews: [
      { author: 'Suresh Kumar', rating: 4, text: 'Awesome college life. The campus placement team brings multiple MNCs every year.' }
    ],
    admissionProcess: 'Through AP EAPCET Engineering counseling quota allocation.'
  },
  {
    id: 'kits-engg',
    name: 'KITS Engineering College',
    state: 'Andhra Pradesh',
    city: 'Guntur',
    naacGrade: 'B++',
    nbaAccredited: false,
    shortDescription: 'Fostering technological competence and moral values through high-quality professional learning.',
    about: 'KKR & KSR Institute of Technology and Sciences (KITS) represents quality technical education in Guntur. Highly prioritized for innovative projects, robotic clubs, and technical fests.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '16.0 LPA',
    averagePackage: '4.5 LPA',
    placementRate: '90%',
    recruiters: ['Capgemini', 'IBM', 'Tech Mahindra', 'Cognizant', 'Broadridge'],
    courses: [
      { name: 'B.Tech Computer Science Engineering', duration: '4 Years', fees: '95,000 / year' },
      { name: 'B.Tech AI & Data Science', duration: '4 Years', fees: '95,000 / year' }
    ],
    infrastructure: ['Advanced AI & Robotics Lab', 'English communication lab', 'Interactive seminar galleries'],
    hostelInfo: 'Equipped residential accommodation, secure compound wall gates, study-hours supervision, and wholesome meals.',
    sportsFacilities: ['Basketball court', 'Table Tennis boards', 'Cricket practice fields'],
    facultyCount: 195,
    reviews: [
      { author: 'Lakshmi Prasanna', rating: 4, text: 'Very disciplined college. Regular training events and hackathons keep the computer students active.' }
    ],
    admissionProcess: 'Through AP EAPCET entrance test.'
  },

  // --- TELANGANA ---
  {
    id: 'nxtwave-campus',
    name: 'NxtWave Partner Campus',
    state: 'Telangana',
    city: 'Hyderabad',
    naacGrade: 'A+',
    nbaAccredited: true,
    shortDescription: 'Industry-first educational campus in Hyderabad offering direct intensive software placements alongside university degrees.',
    about: 'Partnering with premium technological colleges, NxtWave Partner Campus in Hyderabad infuses CCBP 4.0 intensive tech training with formal engineering streams. This model prepares students directly for elite software developer careers with high salary packages.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513258496099-48168024addd?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '46.0 LPA',
    averagePackage: '8.5 LPA',
    placementRate: '100%',
    recruiters: ['NxtWave Partner Networks', 'Microsoft', 'Uber', 'Amazon', 'Deloitte', 'Cognizant', 'ZOHO Corp'],
    courses: [
      { name: 'B.Tech CSE - AI & Data Science', duration: '4 Years', fees: '2,20,000 / year' },
      { name: 'B.Tech CSE - Cyber Security', duration: '4 Years', fees: '2,20,000 / year' }
    ],
    infrastructure: ['Interactive Coding Playgrounds', 'Elite Software Engineering Incubator', 'Modern Hackathon halls', 'Smart Tech spaces'],
    hostelInfo: 'Superior tech-focused hostel spaces with high-speed fiber internet in all rooms, and coding zones in residential areas.',
    sportsFacilities: ['Indoor Badminton Courts', 'Squash Court', 'Multi-room Gym', 'Volleyball Turf'],
    facultyCount: 160,
    reviews: [
      { author: 'Chaitanya Goud', rating: 5, text: 'The hands-on technical coding training is next-level. I cleared advanced programming rounds of Amazon through this!' }
    ],
    admissionProcess: 'CCBP Analytical Skill Test and Technical counseling interviews.'
  },
  {
    id: 'cmr-univ',
    name: 'CMR University',
    state: 'Telangana',
    city: 'Medchal',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Premier technological and management university in Medchal, known for global standard incubation hubs.',
    about: 'CMR Group is a massive brand in engineering and management education. Spread across extensive acres in Medchal, Telangana, CMR University is dedicated to developing tech leaders who can contribute globally.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '38.0 LPA',
    averagePackage: '6.1 LPA',
    placementRate: '96%',
    recruiters: ['Amazon', 'Infosys', 'Cognizant', 'TCS', 'Capgemini', 'Virtusa', 'Wipro'],
    courses: [
      { name: 'B.Tech Computer Science & Engg', duration: '4 Years', fees: '1,80,000 / year' },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: '1,60,000 / year' },
      { name: 'MBA Business Intelligence', duration: '2 Years', fees: '1,20,000 / year' }
    ],
    infrastructure: ['Center of Excellence in Big Data', 'Mechanical Innovation Centers', 'Central Libraries', 'Advanced Auditorium'],
    hostelInfo: 'Modern safe hostel setups with premium laundry, multi-diet dining halls, and 24/7 security support.',
    sportsFacilities: ['Cricket Stadium Ground', 'Football Turf Arena', 'Shuttle Badminton courts'],
    facultyCount: 460,
    reviews: [
      { author: 'Aravind Reddy', rating: 5, text: 'The atmosphere of CMR Medchal is beautiful. Very energetic technical fests and solid placements.' }
    ],
    admissionProcess: 'Based on rank achieved in TG EAPCET or national engineering eligibility examinations.'
  },
  {
    id: 'malla-reddy',
    name: 'Malla Reddy University',
    state: 'Telangana',
    city: 'Maisammaguda',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'One of the largest private state universities in Hyderabad, featuring multi-specialty technical schools.',
    about: 'Malla Reddy University (MRU) is established with massive, world-class educational infrastructures. It delivers globally competitive technical and management curriculum backed by research, innovation, and direct multinational corporate placements.',
    imageUrl: '/images/malla_reddy_university.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '40.0 LPA',
    averagePackage: '6.4 LPA',
    placementRate: '97%',
    recruiters: ['Amazon', 'Microsoft', 'TCS Ninja', 'Capgemini', 'IBM', 'Tech Mahindra', 'Cognizant'],
    courses: [
      { name: 'B.Tech CSE - AI & ML', duration: '4 Years', fees: '2,00,000 / year' },
      { name: 'B.Tech CSE - Data Science', duration: '4 Years', fees: '1,90,000 / year' },
      { name: 'Integrated Degree (BA / B.Com + Civil Services / Bank Exam Prep)', duration: '3 Years', fees: '85,000 / year' },
      { name: 'B.Sc Agriculture (Hons)', duration: '4 Years', fees: '1,10,000 / year' },
      { name: 'MBA Digital Marketing', duration: '2 Years', fees: '1,30,000 / year' }
    ],
    infrastructure: ['Nvidia Deep Learning Institute', 'Agriculture Research fields', 'Advanced chemistry labs', 'Wi-Fi enabled campus squares'],
    hostelInfo: 'Modern air-conditioned residential spaces, safe gates, clean state-of-the-art mess kitchen providing diverse Indian meals.',
    sportsFacilities: ['Full-size Cricket turf', 'Football courts', 'Professional Volleyball sand court', 'Table Tennis rooms'],
    facultyCount: 520,
    reviews: [
      { author: 'Sai Kiran', rating: 5, text: 'Massive university. The peer learning and college events are very inspiring. Direct placements are top-tier.' }
    ],
    admissionProcess: 'Through TG EAPCET ranking or Malla Reddy University Entrance Test (MRUET).'
  },

  // --- TAPASYA COLLEGE (TELANGANA & ANDHRA PRADESH) ---
  {
    id: 'tapasya-college',
    name: 'Tapasya College (Tapasya Educational Institutions)',
    state: 'Telangana',
    city: 'Hyderabad & Vijayawada',
    naacGrade: 'A',
    nbaAccredited: true,
    shortDescription: 'Premier commerce, management, computer science, and creative arts college with campuses in Telangana & Andhra Pradesh.',
    about: 'Tapasya College (Tapasya Educational Institutions) is one of South India’s most renowned higher education networks with cutting-edge campuses in Hyderabad, Secunderabad, and Vijayawada. Specializing in career-focused undergraduate degrees after 10+2 / Intermediate, Tapasya delivers industry-driven coaching in Commerce, Business Analytics, Computer Science, Economics, Fashion Designing, and Interior Design alongside integrated professional certifications (ACCA, CMA, CA foundation, Civil Services & Banking mentorship).',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'
    ],
    highestPackage: '16.5 LPA',
    averagePackage: '5.8 LPA',
    placementRate: '96%',
    recruiters: [
      'Deloitte',
      'Ernst & Young (EY)',
      'PwC',
      'KPMG',
      'Amazon',
      'ICICI Bank',
      'HDFC Bank',
      'Genpact',
      'Wipro',
      'Tech Mahindra'
    ],
    campusLocations: [
      'Hyderabad (Telangana): Narayanaguda, Lakdikapul, Dilsukhnagar, Kukatpally, Secunderabad, Madhapur',
      'Andhra Pradesh: Vijayawada (Benz Circle & Governorpet), Guntur, Visakhapatnam'
    ],
    courses: [
      { name: 'B.Com — Finance', duration: '3 Years', fees: '65,000 / year' },
      { name: 'B.Com — Computer Applications', duration: '3 Years', fees: '70,000 / year' },
      { name: 'B.Com — Taxation', duration: '3 Years', fees: '65,000 / year' },
      { name: 'B.Com — Business Analytics', duration: '3 Years', fees: '85,000 / year' },
      { name: 'BBA (Bachelor of Business Administration)', duration: '3 Years', fees: '80,000 / year' },
      { name: 'BBA Business Analytics', duration: '3 Years', fees: '95,000 / year' },
      { name: 'B.Sc Computer Science', duration: '3 Years', fees: '75,000 / year' },
      { name: 'B.Sc Economics', duration: '3 Years', fees: '70,000 / year' },
      { name: 'BA Interior Design', duration: '3 Years', fees: '90,000 / year' },
      { name: 'BA Fashion Designing', duration: '3 Years', fees: '90,000 / year' }
    ],
    eligibility: 'Passed 10+2 / Intermediate (MEC, CEC, MPC, BiPC, HEC) or CBSE / ICSE / State Board equivalent from a recognized board with minimum 50% aggregate marks.',
    qualificationsAccepted: [
      '10+2 / Intermediate (MEC, CEC, MPC, BiPC, HEC)',
      'CBSE Class XII',
      'ICSE / ISC Class XII',
      'State Open School (TOSS / APOSS)'
    ],
    admissionDetails: 'Direct Merit Admissions based on Intermediate / 10+2 marks, followed by personalized career counseling and personal interview. Early-bird merit scholarships up to 40% are available for top performers.',
    admissionProcess: 'Direct online admission through EduConnect / Walk-in counseling with Intermediate marks memo, Transfer Certificate, and ID proof.',
    contactInfo: {
      phone: '+91 99887 76655 / 1800 200 4567 / 040-27558899',
      email: 'admissions@tapasyacollege.in / info@tapasyacollege.in',
      address: 'Central Campus: 3-6-524, Beside Minerva Coffee Shop, Himayatnagar / Narayanaguda, Hyderabad, Telangana - 500029'
    },
    websiteUrl: 'https://www.tapasyacollege.in',
    infrastructure: [
      'Air-conditioned Smart Interactive Classrooms',
      'High-End Computer Science & Analytics Labs',
      'Dedicated Fashion Design Studios & Sewing Labs',
      'Interior Architecture & Drafting Labs',
      'Finance Trading Simulator & Digital Library',
      'State-of-the-Art Auditorium & Seminar Halls'
    ],
    hostelInfo: 'Separate safe, modern hostel accommodations for boys & girls with Wi-Fi, hygienic cafeteria meals, and 24/7 security.',
    sportsFacilities: ['Indoor Recreation Lounge', 'Table Tennis Arena', 'Badminton Court', 'Yoga & Fitness Zone'],
    facultyCount: 180,
    reviews: [
      { author: 'K. Sai Praneeth (B.Com Analytics)', rating: 5, text: 'Tapasya is the top destination for commerce and analytics in Hyderabad. Big 4 companies like Deloitte and EY hire regularly!' },
      { author: 'Meghana R. (BA Fashion Designing)', rating: 5, text: 'The design studios and hands-on workshops are incredible. Highly supportive faculty and great industry exposure.' }
    ]
  }
];
export const COURSES = [
  {
    category: 'Engineering (B.Tech)',
    items: ['Computer Science & Eng (CSE)', 'Electronics & Comm (ECE)', 'Information Technology (IT)', 'Mechanical Engineering', 'Civil Engineering']
  },
  {
    category: 'Management (BBA/MBA)',
    items: ['BBA Finance', 'BBA Marketing', 'MBA General', 'MBA Business Analytics', 'MBA Human Resources']
  },
  {
    category: 'Medical & Allied (B.Sc/B.Pharma)',
    items: ['Bachelor of Pharmacy', 'B.Sc Biotechnology', 'B.Sc Nursing', 'B.Sc Food Technology', 'B.Sc Microbiology']
  },
  {
    category: 'Computer Apps (BCA/MCA)',
    items: ['BCA Software Systems', 'BCA Cloud Computing', 'MCA Applications', 'MCA Cyber Security', 'MCA Artificial Intelligence']
  },
  {
    category: 'Commerce & Arts (B.Com/BA)',
    items: ['B.Com Honors', 'B.Com Accounting', 'BA Economics', 'BA English Literature', 'BA Journalism']
  },
  {
    category: 'Integrated Degree (IAS / IPS & Bank Jobs)',
    items: ['BA + Civil Services Foundation (IAS/IPS Focus)', 'B.Com + Banking & Insurance (IBPS/SBI PO & Clerk)', 'B.Sc + UPSC / State PSC Civil Services', 'Integrated BBA + Competitive Exams Coaching', 'Degree + Aptitude, Reasoning & Bank Exam Mentorship']
  }
];
