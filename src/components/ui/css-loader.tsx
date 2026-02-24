// src/components/ui/css-loader.tsx
"use client"; // Styled-components often need client boundary

import React from 'react';
import styled, { keyframes } from 'styled-components'; // Import keyframes

// Define keyframes using styled-components helper
const spinAnimation = keyframes`
  0% {
    transform: rotate(-45deg);
  }
  50% {
    transform: rotate(-360deg); /* Full rotation halfway */
    border-radius: 50%; /* Become circular */
  }
  100% {
    transform: rotate(-765deg); /* Continue rotating to end back at -45 after 2 full rotations */
    /* Or use: transform: rotate(-45deg); if you only want one rotation per cycle */
  }
`;

// Styled wrapper for centering or positioning if needed
const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; // Needed for the ::before pseudo-element positioning

  .loader {
    width: 3.5em; // Slightly smaller default size
    height: 3.5em;
    position: relative; // Ensure ::before is positioned relative to this
    background: linear-gradient(-45deg, #fc00ff 0%, #00dbde 100% );
    animation: ${spinAnimation} 3s infinite linear; // Use linear for smoother continuous spin
    z-index: 10; // Ensure loader is above its blur
  }

  /* Blur effect using ::before */
  .loader::before {
    content: "";
    z-index: -1; // Position behind the main loader element
    position: absolute;
    // Inset slightly smaller than parent to contain blur
    inset: 2px;
    background: inherit; // Inherit gradient from parent
    border-radius: inherit; // Inherit border-radius changes from animation
    transform: translate3d(0, 0, 0); // Base transform
    filter: blur(15px); // Adjust blur amount
    opacity: 0.7; // Adjust opacity
  }
`;

const CssLoader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
}

export default CssLoader;