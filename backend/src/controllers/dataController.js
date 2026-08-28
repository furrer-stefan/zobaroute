import { deleteAllData } from "../repositories/orderRepository.js"

// DELETE /api/session
export async function deleteSession(req, res) {
    try{
        await deleteAllData()
        res.status(200).json({ message: "Alle Daten wurden erfolgreich gelöscht" })
    }catch(error){
        console.error("Fehler beim Löschen:", error)
        res.status(500).json({ message: "Die Daten konnten nicht gelöscht werden" })
    }
}