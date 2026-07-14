CREATE TABLE IF NOT EXISTS jobs (

id SERIAL PRIMARY KEY,

telegram_id TEXT,

company TEXT,

role TEXT,

location TEXT,

salary TEXT,

contact TEXT,

notes TEXT,

status TEXT DEFAULT 'APPLIED',

created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS recruiter_events (

id SERIAL PRIMARY KEY,

telegram_id TEXT,

event TEXT,

created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS analytics (

id SERIAL PRIMARY KEY,

metric TEXT,

value INTEGER DEFAULT 0,

created_at TIMESTAMP DEFAULT NOW()

);
