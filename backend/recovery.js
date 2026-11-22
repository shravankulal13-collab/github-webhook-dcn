
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ============================================
// GITHUB WEBHOOK RECOVERY MODULE
// ============================================

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const HOOK_ID = process.env.GITHUB_HOOK_ID;
const TOKEN = process.env.GITHUB_TOKEN;

const API_BASE =
    `https://api.github.com/repos/${OWNER}/${REPO}/hooks/${HOOK_ID}/deliveries`;

const FAILURE_FILE = path.join(__dirname, "failure_records.json");

// ============================================
// FUNCTION 1: READ FAILURE RECORDS
// ============================================

async function readFailureRecords() {

    try {

        const data = await fs.promises.readFile(
            FAILURE_FILE,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

// ============================================
// FUNCTION 2: UPDATE RECOVERY RECORD
// ============================================

async function updateRecoveryRecord(deliveryId, updates) {

    const records = await readFailureRecords();

    const index = records.findIndex(
        record => String(record.deliveryId) === String(deliveryId)
    );

    if (index === -1) {
        throw new Error("Failure record not found.");
    }

    records[index] = {
        ...records[index],
        ...updates
    };

    await fs.promises.writeFile(
        FAILURE_FILE,
        JSON.stringify(records, null, 2)
    );

    return records[index];
}

// ============================================
// FUNCTION 3: REQUEST GITHUB REDELIVERY
// ============================================

async function redeliverDelivery(deliveryId) {

    if (!OWNER || !REPO || !HOOK_ID || !TOKEN) {
        throw new Error("GitHub configuration is missing.");
    }

    if (!/^\d+$/.test(String(deliveryId))) {
        throw new Error("Invalid delivery ID.");
    }

    // Check whether this delivery exists in our failure records.
    const records = await readFailureRecords();

    const failure = records.find(
        record => String(record.deliveryId) === String(deliveryId)
    );

    if (!failure) {
        throw new Error(
            "This delivery is not present in the detected failure records."
        );
    }

    if (failure.recoveryStatus === "RECOVERED") {
        throw new Error("This delivery has already been recovered.");
    }

    // Prevent repeated requests while one is pending.
    if (failure.recoveryStatus === "REDELIVERY_REQUESTED") {
        throw new Error("Redelivery has already been requested.");
    }

    console.log("\n================================");
    console.log("STARTING WEBHOOK RECOVERY");
    console.log("Delivery ID:", deliveryId);
    console.log("================================");

    try {

        const response = await axios.post(
            `${API_BASE}/${deliveryId}/attempts`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2026-03-10"
                },
                timeout: 15000
            }
        );

        // GitHub returns HTTP 202 when it accepts the request.
        await updateRecoveryRecord(deliveryId, {

            recoveryStatus: "REDELIVERY_REQUESTED",

            retryCount: (failure.retryCount || 0) + 1,

            lastRecoveryAttempt: new Date().toISOString()

        });

        console.log("GitHub accepted the redelivery request.");
        console.log("HTTP Status:", response.status);

        return {

            status: "ACCEPTED",

            message: "GitHub accepted the webhook redelivery request.",

            originalDeliveryId: deliveryId,

            httpStatus: response.status

        };

    } catch (error) {

        console.error(
            "Recovery Error:",
            error.response?.data || error.message
        );

        throw error;
    }
}

// ============================================
// FUNCTION 4: VERIFY RECOVERY
// ============================================

async function getRecoveryStatus(deliveryId) {

    const records = await readFailureRecords();

    const failure = records.find(
        record => String(record.deliveryId) === String(deliveryId)
    );

    if (!failure) {
        throw new Error("Failure record not found.");
    }

    // Retrieve the latest delivery history from GitHub.
    const response = await axios.get(API_BASE, {

        headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10"
        },

        params: {
            per_page: 100
        },

        timeout: 15000
    });

    // GitHub uses the same GUID to identify redeliveries
    // of the original webhook event.
    const matchingDeliveries = response.data
        .filter(delivery => delivery.guid === failure.guid)
        .sort((a, b) =>
            new Date(b.delivered_at) - new Date(a.delivered_at)
        );

    const redelivery = matchingDeliveries.find(
        delivery => delivery.redelivery === true
    );

    if (!redelivery) {

        return {
            status: "PENDING",
            message: "No redelivery attempt is visible yet."
        };
    }

    const successful =
        redelivery.status === "OK" &&
        redelivery.status_code >= 200 &&
        redelivery.status_code < 400;

    const newStatus = successful
        ? "RECOVERED"
        : "REDELIVERY_FAILED";

    await updateRecoveryRecord(deliveryId, {

        recoveryStatus: newStatus,

        latestRedeliveryId: redelivery.id,

        latestRedeliveryStatus: redelivery.status,

        latestStatusCode: redelivery.status_code,

        verifiedAt: new Date().toISOString()

    });

    return {

        status: newStatus,

        originalDeliveryId: deliveryId,

        redeliveryId: redelivery.id,

        httpStatus: redelivery.status_code,

        message: successful
            ? "Webhook successfully recovered!"
            : "Redelivery occurred, but delivery is still unsuccessful."

    };
}

// ============================================
// EXPORT RECOVERY FUNCTIONS
// ============================================

module.exports = {
    redeliverDelivery,
    getRecoveryStatus
};
