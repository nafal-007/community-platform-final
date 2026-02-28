import React from 'react';

export interface LogoProps {
    className?: string;
    iconSize?: string;
    textSize?: string;
    dark?: boolean;
}

export function Logo({
    className = "",
    iconSize = "w-8 h-8",
    textSize = "text-2xl",
    dark = true
}: LogoProps) {
    const fillColor = dark ? "#FFFFFF" : "#101113";

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                viewBox="-50 -50 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${iconSize} text-brand-500 flex-shrink-0`}
            >
                <g stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path id="segment" d="M -20 -24 L -20 6 Q -20 20 -8 13 L 10 2.6" fill="none" />
                    <use href="#segment" transform="rotate(120)" />
                    <use href="#segment" transform="rotate(240)" />
                </g>
            </svg>
            <span
                className={`font-black tracking-tighter ${textSize} select-none leading-none`}
                style={{ color: fillColor, letterSpacing: '-0.05em', marginBottom: '-0.1em' }}
            >
                us
            </span>
        </div>
    );
}
