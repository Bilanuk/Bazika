'use client';

import useOneTapSignin from '@/hooks/OneTapSignin';

const OneTapComponent = () => {
  const { isLoading: oneTapIsLoading } = useOneTapSignin({
    redirect: true,
    parentContainerId: 'oneTap',
  });

  return <div id='oneTap' className='fixed right-0 top-32 ' />;
};

export default OneTapComponent;
