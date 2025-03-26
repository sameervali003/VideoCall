import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, query,where, orderBy, onSnapshot } from 'firebase/firestore';
import { FiVideo, FiPhone } from 'react-icons/fi';
import VideoCall from './vedioCAll'; // Import the VideoCall component

const Chat = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Request permission for notifications
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      }
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!storedUser.email) return;
  
    // Query all chats (this assumes you have a collection of chat IDs named in the format 'useremail1_useremail2')
    const q = query(collection(db, 'chats'));
  
    // Listen to all chats
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((chatDoc) => {
        const chatId = chatDoc.id;
  
        // Check if the current user's email is part of the chatId
        const participants = chatId.split('_');
        if (participants.includes(storedUser.email)) {
          // Listen to the messages in this chat
          const messageQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp')
          );
  
          const unsubscribeMessages = onSnapshot(messageQuery, (messageSnapshot) => {
            const newMessages = messageSnapshot.docs.map((doc) => doc.data());
            setMessages(newMessages);
  
            // Show notification if the last message is from another user
            if (newMessages.length > 0) {
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.sender !== storedUser.email &&
                  'Notification' in window &&
                  Notification.permission === 'granted') {
                new Notification('New Message', {
                  body: lastMessage.text + lastMessage.sender,
                });
              }
            }
          });
  
          // Unsubscribe from the messages listener when the component unmounts
          return () => unsubscribeMessages();
        }
      });
    });
  
    // Clean up the overall chat listener on unmount
    return () => unsubscribe();
  }, [storedUser.email]);
  
  

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return; // Prevent sending empty messages

    // Add a new message to Firestore
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      sender: storedUser.email,
      timestamp: new Date(),
    });
    setNewMessage('');
  };

  // Handler function to end the video call
  const handleEndCall = () => {
    setShowVideoCall(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with call buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h3>Chat with {chatId}</h3>
        <div>
          <button 
            onClick={() => setShowVideoCall(true)} // Show the VideoCall component
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              marginRight: '10px', 
              color: '#25D366' 
            }}
          >
            <FiVideo size={24} />
          </button>
          <button 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#34B7F1' 
            }}
          >
            <FiPhone size={24} />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.sender === storedUser.email ? 'right' : 'left',
              margin: '10px 0',
              backgroundColor: message.sender === storedUser.email ? '#dcf8c6' : '#fff',
              padding: '10px',
              borderRadius: '10px',
              maxWidth: '60%',
              marginLeft: message.sender === storedUser.email ? 'auto' : '0',
            }}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '5px' }}>
          Send
        </button>
      </form>

      {/* Render VideoCall component conditionally */}
      {showVideoCall && <VideoCall channelName="test" onEndCall={handleEndCall} />}
    </div>
  );
};

export default Chat;