import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

function RandomMode({ comments }) {
  const [flyingItems, setFlyingItems] = useState([]);

  // 1) On initial load or when "comments" changes,
  //    create a flying item for each comment.
  useEffect(() => {
    const initialItems = comments.map((comment) => createFlyingItem(comment));
    setFlyingItems(initialItems);
  }, [comments]);

  // 2) Helper to create a random "flying item" from a Firestore comment
  function createFlyingItem(comment) {
    // Random top in [0..80]% (adjust to your liking)
    const topPercent = Math.random() * 80;

    // Random font size (in px) - you can also scale to screen width
    const minFont = 16;
    const maxFont = 42; // e.g., bigger text possible
    const fontSize = Math.floor(Math.random() * (maxFont - minFont + 1)) + minFont;

    // Random duration in [4..10] seconds
    const duration = Math.floor(Math.random() * 7) + 4; // 4..10

    // Unique key to help React re-render properly
    const uniqueKey = `${comment.id}-${Math.random()}`;

    return {
      originalComment: comment, // So we can re-create on end
      uniqueKey,
      topPercent,
      fontSize,
      duration
    };
  }

  // 3) When an item finishes scrolling, replace it with a new random item
  const handleAnimationEnd = (index) => {
    setFlyingItems((prev) => {
      // get old item
      const oldItem = prev[index];
      if (!oldItem) return prev;
      // create a new item from the same comment
      const newItem = createFlyingItem(oldItem.originalComment);

      // replace that index in the array
      const newArray = [...prev];
      newArray[index] = newItem;
      return newArray;
    });
  };

  return (
    <div
      className="relative bg-white overflow-hidden"
      style={{ height: 'calc(100vh - 180px)', width: '100%' }}
    >
      {flyingItems.map((item, i) => {
        const { originalComment, uniqueKey, topPercent, fontSize, duration } = item;

        // Combine message + author
        const textWithAuthor = `${originalComment.content || ''} -${
          originalComment.name || 'Anonymous'
        }`;

        return (
          <div
            key={uniqueKey}
            className="danmaku-item"
            style={{
              top: `${topPercent}vh`,
              fontSize: fontSize,
              animation: `danmakuScroll ${duration}s linear forwards`
            }}
            onAnimationEnd={() => handleAnimationEnd(i)}
          >
            <ReactMarkdown>{textWithAuthor}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

export default RandomMode;
