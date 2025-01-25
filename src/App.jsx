import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CommentModal from './components/CommentModal';
import CommentList from './components/CommentList';
import RandomMode from './components/RandomMode';

import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

function App() {
  const [comments, setComments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('random'); // Default mode: random
  const [badAppleActive, setBadAppleActive] = useState(false); // Controls Bad Apple state

  // Real-time Firestore listener for comments
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, []);

  // Add a new comment
  const handleSubmitComment = async (name, content) => {
    try {
      await addDoc(collection(db, 'comments'), {
        name,
        content,
        timestamp: serverTimestamp(),
      });
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Toggle between random and list view
  const toggleMode = () => {
    setViewMode((prev) => (prev === 'random' ? 'list' : 'random'));
  };

  // Trigger Bad Apple Easter Egg
  const handleBadApple = () => {
    console.log('Bad Apple Easter Egg Activated!');
    setBadAppleActive(true);
  };
  

  return (
    <div className="flex flex-col min-h-screen text-black relative">
      <Header
        onNewComment={() => setModalOpen(true)}
        viewMode={viewMode}
        toggleMode={toggleMode}
        onBadApple={handleBadApple} // Pass handler for Easter Egg
      />

      {/* Main Content */}
      {viewMode === 'random' ? (
        <RandomMode comments={comments} badAppleActive={badAppleActive} />
      ) : (
        <CommentList comments={comments} />
      )}

      <Footer />

      {/* Modal for adding a new comment */}
      <CommentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitComment}
      />
    </div>
  );
}

export default App;
