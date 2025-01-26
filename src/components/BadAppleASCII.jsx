import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import LZString from 'lz-string';

function BadAppleASCII({ isActive, containerRef }) {
  const [frames, setFrames] = useState([]);
  const asciiPreRef = useRef(null);
  const requestRef = useRef(null);
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);
  const isPlayingRef = useRef(false);
  
  // Load and decompress frames once when the component mounts
  useEffect(() => {
    if (!isActive) return;

    console.log('BadAppleASCII activated');

    const loadFrames = async () => {
      try {
        const res = await fetch('/framesData.lz');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const compressedData = await res.text();
        console.log('Fetched framesData.lz successfully');
        const decompressed = LZString.decompressFromBase64(compressedData);
        if (!decompressed) {
          throw new Error('Failed to decompress framesData.lz');
        }
        const framesArray = JSON.parse(decompressed);
        console.log(`Decompressed framesData.lz, total frames: ${framesArray.length}`);
        setFrames(framesArray);
      } catch (err) {
        console.error('Error loading framesData.lz:', err);
        setFrames([]);
      }
    };

    loadFrames();
  }, [isActive]);

  // Memoize the frames to prevent unnecessary re-parsing
  const memoizedFrames = useMemo(() => frames, [frames]);

  // Handle audio playback and frame synchronization
  useEffect(() => {
    if (!isActive || memoizedFrames.length === 0) return;

    console.log('Starting BadAppleASCII animation');
    requestWakeLock();

    const audio = audioRef.current;
    if (audio) {
      audio.load();
      const playAudio = async () => {
        try {
          await audio.play();
          console.log('Audio played successfully');
          isPlayingRef.current = true;
          requestRef.current = requestAnimationFrame(updateFrame);
        } catch (err) {
          console.warn('Audio autoplay blocked:', err);
          // Fallback: allow user interaction to start audio
          const handleUserGesture = () => {
            audio.play()
              .then(() => {
                console.log('Audio played after user gesture');
                isPlayingRef.current = true;
                requestRef.current = requestAnimationFrame(updateFrame);
                window.removeEventListener('click', handleUserGesture);
              })
              .catch((error) => {
                console.error('Failed to play audio after user gesture:', error);
              });
          };
          window.addEventListener('click', handleUserGesture, { once: true });
        }
      };

      playAudio();
    }

    // Adjust display size initially and on resize
    window.addEventListener('resize', adjustDisplaySize);
    adjustDisplaySize(); // initial

    // Handle tab visibility to pause/resume animation
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(requestRef.current);
      } else if (isPlayingRef.current) {
        requestRef.current = requestAnimationFrame(updateFrame);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', adjustDisplaySize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(requestRef.current);
      releaseWakeLock();
      isPlayingRef.current = false;
      console.log('BadAppleASCII animation stopped');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedFrames, isActive]);

  // Function to update the ASCII frame based on audio's currentTime
  const updateFrame = useCallback(() => {
    if (!isPlayingRef.current || !audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const fps = 30;
    const frameIndex = Math.floor(currentTime * fps);

    if (frameIndex < memoizedFrames.length) {
      const currentFrame = memoizedFrames[frameIndex];
      if (asciiPreRef.current) {
        asciiPreRef.current.textContent = currentFrame.replace(/\\n/g, '\n');
      }
      requestRef.current = requestAnimationFrame(updateFrame);
    } else {
      // End of animation
      if (asciiPreRef.current && memoizedFrames.length > 0) {
        asciiPreRef.current.textContent = memoizedFrames[memoizedFrames.length - 1].replace(/\\n/g, '\n');
      }
      releaseWakeLock();
      console.log('BadAppleASCII animation completed');
      isPlayingRef.current = false;
    }
  }, [memoizedFrames]);

  // Function to adjust the display size based on container dimensions
  const adjustDisplaySize = useCallback(() => {
    if (!asciiPreRef.current || !containerRef?.current) {
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
    const fontSize = Math.max(displayWidth / 62, 8); // Set a minimum font size
    asciiPreRef.current.style.fontSize = `${fontSize}px`;
    console.log(`Adjusted font size to ${fontSize}px`);
  }, [containerRef]);

  // Function to request a wake lock to keep the screen on
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
      } catch (err) {
        console.error('WakeLock Error:', err);
      }
    } else {
      console.warn('Wake Lock API not supported in this browser.');
    }
  }, []);

  // Function to release the wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
        .then(() => {
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        })
        .catch((err) => {
          console.error('Error releasing Wake Lock:', err);
        });
    }
  }, []);

  if (!isActive) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-white text-black pointer-events-none overflow-hidden"
      style={{
        zIndex: -1, // Ensure it's behind floating comments
        whiteSpace: 'pre-wrap',
        textAlign: 'center',
      }}
    >
      {/* The pre element is manipulated directly via ref */}
      <pre ref={asciiPreRef}></pre>

      <audio ref={audioRef}>
        <source src="/bad_apple.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default React.memo(BadAppleASCII);
