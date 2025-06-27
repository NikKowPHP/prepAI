import React from 'react';
import SignInForm from '@/components/SignInForm';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn()
    }
  }
}));

describe('SignInForm', () => {
  it('calls signInWithPassword with email and password', async () => {
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: null });
    
    const formData = {
      email: 'test@example.com',
      password: 'ValidPass123!'
    };
    
    // Simulate form submission
    await SignInForm.prototype.handleSubmit({
      preventDefault: jest.fn(),
      target: {
        elements: {
          email: { value: formData.email },
          password: { value: formData.password }
        }
      }
    } as unknown as React.FormEvent);
    
    expect(mockSignIn).toHaveBeenCalledWith(formData);
  });

  it('handles sign in errors', async () => {
    const errorMessage = 'Invalid credentials';
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: { message: errorMessage } });
    
    const setErrorMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementation(() => ['', setErrorMock]);
    
    // Simulate form submission
    await SignInForm.prototype.handleSubmit({
      preventDefault: jest.fn(),
      target: {
        elements: {
          email: { value: 'test@example.com' },
          password: { value: 'wrongpass' }
        }
      }
    } as unknown as React.FormEvent);
    
    expect(setErrorMock).toHaveBeenCalledWith(errorMessage);
  });
});