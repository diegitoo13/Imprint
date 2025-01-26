import React from 'react';
import Comment from './Comment';
import PropTypes from 'prop-types';

function CommentList({ comments, deviceId }) {
  if (!comments || comments.length === 0) {
    return <p className="p-4 text-center text-gray-500">No comments yet...</p>;
  }

  return (
    <div className="space-y-6 p-4">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} deviceId={deviceId} />
      ))}
    </div>
  );
}

CommentList.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      content: PropTypes.string,
      timestamp: PropTypes.object,
      score: PropTypes.number,
    })
  ).isRequired,
  deviceId: PropTypes.string.isRequired, 
};

export default CommentList;