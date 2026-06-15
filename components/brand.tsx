export function LeafLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M62 394C92 292 184 236 270 193C350 153 402 102 432 42C442 124 412 205 348 253C308 283 263 302 217 318C274 320 331 306 383 271C355 335 301 376 226 386C153 396 96 398 62 466"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M220 319C286 304 345 266 392 207C382 270 348 318 293 350C242 379 184 393 119 390"
        stroke="currentColor"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VerytisLogo({ className }: { className?: string }) {
  return <LeafLogo className={className} />;
}
