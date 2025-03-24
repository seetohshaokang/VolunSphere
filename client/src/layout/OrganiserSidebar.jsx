import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LayoutDashboard, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

const OrganiserSidebar = () => {
  // Change initial state to true for collapsed sidebar
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Define menu items
  const menuItems = [
    {
      path: '/organiser/profile',
      name: 'My Profile',
      icon: <User size={20} />
    },
    {
      path: '/organiser/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      path: '/organiser/event',
      name: 'My Events',
      icon: <Calendar size={20} />
    }
  ];

  // Check if current path matches item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={{
      width: collapsed ? '60px' : '240px',
      height: 'auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '0 10px 10px 0',
      transition: 'all 0.3s ease',
      position: 'fixed',
      top: '80px',
      left: '0',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      margin: '10px 0'
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center'
      }}>
        {!collapsed && <h5 style={{ margin: 0 }}>Organiser Portal</h5>}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '15px 0'
      }}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              textDecoration: 'none',
              color: isActive(item.path) ? '#0d6efd' : '#212529',
              backgroundColor: isActive(item.path) ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid #0d6efd' : '4px solid transparent',
              transition: 'all 0.2s ease',
              marginBottom: '5px'
            }}
          >
            <div style={{ marginRight: collapsed ? '0' : '10px' }}>
              {item.icon}
            </div>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrganiserSidebar;