import React from 'react';
import SignOutButton from './SignOutButton';

const Appbar = () => {
  return (
    <header className='flex justify-end gap-4 bg-gradient-to-b from-blue-900 to-black p-4 shadow'>
      <SignOutButton />
    </header>
  );
};

export default Appbar;
