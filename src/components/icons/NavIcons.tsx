import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
}

// Home icon - House with door
export function HomeIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

// Food icon - Bowl with kibble
export function FoodBowlIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Bowl */}
            <path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" />
            {/* Kibble pieces */}
            <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="16" cy="9" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

// Vaccine icon - Syringe
export function VaccineIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Syringe body */}
            <path d="M18 2l4 4" />
            <path d="M17 7l3-3" />
            <path d="M8 15l-5 5" />
            <path d="M16 8L8 16" />
            <rect x="7" y="7" width="10" height="10" rx="1" transform="rotate(45 12 12)" />
            {/* Syringe markings */}
            <path d="M9 11l1 1" />
            <path d="M11 9l1 1" />
            <path d="M13 7l1 1" />
        </svg>
    );
}

// Growth icon - Trending up chart
export function GrowthIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Axis lines */}
            <path d="M3 20V4" />
            <path d="M3 20h18" />
            {/* Trend line */}
            <path d="M6 16l4-4 4 2 6-8" />
            {/* Arrow head */}
            <polyline points="16 6 20 6 20 10" />
        </svg>
    );
}

// Learn icon - Open book with paw
export function LearnIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Book */}
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            {/* Paw print on right page */}
            <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="18" cy="12" r="0.8" fill="currentColor" stroke="none" />
            <circle cx="14" cy="12" r="0.8" fill="currentColor" stroke="none" />
            <ellipse cx="16" cy="14" rx="1.5" ry="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

// Emergency icon - Alert triangle with heart
export function EmergencyIcon({ size = 24, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Triangle */}
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            {/* Heart/pulse inside */}
            <path d="M12 9v2" />
            <path d="M9 14l1.5 1.5L12 13l1.5 2.5L15 14" />
        </svg>
    );
}

export default {
    HomeIcon,
    FoodBowlIcon,
    VaccineIcon,
    GrowthIcon,
    LearnIcon,
    EmergencyIcon
};
