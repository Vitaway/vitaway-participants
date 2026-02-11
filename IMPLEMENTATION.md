# Vitaway Employee Portal

A comprehensive Employee Dashboard for a multi-tenant health platform built with Next.js 16, React 19, and TypeScript.

## Overview

The Employee Portal is an individual-facing dashboard focused on personal health tracking, engagement, and communication. Employees can view their health data, track goals, participate in programs, manage appointments, and communicate with healthcare providers—all while maintaining strict privacy and consent controls.

## Features

### 🏠 Dashboard Home
- Quick stats overview (appointments, goals, programs, streaks)
- Latest vitals snapshot
- Upcoming appointments
- Goal progress tracking
- Recent notifications

### 🩺 Health Overview
- View vital signs history (Weight, BMI, Blood Pressure, Glucose)
- Track health trends over time
- Assessment results and history
- Read-only health data display

### 🎯 Goals & Progress
- View assigned health goals
- Track progress on exercise, nutrition, and medication goals
- Weekly progress summaries
- Goal filtering (All, Active, Completed)
- Motivational achievement tracking

### 📚 Programs & Learning
- Access assigned wellness programs
- View learning materials (videos, articles, tasks)
- Track completed modules
- Progress visualization
- Next recommended activity suggestions

### 📅 Appointments
- View upcoming and past appointments
- Book new appointments
- Reschedule or cancel sessions
- Access telehealth session links
- Appointment history with notes

### 💬 Communication
- Secure messaging with health coaches
- Communication with nutritionists and support staff
- Message history
- Real-time notifications
- Encrypted conversations

### 👤 Profile Management
- View and update personal information
- Manage notification preferences
- Account settings
- Security controls

### 🔒 Privacy & Consent
- Control employer data access
- Manage aggregated vs individual data sharing
- View consent history
- Accept updated terms
- HIPAA compliance

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **React:** 19.2.3
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge

## Project Structure

```
vitaway-employee/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Home dashboard
│   │   ├── health/page.tsx       # Health overview
│   │   ├── goals/page.tsx        # Goals & progress
│   │   ├── programs/page.tsx     # Programs & learning
│   │   ├── appointments/page.tsx # Appointments
│   │   ├── messages/page.tsx     # Communication
│   │   ├── profile/page.tsx      # Profile management
│   │   └── consent/page.tsx      # Privacy & consent
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── dashboard-layout.tsx  # Main layout wrapper
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── header.tsx            # Top header
│   └── ui/
│       ├── card.tsx              # Card components
│       ├── button.tsx            # Button component
│       ├── badge.tsx             # Badge component
│       └── progress.tsx          # Progress bar
├── lib/
│   ├── api/
│   │   └── index.ts              # API service layer (mock data)
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
├── types/
│   └── index.ts                  # TypeScript type definitions
└── public/
```

## Key Design Principles

### 🔐 Privacy by Default
- Employees can only access their own data
- Consent settings affect employer visibility
- No cross-user data leakage
- All data operations enforce privacy rules

### 🎯 Role Isolation
- Strict EMPLOYEE role scoping
- No organization-wide data access
- No employer analytics visibility
- No billing or system settings access

### 🚫 Explicit Exclusions
- ❌ No medical diagnosis or treatment advice
- ❌ No AI-generated medical recommendations
- ❌ No employee comparisons
- ❌ No billing or insurance management
- ❌ No employer analytics access

### ✅ User Experience
- Simple, intuitive navigation
- Motivational tone and design
- Minimal cognitive load
- Mobile-responsive design
- Accessibility considerations

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vitaway-employee
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## API Integration

Currently, the application uses mock data in `lib/api/index.ts`. To integrate with a real backend:

1. Replace mock functions with actual API calls
2. Update the API endpoints in `lib/constants.ts`
3. Add authentication tokens and headers
4. Implement error handling and retry logic

Example API integration:

```typescript
export async function getEmployee(): Promise<Employee> {
  const response = await fetch('/api/employee', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch employee data');
  }
  
  return response.json();
}
```

## Data Models

### Employee
- Personal information
- Organization association
- Role and permissions
- Profile details

### Vitals
- BMI, Weight, Blood Pressure, Glucose
- Historical tracking
- Timestamp and notes

### Goals
- Exercise, Nutrition, Medication
- Progress tracking
- Start/end dates
- Assigned by coach

### Programs
- Learning modules
- Progress tracking
- Completion status

### Appointments
- Scheduled sessions
- Provider information
- Telehealth links
- Reschedule/cancel options

### Messages
- Secure conversations
- Health team communication
- Message history

### Consent
- Employer access control
- Data sharing preferences
- Version tracking

## Security Considerations

- All API calls should use HTTPS
- Implement proper authentication (JWT, OAuth)
- Session timeout management
- CSRF protection
- Input validation and sanitization
- Rate limiting on API calls
- Audit logging for sensitive operations

## Compliance

- **HIPAA:** Health data privacy and security
- **GDPR:** User data rights and consent
- **SOC 2:** Security and availability controls
- **Consent Management:** Version tracking and updates

## Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Advanced health analytics and charts
- [ ] Wearable device integration
- [ ] Mobile app (React Native)
- [ ] Offline support with service workers
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Accessibility improvements (WCAG compliance)
- [ ] PDF export for health reports
- [ ] Calendar integration (Google, Outlook)

## Contributing

This is an internal project. For questions or contributions, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For technical support or questions:
- Email: support@vitaway.com
- Internal Slack: #vitaway-employee-portal
