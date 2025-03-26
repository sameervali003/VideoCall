import React, { useState, useEffect } from 'react';
import { getDocs, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Chat from './chat'; // Import Chat component

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Store the selected chat ID
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'data'));
        const usersData = querySnapshot.docs.map((doc) => doc.data());
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch users: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = async (otherUserEmail) => {
    const chatId = [storedUser.email, otherUserEmail].sort().join('_');

    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // If chat doesn't exist, create a new one
        await setDoc(chatRef, {
          participants: {
            [storedUser.email]: true,
            [otherUserEmail]: true,
          },
          messages: [], // Initialize with an empty messages array
        });
      }

      setSelectedChat(chatId); // Set the selected chat
    } catch (err) {
      setError(`Failed to handle chat: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar for user list */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
        <h2>Users List</h2>
        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          users
            .filter(u => u.email !== storedUser.email)
            .map((u, index) => (
              <button
                key={index}
                onClick={() => handleUserClick(u.email)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 15px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  backgroundColor: selectedChat === [storedUser.email, u.email].sort().join('_') ? '#f0f0f0' : '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                }}
              >
                <strong>{u.name}</strong>
              </button>
            ))
        )}
      </div>

      {/* Main content for chat */}
      <div style={{ width: '70%', padding: '1rem' }}>
        {selectedChat ? (
          <Chat chatId={selectedChat} /> // Render the Chat component with the selected chatId
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
