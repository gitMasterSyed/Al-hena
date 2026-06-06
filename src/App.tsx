import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Instagram, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Copy, 
  Trash2, 
  Check, 
  Database,
  ArrowRight,
  X,
  Menu,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { designs } from './data';
import { Branch, Booking } from './types';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'booking' | 'admin'>('home');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('any');
  const [activeSlide, setActiveSlide] = useState(0);
  const [recentBooking, setRecentBooking] = useState<Booking | null>(null);

  // Booking details
  const [step, setStep] = useState(1);
  const [servicePackage, setServicePackage] = useState<'4hr' | 'weekend'>('4hr');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [notes, setNotes] = useState('');

  // 4 Hours reservation variables
  const [singleDate, setSingleDate] = useState('');
  const [singleTimeSlot, setSingleTimeSlot] = useState('14:00 - 18:00');
  const timeSlots = ['09:00 - 13:00', '14:00 - 18:00', '19:00 - 23:00'];

  // Weekend timeline variables
  const [weekendSchedules, setWeekendSchedules] = useState([
    { day: 'Friday', isSelected: false, hours: 2, startTime: '15:00' },
    { day: 'Saturday', isSelected: false, hours: 4, startTime: '12:00' },
    { day: 'Sunday', isSelected: false, hours: 4, startTime: '16:00' }
  ]);

  // Humanity verification: anti bot slider target is 12
  const [captchaSliderVal, setCaptchaSliderVal] = useState(1);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Feedback states
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin secure dashboard
  const [adminPasskey, setAdminPasskey] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [adminQuery, setAdminQuery] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fallbackBranches: Branch[] = [
    {
      id: 'any',
      name: 'Any Boutique of Your Choice',
      mall: 'Any Boutique of Your Choice',
      location: 'Custom booking at any boutique or your designated address',
      address: 'Abu Dhabi, United Arab Emirates',
      phone: '+971 2 493 0221',
      mapUrl: '',
      lat: 24.4539,
      lng: 54.3773
    },
    {
      id: 'khalidiya',
      name: 'Al Hena Partner Boutique - Al Khalidiya',
      mall: 'Khalidiya Partner Boutique',
      location: 'Elite Beauty Salon Wing, Plaza Level',
      address: 'Al Khalidiya, Abu Dhabi',
      phone: '+971 2 493 0222',
      mapUrl: '',
      lat: 24.4711,
      lng: 54.3541
    },
    {
      id: 'muroor',
      name: 'Al Hena Partner Salon - Muroor District',
      mall: 'Muroor Partner Salon',
      location: 'Premium Ladies Lounge, Villa Block',
      address: 'Muroor Area, Abu Dhabi',
      phone: '+971 2 443 7000',
      mapUrl: '',
      lat: 24.4511,
      lng: 54.3934
    },
    {
      id: 'khalifa',
      name: 'Al Hena Partner Studio - Khalifa City',
      mall: 'Khalifa City Partner Studio',
      location: 'Ornate Studio Wing, Main Boulevard',
      address: 'Khalifa City, Abu Dhabi',
      phone: '+971 2 681 8301',
      mapUrl: '',
      lat: 24.4174,
      lng: 54.5822
    }
  ];

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
        } else {
          setBranches(fallbackBranches);
        }
      })
      .catch(() => {
        setBranches(fallbackBranches);
      });
  }, []);

  useEffect(() => {
    setIsCaptchaValid(captchaSliderVal === 12);
  }, [captchaSliderVal]);

  // Gallery slider auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % designs.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || fallbackBranches[0];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % designs.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + designs.length) % designs.length);
  };

  const handleBookNow = (pkg: '4hr' | 'weekend') => {
    setServicePackage(pkg);
    setRecentBooking(null);
    setStep(1);
    setCurrentView('booking');
    setApiError(null);
  };

  const handleNextBookingStepFromHome = (pkg: '4hr' | 'weekend') => {
    setServicePackage(pkg);
    setRecentBooking(null);
    setStep(1);
    setCurrentView('booking');
    setApiError(null);
  };

  const handleToggleWeekendDay = (index: number) => {
    const updated = [...weekendSchedules];
    updated[index].isSelected = !updated[index].isSelected;
    setWeekendSchedules(updated);
  };

  const handleWeekendHoursChange = (index: number, val: number) => {
    const updated = [...weekendSchedules];
    let securedVal = Math.max(1, Math.min(4, val));
    updated[index].hours = securedVal;
    setWeekendSchedules(updated);
  };

  const handleWeekendStartTimeChange = (index: number, val: string) => {
    const updated = [...weekendSchedules];
    updated[index].startTime = val;
    setWeekendSchedules(updated);
  };

  const validateStep = (currentStep: number): boolean => {
    setApiError(null);
    if (currentStep === 1) return true;

    if (currentStep === 2) {
      if (servicePackage === '4hr') {
        if (!singleDate) {
          setApiError('Please select a preferred date for your artistry session.');
          return false;
        }
        if (!singleTimeSlot) {
          setApiError('Please choose your preferred 4-hour reservation slot.');
          return false;
        }
      } else {
        const activeDaysCount = weekendSchedules.filter(s => s.isSelected).length;
        if (activeDaysCount === 0) {
          setApiError('Please select at least one active weekend block day.');
          return false;
        }
      }
      return true;
    }

    if (currentStep === 3) {
      if (!customerName || customerName.trim().length < 2) {
        setApiError('Please enter your full name (minimum 2 characters).');
        return false;
      }
      const cleanMobile = customerMobile.replace(/\s+/g, '');
      const uaePhoneRegex = /^(?:\+971|05)\d{8}$/;
      if (!customerMobile || !uaePhoneRegex.test(cleanMobile)) {
        setApiError('Please enter a valid UAE contact number (+971 XX XXX XXXX or 05XXXXXXXX).');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleStepForward = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setApiError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleBookingSubmission = async () => {
    if (!isCaptchaValid) {
      setApiError('Anti-bot puzzle failed. Please align the slider exactly at 12 dots.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      serviceType: servicePackage,
      selectedBranchId,
      customerName,
      customerMobile,
      notes,
      captchaAnswer: captchaSliderVal,
      singleDate,
      singleTimeSlot,
      weekendSchedules
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setApiError(result.message || 'An error occurred during booking. Please try again.');
      } else {
        setRecentBooking(result.booking);
        setStep(5);
        setCustomerName('');
        setCustomerMobile('');
        setNotes('');
        setSingleDate('');
        setCaptchaSliderVal(1);
        setWeekendSchedules([
          { day: 'Friday', isSelected: false, hours: 2, startTime: '15:00' },
          { day: 'Saturday', isSelected: false, hours: 4, startTime: '12:00' },
          { day: 'Sunday', isSelected: false, hours: 4, startTime: '16:00' }
        ]);
      }
    } catch {
      setApiError('An transmission error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAdminBookings = async () => {
    setAdminError(null);
    setDeleteSuccess(null);
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${adminPasskey}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setAdminError(data.message || 'Failed to authenticate admin access.');
        setIsAdminAuthenticated(false);
      } else {
        setAdminBookings(data.bookings);
        setIsAdminAuthenticated(true);
      }
    } catch {
      setAdminError('Could not communicate with secure database storage API.');
    }
  };

  const deleteAdminBooking = async (id: string) => {
    if (!window.confirm('Are you authorized to cancel this booking?')) {
      return;
    }
    setAdminError(null);
    setDeleteSuccess(null);
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminPasskey}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setAdminError(data.message || 'Failed to delete record.');
      } else {
        setDeleteSuccess(`Booking ${id} was successfully canceled on database.`);
        setAdminBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch {
      setAdminError('Database communication error.');
    }
  };

  const filteredBookings = adminBookings.filter(b => {
    const q = adminQuery.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerMobile.includes(q) ||
      b.branch.mall.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#fbf9f1] text-[#1b1c17] font-sans selection:bg-[#3c0004]/10 selection:text-[#3c0004]">
      {/* Top Banner Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#3c0004] via-[#775a19] to-[#3c0004]"></div>

      {/* STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-[#fed488]/30 bg-[#fbf9f1]/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div 
            onClick={() => { setCurrentView('home'); setStep(1); }} 
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3c0004]/5 text-[#775a19]">
              <Sparkles className="h-5 w-5 text-[#775a19]" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-widest text-[#3c0004] sm:text-2xl">AL HENA</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#775a19] font-semibold">Premium Artistry</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <button 
              onClick={() => setCurrentView('home')}
              className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#3c0004] ${currentView === 'home' ? 'text-[#3c0004]' : 'text-[#564241]'}`}
            >
              Gallery & Boutiques
            </button>
            <button 
              onClick={() => handleBookNow('4hr')}
              className="text-sm font-semibold tracking-wide text-[#564241] transition-colors hover:text-[#3c0004]"
            >
              Services Pricing
            </button>
            <button 
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#775a19] transition-all hover:opacity-85 ${currentView === 'admin' ? 'underline' : ''}`}
            >
              <Database className="h-3.5 w-3.5" />
              Owner Portal
            </button>
            <button 
              onClick={() => handleBookNow('4hr')}
              className="rounded-full bg-gradient-to-r from-[#5d0e11] to-[#3c0004] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow shadow-[#3c0004]/15 transition-all hover:shadow-md active:scale-95 cursor-pointer"
            >
              Book Artistry
            </button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => handleBookNow('4hr')}
              className="rounded-full bg-gradient-to-r from-[#5d0e11] to-[#3c0004] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
            >
              Book Now
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1 text-[#3c0004]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#fed488]/20 bg-[#fbf9f1] px-4 py-4 md:hidden shadow-lg">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg py-2 text-left font-semibold text-[#564241] hover:text-[#3c0004]"
              >
                <span>Gallery & Boutique Outlets</span>
              </button>
              <button 
                onClick={() => { handleBookNow('4hr'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg py-2 text-left font-semibold text-[#564241] ... "
              >
                <span>4-Hour Service Menu</span>
              </button>
              <button 
                onClick={() => { handleBookNow('weekend'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg py-1.5 text-left font-semibold text-[#564241]"
              >
                <span>Weekend Premium Block</span>
              </button>
              <button 
                onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg py-2 text-left font-bold text-[#775a19]"
              >
                <Database className="h-4 w-4 text-[#775a19]" />
                <span>Secure Owner Access</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* VIEWPORT AREA */}
      <main>
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'home' && (
          <>
            {/* HERO PROMOTIONAL BLOCK */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f1] to-[#f5f4ec] py-12 md:py-20 lg:py-24">
              <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full border border-[#775a19]/10 opacity-30"></div>
              <div className="pointer-events-none absolute right-4 bottom-2 h-72 w-72 rounded-full border border-[#3c0004]/5 opacity-30"></div>
              
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                  <div className="space-y-6 lg:col-span-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#775a19]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#775a19]">
                      <Sparkles className="h-3 w-3" />
                      Premium Boutique Henna Artistry
                    </div>
                    
                    <h2 className="font-serif text-3xl font-black leading-tight text-[#3c0004] sm:text-4xl md:text-5xl">
                      Beautiful Mehandi Artistry at Your Preferred Boutique
                    </h2>
                    
                    <p className="text-base leading-relaxed text-[#564241] md:text-lg">
                      Treat yourself to Al Hena’s legendary delicate designs. Book our professional, bespoke henna specialists to meet you at any partner boutique, salon, or premium venue of your preference across Abu Dhabi. 
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button 
                        onClick={() => handleBookNow('4hr')}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5d0e11] to-[#3c0004] px-6 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-[#3c0004]/10 transition-all hover:scale-102 hover:shadow-xl active:scale-95 cursor-pointer"
                      >
                        Book Session New
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <a 
                        href="#sample-gallery"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-[#775a19]/40 bg-white/50 px-6 text-sm font-bold uppercase tracking-widest text-[#775a19] transition-all hover:bg-white hover:text-[#3c0004] active:scale-95"
                      >
                        View Gallery
                      </a>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-[#fed488]/30 pt-6">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#3c0004]">Abu Dhabi</h4>
                        <p className="text-xs text-[#564241]">Partner Lounges</p>
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#3c0004]">100% Organics</h4>
                        <p className="text-xs text-[#564241]">Safe pure dyes</p>
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#3c0004]">Bespoke</h4>
                        <p className="text-xs text-[#564241]">Master Artistry</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="relative overflow-hidden rounded-2xl bg-white p-2.5 shadow-xl shadow-[#3c0004]/5 ring-1 ring-[#fed488]/40">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD588Y8Ff1JYXITQaUr8vOJlwcgqvuSZgS9VbJPrFLK5e6K4lMsBraafnvr8t_nFsUyhR6nKRGunIY1GbGOk4UI4Elg8dsMtE9LDSnyjr0WJkIcHbKmuwY-vtozDw1E1DuOxnLgfG-wyXEmIU-5iHWaAzgYjpA768OeufKr1oLZGUaVV_jqvzK-uXEZIUekSHwZacMRIfHOWCfO6qmRCnMoE7S51qba98RPU9MRyyPjm_b40vT9Xiw_Ob3KyQm3rXXbclTmYmVI8g" 
                        alt="Signature Henna Art" 
                        referrerPolicy="no-referrer"
                        className="h-72 w-full object-cover sm:h-[400px] rounded-xl"
                      />
                      <div className="absolute top-6 left-6 rounded-full bg-[#fbf9f1]/90 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-[#3c0004] shadow border border-[#775a19]/20">
                        ✨ Signature Mandalas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SAMPLES SECTION GALLERY */}
            <section id="sample-gallery" className="py-16 bg-[#fbf9f1]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-3 mb-10">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#775a19]">Signature Collections</span>
                  <h3 className="font-serif text-2xl font-bold text-[#3c0004] sm:text-3xl">Our Beautiful Designs</h3>
                  <div className="h-0.5 w-16 bg-[#775a19]"></div>
                  <p className="text-sm text-[#564241] max-w-xl">
                    Stunning handpieces styled by expert Henna specialists. Explore dynamic patterns of deep cultural rich heritage.
                  </p>
                </div>

                {/* SLIDER WRAPPER */}
                <div className="relative mx-auto max-w-4xl px-4">
                  <div className="overflow-hidden rounded-2xl bg-[#f5f4ec] border border-[#dcc0be] shadow-md min-h-[350px]">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid md:grid-cols-12"
                      >
                        {/* Left: Picture */}
                        <div className="md:col-span-6 relative h-64 md:h-[350px]">
                          <img 
                            src={designs[activeSlide].img} 
                            alt={designs[activeSlide].title} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-4 left-4 rounded-full bg-[#3c0004] text-xs font-bold tracking-widest text-white px-3.5 py-1">
                            {designs[activeSlide].tag}
                          </span>
                        </div>

                        {/* Right: Info */}
                        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#f5f4ec]">
                          <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#775a19]">
                              {designs[activeSlide].subtitle}
                            </p>
                            <h4 className="font-serif text-2xl font-extrabold text-[#3c0004]">
                              {designs[activeSlide].title}
                            </h4>
                            <p className="text-sm leading-relaxed text-[#564241]">
                              {designs[activeSlide].desc}
                            </p>
                          </div>

                          <div className="border-t border-[#fed488]/30 pt-4 flex items-center justify-between text-xs font-semibold text-[#564241]">
                            <span>⏳ Application: <strong className="text-[#3c0004]">{designs[activeSlide].time}</strong></span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Left/Right controls (z-index guaranteed) */}
                  <button 
                    onClick={handlePrevSlide}
                    className="absolute left-[-12px] top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:bg-[#fbf9f1] text-[#3c0004] border border-[#fed488]/40 transition-colors z-20 cursor-pointer flex items-center justify-center"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
                  </button>
                  <button 
                    onClick={handleNextSlide}
                    className="absolute right-[-12px] top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:bg-[#fbf9f1] text-[#3c0004] border border-[#fed488]/40 transition-colors z-20 cursor-pointer flex items-center justify-center"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="h-6 w-6 stroke-[2.5]" />
                  </button>

                  {/* Slider dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {designs.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveSlide(i)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${activeSlide === i ? 'w-6 bg-[#3c0004]' : 'w-2.5 bg-[#dcc0be]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICE ACCESSIBILITY INFORMATION SEGMENT */}
            <section className="py-16 bg-[#f5f4ec]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="h-10 w-10 bg-[#3c0004]/5 rounded-full flex items-center justify-center mx-auto text-[#3c0004]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#3c0004] sm:text-3xl">Service Available at Any Boutique</h3>
                  <p className="text-base text-[#564241] leading-relaxed">
                    While physical mall boutique outlets are preparing for grand future launches, our high-end, bespoke mehandi booking service continues to be fully available to be scheduled for **any boutique or premium salon location** of your choosing. Our expert, private stylists will meet you at the partner studio or address layout specified during reservation!
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto pt-4">
                  <div className="bg-white p-5 rounded-xl border border-[#dcc0be]">
                    <h4 className="font-bold text-[#3c0004] font-serif">1. Choose Location</h4>
                    <p className="text-xs text-[#564241] mt-2">Select any partner boutique studio or input your custom preferred parlor address.</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-[#dcc0be]">
                    <h4 className="font-bold text-[#3c0004] font-serif">2. Expert Arrival</h4>
                    <p className="text-xs text-[#564241] mt-2">Our certified artists arrive with luxury kits, specialized cones, and fresh paste.</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-[#dcc0be]">
                    <h4 className="font-bold text-[#3c0004] font-serif">3. Masterful Styling</h4>
                    <p className="text-xs text-[#564241] mt-2">Sit back and enjoy private pampering as our specialists sketch intricate magic on your hands.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICES IN DETAIL */}
            <section className="py-16 bg-[#fbf9f1]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#775a19]">Flexible Packages</span>
                  <h3 className="font-serif text-2xl font-bold text-[#3c0004] sm:text-3xl">Professional Artistry Rates</h3>
                  <p className="text-sm text-[#564241] max-w-lg mt-1">Our fixed transparent pricing guarantees certified, high-grade organic dyes and VIP attention.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                  {/* Package A */}
                  <div className="flex flex-col justify-between bg-white rounded-2xl border-2 border-[#dcc0be] p-8 hover:shadow-md transition-shadow">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide text-[#775a19]">Menu Tier A</span>
                          <h4 className="font-serif text-2xl font-bold text-[#3c0004] mt-0.5">4-Hour Intensive</h4>
                        </div>
                        <div className="text-right">
                          <span className="block text-[11px] uppercase tracking-wide text-[#564241]">Fixed Rate</span>
                          <span className="font-serif text-3xl font-extrabold text-[#3c0004]">AED 400</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#564241] leading-relaxed">
                        Excellent for private setups, bridesmaids parties, or custom celebrations. Consists of continuous artistry services for up to 4 companion guests.
                      </p>
                      <ul className="space-y-2.5 text-xs text-[#564241] pt-4 border-t border-[#fed488]/20">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#775a19]" /> Complete coverage for multiple handpieces</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#775a19]" /> Arabic, Indian, floral, or Sudanese patterns</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#775a19]" /> Capped strictly at 4 consecutive hours</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => handleNextBookingStepFromHome('4hr')}
                      className="w-full mt-8 h-11 rounded-full bg-[#3c0004] text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 cursor-pointer"
                    >
                      Select 4-Hour Package
                    </button>
                  </div>

                  {/* Package B */}
                  <div className="flex flex-col justify-between bg-[#3c0004] rounded-2xl border border-[#775a19] p-8 text-white relative shadow-xl">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide text-[#fed488]">Gala Tier B</span>
                          <h4 className="font-serif text-2xl font-bold text-white mt-0.5">Weekend Premium Block</h4>
                        </div>
                        <div className="text-right font-serif">
                          <span className="block text-[11px] uppercase tracking-wide text-[#fed488]/80">Full Weekend</span>
                          <span className="text-3xl font-extrabold text-[#fed488]">AED 1000</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        Intense bridal layout split gracefully across Friday, Saturday, and Sunday matching times. Fully customizable design patterns.
                      </p>
                      <ul className="space-y-2.5 text-xs text-gray-200 pt-4 border-t border-[#fed488]/20">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#fed488]" /> Thick bridal motifs covering full palm to upper arm</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#fed488]" /> Maximum of 4 hours detailed work per individual day</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#fed488]" /> Premium luxury service setup with organic dyes</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => handleNextBookingStepFromHome('weekend')}
                      className="w-full mt-8 h-11 rounded-full bg-gradient-to-r from-[#e9c176] to-[#775a19] text-xs font-bold uppercase tracking-widest text-[#1b1c17] hover:opacity-95 cursor-pointer"
                    >
                      Select Weekend Package
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* VIEW 2: BOOKING WORKSPACE */}
        {currentView === 'booking' && (
          <section className="py-12 bg-[#fbf9f1]">
            <div className="mx-auto max-w-2xl px-4 sm:px-6">
              <div className="mb-8 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#775a19]">Authorized Reservation</span>
                <h2 className="font-serif text-3xl font-bold text-[#3c0004] mt-1">Book Premium Artistry</h2>
                <p className="text-xs text-[#564241] mt-1">Secure, real-time live booking available at any of our fine boutiques.</p>
                
                {/* Stepper progress layout */}
                <div className="mt-8 flex justify-between items-center relative max-w-sm mx-auto">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#dcc0be] -translate-y-1/2 z-0"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <button 
                      key={i}
                      onClick={() => { if (step > i) setStep(i); }}
                      className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                        step === i 
                          ? 'bg-[#3c0004] text-white border-[#3c0004]' 
                          : step > i 
                            ? 'bg-[#775a19] text-white border-[#775a19]' 
                            : 'bg-[#dcc0be] text-[#564241] border-[#dcc0be]'
                      }`}
                    >
                      {step > i ? '✓' : i}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] uppercase font-bold text-[#775a19] max-w-sm mx-auto px-1">
                  <span>1. Package</span>
                  <span>2. Timing</span>
                  <span>3. Location</span>
                  <span>4. Secure</span>
                </div>
              </div>

              {/* API and validation warnings */}
              {apiError && (
                <div className="mb-6 flex gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
                  <div>
                    <h4 className="font-bold">Information Required</h4>
                    <p className="text-xs mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 1: VERIFY PACKAGE */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#3c0004]">1. Select Service Package</h3>
                  <div className="grid gap-4">
                    <label className="relative cursor-pointer">
                      <input 
                        type="radio" 
                        name="bookingPkg" 
                        checked={servicePackage === '4hr'}
                        onChange={() => setServicePackage('4hr')}
                        className="sr-only peer"
                      />
                      <div className="p-5 bg-white border border-[#dcc0be] rounded-xl peer-checked:border-2 peer-checked:border-[#3c0004] hover:bg-[#f5f4ec]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-[#3c0004]">4-Hour Intensive</h4>
                            <p className="text-xs text-[#564241] mt-1">Perfect for festive events, group setups, or active parties.</p>
                          </div>
                          <span className="font-serif font-semibold text-sm bg-[#fed488]/15 px-3 py-1 rounded text-[#775a19]">AED 400</span>
                        </div>
                      </div>
                    </label>

                    <label className="relative cursor-pointer">
                      <input 
                        type="radio" 
                        name="bookingPkg" 
                        checked={servicePackage === 'weekend'}
                        onChange={() => setServicePackage('weekend')}
                        className="sr-only peer"
                      />
                      <div className="p-5 bg-white border border-[#dcc0be] rounded-xl peer-checked:border-2 peer-checked:border-[#3c0004] hover:bg-[#f5f4ec]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-[#3c0004]">Weekend Premium Block</h4>
                            <p className="text-xs text-[#564241] mt-1">Excellent for custom intricate bridal layouts over the weekend days.</p>
                          </div>
                          <span className="font-serif font-semibold text-sm bg-[#fed488]/15 px-3 py-1 rounded text-[#775a19]">AED 1000</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#fed488]/20">
                    <button 
                      onClick={handleStepForward}
                      className="inline-flex h-11 items-center justify-center gap-1 bg-[#3c0004] hover:opacity-90 px-6 rounded-full text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 2: TIMING SELECTOR */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#3c0004]">2. Choose Timings</h3>
                  
                  {servicePackage === '4hr' ? (
                    <div className="space-y-4 bg-white p-5 rounded-xl border border-[#dcc0be]">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#3c0004] mb-2">Reservation Date</label>
                        <input 
                          type="date" 
                          value={singleDate}
                          min="2026-06-06"
                          onChange={(e) => setSingleDate(e.target.value)}
                          className="w-full rounded-lg border border-[#dcc0be] px-3 py-2 text-sm focus:outline-[#3c0004]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#3c0004] mb-2">Preferred Slot</label>
                        <div className="grid gap-2">
                          {timeSlots.map((slot) => (
                            <button 
                              key={slot}
                              type="button"
                              onClick={() => setSingleTimeSlot(slot)}
                              className={`w-full py-2.5 px-4 rounded-lg text-left text-sm font-semibold flex items-center justify-between border ${
                                singleTimeSlot === slot 
                                  ? 'bg-[#3c0004]/5 border-[#3c0004] text-[#3c0004]' 
                                  : 'bg-[#fbf9f1] border-[#dcc0be] text-[#564241]'
                              }`}
                            >
                              <span>{slot}</span>
                              <Clock className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {weekendSchedules.map((sched, idx) => (
                        <div key={sched.day} className={`p-4 rounded-xl border ${sched.isSelected ? 'bg-white border-[#3c0004]' : 'bg-white/50 border-[#dcc0be]'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={sched.isSelected}
                                onChange={() => handleToggleWeekendDay(idx)}
                                className="accent-[#3c0004]"
                              />
                              <span className="font-serif font-black text-[#3c0004]">{sched.day}</span>
                            </label>
                          </div>
                          {sched.isSelected && (
                            <div className="mt-4 pt-4 border-t border-[#fed488]/20 grid gap-4 grid-cols-2">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-[#564241] mb-1">Hours Requested (Max 4)</label>
                                <select 
                                  value={sched.hours}
                                  onChange={(e) => handleWeekendHoursChange(idx, Number(e.target.value))}
                                  className="w-full rounded border-[#dcc0be] text-xs py-1.5 px-1 bg-white"
                                >
                                  <option value={1}>1 Hour</option>
                                  <option value={2}>2 Hours</option>
                                  <option value={3}>3 Hours</option>
                                  <option value={4}>4 Hours Max</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-[#564241] mb-1">Desired Start Time</label>
                                <select 
                                  value={sched.startTime}
                                  onChange={(e) => handleWeekendStartTimeChange(idx, e.target.value)}
                                  className="w-full rounded border-[#dcc0be] text-xs py-1.5 px-1 bg-white"
                                >
                                  <option value="09:00">09:00 AM</option>
                                  <option value="11:00">11:00 AM</option>
                                  <option value="12:00">12:00 PM</option>
                                  <option value="14:00">02:00 PM</option>
                                  <option value="16:00">04:00 PM</option>
                                  <option value="18:00">06:00 PM</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-[#fed488]/20">
                    <button 
                      onClick={handleStepBackward}
                      className="inline-flex h-11 items-center justify-center border border-[#dcc0be] bg-white px-5 rounded-full text-xs font-bold uppercase text-[#564241]"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleStepForward}
                      className="inline-flex h-11 items-center justify-center gap-1 bg-[#3c0004] hover:opacity-90 px-6 rounded-full text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                    >
                      Next: Location
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 3: LOCATION & CONTACT */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#3c0004]">3. Boutique & Contact Details</h3>
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-[#dcc0be]">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#3c0004] mb-2">Select Boutique</label>
                      <select 
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full rounded-lg border border-[#dcc0be] bg-white px-3 py-2 text-sm"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.address})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[#3c0004] mb-2">Your Name</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full rounded-lg border border-[#dcc0be] px-3 py-2 text-sm focus:outline-[#3c0004]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[#3c0004] mb-2">UAE Contact Mobile Number</label>
                      <input 
                        type="tel" 
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        placeholder="e.g. +971 50 123 4567"
                        className="w-full rounded-lg border border-[#dcc0be] px-3 py-2 text-sm focus:outline-[#3c0004]"
                      />
                      <span className="text-[10px] text-gray-500 mt-1 block">Accepted format: +97150xxxxxxx or 050xxxxxxx</span>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[#3c0004] mb-2">Special Notes or Specific Motifs (Optional)</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Skin sensitivity checks, specific geometric patterns..."
                        className="w-full h-20 rounded-lg border border-[#dcc0be] px-3 py-2 text-sm focus:outline-[#3c0004]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-[#fed488]/20">
                    <button 
                      onClick={handleStepBackward}
                      className="inline-flex h-11 items-center justify-center border border-[#dcc0be] bg-white px-5 rounded-full text-xs font-bold uppercase text-[#564241]"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleStepForward}
                      className="inline-flex h-11 items-center justify-center gap-1 bg-[#3c0004] hover:opacity-90 px-6 rounded-full text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                    >
                      Next: Authorize
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 4: ANTI-BOT AUTH SECURITY VERIFICATION */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#3c0004]">4. Verify & Confirm</h3>
                  <div className="bg-[#f5f4ec] rounded-xl border border-[#dcc0be] p-5 space-y-3">
                    <h4 className="font-serif font-bold text-sm text-[#3c0004] tracking-wide border-b border-gray-300 pb-1.5">Artistry Summary</h4>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                      <span className="text-[#564241]">Package:</span>
                      <strong className="text-right text-[#3c0004]">{servicePackage === '4hr' ? '4-Hour Intensive' : 'Weekend Premium block'}</strong>
                      
                      <span className="text-[#564241]">Boutique Outlet:</span>
                      <strong className="text-right text-[#3c0004]">{activeBranch.name}</strong>

                      <span className="text-[#564241]">Customer:</span>
                      <strong className="text-right text-[#3c0004]">{customerName}</strong>

                      {servicePackage === '4hr' ? (
                        <>
                          <span className="text-[#564241]">Preferred Date:</span>
                          <strong className="text-right text-[#3c0004]">{singleDate}</strong>
                          <span className="text-[#564241]">Time Slot:</span>
                          <strong className="text-right text-[#3c0004]">{singleTimeSlot}</strong>
                        </>
                      ) : (
                        <>
                          <span className="text-[#564241]">Weekend Timings:</span>
                          <div className="text-right flex flex-col gap-0.5">
                            {weekendSchedules.filter(s => s.isSelected).map(s => (
                              <span key={s.day} className="font-bold text-[#3c0004] text-[11px]">
                                {s.day} ({s.hours}h @ {s.startTime})
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-[#dcc0be] pt-3 flex justify-between items-center text-sm font-bold">
                      <span className="text-[#3c0004]">Amount:</span>
                      <strong className="text-[#3c0004] text-base">AED {servicePackage === '4hr' ? 400 : 1000}</strong>
                    </div>
                  </div>

                  {/* Anti bot slider challenge */}
                  <div className="bg-white rounded-xl border border-[#dcc0be] p-5 space-y-4">
                    <h4 className="font-serif font-bold text-xs text-[#3c0004] uppercase">Antigravity Human Verification</h4>
                    <p className="text-xs text-[#564241]">
                      To finalize your secure booking, please slide and align to **EXACTLY 12 dots**.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between px-1 text-[11px] text-[#775a19] font-bold">
                        <span>1 Dot</span>
                        <span className={captchaSliderVal === 12 ? 'text-emerald-700 underline font-black text-xs' : 'text-gray-500'}>Target: 12 Dots</span>
                        <span>20 Dots</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="20"
                        value={captchaSliderVal}
                        onChange={(e) => setCaptchaSliderVal(Number(e.target.value))}
                        className="w-full accent-[#3c0004] h-2 bg-[#f5f4ec] rounded-lg cursor-ew-resize"
                      />
                      <div className="text-center py-1 text-xs">
                        {isCaptchaValid ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Slider Matched! Humanity Confirmed.
                          </span>
                        ) : (
                          <span className="text-amber-800 font-medium">
                            Currently set at: <strong className="text-[#3c0004] underline text-sm">{captchaSliderVal} dots</strong>. Line up to 12.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-[#fed488]/20">
                    <button 
                      onClick={handleStepBackward}
                      className="inline-flex h-11 items-center justify-center border border-[#dcc0be] bg-white px-5 rounded-full text-xs font-bold uppercase text-[#564241]"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleBookingSubmission}
                      disabled={isSubmitting || !isCaptchaValid}
                      className={`inline-flex h-11 items-center justify-center gap-1 px-6 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all ${
                        !isCaptchaValid 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#3c0004] hover:opacity-90 active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? 'Finalizing...' : 'Confirm Artistry Session'}
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS BOOKING CONFIRMATION SCREEN (THANK YOU MESSAGE ACCENTED) */}
              {step === 5 && (
                <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-8 shadow-xl text-center space-y-6 animate-scale-up">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl font-black text-[#3c0004]">Thank You!</h3>
                    <h4 className="font-serif text-xl font-bold text-[#775a19]">Your Artistry Booking is Successfully Confirmed</h4>
                    <p className="text-sm text-[#564241] max-w-md mx-auto leading-relaxed">
                      We have successfully recorded your premium Mehandi session! Thank you for booking with Al Hena. Our certified expert artists are preparing their organic henna kits for your scheduled appointment.
                    </p>
                  </div>

                  {/* Authorization Detail Code */}
                  <div className="rounded-xl bg-[#f5f4ec] border border-[#dcc0be] p-4 max-w-sm mx-auto space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#775a19] block">Booking Identifier ID</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <strong className="font-serif text-lg text-[#3c0004] font-extrabold select-all">{recentBooking?.id || 'ALH-2026-PENDING'}</strong>
                      <button 
                        onClick={() => {
                          const id = recentBooking?.id || 'ALH-2026';
                          navigator.clipboard.writeText(id);
                          alert('Booking reference code copied safely to clipboard!');
                        }}
                        className="p-1 rounded bg-[#3c0004]/5 text-[#3c0004]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-y border-[#fed488]/30 py-4 divide-y divide-gray-100 text-left text-xs max-w-md mx-auto space-y-3">
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Guest Name:</span>
                      <strong className="text-[#3c0004] font-black">{recentBooking?.customerName || customerName}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Contact Number:</span>
                      <strong className="text-[#3c0004] font-black">{recentBooking?.customerMobile || customerMobile}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Selected Boutique:</span>
                      <strong className="text-[#3c0004] font-black">{recentBooking?.branch?.name || activeBranch.name}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Pricing Plan:</span>
                      <strong className="text-[#3c0004] font-black">AED {recentBooking?.servicePrice || (servicePackage === '4hr' ? 400 : 1000)}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Timing Schedule:</span>
                      <strong className="text-[#3c0004] font-black text-right">
                        {recentBooking?.serviceType === '4hr' || servicePackage === '4hr' ? (
                          <span>Slot: {recentBooking?.schedule?.date || singleDate} ({recentBooking?.schedule?.timeSlot || singleTimeSlot})</span>
                        ) : (
                          <span>Weekend Split Session</span>
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center">
                    <button 
                      onClick={() => { setCurrentView('home'); setStep(1); }}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#3c0004] px-6 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 cursor-pointer"
                    >
                      Back to Homepage
                    </button>
                    <a 
                      href="https://wa.me/+971500000000" 
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[#775a19] px-6 text-xs font-bold uppercase tracking-widest text-[#3c0004]"
                    >
                      <MessageSquare className="h-4 w-4 text-[#775a19]" />
                      WhatsApp Assistant
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW 3: SECURE MANAGEMENT OWNER ACCESS ROUTE */}
        {currentView === 'admin' && (
          <section className="py-12 bg-[#fbf9f1]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="mb-8 space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#775a19] inline-flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" /> Secure Records Database Console
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#3c0004]">Boutique Owner Desk</h2>
                <p className="text-xs text-[#564241]">Verify state logs and manage scheduled artistry queues securely.</p>
              </div>

              {!isAdminAuthenticated ? (
                <div className="bg-white p-8 rounded-xl border border-[#dcc0be] shadow-lg max-w-md mx-auto space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#fed488]/30">
                    <Lock className="h-5 w-5 text-[#3c0004]" />
                    <h3 className="font-serif font-black text-sm text-[#3c0004] uppercase">Passkey Required</h3>
                  </div>

                  <p className="text-xs text-[#564241]">
                    Enter authorized access key code. Test developer credential passkey is:
                    <br />
                    <code className="text-[#3c0004] font-mono font-bold bg-rose-50 px-1 rounded text-[11px]">AlHenaRoyalKey2026</code>
                  </p>

                  {adminError && (
                    <p className="text-xs font-bold text-red-900 bg-red-50 p-2 rounded">{adminError}</p>
                  )}

                  <div className="space-y-3">
                    <input 
                      type="password" 
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="Insert AlHenaRoyalKey2026"
                      className="w-full rounded-lg border border-[#dcc0be] bg-[#fbf9f1] px-4 py-3 text-sm focus:outline-[#3c0004]"
                    />
                    <button 
                      onClick={fetchAdminBookings}
                      className="w-full h-11 bg-[#3c0004] hover:opacity-90 rounded-full text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                    >
                      Authenticate System
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-[#dcc0be] flex flex-col md:flex-row items-center justify-between gap-4">
                    <input 
                      type="text"
                      value={adminQuery}
                      onChange={(e) => setAdminQuery(e.target.value)}
                      placeholder="Search identifier code, customer name or mobile..."
                      className="w-full md:w-72 rounded bg-[#f5f4ec] border border-[#dcc0be] px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={fetchAdminBookings} className="px-4 py-1.5 bg-[#775a19] text-white rounded text-xs font-bold uppercase cursor-pointer">Refresh</button>
                      <button onClick={() => setIsAdminAuthenticated(false)} className="px-4 py-1.5 border border-[#dcc0be] text-[#564241] rounded text-xs font-bold uppercase cursor-pointer">Log Out</button>
                    </div>
                  </div>

                  {adminError && <p className="text-xs bg-red-50 text-red-900 p-3 rounded">{adminError}</p>}
                  {deleteSuccess && <p className="text-xs bg-emerald-50 text-emerald-900 p-3 rounded">{deleteSuccess}</p>}

                  <div className="bg-white rounded-xl border border-[#dcc0be] overflow-hidden shadow-sm">
                    <div className="p-4 bg-[#f5f4ec] border-b border-gray-200">
                      <h3 className="font-serif font-bold text-sm text-[#3c0004]">Live Reservations Storage ({filteredBookings.length} bookings)</h3>
                    </div>

                    {filteredBookings.length === 0 ? (
                      <p className="p-8 text-center text-xs text-gray-500">No bookings matched this query description.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredBookings.map((b) => (
                          <div key={b.id} className="p-4 hover:bg-[#fbf9f1] transition-all grid md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-3">
                              <span className="text-[10px] text-gray-500 block">{new Date(b.bookingTime).toLocaleDateString()}</span>
                              <h4 className="font-serif font-black text-xs text-[#3c0004]">{b.id}</h4>
                              <span className="text-[9px] uppercase tracking-wide font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded inline-block mt-1">
                                {b.serviceType}
                              </span>
                            </div>
                            <div className="md:col-span-4 text-xs">
                              <h5 className="font-bold text-[#1b1c17]">{b.customerName}</h5>
                              <p className="text-[#564241]">{b.customerMobile}</p>
                              <p className="text-[#775a19] font-medium">{b.branch.name}</p>
                            </div>
                            <div className="md:col-span-4 text-xs font-medium text-gray-600">
                              {b.serviceType === '4hr' ? (
                                <p>Date: {b.schedule.date} | {b.schedule.timeSlot}</p>
                              ) : (
                                <p>Weekend Split Selected</p>
                              )}
                              {b.notes && <p className="text-[10px] italic text-gray-400 mt-1">Note: "{b.notes}"</p>}
                            </div>
                            <div className="md:col-span-1 text-right">
                              <button 
                                onClick={() => deleteAdminBooking(b.id)}
                                className="p-2 rounded-full hover:bg-red-50 text-red-700 cursor-pointer"
                                title="Remove reservation"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* RE-ESTABLISHED TRUST AND SECURITY LOGO */}
      <section className="py-12 bg-white border-t border-[#fed488]/30 text-center space-y-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="font-serif text-lg font-bold text-[#3c0004] flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-[#775a19]" />
            Secure Booking Guarantee
          </h3>
          <p className="text-xs text-[#564241] max-w-md mx-auto">
            Your data is stored and encrypted safely. All mehandi artists are fully certified, licensed, and highly selected.
          </p>
        </div>
      </section>

      {/* FOOTER SECTION REGISTRY */}
      <footer className="bg-[#281410] text-[#fbf9f1] pt-12 pb-16 border-t-2 border-[#775a19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 border-b border-[#fbf9f1]/10 pb-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-bold text-[#fed488] tracking-widest">AL HENA RESTS</h4>
              <p className="text-xs leading-relaxed opacity-80 text-[#eae8e0]">
                Abu Dhabi's premiere traditional and avant-garde Mehandi artistry serviced with elite splendor in partner boutiques.
              </p>
              <div className="flex gap-3">
                <a href="https://wa.me/+971500000000" className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white" aria-label="WhatsApp"><MessageSquare className="h-4 w-4" /></a>
                <a href="tel:+971500000000" className="h-8 w-8 rounded-full bg-[#3c0004] border border-[#775a19] flex items-center justify-center text-white" aria-label="Phone"><Phone className="h-4 w-4" /></a>
                <a href="https://instagram.com" className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center text-white" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#fed488] mb-4">Partner Boutiques</h5>
              <ul className="space-y-2 text-xs text-gray-300">
                <li>Al Khalidiya Partner Lounge</li>
                <li>Muroor District Boutique</li>
                <li>Khalifa City Studio Room</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#fed488] mb-4">Masterful Hours</h5>
              <ul className="space-y-2 text-xs text-gray-300">
                <li>Available Daily blocks</li>
                <li>Bespoke timings: 10:00 AM - 10:00 PM</li>
                <li>Flexible partner venue options</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#fed488] mb-4">Consent & Registry</h5>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><button onClick={() => alert('Bookings are treated with extreme privacy.')} className="hover:underline">Privacy Policy</button></li>
                <li><button onClick={() => alert('Align exactly to 12 dots anti-bot slide to lock reservations.')} className="hover:underline">Anti-Bot Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
            <p>© 2026 Al Hena Mehandi Art Abu Dhabi. All rights reserved.</p>
            <p className="tracking-wide">Registry LicAD-MHL-92210</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
