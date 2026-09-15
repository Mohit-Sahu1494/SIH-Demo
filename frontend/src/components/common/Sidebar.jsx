import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Boxes, Zap, Package, CloudSnow, Bell, BarChart3, Wrench, FileText,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Compass, Cpu, Users, Database, Server
} from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); 
  
  // URL se station extract karne ka solid tareeqa (Fallback 'bharati')
  const pathParts = location.pathname.split('/');
  const currentStation = pathParts[1] === 'station' ? pathParts[2] : 'bharati';

  // Dropdown hamesha khula rakhne ke liye default true
  const [openSubmenus, setOpenSubmenus] = useState({ 'Digital Twin': true });

  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'OPERATOR';

  const toggleSubmenu = (name) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Naya dropdown menu structure
  const digitalTwinMenu = {
    name: 'Digital Twin',
    icon: Cpu,
    badge: 'Twin',
    subItems: [
      { name: 'Impact Analysis', to: `/station/${currentStation}/impact-analysis` },
      { name: 'Scenario Simulator', to: `/station/${currentStation}/simulator` },
      { name: 'Resource Forecast', to: `/station/${currentStation}/forecast` },
      { name: 'Dependency Map', to: `/station/${currentStation}/digital-twin` },
    ],
  };

  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { name: 'Overview', to: `/station/${currentStation}/dashboard`, icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      digitalTwinMenu,
      { name: 'Infrastructure', to: `/station/${currentStation}/infrastructure`, icon: Boxes },
      { name: 'Energy Grid', to: `/station/${currentStation}/energy`, icon: Zap },
      { name: 'Logistics', to: `/station/${currentStation}/logistics`, icon: Package },
      { name: 'Environment', to: `/station/${currentStation}/environment`, icon: CloudSnow },
      { name: 'Alerts', to: `/station/${currentStation}/alerts`, icon: Bell },
      { name: 'Analytics', to: `/station/${currentStation}/analytics`, icon: BarChart3 },
      { name: 'Maintenance', to: `/station/${currentStation}/maintenance`, icon: Wrench },
      { name: 'Reports', to: `/station/${currentStation}/reports`, icon: FileText },
      { name: 'Users', to: '/admin/users', icon: Users, badge: 'Admin' },
      { name: 'Data Sources', to: '/admin/data-sources', icon: Database, badge: 'Admin' },
      { name: 'System', to: '/admin/system', icon: Server, badge: 'Admin' },
      { name: 'Settings', to: '/settings', icon: Settings },
    ];
  } else if (role === 'VIEWER') {
    navItems = [
      { name: 'Overview', to: `/station/${currentStation}/dashboard`, icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      digitalTwinMenu,
      { name: 'Environment', to: `/station/${currentStation}/environment`, icon: CloudSnow },
      { name: 'Energy Grid', to: `/station/${currentStation}/energy`, icon: Zap },
      { name: 'Infrastructure', to: `/station/${currentStation}/infrastructure`, icon: Boxes },
      { name: 'Alerts', to: `/station/${currentStation}/alerts`, icon: Bell },
      { name: 'Reports', to: `/station/${currentStation}/reports`, icon: FileText },
    ];
  } else {
    // OPERATOR
    navItems = [
      { name: 'Overview', to: `/station/${currentStation}/dashboard`, icon: LayoutDashboard },
      { name: 'Stations', to: '/stations', icon: Compass },
      digitalTwinMenu,
      { name: 'Infrastructure', to: `/station/${currentStation}/infrastructure`, icon: Boxes },
      { name: 'Energy Grid', to: `/station/${currentStation}/energy`, icon: Zap },
      { name: 'Logistics', to: `/station/${currentStation}/logistics`, icon: Package },
      { name: 'Environment', to: `/station/${currentStation}/environment`, icon: CloudSnow },
      { name: 'Alerts', to: `/station/${currentStation}/alerts`, icon: Bell },
      { name: 'Analytics', to: `/station/${currentStation}/analytics`, icon: BarChart3 },
      { name: 'Maintenance', to: `/station/${currentStation}/maintenance`, icon: Wrench },
      { name: 'Reports', to: `/station/${currentStation}/reports`, icon: FileText },
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
                  {role}
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
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;

            // DROPDOWN RENDER LOGIC
            if (item.subItems) {
              const isExpanded = openSubmenus[item.name];
              const isParentActive = item.subItems.some((sub) => location.pathname === sub.to);

              return (
                <div key={item.name} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false);
                      toggleSubmenu(item.name);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 w-full ${
                      isParentActive 
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs' 
                        : isExpanded && !collapsed
                        ? 'bg-slate-50 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isParentActive ? 'text-sky-700' : 'text-slate-500'}`} />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-sky-100 text-sky-800">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                      </div>
                    )}
                  </button>

                  {!collapsed && isExpanded && (
                    <div className="ml-6 mt-1 flex flex-col space-y-0.5 border-l border-slate-200 pl-2">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.to}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                              isActive
                                ? 'bg-sky-100 text-sky-800 font-semibold shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // NORMAL ITEMS
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;