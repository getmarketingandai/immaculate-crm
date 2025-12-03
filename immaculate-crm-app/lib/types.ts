export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  vehicles: string[];
  totalBookings: number;
  totalSpent: number;
  firstVisit: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip';
  createdAt: string;
  notes?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  vehicle: string;
  zipCode: string;
  services: string[];
  date: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  newCustomersThisMonth: number;
  bookingsThisMonth: number;
  popularServices: { name: string; count: number }[];
  recentBookings: Booking[];
  bookingsByMonth: { month: string; count: number }[];
}
