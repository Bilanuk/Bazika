import { User } from 'next-auth';

import { OAuth2Client } from 'google-auth-library';

const googleAuthClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_ID);

import { adapter } from './authOptions';

export const authorize = async (
  credentials: Record<'credential', string> | undefined
): Promise<User | null> => {
  const token = credentials!.credential;
  const ticket = await googleAuthClient.verifyIdToken({
    idToken: token,
    audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Cannot extract payload from signin token');
  }

  const {
    email,
    sub,
    given_name,
    family_name,
    email_verified,
    picture: image,
  } = payload;
  if (!email) {
    throw new Error('Email not available');
  }

  let user = await adapter.getUserByEmail!(email);

  if (!user) {
    user = await adapter.createUser!({
      name: [given_name, family_name].join(' '),
      email,
      image,
      emailVerified: email_verified ? new Date() : null,
    });
  }

  // The user may already exist, but maybe it signed up with a different provider. With the next few lines of code
  // we check if the user already had a Google account associated, and if not we create one.
  let account = await adapter.getUserByAccount!({
    provider: 'google',
    providerAccountId: sub,
  });

  if (!account && user) {
    console.log('creating and linking account');
    await adapter.linkAccount!({
      userId: user.id,
      provider: 'google',
      providerAccountId: sub,
      type: 'oauth',
    });
  }
  return user;
};
