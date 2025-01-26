import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import SafeHtml from './SafeHtml'; 
import BadAppleASCII from './BadAppleASCII';
import PropTypes from 'prop-types';
import useWindowSize from '../utils/useWindowSize'; // Corrected import path

function RandomMode({ comments, badAppleActive }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const containerRef = useRef(null); 

  // Get current window size
  const windowSize = useWindowSize();

  // Function to determine MAX_FLYING_ITEMS based on screen width
  const getMaxFlyingItems = (width) => {
    if (width <= 480) { // Small devices 
      return 15;
    } else if (width <= 768) { // Medium devices
      return 18;
    } else { // Large devices
      return 20;
    }
  };

  // Determine current MAX_FLYING_ITEMS
  const maxFlyingItems = getMaxFlyingItems(windowSize.width || 1024); 

  // State to store filtered comments
  const [filteredComments, setFilteredComments] = useState([]);

  // Precompute cumulative weights for efficient weighted random selection
  const [cumulativeWeights, setCumulativeWeights] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    // Filter comments with score >= 0
    const fc = comments.filter(comment => comment.score >= 0);
    setFilteredComments(fc);
    console.log(`Filtered Comments Count (score >= 0): ${fc.length}`);

    if (fc.length === 0) {
      setCumulativeWeights([]);
      setTotalWeight(0);
      return;
    }

    // Assign weights based on scores
    const weights = fc.map(comment => (comment.score > 0 ? comment.score : 1));
    console.log('Assigned Weights:', weights);

    // Compute cumulative weights
    let cumWeight = 0;
    const cumWeights = weights.map(weight => {
      cumWeight += weight;
      return cumWeight;
    });
    console.log('Cumulative Weights:', cumWeights);

    setCumulativeWeights(cumWeights);
    setTotalWeight(cumWeight);
  }, [comments]);

  // Function to select a comment based on weighted random selection
  const selectWeightedRandomComment = () => {
    if (totalWeight === 0 || filteredComments.length === 0) return null; // No comments to select

    const randomValue = Math.random() * totalWeight;
    console.log(`Random Value for Selection: ${randomValue}`);

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

    console.log(`Selected Comment Index: ${selectedIndex}`);
    const selectedComment = filteredComments[selectedIndex] || null;
    if (selectedComment) {
      console.log(`Selected Comment ID: ${selectedComment.id}`);
    } else {
      console.log('No comment selected.');
    }
    return selectedComment;
  };

  // Function to create a flying item with randomized properties
  const createFlyingItem = (comment) => {
    const topPercent = Math.random() * 80; // Random vertical position between 0-80%

    // Define font size ranges based on screen width
    let minFont = 16;
    let maxFont = 42;

    if (windowSize.width) {
      if (windowSize.width <= 480) { // Small devices like iPhones
        minFont = 14;
        maxFont = 22;
      } else if (windowSize.width <= 768) { // Medium devices like Tablets, Small Laptops
        minFont = 14;
        maxFont = 24;
      }
      // You can add more breakpoints as needed
    }

    const fontSize = Math.floor(Math.random() * (maxFont - minFont + 1)) + minFont;
    const duration = Math.floor(Math.random() * 7) + 4; // Random duration between 4-10 seconds
    const uniqueKey = `${comment.id}-${Date.now()}-${Math.random()}`; // Unique key

    console.log(`Created flying item: ${uniqueKey} with fontSize: ${fontSize}px`);

    return {
      originalComment: comment,
      uniqueKey,
      topPercent,
      fontSize,
      duration,
    };
  };

  // Function to add a flying item with a delay
  const addFlyingItemWithDelay = (delay, comment) => {
    setTimeout(() => {
      const newItem = createFlyingItem(comment);
      setFlyingItems(prev => [...prev, newItem]);
      console.log(`Added flying item after ${delay}ms: ${newItem.uniqueKey}`);
    }, delay);
  };

  // Initialize flying items with staggered delays
  useEffect(() => {
    if (filteredComments.length === 0) {
      setFlyingItems([]);
      return;
    }

    setFlyingItems([]); // Clear existing flying items

    const initialItems = [];
    for (let i = 0; i < Math.min(maxFlyingItems, filteredComments.length); i++) {
      const comment = selectWeightedRandomComment();
      if (comment) {
        // Stagger the addition of each flying item by 200ms
        addFlyingItemWithDelay(i * 200, comment);
      }
    }

    console.log('Initialized flying items with staggered delays.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeWeights, totalWeight, filteredComments, maxFlyingItems]);

  // Handler to replace a flying item when its animation ends
  const handleAnimationEnd = (uniqueKey) => {
    console.log(`Animation ended for item: ${uniqueKey}`);
    setFlyingItems((prev) => {
      const newArray = prev.filter(item => item.uniqueKey !== uniqueKey);
      console.log(`Removed flying item: ${uniqueKey}`);
      return newArray;
    });

    // Add a new flying item to maintain the maximum number
    const comment = selectWeightedRandomComment();
    if (comment) {
      // Add the new flying item after a short delay to stagger animations
      addFlyingItemWithDelay(200, comment);
    }
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
        {flyingItems.map((item) => {
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
                whiteSpace: 'nowrap', // Prevent text wrapping
                willChange: 'transform', // Hint for performance optimization
              }}
              onAnimationEnd={() => handleAnimationEnd(uniqueKey)}
              role="alert" // Accessibility
              aria-live="polite"
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

RandomMode.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      name: PropTypes.string,
      score: PropTypes.number.isRequired,
    })
  ).isRequired,
  badAppleActive: PropTypes.bool.isRequired,
};

export default RandomMode;
