import express from "express"
import { getHealth } from "../controllers/healthController.js"
import { deleteAllData } from "../controllers/dataController.js"
import { importOrders, getAllOrders, updateOrder, startGeocoding } from "../controllers/importController.js"
import { startCalculation, getAllRoutes, getGpxFromRoute, getPdfFromRoute } from "../controllers/routeController.js"

const router = express.Router()

router.get("/health", getHealth)

router.post("/import", importOrders)
router.get("/orders", getAllOrders)
router.put("/orders/:id", updateOrder)
router.post("/geocode", startGeocoding)

router.post("/routes/calculate", startCalculation)
router.get("/routes", getAllRoutes)
router.get("/routes/:id/gpx", getGpxFromRoute)
router.get("/routes/:id/pdf", getPdfFromRoute)

router.delete("/session", deleteAllData)

export default router