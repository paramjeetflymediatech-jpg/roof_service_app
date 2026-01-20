export default function Logo({ className = "w-10 h-10" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Roof shape */}
            <path
                d="M50 10 L90 45 L85 45 L85 85 L15 85 L15 45 L10 45 Z"
                fill="#0ea5e9"
                stroke="#0c4a6e"
                strokeWidth="2"
            />
            {/* Roof ridge */}
            <path
                d="M50 10 L90 45 L10 45 Z"
                fill="#f97316"
                stroke="#7c2d12"
                strokeWidth="2"
            />
            {/* Window */}
            <rect x="35" y="55" width="12" height="15" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="53" y="55" width="12" height="15" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* Door */}
            <rect x="42" y="70" width="16" height="15" fill="#7c2d12" stroke="#451a03" strokeWidth="1.5" />
            <circle cx="54" cy="77.5" r="1.5" fill="#fbbf24" />
        </svg>
    );
}
