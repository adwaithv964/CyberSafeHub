/**
 * seedCyberTools.js
 * Seeds the 7 built-in CyberSafeHub tools into MongoDB on first run.
 * Safe to call on every server start — skips tools that already exist.
 */
const CyberTool = require('../models/CyberTool');

const BUILT_IN_TOOLS = [
    {
        name: 'Metadata Washer',
        description: 'Remove hidden GPS, Camera, and Date information from your photos before sharing.',
        icon: 'image',
        color: 'purple',
        route: '/tools/metadata-washer',
        category: 'privacy',
        isBuiltIn: true,
        order: 1,
        badge: '',
    },
    {
        name: 'Username Detective',
        description: 'OSINT tool to investigate username presence across 50+ social networks and platforms to find digital footprints.',
        icon: 'search',
        color: 'blue',
        route: '/tools/username-detective',
        category: 'osint',
        isBuiltIn: true,
        order: 2,
        badge: 'OSINT',
    },
    {
        name: 'WiFi Radar',
        description: 'Scan local network for connected devices and detect potential "promiscuous mode" spying activity.',
        icon: 'wifi',
        color: 'cyan',
        route: '/tools/wifi-radar',
        category: 'scanner',
        isBuiltIn: true,
        order: 3,
        badge: '',
    },
    {
        name: 'Secure Share',
        description: 'P2P Encrypted File Transfer directly between devices. No server storage.',
        icon: 'share2',
        color: 'green',
        route: '/tools/secure-share',
        category: 'privacy',
        isBuiltIn: true,
        order: 4,
        badge: 'E2E',
    },
    {
        name: 'All-in-One Converter',
        description: 'Merge, Split, Compress, and Convert PDFs and Images. 20+ Tools in one place.',
        icon: 'fileText',
        color: 'orange',
        route: '/tools/conversion-system',
        category: 'converter',
        isBuiltIn: true,
        order: 5,
        badge: '20+ Tools',
    },
    {
        name: 'Code Security Auditor',
        description: 'AI-powered static analysis to identify vulnerabilities in your code snippets instantly.',
        icon: 'code',
        color: 'emerald',
        route: '/tools/code-auditor',
        category: 'ai',
        isBuiltIn: true,
        order: 6,
        badge: 'AI',
    },
    {
        name: 'Policy Decoder',
        description: 'Paste legal jargon (Terms of Service, Privacy Policies) and get an instant AI summary of red flags.',
        icon: 'book',
        color: 'pink',
        route: '/tools/privacy-decoder',
        category: 'ai',
        isBuiltIn: true,
        order: 7,
        badge: 'AI',
    },
];

async function seedCyberTools() {
    try {
        const existing = await CyberTool.countDocuments({ isBuiltIn: true });
        if (existing >= BUILT_IN_TOOLS.length) {
            console.log(`[CyberTools] ${existing} built-in tools already seeded — skipping.`);
            return;
        }

        for (const tool of BUILT_IN_TOOLS) {
            await CyberTool.findOneAndUpdate(
                { route: tool.route },
                tool,
                { upsert: true, setDefaultsOnInsert: true }
            );
        }
        console.log(`[CyberTools] Seeded ${BUILT_IN_TOOLS.length} built-in cyber tools.`);
    } catch (err) {
        console.error('[CyberTools] Seed error:', err.message);
    }
}

module.exports = seedCyberTools;
