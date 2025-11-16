import { Amplify } from 'aws-amplify';

// Configuration values embedded at build time
const config = {
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  apiUrl: process.env.NEXT_PUBLIC_API_URL
};

console.log('Final Amplify config:', config);

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: config.userPoolId!,
      userPoolClientId: config.userPoolClientId!,
      identityPoolId: config.identityPoolId!,
      region: config.region!,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
      },
    }
  }
};

Amplify.configure(amplifyConfig);
export default amplifyConfig;