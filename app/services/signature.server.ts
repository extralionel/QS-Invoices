import crypto from "crypto";

/**
 * Generate HMAC SHA256 signature for a payload
 * @param {Object|string} payload - The data to sign
 * @returns {string} The calculated signature
 */
export function generateSignature(payload: string | object) {
    const secret = process.env.SHOPIFY_API_SECRET || "";
    // If payload is empty (null, undefined, ""), treat it as empty string
    // If it's an object (even empty {}), stringify it
    const body = !payload ? "" : (typeof payload === "string" ? payload : JSON.stringify(payload));
    //console.log("SHOPIFY APP: generateSignature body", body);

    return crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");
}
