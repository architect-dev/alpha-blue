import React from "react";
import Spline from '@splinetool/react-spline/next';

const Hero = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Spline
        scene="https://prod.spline.design/4qC5bmGdtb9aXyJg/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Hero;
