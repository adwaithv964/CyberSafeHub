/**
 * Shared Security Scanner Logic
 */

// --- 1. IP & Network Scanner ---
export const checkIpInfo = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch IP data');
        const data = await response.json();

        // Heuristic to detect VPN/Datacenter
        const keywords = ['VPN', 'Hosting', 'Cloud', 'M247', 'Datacamp', 'DigitalOcean', 'Linode', 'AWS', 'Google', 'Microsoft', 'Oracle', 'Leaseweb', 'Hetzner', 'OVH', 'NForce', 'Choopa', 'Vultr', 'Contabo', 'Hostinger', 'Tencent', 'Alibaba'];
        const isVpn = data.org ? keywords.some(keyword => data.org.toLowerCase().includes(keyword.toLowerCase())) : false;

        return {
            raw: data,
            isVpn,
            isSafe: isVpn, // "Safe" implies identity is masked
            verdict: isVpn ? 'Protected' : 'Exposed',
            details: isVpn ? 'Your IP appears to be from a VPN or Hosting provider.' : 'Your IP appears to be a residential line, which may expose your location.'
        };
    } catch (err) {
        console.error("IP Check Error:", err);
        throw err;
    }
};

// --- 2. Breach Scanner (XposedOrNot) ---
export const checkBreaches = async (email) => {
    if (!email) return null;
    try {
        const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`);

        if (response.status === 404) {
            return { found: false, breaches: [] };
        }

        if (response.ok) {
            const data = await response.json();
            if (data.Error || !data.ExposedBreaches || !data.ExposedBreaches.breaches_details) {
                return { found: false, breaches: [] };
            }
            const breachList = data.ExposedBreaches.breaches_details.map(b => ({
                name: b.breach,
                details: `${b.details} Data: ${b.xposed_data}. Date: ${b.xposed_date}.`,
                logo: b.logo
            }));
            return { found: true, breaches: breachList };
        }

        throw new Error(`API Request Failed: ${response.status}`);
    } catch (err) {
        console.error("Breach Check Error:", err);
        throw err;
    }
};

// --- 3. Browser & Device Scanner ---
export const checkBrowserSecurity = () => {
    const findings = [];
    let scoreImpact = 0;

    // A. HTTPS Check
    if (window.location.protocol === 'https:') {
        // findings.push({ text: "Connection is secure (HTTPS)", severity: 'low' });
    } else {
        findings.push({ text: "Connection is NOT secure (HTTP)", severity: 'high' });
        scoreImpact -= 20;
    }

    // B. Cookies
    if (!navigator.cookieEnabled) {
        findings.push({ text: "Cookies are disabled (Good for privacy, bad for usability)", severity: 'low' });
    }

    return {
        findings,
        scoreImpact,
        details: {
            cookies: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
            protocol: window.location.protocol
        }
    };
};

// --- 4. Password Strength ---
export const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-gray-200' };

    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthLevels = [
        { label: 'Very Weak', color: 'bg-red-500' },
        { label: 'Weak', color: 'bg-orange-500' },
        { label: 'Medium', color: 'bg-yellow-500' },
        { label: 'Strong', color: 'bg-green-500' },
        { label: 'Very Strong', color: 'bg-emerald-500' },
    ];

    const finalScore = Math.floor((score / 5) * 100);
    const levelIndex = Math.min(Math.floor(score), 4);

    return { score: finalScore, ...strengthLevels[levelIndex] };
};

// --- 5. Battery Fingerprinting Check ---
export const checkBatteryFingerprinting = async () => {
    // Check removed by user request
    return { exposed: false, message: 'Battery API check disabled' };
};

// --- 6. Cyber Hygiene (Simulated Check) ---
export const checkCyberHygiene = () => {
    // Detects common bad habits like storing sensitive data in localStorage
    // or reusing "password" related keys
    const findings = [];
    let scoreImpact = 0;

    // Check 1: Sensitive keys in localStorage
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
    let foundSensitive = false;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i).toLowerCase();
        if (sensitiveKeys.some(s => key.includes(s))) {
            foundSensitive = true;
            break;
        }
    }

    if (foundSensitive) {
        findings.push({ text: "Sensitive data (tokens/passwords) found in Local Storage", severity: 'medium' });
        scoreImpact -= 10;
    }

    return { findings, scoreImpact };
};
