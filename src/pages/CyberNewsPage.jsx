import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const CyberNewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Using rss2json to convert The Hacker News RSS feed to JSON
                // This avoids CORS issues and requires no API key for basic usage
                const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews');
                const data = await response.json();

                if (data.status === 'ok') {
                    setNews(data.items);
                } else {
                    throw new Error('Failed to load news feed');
                }
            } catch (err) {
                setError('Could not load the latest threat intelligence. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Helper to strip HTML tags from description if needed, though usually rss2json handles it well.
    // Ideally we just display the snippet.
    const createSnippet = (htmlContent) => {
        const div = document.createElement("div");
        div.innerHTML = htmlContent;
        const text = div.textContent || div.innerText || "";
        return text.length > 150 ? text.substring(0, 150) + "..." : text;
    };

    return (
        <>
            <Header title="Cyber News" subtitle="Latest threat intelligence and cybersecurity updates." />

            <div className="space-y-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Icon name="refreshCw" className="w-10 h-10 text-accent animate-spin mb-4" />
                        <p className="text-text-secondary">Fetching latest intel...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-danger/10 border border-danger text-danger p-4 rounded-lg flex items-center gap-3">
                        <Icon name="alertTriangle" className="w-6 h-6" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item, index) => (
                        <Card key={index} className="flex flex-col h-full overflow-hidden hover:shadow-glow-accent transition-shadow duration-300">
                            {item.thumbnail && (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                                    <Icon name="calendar" className="w-3 h-3" />
                                    <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                                    <span className="mx-1">•</span>
                                    <span className="text-accent">{item.author}</span>
                                </div>

                                <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>

                                <p className="text-text-secondary text-sm mb-6 flex-grow">
                                    {createSnippet(item.description)}
                                </p>

                                <Button
                                    onClick={() => window.open(item.link, '_blank')}
                                    className="w-full mt-auto"
                                    variant="secondary"
                                >
                                    Read Full Story
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CyberNewsPage;
