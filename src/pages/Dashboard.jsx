import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const Dashboard = () => {
    const securityScore = 85;
    const activityItems = [
        { icon: "user", text: "Successful login from Amsterdam, NL", time: "5 minutes ago", color: "text-success" },
        { icon: "link", text: "URL Scan: 'example.com'", time: "1 hour ago", color: "text-accent" },
        { icon: "lock", text: "New password generated", time: "2 days ago", color: "text-indigo-400" },
        { icon: "file", text: "File 'report.docx' scanned: Clean", time: "3 days ago", color: "text-success" }
    ];
    const securityTips = ["Regularly review app permissions on your mobile devices to ensure they only have access to the data they need."];

    return (
        <>
            <Header title="Dashboard" subtitle="Your security command center." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path className="text-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                                <motion.path
                                    className="text-accent drop-shadow-glow-accent"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray="100, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - securityScore }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-text-primary">{securityScore}</span>
                                <span className="text-sm text-text-secondary">/ 100</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary">Security Score: High</h3>
                            <p className="text-text-secondary mt-1">Great job! Your security posture is strong. Complete the roadmap items to improve even more.</p>
                            <Button className="mt-4 text-sm">View Full Report</Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Account Activity</h3>
                        <ul className="space-y-4">
                            {activityItems.map((item, index) => (
                                <li key={index} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full bg-secondary ${item.color}`}><Icon name={item.icon} className="w-5 h-5" /></div>
                                    <div className="flex-grow"><p className="text-text-primary">{item.text}</p></div>
                                    <p className="text-sm text-text-secondary whitespace-nowrap">{item.time}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Your Security Roadmap</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-background"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-text-secondary line-through">Enable 2FA</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-accent rounded-full"></div><span className="text-text-primary font-medium">Secure Social Media</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-border-color rounded-full"></div><span className="text-text-secondary">Update Passwords</span></li>
                        </ul>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-primary to-secondary">
                        <div className="flex items-center gap-3 mb-3"><Icon name="lightbulb" className="w-6 h-6 text-yellow-400" /><h3 className="text-xl font-semibold text-text-primary">Tip of the Day</h3></div>
                        <p className="text-text-secondary">{securityTips[0]}</p>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
