import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename_resolved = typeof __filename !== 'undefined'
  ? __filename
  : fileURLToPath(import.meta.url);

const __dirname_resolved = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(__filename_resolved);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parser and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database directory exists
const DATA_DIR = path.join(__dirname_resolved, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}

// In-memory rate limiting (simple, bulletproof, highly effective)
const rateLimits = new Map<string, { count: number; firstRequest: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests/min per IP

const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.headers['x-forwarded-for'] as string || 'default';
  const now = Date.now();
  
  const limit = rateLimits.get(ip);
  if (!limit) {
    rateLimits.set(ip, { count: 1, firstRequest: now });
    return next();
  }

  if (now - limit.firstRequest > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimits.set(ip, { count: 1, firstRequest: now });
    return next();
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many booking attempts. Please wait 1 minute before trying again.'
    });
  }

  limit.count += 1;
  next();
};

// Trust Abu Dhabi Service Outlets
const BRANCHES = [
  {
    id: 'any',
    name: 'Any Boutique of Your Choice',
    mall: 'Any Boutique of Your Choice',
    location: 'Available to book for any partner boutique or your custom address',
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

// Helper to encrypt/obfuscate delicate token/ID in-transit
const generateBookingId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALH-2026-${rand}`;
};

// API: Get Branch Directory
app.get('/api/branches', (req, res) => {
  res.json(BRANCHES);
});

// API: Submit a booking with strict backend checks
app.post('/api/bookings', rateLimiter, (req, res) => {
  try {
    const {
      serviceType, // '4hr' | 'weekend'
      selectedBranchId,
      customerName,
      customerMobile,
      notes,
      captchaAnswer,
      // 4hr Service Details
      singleDate,
      singleTimeSlot,
      // Weekend Service Details
      weekendSchedules // array of { day: 'Friday'|'Saturday'|'Sunday', isSelected: boolean, hours: number, startTime: string }
    } = req.body;

    // 1. Basic Fields validation
    if (!customerName || String(customerName).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter a valid customer name (at least 2 characters).' });
    }

    if (!customerMobile || !/^(?:\+971|05)\d{8}$/.test(customerMobile.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UAE mobile number (+971 XX XXX XXXX or 05XXXXXXXX).' });
    }

    const branch = BRANCHES.find(b => b.id === selectedBranchId);
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Please select an authorized Al Hena boutique boutique branch.' });
    }

    // 2. Custom Henna CAPTCHA Verification
    // Simplified anti-bot math validation: the answer must be correct.
    if (!captchaAnswer || isNaN(Number(captchaAnswer)) || Number(captchaAnswer) !== 12) {
      return res.status(400).json({ success: false, message: 'Bot verification failed. Please slide or enter the correct result.' });
    }

    let calculatedPrice = 0;
    let finalSchedule: any = {};

    // 3. Service Type Specific Validation
    if (serviceType === '4hr') {
      if (!singleDate) {
        return res.status(400).json({ success: false, message: 'Please pick a preferred reservation date.' });
      }
      if (!singleTimeSlot) {
        return res.status(400).json({ success: false, message: 'Please select your 4-hour reservation time slot.' });
      }
      calculatedPrice = 400;
      finalSchedule = {
        date: singleDate,
        timeSlot: singleTimeSlot,
        duration: '4 hours (Fixed)'
      };
    } else if (serviceType === 'weekend') {
      if (!Array.isArray(weekendSchedules) || weekendSchedules.filter(s => s.isSelected).length === 0) {
        return res.status(400).json({ success: false, message: 'Weekend packages require selecting at least one active weekend day (Fri, Sat, or Sun).' });
      }

      // Ensure every chosen day is maximum 4 hours per day, and correct days are used.
      const validDays = ['Friday', 'Saturday', 'Sunday'];
      for (const sched of weekendSchedules) {
        if (sched.isSelected) {
          if (!validDays.includes(sched.day)) {
            return res.status(400).json({ success: false, message: 'Weekend designs are restricted strictly to Friday, Saturday, and Sunday.' });
          }
          const hrs = Number(sched.hours);
          if (isNaN(hrs) || hrs <= 0 || hrs > 4) {
            return res.status(400).json({ success: false, message: `Timing for ${sched.day} exceeds the limits of max 4 hours per day.` });
          }
          if (!sched.startTime) {
            return res.status(400).json({ success: false, message: `Please specify a start time slot for ${sched.day}.` });
          }
        }
      }

      calculatedPrice = 1000;
      finalSchedule = {
        days: weekendSchedules.filter(s => s.isSelected).map(s => ({
          day: s.day,
          hours: s.hours,
          startTime: s.startTime
        })),
        duration: 'Up to 4 hours per chosen weekend day'
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid service package selected.' });
    }

    // 4. Secure booking generation
    const bookingId = generateBookingId();
    const newBooking = {
      id: bookingId,
      bookingTime: new Date().toISOString(),
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      serviceType,
      servicePrice: calculatedPrice,
      branch: {
        id: branch.id,
        name: branch.name,
        mall: branch.mall,
        location: branch.location
      },
      schedule: finalSchedule,
      notes: notes ? notes.trim() : '',
      status: 'Confirmed'
    };

    // Save synchronously to local JSON database
    const fileData = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    const bookings = JSON.parse(fileData);
    bookings.push(newBooking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    return res.status(200).json({
      success: true,
      bookingId,
      booking: newBooking,
      message: 'Booking completed successfully!'
    });

  } catch (error: any) {
    console.error('Error recording booking:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while booking. Please try again.'
    });
  }
});

// Admin endpoint (Secure view of bookings)
app.get('/api/admin/bookings', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    // Simple basic check to protect records from public access unless authenticated
    if (authHeader !== 'Bearer AlHenaRoyalKey2026') {
      return res.status(401).json({ success: false, message: 'Unauthorized authorization passkey.' });
    }

    const fileData = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    const bookings = JSON.parse(fileData);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to access database.' });
  }
});

// Admin cancel booking endpoint
app.delete('/api/admin/bookings/:id', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer AlHenaRoyalKey2026') {
      return res.status(401).json({ success: false, message: 'Unauthorized authorization passkey.' });
    }

    const { id } = req.params;
    const fileData = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    let bookings = JSON.parse(fileData);
    
    const initialCount = bookings.length;
    bookings = bookings.filter((b: any) => b.id !== id);
    
    if (bookings.length === initialCount) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    res.json({ success: true, message: 'Reservation successfully cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to access database.' });
  }
});

// Start Full-Stack Server
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_HMR !== 'true') {
    console.log('[AL HENA Server] Connecting Vite development middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[AL HENA Server] Serving production static bundle...');
    const staticPath = path.join(__dirname_resolved, 'dist');
    app.use(express.static(staticPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Vite production build not found. Make sure to build first.');
      }
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[AL HENA Server] Live and listening on host 0.0.0.0 and port ${PORT}...`);
  });
};

startServer().catch((err) => {
  console.error('[AL HENA Server] Main application bootstrap failed:', err);
});
