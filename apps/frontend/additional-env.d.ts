declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      NEXTAUTH_SECRET: string;
      APP_JWT_SECRET: string;
      NEXTAUTH_URL: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      NEXT_PUBLIC_DATABASE_URL: string;
      NEXT_PUBLIC_MINIO_HOST?: string;
      NEXT_PUBLIC_MINIO_PORT?: string;
    }
  }
}

export {};
