import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

function Header({ onNewComment, viewMode, toggleMode, onBadApple }) {
  // ---------------------------
  // 1. Hamburger Menu State
  // ---------------------------
  const [menuOpen, setMenuOpen] = useState(false);

  // Button label for "Switch to X Mode"
  const modeLabel = viewMode === 'random' ? 'List' : 'Random';

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleToggleMode = () => {
    toggleMode();
    setMenuOpen(false);
  };

  const handleNewComment = () => {
    onNewComment();
    setMenuOpen(false);
  };

  // ---------------------------
  // 2. Bad Apple Easter Egg State (Five Clicks)
  // ---------------------------
  const [clickCount, setClickCount] = useState(0);
  const [isBadAppleLoading, setIsBadAppleLoading] = useState(false); // Loading State
  const clickTimerRef = useRef(null);
  const clickThreshold = 2000; // 2 seconds to reset the count

  // Apple Counter State
  const [appleCounter, setAppleCounter] = useState(0);

  // Define the letters of "Imprint" and their corresponding delay classes
  const letters = ['I', 'm', 'p', 'r', 'i', 'n', 't'];
  const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-300', 'delay-500', 'delay-500', 'delay-700'];

  const handleBadApple = () => {
    onBadApple();
    setIsBadAppleLoading(true); // Start loading animation
  };

  const handleTitleClick = () => {
    setClickCount((prevCount) => prevCount + 1);

    // Clear existing timer if any
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    // Set a new timer to reset the click count after the threshold
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, clickThreshold);

    // If click count reaches 5, trigger handleBadApple and reset the count
    if (clickCount + 1 === 5) {
      handleBadApple();
      setClickCount(0);
      clearTimeout(clickTimerRef.current);
    }
  };

  // Apple Counter Logic
  useEffect(() => {
    let counterInterval;
    if (isBadAppleLoading) {
      counterInterval = setInterval(() => {
        setAppleCounter((prevCount) => (prevCount < 4 ? prevCount + 1 : 1));
      }, 500); // Change the interval duration as needed
    } else {
      setAppleCounter(0); // Reset counter when not loading
    }

    // Cleanup interval on component unmount or when loading stops
    return () => {
      if (counterInterval) clearInterval(counterInterval);
    };
  }, [isBadAppleLoading]);

  // Cleanup the click timer when the component unmounts
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return (
    <header className="p-4 bg-white shadow flex items-center justify-between w-full relative">
      {/* Title (Imprint) with 5-click detection and animations */}
      <div className="flex items-center">
        <h1
          className="text-2xl font-bold text-black cursor-pointer select-none flex items-center"
          onClick={handleTitleClick}
          tabIndex="0"
          role="button"
          aria-label="Imprint - Click five times to activate Easter Egg"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleTitleClick();
            }
          }}
        >
          {/* Split "Imprint" into individual letters and apply bounce animation */}
          {letters.map((char, index) => (
            <span
              key={index}
              className={`${isBadAppleLoading ? `${delays[index]} animate-bounce` : ''}`}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Remove the first four static apples */}
        {/* 
        {isBadAppleLoading && (
          <div className="flex space-x-2 ml-4">
            <span className="text-xl animate-bounce delay-100">🍎</span>
            <span className="text-xl animate-bounce delay-200">🍎</span>
            <span className="text-xl animate-bounce delay-300">🍎</span>
            <span className="text-xl animate-bounce delay-500">🍎</span>
          </div>
        )}
        */}

        {/* Render apple counter */}
        {isBadAppleLoading && (
          <div className="flex space-x-1 ml-4">
            {Array.from({ length: appleCounter }, (_, index) => (
              <span key={index} className="text-xl animate-bounce">🍎</span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Buttons (md+: show buttons inline) */}
      <div className="hidden md:flex gap-2">
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded"
          onClick={handleToggleMode}
        >
          Switch to {modeLabel} Mode
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleNewComment}
        >
          New Comment
        </button>
      </div>

      {/* Mobile Hamburger (shown on small screens) */}
      <div className="md:hidden">
        <button onClick={toggleMenu} className="p-2">
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6 text-black" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-black" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white shadow p-3 flex flex-col items-start z-50 w-48">
          <button
            className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            onClick={handleToggleMode}
          >
            Switch to {modeLabel} Mode
          </button>
          <button
            className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            onClick={handleNewComment}
          >
            New Comment
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
