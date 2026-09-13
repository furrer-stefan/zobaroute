import { deleteAllData } from "../repositories/orderRepository.js"
import { logError, logInfo } from "../utils/logger.js"

// DELETE /api/session
export async function deleteSession(req, res) {
    try{
        await deleteAllData()
        logInfo("Alle Daten wurden erfolgreich gelöscht")
        res.status(200).json({ message: "Alle Daten wurden erfolgreich gelöscht" })
    }catch(error){
        logError(`Löschen fehlgeschlagen: ${error.message}`)
        res.status(500).json({ message: "Die Daten konnten nicht gelöscht werden" })
    }
}