import { useState, useEffect } from 'react';
import axios from 'axios';

// Cache the config to avoid refetching every time
let configCache = null;

export const useConversionConfig = () => {
    const [config, setConfig] = useState(configCache);
    const [loading, setLoading] = useState(!configCache);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (configCache) return;

        const fetchConfig = async () => {
            try {
                // Determine backend URL logic same as other components
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
                const res = await axios.get(`${backendUrl}/api/convert/config`);
                configCache = res.data;
                setConfig(res.data);
            } catch (err) {
                console.error("Failed to load conversion config:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const getFormatInfo = (ext) => {
        if (!config || !config.formats || !ext) return null;
        return config.formats[ext.toLowerCase()];
    };

    const getValidTargets = (sourceExt) => {
        if (!config || !sourceExt) return [];
        const source = getFormatInfo(sourceExt);
        if (!source) return [];

        const validTargets = [];

        Object.keys(config.formats).forEach(targetExt => {
            if (sourceExt.toLowerCase() === targetExt) return; // Skip self

            const target = config.formats[targetExt];

            // Replicate Backend Logic for Client-Side Filtering
            // 1. Category Check
            if (source.category !== target.category) {
                // Exceptions
                if (source.category === 'video' && target.category === 'audio') {
                    validTargets.push(targetExt);
                    return;
                }
                if ((source.category === 'document' || source.category === 'vector') && target.category === 'image') {
                    validTargets.push(targetExt);
                    return;
                }
                return;
            }

            // 2. Tier Check (Block Upgrades from lower tiers)
            // Tiers: Container=0, Source=1, Editable=2, Delivery=3, Flattened=4
            // Block if Source > Target (e.g. 4 > 1) EXCEPT if Target is Container (0)
            if (source.tier > target.tier && target.tier !== 0) {
                // Exception: Allow Audio/Video Upscaling (mirrors backend)
                const isAudio = source.category === 'audio' && target.category === 'audio';
                const isVideo = source.category === 'video' && target.category === 'video';

                if (!isAudio && !isVideo) {
                    return; // Blocked
                }
            }

            // If passed checks, it's either Allowed or Warning (both shown)
            validTargets.push(targetExt.toUpperCase());
        });

        return validTargets;
    };

    return {
        config,
        loading,
        error,
        getFormatInfo,
        getValidTargets
    };
};
