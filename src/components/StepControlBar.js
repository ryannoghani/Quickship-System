import React from "react";
import "./StepControlBar.css";

export default function StepControlBar({
  isActive,
  index,
  steps,
  onPrev,
  onNext,
}) {
  let msg = "";
  if (steps.length > 0) {
    msg = "Step " + (index + 1) + ": " + steps[index];
  }

  let nextOrDone = "Next";
  let onNextOrDone = onNext;
  if (index === steps.length - 1) {
    nextOrDone = "Done";
    onNextOrDone = () => {
      alert("Don't forget to save and email the manifest.");
    };
  }

  return (
    <div className="StepControlBar">
      <span>{msg}</span>
      <button onClick={onPrev} disabled={!isActive}>
        Back
      </button>
      <button onClick={onNextOrDone} disabled={!isActive}>
        {nextOrDone}
      </button>
    </div>
  );
}
