import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import PropTypes from 'prop-types';

import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import { HandThumbDownIcon as HandThumbDownOutline } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import { HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';

function Comment({ comment, deviceId }) {
  const { id, name, content, timestamp, score } = comment;

  const [userVote, setUserVote] = useState(null); // null, 1, or -1
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    // Reference to the device's vote document
    const voteRef = doc(db, 'comments', id, 'votes', deviceId);

    // Listen for real-time updates to the device's vote
    const unsubscribe = onSnapshot(
      voteRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserVote(docSnapshot.data().voteType);
        } else {
          setUserVote(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching device vote:', error);
        setError('Failed to fetch your vote.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, id, deviceId]);

  // Handler to set or update the device's vote
  const handleVote = async (voteType) => {
    const voteRef = doc(db, 'comments', id, 'votes', deviceId);

    try {
      if (userVote === voteType) {
        // User is toggling their vote off
        await deleteDoc(voteRef);
        await updateDoc(doc(db, 'comments', id), {
          score: increment(-voteType),
        });
      } else if (userVote === null) {
        // New vote
        await setDoc(voteRef, { voteType }, { merge: true });
        await updateDoc(doc(db, 'comments', id), {
          score: increment(voteType),
        });
      } else {
        // User is changing their vote
        const scoreChange = voteType - userVote; // e.g., from -1 to 1 => 2
        await setDoc(voteRef, { voteType }, { merge: true });
        await updateDoc(doc(db, 'comments', id), {
          score: increment(scoreChange),
        });
      }
    } catch (error) {
      console.error('Error setting vote:', error);
      setError('Failed to register your vote. Please try again.');
    }
  };

  const dateObj = timestamp ? timestamp.toDate() : new Date();
  const formattedDate = dateObj.toLocaleString();

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 max-w-2xl mx-auto">
      {/* Comment Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          <strong>{name || 'Anonymous'}</strong> • {formattedDate}
        </h3>
      </div>

      {/* Comment Content */}
      <p className="text-sm md:text-base text-gray-700 mt-2">
        {content || ''}
      </p>

      {/* Voting Section */}
      <div className="flex items-center justify-end mt-4 space-x-4">
        {/* Score Display */}
        <span className={`font-medium ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {score}
        </span>
        
        {/* Like Button */}
        <button
          onClick={() => handleVote(1)}
          className={`flex items-center focus:outline-none transition-colors duration-200 transform hover:scale-105 ${
            userVote === 1 ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
          }`}
          aria-label="Like Comment"
        >
          {userVote === 1 ? (
            <HandThumbUpSolid className="h-6 w-6 mr-1" />
          ) : (
            <HandThumbUpOutline className="h-6 w-6 mr-1 stroke-1.5" />
          )}
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => handleVote(-1)}
          className={`flex items-center focus:outline-none transition-colors duration-200 transform hover:scale-105 ${
            userVote === -1 ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
          aria-label="Dislike Comment"
        >
          {userVote === -1 ? (
            <HandThumbDownSolid className="h-6 w-6 mr-1" />
          ) : (
            <HandThumbDownOutline className="h-6 w-6 mr-1 stroke-1.5" />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    content: PropTypes.string,
    timestamp: PropTypes.object, 
    score: PropTypes.number,
  }).isRequired,
  deviceId: PropTypes.string.isRequired, 
};

export default React.memo(Comment);
