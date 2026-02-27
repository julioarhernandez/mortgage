import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
    const [active, setActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside to close the tooltip (for mobile)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActive(false);
            }
        }

        if (active) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [active]);

    const toggleTooltip = (e: React.MouseEvent) => {
        // Prevent event from bubbling up if we are clicking on mobile
        e.stopPropagation();
        setActive(!active);
    };

    const handleMouseEnter = () => {
        // Only use hover on devices that support it
        if (window.matchMedia('(hover: hover)').matches) {
            setActive(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            setActive(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`tooltip-container ${active ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleTooltip}
        >
            {children}
            <div className="tooltip-box">
                {content}
            </div>
        </div>
    );
}
