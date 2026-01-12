# Sprint 1: Icon Audit & Requirements

## Current Icon Usage Analysis

### Icons Currently Used (Emojis)

Based on audit of `/src/components/newAgile/` components:

#### Task Status Icons (TasksManagement.tsx)
- 📋 `backlog` - Clipboard for future ideas
- 📝 `todo` - Note for tasks to do
- 🚀 `ready` - Rocket for ready to launch
- ⚡ `in_progress` - Lightning bolt for active work
- 👁️ `review` - Eye for under review
- ✅ `done` - Checkmark for completed
- 🎉 `released` - Party for shipped features
- 📊 `measuring` - Chart for metrics tracking
- ❌ `blocked` - X mark for blockers
- 🚫 `cancelled` - Prohibited for cancelled tasks

#### Document Type Icons (ProjectDocuments.tsx)
- ✅ `dod` - Definition of Done
- 🚀 `dor` - Definition of Ready
- 📋 `requirements` - Requirements docs
- 🏗️ `architecture` - Architecture design
- 🧪 `testing` - Test documentation
- 🚀 `deployment` - Deployment guides
- 📄 `default` - Generic document

#### User Personas Icons (UserPersonas.tsx)
- 👥 `users` - Multiple people
- 🎯 `target` - Target audience/objectives

#### Common UI Icons (Found in other components)
- ➜ Arrow right (navigation)
- 💡 Light bulb (ideas/opportunities)
- 🔬 Microscope (experiments)
- 🔍 Magnifying glass (search/discovery)
- 📈 Growth chart (metrics/progress)

---

## Required SVG Icons - Priority List

### Priority 1: Core Workflow Icons (MUST HAVE)
1. **clipboard.svg** - Backlog/Requirements
2. **note.svg** - To Do items
3. **rocket.svg** - Ready/Deployment
4. **lightning.svg** - In Progress
5. **eye.svg** - Review
6. **check-circle.svg** - Done/Completed
7. **party.svg** - Released/Celebration
8. **chart-bar.svg** - Measuring/Analytics
9. **x-circle.svg** - Blocked
10. **ban.svg** - Cancelled

### Priority 2: Document Icons (SHOULD HAVE)
11. **document.svg** - Generic document
12. **building.svg** - Architecture
13. **flask.svg** - Testing/Experiments
14. **target.svg** - Objectives/Goals

### Priority 3: Navigation & Actions (NICE TO HAVE)
15. **users.svg** - Team/Personas
16. **light-bulb.svg** - Ideas/Opportunities
17. **magnifying-glass.svg** - Search/Discovery
18. **arrow-right.svg** - Navigation
19. **chart-line.svg** - Growth/Progress
20. **plus.svg** - Add new item
21. **trash.svg** - Delete
22. **edit.svg** - Edit/Modify
23. **settings.svg** - Configuration
24. **menu.svg** - Menu/Options

---

## Design Requirements

### Style Guidelines
- **Clean, minimal design** - Match glass morphism aesthetic
- **24x24px viewBox** - Standard size (0 0 24 24)
- **2px stroke width** - Consistent line weight
- **Rounded corners** - Use stroke-linecap="round" stroke-linejoin="round"
- **Use currentColor** - Allow CSS color styling
- **No fills** - Outline style only (except for special cases)

### Technical Requirements
- **SVG format** - Optimized, no unnecessary attributes
- **Remove width/height** - Let CSS control sizing
- **Preserve viewBox** - Essential for scaling
- **Accessible** - Include title element for screen readers

### Example Template
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <title>Icon Name</title>
  <!-- icon paths here -->
</svg>
```

---

## Implementation Strategy

### Phase 1: Create Essential Icons (Priority 1)
1. Generate or source 10 core workflow SVG icons
2. Save to `/src/assets/icons/`
3. Test import in one component

### Phase 2: Replace Emoji Icons
1. Update TasksManagement.tsx
2. Update ProjectDocuments.tsx
3. Update UserPersonas.tsx
4. Verify visual consistency

### Phase 3: Add Remaining Icons (Priority 2-3)
1. Create document and navigation icons
2. Test in all components
3. Update Icon component if needed

### Phase 4: Testing & Documentation
1. Visual regression check
2. Accessibility testing
3. Update component documentation
4. Create icon usage guide

---

## Next Steps

1. ✅ Icon audit complete
2. 🔲 Create or source SVG icon files
3. 🔲 Add icons to `/src/assets/icons/`
4. 🔲 Create sample usage component
5. 🔲 Replace emojis in components
6. 🔲 Test and verify

---

**Status**: Icon requirements identified
**Updated**: 2026-01-12
**Sprint**: Sprint 1 - Week 1
