Smart Business Messaging Engine

Real-Time, Cross-Channel Ecommerce Messaging Automation (WhatsApp-First, SMS Fallback)

A production-grade demo system that detects customer actions, generates personalized messages, delivers them through the best channel, and measures real-time performance while respecting consent and privacy.

Why This Project Matters

Problem:
Ecommerce brands face revenue loss because of cart abandonment, price-drop notifications, slow support replies, wrong-channel messaging, lack of personalization, and missing analytics.

Solution:
A Smart Business Messaging Engine that detects high-value events, creates contextual messages, sends them via WhatsApp with automatic SMS fallback, tracks delivered/read/click/conversion events, enforces consent and privacy rules, and provides a complete admin control panel with real-time dashboards.

Impact:
Helps brands recover abandoned carts, increase conversions, improve engagement, and build trust through consent-first communication.

Key Features
End-to-end working system
WhatsApp-first delivery
Automatic SMS fallback
Anonymous User ID + masked phone
Event → decision → message pipeline
Real-time dashboard
Admin controls for channels, triggers, and user data
Reliable UI with clear feedback
Professional, scalable architecture

System Architecture

Frontend Website
Product catalog (multiple items)
Product detail modal
Add/Remove cart flow
Checkout simulation
Consent modal (WhatsApp/SMS)
User profile badge (masked phone + channel)
Message preview (WhatsApp + SMS)
Admin panel
Dashboard with live metrics and logs

Backend (APIs + Worker)
Event ingestion
User profile and consent management
Message template composer
Channel dispatcher (WhatsApp + SMS)
Fallback routing
Queue processor with retries
Webhook simulator
Conversion attribution using utm_message_id
Audit logging

Queue Layer
Reliable message processing with ordering and retry mechanisms.

Channel Adapters
WhatsApp adapter
SMS adapter
Instagram preview adapter

Privacy and Consent System
When user lands:
Anonymous User ID is created
No personal data stored

When user opts in:
User enters phone
System masks it immediately (e.g., +91 ••••••9721)
Stores masked phone + preferred channel (WhatsApp/SMS)

When user revokes consent:
All messaging is blocked
Queued messages cancelled
Profile updated
Personal identifiers removed

Feature Pipeline (Detect → Decide → Compose → Deliver → Track)
Detect
Real-time events such as add_to_cart, view_product, price_drop, checkout_started, and support_message.

Decide
Rule engine selects the best product, template, channel, and CTA.

Compose
Templates contain placeholders like {product}, {discount}, {cta}, {image}, {name}.
Output formats:
WhatsApp rich card
SMS text version

Deliver
Priority order:
WhatsApp
SMS fallback
Hold if no consent

Track
Webhook simulator updates message status through delivered → read → click → conversion, and dashboard updates live.

Admin Panel Features
Pause/Unpause WhatsApp channel
Trigger abandoned-cart flow
Force send a message
Preview WhatsApp and SMS templates
View detailed logs
Revoke user consent
Delete user data
Watch real-time dashboard metrics

Dashboard Metrics
The dashboard displays:
Sent
Delivered
Read
Clicked
Converted
Opt-outs
A/B uplift
Funnel metrics
Real-time log timeline

End-to-End Demo Flow
Open website; product grid loads
Add multiple products to cart
Open cart and trigger abandoned-cart
Message preview (WhatsApp card + SMS) appears
Send the message (simulate)
Dashboard updates: sent, delivered, read, click
Click CTA link; utm_message_id captured
Simulate checkout; conversion recorded
Pause WhatsApp; trigger again; SMS fallback appears
Revoke consent; sending is blocked
Delete data; profile and identifiers removed
Dashboard reflects updates

UI Characteristics
Clean product grid
Realistic WhatsApp-style preview
Smooth transitions
Toast notifications for all actions
Masked phone number in UI
Consistent theme and layout

Privacy Note
“We store only masked contact details. Consent can be revoked at any time. Deleting data removes all identifiers immediately.”
