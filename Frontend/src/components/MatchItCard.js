// Card.js
import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';

const MatchItCard = ({ content, onSwipeRight, onSwipeLeft }) => {
  const [{ x }, set] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(({ down, movement: [mx] }) => {
    const isSwipingRight = mx > 100;
    const isSwipingLeft = mx < -100;

    if (!down) {
      set({ x: 0 });
      if (isSwipingRight) {
        onSwipeRight();
      } else if (isSwipingLeft) {
        onSwipeLeft();
      }
    } else {
      set({ x: down ? mx : 0 });
    }
  });

  return (
    <animated.div
      {...bind()}
      style={{
        width: '300px',
        height: '400px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: x.interpolate((x) => `translate3d(${x}px, -50%, 0)`),
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ width: '100%', height: '100%', padding: '20px', borderRadius: '10px' }}>{content}</div>
      </div>
    </animated.div>
  );
};

export default MatchItCard;
