/**
 * Tests for the Supabase client initialization.
 */

const mockCreateClient = jest.fn(() => ({
  from: jest.fn(),
  auth: { getSession: jest.fn() },
  storage: { from: jest.fn() },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

describe('supabase client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    mockCreateClient.mockClear();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should call createClient with env variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    jest.isolateModules(() => {
      require('../../src/lib/supabase');
    });

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('should default to empty strings when env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    jest.isolateModules(() => {
      require('../../src/lib/supabase');
    });

    expect(mockCreateClient).toHaveBeenCalledWith('', '');
  });

  it('should export the supabase client', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    let supabaseModule: { supabase: unknown };
    jest.isolateModules(() => {
      supabaseModule = require('../../src/lib/supabase');
    });

    expect(supabaseModule!.supabase).toBeDefined();
    expect(supabaseModule!.supabase).toHaveProperty('from');
    expect(supabaseModule!.supabase).toHaveProperty('auth');
    expect(supabaseModule!.supabase).toHaveProperty('storage');
  });
});
