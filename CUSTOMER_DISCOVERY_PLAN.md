# Customer Discovery Plan: Design-Code Drift Detection

## Mission
Validate that design-code drift is a real, expensive problem that teams will pay $500/month to solve.

---

## Week 1: Find & Interview 20 Teams

### Target Profile
- **Company size:** 20-100 employees
- **Team composition:** 3-5 designers, 10-15 developers
- **Tools:** Must use Figma + (GitHub or GitLab) + (Linear or Jira)
- **Location:** US-based (easier time zones, higher willingness to pay)

### Where to Find Them

**1. Twitter/X (Best source)**
- Search: "design doesn't match code"
- Search: "designers updated figma"
- Search: "implemented wrong design"
- Search: "figma handoff" + filter by designers/developers
- Look for tweets complaining about this problem
- Reply: "I'm researching this exact problem - can I learn about your workflow?"

**2. LinkedIn**
- Search: "Head of Design" at Series A/B startups
- Search: "VP Engineering" at 50-100 person companies
- Message: See script below

**3. Design/Dev Communities**
- Designer News (news.ycombinator.com/designers)
- Hacker News "Who's Hiring" threads
- r/web_design, r/webdev on Reddit
- Indie Hackers (indiehackers.com)
- Post: "Researching design-code drift problems - anyone want to chat?"

**4. Your Network**
- Ask friends/colleagues: "Know anyone who works on product teams with designers + developers?"
- Offer $50 Amazon gift card for 30-minute call

---

## Interview Script (30 minutes)

### Introduction (2 minutes)
"Thanks for taking the time. I'm researching how design and development teams keep implementations in sync with designs. This isn't a sales call - I'm in the research phase and just trying to understand the problem. Can I record this for my notes?"

### Discovery Questions (20 minutes)

**1. Understanding Their Workflow**
- "Walk me through your typical design-to-code process. Designer creates in Figma, then what?"
- "How do developers know which Figma file to build from?"
- "How do developers know if the design changed after they started coding?"

**2. Quantifying the Problem**
- "In the last month, how many times did code get shipped that didn't match the final design?"
- "What happened? [Listen for: had to redo it, designer complained, customer saw wrong version]"
- "How long did it take to fix? Who was involved?"
- "What do you estimate that cost in engineering time? [Help them calculate: hours × hourly rate]"

**3. Current Solutions**
- "How do you currently prevent design-code drift?"
- "Do you use design handoff tools like Zeplin, InVision Inspect, or Figma Dev Mode?"
- "What's missing from those tools?"

**4. Validating Willingness to Pay**
- "If there was a tool that automatically detected when designs changed after coding started and alerted the developer, would that be valuable?"
- "What would that be worth to your team? [$100/month? $500/month? $1000/month?]"
- "Who would make the decision to buy a tool like this? [Head of Design? VP Eng? CTO?]"

**5. Understanding Decision Criteria**
- "What would you need to see in a demo to believe this tool works?"
- "How would you measure if it's working? [Fewer mismatches? Time saved? Fewer rework tickets?]"
- "What integrations are must-haves? [Figma + GitHub? Figma + GitLab? Others?]"

### Closing (5 minutes)
- "If I build a simple version of this, would you be willing to try it for free for 14 days?"
- "Can I follow up with you in 2-3 weeks when I have something to show?"
- "Do you know 2-3 other teams who might have this problem? [Get referrals]"

### Thank You
- "Thank you so much. This has been incredibly helpful. I'll send you a $50 Amazon gift card as a thank you."
- [Actually send the gift card - builds goodwill for future beta testing]

---

## LinkedIn/Email Outreach Script

### Subject Line
"Quick question about design-code workflow"

### Message
Hi [Name],

I saw you're the [Head of Design / VP Engineering] at [Company]. I'm researching a specific problem and would love 20 minutes of your time.

**The problem:** Design files get updated in Figma after developers have started coding, leading to implementations that don't match the final design. Then teams have to go back and fix it.

**My question:** Does this happen at [Company]? If so, I'd love to understand how you currently handle it.

I'm in pure research mode (not selling anything yet) and offering a $50 Amazon gift card for 20 minutes of your time.

Interested? Here's my calendar: [calendly link]

Thanks,
[Your name]

P.S. - If this isn't your area, could you point me to whoever handles design-dev handoff at [Company]?

---

## Success Metrics for Week 1

### Good Signs (Keep Going)
- ✅ 15+ people respond to outreach (75% response rate)
- ✅ 10+ teams say "yes, this happens 3-5+ times per month"
- ✅ 8+ teams say they'd pay $300-500/month to solve it
- ✅ Clear pattern emerges in what they need (e.g., "alert in Slack when Figma changes")
- ✅ Multiple referrals to other teams with same problem

### Warning Signs (Pivot or Stop)
- ❌ Less than 5 people respond (problem isn't painful enough)
- ❌ Teams say "this happens but it's not a big deal"
- ❌ Teams say "we'd pay maybe $50/month"
- ❌ Everyone has different solutions already (Zeplin, InVision, etc. and they're happy)
- ❌ No clear pattern - everyone's problem is completely different

### Red Flags (Stop Immediately)
- 🚫 People say "interesting idea but not a problem for us"
- 🚫 People say "we just use better communication" (means they won't pay)
- 🚫 No one agrees to try a free beta
- 🚫 Zero referrals (means they don't know others with this problem)

---

## Interview Tracking Sheet

Create a spreadsheet with these columns:

| Company | Contact Name | Role | Company Size | Problem Frequency (per month) | Current Solution | Willingness to Pay | Will Beta Test? | Referrals | Notes |
|---------|--------------|------|--------------|------------------------------|------------------|-------------------|----------------|-----------|-------|
| Example Co | Sarah Chen | Head of Design | 45 people | 5-7 times | Manual Slack messages | $500/month | Yes | 2 people | Uses Figma + GitHub + Linear |

**Goal:** Fill 20 rows by end of Week 1

---

## Week 2: Analyze & Decide

### Analysis Questions

**1. Is the problem real?**
- Did 70%+ of teams (14+ out of 20) confirm this happens regularly?
- Did they provide specific examples with real costs?

**2. Is it expensive enough?**
- Did teams estimate $20K+ per year in wasted time/rework?
- Would they pay $300-500/month (5-10% of the cost) to fix it?

**3. Is the solution clear?**
- Did 80%+ of teams describe a similar workflow?
- Do they use the same tools (Figma + GitHub + Linear)?
- Is there a clear trigger for alerts (e.g., "when Figma component properties change")?

**4. Can you reach these customers?**
- Did you get 5+ referrals to other teams?
- Are they concentrated in specific communities (Twitter, Slack groups)?

### Decision Matrix

| Metric | Threshold | Your Result | Pass/Fail |
|--------|-----------|-------------|-----------|
| Response rate | 60%+ | ___ | ___ |
| Confirm problem exists | 70%+ | ___ | ___ |
| Problem frequency | 3+ times/month | ___ | ___ |
| Estimated annual cost | $20K+ | ___ | ___ |
| Willingness to pay | $300+/month | ___ | ___ |
| Will try beta | 50%+ | ___ | ___ |
| Tool consistency | Same 3 tools | ___ | ___ |

**If 6 out of 7 are PASS → Build MVP**
**If 4-5 out of 7 are PASS → Do 10 more interviews**
**If 3 or fewer are PASS → Pivot to different problem**

---

## What to Do With Results

### If Validated (6+ passes)

**Write the MVP spec:**
```
MVP: Design-Code Drift Detector v0.1

Core workflow:
1. User connects Figma + GitHub accounts (OAuth)
2. User creates a "watch" linking specific Figma component to specific GitHub file
3. Synapse takes snapshot of Figma component properties (colors, spacing, fonts, sizes)
4. Every 6 hours, Synapse checks if Figma component changed
5. If changed, send Slack alert: "⚠️ Button component updated: color changed from #FF0000 to #00FF00 in file-name.tsx line 45"
6. Developer clicks link, sees diff, updates code

Integrations needed:
- Figma API (read files, components, properties)
- GitHub API (read files, create links)
- Slack API (send messages)

Properties to track:
- fill (colors)
- padding, margin (spacing)
- fontSize, fontFamily (typography)
- borderRadius (corners)
- width, height (dimensions)

MVP excludes:
- Automatic component detection (manual linking only)
- Visual screenshot comparison (JSON only)
- AI suggestions for fixes
- Multiple alert channels (Slack only)

Time to build: 2-3 weeks
Price: $499/month (or $299 for first 10 customers)
```

### If Not Validated (3 or fewer passes)

**Pivot options:**
1. Try one of the other pain points (Decision Search or Blocker Detection)
2. Go back to interviews and ask: "What IS your biggest workflow pain point?"
3. Focus on a different customer segment (maybe agencies, not product companies?)

---

## Week 3+: Build or Pivot

**If validated → Start building MVP**
**If not validated → Do NOT build, do more discovery**

---

## Resources Needed

**Budget:**
- $1,000 for gift cards (20 people × $50)
- $50 for Calendly subscription
- $0 for outreach (DIY on Twitter/LinkedIn)

**Time:**
- 10 hours for outreach (50 messages, expect 20 responses)
- 10 hours for interviews (20 interviews × 30 min)
- 3 hours for analysis

**Total: 23 hours over 1-2 weeks**

---

## Next Steps

1. [ ] Set up Calendly link
2. [ ] Create interview tracking spreadsheet
3. [ ] Write 50 personalized LinkedIn messages
4. [ ] Search Twitter for people complaining about design-code drift
5. [ ] Schedule first 5 interviews
6. [ ] Conduct interviews
7. [ ] Analyze results
8. [ ] Make build/pivot decision

**Start with Step 1 TODAY. Don't wait.**

---

## Questions to Ask Yourself After Week 1

- Did I talk to at least 15 people? (If no, keep recruiting)
- Did I hear the same problem repeated? (If no, the problem isn't universal)
- Did people get excited about the solution? (If no, the value prop isn't clear)
- Would I pay $500/month for this if I was them? (If no, don't build it)

**Be brutally honest. Better to discover it's not a real problem NOW than after 3 months of coding.**
