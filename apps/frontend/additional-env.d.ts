declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      NEXTAUTH_SECRET: string;
      APP_JWT_SECRET: string;
      NEXTAUTH_URL: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      NEXT_PUBLIC_SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export {};
