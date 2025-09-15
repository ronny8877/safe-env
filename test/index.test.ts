import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkEnv, checkEnvSafe, checkEnvSource } from '../src/index';



describe('env-check', () => {
  const originalEnv = process.env;
  const originalExit = process.exit;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    // Mock process.exit
    process.exit = vi.fn() as any;
    // Mock console.error
    console.error = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  describe('checkEnv', () => {
    it('should return success when all required variables are present', () => {
      process.env.API_KEY = 'test-key';
      process.env.DATABASE_URL = 'test-url';
      console.log('Environment variables set for testing.');

      const result = checkEnv(['API_KEY', 'DATABASE_URL']);
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should exit with error when variables are missing (default behavior)', () => {
      process.env.API_KEY = 'test-key';
      // DATABASE_URL is missing

      checkEnv(['API_KEY', 'DATABASE_URL']);
      
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return missing variables when exitOnError is false', () => {
      process.env.API_KEY = 'test-key';
      // DATABASE_URL is missing

      const result = checkEnv(['API_KEY', 'DATABASE_URL'], { exitOnError: false });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['DATABASE_URL']);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should work with prefix filtering', () => {
      process.env.NEXT_API_URL = 'test-url';
      process.env.NEXT_SECRET = 'test-secret';
      process.env.OTHER_VAR = 'other';

      const result = checkEnv(['NEXT_API_URL', 'NEXT_SECRET'], { prefix: 'NEXT_' });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should handle missing variables with prefix', () => {
      process.env.NEXT_API_URL = 'test-url';
      // NEXT_SECRET is missing

      const result = checkEnv(['NEXT_API_URL', 'NEXT_SECRET'], { 
        prefix: 'NEXT_', 
        exitOnError: false 
      });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['NEXT_SECRET']);
    });

    it('should filter out non-prefixed variables when prefix is provided', () => {
      process.env.NEXT_API_URL = 'test-url';
      process.env.OTHER_VAR = 'other';

      // Even though OTHER_VAR exists, it should be filtered out due to prefix
      const result = checkEnv(['NEXT_API_URL', 'OTHER_VAR'], { 
        prefix: 'NEXT_', 
        exitOnError: false 
      });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should work with custom source', () => {
      const customEnv = {
        API_KEY: 'custom-key',
        DATABASE_URL: 'custom-url'
      };

      const result = checkEnv(['API_KEY', 'DATABASE_URL'], { 
        source: customEnv,
        exitOnError: false 
      });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should handle missing variables in custom source', () => {
      const customEnv = {
        API_KEY: 'custom-key',
        DATABASE_URL: undefined
      };

      const result = checkEnv(['API_KEY', 'DATABASE_URL'], { 
        source: customEnv,
        exitOnError: false 
      });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['DATABASE_URL']);
    });

    it('should combine prefix and custom source', () => {
      const customEnv = {
        NEXT_API_URL: 'custom-url',
        NEXT_SECRET: 'custom-secret',
        OTHER_VAR: 'other'
      };

      const result = checkEnv(['NEXT_API_URL', 'NEXT_SECRET'], { 
        source: customEnv,
        prefix: 'NEXT_',
        exitOnError: false 
      });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should handle empty required variables array', () => {
      const result = checkEnv([], { exitOnError: false });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('checkEnvSafe', () => {
    it('should never exit the process', () => {
      // No environment variables set
      const result = checkEnvSafe(['API_KEY', 'DATABASE_URL']);
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['API_KEY', 'DATABASE_URL']);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should return success when all variables are present', () => {
      process.env.API_KEY = 'test-key';
      process.env.DATABASE_URL = 'test-url';

      const result = checkEnvSafe(['API_KEY', 'DATABASE_URL']);
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should work with all options except exitOnError', () => {
      const customEnv = {
        NEXT_API_URL: 'custom-url',
        NEXT_SECRET: undefined
      };

      const result = checkEnvSafe(['NEXT_API_URL', 'NEXT_SECRET'], { 
        source: customEnv,
        prefix: 'NEXT_'
      });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['NEXT_SECRET']);
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('checkEnvSource', () => {
    it('should check all keys in the provided source', () => {
      const source = {
        API_KEY: 'test-key',
        DATABASE_URL: 'test-url',
        SECRET: undefined
      };

      const result = checkEnvSource(source, { exitOnError: false });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['SECRET']);
    });

    it('should return success when all source values are defined', () => {
      const source = {
        API_KEY: 'test-key',
        DATABASE_URL: 'test-url'
      };

      const result = checkEnvSource(source, { exitOnError: false });
      
      expect(result.success).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should work with prefix filtering', () => {
      const source = {
        NEXT_API_URL: 'test-url',
        NEXT_SECRET: undefined,
        OTHER_VAR: 'other'
      };

      const result = checkEnvSource(source, { 
        prefix: 'NEXT_',
        exitOnError: false 
      });
      
      expect(result.success).toBe(false);
      expect(result.missing).toEqual(['NEXT_SECRET']);
    });

    it('should exit by default when variables are missing', () => {
      const source = {
        API_KEY: undefined
      };

      checkEnvSource(source);
      
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('error message formatting', () => {
    it('should format error message correctly', () => {
      checkEnv(['MISSING_VAR']);
      
      expect(console.error).toHaveBeenCalled();
      const errorMessage = (console.error as any).mock.calls[0][0];
      expect(errorMessage).toContain('☠️  ENVIRONMENT VARIABLES MISSING ☠️');
      expect(errorMessage).toContain('❌ MISSING_VAR');
      expect(errorMessage).toContain('───────────────────────────────────');
    });

    it('should format multiple missing variables', () => {
      checkEnv(['VAR1', 'VAR2', 'VAR3']);
      
      const errorMessage = (console.error as any).mock.calls[0][0];
      expect(errorMessage).toContain('❌ VAR1');
      expect(errorMessage).toContain('❌ VAR2');
      expect(errorMessage).toContain('❌ VAR3');
    });
  });
});