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

    // 1) Fetch & decompress frames
    fetch('/framesData.lz')
      .then((res) => res.text())
      .then((compressedData) => {
        const decompressed = LZString.decompressFromBase64(compressedData);
        if (!decompressed) {
          console.error('Failed to decompress framesData.lz');
          return;
        }
        const framesArray = JSON.parse(decompressed);
        setFrames(framesArray);
      })
      .catch((err) => console.error('Error fetching framesData.lz:', err));
  }, [isActive]);

  useEffect(() => {
    if (!frames || !isActive) return;

    setStartTime(performance.now());
    requestWakeLock();

    // 2) Start audio
    if (audioRef.current) {
      audioRef.current.load();
      setTimeout(() => {
        audioRef.current
          .play()
          .catch((err) => console.warn('Audio autoplay blocked:', err));
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
    }
  }

  function adjustDisplaySize() {
    if (!asciiContainerRef.current || !containerRef?.current) return;

    // measure the bounding box of the parent container
    const boundingRect = containerRef.current.getBoundingClientRect();
    const containerWidth = boundingRect.width;
    const containerHeight = boundingRect.height;

    // keep 4:3 aspect ratio
    const aspectRatio = 4 / 3;
    let displayWidth = containerWidth;
    let displayHeight = containerWidth / aspectRatio;

    if (displayHeight > containerHeight) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    // scale font based on the container's width
    const fontSize = displayWidth / 62;
    asciiContainerRef.current.style.fontSize = `${fontSize}px`;
  }

  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.error('WakeLock Error:', err);
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  }

  if (!isActive) return null;

  return (
    <div
      ref={asciiContainerRef}
      // "absolute" so it fills the parent container (RandomMode)
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        // If you want a black background behind ASCII, uncomment:
        backgroundColor: 'white',
        color: 'black', // ASCII text color
        overflow: 'hidden'
      }}
    >
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre',
          lineHeight: 1.1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
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
