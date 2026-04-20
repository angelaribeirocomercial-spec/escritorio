---
task: lighting-troubleshooting
responsavel: @joe-mcnally
responsavel_type: agent
atomic_layer: task
Entrada: |
  - Consulte os parametros, entradas e pre-requisitos descritos nesta task.
Saida: |
  - Produza os artefatos, validacoes e resultados esperados descritos nesta task.
Checklist:
  - [ ] Revisar objetivo e pre-requisitos da task
  - [ ] Executar o fluxo principal conforme a documentacao
  - [ ] Registrar os artefatos e validacoes esperadas
---
# Lighting Troubleshooting

> Task ID: mcnally-lighting-troubleshooting
> Agent: Joe McNally (Photography Lighting Expert)
> Version: 1.0.0

## Description

Diagnose and fix common lighting problems in existing photos or current setups. Uses Joe McNally's systematic approach to identify issues with Direction, Quality, and Color, then provides specific corrective actions.

## Prerequisites

- A photo with lighting issues OR description of current problem
- Information about current setup (if known)
- Access to adjust lighting setup (for live troubleshooting)

## Workflow

### Interactive Elicitation

1. **Identify The Problem**
   - Show the problematic image OR describe what's happening
   - What looks wrong to you?
   - What were you trying to achieve?

2. **Gather Setup Information**
   - What lights are you using?
   - What modifiers?
   - Approximate positions?
   - Camera settings?
   - Ambient light conditions?

3. **Understand The Goal**
   - What should the final image look like?
   - Reference images (if available)?
   - Specific concerns to address?

### Steps

1. **Analyze The Image**
   - Examine shadow patterns
   - Check catchlights
   - Evaluate contrast
   - Assess color consistency
   - Note specific problem areas
   - Validation: Problems identified

2. **Diagnose Direction Issues**
   - Shadow direction analysis
   - Catchlight position
   - Form and dimension
   - Common issues: flat light, wrong shadow angle, no modeling
   - Validation: Direction problems catalogued

3. **Diagnose Quality Issues**
   - Shadow edge analysis (hard vs soft)
   - Transition zones
   - Specular vs diffused
   - Common issues: too harsh, too flat, uneven
   - Validation: Quality problems catalogued

4. **Diagnose Color Issues**
   - Color temperature assessment
   - Mixed lighting detection
   - Skin tone evaluation
   - Common issues: color cast, mixed temps, unnatural tones
   - Validation: Color problems catalogued

5. **Prioritize Fixes**
   - Rank issues by impact
   - Identify root causes
   - Determine fix order (biggest impact first)
   - Validation: Clear priority list

6. **Provide Solutions**
   - Specific fix for each issue
   - Step-by-step adjustments
   - Expected outcome
   - Validation: Each problem has solution

7. **Document Corrected Setup**
   - Diagram of improved setup
   - Settings changes
   - Prevention notes for future
   - Validation: Learning captured

## Output

- **Problem Diagnosis**: Detailed analysis of issues
- **Prioritized Fix List**: Solutions in order of impact
- **Corrected Setup**: Diagram of improved configuration
- **Prevention Guide**: How to avoid these issues

### Output Format

```
LIGHTING DIAGNOSIS: [SHOOT/IMAGE NAME]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
PROBLEMS IDENTIFIED
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

1. [PROBLEM NAME]
   â†’ What's happening: [Description]
   â†’ Why it matters: [Impact on image]
   â†’ Root cause: [Technical reason]

2. [PROBLEM NAME]
   â†’ What's happening: [Description]
   â†’ Why it matters: [Impact on image]
   â†’ Root cause: [Technical reason]

[Continue for all problems]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ANALYSIS: THE BIG THREE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

DIRECTION ISSUES:
â†’ Current: [What's happening with direction]
â†’ Problem: [Specific issue]
â†’ Impact: [How it affects the image]

QUALITY ISSUES:
â†’ Current: [What's happening with quality]
â†’ Problem: [Specific issue]
â†’ Impact: [How it affects the image]

COLOR ISSUES:
â†’ Current: [What's happening with color]
â†’ Problem: [Specific issue]
â†’ Impact: [How it affects the image]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
PRIORITY FIXES (In Order)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

PRIORITY 1 - [MOST IMPACTFUL FIX]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Problem: [What's wrong]
Cause: [Why it's happening]
Fix: [Specific action to take]
Test: [How to verify fix worked]

PRIORITY 2 - [SECOND FIX]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Problem: [What's wrong]
Cause: [Why it's happening]
Fix: [Specific action to take]
Test: [How to verify fix worked]

[Continue for all priorities]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CORRECTED SETUP
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

BEFORE (Problem):
        [Original position diagram]

AFTER (Corrected):
        [New position diagram]

KEY CHANGES:
â†’ [Change 1]: [From X to Y]
â†’ [Change 2]: [From X to Y]
â†’ [Change 3]: [From X to Y]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
SETTINGS ADJUSTMENTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

LIGHT:
â†’ Power: [From X to Y]
â†’ Position: [From X to Y]
â†’ Modifier: [Change if needed]
â†’ Gel: [Add/remove if needed]

CAMERA:
â†’ [Any settings that need changing]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
EXPECTED RESULT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

After corrections:
â†’ [Description of improved image]

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
PREVENTION CHECKLIST
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

To avoid this in the future:
[ ] [Preventive action 1]
[ ] [Preventive action 2]
[ ] [Preventive action 3]
```

## Common Lighting Problems Reference

### Direction Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Flat, no dimension | Light too frontal | Move light to 30-45Â° angle |
| Raccoon eyes | Light too high | Lower light to 15-30Â° above eyes |
| Nose shadow wrong | Light at wrong angle | Adjust horizontal position |
| No catchlights | Light too far off-axis | Ensure light reflects in eyes |
| Double shadows | Multiple uncontrolled sources | Flag unwanted sources |

### Quality Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Shadows too harsh | Source too small/far | Larger modifier OR move closer |
| Shadows too soft | Source too large/close | Smaller modifier OR move farther |
| Uneven lighting | Spill, incorrect feathering | Add grid OR adjust angle |
| Hotspots on face | Light too direct | Feather the edge |
| No shadow detail | Ratio too extreme | Add fill or increase ambient |

### Color Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Orange color cast | Tungsten ambient mixing | Gel flash CTO OR kill ambient |
| Green color cast | Fluorescent ambient | Gel flash green match |
| Blue subject/warm BG | Flash/tungsten mix | Gel flash CTO, WB for tungsten |
| Unnatural skin tones | Wrong WB or mixed light | Match temperatures, correct WB |
| Inconsistent color | Multiple sources, different temps | Gel to match dominant |

### Common Multi-Light Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Multiple shadows | Lights same intensity | Establish clear key, reduce others |
| No depth | Fill too strong | Reduce fill, increase ratio |
| Blown rim light | Edge light too powerful | Reduce rim by 1-2 stops |
| Background competing | Background too bright | Reduce BG light or add separation |

## McNally's Troubleshooting Rules

1. **One variable at a time**: Change only one thing, then assess
2. **Start with key light**: Fix primary light before touching others
3. **Check position first**: Wrong position is most common cause
4. **Don't add, subtract**: Before adding light, try removing
5. **Trust your eyes**: The image tells you what's wrong

## Success Criteria

- [ ] All visible problems identified
- [ ] Root causes determined
- [ ] Fixes prioritized by impact
- [ ] Specific adjustments provided
- [ ] Corrected setup documented
- [ ] Prevention guidance included

## Error Handling

- **Multiple problems**: Prioritize, fix one at a time
- **Unable to identify cause**: Request more information about setup
- **Equipment limitations**: Suggest workarounds within constraints
- **Post-processing fix needed**: Note what can't be fixed in-camera

## McNally Principles Applied

- "If one light isn't working, it's probably in the wrong place."
- "Shadows are just as important as highlights."
- "Test. Adjust. Test again. That's the process."
- "There's no such thing as bad light - only light you haven't figured out yet."
- "One change at a time. Observe the effect."

## Examples

### Example 1: Portrait with Harsh Shadows

```bash
*troubleshoot "shadows under eyes are too dark and harsh"
```

### Example 2: Mixed Color Temperature

```bash
*troubleshoot "subject looks blue but background is orange"
```

### Example 3: Flat Corporate Headshot

```bash
*troubleshoot "headshot looks flat and passport-like"
```

## Notes

- Most lighting problems have simple solutions
- Position errors are more common than equipment problems
- Always isolate variables when troubleshooting
- The image tells you what's wrong if you know how to read it
- Document fixes so you don't repeat mistakes
- "I've made every mistake you can make. That's how I learned." - Joe McNally

