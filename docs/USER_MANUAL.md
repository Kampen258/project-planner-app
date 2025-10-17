# ProjectFlow: New Agile User Manual
*Outcome-Driven, Discovery-Led Project Management*

Version 1.0 | Last Updated: October 2025

---

## 🎯 What Is "New Agile"?

This isn't traditional sprint-based agile. Instead, you'll work from **problems and outcomes**, run **continuous discovery alongside delivery**, and make **small bets** with clear success criteria. Think less ceremony, more learning, faster results.

**Core Philosophy:**
- Outcomes over output (activation rate, not feature count)
- Evidence over opinions (data-driven decisions)
- Flow over ceremony (minimal meetings, maximum progress)
- Small bets over big projects (fail fast, scale wins)

---

## 🏗️ System Overview

### The Two-Track System

**Discovery Track:** Find the right problems to solve
- **Opportunities** (problems worth solving)
- **Hypotheses** (potential solutions)
- **Experiments** (small tests to validate)
- **Insights** (learnings that guide decisions)

**Delivery Track:** Build validated solutions efficiently
- **Phases** (outcome-focused milestones)
- **Tasks** (implementation work)
- **Flow Controls** (WIP limits, quality gates)
- **Measurement** (post-release validation)

### Key Artifacts
- **OKRs** (Objectives & Key Results) - what success looks like
- **Decision Log** - record of key choices with rationale
- **Problem-First Roadmap** - opportunities, not features
- **Flow Metrics** - cycle time, throughput, aging work

---

## 👥 Roles & Responsibilities

### **Product Lead**
- Owns objectives and success metrics
- Maintains problem-first roadmap
- Makes go/no-go decisions on experiments
- Updates decision log

### **Discovery Owner**
- Runs user interviews and tests
- Designs and executes experiments
- Captures insights and learnings
- Links evidence to opportunities

### **Delivery Owner**
- Ensures healthy flow (WIP limits, cycle time)
- Maintains quality standards
- Validates post-release impact
- Manages technical debt

### **Team Members**
- Pull work within WIP limits
- Link all work to evidence/experiments
- Provide feedback on flow health
- Participate in outcome reviews

---

## 🚀 Getting Started (First 2 Weeks)

### Week 1: Foundation Setup

**Day 1-2: Set Your North Star**
1. **Define 1-3 Objectives** (what you want to achieve)
   ```
   Example: "Increase new user activation"
   ```

2. **Add 2-4 Key Results per objective** (how you'll measure success)
   ```
   • Activation rate: 28% → 40%
   • Time to first value: 9min → 6min
   • Step-2 drop-off: 35% → 20%
   ```

3. **Set baseline metrics** (where you are today)

**Day 3-4: Seed Your Opportunity Pipeline**
1. **Add 5-10 problem statements**
   ```
   Format: "Users drop off during onboarding because..."
   Include: Who's affected, evidence, expected impact
   ```

2. **Score opportunities:**
   - Cost of delay (High/Medium/Low)
   - Confidence we can solve it (1-10)
   - Effort estimate (S/M/L)
   - Risk level (Low/Medium/High)

**Day 5: Configure Your Flow**
1. **Set WIP limits** for each column (start conservative)
2. **Add column policies** (Definition of Ready/Done)
3. **Choose your cadence** (weekly discovery sync, monthly outcome review)

### Week 2: First Experiments

**Run 2-3 Small Experiments**
1. Pick your highest-value, lowest-effort opportunities
2. Create hypotheses with clear success criteria
3. Design 1-2 week experiments
4. Start capturing insights

---

## 📋 Daily Workflow

### Working in Discovery

#### Creating an Opportunity
```
Problem: Users abandon onboarding at step 2
Affected Users: 60% of new signups (600 users/month)
Evidence: Analytics + 5 user interviews
Impact: Could recover 40% = 240 users/month
Constraints: Must work on mobile
```

#### Drafting a Hypothesis
```
If we add a progress indicator to onboarding,
then users will complete more steps,
measured by step-2 completion rate,
improving from 65% to 80% within 2 weeks.

Test Method: A/B test with 1000 users
Success Criteria: >75% completion = scale, <70% = kill
```

#### Running an Experiment
1. Move to "In Test" with clear end date
2. Collect data daily in Insights section
3. At end date, move to "Learning"
4. Capture results and next steps

#### Making Decisions
- **Scale:** Create delivery tasks, link to experiment
- **Kill:** Archive with rationale, try different approach
- **Iterate:** Adjust hypothesis, run follow-up test

### Working in Delivery

#### Planning Work
1. **Pull from Ready** (only within WIP limits)
2. **Check Definition of Ready:**
   - Problem and objective clearly linked
   - Acceptance criteria defined
   - Evidence/experiment referenced
   - Dependencies identified

#### Executing Tasks
1. **In Progress:** Keep tasks small (2-3 days max)
2. **Review:** Peer review, quality checks
3. **Released:** Deploy and create measurement task
4. **Measuring:** Validate impact within 14-30 days

---

## 📊 Metrics & Dashboards

### Flow Health Metrics
- **Cycle Time:** How long from start to finish
- **Lead Time:** How long from request to delivery
- **Throughput:** Items completed per week/month
- **Aging WIP:** Items stuck in progress
- **WIP Distribution:** Where work is backing up

### Outcome Metrics
- **OKR Progress:** Current vs target for each key result
- **Experiment Win Rate:** % of experiments that scale
- **Discovery Velocity:** Opportunities validated per month
- **Impact Validation:** % of releases that achieve predicted outcomes

### Key Reports
- **Weekly Flow Health:** WIP, blockers, aging items
- **Monthly Outcome Review:** Progress vs OKRs, experiment results
- **Quarterly Retrospective:** What's working, what to change

---

## 🔄 Operating Rhythms

### Weekly (45 minutes total)

**Discovery Sync (20 min)**
- What did we learn this week?
- Which experiments are ready to decide?
- What should we test next?

**Flow Health Check (15 min)**
- WIP levels and aging items
- Blockers that need swarming
- Adjust limits if needed

**Outcome Spotlight (10 min)**
- Deep dive on one key metric
- What's driving the trend?
- Any course corrections needed?

### Monthly (2 hours)

**Outcome Review (60 min)**
- Progress against all OKRs
- Experiment results and decisions
- Update problem-first roadmap

**Process Hygiene (30 min)**
- Archive completed/killed opportunities
- Update WIP limits based on flow data
- Retire outdated policies

**Planning Next Month (30 min)**
- Prioritize top opportunities
- Resource allocation
- Risk review

### Quarterly (4 hours)

**OKR Refresh**
- Review and update objectives
- Set new key results
- Adjust targets based on learnings

**System Retrospective**
- What's working well?
- What should we change?
- Tool and process improvements

---

## 🛠️ Tool Configuration

### Discovery Board Setup
```
Columns:
Opportunities → Hypotheses → In Test → Learning → Archive

Custom Fields:
- Objective/OKR link
- Problem statement
- Target metric
- Success criteria
- Evidence URL
- Confidence level (1-10)
- Effort estimate (S/M/L)
```

### Delivery Board Setup
```
Columns:
Ready → In Progress → Review → Released → Measuring

WIP Limits:
- Ready: No limit (but prioritized)
- In Progress: 3 items max
- Review: 2 items max
- Released: No limit
- Measuring: Track but don't limit

Policies:
- Definition of Ready/Done at each column
- Must reference supporting experiment
```

### Key Automations
1. **Experiment Timer:** Auto-move from "In Test" to "Learning" at due date
2. **WIP Enforcement:** Block moves when limits exceeded
3. **Measurement Reminder:** Create follow-up task after release
4. **Aging Alerts:** Flag items stuck >7 days

---

## 📝 Templates & Examples

### Opportunity Template
```
Title: [Problem in user language]

Problem Statement:
Users [specific group] experience [specific problem] when [context],
causing [negative outcome].

Evidence:
- Analytics: [specific data]
- User research: [interview insights]
- Support tickets: [common complaints]

Impact If Solved:
- Metric: [current] → [target]
- Users affected: [number/percentage]
- Business impact: [revenue/retention/growth]

Constraints:
- Technical: [platform limitations]
- Resource: [time/people constraints]
- Business: [policy/legal requirements]
```

### Hypothesis Template
```
Title: [Solution approach]

Hypothesis:
If we [change/intervention],
then [target user group] will [desired behavior],
measured by [specific metric],
improving from [baseline] to [target] within [timeframe].

Assumptions:
- [key assumption 1]
- [key assumption 2]
- [key assumption 3]

Test Method:
[A/B test / prototype / concierge / interview / analytics]

Success Criteria:
- Scale if: [metric] reaches [threshold]
- Iterate if: [metric] between [range]
- Kill if: [metric] below [threshold]

Resources Needed:
- Time: [duration]
- People: [roles needed]
- Tools: [any special requirements]
```

### Decision Log Entry
```
Date: [YYYY-MM-DD]
Decision: [What was decided]

Context:
[Why this decision was needed]

Options Considered:
1. [Option 1] - Pros/Cons
2. [Option 2] - Pros/Cons
3. [Option 3] - Pros/Cons

Decision Rationale:
[Why this option was chosen]

Evidence:
- [Link to experiment results]
- [Link to user research]
- [Link to data analysis]

Owner: [Who made the decision]
Stakeholders: [Who was consulted]

Success Criteria:
[How we'll know if this was the right decision]

Review Date: [When to reassess]
```

---

## ⚠️ Common Pitfalls & Solutions

### "We're not seeing results fast enough"
**Problem:** Expecting immediate OKR movement
**Solution:** Track leading indicators (experiments run, insights gained, cycle time improvement)

### "Too many experiments, not enough delivery"
**Problem:** Discovery without execution
**Solution:** Set ratio targets (e.g., 1 experiment per 3 delivery tasks)

### "WIP limits are slowing us down"
**Problem:** Resistance to flow constraints
**Solution:** Measure before/after cycle time to prove efficiency gains

### "Experiments keep failing"
**Problem:** Low win rate discouraging team
**Solution:** Celebrate learning; 20-30% win rate is normal for innovation

### "Lost track of the big picture"
**Problem:** Too focused on small bets
**Solution:** Monthly OKR reviews; quarterly roadmap updates

### "Stakeholders want feature commitments"
**Problem:** Outcome-focused approach vs traditional planning
**Solution:** Educate on leading indicators; show faster value delivery

---

## 📈 Success Metrics

### You're succeeding when:

**Flow Metrics Improve:**
- Cycle time trending down
- Less aging WIP
- Higher throughput
- Fewer blocked items

**Outcome Metrics Move:**
- OKRs progressing toward targets
- Higher experiment win rate
- Faster time-to-value for users
- Post-release validation improving

**Team Behavior Changes:**
- Discussions focus on outcomes, not output
- Decisions backed by evidence
- Faster kill/scale decisions
- Proactive risk identification

**Stakeholder Feedback:**
- "We're delivering value faster"
- "Better visibility into what's working"
- "More confident in our direction"
- "Clearer connection between work and goals"

---

## 🔧 Troubleshooting Guide

### Low Discovery Activity
**Symptoms:** Few opportunities, no experiments running
**Fixes:**
- Schedule dedicated discovery time
- Partner discovery and delivery team members
- Start with desk research and analytics

### Flow Bottlenecks
**Symptoms:** Work piling up in one column
**Fixes:**
- Lower WIP limits upstream
- Add capacity to bottleneck
- Break down large items

### Weak Hypotheses
**Symptoms:** Vague success criteria, unclear test methods
**Fixes:**
- Use hypothesis template religiously
- Pair writing with experienced team member
- Review before moving to testing

### Poor Outcome Connection
**Symptoms:** Tasks not linked to experiments, OKRs not moving
**Fixes:**
- Require evidence links for all delivery work
- Weekly outcome spotlights
- Reject work without clear hypothesis connection

---

## 📚 Additional Resources

### Quick References
- [Hypothesis Writing Cheat Sheet]
- [Experiment Design Checklist]
- [WIP Limit Calculator]
- [OKR Examples Library]

### Deep Dives
- [Advanced Flow Metrics Guide]
- [Discovery Research Methods]
- [Stakeholder Communication Templates]
- [Tool Integration Guides]

### Community
- [Internal Slack Channel: #new-agile]
- [Monthly Practice Community]
- [Quarterly User Conference]

---

*Questions? Reach out to [Product Team] or join our weekly office hours every Friday at 2pm.*