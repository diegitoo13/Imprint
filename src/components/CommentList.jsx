// src/components/CommentList.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="p-4 text-black">No comments yet...</p>;
  }

  return (
    <div className="p-4">
      {comments.map((comment) => {
        const dateObj = comment.timestamp ? comment.timestamp.toDate() : new Date();
        const formattedDate = dateObj.toLocaleString();

        return (
          <div
            key={comment.id}
            className="bg-gray-100 border border-gray-300 rounded p-4 my-2 text-black"
          >
            <h3 className="font-semibold mb-1">
              {comment.name || 'Anonymous'}, {formattedDate}
            </h3>
            {/* Parse Markdown in the comment */}
            <ReactMarkdown>{comment.content || ''}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
