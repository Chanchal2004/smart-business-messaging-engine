Smart Business Messaging Engine
Real-Time, Cross-Channel Ecommerce Messaging Automation (WhatsApp-First, SMS Fallback)

This system detects customer actions, generates personalized messages, delivers them through WhatsApp with SMS fallback, and tracks message performance in real time while maintaining strict privacy and consent rules.

Why This Project Matters
Problem: Ecommerce brands lose revenue because customers abandon carts, miss price-drop updates, receive slow support replies, get messages on wrong channels, and do not receive personalized or measurable communication.

Solution: This engine detects high-value ecommerce events, creates contextual messages, sends them through WhatsApp/SMS based on user preference, tracks delivered/read/click/conversion events, enforces user consent and privacy, and provides admin tools and dashboards.

Impact: Helps brands recover abandoned carts, increase conversions, improve engagement, and build trust through consent-first and privacy-safe communication.

Key Features
End-to-end working system
WhatsApp-first delivery design
Automatic SMS fallback
Anonymous User ID and masked phone number
Event-to-message decision pipeline
Real-time dashboard with all metrics
Admin controls for channels and user actions
Reliable UI with visible feedback
Scalable and professional architecture

System Architecture
Frontend Website includes product catalog, product modal, add/remove cart flow, checkout simulation, consent modal for WhatsApp/SMS opt-in, profile badge showing masked phone and channel, WhatsApp and SMS message preview panel, admin panel, and a live dashboard.

Backend contains event ingestion API, profile and consent management, message template composer, WhatsApp/SMS dispatcher, fallback routing engine, queue processor for reliable execution, webhook simulator emitting delivered/read/click events, conversion attribution using utm_message_id, and audit log storage.

Queue Layer ensures ordered and reliable event/message processing with retry and backoff rules.

Channel Adapters include WhatsApp adapter, SMS adapter, and Instagram preview adapter.

Privacy and Consent System
When the user lands on the site, an anonymous User ID is generated with no personal information.
When the user opts in, the phone entered is immediately masked (e.g., +91 ••••••9721) and stored with their preferred channel.
When the user revokes consent, all sending stops, queued messages are blocked, and identifiers are removed.

Feature Pipeline (Detect → Decide → Compose → Deliver → Track)
Detect: System captures events such as add_to_cart, view_product, price_drop, checkout_started, and support_message.
Decide: Rule engine selects the right product, message template, channel, and CTA.
Compose: Templates use placeholders like {product}, {discount}, {cta}, {image}, {name} and generate WhatsApp rich cards and SMS text versions.
Deliver: Priority is WhatsApp first, then SMS fallback if WhatsApp is paused or fails, otherwise hold if no consent.
Track: Webhook simulator updates message status from delivered to read to click to conversion, and the dashboard updates instantly.

Admin Panel Features
Admin can pause or unpause WhatsApp, trigger abandoned-cart flow, simulate sending messages, preview WhatsApp and SMS templates, view logs, revoke consent, delete user data, and view real-time metrics.

Dashboard Metrics
The dashboard shows sent, delivered, read, clicked, converted, opt-outs, A/B uplift, funnel metrics, and real-time timeline logs.

End-to-End Demo Flow
Open website and view product grid.
Add multiple products to cart.
Open cart and trigger abandoned cart.
Message preview (WhatsApp and SMS) appears.
Simulate sending.
Dashboard updates for sent, delivered, read, click.
User clicks CTA and utm_message_id is recorded.
Simulated checkout records conversion.
Pause WhatsApp and trigger again to demonstrate SMS fallback.
Revoke consent and verify sending is blocked.
Delete data to remove identifiers.
Dashboard reflects all updates.

UI Characteristics
Clean product grid, realistic WhatsApp-style message preview, smooth transitions, toast notifications for all actions, masked phone number in profile, and consistent theme.

Privacy Note
“We store only masked contact details. Consent can be revoked at any time. Deleting data removes all identifiers immediately.”
