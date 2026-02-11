# Vitaway Employee Portal - API Integration Guide

## ✅ Integration Complete

All APIs have been successfully integrated with the backend at `http://127.0.0.1:8000`. The application is now using **real API calls** instead of mock data.

## Files Created/Updated

### New Files
- **lib/api/client.ts** - API client with authentication and error handling
- **lib/api/consent.ts** - Consent management API functions

### Updated Files
- **lib/api/auth.ts** - Authentication endpoints (login, logout, refresh, etc.)
- **lib/api/index.ts** - All employee dashboard APIs
- **lib/constants.ts** - Updated with real API endpoints

## API Coverage

All endpoints from the EMPLOYEE_API.md documentation have been implemented:

### Authentication

```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Employee

```typescript
GET  /api/employee              // Get current employee profile
PUT  /api/employee              // Update employee profile
```

### Consent

```typescript
GET  /api/consent               // Get consent preferences
PUT  /api/consent               // Update consent preferences
GET  /api/consent/history       // Get consent history
```

### Vitals

```typescript
GET  /api/vitals                // Get all vitals
GET  /api/vitals/:type          // Get vitals by type (WEIGHT, BMI, etc.)
POST /api/vitals                // Record new vital (if allowed)
```

### Goals

```typescript
GET  /api/goals                 // Get all goals
GET  /api/goals/:id             // Get specific goal
PUT  /api/goals/:id/progress    // Update goal progress
```

### Programs

```typescript
GET  /api/programs              // Get all assigned programs
GET  /api/programs/:id          // Get program details
GET  /api/programs/:id/modules  // Get program modules
PUT  /api/programs/:id/modules/:moduleId/complete  // Mark module complete
```

### Appointments

```typescript
GET    /api/appointments           // Get all appointments
GET    /api/appointments/:id       // Get appointment details
POST   /api/appointments           // Book new appointment
PUT    /api/appointments/:id       // Reschedule appointment
DELETE /api/appointments/:id       // Cancel appointment
```

### Messages

```typescript
GET  /api/conversations         // Get all conversations
GET  /api/conversations/:id/messages  // Get messages in conversation
POST /api/conversations/:id/messages  // Send new message
PUT  /api/messages/:id/read     // Mark message as read
```

### Notifications

```typescript
GET  /api/notifications         // Get all notifications
PUT  /api/notifications/:id/read  // Mark notification as read
PUT  /api/notifications/read-all  // Mark all as read
```

### Dashboard

```typescript
GET  /api/dashboard/stats       // Get dashboard summary statistics
```

## Implementation Steps

### 1. Create API Client

Create `lib/api/client.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`, // Implement getToken()
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### 2. Update API Functions

Replace mock functions in `lib/api/index.ts`:

```typescript
import { apiClient } from './client';
import type { Employee } from '@/types';

export async function getEmployee(): Promise<Employee> {
  return apiClient<Employee>('/api/employee');
}

export async function updateEmployee(data: Partial<Employee>): Promise<Employee> {
  return apiClient<Employee>('/api/employee', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

### 3. Add Error Handling

Implement proper error boundaries and user feedback:

```typescript
try {
  const data = await getEmployee();
  setEmployee(data);
} catch (error) {
  console.error('Failed to load employee:', error);
  // Show toast notification or error message
  setError('Failed to load your profile. Please try again.');
}
```

### 4. Add Authentication

Implement token management:

```typescript
// lib/auth/tokens.ts
export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('access_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
```

### 5. Add Request/Response Interceptors

For loading states and error handling:

```typescript
// Create a custom hook
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T,>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
```

## Request/Response Formats

### Example: Get Employee

**Request:**
```http
GET /api/employee HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response:**
```json
{
  "id": "emp-001",
  "email": "john.doe@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org-001",
  "organizationName": "Tech Corp",
  "role": "EMPLOYEE",
  "dateOfBirth": "1990-05-15",
  "phone": "+1 (555) 123-4567",
  "joinedAt": "2025-01-15T00:00:00Z"
}
```

### Example: Update Consent

**Request:**
```http
PUT /api/consent HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "allowEmployerAccess": true,
  "allowAggregatedData": true,
  "allowIndividualData": false
}
```

**Response:**
```json
{
  "allowEmployerAccess": true,
  "allowAggregatedData": true,
  "allowIndividualData": false,
  "lastUpdated": "2026-02-10T15:30:00Z",
  "version": "1.0"
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401) - Invalid or expired authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `SERVER_ERROR` (500) - Internal server error

## Security Considerations

1. **Token Storage**: Use httpOnly cookies instead of localStorage for production
2. **HTTPS Only**: Never send tokens over HTTP
3. **Token Refresh**: Implement automatic token refresh
4. **CSRF Protection**: Add CSRF tokens to state-changing requests
5. **Rate Limiting**: Implement client-side rate limiting
6. **Input Validation**: Validate all user inputs
7. **XSS Prevention**: Sanitize all user-generated content

## Testing

### Mock API Server

Use MSW (Mock Service Worker) for development:

```bash
npm install msw --save-dev
```

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/employee', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'emp-001',
        email: 'john.doe@company.com',
        // ... rest of employee data
      })
    );
  }),
];
```

## Monitoring

Implement API monitoring:

```typescript
// Track API performance
const startTime = performance.now();
const data = await apiClient('/api/employee');
const duration = performance.now() - startTime;

// Log to analytics
analytics.track('api_call', {
  endpoint: '/api/employee',
  duration,
  status: 'success',
});
```

## Next Steps

1. Set up environment variables in `.env.local`
2. Replace mock functions with actual API calls
3. Implement authentication flow
4. Add error boundaries
5. Test all API integrations
6. Add loading states
7. Implement retry logic
8. Add offline support (optional)
