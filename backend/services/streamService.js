import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const streamClient = new StreamClient(apiKey, apiSecret);

export const generateStreamToken = (userId) => {
  if (!userId) throw new Error('Missing userId');
  return streamClient.createToken(userId);
};
