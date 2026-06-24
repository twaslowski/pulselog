import { ClipLoader } from "react-spinners";
import React from "react";

export default function LoadingAnimation() {
  return (
    <div className="flex h-full items-center justify-center">
      <ClipLoader loading={true} color="currentColor" />
      <span className={`ml-3`}>Loading</span>
    </div>
  );
}
