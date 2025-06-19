import { supabase } from '../supabase';

describe('Environment Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should throw error when Supabase URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(() => supabase).toThrow('Supabase URL and Anon Key must be defined in environment variables');
  });

  it('should throw error when Supabase Anon Key is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => supabase).toThrow('Supabase URL and Anon Key must be defined in environment variables');
  });

  it('should initialize Supabase client when all variables are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    expect(() => supabase).not.toThrow();
    expect(supabase).toBeDefined();
  });
});