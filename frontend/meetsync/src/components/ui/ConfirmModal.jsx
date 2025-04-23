import Button from "./Button";

const ConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0  bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Cancel Meeting?</h2>
        <p className="mb-6 text-sm text-gray-600">Are you sure you want to cancel this meeting?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>No</Button>
          <Button variant="destructive" onClick={onConfirm}>Yes, Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
