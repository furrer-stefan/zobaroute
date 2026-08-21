import { checkConnection } from "../db/connection.js"

// GET /api/health
export async function getHealth(req, res) {
    const isConnected = await checkConnection()
    if(isConnected){
        res.json({ status: "OK", database: "connected" })
    }else{
        res.status(503).json({ status: "ERROR", database: "disconnected" })
    }
}
