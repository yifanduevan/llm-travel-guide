import { NAV_ITEMS, ViewName } from "../types";

type TabNavigationProps = {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
};

export default function TabNavigation({
  currentView,
  onViewChange,
}: TabNavigationProps) {
  return (
    <div className="mb-6 overflow-x-auto border-b border-slate-200">
      <div className="flex gap-8 whitespace-nowrap px-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`pb-3 text-sm font-semibold transition-colors ${
              currentView === item.id
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
