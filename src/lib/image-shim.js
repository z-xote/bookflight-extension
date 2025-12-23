// Shim for Next.js Image component in extension
import React from 'react';

export default function Image({ src, alt, width, height, className, ...props }) {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    className,
    ...props
  });
}