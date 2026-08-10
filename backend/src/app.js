import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});