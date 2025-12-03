import { Customer, Booking } from './types';
import seedData from '@/data/seed.json';

// In-memory data store (in production, use a database)
let customers: Customer[] = seedData.customers as Customer[];
let bookings: Booking[] = seedData.bookings as Booking[];

export function getCustomers(): Customer[] {
  return customers.sort((a, b) => 
    new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find(c => c.id === id);
}

export function searchCustomers(query: string): Customer[] {
  const q = query.toLowerCase();
  return customers.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.vehicles.some(v => v.toLowerCase().includes(q))
  );
}

export function addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
  const newCustomer: Customer = {
    ...customer,
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  customers[index] = { ...customers[index], ...updates };
  return customers[index];
}

export function getBookings(): Booking[] {
  return bookings.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBookingsByCustomer(customerId: string): Booking[] {
  return bookings
    .filter(b => b.customerId === customerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const newBooking: Booking = {
    ...booking,
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  
  // Update customer stats
  const customer = customers.find(c => c.id === booking.customerId);
  if (customer) {
    customer.totalBookings++;
    customer.lastVisit = booking.date;
  }
  
  return newBooking;
}

export function getStats() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const newCustomersThisMonth = customers.filter(c => {
    const d = new Date(c.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  
  const bookingsThisMonth = bookings.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  
  // Popular services
  const serviceCounts: Record<string, number> = {};
  bookings.forEach(b => {
    b.services.forEach(s => {
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    });
  });
  const popularServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  
  // Bookings by month (last 12 months)
  const bookingsByMonth: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1);
    const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const count = bookings.filter(b => {
      const bd = new Date(b.date);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    }).length;
    bookingsByMonth.push({ month: monthStr, count });
  }
  
  // Top zip codes
  const zipCounts: Record<string, number> = {};
  customers.forEach(c => {
    if (c.zipCode && c.zipCode !== 'N/A') {
      zipCounts[c.zipCode] = (zipCounts[c.zipCode] || 0) + 1;
    }
  });
  const topZipCodes = Object.entries(zipCounts)
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalCustomers: customers.length,
    totalBookings: bookings.length,
    newCustomersThisMonth,
    bookingsThisMonth,
    popularServices,
    recentBookings: bookings.slice(0, 10),
    bookingsByMonth,
    topZipCodes,
  };
}

// Find or create customer from webhook data
export function findOrCreateCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  zipCode?: string;
  vehicle?: string;
}): Customer {
  // Try to find by phone
  let customer = customers.find(c => c.phone && c.phone === data.phone);
  
  // Try to find by name if no phone match
  if (!customer && data.name) {
    customer = customers.find(c => 
      c.name.toLowerCase() === data.name.toLowerCase()
    );
  }
  
  if (customer) {
    // Update existing customer
    if (data.vehicle && !customer.vehicles.includes(data.vehicle)) {
      customer.vehicles.push(data.vehicle);
    }
    if (data.email && !customer.email) {
      customer.email = data.email;
    }
    return customer;
  }
  
  // Create new customer
  return addCustomer({
    name: data.name,
    phone: data.phone,
    email: data.email || '',
    zipCode: data.zipCode || '',
    vehicles: data.vehicle ? [data.vehicle] : [],
    totalBookings: 0,
    totalSpent: 0,
    firstVisit: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
    status: 'active',
  });
}
