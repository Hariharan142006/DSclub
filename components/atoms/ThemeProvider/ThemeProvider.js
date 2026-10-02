"use client";

export function ThemeProvider({ children }) {
  return <div data-theme="dark">{children}</div>;
}
