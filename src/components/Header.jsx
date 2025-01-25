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
  const clickTimerRef = useRef(null);
  const clickThreshold = 2000; // 2 seconds to reset the count

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

    // If click count reaches 5, trigger onBadApple and reset the count
    if (clickCount + 1 === 5) {
      onBadApple();
      setClickCount(0);
      clearTimeout(clickTimerRef.current);
    }
  };

  // Cleanup the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return (
    <header className="p-4 bg-white shadow flex items-center justify-between w-full relative">
      {/* Title (Imprint) with 5-click detection */}
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
        Imprint
        {/* Optional: Display click count for user feedback */}
        {/* <span className="ml-2 text-sm text-gray-500">({clickCount}/5)</span> */}
      </h1>

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
