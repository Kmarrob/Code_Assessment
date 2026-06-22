// frontend/src/components/AccessibleNav.tsx
import React from 'react';
import { cn } from '../utils/helpers.js';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface AccessibleNavProps {
  items: NavItem[];
  label?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onItemClick?: (item: NavItem, index: number) => void;
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  items,
  label = 'Navegação principal',
  className,
  orientation = 'horizontal',
  onItemClick,
}) => {
  const id = React.useId();

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1',
        className
      )}
      aria-label={label}
      role="navigation"
    >
      <ul
        className={cn(
          'flex list-none p-0 m-0',
          orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1'
        )}
        role="menubar"
        aria-label={label}
      >
        {items.map((item, index) => (
          <li
            key={index}
            role="none"
            className="list-none"
          >
            <a
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'hover:bg-gray-100 hover:text-gray-900',
                item.active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
              role="menuitem"
              aria-current={item.active ? 'page' : undefined}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick(e);
                }
                if (onItemClick) {
                  e.preventDefault();
                  onItemClick(item, index);
                }
              }}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
