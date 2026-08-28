import { getAllOrders, updateGeocodingResults } from "../repositories/orderRepository.js"
import { validateOrders } from "../services/validationService.js"
import { saveOrders } from "../repositories/orderRepository.js"
import { parseExcelBuffer } from "../services/excelParserService.js"
import { geocodeOrders, geocodeSingleAddress } from "../services/geocodingService.js"

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
    try{
        const orders = await getOrdersForGeocoding()
        if(orders.length === 0){
            return res.status(200).json({ message: "Keine Berechnung nötig, alle Adressen sind bereits berechnet" })
        }
        const geocoded = await geocodeOrders(orders)
        await updateGeocodingResults(geocoded)
        const successful = geocoded.filter(function (o) { return o.geocodingStatus === "successful" })
        const failed = geocoded.filter(function (o) { return o.geocodingStatus === "failed" })
        return res.status(200).json({ total: geocoded.length, successful: successful.length, failed: failed.length})
    }catch(error){
        console.error("Fehler beim Geokodieren:", error)
        res.status(500).json({ message: "Die Geokodierung konnte nicht durchgeführt werden" })
    }
}

// POST /api/geocode/address
export async function geocodeSingle(req, res) {
    const address = req.body
    try{
        const result = await geocodeSingleAddress(address)
        if(result.success === true){
            return res.status(200).json({ latitude: result.latitude, longitude: result.longitude })
        }
        if(result.technicalFailure === true){
            return res.status(503).json({ message: result.error })
        }
        return res.status(404).json({ message: result.error })
            
    }catch(error){
        console.error("Fehler beim Verarbeiten:", error)
        res.status(500).json({ message: "Die Adresse konnte nicht verarbeitet werden" })
    }
}
