
const TIERS = {
    CONTAINER: 0, // Archives (ZIP, TAR, 7Z)
    SOURCE: 1,    // Master Quality, Lossless, Layered (PSD, AI, FLAC, WAV, RAW)
    EDITABLE: 2,  // Structured, Editable (DOCX, SVG, HTML)
    DELIVERY: 3,  // High Quality output, usually flattened/compressed (MP4, JPG, PDF-Print)
    FLATTENED: 4  // Low info, rendered (GIF, BMP, Low-Res)
};

const CATEGORIES = {
    AUDIO: 'audio',
    VIDEO: 'video',
    IMAGE: 'image',
    DOCUMENT: 'document',
    ARCHIVE: 'archive',
    VECTOR: 'vector',
    EBOOK: 'ebook'
};

const FORMATS = {
    // --- IMAGES ---
    'psd': { category: CATEGORIES.IMAGE, tier: TIERS.SOURCE, lossy: false, layered: true, label: 'Adobe Photoshop' },
    'ai': { category: CATEGORIES.VECTOR, tier: TIERS.SOURCE, lossy: false, layered: true, label: 'Adobe Illustrator' },
    'raw': { category: CATEGORIES.IMAGE, tier: TIERS.SOURCE, lossy: false, layered: true, label: 'Camera RAW' },
    'tiff': { category: CATEGORIES.IMAGE, tier: TIERS.SOURCE, lossy: false, layered: true, label: 'TIFF (Layered)' },
    'heic': { category: CATEGORIES.IMAGE, tier: TIERS.SOURCE, lossy: false, layered: false, label: 'High Efficiency Image' },

    'svg': { category: CATEGORIES.VECTOR, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'Scalable Vector Graphics' },
    'eps': { category: CATEGORIES.VECTOR, tier: TIERS.EDITABLE, lossy: false, layered: false, label: 'Encapsulated PostScript' },

    'png': { category: CATEGORIES.IMAGE, tier: TIERS.DELIVERY, lossy: false, layered: false, label: 'PNG Image' },
    'jpg': { category: CATEGORIES.IMAGE, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'JPEG Image' },
    'jpeg': { category: CATEGORIES.IMAGE, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'JPEG Image' },
    'webp': { category: CATEGORIES.IMAGE, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'WebP Image' },
    'gif': { category: CATEGORIES.IMAGE, tier: TIERS.FLATTENED, lossy: true, layered: false, label: 'GIF Animation' },
    'bmp': { category: CATEGORIES.IMAGE, tier: TIERS.FLATTENED, lossy: false, layered: false, label: 'Bitmap Image' },
    'ico': { category: CATEGORIES.IMAGE, tier: TIERS.FLATTENED, lossy: false, layered: false, label: 'Icon File' },

    // --- DOCUMENTS ---
    'docx': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'Microsoft Word' },
    'doc': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'Legacy Word' },
    'odt': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'OpenDocument Text' },
    'rtf': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'Rich Text Format' },
    'txt': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: false, label: 'Text File' },
    'html': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: true, label: 'HTML Document' },
    'md': { category: CATEGORIES.DOCUMENT, tier: TIERS.EDITABLE, lossy: false, layered: false, label: 'Markdown' },

    'pdf': { category: CATEGORIES.DOCUMENT, tier: TIERS.DELIVERY, lossy: false, layered: false, label: 'Portable Document Format' },

    // --- AUDIO ---
    'wav': { category: CATEGORIES.AUDIO, tier: TIERS.SOURCE, lossy: false, layered: false, label: 'WAVE Audio' },
    'flac': { category: CATEGORIES.AUDIO, tier: TIERS.SOURCE, lossy: false, layered: false, label: 'FLAC Audio' },
    'aiff': { category: CATEGORIES.AUDIO, tier: TIERS.SOURCE, lossy: false, layered: false, label: 'AIFF Audio' },

    'mp3': { category: CATEGORIES.AUDIO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'MP3 Audio' },
    'aac': { category: CATEGORIES.AUDIO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'AAC Audio' },
    'ogg': { category: CATEGORIES.AUDIO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'OGG Audio' },
    'm4a': { category: CATEGORIES.AUDIO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'M4A Audio' },


    // --- VIDEO ---
    // Note: Video tiers are tricky because codecs matter more than containers. 
    // We assume standard usage (e.g., MP4 = H.264/AAC = Delivery).
    'mkv': { category: CATEGORIES.VIDEO, tier: TIERS.SOURCE, lossy: false, layered: true, label: 'Matroska Video' },
    'mov': { category: CATEGORIES.VIDEO, tier: TIERS.SOURCE, lossy: false, layered: false, label: 'QuickTime Movie' },

    'mp4': { category: CATEGORIES.VIDEO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'MP4 Video' },
    'webm': { category: CATEGORIES.VIDEO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'WebM Video' },
    'avi': { category: CATEGORIES.VIDEO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'AVI Video' },
    'flv': { category: CATEGORIES.VIDEO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'Flash Video' },
    'wmv': { category: CATEGORIES.VIDEO, tier: TIERS.DELIVERY, lossy: true, layered: false, label: 'Windows Media Video' },

    // --- ARCHIVES ---
    'zip': { category: CATEGORIES.ARCHIVE, tier: TIERS.CONTAINER, lossy: false, layered: true, label: 'ZIP Archive' },
    'tar': { category: CATEGORIES.ARCHIVE, tier: TIERS.CONTAINER, lossy: false, layered: true, label: 'TAR Archive' },
    '7z': { category: CATEGORIES.ARCHIVE, tier: TIERS.CONTAINER, lossy: false, layered: true, label: '7-Zip Archive' },
    'rar': { category: CATEGORIES.ARCHIVE, tier: TIERS.CONTAINER, lossy: false, layered: true, label: 'RAR Archive' }
};

const WARNINGS = {
    TIER_DOWNGRADE_SEVERE: "This conversion will flatten layers and lose editable structure. You will NOT be able to revert this change.",
    LOSSY_COMPRESSION: "Converting to a lossy format will permanently reduce quality.",
    METADATA_LOSS: "Some metadata may be lost in this conversion.",
    RASTERIZATION: "Converting vector to raster will cause pixelation if zoomed in."
};

const BLOCKED_REASONS = {
    TIER_UPGRADE: "Cannot convert a lower-quality source to a higher-tier editable format. Structure is already lost.",
    CATEGORY_MISMATCH: "Cannot convert between fundamentally different categories (e.g. Image to Audio).",
    NOT_IMPLEMENTED: "This conversion path is not yet implemented safely.",
    SECURITY_RISK: "File rejected due to security policy (potentially malicious content).",
    QUALITY_LOSS: "Conversion would result in unacceptable quality loss."
};

const DEFAULT_OPTIONS = {
    preserveMetadata: true,
    quality: 'lossless', // 'lossless', 'high', 'balanced'
    timeout: 300000 // 5 minutes
};

/**
 * Validates a conversion request.
 * @returns { object } { allowed: boolean, warning: string | null, reason: string | null }
 */
const validateConversion = (sourceFormat, targetFormat) => {
    const s = sourceFormat.toLowerCase();
    const t = targetFormat.toLowerCase();

    // Check if formats exist
    if (!FORMATS[s] || !FORMATS[t]) {
        return { allowed: false, reason: "Unsupported format" };
    }

    const source = FORMATS[s];
    const target = FORMATS[t];

    // 1. Category Check
    if (source.category !== target.category) {
        // Exception: Video -> Audio (Extraction)
        if (source.category === CATEGORIES.VIDEO && target.category === CATEGORIES.AUDIO) {
            return { allowed: true, warning: null };
        }
        // Exception: Document/Vector -> Image (Preview/Rasterization)
        if ((source.category === CATEGORIES.DOCUMENT || source.category === CATEGORIES.VECTOR) && target.category === CATEGORIES.IMAGE) {
            return { allowed: true, warning: WARNINGS.RASTERIZATION };
        }
        // Exception: Image -> PDF (Wrapper)
        if (source.category === CATEGORIES.IMAGE && target.category === CATEGORIES.DOCUMENT && t === 'pdf') {
            return { allowed: true, warning: null };
        }
        return { allowed: false, reason: BLOCKED_REASONS.CATEGORY_MISMATCH };
    }

    // 2. Tier Check
    // Block Up-Tiering (e.g., JPEG [3] -> PSD [1])
    // Allow Same Tier
    // Warn Down-Tiering (e.g., PSD [1] -> JPEG [3])

    if (source.tier > target.tier) {
        // Special Case: Archives (Tier 0) -> Anything is "Extraction" (Handled separately, usually blocked here as we don't extract yet)
        // But here source.tier (e.g. 3) > target.tier (e.g. 1) is UPGRADING (Lower number is better tier)
        // Wait, TIERS are: Container=0, Source=1, Editable=2, Delivery=3, Flattened=4
        // So:
        // 1 (Source) -> 3 (Delivery) = OK (Downgrade)
        // 3 (Delivery) -> 1 (Source) = BAD (Upgrade)
        // Therefore: If source.tier > target.tier (e.g. 4 > 1), it is an UPGRADE attempt. Block it.

        // Exception: Container (0) is special. We allow archiving anything (Any -> 0).
        if (target.tier === TIERS.CONTAINER) return { allowed: true };

        // Exception: Audio "Upsampling" (e.g. MP3 -> WAV) is requested often.
        // We allow it but warn that it won't explicitly improve quality.
        if (source.category === CATEGORIES.AUDIO && target.category === CATEGORIES.AUDIO) {
            return { allowed: true, warning: "Converting compressed audio to lossless will NOT restore original quality, just increase file size." };
        }

        // Exception: Video "Remuxing/Upscaling" (e.g. MP4 -> MKV/MOV)
        if (source.category === CATEGORIES.VIDEO && target.category === CATEGORIES.VIDEO) {
            return { allowed: true, warning: "Changing container to a professional format will NOT restore original quality." };
        }

        return { allowed: false, reason: BLOCKED_REASONS.TIER_UPGRADE };
    }

    // Down-Tiering (Source 1 -> Target 3) - User Warning
    if (source.tier < target.tier) {
        // If Layered -> Flat
        if (source.layered && !target.layered) {
            return { allowed: true, warning: WARNINGS.TIER_DOWNGRADE_SEVERE };
        }
        // If Lossless -> Lossy
        if (!source.lossy && target.lossy) {
            return { allowed: true, warning: WARNINGS.LOSSY_COMPRESSION };
        }
    }

    // Same Tier
    if (source.tier === target.tier) {
        // Lossless -> Lossy (within same tier, rare but possible)
        if (!source.lossy && target.lossy) {
            return { allowed: true, warning: WARNINGS.LOSSY_COMPRESSION };
        }
    }

    return { allowed: true, warning: null };
};

module.exports = {
    TIERS,
    CATEGORIES,
    FORMATS,
    WARNINGS,
    BLOCKED_REASONS,
    validateConversion
};
