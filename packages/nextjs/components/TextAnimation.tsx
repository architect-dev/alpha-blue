import React from "react";
import Spline from '@splinetool/react-spline';

const TextAnimation = () => {
  return (
    <div className="relative w-full h-full">
      <Spline
      scene="https://prod.spline.design/4qC5bmGdtb9aXyJg/scene.splinecode" 
      style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default TextAnimation;
