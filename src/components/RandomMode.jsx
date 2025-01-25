import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import BadAppleASCII from './BadAppleASCII';

// We'll measure the containerRef to size ASCII accordingly
function RandomMode({ comments, badAppleActive }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const containerRef = useRef(null); // for bounding box

  useEffect(() => {
    const initialItems = comments.map(createFlyingItem);
    setFlyingItems(initialItems);
  }, [comments]);

  function createFlyingItem(comment) {
    const topPercent = Math.random() * 80;
    const minFont = 16;
    const maxFont = 42;
    const fontSize = Math.floor(Math.random() * (maxFont - minFont + 1)) + minFont;
    const duration = Math.floor(Math.random() * 7) + 4; // 4..10 seconds
    const uniqueKey = `${comment.id}-${Math.random()}`;
    return {
      originalComment: comment,
      uniqueKey,
      topPercent,
      fontSize,
      duration
    };
  }

  const handleAnimationEnd = (index) => {
    setFlyingItems((prev) => {
      const oldItem = prev[index];
      if (!oldItem) return prev;
      const newItem = createFlyingItem(oldItem.originalComment);
      const newArray = [...prev];
      newArray[index] = newItem;
      return newArray;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        height: 'calc(100vh - 180px)', // space for header+footer
        width: '100%'
      }}
    >
      {/* If Bad Apple is active, show ASCII behind everything */}
      {badAppleActive && (
        <BadAppleASCII
          isActive
          containerRef={containerRef} // pass the ref so ASCII can size itself
        />
      )}

      {/* Floating comments (remove white bg so ASCII is visible) */}
      <div className="relative z-10 w-full h-full">
        {flyingItems.map((item, i) => {
          const { originalComment, uniqueKey, topPercent, fontSize, duration } = item;
          const textWithAuthor = `${originalComment.content || ''} - ${
            originalComment.name || 'Anonymous'
          }`;

          return (
            <div
              key={uniqueKey}
              style={{
                position: 'absolute',
                top: `${topPercent}vh`,
                fontSize: fontSize,
                animation: `danmakuScroll ${duration}s linear forwards`,
                color: badAppleActive ? 'red' : 'black'
              }}
              onAnimationEnd={() => handleAnimationEnd(i)}
            >
              <ReactMarkdown>{textWithAuthor}</ReactMarkdown>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RandomMode;
