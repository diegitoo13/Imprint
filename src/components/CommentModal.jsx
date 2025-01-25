import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function CommentModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null; // If modal isn't open, don't render anything

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert('Please enter a comment.');
      return;
    }
    // If name is empty, store as "Anonymous"
    onSubmit(name || 'Anonymous', comment);
    // Clear the fields
    setName('');
    setComment('');
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // Close modal when clicking outside the content
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">New Comment</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Name (optional)</label>
          <input 
            type="text"
            className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Anonymous"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Comment</label>
          <textarea
            rows="4"
            className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write something..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition-colors"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') // Specify the portal root
  );
}

export default CommentModal;
