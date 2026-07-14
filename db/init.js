const { Pool } = require("pg");

const pool = new Pool({
connectionString:
process.env.DATABASE_URL
});

async function initDB() {
try {

await pool.query(`
CREATE TABLE IF NOT EXISTS jobs(
id SERIAL PRIMARY KEY,
telegram_id TEXT,
company TEXT,
role TEXT,
location TEXT,
salary TEXT,
contact TEXT,
notes TEXT,
status TEXT,
created_at TIMESTAMP DEFAULT NOW()
)
`);

console.log("DB initialized");

} catch (err) {

console.error(
"DB INIT ERROR:",
err
);

}
}

module.exports = {
pool,
initDB
};
