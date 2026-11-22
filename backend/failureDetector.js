
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const JSONbig = require("json-bigint")({
    storeAsString: true
});
// ============================================
// GITHUB WEBHOOK FAILURE DETECTOR
// ============================================

// GitHub configuration
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const HOOK_ID = process.env.GITHUB_HOOK_ID;
const TOKEN = process.env.GITHUB_TOKEN;

// GitHub API URL
const API_URL =
    `https://api.github.com/repos/${OWNER}/${REPO}/hooks/${HOOK_ID}/deliveries`;

// Local file to store detected failures
const FAILURE_FILE = path.join(__dirname, "failure_records.json");

// ============================================
// CHECK CONFIGURATION
// ============================================

function checkConfiguration() {

    if (!OWNER || !REPO || !HOOK_ID || !TOKEN) {
        throw new Error(
            "Missing GitHub configuration. Check your .env file."
        );
    }
}

// ============================================
// FUNCTION 1: FETCH GITHUB DELIVERIES
// ============================================

async function fetchDeliveries() {
    checkConfiguration();
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2026-03-10"
            },

            transformResponse: [
                (data) => JSONbig.parse(data)
            ],

            params: {
                per_page: 100
            },

            timeout: 15000
        });

        return response.data;

    } catch (error) {

        console.error(
            "GitHub API Error:",
            error.response?.data || error.message
        );

        throw error;
    }
}

// ============================================
// FUNCTION 2: IDENTIFY FAILED DELIVERIES
// ============================================

function isFailedDelivery(delivery) {

    const status = String(delivery.status || "").toUpperCase();

    const statusCode = Number(delivery.status_code);

    return (
        (status !== "" && status !== "OK") ||
        statusCode === 0 ||
        (statusCode >= 400 && statusCode <= 599)
    );
}

// ============================================
// FUNCTION 3: SAVE FAILURE RECORDS
// ============================================

async function saveFailureRecords(failures) {

    let existingRecords = [];

    try {

        const data = await fs.promises.readFile(
            FAILURE_FILE,
            "utf8"
        );

        existingRecords = JSON.parse(data);

    } catch (error) {

        if (error.code !== "ENOENT") {
            throw error;
        }
    }

    const recordsMap = new Map(
        existingRecords.map(record => [
            String(record.deliveryId),
            record
        ])
    );

    for (const delivery of failures) {

        const id = String(delivery.id);

        const previous = recordsMap.get(id);

        recordsMap.set(id, {

            deliveryId: delivery.id,

            guid: delivery.guid,

            eventType: delivery.event,

            status: "FAILED",

            githubStatus: delivery.status,

            statusCode: delivery.status_code,

            deliveredAt: delivery.delivered_at,

            detectedAt: previous?.detectedAt ||
                new Date().toISOString(),

            retryCount: previous?.retryCount || 0,

            recoveryStatus: previous?.recoveryStatus ||
                "PENDING"

        });
    }

    const updatedRecords = Array.from(recordsMap.values());

    await fs.promises.writeFile(
        FAILURE_FILE,
        JSON.stringify(updatedRecords, null, 2)
    );

    return updatedRecords;
}

// ============================================
// FUNCTION 4: DETECT FAILURES
// ============================================

async function detectFailures() {

    console.log("\n================================");
    console.log("STARTING FAILURE DETECTION");
    console.log("================================");

    // Get deliveries from GitHub
    const deliveries = await fetchDeliveries();

    // Identify unsuccessful deliveries
    const failures = deliveries.filter(isFailedDelivery);

    // Save detected failures locally
    const records = await saveFailureRecords(failures);

    console.log("Total deliveries:", deliveries.length);

    console.log("Failed deliveries:", failures.length);

    console.log("Failure records saved successfully.");

    console.log("================================\n");

    return {

        totalDeliveries: deliveries.length,

        failedCount: failures.length,

        failures: records

    };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
    fetchDeliveries,
    detectFailures
};
