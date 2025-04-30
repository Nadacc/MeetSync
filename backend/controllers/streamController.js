import { generateStreamToken } from '../services/streamService.js';
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;


const streamClient = new StreamClient(apiKey, apiSecret);

export const getStreamToken = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const token = generateStreamToken(userId);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};


const callCreationCache = new Map();
const CACHE_TTL = 60000; 

export const createCall = async (req, res) => {
  try {
    const { title, userId, meetingId } = req.body;

    console.log('Received meeting data:', req.body);

    if (!userId || !meetingId) {
      return res.status(400).json({ error: 'Missing userId or meetingId' });
    }

    
    const cacheKey = `${meetingId}:${userId}`;
    const cachedResponse = callCreationCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log('Returning cached call response for:', cacheKey);
      return res.status(200).json(cachedResponse);
    }

   
    const callType = "default"; 
    const call = streamClient.video.call(callType, meetingId);

    
    const response = await call.getOrCreate({
      data: {
        created_by_id: userId,
        custom: {
          title,
        },
      },
    });

    const result = { 
      callId: response.call.id,
      callDetails: response.call
    };

    
    callCreationCache.set(cacheKey, result);
    
    
    setTimeout(() => {
      callCreationCache.delete(cacheKey);
    }, CACHE_TTL);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error creating call:', error);
    
   
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response?.headers?.['retry-after'] || 30
      });
    }
    
    res.status(500).json({ error: 'Failed to create call' });
  }
};

export const joinCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { userId } = req.body;
    
    if (!userId || !callId) {
      return res.status(400).json({ error: 'Missing userId or callId' });
    }
    
    const token = generateStreamToken(userId);
    
    res.status(200).json({ 
      token,
      callId 
    });
  } catch (error) {
    console.error('Error joining call:', error);
    res.status(500).json({ error: 'Failed to join call' });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    
    if (!callId) {
      return res.status(400).json({ error: 'Missing callId' });
    }
    
    const callType = "default";
    const call = streamClient.video.call(callType, callId);

    await call.endCall({ reason: 'Call ended by user' });
    
    res.status(200).json({ message: 'Call ended successfully' });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
};