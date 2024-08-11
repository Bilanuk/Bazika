'use client';

import React from 'react';
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface ClientSideCarouselProps {
  children: React.ReactNode;
}

const ClientSideCarousel: React.FC<ClientSideCarouselProps> = ({
  children,
}) => {
  return (
    <Carousel
      className='w-full rounded-md p-3'
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      {children}
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ClientSideCarousel;
