// Accept Invite Page — new employee onboarding via org invite link

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Building } from 'lucide-react';
import { acceptInvite, validateInviteToken } from '@/lib/api/auth';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [orgName, setOrgName] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate invite token on mount
  useEffect(() => {
    async function validate() {
      if (!token) {
        setInviteValid(false);
        return;
      }
      try {
        const res = await validateInviteToken(token);
        setInviteValid(res.valid);
        setInviteEmail(res.email);
        setOrgName(res.organizationName);
      } catch {
        setInviteValid(false);
      }
    }
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { tokens } = await acceptInvite({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        confirmPassword,
      });

      // Store tokens and redirect
      localStorage.setItem('vitaway_access_token', tokens.accessToken);
      localStorage.setItem('vitaway_refresh_token', tokens.refreshToken);
      localStorage.setItem('vitaway_expires_at', String(tokens.expiresAt));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (inviteValid === null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm text-gray-500">Validating invite…</p>
      </div>
    );
  }

  // Invalid token
  if (!inviteValid) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900">Invalid invite</h2>
        <p className="mt-2 text-sm text-gray-600">
          This invitation link is invalid or has expired. Please contact your employer
          for a new invite.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Vitaway</h2>
        <p className="mt-1 text-sm text-gray-600">
          Complete your account setup to get started
        </p>
      </div>

      {/* Org badge */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Building className="h-4 w-4" />
        <span>
          You&apos;ve been invited by <strong>{orgName}</strong>
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            value={inviteEmail}
            disabled
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
          />
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Create password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Re-enter password"
          />
        </div>

        {/* Password hints */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-medium text-gray-700">Password requirements:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li className={password.length >= 8 ? 'text-green-600' : ''}>
              At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
              One uppercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
              One number
            </li>
            <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
              One special character
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        By creating an account you agree to Vitaway&apos;s{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
