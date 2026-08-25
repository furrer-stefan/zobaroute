import express from "express"
import { getHealth } from "../controllers/healthController.js"
import { deleteAllData } from "../controllers/dataController.js"
import { validateOrders, postAllOrders, getAllOrders, startGeocoding, geocodeSingleAddress } from "../controllers/importController.js"
import { startCalculation, getAllRoutes, getGpxFromRoute, getPdfFromRoute } from "../controllers/routeController.js"

const router = express.Router()

router.get("/health", getHealth)

router.post("/orders/validate", validateOrders)
router.post("/orders", postAllOrders)
router.get("/orders", getAllOrders)
router.post("/geocode", startGeocoding)
router.post("/geocode/address", geocodeSingleAddress)

router.post("/routes/calculate", startCalculation)
router.get("/routes", getAllRoutes)
router.get("/routes/:id/gpx", getGpxFromRoute)
router.get("/routes/:id/pdf", getPdfFromRoute)

router.delete("/session", deleteAllData)

export default router