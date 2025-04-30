import React, { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useSelector, useDispatch } from "react-redux";
import { setClientInitialized } from "../../features/streamSlice";
import axiosInstance from "../../api/axiosInstance";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

let streamClient = null;

export const getStreamClient = () => streamClient;

export const StreamClientProvider = ({ children }) => {
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout;
  
    const initializeStreamClient = async () => {
      if (!isAuthenticated || !user) return;
  
      try {
        setError(null);
        console.log("Initializing Stream client...");
  
        loadingTimeout = setTimeout(() => {
          if (isMounted) setClientReady(false);  
        }, 300); 
  
        const response = await axiosInstance.post("/stream/token", { userId: user._id });
        const token = response.data.token;
  
        if (!token) {
          throw new Error("Failed to fetch Stream token");
        }
  
        streamClient = new StreamVideoClient({ apiKey });
  
        await streamClient.connectUser(
          {
            id: user._id,
            name: user.name || user.email,
            image: user.profilePic,
          },
          token
        );
  
        if (isMounted) {
          clearTimeout(loadingTimeout);
          dispatch(setClientInitialized(true));
          setClientReady(true);
          console.log("Stream client initialized and connected");
        }
      } catch (err) {
        console.error("Error initializing Stream client:", err);
        if (isMounted) {
          clearTimeout(loadingTimeout);
          setError(err.message || "Failed to initialize video service");
        }
      }
    };
  
    initializeStreamClient();
  
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      // if (streamClient) {
      //   streamClient.disconnectUser().catch(console.error);
      //   streamClient = null;
      //   dispatch(setClientInitialized(false));
      // }
    };
  }, [isAuthenticated, user, dispatch]);
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  // if (!clientReady && isAuthenticated) {
  //   return <div>Initializing video service...</div>;
  // }

  if (!isAuthenticated) {
    return children;
  }

  return <StreamVideo client={streamClient}>{children}</StreamVideo>;
};
