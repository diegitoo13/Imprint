// src/components/BadAppleASCII.jsx
import React, { useEffect, useRef, useState } from 'react';
import LZString from 'lz-string';

function BadAppleASCII({ isActive, containerRef }) {
  const [frames, setFrames] = useState(null);
  const [asciiText, setAsciiText] = useState('');
  const [startTime, setStartTime] = useState(null);

  const requestRef = useRef(null);
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);
  const asciiContainerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    console.log('BadAppleASCII activated');

    // 1) Fetch & decompress frames
    fetch('/framesData.lz')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text();
      })
      .then((compressedData) => {
        console.log('Fetched framesData.lz successfully');
        const decompressed = LZString.decompressFromBase64(compressedData);
        if (!decompressed) {
          console.error('Failed to decompress framesData.lz');
          setAsciiText('Failed to load animation.');
          return;
        }
        const framesArray = JSON.parse(decompressed);
        console.log(`Decompressed framesData.lz, total frames: ${framesArray.length}`);
        setFrames(framesArray);
      })
      .catch((err) => {
        console.error('Error fetching framesData.lz:', err);
        setAsciiText('Error loading animation.');
      });
  }, [isActive]);

  useEffect(() => {
    if (!frames || !isActive) return;

    console.log('Starting BadAppleASCII animation');
    setStartTime(performance.now());
    requestWakeLock();

    // 2) Start audio
    if (audioRef.current) {
      audioRef.current.load();
      setTimeout(() => {
        audioRef.current
          .play()
          .then(() => {
            console.log('Audio played successfully');
          })
          .catch((err) => {
            console.warn('Audio autoplay blocked:', err);
          });
      }, 200);
    }

    // 3) Adjust size based on containerRef bounding box
    function handleResize() {
      adjustDisplaySize();
    }

    window.addEventListener('resize', handleResize);
    adjustDisplaySize(); // initial

    // 4) Start the ASCII frames loop
    requestRef.current = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      releaseWakeLock();
      setAsciiText('');
      console.log('BadAppleASCII animation stopped');
    };
  }, [frames, isActive]);

  function renderFrame(time) {
    if (!startTime) return;
    const elapsed = time - startTime;
    const fps = 30;
    const frameDuration = 1000 / fps;
    const index = Math.floor(elapsed / frameDuration);

    if (frames && index < frames.length) {
      const currentFrame = frames[index];
      setAsciiText(currentFrame.replace(/\\n/g, '\n'));
      requestRef.current = requestAnimationFrame(renderFrame);
    } else if (frames) {
      // End of animation
      setAsciiText(frames[frames.length - 1].replace(/\\n/g, '\n'));
      releaseWakeLock();
      console.log('BadAppleASCII animation completed');
    }
  }

  function adjustDisplaySize() {
    if (!asciiContainerRef.current || !containerRef?.current) {
      console.warn('Container reference is null. Skipping size adjustment.');
      return;
    }

    // Measure the bounding box of the parent container
    const boundingRect = containerRef.current.getBoundingClientRect();
    const containerWidth = boundingRect.width;
    const containerHeight = boundingRect.height;

    // Keep 4:3 aspect ratio
    const aspectRatio = 4 / 3;
    let displayWidth = containerWidth;
    let displayHeight = containerWidth / aspectRatio;

    if (displayHeight > containerHeight) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    // Scale font based on the container's width
    const fontSize = displayWidth / 62;
    asciiContainerRef.current.style.fontSize = `${fontSize}px`;
    console.log(`Adjusted font size to ${fontSize}px`);
  }

  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
      } catch (err) {
        console.error('WakeLock Error:', err);
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
        console.log('Wake Lock released');
      });
    }
  }

  if (!isActive) return null;

  return (
    <div
      ref={asciiContainerRef}
      className="absolute inset-0 flex items-center justify-center bg-white text-black pointer-events-none overflow-hidden"
      style={{
        zIndex: -1, // Ensure it's behind floating comments
      }}
    >
      <pre className="whitespace-pre-wrap text-center">
        {asciiText}
      </pre>

      <audio ref={audioRef}>
        <source src="/bad_apple.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default BadAppleASCII;
