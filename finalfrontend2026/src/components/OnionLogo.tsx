interface OnionLogoProps {
  size?: number;
  className?: string;
}

export default function OnionLogo({ size = 56, className = '' }: OnionLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer onion bulb */}
      <ellipse cx="28" cy="36" rx="18" ry="15" fill="#E8F5EE" stroke="#1B6B3A" strokeWidth="2.2" />
      {/* Inner layer 1 */}
      <ellipse cx="28" cy="36" rx="13" ry="10.5" fill="none" stroke="#1B6B3A" strokeWidth="1.4" strokeOpacity="0.45" />
      {/* Inner layer 2 */}
      <ellipse cx="28" cy="36" rx="8" ry="6.5" fill="none" stroke="#1B6B3A" strokeWidth="1" strokeOpacity="0.3" />
      {/* Center AI dot */}
      <circle cx="28" cy="36" r="3.5" fill="#E8650A" />
      {/* Circuit lines */}
      <line x1="31.5" y1="36" x2="37" y2="36" stroke="#E8650A" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="37" y1="33" x2="37" y2="39" stroke="#E8650A" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="24.5" y1="36" x2="19" y2="36" stroke="#E8650A" strokeWidth="1.2" strokeOpacity="0.7" />
      <circle cx="19" cy="36" r="1.2" fill="#E8650A" strokeOpacity="0.7" />
      <circle cx="37" cy="36" r="1.2" fill="#E8650A" strokeOpacity="0.7" />
      {/* Roots */}
      <line x1="22" y1="50.5" x2="21" y2="54" stroke="#1B6B3A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="25.5" y1="51" x2="25" y2="54" stroke="#1B6B3A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="28" y1="51" x2="28" y2="54" stroke="#1B6B3A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="30.5" y1="51" x2="31" y2="54" stroke="#1B6B3A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="34" y1="50.5" x2="35" y2="54" stroke="#1B6B3A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Stem */}
      <path d="M28 21 Q26 14 23 9" stroke="#1B6B3A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M28 21 Q30 14 33 9" stroke="#1B6B3A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Leaf */}
      <path d="M23 9 Q19 6 20 2 Q24 4 23 9Z" fill="#1B6B3A" fillOpacity="0.8" />
      <path d="M33 9 Q37 6 36 2 Q32 4 33 9Z" fill="#1B6B3A" fillOpacity="0.8" />
    </svg>
  );
}
