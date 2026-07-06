/// <reference types="vite/client" />

// SVG imports with ?react suffix
declare module '*.svg?react' {
  import * as React from 'react';
  const SVGComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default SVGComponent;
}

// Regular SVG imports (as URL)
declare module '*.svg' {
  const content: string;
  export default content;
}

// Raw SVG imports
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
