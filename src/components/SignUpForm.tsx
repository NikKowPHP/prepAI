import React from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import AuthErrorDisplay from './AuthErrorDisplay';
import { validateEmail, validatePassword, calculatePasswordStrength } from '../lib/validation';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else {
      // Reset form
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {error && <AuthErrorDisplay error={error} />}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            const validation = validateEmail(e.target.value);
            setEmailError(validation.valid ? undefined : validation.message);
          }}
          className="w-full px-3 py-2 border rounded"
          required
        />
        {emailError && (
          <div className="text-red-500 text-sm mt-1">{emailError}</div>
        )}
        <div className="password-strength-meter mt-2 flex gap-1 h-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                passwordStrength >= i
                  ? passwordStrength >= 3
                    ? 'bg-green-500'
                    : passwordStrength >= 2
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {passwordError && (
          <div className="text-red-500 text-sm mt-1">{passwordError}</div>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            const validation = validatePassword(e.target.value);
            setPasswordError(validation.valid ? undefined : validation.message);
            setPasswordStrength(calculatePasswordStrength(e.target.value));
          }}
          className="w-full px-3 py-2 border rounded"
          required
          minLength={8}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}