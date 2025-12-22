// lib/templateResponses.ts
import type { BookingContext } from '@/types';

export function getTemplateResponse(userMessage: string, context: BookingContext): string {
  const msg = userMessage.toLowerCase();

  // Check availability
  if (msg.includes('availability') || msg.includes('check')) {
    return `## Checking Availability (AN Command)

The **AN** command shows available flights for a route.

### Format
\`\`\`
AN<DD><MMM><FROM><TO>/<AIRLINE>
\`\`\`

### Example
\`\`\`
AN13JANSUVNAN/FJ
\`\`\`

This searches for **Fiji Airways** flights from **SUV** to **NAN** on **13 January**.

### Reading Results
- \`9\` = 9+ seats available
- \`1-8\` = limited seats
- \`0\` = class not available

**Navigation:**
- \`MD\` → Next day
- \`MN\` → Previous day

Would you like to know how to **sell a seat** from the results?`;
  }

  // Sell seats
  if (msg.includes('sell') || msg.includes('ss') || msg.includes('seat')) {
    return `## Selling Seats (SS Command)

The **SS** command selects seats from availability.

### Format
\`\`\`
SS<SEATS><CLASS><LINE>
\`\`\`

### Example
\`\`\`
SS1Y3
\`\`\`

This sells:
- **1** seat
- **Y** class (economy)
- From line **3** of availability

### Multi-Sector Different Classes
\`\`\`
SS1YR3
\`\`\`
Booking classes apply **left → right** across sectors.

> ⚠️ **Note:** This holds seats but does NOT save the booking yet. You must complete pricing and use \`ER\` to save.

Need help with **pricing** next?`;
  }

  // Pricing
  if (msg.includes('pric') || msg.includes('fxp') || msg.includes('tst') || msg.includes('fare')) {
    return `## Pricing Commands

Pricing determines cost and creates a **TST** (Transitional Stored Ticket).

| Command | Purpose |
|---------|---------|
| \`FXX\` | Quote only (no TST) |
| \`FXP\` | Price & create TST |
| \`FXB\` | Best Buy (cheapest + TST) |
| \`TQT\` | View stored fare |

### Standard Flow
\`\`\`
FXP
\`\`\`

Then verify with:
\`\`\`
TQT
\`\`\`

> ⚠️ **Critical:** No TST = No ticketing. \`TTP\` will fail without it.

Ready to **complete the PNR**?`;
  }

  // PNR completion
  if (msg.includes('pnr') || msg.includes('checklist') || msg.includes('complete') || msg.includes('finish')) {
    return `## PNR Completion Checklist

Before saving with \`ER\`, ensure you have:

### Required Elements
- ✓ **Passenger name** (NM)
- ✓ **Phone contact** (AP)
- ✓ **Email** (APE)
- ✓ **Ticketing** (TKOK)
- ✓ **Received from** (RF)

### Quick One-Liner
\`\`\`
NM1KUMAR/ARUN MR;AP 9274730;APE-booking@email.com;TKOK;RF AGENT
\`\`\`

### Save the PNR
\`\`\`
ER
\`\`\`

This converts **DK → HK** status and stores permanently.

### Cancel Everything
\`\`\`
IR
\`\`\`

Releases seats and clears the PNR.

---

**Complete Flow:**
\`AN → SS → FXP → TQT → NM/AP/TK/RF → ER\``;
  }

  // Default response
  return `I understand you're asking about: **"${userMessage}"**

Here are some things I can help with:

- **Availability** → \`AN\` command syntax
- **Selling seats** → \`SS\` command usage
- **Pricing** → \`FXP\`, \`FXB\`, \`TQT\` commands
- **PNR completion** → Required elements & \`ER\` command

What specific part of the booking flow would you like guidance on?`;
}