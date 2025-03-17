import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4001/graphql',
  overwrite: true,
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        fetcher: {
          endpoint: 'process.env.NEXT_PUBLIC_API_URL',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
