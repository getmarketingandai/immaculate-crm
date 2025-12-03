import { NextResponse } from 'next/server';
import { getCustomers, addCustomer, searchCustomers } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    const customers = query ? searchCustomers(query) : getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const customer = addCustomer(data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
