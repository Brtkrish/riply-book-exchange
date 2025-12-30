
import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface CountUpAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  separator?: string;
}

const CountUpAnimation = ({
  end,
  duration = 2,
  suffix = '',
  separator = ','
}: CountUpAnimationProps) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      setHasPlayed(true);
    }
  }, [inView]);

  return (
    <div ref={ref}>
      <CountUp
        start={0}
        end={hasPlayed ? end : 0}
        duration={duration}
        suffix={suffix}
        separator={separator}
      />
    </div>
  );
};

export default CountUpAnimation;
