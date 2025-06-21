// ROO-AUDIT-TAG :: plan-001-user-auth.md :: Implement auth verification tests
import { signUp, signIn, signOut } from '../auth';
import { supabase } from '../supabase';

describe('Authentication Verification', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('Sign Up Flow', async () => {
    const { data, error } = await signUp(testEmail, testPassword);
    expect(error).toBeNull();
    expect(data.user?.email).toBe(testEmail);
  });

  test('Sign In Flow', async () => {
    const { data, error } = await signIn(testEmail, testPassword);
    expect(error).toBeNull();
    expect(data.user?.email).toBe(testEmail);
  });

  test('Sign Out Flow', async () => {
    await signIn(testEmail, testPassword);
    const { error } = await signOut();
    expect(error).toBeNull();
    
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });
});
// ROO-AUDIT-TAG :: plan-001-user-auth.md :: END