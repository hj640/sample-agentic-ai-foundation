'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';

// Configure Amplify with environment variables
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '', 
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      region: process.env.NEXT_PUBLIC_AWS_REGION || '',
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

console.log('Amplify config being used:', amplifyConfig);
Amplify.configure(amplifyConfig);

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Authenticator>
      {children}
    </Authenticator>
  );
}