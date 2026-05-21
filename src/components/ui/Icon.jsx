// src/components/ui/Icon.jsx — 20×20 viewBox, line-art editorial
const ICONS = {
  home:          'M3 10.5L10 4l7 6.5V17a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1v-6.5z',
  rows:          'M3 5h14M3 10h14M3 15h14',
  calendar:      'M4 6h12v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM4 6V4.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5V6M7 3v3M13 3v3',
  chart:         'M3 16V8m5 8V4m5 12v-6m5 6V11',
  plus:          'M10 4v12M4 10h12',
  arrow_down:    'M10 4v12M5 11l5 5 5-5',
  arrow_up:      'M10 16V4M5 9l5-5 5 5',
  chevron_right: 'M7 4l6 6-6 6',
  chevron_down:  'M4 7l6 6 6-6',
  search:        'M14 14L9 9m1.5-2.5a4 4 0 11-8 0 4 4 0 018 0z',
  settings:      'M10 2v3M10 15v3M2 10h3M15 10h3M4.5 4.5l.7.7M14.8 14.8l.7.7M4.5 15.5l.7-.7M14.8 5.2l.7-.7M10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  edit:          'M3 17h4L17 7l-4-4L3 13v4z',
  trash:         'M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11',
  sparkle:       'M10 2v4M10 14v4M2 10h4M14 10h4M5 5l2.5 2.5M12.5 12.5L15 15M5 15l2.5-2.5M12.5 7.5L15 5',
  wallet:        'M3 6a2 2 0 012-2h11v3H5a1 1 0 000 2h11v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM13 11h2',
  leaf:          'M3 17c0-7 4-12 14-13-1 10-6 14-13 14M3 17l8-8',
  download:      'M10 3v10m-4-4l4 4 4-4M3 16h14',
  bell:          'M5 9a5 5 0 0110 0v3l1.5 2H3.5L5 12V9zM8 17a2 2 0 004 0',
  coin:          'M10 18a8 8 0 100-16 8 8 0 000 16zM7 8h5a1.5 1.5 0 010 3H8a1.5 1.5 0 000 3h5',
};

export function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.5, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      <path d={ICONS[name] ?? ''} />
    </svg>
  );
}
