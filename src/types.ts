export interface Branch {
  id: string;
  name: string;
  mall: string;
  location: string;
  address: string;
  phone: string;
  mapUrl: string;
  lat: number;
  lng: number;
}

export interface Booking {
  id: string;
  bookingTime: string;
  customerName: string;
  customerMobile: string;
  serviceType: '4hr' | 'weekend';
  servicePrice: number;
  branch: {
    id: string;
    name: string;
    mall: string;
    location: string;
  };
  schedule: {
    date?: string;
    timeSlot?: string;
    days?: Array<{ day: string; hours: number; startTime: string }>;
    duration: string;
  };
  notes: string;
  status: string;
}

export interface Design {
  title: string;
  subtitle: string;
  desc: string;
  tag: string;
  time: string;
  img: string;
}
