import React, { useState } from 'react';
import Icon from '../components/Icon';

const EmergencyGuidesPage = () => {
    const [selectedGuide, setSelectedGuide] = useState(null);

    const guides = {
        phished: {
            title: "I've Been Phished",
            description: "You clicked a suspicious link or provided your details on a fake website. Here’s how to respond immediately.",
            steps: [
                { title: "Step 1: Disconnect from the Internet", content: "Immediately disconnect your device from the internet to prevent any further data transmission or malware from spreading." },
                { title: "Step 2: Change Your Password", content: "From a different, trusted device, change the password for the account that was compromised. If you use that password anywhere else, change it there too." },
                { title: "Step 3: Scan for Malware", content: "Run a full scan with your antivirus software to check if anything malicious was installed on your device." },
                { title: "Step 4: Report the Phishing Attempt", content: "Report the email to your email provider and the company that was being impersonated. This helps them take action against the attackers." },
                { title: "Step 5: Monitor Your Accounts", content: "Keep a close eye on your bank statements, credit reports, and online accounts for any suspicious activity." }
            ]
        },
        hacked: {
            title: "My Account Was Hacked",
            description: "You've noticed unauthorized activity or you've been locked out of one of your online accounts. Take these steps now.",
            steps: [
                { title: "Step 1: Try to Reclaim the Account", content: "Use the account recovery process for the service (e.g., 'Forgot Password'). This is often the fastest way to regain control." },
                { title: "Step 2: Change Passwords Everywhere", content: "If you regain access, immediately set a new, strong, unique password. Then, change the passwords for any other accounts that used the same or similar password." },
                { title: "Step 3: Enable Two-Factor Authentication (2FA)", content: "If you haven't already, enable 2FA on all important accounts. This provides a crucial second layer of security." },
                { title: "Step 4: Inform Your Contacts", content: "Let your friends, family, and contacts know that your account was compromised, so they can be wary of any strange messages sent from you." },
                { title: "Step 5: Review Account Activity", content: "Check for any unauthorized posts, messages, or changes made by the hacker and correct them." }
            ]
        },
        ransomware: {
            title: "I Have Ransomware",
            description: "Your files are encrypted, and you see a message demanding payment. It's a stressful situation, but follow these guidelines.",
            steps: [
                { title: "Step 1: Isolate the Infected Device", content: "Disconnect the computer from the network (both wired and wireless) to stop the ransomware from spreading to other devices." },
                { title: "Step 2: Do NOT Pay the Ransom", content: "Law enforcement and security experts advise against paying. There's no guarantee you'll get your files back, and it encourages the criminals." },
                { title: "Step 3: Identify the Ransomware", content: "Use a service like NoMoreRansom.org to identify the type of ransomware. They may have a free decryption tool available." },
                { title: "Step 4: Restore from a Backup", content: "If you have a recent, clean backup of your files, you can restore your system to its pre-infected state. This is the most reliable recovery method." },
                { title: "Step 5: Report the Incident", content: "Report the attack to local law enforcement or a national cybersecurity agency. This helps track and combat ransomware gangs." }
            ]
        }
    };

    if (selectedGuide) {
        const guide = guides[selectedGuide];
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <button onClick={() => setSelectedGuide(null)} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-6 hover:underline">
                    <Icon name="arrowLeft" className="w-5 h-5" />
                    Back to All Guides
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{guide.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">{guide.description}</p>
                <div className="space-y-6">
                    {guide.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{step.title}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{step.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">"What to Do If..." Emergency Guides</h2>
                <p className="text-gray-500 dark:text-gray-400">Step-by-step guides for common cybersecurity emergencies.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(guides).map(key => {
                    const guide = guides[key];
                    return (
                        <button key={key} onClick={() => setSelectedGuide(key)} className="text-left p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all">
                            <Icon name="alertTriangle" className="w-8 h-8 text-red-500 mb-3" />
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{guide.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{guide.description}</p>
                        </button>
                    )
                })}
            </div>
        </>
    );
};

export default EmergencyGuidesPage;
