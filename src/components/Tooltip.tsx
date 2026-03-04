import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
    const [active, setActive] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, arrowLeft: '50%' });
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Calculate position whenever active changes
    useLayoutEffect(() => {
        if (!active || !containerRef.current || !tooltipRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        // Calculate initial centered position
        let left = containerRect.left + (containerRect.width / 2);
        let top = containerRect.top - 12; // 12px gap

        // Edge detection - Horizontal
        const padding = 16;
        const viewportWidth = window.innerWidth;
        const halfWidth = tooltipRect.width / 2;

        let adjustedLeft = left;
        let arrowOffset = 50;

        if (left - halfWidth < padding) {
            // Off left edge
            adjustedLeft = halfWidth + padding;
            // Calculate arrow offset relative to the new adjusted left
            const delta = left - adjustedLeft;
            arrowOffset = 50 + (delta / tooltipRect.width * 100);
        } else if (left + halfWidth > viewportWidth - padding) {
            // Off right edge
            adjustedLeft = viewportWidth - halfWidth - padding;
            const delta = left - adjustedLeft;
            arrowOffset = 50 + (delta / tooltipRect.width * 100);
        }

        setCoords({
            top: top + window.scrollY,
            left: adjustedLeft,
            arrowLeft: `${Math.max(10, Math.min(90, arrowOffset))}%`
        });
    }, [active]);

    // Handle clicks outside to close the tooltip (for mobile)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (active && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActive(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [active]);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActive(!active);
    };

    const handleMouseEnter = () => {
        if (window.matchMedia('(hover: hover)').matches) setActive(true);
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) setActive(false);
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
            {active && createPortal(
                <div
                    ref={tooltipRef}
                    className="tooltip-box portal"
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        transform: 'translateX(-50%) translateY(-100%)',
                        pointerEvents: 'auto',
                        opacity: 1,
                        visibility: 'visible'
                    }}
                >
                    {content}
                    <div className="tooltip-arrow" style={{ left: coords.arrowLeft }} />
                </div>,
                document.body
            )}
        </div>
    );
}
