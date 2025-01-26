
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import SafeHtml from './SafeHtml'; // Import the SafeHtml component
import BadAppleASCII from './BadAppleASCII';

function RandomMode({ comments, badAppleActive }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const containerRef = useRef(null); // For bounding box

  const MAX_FLYING_ITEMS = 20; // Limit the number of concurrent flying items

  // Precompute cumulative weights for efficient weighted random selection
  const [cumulativeWeights, setCumulativeWeights] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    // Filter out comments with negative scores or handle as per your logic
    const filteredComments = comments.filter(comment => comment.score > 0);

    // Assign weights based on scores
    const weights = filteredComments.map(comment => comment.score);

    // Compute cumulative weights
    let cumWeight = 0;
    const cumWeights = weights.map(weight => {
      cumWeight += weight;
      return cumWeight;
    });

    setCumulativeWeights(cumWeights);
    setTotalWeight(cumWeight);
  }, [comments]);

  // Function to select a comment based on weighted random selection
  const selectWeightedRandomComment = () => {
    if (totalWeight === 0) return null; // No comments to select

    const randomValue = Math.random() * totalWeight;

    // Binary search to find the comment corresponding to the random value
    let low = 0;
    let high = cumulativeWeights.length - 1;
    let selectedIndex = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (randomValue < cumulativeWeights[mid]) {
        selectedIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return comments.filter(comment => comment.score > 0)[selectedIndex] || null;
  };

  // Initialize flying items with a limited number of comments
  useEffect(() => {
    const initialItems = [];
    for (let i = 0; i < Math.min(MAX_FLYING_ITEMS, comments.length); i++) {
      const comment = selectWeightedRandomComment();
      if (comment) {
        initialItems.push(createFlyingItem(comment));
      }
    }
    setFlyingItems(initialItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeWeights, totalWeight, comments]);

  // Function to create a flying item with randomized properties
  function createFlyingItem(comment) {
    const topPercent = Math.random() * 80; // Random vertical position between 0-80%
    const minFont = 16;
    const maxFont = 42;
    const fontSize = Math.floor(Math.random() * (maxFont - minFont + 1)) + minFont;
    const duration = Math.floor(Math.random() * 7) + 4; // Random duration between 4-10 seconds
    const uniqueKey = `${comment.id}-${Math.random()}`; // Unique key
    return {
      originalComment: comment,
      uniqueKey,
      topPercent,
      fontSize,
      duration,
    };
  }

  // Handler to replace a flying item when its animation ends
  const handleAnimationEnd = (index) => {
    setFlyingItems((prev) => {
      const oldItem = prev[index];
      if (!oldItem) return prev;

      const newComment = selectWeightedRandomComment();
      if (!newComment) return prev; // No comment to replace with

      const newItem = createFlyingItem(newComment);
      const newArray = [...prev];
      newArray[index] = newItem;
      return newArray;
    });
  };

  // Use `useLayoutEffect` to ensure `containerRef` is ready before rendering ASCII art
  useLayoutEffect(() => {
    if (badAppleActive && containerRef.current) {
      console.log('Bad Apple activated and containerRef is set.');
    }
  }, [badAppleActive]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        height: 'calc(100vh - 180px)', // Space for header and footer
        width: '100%',
      }}
    >
      {/* BadAppleASCII is rendered behind the flying comments */}
      {badAppleActive && containerRef.current && (
        <BadAppleASCII
          isActive={badAppleActive} // Activate ASCII art
          containerRef={containerRef} // Pass containerRef for sizing
        />
      )}

      {/* Floating comments */}
      <div className="relative z-10 w-full h-full">
        {flyingItems.map((item, i) => {
          const { originalComment, uniqueKey, topPercent, fontSize, duration } = item;
          const textWithAuthor = `${originalComment.content || ''} -${originalComment.name || 'Anonymous'}`;

          return (
            <div
              key={uniqueKey}
              style={{
                position: 'absolute',
                top: `${topPercent}vh`,
                fontSize: `${fontSize}px`,
                animation: `danmakuScroll ${duration}s linear forwards`,
                color: badAppleActive ? 'red' : 'black', // Highlight in red when Bad Apple is active
              }}
              onAnimationEnd={() => handleAnimationEnd(i)}
            >
              {/* Render sanitized HTML */}
              <SafeHtml html={textWithAuthor} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RandomMode;
