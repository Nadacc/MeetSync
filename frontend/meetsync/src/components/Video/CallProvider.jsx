import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamCall } from '@stream-io/video-react-sdk';
import { useSelector } from 'react-redux';
import { getStreamClient } from './StreamClientProvider';
import VideoCall from './VideoCall';

const CallProvider = () => {
  const { callId } = useParams();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clientInitialized } = useSelector((state) => state.stream || {});
  const navigate = useNavigate();
  const callRef = useRef(null);
  const hasLeftRef = useRef(false); 

  useEffect(() => {
    let isMounted = true;

    const initializeCall = async () => {
      
      if (!clientInitialized || !callId) {
        console.log('Stream client not ready yet.');
        return;
      }
    
      try {
        const videoClient = getStreamClient();
        if (!videoClient) {
          throw new Error('Stream client is not initialized');
        }
    
        const callType = 'default';
        const newCall = videoClient.call(callType, callId);
    
        
        if (callRef.current && !hasLeftRef.current) {
          console.log('Leaving previous call before joining new one');
          await callRef.current.leave();
        }
    
        callRef.current = newCall;
    
        
        console.log('Joining the call...');
        await newCall.join(); 
    
        if (isMounted) {
          setCall(newCall);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error joining call:', error);
        if (isMounted) {
          setError(error.message || 'Failed to join call');
          setLoading(false);
          navigate('/app/dashboard');
        }
      }
    };
    

    initializeCall();

    return () => {
      isMounted = false;
      
      if (callRef.current && !hasLeftRef.current) {
        hasLeftRef.current = true;
        console.log('Leaving call before unmount');
        callRef.current.leave().catch(console.error);
      }
    };
  }, [clientInitialized, callId, navigate]);

  const handleLeaveCall = async () => {
    if (callRef.current && !hasLeftRef.current) {
      hasLeftRef.current = true;
      console.log('Leaving call');
      await callRef.current.leave().catch(console.error);
    }
    navigate('/meeting-ended');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-lg font-semibold">Joining meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!call) {
    return <div className="flex items-center justify-center h-screen">No call found.</div>;
  }

  return (
    <StreamCall call={call}>
      <VideoCall onLeaveCall={handleLeaveCall} />
    </StreamCall>
  );
};

export default CallProvider;
