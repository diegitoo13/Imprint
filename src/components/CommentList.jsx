import React from 'react';
import SafeHtml from './SafeHtml'; // Import the SafeHtml component

function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="p-4 text-black">No comments yet...</p>;
  }

  return (
    <div className="p-4">
      {comments.map((comment) => {
        const dateObj = comment.timestamp ? comment.timestamp.toDate() : new Date();
        const formattedDate = dateObj.toLocaleString();

        // Format content with HTML
        const contentWithHtml = `<strong>${comment.name || 'Anonymous'}</strong>, ${formattedDate}`;

        return (
          <div
            key={comment.id}
            className="bg-gray-100 border border-gray-300 rounded p-4 my-2 text-black"
          >
            <h3 className="font-semibold mb-1">
              <SafeHtml html={contentWithHtml} />
            </h3>
            {/* Render sanitized HTML */}
            <SafeHtml html={comment.content || ''} />
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
