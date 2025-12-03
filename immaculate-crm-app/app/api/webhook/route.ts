import { NextResponse } from 'next/server';
import { findOrCreateCustomer, addBooking } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Service mapping for Webflow checkbox fields
const SERVICE_FIELD_MAP: Record<string, string> = {
  'complete-exterior-package': 'Complete Exterior Package',
  'premium-interior-package': 'Premium Interior Package', 
  'complete-interior-package': 'Complete Interior Package',
  'premium-wash-package': 'Premium Wash Package',
  '1-step-paint-correction': '1 Step Paint Correction',
  'aov-optimization': 'AOV Optimization',
  'graphene-ceramic-coating': 'Graphene Ceramic Coating',
  'mini-detail': 'Mini Detail',
  'maintenance-wash-wipe-package': 'Maintenance Wash & Wipe Package',
  'extra-add-on-services': 'Extra Add-On Services',
  '2-step-paint-correction': '2 Step Paint Correction',
  'adams-graphene-ceramic-coating': 'Adams Graphene Ceramic Coating',
};

function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function extractServices(data: Record<string, any>): string[] {
  const services: string[] = [];
  
  // Check for checkbox-style fields
  for (const [key, displayName] of Object.entries(SERVICE_FIELD_MAP)) {
    const variations = [
      key,
      key.replace(/-/g, '_'),
      key.replace(/-/g, ' '),
      displayName.toLowerCase().replace(/\s+/g, '-'),
      displayName.toLowerCase().replace(/\s+/g, '_'),
    ];
    
    for (const variation of variations) {
      if (data[variation] && data[variation] !== '' && data[variation] !== 'false') {
        services.push(displayName);
        break;
      }
    }
  }
  
  // Check for a single service field
  const serviceField = data.service || data.Service || data['service-type'] || data.serviceType;
  if (serviceField && !services.includes(serviceField)) {
    services.push(serviceField);
  }
  
  return services.length > 0 ? services : ['General Inquiry'];
}

export async function POST(request: Request) {
  try {
    let data: Record<string, any>;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      // Try JSON first, fall back to text
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        );
      }
    }
    
    console.log('Webhook received:', JSON.stringify(data, null, 2));
    
    // Normalize field names (Webflow uses various naming conventions)
    const name = data.name || data.Name || data['full-name'] || data.fullName || 
                 data['customer-name'] || [data['first-name'], data['last-name']].filter(Boolean).join(' ') || 
                 'Unknown';
    
    const phone = normalizePhone(
      data.phone || data.Phone || data['phone-number'] || data.phoneNumber || 
      data.telephone || data['Phone number'] || data['Phone Number'] || ''
    );
    
    const email = data.email || data.Email || data['e-mail'] || '';
    
    const zipCode = data.zipCode || data['zip-code'] || data.zip || data.location || 
                    data.Location || data['Location 2'] || '';
    
    const vehicle = data.vehicle || data.Vehicle || data['vehicle-type'] || 
                    data.vehicleType || data.car || '';
    
    const services = extractServices(data);
    
    // Find or create customer
    const customer = findOrCreateCustomer({
      name,
      phone,
      email,
      zipCode,
      vehicle,
    });
    
    // Create booking
    const booking = addBooking({
      customerId: customer.id,
      customerName: name,
      phone,
      vehicle,
      zipCode,
      services,
      date: new Date().toISOString(),
      status: 'pending',
    });
    
    console.log('Created booking:', booking.id, 'for customer:', customer.id);
    
    return NextResponse.json({
      success: true,
      message: 'Booking received',
      bookingId: booking.id,
      customerId: customer.id,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking', details: String(error) },
      { status: 500 }
    );
  }
}

// Handle GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Immaculate Car Wash CRM Webhook',
    usage: 'POST form data to this endpoint',
    timestamp: new Date().toISOString(),
  });
}
