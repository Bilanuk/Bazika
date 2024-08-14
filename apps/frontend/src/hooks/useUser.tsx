import { GET_USER } from '@queries/user';
import { getClient } from '@/lib/client';

export const useUser = async () => {
  const {
    data: { user },
  } = await getClient().query({
    query: GET_USER,
  });

  return user;
};
