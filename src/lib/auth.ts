import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// Current session cache
let currentSession: Session | null = null;

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  currentSession = data.session;
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  currentSession = data?.session ?? null;
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  currentSession = null;
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  currentSession = data.session;
  return { session: data.session, error };
};

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  currentSession = data.session;
  return { session: data.session, error };
};

export const isValidSession = async () => {
  if (!currentSession?.expires_at) return false;
  const expiresAt = new Date(currentSession.expires_at * 1000);
  return expiresAt > new Date();
};

export const getCurrentUser = () => {
  return currentSession?.user ?? null;
};

// Setup auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  currentSession = session;
  console.log(`Auth state changed: ${event}`, session?.user);
});