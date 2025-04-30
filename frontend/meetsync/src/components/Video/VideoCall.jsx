import { 
  SpeakerLayout,
  StreamTheme,
  useParticipantViewContext,
  CallControls
} from "@stream-io/video-react-sdk";


const CustomParticipantViewUI = () => {
  const { participant } = useParticipantViewContext();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full h-full">
        
      </div>
      <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded absolute bottom-2 left-2">
        {participant.name || participant.id}
      </div>
    </div>
  );
};

const VideoCall = ({ onLeaveCall }) => {
  return (
    <StreamTheme>
      <SpeakerLayout
        ParticipantViewUI={CustomParticipantViewUI}
      />
      <CallControls onLeave={onLeaveCall} />
    </StreamTheme>
  );
};

export default VideoCall;