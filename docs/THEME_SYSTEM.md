# Theme System Documentation

## Overview

The Vitaway Employee Portal now includes a complete dark/light theme system with persistent theme preferences.

## Features

✅ **Light & Dark Modes** - Toggle between light and dark themes
✅ **Persistent Storage** - Theme preference saved in localStorage
✅ **System Preference Detection** - Automatically detects user's OS theme preference on first visit
✅ **Smooth Transitions** - Seamless theme switching without page reload
✅ **Comprehensive Coverage** - All components styled for both themes

## Usage

### Theme Toggle

Users can switch between light and dark themes using the Sun/Moon icon button in the header (top-right corner).

### For Developers

#### Using the Theme Hook

```tsx
import { useTheme } from '@/lib/theme/theme-context';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
}
```

#### Adding Dark Mode to New Components

Use Tailwind's `dark:` modifier for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="border-b border-gray-200 dark:border-gray-700">
    Hello World
  </h1>
</div>
```

## Implementation Details

### Files Added/Modified

**New Files:**
- `lib/theme/theme-context.tsx` - Theme provider and hook
- `tailwind.config.ts` - Tailwind configuration with class-based dark mode

**Modified Files:**
- `app/layout.tsx` - Added ThemeProvider wrapper
- `app/globals.css` - Updated CSS variables for dark mode
- `components/layout/header.tsx` - Added theme toggle button
- `components/layout/sidebar.tsx` - Dark mode styles
- `components/layout/dashboard-layout.tsx` - Dark mode background
- `components/ui/card.tsx` - Dark mode card styles
- `components/ui/button.tsx` - Dark mode button variants
- `components/ui/badge.tsx` - Dark mode badge variants
- `app/auth/layout.tsx` - Dark mode auth layout
- `app/auth/login/page.tsx` - Dark mode login form

### Theme Storage

Theme preference is stored in localStorage with the key `vitaway_theme` and can be either:
- `'light'` - Light theme
- `'dark'` - Dark theme

### Default Behavior

1. On first visit, checks for saved preference in localStorage
2. If no saved preference, checks system preference (`prefers-color-scheme`)
3. Falls back to `'light'` if neither is available
4. Theme choice is automatically saved when changed

## Color Palette

### Light Mode
- Background: White (#FFFFFF)
- Surface: Gray-50
- Text: Gray-900
- Borders: Gray-200

### Dark Mode
- Background: Gray-950
- Surface: Gray-900/800
- Text: White/Gray-100
- Borders: Gray-700

### Accent Colors
- Primary: Blue-600 (both modes)
- Success: Green-600 (light) / Green-400 (dark)
- Warning: Yellow-600 (light) / Yellow-400 (dark)
- Error: Red-600 (light) / Red-400 (dark)

## Best Practices

1. **Always test both themes** when creating new components
2. **Use semantic color names** (e.g., `text-gray-900 dark:text-white` not `text-black dark:text-white`)
3. **Consider accessibility** - Ensure sufficient contrast in both themes
4. **Avoid inline styles** - Use Tailwind classes for consistency
5. **Check hover states** - Verify hover effects work well in both themes

## Browser Support

The theme system uses:
- CSS classes for theme switching (widely supported)
- localStorage (all modern browsers)
- CSS custom properties (all modern browsers)

Compatible with all current browsers including Chrome, Firefox, Safari, and Edge.
