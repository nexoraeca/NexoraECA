import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MessageSquare, 
  Sparkles, 
  Building, 
  ArrowRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { persistContactMessage } from '../utils/persistentStorage';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  recipientEmail: string;
}

const SUBJECT_OPTIONS = [
  "Admission & University Enrollment Guidance",
  "IAS Integrated Degree Track",
  "Scholarships & Financial Assistance Guidance",
  "Career Assessment (NACAT) & Counseling",
  "Hostel, Campus Visit & Infrastructure",
  "Partner University Enlistment / Institutional",
  "Other / General Enquiry"
];

const DEFAULT_RECIPIENT = "nexoraeca@gmail.com";

export default function ContactFormSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
    recipientEmail: DEFAULT_RECIPIENT
  });

  const [customSubject, setCustomSubject] = useState<boolean>(false);
  const [showRecipientConfig, setShowRecipientConfig] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    referenceId: string;
    recipientEmail: string;
    message: string;
  } | null>(null);

  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const errors = {
    name: touched.name && !formData.name.trim() ? "Full name is required" : "",
    email: touched.email && (!formData.email.trim() || !validateEmail(formData.email)) 
      ? "Valid email address is required" 
      : "",
    subject: touched.subject && !formData.subject.trim() ? "Please select or enter a subject" : "",
    message: touched.message && (!formData.message.trim() || formData.message.trim().length < 10)
      ? "Message must be at least 10 characters" 
      : "",
    recipientEmail: touched.recipientEmail && formData.recipientEmail && !validateEmail(formData.recipientEmail)
      ? "Recipient email must be valid" 
      : ""
  };

  const isFormValid = 
    formData.name.trim() !== '' &&
    validateEmail(formData.email) &&
    formData.subject.trim() !== '' &&
    formData.message.trim().length >= 10 &&
    (!formData.recipientEmail || validateEmail(formData.recipientEmail));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true, recipientEmail: true });

    if (!isFormValid) {
      setError("Please fix the highlighted errors before sending your message.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          recipientEmail: formData.recipientEmail || DEFAULT_RECIPIENT
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to deliver message. Please try again.");
      }

      const msgRecord = {
        id: data.referenceId || "MSG-" + Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        recipientEmail: data.recipientEmail || formData.recipientEmail || DEFAULT_RECIPIENT,
        submittedAt: new Date().toISOString()
      };
      persistContactMessage(msgRecord);

      setSuccessInfo({
        referenceId: msgRecord.id,
        recipientEmail: msgRecord.recipientEmail,
        message: data.message || "Your message has been successfully routed."
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: SUBJECT_OPTIONS[0],
      message: '',
      recipientEmail: DEFAULT_RECIPIENT
    });
    setCustomSubject(false);
    setSuccessInfo(null);
    setError(null);
    setTouched({});
  };

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="contact-section">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5 text-blue-400" />
            Direct Admissions Desk & Support
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Get in Touch with Our Advisors
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Have questions about admissions, eligibility, scholarships, or specialty IAS tracks? Send us a message and our expert counseling team will respond promptly.
          </p>
        </div>

        {/* 2-Column Responsive Layout: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Contact Cards & Office Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Quick Contact Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#0057D9]" />
                  Admissions Helpline
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting students across 28 States & 8 Union Territories
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Phone Numbers */}
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">Admissions & Support Helpline</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <a href="tel:+917997754555" className="font-bold text-white text-sm hover:text-blue-400 transition-colors">
                        +91 79977 54555
                      </a>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <a href="tel:+917670845590" className="font-bold text-white text-sm hover:text-blue-400 transition-colors">
                        +91 76708 45590
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Email Delivery Desk</span>
                    <a href="mailto:nexoraeca@gmail.com" className="font-bold text-white text-sm hover:text-emerald-400 transition-colors break-all">
                      nexoraeca@gmail.com
                    </a>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Headquarters & Counseling Hub</span>
                    <p className="font-semibold text-white text-xs mt-0.5">
                      NEXORA Academy Tower, Naidupet, Koretapadu Road, Guntur - 522007, Andhra Pradesh, India
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Counselling Hours</span>
                    <p className="font-semibold text-white text-xs mt-0.5">
                      Mon – Sat: 9:00 AM – 7:00 PM IST (Sunday Live Chat Available)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guaranteed Response Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-900/40 border border-blue-500/30 rounded-3xl p-5 text-xs text-slate-300 flex items-center gap-3.5">
              <Sparkles className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Guaranteed Fast Response</span>
                <span>Our certified senior counselors review all submissions within 2 business hours.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Functional Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 relative">
              
              {/* Success View */}
              {successInfo ? (
                <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold">
                      Reference ID: {successInfo.referenceId}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      Message Successfully Sent!
                    </h3>
                    <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                      {successInfo.message}
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Recipient Email:</span>
                      <span className="font-mono font-bold text-blue-700">{successInfo.recipientEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Sender Name:</span>
                      <span className="font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-semibold text-slate-800">{formData.subject}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Active Form View */
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Send an Enquiry / Message
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Fill out the form below. All inquiries are delivered directly to the designated admissions inbox.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onBlur={() => setTouched({ ...touched, name: true })}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none transition-all ${
                          errors.name ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0057D9]'
                        }`}
                        id="contact-name-input"
                      />
                      {errors.name && (
                        <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => setTouched({ ...touched, email: true })}
                        placeholder="e.g. rahul@example.com"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none transition-all ${
                          errors.email ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0057D9]'
                        }`}
                        id="contact-email-input"
                      />
                      {errors.email && (
                        <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>
                      )}
                    </div>

                  </div>

                  {/* Row 2: Phone & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Phone (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0057D9] transition-all"
                        id="contact-phone-input"
                      />
                    </div>

                    {/* Subject Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Subject <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setCustomSubject(!customSubject)}
                          className="text-[11px] text-[#0057D9] hover:underline font-semibold"
                        >
                          {customSubject ? "Choose from list" : "Custom subject"}
                        </button>
                      </div>

                      {customSubject ? (
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          onBlur={() => setTouched({ ...touched, subject: true })}
                          placeholder="Type custom subject"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0057D9] transition-all"
                          id="contact-subject-custom-input"
                        />
                      ) : (
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0057D9] transition-all cursor-pointer"
                          id="contact-subject-select"
                        >
                          {SUBJECT_OPTIONS.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>

                  </div>

                  {/* Recipient Email Config / Destination Option */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        Routing To: <strong className="text-slate-800 font-mono">{formData.recipientEmail}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRecipientConfig(!showRecipientConfig)}
                        className="text-[11px] text-[#0057D9] hover:underline font-semibold"
                      >
                        {showRecipientConfig ? "Hide target email" : "Change destination"}
                      </button>
                    </div>

                    {showRecipientConfig && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Destination Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.recipientEmail}
                          onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                          placeholder="e.g. nexoraeca@gmail.com"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#0057D9]"
                        />
                        <p className="text-[10px] text-slate-500">
                          Submissions will be dispatched and routed to this inbox.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Message / Inquiry <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      onBlur={() => setTouched({ ...touched, message: true })}
                      placeholder="Please share details about your queries, desired program, 12th stream/percentage, or specific assistance required..."
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none transition-all resize-none ${
                        errors.message ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0057D9]'
                      }`}
                      id="contact-message-input"
                    />
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      {errors.message ? (
                        <span className="text-rose-500">{errors.message}</span>
                      ) : (
                        <span className="text-slate-400">Minimum 10 characters</span>
                      )}
                      <span className="text-slate-400 font-mono">{formData.message.length} chars</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className={`w-full py-3.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 group shadow-md ${
                        loading
                          ? 'bg-blue-600 text-white opacity-90 cursor-wait animate-pulse'
                          : !isFormValid
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                            : 'bg-[#0057D9] hover:bg-[#004dc2] text-white shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                      }`}
                      id="contact-submit-btn"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Routing & Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Message to Admissions Desk</span>
                        </>
                      )}
                    </button>

                    {!isFormValid && (
                      <p className="text-center text-[11px] text-slate-400 mt-2">
                        Please complete all required fields (* Name, Email, Subject, Message) to send.
                      </p>
                    )}
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
