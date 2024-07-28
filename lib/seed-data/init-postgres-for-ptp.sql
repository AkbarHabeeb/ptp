create database ptp;
create user ptp_user with encrypted password 'bharat';
GRANT ALL PRIVILEGES ON DATABASE ptp TO ptp_user;

create table if not exists history (
  id uuid,
  stock_id text,
  data jsonb,
  created_date timestamp with time zone DEFAULT now(),
  modified_date timestamp with time zone DEFAULT now(),
  is_active int
);

ALTER TABLE history OWNER TO ptp_user;

create table if not exists intraday (
	id uuid,
  stock_id text,
  data jsonb,
  trade_date timestamp,
  created_date timestamp with time zone DEFAULT now(),
  modified_date timestamp with time zone DEFAULT now(),
  is_active int
);

ALTER TABLE intraday OWNER TO ptp_user;