import React from "react";
import Button from "./ui/Button";

const SlotSelector = ({ slots, selectedSlot, setSelectedSlot }) => {
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Available Time Slots</h4>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot, idx) => (
          <Button
            key={idx}
            type="button"
            variant={slot === selectedSlot ? "default" : "outline"}
            onClick={() => setSelectedSlot(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SlotSelector;
