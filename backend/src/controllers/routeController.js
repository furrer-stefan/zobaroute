import { buildGpx } from "../exporters/gpxExporter.js"
import { buildPdf } from "../exporters/pdfExporter.js"
import { getAllOrders } from "../repositories/orderRepository.js"
import { getAllRoutes, getRouteById, saveRoutes } from "../repositories/routeRepository.js"
import { calculateRoutes } from "../services/routeOptimizerService.js"
import { logError, logWarn, logInfo } from "../utils/logger.js"

// POST /api/routes/calculate
export async function startCalculation(req, res) {
    const data = req.body
    if (!data || typeof data !== "object") {
        return res.status(400).json({ message: "Es stehen keine gültigen Berechnungsdaten zur Verfügung" })
    }

    const teamCount = data.teamCount
    if(!Number.isInteger(teamCount) || teamCount < 1){
        return res.status(400).json({ message: `Die Menge für Teamanzahl ist keine gültige Zahl: '${teamCount}'` })
    }

    const depot = data.depot
    if (!depot || typeof depot !== "object") {
        return res.status(400).json({ message: "Es steht kein gültiges Depot zur Verfügung." })
    }

    const depotLat = depot.latitude
    if(!Number.isFinite(depotLat)){
        return res.status(400).json({ message: `Der Breitengrad ist keine gültige Zahl: '${depotLat}'` })
    }

    const depotLon = depot.longitude
    if(!Number.isFinite(depotLon)){
        return res.status(400).json({ message: `Der Längengrad ist keine gültige Zahl: '${depotLon}'` })
    }
    
    try{
        const orders = await getAllOrders()
        const geocoded = orders.filter(function (o) { return o.geocodingStatus === "successful" })
        if(geocoded.length === 0){
            return res.status(400).json({ message: "Es wurden keine gültigen Bestellungen in der Datenbank gefunden." })
        }
        
        const minTeamCount = Math.ceil(geocoded.length / 59) // reason for 59: ORS matrix allows 3500 matrix-fields per request (so 59x59 matrix). So a route can have a maximum of 59 stopps, thus a certain teamCount is needed.
        if(teamCount < minTeamCount){
            logWarn(`Berechnung abgelehnt: ${teamCount} Teams, mindestens ${minTeamCount} nötig`)
            return res.status(400).json({ message: `Bei ${geocoded.length} Bestellungen sind mindestens ${minTeamCount} Teams nötig` })
        }

        const routes = await calculateRoutes(geocoded, teamCount, depot)
        await saveRoutes(routes)
        const fullRoutes = await getAllRoutes()
        logInfo(`Routen berechnet: ${fullRoutes.length} Teams für ${geocoded.length} Bestellungen`)
        return res.status(200).json({ routes: fullRoutes })
    }catch(error){
        logError(`Routenberechnung fehlgeschlagen: ${error.message}`)
        res.status(500).json({ message: "Die Berechnung konnte nicht durchgeführt werden" })
    }
}

// GET /api/routes
export async function getRoutes(req, res) {
    try{
        const result = await getAllRoutes()
        res.status(200).json({ routes: result })
    }catch(error){
        logError(`Routen konnten nicht geladen werden: ${error.message}`)
        res.status(500).json({ message: "Die Daten konnten nicht ausgelesen werden" })
    }
}

// GET /api/routes/:id/gpx
export async function getGpxFromRoute(req, res) {
    const routeId = Number(req.params.id)
    if(!Number.isInteger(routeId) || routeId < 1){
        return res.status(400).json({ message: `Die ID der Route ist keine gültige Zahl: '${routeId}'` })
    }
    try{
        const route = await getRouteById(routeId)
        if (!route) {
            return res.status(404).json({ message: "Die Route wurde nicht gefunden" })
        }
        const gpxContent = buildGpx(route)
        res.setHeader("Content-Type", "application/gpx+xml")
        res.setHeader("Content-Disposition", `attachment; filename="team-${route.teamNumber}.gpx"`)
        res.send(gpxContent)
    }catch(error){
        logError(`GPX-Erstellung fehlgeschlagen: ${error.message}`)
        return res.status(500).json({ message: "Die GPX Datei konnte nicht erstellt werden" })
    }
}

// GET /api/routes/:id/pdf
export async function getPdfFromRoute(req, res) {
    const routeId = Number(req.params.id)
    if(!Number.isInteger(routeId) || routeId < 1){
        return res.status(400).json({ message: `Die ID der Route ist keine gültige Zahl: '${routeId}'` })
    }
    try{
        const route = await getRouteById(routeId)
        if (!route) {
            return res.status(404).json({ message: "Die Route wurde nicht gefunden" })
        }
        const pdfContent = await buildPdf(route)
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="team-${route.teamNumber}.pdf"`)
        res.send(pdfContent)
    }catch(error){
        logError(`PDF-Erstellung fehlgeschlagen: ${error.message}`)
        return res.status(500).json({ message: "Die PDF Datei konnte nicht erstellt werden" })
    }
}