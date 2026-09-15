import "dotenv/config"
import pg from "pg"
import { logError } from "../utils/logger.js"

const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export default pool

export async function checkConnection() {
    try{
        await pool.query("SELECT 1")
        return true
    }catch(error){
        logError(`Datenbankverbindung fehlgeschlagen: ${error.message}`)
        return false
    }
}