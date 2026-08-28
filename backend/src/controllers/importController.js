import { getAllOrders } from "../repositories/orderRepository.js"
import { validateOrders } from "../services/validationService.js"
import { saveOrders } from "../repositories/orderRepository.js"
import { parseExcelBuffer } from "../services/excelParserService.js"

// POST /api/orders/validate
export async function validateOrdersFile(req, res) {
    if(!req.file){
        return res.status(400).json({ message: "Die Datei existiert nicht" })
    }
    let orders
    try{
        orders = await parseExcelBuffer(req.file.buffer)
    }catch(error){
        console.error("Fehler beim Validieren:", error)
        return res.status(400).json({ message: error.message })
    }
    const validated = validateOrders(orders)
    res.status(200).json({ orders: validated })
}

// POST /api/orders
export async function postOrders(req, res) {
    const orders = req.body
    if(!(Array.isArray(orders)) || orders.length === 0){
        return res.status(400).json({ message: "Es stehen keine gültigen Bestellungen zur Verfügung" })
    }
    const validated = validateOrders(orders)
    const invalid = validated.filter(function (order) { return !order.isValid })
    if(invalid.length > 0){
        return res.status(400).json({ message: "Einige Bestellungen sind fehlerhaft", invalidOrders: invalid })
    }
    try{
        await saveOrders(orders)
        res.status(200).json({ message: "Die Bestellungen wurden erfolgreich in die Datenbank eingetragen" })
    }catch(error){
        console.error("Fehler beim Eintragen:", error)
        res.status(500).json({ message: "Die Daten konnten nicht eingetragen werden" })
    }
}

// GET /api/orders
export async function getOrders(req, res) {
    try{
        const result = await getAllOrders()
        res.status(200).json({ orders: result })
    }catch(error){
        console.error("Fehler beim Auslesen:", error)
        res.status(500).json({ message: "Die Daten konnten nicht ausgelesen werden" })
    }
}

// POST /api/geocode
export async function startGeocoding(req, res) {
    res.status(501).json({ message: "Not implemented yet" })
}

// POST /api/geocode/address
export async function geocodeSingleAddress(req, res) {
    res.status(501).json({ message: "Not implemented yet" })
}