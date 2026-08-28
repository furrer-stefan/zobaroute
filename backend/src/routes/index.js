import express from "express"
import { getHealth } from "../controllers/healthController.js"
import { deleteSession } from "../controllers/dataController.js"
import { validateOrdersFile, postOrders, getOrders, startGeocoding, geocodeSingle } from "../controllers/importController.js"
import { startCalculation, getRoutes, getGpxFromRoute, getPdfFromRoute } from "../controllers/routeController.js"
import multer from "multer"

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(), // keeps the file in memory, not local storage
    limits: { fileSize: 5 * 1024 * 1024 } // limit of 5 MB
})

router.get("/health", getHealth)

router.post("/orders/validate", upload.single("file"), validateOrdersFile)
router.post("/orders", postOrders)
router.get("/orders", getOrders)
router.post("/geocode", startGeocoding)
router.post("/geocode/address", geocodeSingle)

router.post("/routes/calculate", startCalculation)
router.get("/routes", getRoutes)
router.get("/routes/:id/gpx", getGpxFromRoute)
router.get("/routes/:id/pdf", getPdfFromRoute)

router.delete("/session", deleteSession)

export default router