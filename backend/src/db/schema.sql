-- CREATION OF ALL TABLES FOR DATABASE zobaroute
-- Stefan Furrer
-- 12.08.2026

DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS routes;

CREATE TABLE routes (
    route_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_number INTEGER NOT NULL UNIQUE CHECK (team_number > 0)
);

CREATE TABLE orders (
    order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    longitude NUMERIC(9,6),
    latitude NUMERIC(9,6),
    comment TEXT,
    validation_import VARCHAR(20) NOT NULL CHECK (validation_import IN ('corrected', 'successful', 'failed')),
    validation_geocoding VARCHAR(20) NOT NULL CHECK (validation_geocoding IN ('not_started', 'successful', 'failed')),
    validation_error TEXT
);

CREATE TABLE order_items (
    order_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    size INTEGER NOT NULL CHECK (size IN (300, 500, 700)),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    UNIQUE (order_id, size)
);

CREATE TABLE stops (
    stop_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    distance NUMERIC(8,2),
    sequence_position INTEGER NOT NULL CHECK (sequence_position > 0),
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    route_id INTEGER NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    UNIQUE (route_id, sequence_position)
);