'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, TrendingUp, Car, Search, 
  ChevronRight, Phone, MapPin, Clock, Sparkles,
  BarChart3, Menu, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';

interface Stats {
  totalCustomers: number;
  totalBookings: number;
  newCustomersThisMonth: number;
  bookingsThisMonth: number;
  popularServices: { name: string; count: number }[];
  recentBookings: any[];
  bookingsByMonth: { month: string; count: number }[];
  topZipCodes: { zip: string; count: number }[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  vehicles: string[];
  totalBookings: number;
  lastVisit: string;
  status: string;
}

const COLORS = ['#00d4aa', '#00a888', '#008866', '#006644', '#004422', '#ffb020', '#ff8800', '#ff4466'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'bookings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/customers').then(r => r.json())
    ]).then(([statsData, customersData]) => {
      setStats(statsData);
      setCustomers(customersData);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = searchQuery 
    ? customers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.vehicles.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customers;

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-silver">Loading CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-carbon border-r border-steel/50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:w-64
      `}>
        <div className="p-4 sm:p-6 border-b border-steel/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-midnight" />
            </div>
            <div className="animate-fade-in">
              <h1 className="font-semibold text-ice">Immaculate</h1>
              <p className="text-xs text-silver">CRM System</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'customers', icon: Users, label: 'Customers' },
              { id: 'bookings', icon: Calendar, label: 'Bookings' },
            ].map(item => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-silver hover:bg-steel/30 hover:text-ice'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-steel/50 lg:hidden">
          <button 
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-silver hover:text-ice transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Close</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Header */}
        <header className="bg-carbon/50 border-b border-steel/30 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-silver hover:text-ice"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-ice">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'customers' && 'Customers'}
                  {activeTab === 'bookings' && 'Bookings'}
                </h2>
                <p className="text-silver text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                  {activeTab === 'dashboard' && 'Overview of your business'}
                  {activeTab === 'customers' && `${customers.length} total customers`}
                  {activeTab === 'bookings' && `${stats?.totalBookings || 0} total bookings`}
                </p>
              </div>
            </div>
            
            {(activeTab === 'customers' || activeTab === 'bookings') && (
              <div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate border border-steel rounded-lg pl-9 pr-3 py-2 text-sm text-ice placeholder:text-silver/50 focus:border-accent transition-colors"
                />
              </div>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'accent' },
                  { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'accent' },
                  { label: 'New This Month', value: stats.newCustomersThisMonth, icon: TrendingUp, color: 'warning' },
                  { label: 'Bookings This Month', value: stats.bookingsThisMonth, icon: Clock, color: 'accent' },
                ].map((stat, i) => (
                  <div 
                    key={stat.label} 
                    className={`bg-carbon border border-steel/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover animate-fade-in stagger-${i + 1}`}
                    style={{ opacity: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-silver text-xs sm:text-sm truncate">{stat.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-ice mt-1 sm:mt-2">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-${stat.color}/10 flex items-center justify-center flex-shrink-0 ml-2`}>
                        <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Bookings Chart */}
                <div className="bg-carbon border border-steel/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-ice mb-4 sm:mb-6">Bookings Over Time</h3>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.bookingsByMonth}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={30} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#1a1a24', 
                            border: '1px solid #2a2a38',
                            borderRadius: '8px',
                            color: '#e8e8f0',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="count" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Services Pie Chart */}
                <div className="bg-carbon border border-steel/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-ice mb-4 sm:mb-6">Popular Services</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-1/2 h-40 sm:h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={stats.popularServices.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            dataKey="count"
                          >
                            {stats.popularServices.slice(0, 6).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a38',
                              borderRadius: '8px',
                              color: '#e8e8f0',
                              fontSize: '12px'
                            }}
                          />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2 space-y-1.5 sm:space-y-2">
                      {stats.popularServices.slice(0, 6).map((service, i) => (
                        <div key={service.name} className="flex items-center gap-2 text-xs sm:text-sm">
                          <div 
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-silver truncate flex-1">{service.name}</span>
                          <span className="text-ice">{service.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-carbon border border-steel/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-ice">Recent Bookings</h3>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-accent text-xs sm:text-sm hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {stats.recentBookings.slice(0, 5).map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate/30 rounded-lg sm:rounded-xl hover:bg-slate/50 transition-colors"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ice font-medium text-sm sm:text-base truncate">{booking.customerName}</p>
                          <p className="text-silver text-xs sm:text-sm truncate">{booking.vehicle}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-ice text-sm truncate max-w-[120px]">{booking.services[0]}</p>
                          <p className="text-silver text-xs">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right sm:hidden">
                          <p className="text-silver text-xs">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Locations */}
                <div className="bg-carbon border border-steel/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-ice mb-4 sm:mb-6">Top Zip Codes</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topZipCodes.slice(0, 6).map((loc, i) => (
                      <div key={loc.zip} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-slate flex items-center justify-center text-silver text-xs font-mono flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-ice text-xs sm:text-sm font-mono">{loc.zip}</span>
                            <span className="text-silver text-xs sm:text-sm">{loc.count}</span>
                          </div>
                          <div className="h-1 sm:h-1.5 bg-slate rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${(loc.count / stats.topZipCodes[0].count) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers View - Mobile Cards */}
          {activeTab === 'customers' && (
            <div className="animate-fade-in">
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredCustomers.slice(0, 50).map((customer) => (
                  <div key={customer.id} className="bg-carbon border border-steel/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-dim/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-ice font-medium truncate">{customer.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium status-${customer.status} flex-shrink-0`}>
                            {customer.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-silver">
                              <Phone className="w-3 h-3" />
                              <span className="font-mono text-xs">
                                {customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                              </span>
                            </div>
                          )}
                          {customer.zipCode && (
                            <div className="flex items-center gap-2 text-silver">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">{customer.zipCode}</span>
                            </div>
                          )}
                          {customer.vehicles.length > 0 && (
                            <div className="flex items-center gap-2 text-silver">
                              <Car className="w-3 h-3" />
                              <span className="text-xs truncate">{customer.vehicles[0]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-steel/30 text-xs text-silver">
                          <span>{customer.totalBookings} bookings</span>
                          <span>Last: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-carbon border border-steel/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Vehicles</th>
                        <th>Bookings</th>
                        <th>Last Visit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.slice(0, 50).map((customer) => (
                        <tr key={customer.id} className="cursor-pointer">
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-dim/20 flex items-center justify-center">
                                <span className="text-accent font-semibold">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-ice font-medium">{customer.name}</p>
                                {customer.email && (
                                  <p className="text-silver text-sm">{customer.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2 text-silver">
                              <Phone className="w-4 h-4" />
                              <span className="font-mono text-sm">
                                {customer.phone ? customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '—'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2 text-silver">
                              <MapPin className="w-4 h-4" />
                              <span>{customer.zipCode || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="max-w-[200px]">
                              {customer.vehicles.length > 0 ? (
                                <p className="text-ice text-sm truncate">{customer.vehicles[0]}</p>
                              ) : (
                                <span className="text-silver">—</span>
                              )}
                              {customer.vehicles.length > 1 && (
                                <p className="text-silver text-xs">+{customer.vehicles.length - 1} more</p>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-ice font-semibold">{customer.totalBookings}</span>
                          </td>
                          <td>
                            <span className="text-silver text-sm">
                              {new Date(customer.lastVisit).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium status-${customer.status}`}>
                              {customer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {filteredCustomers.length > 50 && (
                <p className="text-center text-silver mt-4 text-sm">
                  Showing 50 of {filteredCustomers.length} customers
                </p>
              )}
            </div>
          )}

          {/* Bookings View - Mobile Cards */}
          {activeTab === 'bookings' && stats && (
            <div className="animate-fade-in">
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {stats.recentBookings
                  .filter(b => 
                    !searchQuery || 
                    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.vehicle?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 50)
                  .map((booking) => (
                  <div key={booking.id} className="bg-carbon border border-steel/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-dim/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold">
                          {booking.customerName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-ice font-medium truncate">{booking.customerName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium status-${booking.status} flex-shrink-0`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-silver text-sm mt-1 truncate">{booking.vehicle || 'No vehicle'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {booking.services.slice(0, 2).map((service: string) => (
                            <span 
                              key={service}
                              className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {booking.services.length > 2 && (
                            <span className="px-2 py-0.5 bg-steel text-silver text-xs rounded-full">
                              +{booking.services.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-steel/30 text-xs text-silver">
                          <span className="font-mono">{booking.zipCode || '—'}</span>
                          <span>{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-carbon border border-steel/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Services</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings
                        .filter(b => 
                          !searchQuery || 
                          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.vehicle?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 50)
                        .map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-dim/20 flex items-center justify-center">
                                <span className="text-accent font-semibold">
                                  {booking.customerName?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="text-ice font-medium">{booking.customerName}</p>
                                {booking.phone && (
                                  <p className="text-silver text-sm font-mono">
                                    {booking.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-ice">{booking.vehicle || '—'}</p>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1 max-w-[250px]">
                              {booking.services.slice(0, 2).map((service: string) => (
                                <span 
                                  key={service}
                                  className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"
                                >
                                  {service}
                                </span>
                              ))}
                              {booking.services.length > 2 && (
                                <span className="px-2 py-0.5 bg-steel text-silver text-xs rounded-full">
                                  +{booking.services.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-silver font-mono">{booking.zipCode || '—'}</span>
                          </td>
                          <td>
                            <span className="text-silver">
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium status-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
