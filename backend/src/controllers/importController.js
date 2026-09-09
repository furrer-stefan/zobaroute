import { getAllOrders, getOrdersForGeocoding, updateGeocodingResults } from "../repositories/orderRepository.js"
import { validateOrders } from "../services/validationService.js"
import { saveOrders } from "../repositories/orderRepository.js"
import { parseExcelBuffer } from "../services/excelParserService.js"
import { geocodeOrders, geocodeSingleAddress } from "../services/geocodingService.js"

const geocodingProgress = {
    running: false,
    done: 0,
    total: 0,
    error: null
}

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

// GET /api/geocode/progress
export function getGeocodingProgress(req, res) {
    res.json(geocodingProgress)
}

async function runGeocoding(orders ){
    try{
        const geocoded = await geocodeOrders(orders, function (done, total) {
            geocodingProgress.done = done
            geocodingProgress.total = total
        })
        await updateGeocodingResults(geocoded)
    }catch(error){
        console.error("Fehler beim Geokodieren:", error)
        geocodingProgress.error = "Die Geokodierung konnte nicht abgeschlossen werden"
    }finally{
        geocodingProgress.running = false
    }
}

// POST /api/geocode
export async function startGeocoding(req, res) {
    if(geocodingProgress.running){
        return res.status(409).json({ message: "Die Geokodierung läuft bereits" })
    }
    let orders
    try{
        orders = await getOrdersForGeocoding()
    }catch(error){
        console.error("Fehler beim Geokodieren:", error)
        return res.status(500).json({ message: "Die Geokodierung konnte nicht durchgeführt werden" })
    }
    if(orders.length === 0){
        return res.status(200).json({ message: "Keine Berechnung nötig, alle Adressen sind bereits berechnet" })
    }
    geocodingProgress.running = true
    geocodingProgress.done = 0
    geocodingProgress.total = orders.length
    geocodingProgress.error = null
    runGeocoding(orders)
    res.status(202).json({ message: "Geokodierung gestartet", total: orders.length })
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
