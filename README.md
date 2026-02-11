# Vitaway Employee Portal

A comprehensive Employee Dashboard for a multi-tenant health platform built with Next.js 16, React 19, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📋 Features

- **Dashboard Home** - Overview of health metrics, goals, and appointments
- **Health Overview** - Track vitals (BMI, Weight, Blood Pressure, Glucose)
- **Goals & Progress** - Monitor exercise, nutrition, and health goals
- **Programs & Learning** - Access wellness programs and educational content
- **Appointments** - Manage health sessions and consultations
- **Messages** - Secure communication with health providers
- **Profile** - Personal information management
- **Privacy & Consent** - Control data sharing preferences

## 🏗️ Tech Stack

- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5.x
- Tailwind CSS 4
- Lucide React Icons

## 📖 Documentation

For detailed implementation documentation, architecture, and API integration guide, see [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## 🔐 Security & Privacy

- Employee-only access (no organization-wide data)
- Consent-based data sharing
- HIPAA compliant
- Encrypted communications
- Role-based access control

## 📂 Project Structure

```
app/
  dashboard/          # All dashboard pages
components/
  layout/            # Layout components
  ui/                # Reusable UI components
lib/
  api/               # API service layer
  constants.ts       # App constants
  utils.ts           # Utility functions
types/               # TypeScript definitions
```

## 🛠️ Development

The application currently uses mock data. To integrate with a real backend, update the API calls in `lib/api/index.ts`.

## 📄 License

Proprietary - All rights reserved
