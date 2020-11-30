import React from "react";

type PreloadProps = {
  images: string[];
};

const preloadStyle = { display: "none" };

const Preload = ({ images }: PreloadProps) => (
  <div style={preloadStyle}>
    {images.map((image, nth) => (
      <img src={image} key={nth} alt="" />
    ))}
  </div>
);

export default Preload;
