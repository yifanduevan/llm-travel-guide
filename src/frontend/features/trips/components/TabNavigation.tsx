"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS, ViewName } from "../types";

type TabNavigationProps = {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
};

export default function TabNavigation({
  currentView,
  onViewChange,
}: TabNavigationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tabRefs = useRef<Record<ViewName, HTMLButtonElement | null>>(
    {} as Record<ViewName, HTMLButtonElement | null>
  );

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const activeTab = tabRefs.current[currentView];

    if (!container || !activeTab) return;

    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      left: tabRect.left - containerRect.left + container.scrollLeft,
      width: tabRect.width,
    });
  }, [currentView]);

  useEffect(() => {
    const activeTab = tabRefs.current[currentView];
    activeTab?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    updateIndicator();
  }, [currentView, updateIndicator]);

  useEffect(() => {
    updateIndicator();

    const container = containerRef.current;
    const handleResize = () => {
      updateIndicator();
    };

    const handleScroll = () => {
      updateIndicator();
    };

    window.addEventListener("resize", handleResize);
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateIndicator();
      });
      observer.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [updateIndicator]);

  return (
    <div className="mb-6 border-b border-slate-200">
      <div
        ref={containerRef}
        className="relative flex gap-8 overflow-x-auto px-1"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el; 
              }}
              onClick={() => onViewChange(item.id)}
              type="button"
              className={[
                "relative whitespace-nowrap pb-3 text-sm font-semibold transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-md",
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}

        <span
          className="absolute bottom-0 h-0.5 bg-slate-900 transition-all duration-300 ease-in-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>
    </div>
  );
}
