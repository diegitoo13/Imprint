import React from 'react';

function Header({ onNewComment, viewMode, toggleMode }) {
  return (
    <header className="p-4 bg-white shadow flex items-center justify-between w-full">
      <h1 className="text-2xl font-bold text-black">Imprint</h1>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-2">
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded"
          onClick={toggleMode}
        >
          Switch to {viewMode === 'random' ? 'List' : 'Random'} Mode
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={onNewComment}
        >
          New Comment
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className="flex md:hidden">
        <select
          className="border border-gray-300 rounded p-2 mr-2"
          onChange={(e) => {
            if (e.target.value === 'random' || e.target.value === 'list') {
              toggleMode();
            } else if (e.target.value === 'new') {
              onNewComment();
            }
          }}
        >
          <option value="">Actions</option>
          <option value="random">
            {viewMode === 'random' ? 'Switch to List Mode' : 'Switch to Random Mode'}
          </option>
          <option value="new">New Comment</option>
        </select>
      </div>
    </header>
  );
}

export default Header;
