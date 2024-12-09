import React from "react";
import "./StepControlBar.css";

export default function StepControlBar({
  isActive,
  index,
  stepDescription,
  onDone,
  onPrev,
  onNext,
}) {
  let msg = "";
  if (stepDescription !== undefined) {
    msg = "Step " + (index + 1) + ": " + stepDescription;
  }
  return (
    <div className="StepControlBar">
      <span>{msg}</span>
      <button onClick={onDone} disabled={!isActive}>
        Done
      </button>
      <button onClick={onPrev} disabled={!isActive}>
        Back
      </button>
      <button onClick={onNext} disabled={!isActive}>
        Next
      </button>
    </div>
  );
}
