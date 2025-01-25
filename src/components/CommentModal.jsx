import React, { useState } from 'react';

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4">New Comment</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Name (optional)</label>
          <input 
            type="text"
            className="border rounded w-full p-2"
            placeholder="Anonymous"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Comment</label>
          <textarea
            rows="3"
            className="border rounded w-full p-2"
            placeholder="Write something..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
