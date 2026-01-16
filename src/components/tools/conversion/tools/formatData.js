
export const FORMATS = {
    Archive: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'BZ2'],
    Audio: ['MP3', 'WAV', 'OGG', 'M4A', 'AAC', 'FLAC', 'WMA', 'AIFF', 'OPUS'],
    Cad: ['DWG', 'DXF'],
    Document: ['PDF', 'DOCX', 'DOC', 'TXT', 'RTF', 'ODT', 'HTML', 'MD'],
    Ebook: ['EPUB', 'MOBI', 'AZW3', 'PDF', 'TXT'],
    Font: ['TTF', 'OTF', 'WOFF', 'WOFF2'],
    Image: ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'ICO', 'SVG', 'HEIC', 'AVIF'],
    Presentation: ['PPTX', 'PPT', 'ODP', 'PDF'],
    Spreadsheet: ['XLSX', 'XLS', 'CSV', 'ODS', 'PDF'],
    Vector: ['SVG', 'EPS', 'AI', 'PDF'],
    Video: ['MP4', 'MKV', 'AVI', 'MOV', 'WEBM', 'FLV', 'WMV', 'GIF', 'M4V']
};

export const ALIASES = {
    'jpeg': 'JPG',
    'tif': 'TIFF',
    'mpeg': 'MPG',
    'm4v': 'MP4'
};

// Valid Target Formats based on Input Category
// This mimics CloudConvert's logic + our backend capabilities
export const CONVERSION_RULES = {
    'Image': ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'ICO', 'PDF', 'SVG'],
    'Audio': ['MP3', 'WAV', 'OGG', 'M4A', 'AAC', 'FLAC', 'WMA'],
    'Video': ['MP4', 'MKV', 'AVI', 'MOV', 'WEBM', 'FLV', 'WMV', 'GIF', 'MP3', 'WAV', 'M4A'], // Video can extract to Audio
    'Document': ['PDF', 'DOCX', 'DOC', 'TXT', 'RTF', 'ODT', 'HTML', 'JPG', 'PNG'], // Docs to PDF or Image Preview
    'Presentation': ['PDF', 'PPTX', 'PPT', 'ODP', 'JPG', 'PNG'],
    'Spreadsheet': ['PDF', 'XLSX', 'XLS', 'CSV', 'ODS', 'JPG', 'PNG'],
    'Ebook': ['PDF', 'EPUB', 'MOBI', 'TXT'],
    'Archive': ['ZIP', 'TAR', '7Z'], // Repacking (if supported) or just extraction (future)
    'Vector': ['PDF', 'SVG', 'PNG', 'JPG'],
    'Font': ['TTF', 'OTF', 'WOFF', 'WOFF2']
};

// Universal fallback targets (Any file can be archived)
export const UNIVERSAL_TARGETS = ['ZIP', 'TAR'];

export const getCategory = (fmt) => {
    const format = fmt.toUpperCase();
    for (const [cat, list] of Object.entries(FORMATS)) {
        if (list.includes(format)) return cat;
    }
    return 'Other';
};

// Get valid 'To' options for a given 'From' format
export const getValidTargets = (sourceFormat) => {
    if (!sourceFormat || sourceFormat === '...') return [];

    // Normalize
    const normalized = ALIASES[sourceFormat.toLowerCase()] || sourceFormat.toUpperCase();
    const category = getCategory(normalized);

    // Get category-specific targets
    const categoryTargets = CONVERSION_RULES[category] || [];

    // Combine with universal targets (Archives)
    // Use Set to remove duplicates
    const allTargets = new Set([...categoryTargets, ...UNIVERSAL_TARGETS]);

    // Remove self
    allTargets.delete(normalized);

    return allTargets;
};
