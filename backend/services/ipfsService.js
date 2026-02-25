/**
 * IPFS Service (Pinata)
 * =====================
 * Handles uploading/retrieving encrypted files to/from IPFS via Pinata.
 * Pinata is a cloud IPFS pinning service — no local IPFS node needed.
 *
 * Setup: Get free API keys at https://app.pinata.cloud/developers/api-keys
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

/**
 * Get Pinata auth headers
 */
const getPinataHeaders = () => {
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new Error('Pinata API keys not configured. Set PINATA_API_KEY and PINATA_API_SECRET in .env');
    }

    return {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret
    };
};

/**
 * Upload a file buffer to IPFS via Pinata
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} fileName - Original file name (for Pinata metadata)
 * @param {object} [metadata] - Optional metadata to attach
 * @returns {Promise<{ ipfsHash: string, size: number, gateway: string }>}
 */
const uploadToIPFS = async (fileBuffer, fileName, metadata = {}) => {
    const headers = getPinataHeaders();

    // Build multipart form data manually using Blob/FormData (Node 18+)
    const formData = new FormData();

    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    formData.append('file', blob, fileName);

    // Pinata options: CID version 1 for modern IPFS
    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    // Attach metadata for easier management in Pinata dashboard
    if (metadata && Object.keys(metadata).length > 0) {
        const pinataMetadata = JSON.stringify({
            name: fileName,
            keyvalues: metadata
        });
        formData.append('pinataMetadata', pinataMetadata);
    }

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Pinata upload failed (${response.status}): ${errorBody}`);
    }

    const result = await response.json();

    return {
        ipfsHash: result.IpfsHash,
        size: result.PinSize,
        gateway: PINATA_GATEWAY
    };
};

/**
 * Fetch a file from IPFS via Pinata gateway
 * @param {string} ipfsHash - The IPFS CID/hash
 * @returns {Promise<Buffer>} File buffer
 */
const fetchFromIPFS = async (ipfsHash) => {
    const gatewayUrl = `${PINATA_GATEWAY}${ipfsHash}`;

    const response = await fetch(gatewayUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS (${response.status}): ${ipfsHash}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
};

/**
 * Unpin a file from Pinata (removes from their pinned storage)
 * @param {string} ipfsHash - The IPFS CID/hash to unpin
 * @returns {Promise<boolean>}
 */
const unpinFromIPFS = async (ipfsHash) => {
    const headers = getPinataHeaders();

    const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Pinata unpin failed (${response.status}): ${errorBody}`);
    }

    return true;
};

/**
 * Test Pinata connection by calling their auth test endpoint
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
    try {
        const headers = getPinataHeaders();

        const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
            method: 'GET',
            headers
        });

        return response.ok;
    } catch {
        return false;
    }
};

module.exports = {
    uploadToIPFS,
    fetchFromIPFS,
    unpinFromIPFS,
    testConnection,
    PINATA_GATEWAY
};
