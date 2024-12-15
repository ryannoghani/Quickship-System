import React from "react";
import "./LogPanel.css";

export default function LogPanel(log) {
  return <textarea value={log} readOnly rows="4" cols="50" />;
}
