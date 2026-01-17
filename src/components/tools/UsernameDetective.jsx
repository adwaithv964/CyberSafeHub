import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { API_BASE_URL } from '../../config';

// Site definitions with logic for checking
// Note: Client-side checking is limited by CORS. We use image loading where possible.
// For others, we provide a direct link.
const SITES = [
    { name: 'GitHub', url: 'https://github.com/USERNAME', icon: 'github', checkType: 'image', checkUrl: 'https://github.com/USERNAME.png' },
    { name: 'GitLab', url: 'https://gitlab.com/USERNAME', icon: 'gitlab', checkType: 'image', checkUrl: 'https://gitlab.com/USERNAME.png' },
    { name: 'Reddit', url: 'https://www.reddit.com/user/USERNAME', icon: 'reddit', checkType: 'link' }, // Redditavatars restricted
    { name: 'Instagram', url: 'https://www.instagram.com/USERNAME', icon: 'instagram', checkType: 'link' },
    { name: 'Twitter', url: 'https://twitter.com/USERNAME', icon: 'twitter', checkType: 'link' },
    { name: 'Facebook', url: 'https://www.facebook.com/USERNAME', icon: 'facebook', checkType: 'link' },
    { name: 'YouTube', url: 'https://www.youtube.com/@USERNAME', icon: 'youtube', checkType: 'link' },
    { name: 'Twitch', url: 'https://www.twitch.tv/USERNAME', icon: 'twitch', checkType: 'link' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@USERNAME', icon: 'video', checkType: 'link' },
    { name: 'Pinterest', url: 'https://www.pinterest.com/USERNAME/', icon: 'image', checkType: 'link' },
    { name: 'Medium', url: 'https://medium.com/@USERNAME', icon: 'book', checkType: 'link' },
    { name: 'Dev.to', url: 'https://dev.to/USERNAME', icon: 'code', checkType: 'image', checkUrl: 'https://dev.to/USERNAME' }, // Check via status? No CORS.
    { name: 'Vimeo', url: 'https://vimeo.com/USERNAME', icon: 'video', checkType: 'link' },
    { name: 'SoundCloud', url: 'https://soundcloud.com/USERNAME', icon: 'music', checkType: 'link' },
    { name: 'Spotify', url: 'https://open.spotify.com/user/USERNAME', icon: 'music', checkType: 'link' },
    { name: 'Steam', url: 'https://steamcommunity.com/id/USERNAME', icon: 'gamepad', checkType: 'link' },
    { name: 'Roblox', url: 'https://www.roblox.com/user.aspx?username=USERNAME', icon: 'gamepad', checkType: 'link' },
    { name: 'CodePen', url: 'https://codepen.io/USERNAME', icon: 'codepen', checkType: 'link' },
    { name: 'Replit', url: 'https://replit.com/@USERNAME', icon: 'terminal', checkType: 'link' },
    { name: 'HackerRank', url: 'https://www.hackerrank.com/USERNAME', icon: 'code', checkType: 'link' },
    { name: 'LeetCode', url: 'https://leetcode.com/USERNAME', icon: 'code', checkType: 'link' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com/users/USERNAME', icon: 'layers', checkType: 'link' },
    { name: 'Dribbble', url: 'https://dribbble.com/USERNAME', icon: 'image', checkType: 'link' },
    { name: 'Behance', url: 'https://www.behance.net/USERNAME', icon: 'image', checkType: 'link' },
    { name: 'Flickr', url: 'https://www.flickr.com/people/USERNAME/', icon: 'image', checkType: 'link' },
    { name: 'ProductHunt', url: 'https://www.producthunt.com/@USERNAME', icon: 'search', checkType: 'link' },
    { name: 'Telegram', url: 'https://t.me/USERNAME', icon: 'send', checkType: 'link' },
    { name: 'Slack', url: 'https://USERNAME.slack.com', icon: 'slack', checkType: 'link' },
    { name: 'Discord', url: '#', icon: 'messageCircle', checkType: 'manual', note: 'Search via Add Friend' },
    { name: 'Gravatar', url: 'https://en.gravatar.com/USERNAME', icon: 'user', checkType: 'image', checkUrl: 'https://gravatar.com/avatar/USERNAME?d=404' },
    { name: 'Keybase', url: 'https://keybase.io/USERNAME', icon: 'key', checkType: 'image', checkUrl: 'https://keybase.io/USERNAME/picture' },
    { name: 'About.me', url: 'https://about.me/USERNAME', icon: 'user', checkType: 'link' },
    { name: 'Linktree', url: 'https://linktr.ee/USERNAME', icon: 'link', checkType: 'link' },
    { name: 'BuyMeACoffee', url: 'https://www.buymeacoffee.com/USERNAME', icon: 'coffee', checkType: 'link' },
    { name: 'Patreon', url: 'https://www.patreon.com/USERNAME', icon: 'dollarSign', checkType: 'link' },
    { name: 'Ko-fi', url: 'https://ko-fi.com/USERNAME', icon: 'coffee', checkType: 'link' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/User:USERNAME', icon: 'book', checkType: 'link' },
    { name: 'Pastebin', url: 'https://pastebin.com/u/USERNAME', icon: 'clipboard', checkType: 'link' },
    { name: 'Wattpad', url: 'https://www.wattpad.com/user/USERNAME', icon: 'book', checkType: 'link' },
    { name: 'Canva', url: 'https://www.canva.com/p/USERNAME', icon: 'image', checkType: 'link' },
    { name: 'Etsy', url: 'https://www.etsy.com/people/USERNAME', icon: 'shoppingBag', checkType: 'link' },
    { name: 'eBay', url: 'https://www.ebay.com/usr/USERNAME', icon: 'shoppingBag', checkType: 'link' },
    { name: 'Amazon', url: 'https://www.amazon.com/gp/profile/amzn1.account.USERNAME', icon: 'shoppingBag', checkType: 'manual', note: 'Requires ID not username usually' },
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com/members/USERNAME', icon: 'map', checkType: 'link' },
    { name: 'Yelp', url: 'https://www.yelp.com/user_details?userid=USERNAME', icon: 'map', checkType: 'manual', note: 'Uses User ID' },
    { name: 'PayPal', url: 'https://www.paypal.com/paypalme/USERNAME', icon: 'dollarSign', checkType: 'link' },
    { name: 'Venmo', url: 'https://venmo.com/USERNAME', icon: 'dollarSign', checkType: 'link' },
    { name: 'CashApp', url: 'https://cash.app/$USERNAME', icon: 'dollarSign', checkType: 'link' },
    { name: 'Gumroad', url: 'https://gumroad.com/USERNAME', icon: 'shoppingCart', checkType: 'link' },
    { name: 'Substack', url: 'https://USERNAME.substack.com', icon: 'book', checkType: 'link' }
];

export default function UsernameDetective({ onNavigate }) {
    const [username, setUsername] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState({});
    const [progress, setProgress] = useState(0);

    const checkSite = async (site, targetUser) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/osint/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: targetUser, site })
            });

            if (!response.ok) {
                // If backend check fails (e.g. server down), return error status
                return { status: 'error' };
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("OSINT Check Error:", err);
            return { status: 'error' };
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsSearching(true);
        setResults({});
        setProgress(0);

        const targetUser = username.trim();
        let completed = 0;

        // Process in batches to show progress
        const batchSize = 5;
        for (let i = 0; i < SITES.length; i += batchSize) {
            const batch = SITES.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (site) => {
                    const result = await checkSite(site, targetUser);
                    return { ...site, ...result };
                })
            );

            setResults(prev => {
                const newResults = { ...prev };
                batchResults.forEach(res => {
                    newResults[res.name] = res;
                });
                return newResults;
            });

            completed += batch.length;
            setProgress(Math.min(100, Math.round((completed / SITES.length) * 100)));

            // Random delay for effect
            await new Promise(r => setTimeout(r, 200));
        }

        setIsSearching(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate && onNavigate('tools')}
                    className="p-2 rounded-lg bg-glass-panel border border-glass-border hover:border-accent hover:text-accent transition-colors"
                >
                    <Icon name="arrowLeft" className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Icon name="search" className="w-8 h-8 text-accent" />
                        OSINT Username Detective
                    </h1>
                    <p className="text-text-secondary">Investigate username presence across {SITES.length}+ platforms.</p>
                </div>
            </div>

            {/* Search Input */}
            <div className="glass-panel p-8 rounded-xl border border-glass-border relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                <form onSubmit={handleSearch} className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Icon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter target username..."
                                className="w-full bg-black/40 border border-glass-border rounded-lg pl-12 pr-4 py-4 text-lg text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !username}
                            className={`px-8 rounded-lg font-semibold flex items-center gap-2 transition-all ${isSearching || !username
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-accent text-black hover:bg-accent-hover hover:shadow-glow-accent'
                                }`}
                        >
                            {isSearching ? (
                                <Icon name="refreshCw" className="w-5 h-5 animate-spin" />
                            ) : (
                                <Icon name="search" className="w-5 h-5" />
                            )}
                            Investigate
                        </button>
                    </div>
                </form>

                {isSearching && (
                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="flex justify-between text-sm text-text-secondary mb-2">
                            <span>Scanning databases...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Results Grid */}
            {Object.keys(results).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {SITES.map((site) => {
                            const result = results[site.name];
                            if (!result) return null;

                            return (
                                <motion.div
                                    key={site.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${result.status === 'found'
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : result.status === 'not_found'
                                            ? 'bg-red-500/5 border-red-500/10 opacity-60'
                                            : 'bg-glass-panel border-glass-border'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.status === 'found' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-text-secondary'
                                        }`}>
                                        <Icon name={site.icon} className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-text-primary">{site.name}</h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            {result.status === 'found' && <span className="text-green-400 font-mono">DETECTED</span>}
                                            {result.status === 'not_found' && <span className="text-red-400 font-mono">NOT FOUND</span>}
                                            {result.status === 'potential' && <span className="text-yellow-400 font-mono">POTENTIAL</span>}
                                            {result.status === 'error' && <span className="text-gray-500 font-mono">ERROR</span>}
                                        </div>
                                    </div>

                                    {(result.status === 'found' || result.status === 'potential') && (
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                                            title="Open Profile"
                                        >
                                            <Icon name="externalLink" className="w-4 h-4" />
                                        </a>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
