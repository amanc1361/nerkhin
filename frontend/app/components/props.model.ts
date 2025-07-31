// This file defines interfaces for common prop types,
// replacing the original .js file with TypeScript equivalents.

export interface NavLinkInfo {
  label: string;
  href: string;
  hidden?: boolean; // Optional, assuming it might be boolean
  iconPath?: string; // Optional, assuming it's a string path
  iconAlt?: string; // Optional, assuming it's a string alt text
}

export interface PanelTabInfo {
  label: string;
  href: string;
  order: number;
  pathname: string; // Added based on usage in tab-layout.jsx
}
