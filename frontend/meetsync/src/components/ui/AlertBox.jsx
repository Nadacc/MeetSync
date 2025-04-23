import { X } from "lucide-react"; 

const AlertBox = ({ message, type = "error", onClose }) => {
  const baseStyle = "rounded-lg px-4 py-3 flex items-center justify-between";
  const typeStyles = {
    error: "bg-red-100 text-red-700 border border-red-300",
    success: "bg-green-100 text-green-700 border border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    info: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4">
          <X size={18} className="hover:text-black cursor-pointer" />
        </button>
      )}
    </div>
  );
};


export default AlertBox;
