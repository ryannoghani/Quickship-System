import React from "react";
import "./StepControlBar.css";

export default function StepControlBar({
  stepDescription,
  onDone,
  onPrev,
  onNext,
}) {
  return (
    <div className="StepControlBar">
      <span>From: {stepDescription}</span>
      <button onClick={onDone}>Done</button>
      <button onClick={onPrev}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
}
