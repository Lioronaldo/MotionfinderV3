import * as React from "react";

export const Icons = {
  Plane: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 11.5l8.7-2.5L21 3l-4 9.3-2.5 8.7-2-5.5L3 13.5v-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12.2 15.6l-3 3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
};
