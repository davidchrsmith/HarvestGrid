# HarvestGrid

A demand-driven farm-to-table coordination platform that connects restaurants with local farms for produce, meat, and dairy. HarvestGrid shifts from reactive listings to planning, commitments, logistics coordination, and waste reduction.

## Core Features

### 1. Demand Board
Restaurants post their supply needs with:
- Product name, quantity, and unit
- Frequency (one-time, weekly, bi-weekly, monthly, seasonal)
- Date range and timeline
- Preferred sourcing radius

Farms can:
- View all active demand requests
- Respond with offers including quantity and pricing
- Propose fulfillment for part or all of a demand

### 2. Standing Orders & Commitments
Convert accepted demand offers into recurring commitments with:
- Scheduled delivery dates
- Commitment status tracking (active, paused, completed, cancelled)
- Delivery history and on-time tracking
- Long-term partnership management

### 3. Surplus Marketplace
A separate marketplace for waste reduction:
- Farms can post excess inventory, imperfect products, or time-sensitive items
- Clearly labeled with surplus reason (excess, imperfect, urgent)
- Optional discount percentages
- Visually distinct from planned supply

### 4. Logistics Coordination
Organizations can specify:
- Delivery/receiving days
- Pickup availability (farms)
- Delivery notes and instructions
- Route-friendly scheduling indicators

### 5. Trust & Reliability Indicators
Non-review-based trust signals:
- Active partnerships count
- Commitment completion rate
- On-time delivery percentage
- Reliability badges (New, Establishing, Reliable, Highly Reliable)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (email/password)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Deployment**: Vercel

## Database Schema

### Core Tables
- `profiles` - User profiles with role (farm/restaurant worker)
- `organizations` - Farm and restaurant organizations
- `organization_members` - User memberships in organizations
- `demand_requests` - Restaurant supply needs
- `demand_offers` - Farm responses to demand
- `commitments` - Standing orders between organizations
- `commitment_deliveries` - Individual delivery tracking
- `products` - Farm inventory listings (regular and surplus)
- `messages` - Organization-to-organization communication
- `organization_reliability` - Trust metrics

### Security
All tables use Row Level Security (RLS) policies to ensure users can only access data for organizations they belong to.

## Setup Instructions

1. **Run Database Scripts**
   Execute the SQL scripts in order:
   - `001_create_profiles.sql`
   - `002_create_organizations.sql`
   - `003_create_organization_members.sql`
   - `004_create_products.sql`
   - `005_create_messages.sql`
   - `006_create_indexes.sql`
   - `007_add_cross_table_policies.sql`
   - `008_create_demand_requests.sql`
   - `009_create_demand_offers.sql`
   - `010_create_commitments.sql`
   - `011_create_commitment_deliveries.sql`
   - `012_update_products_for_surplus.sql`
   - `013_create_organization_reliability.sql`
   - `014_add_delivery_schedule.sql`

2. **Environment Variables**
   Required variables (auto-configured via Supabase integration):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (for dev)
   - `NEXT_PUBLIC_SITE_URL` (for production)

3. **Deploy**
   - Connect to Vercel via the v0 UI
   - Or download and deploy manually

## Key Design Principles

1. **Planning over Transactions** - Emphasize future needs and commitments, not just current inventory
2. **Coordination over Marketplace** - Focus on logistics alignment and partnership building
3. **Waste Reduction** - Separate surplus items with clear labeling and context
4. **Trust through Metrics** - Use completion rates and reliability scores instead of reviews
5. **Professional Language** - Avoid marketplace terms; use planning and coordination terminology

## User Flows

### Restaurant Worker
1. Sign up and create/join restaurant organization
2. Post demand requests on the Demand Board
3. Review farm offers and accept the best fit
4. Convert accepted offers into standing orders
5. Track commitment deliveries and reliability
6. Browse surplus marketplace for discounts

### Farm Worker
1. Sign up and create/join farm organization
2. View demand requests from restaurants
3. Respond with fulfillment offers
4. Manage active commitments and delivery schedules
5. Post surplus items for waste reduction
6. Configure logistics and delivery days

## Future Enhancements

- Real-time chat between organizations
- Mobile app (React Native version)
- Invoice and payment processing
- Advanced route optimization
- Seasonal planning tools
- Integration with farm management software
