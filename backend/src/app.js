import express from "express";
import router from "./routes/index.js"
import { logInfo } from "./utils/logger.js"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url)) // import.meta.url --> path to current file as URL / fileURLToPath --> converts to normal path / path.dirname --> only takes path without filename
const frontendPath = path.join(__dirname, "../../frontend/dist") // join dirname with path to frontend --> \zobaroute\frontend\dist

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", router);

app.use(express.static(frontendPath))

app.use(function (req, res) {
    res.sendFile(path.join(frontendPath, "index.html"))
})

app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
});