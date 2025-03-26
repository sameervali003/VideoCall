// agoraconfig.js
import { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Initialize Agora client
export const useClient = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);
  }, []);

  return client;
};

// Track hooks
export const useMicrophoneAndCameraTracks = () => {
  const [microphoneTrack, setMicrophoneTrack] = useState(null);
  const [cameraTrack, setCameraTrack] = useState(null);

  useEffect(() => {
    const getTracks = async () => {
      try {
        const [microphone, camera] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);
        setMicrophoneTrack(microphone);
        setCameraTrack(camera);
      } catch (error) {
        console.error('Failed to create tracks', error);
      }
    };

    getTracks();
    return () => {
      microphoneTrack?.close();
      cameraTrack?.close();
    };
  }, []);

  return {
    ready: microphoneTrack !== null && cameraTrack !== null,
    tracks: [microphoneTrack, cameraTrack],
  };
};
