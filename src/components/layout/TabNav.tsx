import type { TabId } from '../../types/numerical';

interface TabOption {
  id: TabId;
  label: string;
}

interface TabNavProps {
  tabs: TabOption[];
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const TabNav = ({ tabs, activeTab, onChange }: TabNavProps) => {
  return (
    <nav className="sticky top-0 z-20 bg-primary text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isActive ? 'bg-accent font-semibold text-slate-900' : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
