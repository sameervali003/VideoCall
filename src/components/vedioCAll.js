import React, { useEffect, useState } from 'react';
import { useClient, useMicrophoneAndCameraTracks } from '../hooks/agoraconfig';
import { initiateCall, endCall } from '../firebase/callFunctions';
import axios from 'axios';
import { FaPhoneSlash } from 'react-icons/fa';

const APP_ID = '5f84a1d3710b4b13a191e9a7e215af09'; // Replace with your Agora App ID

const VideoCall = ({ channelName, callId, onEndCall, callerId, calleeId }) => {
  const [token, setToken] = useState(null);
  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
    if (!channelName) {
      console.error('Channel name is not provided');
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/generate-token', {
          params: { channelName, uid: 0 }, // Use 0 for automatic UID assignment
        });
        setToken(response.data.token);
      } catch (error) {
        console.error('Failed to fetch token', error);
      }
    };

    fetchToken();
  }, [channelName]);

  useEffect(() => {
    if (token && client && ready) {
      const joinChannel = async () => {
        try {
          await client.join(APP_ID, channelName, token, null);
          console.log('Successfully joined channel');

          // Publish local tracks
          if (tracks) {
            await client.publish(tracks);
            console.log('Successfully published tracks');
          }

          // Play local video track
          const localVideo = document.getElementById('local-video');
          if (localVideo && tracks[1]) { // Assuming tracks[1] is the camera track
            tracks[1].play(localVideo);
            console.log('Local video playing');
          }

          // Subscribe to already published users in the channel
          client.remoteUsers.forEach(async (user) => {
            await client.subscribe(user, 'video');
            console.log('Subscribed to remote user', user.uid);

            // Play the remote user's video
            const remoteVideo = document.getElementById('remote-video');
            if (remoteVideo && user.videoTrack) {
              user.videoTrack.play(remoteVideo);
              console.log('Remote video playing for already published user');
            }
          });

          // Listen for any new users who publish their tracks after this point
          client.on('user-published', async (user, mediaType) => {
            console.log('User published', user, mediaType);
            await client.subscribe(user, mediaType);
            console.log('Subscribed to user', user.uid);
            
            if (mediaType === 'video') {
              const remoteVideo = document.getElementById('remote-video');
              if (remoteVideo) {
                console.log('Attempting to play remote video');
                user.videoTrack.play(remoteVideo);
                console.log('Remote video playing');
              } else {
                console.error('Remote video element not found');
              }
            }
          });

          client.on('user-unpublished', (user) => {
            console.log('User unpublished', user);
            // Handle user removal if needed
          });
        } catch (error) {
          console.error('Error joining or publishing', error);
        }
      };

      joinChannel();

      return () => {
        const leaveChannel = async () => {
          try {
            // Stop local tracks
            tracks.forEach(track => {
              if (track) {
                track.stop();
                track.close(); // Close the track if applicable
              }
            });
            // Leave the channel
            await client.leave();
            console.log('Left channel and stopped tracks');
          } catch (error) {
            console.error('Error leaving channel', error);
          }
        };

        leaveChannel();
      };
    }
  }, [token, client, ready, tracks, channelName]);

  const handleEndCall = async () => {
    try {
      await endCall(callId); // Update call status to 'ended'
      tracks.forEach(track => {
        if (track) {
          track.stop();
          track.close();
        }
      });
      await client.leave();
      console.log('Left channel and stopped tracks');
    } catch (error) {
      console.error('Error ending call', error);
    } finally {
      onEndCall();
    }
  };

  useEffect(() => {
    if (callerId && calleeId) {
      initiateCall(callerId, calleeId, channelName); // Notify the recipient of the call
    }
  }, [callerId, calleeId, channelName]);

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <video id="local-video" style={{ flex: 1, background: 'black', width: '100%', height: '100%' }} autoPlay muted></video>
        <video id="remote-video" style={{ flex: 1, background: 'black', width: '100%', height: '100%' }} autoPlay></video>
      </div>
      <button
        onClick={handleEndCall}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'red',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <FaPhoneSlash size={24} />
      </button>
    </div>
  );
};

export default VideoCall;
