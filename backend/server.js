
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
    startAutoRecovery
} = require("./autoRecovery");

const {
    fetchDeliveries,
    detectFailures
} = require("./failureDetector");

const {
    redeliverDelivery,
    getRecoveryStatus
} = require("./recovery");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;


app.get("/health", (req, res) => {
    res.status(200).json({
        status: "SUCCESS",
        message: "GitHub Webhook Server is running!",
        port: PORT
    });
});

app.post("/webhook", (req, res) => {
    const eventType = req.headers["x-github-event"];
    const deliveryId = req.headers["x-github-delivery"];
    const payload = req.body;
    console.log("\n========== NEW WEBHOOK ==========");
    console.log("Event Type:", eventType);
    console.log("Delivery ID:", deliveryId);
    if (eventType === "push") {
        console.log("Repository:", payload.repository?.full_name);
        console.log("Pushed By:", payload.sender?.login);
        console.log("Branch:", payload.ref);
    }
    console.log("=================================");
    res.status(202).json({
        status: "SUCCESS",
        message: "Webhook received successfully",
        eventType,
        deliveryId
    });
});


app.get("/api/deliveries", async (req, res) => {
    try {
        const deliveries = await fetchDeliveries();
        res.status(200).json({
            status: "SUCCESS",
            total: deliveries.length,
            deliveries: deliveries
        });

    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            message: error.response?.data?.message ||
                error.message
        });
    }
});

app.get("/api/failures", async (req, res) => {
    try {
        const result = await detectFailures();
        res.status(200).json({
            status: "SUCCESS",
            message: "Failure detection completed",
            totalDeliveries: result.totalDeliveries,
            failedCount: result.failedCount,
            failures: result.failures
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            message: error.response?.data?.message ||
                error.message
        });
    }
});


app.post("/api/recover/:deliveryId", async (req, res) => {
    if (
        !process.env.ADMIN_KEY ||
        req.headers["x-admin-key"] !== process.env.ADMIN_KEY
    ) {
        return res.status(401).json({
            status: "ERROR",
            message: "Unauthorized recovery request."
        });
    }
    try {
        const result = await redeliverDelivery(
            req.params.deliveryId
        );
        res.status(202).json(result);
    } catch (error) {
        res.status(error.response?.status || 400).json({
            status: "ERROR",
            message: error.response?.data?.message ||
                error.message
        });
    }
});

app.get("/api/recovery/status/:deliveryId", async (req, res) => {
    try {
        const result = await getRecoveryStatus(
            req.params.deliveryId
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: "ERROR",
            message: error.response?.data?.message ||
                error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("=================================");
    console.log("GITHUB WEBHOOK SERVER STARTED");
    console.log("=================================");
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    startAutoRecovery();
});




