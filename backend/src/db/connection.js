import "dotenv/config"
import pg from "pg"

const { Pool } = pg

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
})

export default pool

export async function checkConnection() {
    try{
        await pool.query("SELECT 1")
        return true
    }catch(error){
        return false
    }
}