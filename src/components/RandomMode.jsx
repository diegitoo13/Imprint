import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import SafeHtml from './SafeHtml'; // Import the SafeHtml component
import BadAppleASCII from './BadAppleASCII';

function RandomMode({ comments, badAppleActive }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const containerRef = useRef(null); // For bounding box

  // Create flying items based on comments
  useEffect(() => {
    console.log('RandomMode mounted with comments count:', comments.length);
    const initialItems = comments.map(createFlyingItem);
    setFlyingItems(initialItems);
  }, [comments]);

  function createFlyingItem(comment) {
    const topPercent = Math.random() * 80; // Random vertical position
    const minFont = 16;
    const maxFont = 42;
    const fontSize = Math.floor(Math.random() * (maxFont - minFont + 1)) + minFont;
    const duration = Math.floor(Math.random() * 7) + 4; // Random duration between 4-10 seconds
    const uniqueKey = `${comment.id}-${Math.random()}`; // Unique key
    console.log(`Created flying item: ${uniqueKey}`);
    return {
      originalComment: comment,
      uniqueKey,
      topPercent,
      fontSize,
      duration,
    };
  }

  const handleAnimationEnd = (index) => {
    console.log(`Animation ended for item index: ${index}`);
    setFlyingItems((prev) => {
      const oldItem = prev[index];
      if (!oldItem) return prev;
      const newItem = createFlyingItem(oldItem.originalComment); // Replace finished item
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
