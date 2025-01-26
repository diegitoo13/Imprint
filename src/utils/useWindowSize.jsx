import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 200); 

    window.addEventListener('resize', handleResize);

    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  return windowSize;
}

export default useWindowSize;
