const fs = require("fs");
const path = require("path");
const { detectFailures } = require("./failureDetector");
const {
    redeliverDelivery,
    getRecoveryStatus
} = require("./recovery");

const FAILURE_FILE = path.join(__dirname, "failure_records.json");
const CHECK_INTERVAL = 20000;
const MAX_RETRIES = 3;
let isChecking = false;

async function readRecords() {
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

async function checkAndRecover() {
    if (isChecking) return;
    isChecking = true;
    try {
        console.log("\n===== AUTOMATIC RECOVERY CHECK =====");
        const result = await detectFailures();
        console.log(
            "Failure detection completed:",
            result.failedCount,
            "failures found"
        );

        const records = await readRecords();
        for (const failure of records) {
            const deliveryId = String(failure.deliveryId);
            const retryCount = Number(failure.retryCount || 0);
            if (failure.recoveryStatus === "RECOVERED") {
                continue;
            }

            if (failure.recoveryStatus === "REDELIVERY_REQUESTED") {
                try {
                    const status = await getRecoveryStatus(deliveryId);
                    console.log(
                        "Delivery:",
                        deliveryId,
                        "| Verification:",
                        status.status
                    );
                } catch (error) {
                    console.log(
                        "Verification error:",
                        error.message
                    );
                }
                continue;
            }
            if (
                failure.recoveryStatus !== "PENDING" &&
                failure.recoveryStatus !== "REDELIVERY_FAILED"
            ) {
                continue;
            }
            if (retryCount >= MAX_RETRIES) {

                console.log(
                    "Retry limit reached for:",
                    deliveryId
                );
                continue;
            }
            try {
                console.log(
                    "Requesting redelivery:",
                    deliveryId
                );
                const recovery = await redeliverDelivery(deliveryId);
                console.log(
                    "Redelivery request:",
                    recovery.status
                );
            } catch (error) {
                console.log(
                    "Recovery request failed:",
                    error.response?.data?.message || error.message
                );
            }
        }
    } catch (error) {
        console.error(
            "Automatic recovery monitoring error:",
            error.message
        );
    } finally {
        isChecking = false;
        console.log("===== RECOVERY CHECK COMPLETED =====\n");
    }
}

function startAutoRecovery() {
    console.log("\n=================================");
    console.log("AUTOMATIC RECOVERY ENGINE STARTED");
    console.log("Checking every 20 seconds");
    console.log("Maximum retries:", MAX_RETRIES);
    console.log("=================================\n");
    checkAndRecover();
    setInterval(checkAndRecover, CHECK_INTERVAL);
}

module.exports = {
    startAutoRecovery,
    checkAndRecover
};
