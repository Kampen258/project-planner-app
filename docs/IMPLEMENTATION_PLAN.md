# ProjectFlow Implementation Plan
*Building New Agile Methodology on Existing App Foundation*

## Phase 1: OKR Foundation (Week 1)

### 1.1 Database Schema Extensions
**Add OKR tables to Supabase:**
```sql
-- Objectives table
CREATE TABLE objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
  year INTEGER NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Results table
CREATE TABLE key_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  baseline DECIMAL,
  target DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link existing projects to objectives
ALTER TABLE projects ADD COLUMN objective_id UUID REFERENCES objectives(id);
```

### 1.2 TypeScript Types
**Add to src/types.ts:**
```typescript
export interface Objective {
  id: string;
  title: string;
  description?: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  owner_id: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  baseline: number;
  target: number;
  current_value: number;
  unit?: string;
  created_at: string;
  updated_at: string;
}
```

### 1.3 OKR Management Components
**Create components:**
- `src/components/okr/OKRManager.tsx`
- `src/components/okr/ObjectiveCard.tsx`
- `src/components/okr/KeyResultItem.tsx`
- `src/components/okr/OKRProgress.tsx`

### 1.4 Integration with Existing Projects
**Enhance ProjectsPage to include OKR linking**

---

## Phase 2: Dual Board Foundation (Week 2)

### 2.1 Board Type System
**Extend project model:**
```sql
-- Add board type to projects
ALTER TABLE projects ADD COLUMN board_type VARCHAR(20) CHECK (board_type IN ('discovery', 'delivery', 'both')) DEFAULT 'both';

-- Create board columns configuration
CREATE TABLE board_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  board_type VARCHAR(20) NOT NULL CHECK (board_type IN ('discovery', 'delivery')),
  column_name TEXT NOT NULL,
  column_order INTEGER NOT NULL,
  wip_limit INTEGER,
  policies JSONB
);
```

### 2.2 Board Components
**Create new board system:**
- `src/components/boards/DualBoardView.tsx`
- `src/components/boards/DiscoveryBoard.tsx`
- `src/components/boards/DeliveryBoard.tsx`
- `src/components/boards/BoardColumn.tsx`
- `src/components/boards/WorkItem.tsx`

### 2.3 Work Item Management
**Abstract work items (tasks + opportunities + hypotheses):**
```typescript
export interface WorkItem {
  id: string;
  title: string;
  type: 'task' | 'opportunity' | 'hypothesis' | 'experiment';
  board_type: 'discovery' | 'delivery';
  column: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}
```

---

## Phase 3: Discovery Track (Weeks 3-4)

### 3.1 Discovery Data Models
```sql
-- Opportunities table
CREATE TABLE opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  evidence_url TEXT,
  impact_estimate TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
  effort_estimate VARCHAR(10) CHECK (effort_estimate IN ('S', 'M', 'L')),
  cost_of_delay VARCHAR(10) CHECK (cost_of_delay IN ('Low', 'Medium', 'High')),
  risk_level VARCHAR(10) CHECK (risk_level IN ('Low', 'Medium', 'High')),
  column_status VARCHAR(20) DEFAULT 'opportunities',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hypotheses table
CREATE TABLE hypotheses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hypothesis_statement TEXT NOT NULL,
  success_criteria JSONB,
  test_method TEXT,
  assumptions JSONB,
  resources_needed JSONB,
  column_status VARCHAR(20) DEFAULT 'hypotheses',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiments table
CREATE TABLE experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hypothesis_id UUID REFERENCES hypotheses(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_test', 'learning', 'completed')),
  results JSONB,
  decision VARCHAR(20) CHECK (decision IN ('scale', 'kill', 'iterate')),
  column_status VARCHAR(20) DEFAULT 'in_test',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights table
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  learning TEXT NOT NULL,
  evidence TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Discovery Components
**Create discovery-specific components:**
- `src/components/discovery/OpportunityCard.tsx`
- `src/components/discovery/HypothesisCard.tsx`
- `src/components/discovery/ExperimentCard.tsx`
- `src/components/discovery/InsightCapture.tsx`
- `src/components/discovery/OpportunityForm.tsx`
- `src/components/discovery/HypothesisForm.tsx`

### 3.3 Templates System
**Create template components:**
- `src/components/templates/OpportunityTemplate.tsx`
- `src/components/templates/HypothesisTemplate.tsx`

---

## Phase 4: Flow Metrics & WIP Limits (Week 5)

### 4.1 Flow Tracking System
```sql
-- Work item flow tracking
CREATE TABLE work_flow_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_item_id UUID NOT NULL,
  work_item_type VARCHAR(20) NOT NULL,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('entered', 'moved', 'blocked', 'completed')),
  from_column VARCHAR(50),
  to_column VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- WIP limits configuration
CREATE TABLE wip_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  board_type VARCHAR(20) NOT NULL,
  column_name VARCHAR(50) NOT NULL,
  limit_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Flow Metrics Components
**Create metrics components:**
- `src/components/metrics/FlowHealthDashboard.tsx`
- `src/components/metrics/CycleTimeChart.tsx`
- `src/components/metrics/ThroughputChart.tsx`
- `src/components/metrics/WIPLimitIndicator.tsx`
- `src/components/metrics/AgingWorkAlert.tsx`

### 4.3 Flow Calculation Engine
**Create services:**
- `src/services/flowMetrics.ts`
- `src/services/wipLimitService.ts`

---

## Phase 5: Decision Log & Advanced Features (Week 6)

### 5.1 Decision Log System
```sql
CREATE TABLE decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  options_considered JSONB,
  rationale TEXT NOT NULL,
  evidence_links JSONB,
  owner_id UUID REFERENCES auth.users(id),
  stakeholders JSONB,
  success_criteria TEXT,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Decision Components
**Create decision management:**
- `src/components/decisions/DecisionLog.tsx`
- `src/components/decisions/DecisionEntry.tsx`
- `src/components/decisions/DecisionForm.tsx`

### 5.3 Enhanced Role Management
**Update user roles:**
```sql
ALTER TABLE profiles ADD COLUMN role VARCHAR(20) CHECK (role IN ('product_lead', 'discovery_owner', 'delivery_owner', 'team_member')) DEFAULT 'team_member';
```

---

## Phase 6: Integration & Polish (Week 7-8)

### 6.1 Advanced Dashboards
**Create comprehensive dashboards:**
- `src/components/dashboards/OutcomeMetricsDashboard.tsx`
- `src/components/dashboards/ExperimentResultsDashboard.tsx`
- `src/components/dashboards/FlowHealthDashboard.tsx`

### 6.2 Automation Features
**Create automation services:**
- `src/services/experimentTimer.ts`
- `src/services/wipEnforcement.ts`
- `src/services/agingWorkAlerts.ts`
- `src/services/measurementReminders.ts`

### 6.3 Enhanced Navigation
**Update navigation to support New Agile workflow:**
- Add OKR management to main nav
- Add dual board toggles
- Add discovery/delivery track indicators

---

## Implementation Priority

### Immediate (This Week):
1. **Copy all documentation** ✅
2. **Create OKR database schema**
3. **Build basic OKR management UI**
4. **Link existing projects to OKRs**

### Next Week:
1. **Create dual board foundation**
2. **Implement work item abstraction**
3. **Basic discovery board structure**

### Following Weeks:
1. **Complete discovery track features**
2. **Add flow metrics and WIP limits**
3. **Implement decision log**
4. **Polish and integration**

---

## Success Criteria

**Phase 1 Complete:** Can create and manage OKRs linked to projects
**Phase 2 Complete:** Can switch between discovery and delivery board views
**Phase 3 Complete:** Can run complete discovery workflow (opportunity → hypothesis → experiment)
**Phase 4 Complete:** Flow metrics calculating and WIP limits enforcing
**Phase 5 Complete:** Decision log functional and role-based access working
**Phase 6 Complete:** Full New Agile methodology operational per user manual