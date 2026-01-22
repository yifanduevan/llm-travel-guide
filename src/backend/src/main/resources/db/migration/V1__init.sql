-- Enums
CREATE TYPE travelers_enum AS ENUM ('solo', 'couple', 'family', 'group');
CREATE TYPE budget_enum AS ENUM ('budget', 'medium', 'luxury');
CREATE TYPE trip_status_enum AS ENUM ('draft', 'active', 'archived');
CREATE TYPE price_tier_enum AS ENUM ('$', '$$', '$$$');
CREATE TYPE dining_status_enum AS ENUM ('confirmed', 'waitlisted', 'pending', 'cancelled');
CREATE TYPE transport_type_enum AS ENUM ('flight', 'train', 'car', 'bus', 'other');
CREATE TYPE transport_status_enum AS ENUM ('planned', 'confirmed', 'completed', 'cancelled');
CREATE TYPE accommodation_status_enum AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE activity_status_enum AS ENUM ('booked', 'waitlist', 'planned', 'cancelled');
-- Adjust this when you finalize categories
CREATE TYPE itinerary_item_category_enum AS ENUM ('unspecified');

-- Core tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_or_destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  travelers travelers_enum NOT NULL,
  budget budget_enum NOT NULL,
  notes TEXT,
  status trip_status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  label TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time TIMESTAMPTZ,
  category itinerary_item_category_enum NOT NULL DEFAULT 'unspecified',
  location_text TEXT,
  link_url TEXT,
  image_url TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE dining_reservations (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TIMESTAMPTZ,
  cuisine TEXT,
  price_tier price_tier_enum,
  status dining_status_enum NOT NULL,
  address TEXT,
  notes TEXT,
  confirmation_code TEXT,
  party_size INT,
  image_url TEXT
);

CREATE TABLE transport_segments (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type transport_type_enum NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  start_tz TEXT,
  start_location TEXT,
  start_code TEXT,
  end_time TIMESTAMPTZ,
  end_tz TEXT,
  end_location TEXT,
  end_code TEXT,
  duration_text TEXT,
  status transport_status_enum NOT NULL,
  confirmation_code TEXT,
  ticket_url TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT
);

CREATE TABLE accommodations (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  room_type TEXT,
  check_in DATE,
  check_out DATE,
  rate NUMERIC(12,2),
  currency TEXT,
  status accommodation_status_enum NOT NULL,
  confirmation_code TEXT,
  tags TEXT[],
  image_url TEXT,
  notes TEXT
);

CREATE TABLE activities (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_or_date TIMESTAMPTZ,
  duration_text TEXT,
  price NUMERIC(12,2),
  currency TEXT,
  language TEXT,
  ticket_type TEXT,
  rating NUMERIC(3,1),
  status activity_status_enum NOT NULL,
  saved BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT
);

CREATE TABLE packing_items (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT
);

CREATE TABLE trip_preferences (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  duration_days INT,
  budget budget_enum,
  travelers travelers_enum,
  interests TEXT[]
);

-- Helpful indexes
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_days_trip ON itinerary_days(trip_id);
CREATE INDEX idx_items_day ON itinerary_items(day_id);
CREATE INDEX idx_dining_trip ON dining_reservations(trip_id);
CREATE INDEX idx_transport_trip ON transport_segments(trip_id);
CREATE INDEX idx_accommodation_trip ON accommodations(trip_id);
CREATE INDEX idx_activity_trip ON activities(trip_id);
CREATE INDEX idx_packing_trip ON packing_items(trip_id);
CREATE INDEX idx_pref_trip ON trip_preferences(trip_id);
