// src/components/CallNotification.js
import React, { useEffect, useState } from 'react';
import { acceptCall, declineCall, listenForIncomingCalls } from '../firebase/callFunctions';
import './callnotifications.css'; // Import the CSS file

const CallNotification = ({ userId }) => {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.error('Error: userId is undefined or null');
      return;
    }

    // Listening for incoming calls for the current user
    const unsubscribe = listenForIncomingCalls(userId, (callData) => {
      setIncomingCall(callData);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      await acceptCall(incomingCall.id);
      console.log('Call accepted, proceed to video');
      // Here you might want to redirect or open the video call interface
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall) {
      await declineCall(incomingCall.id);
      setIncomingCall(null);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="call-notification">
      <p>Incoming call from {incomingCall.callerId}</p>
      <button className="accept-button" onClick={handleAcceptCall}>Accept</button>
      <button className="decline-button" onClick={handleDeclineCall}>Decline</button>
    </div>
  );
};

export default CallNotification;
