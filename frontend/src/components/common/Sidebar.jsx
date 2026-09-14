import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Boxes,
  Zap,
  Package,
  CloudSnow,
  Bell,
  BarChart3,
  Wrench,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Users,
  Database,
  Server,
  Layers,
} from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'OPERATOR';

  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { name: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      { name: 'Digital Twin', to: '/digital-twin', icon: Cpu, badge: 'Twin' },
      { name: 'Infrastructure', to: '/infrastructure', icon: Boxes },
      { name: 'Energy Grid', to: '/energy', icon: Zap },
      { name: 'Logistics', to: '/logistics', icon: Package },
      { name: 'Environment', to: '/environment', icon: CloudSnow },
      { name: 'Alerts', to: '/alerts', icon: Bell },
      { name: 'Analytics', to: '/analytics', icon: BarChart3 },
      { name: 'Maintenance', to: '/maintenance', icon: Wrench },
      { name: 'Reports', to: '/reports', icon: FileText },
      { name: 'Users', to: '/admin/users', icon: Users, badge: 'Admin' },
      { name: 'Data Sources', to: '/admin/data-sources', icon: Database, badge: 'Admin' },
      { name: 'System', to: '/admin/system', icon: Server, badge: 'Admin' },
      { name: 'Settings', to: '/settings', icon: Settings },
    ];
  } else if (role === 'VIEWER') {
    navItems = [
      { name: 'Overview', to: '/viewer/dashboard', icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      { name: 'Digital Twin', to: '/digital-twin', icon: Cpu, badge: 'Twin' },
      { name: 'Environment', to: '/environment', icon: CloudSnow },
      { name: 'Energy Grid', to: '/energy', icon: Zap },
      { name: 'Infrastructure', to: '/infrastructure', icon: Boxes },
      { name: 'Alerts', to: '/alerts', icon: Bell },
      { name: 'Reports', to: '/reports', icon: FileText },
    ];
  } else {
    // OPERATOR
    navItems = [
      { name: 'Overview', to: '/operator/dashboard', icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      { name: 'Digital Twin', to: '/digital-twin', icon: Cpu, badge: 'Twin' },
      { name: 'Infrastructure', to: '/infrastructure', icon: Boxes },
      { name: 'Energy Grid', to: '/energy', icon: Zap },
      { name: 'Logistics', to: '/logistics', icon: Package },
      { name: 'Environment', to: '/environment', icon: CloudSnow },
      { name: 'Alerts', to: '/alerts', icon: Bell },
      { name: 'Analytics', to: '/analytics', icon: BarChart3 },
      { name: 'Maintenance', to: '/maintenance', icon: Wrench },
      { name: 'Reports', to: '/reports', icon: FileText },
    ];
  }

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 select-none z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/90">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-heading font-black tracking-tighter shadow-sm">
                PT
              </div>
              <div>
                <span className="font-heading font-bold text-slate-900 tracking-wider text-base block leading-tight">
                  POLAR TWIN
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-sky-600 font-semibold block">
                  {role === 'ADMIN' ? 'System Admin' : role === 'VIEWER' ? 'Station Intel' : 'Mission Ops'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-sky-600 text-white flex items-center justify-center font-heading font-black shadow-sm">
              PT
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-800" />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        item.badge === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-xs">
        {!collapsed ? (
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>NCPOR Digital Twin</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                {role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Larsemann & Schirmacher Hills
            </div>
          </div>
        ) : (
          <div className="w-2 h-2 mx-auto rounded-full bg-emerald-500" />
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
