Smart Business Messaging Engine
Real-Time, Cross-Channel Ecommerce Messaging Automation (WhatsApp-First, SMS Fallback)

A production-grade demo system that detects customer actions, generates personalized messages, delivers them through the best channel, and measures real-time performance while respecting consent and privacy.

Why This Project Matters
Problem

Ecommerce brands lose revenue because of:

Cart abandonment

Missed price-drop updates

Slow support replies

Wrong-channel messaging

No personalization

No analytics or attribution

Solution

A Smart Business Messaging Engine that:

Detects high-value events

Generates contextual messages

Sends via WhatsApp with SMS fallback

Tracks delivered/read/click/conversion

Enforces consent and privacy

Includes admin controls + dashboard

Impact

Recovers abandoned carts

Increases conversions

Improves engagement

Builds trust via consent-first communication

Key Features

End-to-end working system

WhatsApp-first delivery

Automatic SMS fallback

Anonymous User ID + masked phone

Event → decision → message pipeline

Real-time analytics dashboard

Admin control panel

Reliable UI with feedback

Scalable architecture

System Architecture
Frontend Website

Product catalog (multiple items)

Product detail modal

Add/Remove cart

Checkout simulation

Consent modal (WhatsApp/SMS)

User profile badge (masked phone + channel)

Message preview (WhatsApp + SMS)

Admin panel

Real-time dashboard

Backend (APIs + Worker)

Event ingestion

User profile + consent management

Message template composer

Dispatcher (WhatsApp + SMS)

Fallback routing

Queue processor with retries

Webhook simulator

Conversion attribution (utm_message_id)

Audit logging

Queue Layer

Reliable message processing

Retry + backoff

Ordered execution

Channel Adapters

WhatsApp adapter

SMS adapter

Instagram preview adapter

Privacy and Consent System
When user lands:

Anonymous User ID is generated

No personal data stored

When user opts in:

User enters phone number

System masks it (e.g., +91 ••••••9721)

Stores masked phone + preferred channel

When user revokes consent:

Messaging blocked instantly

Queued jobs cancelled

Identifiers removed

Feature Pipeline (Detect → Decide → Compose → Deliver → Track)
1. Detect

Triggers include:

add_to_cart

view_product

price_drop

checkout_started

support_message

2. Decide

Rule engine selects:

Best product

Best template

Best channel

Best CTA

3. Compose

Template placeholders:

{product}
{discount}
{cta}
{image}
{name}


Output formats:

WhatsApp rich card

SMS text

4. Deliver

Priority order:

WhatsApp

SMS fallback

Hold if no consent

5. Track

Webhook simulator updates:

Delivered

Read

Click

Conversion

Dashboard updates live.

Admin Panel Features

Pause/Unpause WhatsApp

Trigger abandoned-cart flow

Force send message

Preview WhatsApp + SMS

View logs

Revoke consent

Delete user data

Real-time dashboard metrics

Dashboard Metrics

Dashboard displays:

Sent

Delivered

Read

Clicked

Converted

Opt-outs

A/B uplift

Conversion funnel

Real-time event timeline

End-to-End Demo Flow

Open website → product grid loads

Add products to cart

Open cart → trigger abandoned cart

Message preview opens

Send message (simulate)

Dashboard updates: sent → delivered → read → click

Click CTA → utm_message_id recorded

Simulate checkout → conversion updated

Pause WhatsApp → trigger again → SMS fallback

Revoke consent → sending blocked

Delete user data → identifiers removed

Dashboard updates accordingly

UI Characteristics

Clean product grid

WhatsApp-style preview

Smooth transitions

Toast notifications

Masked phone display

Consistent theme

Privacy Note

“We store only masked contact details. Consent can be revoked at any time. Deleting data removes all identifiers immediately.”
