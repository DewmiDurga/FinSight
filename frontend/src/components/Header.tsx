import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { PageView } from '../types';

interface HeaderProps {
  activePage: PageView;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRange: string;
  setSelectedRange: (range: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenMobileMenu,
  onOpenAddModal,
  searchQuery,
  setSearchQuery,
  selectedRange,
  setSelectedRange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return { title: 'Financial Command Center', subtitle: 'Real-time overview of your wealth, cashflow & budgets' };
      case 'transactions':
        return { title: 'Transaction Ledger', subtitle: 'Track, categorize and reconcile your financial movements' };
      case 'budgets':
        return { title: 'Budget Allocation', subtitle: 'Targeted spending limits and category health metrics' };
      case 'goals':
        return { title: 'Wealth & Savings Goals', subtitle: 'Milestones, reserves, and target projections' };
      case 'analytics':
        return { title: 'Financial Intelligence', subtitle: 'Deep dive cash flow trends, burn rate & merchant analysis' };
      case 'assistant':
        return { title: 'FinSight AI Advisor', subtitle: 'Conversational agent powered by real financial analytics' };
      default:
        return { title: 'FinSight', subtitle: 'Intelligent Financial Hub' };
    }
  };

  const { title, subtitle } = getPageTitle();

  const notifications = [
    {
      id: '1',
      title: 'Shopping Budget Alert',
      desc: 'You reached 105% of your $450 shopping budget for September.',
      type: 'warning',
      time: '2h ago'
    },
    {
      id: '2',
      title: 'Goal Progress',
      desc: 'Emergency Fund hit 82% milestone! $3,550 to go.',
      type: 'success',
      time: 'Yesterday'
    },
    {
      id: '3',
      title: 'Subscription Renews Soon',
      desc: 'Netflix Premium 4K ($22.99) will renew on Sep 18.',
      type: 'info',
      time: '2d ago'
    }
  ];

  return (
    <header
      style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(11, 16, 24, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        gap: '20px'
      }}
    >
      {/* Title & Mobile trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenMobileMenu}
          className="header-mobile-toggle"
          aria-label="Toggle menu"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            minWidth: '220px',
            maxWidth: '300px'
          }}
          className="header-search-box"
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search transactions, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 36px 8px 36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')}
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.6875rem',
              color: 'var(--text-dim)',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 5px',
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Date Filter selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px'
          }}
          className="header-date-filter"
        >
          <Calendar size={14} color="var(--text-muted)" />
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="this_month" style={{ background: '#0f1724', color: '#fff' }}>September 2026</option>
            <option value="last_month" style={{ background: '#0f1724', color: '#fff' }}>August 2026</option>
            <option value="30d" style={{ background: '#0f1724', color: '#fff' }}>Last 30 Days</option>
            <option value="ytd" style={{ background: '#0f1724', color: '#fff' }}>Year to Date</option>
            <option value="all" style={{ background: '#0f1724', color: '#fff' }}>All Time</option>
          </select>
        </div>

        {/* Currency Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '0.8125rem',
            fontWeight: 700
          }}
          title="Active currency: USD ($)"
        >
          <DollarSign size={14} strokeWidth={2.5} />
          <span>USD</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f43f5e',
                boxShadow: '0 0 8px #f43f5e'
              }}
            />
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                background: '#0d1522',
                border: '1px solid var(--glass-border-hover)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Notifications (3)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}
                  >
                    {n.type === 'warning' ? (
                      <AlertTriangle size={16} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {n.desc}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action: + New Transaction */}
        <button
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
