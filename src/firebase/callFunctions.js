import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

// Initiate a call
export const initiateCall = async (callerId, calleeId, channelName) => {
  try {
    const callRef = collection(db, 'calls');
    await addDoc(callRef, {
      callerId,
      calleeId,
      status: 'pending',
      channelName,
      timestamp: Timestamp.now(),
    });
    console.log('Call initiated');
  } catch (error) {
    console.error('Error initiating call:', error);
  }
};

// Listen for incoming calls
export const listenForIncomingCalls = (userId, onCallReceived) => {
  const callRef = collection(db, 'calls');
  const q = query(callRef, where('calleeId', '==', userId), where('status', '==', 'pending'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const callData = doc.data();
      onCallReceived({ id: doc.id, ...callData });
    });
  });
  
  return unsubscribe;
};

// Accept call and notify the caller
export const acceptCall = async (callId) => {
  try {
    const callDoc = doc(db, 'calls', callId);
    await updateDoc(callDoc, { status: 'accepted' });
    console.log('Call accepted');
  } catch (error) {
    console.error('Error accepting call:', error);
  }
};

// Decline call and remove it from the collection or set to 'declined'
export const declineCall = async (callId) => {
  try {
    const callDoc = doc(db, 'calls', callId);
    await updateDoc(callDoc, { status: 'declined' });
    console.log('Call declined');
  } catch (error) {
    console.error('Error declining call:', error);
  }
};

// End a call
export const endCall = async (callId) => {
  try {
    const callDoc = doc(db, 'calls', callId);
    await updateDoc(callDoc, {
      status: 'ended',
    });
    console.log('Call ended');
  } catch (error) {
    console.error('Error ending call:', error);
  }
};
