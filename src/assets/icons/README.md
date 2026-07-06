# Icons Directory

Place your SVG icon files here.

## Usage

### Import as React Component (Recommended)
```typescript
import MyIcon from '@/assets/icons/my-icon.svg?react';

<MyIcon className="w-6 h-6 text-white/70" />
```

### Import as URL
```typescript
import myIconUrl from '@/assets/icons/my-icon.svg';

<img src={myIconUrl} alt="Icon" className="w-6 h-6" />
```

### Import as Raw String
```typescript
import myIconRaw from '@/assets/icons/my-icon.svg?raw';

<div dangerouslySetInnerHTML={{ __html: myIconRaw }} />
```

## Naming Convention

Use kebab-case for icon filenames:
- `plus-circle.svg`
- `user-profile.svg`
- `arrow-right.svg`

## Tips

- Keep icons simple and optimized
- Remove unnecessary SVG attributes (width, height, etc.)
- Use `currentColor` for fill/stroke to allow CSS color control
- Maintain consistent viewBox dimensions (e.g., 0 0 24 24)
