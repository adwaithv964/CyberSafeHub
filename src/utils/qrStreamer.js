import LZString from 'lz-string';

// Constants
const CHUNK_SIZE = 500; // Characters per QR code (keep it low for fast scanning)
const HEADER_SEPARATOR = "|";

/**
 * Splits a file (Blob/File) into an array of QR-encodable strings.
 * Format: ID|INDEX|TOTAL|DATA
 * @param {File} file 
 * @returns {Promise<string[]>} Array of strings
 */
export const generateQRChunks = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const base64 = e.target.result; // Data URL
                // We compresses the base64 string to save space, though base64 is already larger than binary.
                // LZString on base64 is okay, but LZString on raw binary string is better if we could.
                // For simplicity and compatibility, we'll compress the Data URL directly.
                const compressed = LZString.compressToEncodedURIComponent(base64);

                const chunks = [];
                const totalChunks = Math.ceil(compressed.length / CHUNK_SIZE);
                const fileId = Math.floor(Math.random() * 10000).toString(36); // Short random ID for session

                for (let i = 0; i < totalChunks; i++) {
                    const start = i * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, compressed.length);
                    const chunkData = compressed.slice(start, end);

                    // Header: ID|Index|Total|Data
                    // Using base36 for numbers to save chars
                    const header = `${fileId}${HEADER_SEPARATOR}${i.toString(36)}${HEADER_SEPARATOR}${totalChunks.toString(36)}${HEADER_SEPARATOR}`;
                    chunks.push(header + chunkData);
                }

                resolve({
                    chunks,
                    fileId,
                    totalChunks,
                    originalName: file.name,
                    size: file.size
                });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Parses a scanned QR string.
 * @param {string} qrString 
 * @returns {Object|null} { id, index, total, data }
 */
export const parseQRChunk = (qrString) => {
    try {
        if (!qrString) return null;

        // Find separators
        const parts = qrString.split(HEADER_SEPARATOR);
        if (parts.length < 4) return null;

        const id = parts[0];
        const index = parseInt(parts[1], 36);
        const total = parseInt(parts[2], 36);
        // The data is the rest of the string (in case data itself passed check by coincidence, though unlikely with this format)
        // Actually, let's just use slice to get the rest
        // Header length = length of parts[0] + ... + 3 separators
        const headerLength = parts[0].length + parts[1].length + parts[2].length + 3;
        const data = qrString.substring(headerLength);

        return { id, index, total, data };
    } catch (e) {
        console.error("Invalid QR Chunk:", e);
        return null;
    }
};

/**
 * Reassembles chunks into a Blob.
 * @param {string[]} chunks Array of data strings (ordered)
 * @returns {string} Data URL
 */
export const reassembleFile = (chunks) => {
    try {
        const fullCompressed = chunks.join('');
        const decompressed = LZString.decompressFromEncodedURIComponent(fullCompressed);
        return decompressed;
    } catch (e) {
        console.error("Error reassembling file:", e);
        return null;
    }
};
