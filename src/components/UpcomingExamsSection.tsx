import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, DollarSign, Award, CheckCircle2, 
  ArrowRight, ShieldCheck, AlertCircle, Sparkles, BookOpen, Layers,
  Users, CheckCircle
} from 'lucide-react';
import { Exam } from '../types';

interface UpcomingExamsSectionProps {
  onApplyOrBook: (exam: Exam) => void;
}

export default function UpcomingExamsSection({ onApplyOrBook }: UpcomingExamsSectionProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReleasedExams = () => {
    fetch('/api/exams?publishedOnly=true')
      .then(res => res.json())
      .then(data => {
        // Exclude any draft exams per Spec #2
        const released = (data || []).filter((e: Exam) => 
          e.status && e.status !== 'Draft' && e.status !== 'draft'
        );
        setExams(released);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching released exams:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReleasedExams();
    // Poll every 10 seconds to auto-update when Super Admin publishes an exam or modifies slots
    const pollInterval = setInterval(fetchReleasedExams, 10000);
    const handleFocus = () => fetchReleasedExams();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (!loading && exams.length === 0) {
    return null; // Don't render empty section if no exams are currently published
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-[#0B192C] to-slate-950 text-white relative overflow-hidden" id="upcoming-exams-section">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Assessment Release & Slot Booking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Upcoming & Released Examinations
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Official entrance, scholarship, and career aptitude evaluations approved by the NEXORA Examination Authority. Super Administrator publishes exact exam dates and monitored time slots for student booking.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Anti-Cheating Monitored Engine</span>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {exams.map((exam) => {
              const formattedDuration = exam.durationMinutes >= 60 
                ? `${Math.floor(exam.durationMinutes / 60)} Hour${exam.durationMinutes >= 120 ? 's' : ''}${exam.durationMinutes % 60 ? ` ${exam.durationMinutes % 60} Mins` : ''}`
                : `${exam.durationMinutes} Minutes`;

              const activeSlots = exam.slots || [];
              const totalCapacity = activeSlots.reduce((acc, s) => acc + (s.capacity || 0), 0);
              const totalBooked = activeSlots.reduce((acc, s) => acc + (s.bookedCount || 0), 0);
              const totalAvailable = Math.max(0, totalCapacity - totalBooked);

              return (
                <div 
                  key={exam.id} 
                  className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 p-7 shadow-2xl flex flex-col justify-between transition-all hover:shadow-blue-900/20 group"
                >
                  <div className="space-y-5">
                    {/* Top Row: Title & Registration Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold block mb-1">
                          Assessment Code: {exam.id}
                        </span>
                        <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                          {exam.title}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 self-start">
                        <CheckCircle2 className="h-3 w-3" />
                        {exam.status || 'Registration Open'}
                      </span>
                    </div>

                    {/* Official Exam Date Highlight Banner */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-950/80 via-[#0B192C] to-slate-900 rounded-2xl border border-blue-600/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-300 block">Published Examination Date</span>
                          <span className="font-black text-white text-sm tracking-wide">
                            {exam.date || 'Scheduled for November 2026'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Slot Availability</span>
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">
                          {activeSlots.length > 0 ? `${totalAvailable} Seats Open` : 'Open Window'}
                        </span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {exam.description || 'Comprehensive evaluation assessing academic aptitude, problem solving, and domain knowledge for college selection and scholarship awards.'}
                    </p>

                    {/* Exam Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-400" />
                          Duration
                        </span>
                        <p className="font-extrabold text-white">{formattedDuration}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-emerald-400" />
                          Exam Fee
                        </span>
                        <p className="font-extrabold text-emerald-400">
                          {exam.fee ? `₹${exam.fee}` : 'Sponsored'}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                          <Award className="h-3 w-3 text-purple-400" />
                          Pass Mark
                        </span>
                        <p className="font-extrabold text-purple-300">{exam.passPercentage || 50}%</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                          <Layers className="h-3 w-3 text-blue-400" />
                          Stream
                        </span>
                        <p className="font-extrabold text-blue-300 truncate">{exam.course || 'All Streams'}</p>
                      </div>
                    </div>

                    {/* Admin Decided Slots & Timings List */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Time Slots Decided by Super Admin ({activeSlots.length}):
                        </span>
                        <span className="text-[10px] text-slate-400">Lock your preferred timing</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {activeSlots.length > 0 ? (
                          activeSlots.map((slot) => {
                            const seatsLeft = Math.max(0, slot.capacity - (slot.bookedCount || 0));
                            const isFull = seatsLeft === 0;

                            return (
                              <div 
                                key={slot.id} 
                                className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                                  isFull 
                                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-bold text-white">
                                    <span className={`h-2 w-2 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                                    <span>{slot.startTime} – {slot.endTime}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {slot.date || exam.date} &bull; {isFull ? 'Slot Full' : `${seatsLeft} seats left`}
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono border ${
                                  isFull 
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                }`}>
                                  {isFull ? 'Full' : 'Available'}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 p-3 bg-slate-950/50 rounded-xl text-center text-xs text-slate-400 border border-slate-800">
                            Super Administrator is scheduling time slots. Registration is open.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scheduling & Publication Timeline */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-300 py-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Exam Slot Booking:
                        </span>
                        <span className="font-bold text-white font-mono">
                          {exam.bookingStart ? new Date(exam.bookingStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '15 Oct'} – {exam.bookingEnd ? new Date(exam.bookingEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Oct 2026'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 py-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          Official Result Date:
                        </span>
                        <span className="font-bold text-amber-300 font-mono">
                          {exam.resultPublishAt ? new Date(exam.resultPublishAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '25 October 2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-400" />
                      <span>Choose and lock your preferred time slot upon application</span>
                    </div>

                    <button
                      onClick={() => onApplyOrBook(exam)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                    >
                      <span>Apply & Book Slot</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

