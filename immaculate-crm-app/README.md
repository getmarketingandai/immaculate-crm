# Immaculate Car Wash CRM

Modern CRM system for managing customers and bookings from Webflow form submissions.

## Features

- **Dashboard** - Real-time stats, booking trends, popular services
- **Customer Management** - 574 customers imported from Webflow forms
- **Booking Tracking** - View all form submissions with services selected
- **Webhook API** - Receives new Webflow form submissions automatically
- **Search** - Find customers by name, phone, or vehicle

## Deployment

This app is deployed on Vercel. The webhook endpoint is:

```
POST https://[your-domain].vercel.app/api/webhook
```

## Webflow Integration

### Option 1: Webflow Logic
1. Go to **Logic** panel in Webflow
2. Create flow triggered by form submission
3. Add **HTTP Request** action:
   - URL: `https://[your-domain].vercel.app/api/webhook`
   - Method: `POST`
   - Content-Type: `application/json`
   - Map form fields to JSON body

### Option 2: Native Webhooks (Paid)
1. Select form in Webflow Designer
2. Form Settings → Webhooks
3. Add webhook URL

### Field Mapping
The webhook accepts these field names:
- `name`, `Name`, `full-name` → Customer name
- `phone`, `Phone`, `phone-number` → Phone number
- `email`, `Email` → Email address
- `vehicle`, `Vehicle` → Vehicle info
- `location`, `Location 2` → Zip code
- Service checkboxes are auto-detected

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/customers` | GET | List all customers |
| `/api/customers?q=` | GET | Search customers |
| `/api/webhook` | POST | Receive form submissions |
| `/api/webhook` | GET | Health check |

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Vercel

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
