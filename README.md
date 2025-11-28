Smart Business Messaging Engine
Real-Time, Cross-Channel Ecommerce Messaging Automation (WhatsApp-First, SMS Fallback)

A production-grade demo system that detects customer actions, generates personalized messages, delivers them through the best channel, and measures real-time performance while respecting consent and privacy.

Why This Project Matters
Problem

Ecommerce brands face revenue loss because of:

Cart abandonment

Missed price-drop notifications

Slow support replies

Wrong-channel messaging

No personalization

No analytics or attribution

Solution

A Smart Business Messaging Engine that:

Detects high-value events

Creates contextual messages

Sends via WhatsApp with automatic SMS fallback

Tracks delivered/read/click/conversion

Enforces consent + privacy

Provides admin controls and real-time dashboards

Impact

This system helps brands:

Recover abandoned carts

Increase conversions

Improve engagement

Build trust with consent-first communication

Key Features

End-to-end working flow

WhatsApp-first messaging

Automatic SMS fallback

Anonymous User ID + masked phone number

Event → Decision → Message pipeline

Real-time analytics dashboard

Admin controls for channels and users

Reliable UI with proper feedback

Scalable and professional architecture

System Architecture
Frontend Website

Product catalog (multiple items)

Product detail modal

Add/Remove cart

Checkout simulation

Consent modal (WhatsApp/SMS)

User profile badge (masked phone + channel)

Message preview panel (WhatsApp + SMS)

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

Handles reliable event and message processing with retry/backoff.

Channel Adapters

WhatsApp adapter

SMS adapter

Instagram preview adapter

Privacy and Consent System
When user lands:

Anonymous User ID is created

No personal details stored

When user opts in:

User enters phone number

System masks it (e.g., +91 ••••••9721)

Stores masked phone + preferred channel

When user revokes consent:

All messaging blocked instantly

Queued jobs cancelled

Profile updated

Identifiers removed

Feature Pipeline (Detect → Decide → Compose → Deliver → Track)
1. Detect

Events like:

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

Templates include placeholders:

{product}
{discount}
{cta}
{image}
{name}


Output:

WhatsApp rich card

SMS text version

4. Deliver

Priority:

WhatsApp

SMS fallback

Hold if no consent

5. Track

Webhook simulator updates:

Delivered

Read

Click

Conversion

Dashboard updates in real time.

Admin Panel Features

Pause/Unpause WhatsApp

Trigger abandoned-cart flow

Force-send a message

Preview WhatsApp + SMS

View logs

Revoke consent

Delete user data

Real-time metrics display

Dashboard Metrics

Displays:

Sent

Delivered

Read

Clicked

Converted

Opt-outs

A/B uplift

Funnel metrics

Real-time event timeline

End-to-End Demo Flow

Open website → product grid loads

Add multiple products

Open cart → click Trigger Abandoned Cart

Message preview (WhatsApp + SMS) opens

Click Send (Simulate)

Dashboard updates: sent → delivered → read → click

User clicks CTA → utm_message_id tracked

Simulated checkout → conversion recorded

Pause WhatsApp → trigger again → SMS fallback

Revoke consent → sending blocked

Delete data → profile wiped

Dashboard reflects updates

UI Characteristics

Clean and simple layout

Real WhatsApp-style preview

Smooth transitions

Toast notifications for each action

Masked phone in profile

Consistent theme

Privacy Note

“We store only masked contact details. Consent can be revoked at any time. Deleting data removes all identifiers immediately.”
