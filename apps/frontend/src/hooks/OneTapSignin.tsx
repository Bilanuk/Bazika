import { useState } from 'react';
import { signIn, SignInOptions, useSession } from 'next-auth/react';
import { IdConfiguration } from 'google-one-tap';

interface OneTapSigninOptions {
  parentContainerId?: string;
}

const useOneTapSignin = (
  options?: OneTapSigninOptions &
    Pick<SignInOptions, 'redirect' | 'callbackUrl'>
) => {
  const { parentContainerId } = options || {};
  const [isLoading, setIsLoading] = useState(false);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      if (!isLoading) {
        const { google } = window;
        if (google) {
          google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: async (response: any) => {
              setIsLoading(true);

              await signIn('googleonetap', {
                credential: response.credential,
                redirect: true,
                ...options,
              });
              setIsLoading(false);
            },
            prompt_parent_id: parentContainerId,
            log_level: 'debug',
          } as IdConfiguration);

          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log(
                'getNotDisplayedReason ::',
                notification.getNotDisplayedReason()
              );
            } else if (notification.isSkippedMoment()) {
              console.log(
                'getSkippedReason  ::',
                notification.getSkippedReason()
              );
            } else if (notification.isDismissedMoment()) {
              console.log(
                'getDismissedReason ::',
                notification.getDismissedReason()
              );
            }
          });
        }
      }
    },
  });

  return { isLoading };
};

export default useOneTapSignin;
