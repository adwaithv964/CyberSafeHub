import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../components/Icon';

const SocialMediaPrivacyAdvisor = () => {
    const [platform, setPlatform] = useState('whatsapp');
    // Track checked items as { 'platform-id': boolean }
    const [checkedItems, setCheckedItems] = useState({});

    const privacyData = {
        whatsapp: {
            name: 'WhatsApp',
            color: 'bg-green-500',
            icon: 'whatsapp',
            image: 'https://img.freepik.com/premium-psd/whatsapp-icon-transparent-background_943194-19080.jpg?semt=ais_hybrid&w=740&q=80',
            items: [
                { id: 'wa1', text: "Run Privacy Checkup", risk: 'High', impact: "Guides you through important privacy settings.", url: "https://faq.whatsapp.com/584260336829707" },
                { id: 'wa2', text: "Turn on Two-Step Verification", risk: 'Critical', impact: "Prevents account hijacking even with SIM swap.", url: "https://faq.whatsapp.com/1267268060853765" },
                { id: 'wa3', text: "Limit 'Last Seen' and 'Online'", risk: 'Medium', impact: "Stops contacts from tracking your usage patterns.", url: "https://faq.whatsapp.com/584260336829707" },
                { id: 'wa4', text: "Hide Profile Photo from Strangers", risk: 'Low', impact: "Protects your identity from unknown numbers.", url: "https://faq.whatsapp.com/584260336829707" },
                { id: 'wa5', text: "Control Group Adds", risk: 'Medium', impact: "Prevents being added to spam groups.", url: "https://faq.whatsapp.com/584260336829707" }
            ]
        },
        instagram: {
            name: 'Instagram',
            color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
            icon: 'instagram',
            image: 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjk4Mi1kMy0wNC5wbmc.png',
            items: [
                { id: 'ig1', text: "Set your account to Private", risk: 'High', impact: "Ensures only approved followers see your content.", url: "https://www.instagram.com/accounts/privacy_and_security/" },
                { id: 'ig2', text: "Turn on two-factor authentication (2FA)", risk: 'Critical', impact: "Prevents unauthorized access.", url: "https://www.instagram.com/accounts/two_factor_authentication/" },
                { id: 'ig3', text: "Control who can reply to your stories", risk: 'Low', impact: "Reduces harassment and unwanted messages.", url: "https://www.instagram.com/accounts/privacy_and_security/" },
                { id: 'ig4', text: "Limit who can tag you in photos", risk: 'Medium', impact: "Prevents spam and embarrassing associations.", url: "https://www.instagram.com/accounts/privacy_and_security/" },
                { id: 'ig5', text: "Block unwanted accounts", risk: 'Low', impact: "Immediate relief from harassers.", url: "https://www.instagram.com/accounts/privacy_and_security/" }
            ]
        },
        facebook: {
            name: 'Facebook',
            color: 'bg-blue-600',
            icon: 'facebook',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
            items: [
                { id: 'fb1', text: "Review who can see your future posts", risk: 'High', impact: "Prevents strangers from stalking your daily activity.", url: "https://www.facebook.com/settings?tab=privacy" },
                { id: 'fb2', text: "Limit the audience for past posts", risk: 'Medium', impact: "Retroactively secures old public posts.", url: "https://www.facebook.com/settings?tab=privacy" },
                { id: 'fb3', text: "Turn on two-factor authentication (2FA)", risk: 'Critical', impact: "Essential protection against hacking.", url: "https://www.facebook.com/security/2fac/setup/intro" },
                { id: 'fb4', text: "Control who can send you friend requests", risk: 'Medium', impact: "Reduces spam and fake profile connections.", url: "https://www.facebook.com/settings?tab=privacy" },
                { id: 'fb5', text: "Review and remove unwanted app permissions", risk: 'High', impact: "Stops third-party apps from leaking your data.", url: "https://www.facebook.com/settings?tab=applications" }
            ]
        },
        twitter: {
            name: 'X (Twitter)',
            color: 'bg-black',
            icon: 'twitter',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fj1vqat9XLO4cFwOG1uFqLXYDcISiYil2w&s',
            items: [
                { id: 'tw1', text: "Protect your posts (make account private)", risk: 'High', impact: "Only followers can see your tweets.", url: "https://twitter.com/settings/safety" },
                { id: 'tw2', text: "Turn on two-factor authentication (2FA)", risk: 'Critical', impact: "Vital account security.", url: "https://twitter.com/settings/account/login_verification" },
                { id: 'tw3', text: "Control who can tag you in photos", risk: 'Medium', impact: "Protects your identity in others' content.", url: "https://twitter.com/settings/safety" },
                { id: 'tw4', text: "Disable location sharing in tweets", risk: 'High', impact: "Prevents real-world physical tracking.", url: "https://twitter.com/settings/safety" },
                { id: 'tw5', text: "Review connected apps", risk: 'High', impact: "Revokes access from old, potentially compromised tools.", url: "https://twitter.com/settings/connected_apps" }
            ]
        }
    };

    const handleCheck = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Calculate Scores based on checked items vs total items for the platform
    const calculatePlatformScore = (platKey) => {
        const items = privacyData[platKey].items;
        const checkedCount = items.filter(i => checkedItems[i.id]).length;
        return Math.round((checkedCount / items.length) * 100);
    };

    const currentScore = calculatePlatformScore(platform);

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="shield" className="w-8 h-8 text-blue-500" />
                        Social Media Privacy Advisor
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Optimize your privacy settings to reduce your digital footprint.
                    </p>
                </div>

                {/* Score Card */}
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Privacy Shield</p>
                        <p className={`text-2xl font-bold ${currentScore === 100 ? 'text-green-500' : currentScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {currentScore}%
                        </p>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-600" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (175.9 * currentScore) / 100}
                                className={`${currentScore === 100 ? 'text-green-500' : currentScore > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name={currentScore === 100 ? 'check' : 'lock'} className={`w-6 h-6 ${currentScore === 100 ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Selection */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {Object.keys(privacyData).map(key => {
                    const data = privacyData[key];
                    const isActive = platform === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setPlatform(key)}
                            className={`relative group flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 min-w-[160px] cursor-pointer
                                ${isActive
                                    ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-glow-blue`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800'
                                }
                            `}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-md ${!data.image && data.color}`}>
                                {data.image ? (
                                    <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Icon name={data.icon} className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="text-left">
                                <span className={`block font-bold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {data.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {calculatePlatformScore(key)}% Secure
                                </span>
                            </div>
                            {/* Active Indicator */}
                            {isActive && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg rounded-tr-lg animate-pulse" />}
                        </button>
                    );
                })}
            </div>

            {/* Checklist */}
            <div className="space-y-4 animate-fadeIn">
                <h4 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-100 mb-4 flex justify-between items-center">
                    <span>{privacyData[platform].name} Checklist</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {privacyData[platform].items.filter(i => !checkedItems[i.id]).length} risks remaining
                    </span>
                </h4>

                {privacyData[platform].items.map((item) => (
                    <div
                        key={item.id}
                        className={`group p-5 rounded-xl border transition-all duration-300 ${checkedItems[item.id]
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 opacity-75'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="pt-1">
                                <button
                                    onClick={() => handleCheck(item.id)}
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checkedItems[item.id]
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
                                        }`}
                                >
                                    {checkedItems[item.id] && <Icon name="check" className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h5 className={`font-semibold text-base ${checkedItems[item.id] ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                                        {item.text}
                                    </h5>
                                    {!checkedItems[item.id] && (
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRiskColor(item.risk)}`}>
                                            {item.risk} Risk
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.impact}</p>

                                {!checkedItems[item.id] && item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300"
                                    >
                                        Fix Now <Icon name="external-link" className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {privacyData[platform].items.every(i => checkedItems[i.id]) && (
                    <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 animate-slideUp">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="check" className="w-8 h-8 text-green-600 dark:text-green-300" />
                        </div>
                        <h4 className="text-xl font-bold text-green-800 dark:text-green-100">All Systems Secure!</h4>
                        <p className="text-green-600 dark:text-green-300">You've successfully addressed all privacy recommendations for {privacyData[platform].name}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const QuizModule = () => {
    // Expanded Question Bank
    const allQuestions = [
        { id: 1, question: "You receive an email from your bank asking you to click a link to verify your account details. What should you do?", options: ["Click the link and enter your details.", "Ignore the email.", "Go to your bank's website directly by typing the address in your browser.", "Reply with your account details."], answer: 2 },
        { id: 2, question: "What is a common sign of a phishing website?", options: ["It uses HTTPS.", "The URL is misspelled (e.g., 'paypa1.com').", "It has the company's logo.", "It loads quickly."], answer: 1 },
        { id: 3, question: "An email with a subject line 'URGENT: Your Account is Suspended!' is likely:", options: ["A legitimate warning.", "A standard notification.", "A phishing attempt using urgency.", "A mistake."], answer: 2 },
        { id: 4, question: "Two-factor authentication (2FA) adds a second layer of security. What does it typically require?", options: ["Two different passwords.", "A password and something you have (like your phone).", "A password and a security question.", "A fingerprint and face scan."], answer: 1 },
        { id: 5, question: "Which of these is the strongest password?", options: ["Password123", "12345678", "Tr0ub4dor&3", "MyP@ssword!"], answer: 2 },
        { id: 6, question: "You get a text message with a link to claim a prize. You should:", options: ["Click it to see what you won.", "Forward it to friends.", "Delete it without clicking the link.", "Reply 'STOP' to the message."], answer: 2 },
        { id: 7, question: "What does the 'S' in HTTPS stand for?", options: ["Safe", "Secure", "Standard", "Special"], answer: 1 },
        { id: 8, question: "If a stranger on social media offers you a great deal that seems too good to be true, it is probably:", options: ["Your lucky day.", "A legitimate business offer.", "A scam.", "A marketing test."], answer: 2 },
        { id: 9, question: "You download a free game, but it asks for permission to access your contacts and messages. This could be:", options: ["A standard feature for all games.", "A way to connect with friends.", "Malware trying to steal your data.", "A bug in the app store."], answer: 2 },
        { id: 10, question: "The safest way to handle an unexpected email attachment is to:", options: ["Open it to see what it is.", "Scan it with antivirus software before opening.", "Forward it to IT to check.", "Delete the email, especially if you don't know the sender."], answer: 3 },
        { id: 11, question: "A 'Brute Force' attack involves:", options: ["Physically breaking into a server room.", "Guessing passwords by trying millions of combinations.", "Sending polite emails asking for access.", "Overloading a network with traffic."], answer: 1 },
        { id: 12, question: "What is 'Social Engineering'?", options: ["Building social media apps.", "Manipulating people into giving up confidential information.", "Programming for social good.", "Organizing social events."], answer: 1 },
        { id: 13, question: "You find a USB drive in the parking lot at work. You should:", options: ["Plug it in to see who it belongs to.", "Throw it in the trash.", "Give it to the IT security team.", "Take it home."], answer: 2 },
        { id: 14, question: "Why is public Wi-Fi generally considered erroneously unsafe?", options: ["It is slower.", "Data transmitted can be easily intercepted by bad actors.", "It costs money.", "It blocks social media."], answer: 1 },
        { id: 15, question: "What acts as a barrier between your private network and the internet?", options: ["Anti-virus", "Firewall", "Router", "Modem"], answer: 1 }
    ];

    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState('LOADING'); // LOADING, ACTIVE, SUMMARY, BONUS
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // { index: answerValue }
    const [streak, setStreak] = useState(0);
    const [aiMessage, setAiMessage] = useState("Initializing Cyber-Defense Protocol...");

    // History State
    const [quizHistory, setQuizHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        // Load streak
        const savedStreak = localStorage.getItem('quiz_streak');
        if (savedStreak) setStreak(parseInt(savedStreak, 10));

        // Load History
        const savedHistory = localStorage.getItem('quiz_history');
        if (savedHistory) {
            try {
                setQuizHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }

        // Simulate AI Load
        const messages = [
            "Scanning latest threat reports...",
            "Synthesizing new phishing scenarios...",
            "Encrypting question data...",
            "Challenge Generated."
        ];

        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            if (msgIndex < messages.length) {
                setAiMessage(messages[msgIndex]);
                msgIndex++;
            }
        }, 600);

        setTimeout(() => {
            clearInterval(msgInterval);
            generateDailyChallenge();
            setLoading(false);
            setPhase('ACTIVE');
        }, 2500);

    }, []);

    const generateDailyChallenge = () => {
        // Simple shuffle for "random every time"
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        setActiveQuestions(shuffled);
    };

    const handleAnswer = (optionIndex) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const nextQuestion = () => {
        // If we just finished the Daily 5 (Index 4 -> 5)
        if (currentQuestionIndex === 4 && phase === 'ACTIVE') {
            setPhase('SUMMARY');
        } else if (currentQuestionIndex < activeQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of all questions
            setPhase('SUMMARY');
        }
    };

    const handleSubmitDaily = () => {
        // Save streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('quiz_streak', newStreak.toString());

        // Save to History
        const currentScore = calculateScore(5); // 5 for Daily Challenge
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            score: currentScore,
            total: 5,
            type: 'Daily Challenge',
            xp: currentScore * 10
        };

        const updatedHistory = [newEntry, ...quizHistory];
        setQuizHistory(updatedHistory);
        localStorage.setItem('quiz_history', JSON.stringify(updatedHistory));

        setPhase('SUMMARY'); // Ensure we stay/refresh Summary
        alert(`Great job! Streak increased to ${newStreak}. History updated.`);
    };

    const handleClearHistory = () => {
        if (confirm("Are you sure you want to clear all quiz history and reset your streak? This action cannot be undone.")) {
            localStorage.removeItem('quiz_history');
            localStorage.removeItem('quiz_streak');
            setQuizHistory([]);
            setStreak(0);
            setShowHistory(false);
        }
    };

    const startBonusRound = () => {
        setPhase('BONUS');
        setCurrentQuestionIndex(5);
    };

    const calculateScore = (count) => {
        let correct = 0;
        for (let i = 0; i < count; i++) {
            if (userAnswers[i] === activeQuestions[i].answer) correct++;
        }
        return correct;
    };

    // HISTORY VIEW
    if (showHistory) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn relative">
                <button
                    onClick={() => setShowHistory(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <Icon name="x" className="w-6 h-6 text-gray-500" />
                </button>

                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <Icon name="clock" className="w-6 h-6 text-blue-500" />
                    Quiz History
                </h3>

                {quizHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Icon name="archive" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No history found. Start a daily challenge!</p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {quizHistory.map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="font-bold text-gray-700 dark:text-gray-200">{entry.type}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className={`font-bold ${entry.score === entry.total ? 'text-green-500' : 'text-blue-500'}`}>
                                            {entry.score}/{entry.total}
                                        </span>
                                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                                            +{entry.xp} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                        onClick={handleClearHistory}
                        className="text-red-500 hover:text-red-600 text-sm font-semibold flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <Icon name="trash" className="w-4 h-4" /> Clear All History
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 animate-pulse">{aiMessage}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">AI is curating your personalized security challenge.</p>
            </div>
        );
    }

    // Determine current questions scope based on phase
    const isBonus = phase === 'BONUS';
    // If in Summary, we show results for the set we just finished
    // If ACTIVE, we show Q 0-4. If BONUS, we show Q 5-end.

    if (phase === 'SUMMARY') {
        // Did we finish Daily 5 or everything?
        // If currentQuestionIndex is 4, we finished Daily 5.
        // If > 4, we finished Bonus.
        const isDailyFinish = currentQuestionIndex === 4;
        const totalSample = isDailyFinish ? 5 : activeQuestions.length;
        const currentScore = calculateScore(currentQuestionIndex + 1); // +1 because index is 0-based
        const percentage = Math.round((currentScore / totalSample) * 100);

        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center animate-fadeIn">
                <div className="flex justify-end mb-4">
                    <span className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full text-sm">
                        <Icon name="fire" className="w-4 h-4" /> {streak} Day Streak
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {isDailyFinish ? "Daily Challenge Complete!" : "Bonus Round Complete!"}
                </h3>
                <div className="w-32 h-32 mx-auto my-6 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                            strokeDasharray={351.8}
                            strokeDashoffset={351.8 - (351.8 * percentage) / 100}
                            className={`${percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <span className="absolute text-3xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    You got {currentScore} out of {totalSample} correct.
                    {percentage >= 80 ? " Outstanding work agent!" : " Keep training to sharpen your instincts."}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={handleSubmitDaily} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                        Submit & Claim Reward
                    </button>
                    {isDailyFinish && (
                        <button onClick={startBonusRound} className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
                            <Icon name="zap" className="w-5 h-5" /> Continue (Bonus)
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return null; // Should not happen

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${isBonus ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {isBonus ? "Bonus Round" : "Daily Challenge"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">Security Awareness</h3>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View History"
                    >
                        <Icon name="clock" className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Question</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{currentQuestionIndex + 1} <span className="text-gray-400 text-base">/ {isBonus ? activeQuestions.length : 5}</span></p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${isBonus ? 'bg-purple-500' : 'bg-blue-500'}`}
                    style={{ width: `${((currentQuestionIndex + 1) / (isBonus ? activeQuestions.length : 5)) * 100}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="animate-slideUp">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                    {currentQ.question}
                </p>
                <div className="space-y-3">
                    {currentQ.options.map((option, index) => {
                        const isSelected = userAnswers[currentQuestionIndex] === index;
                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group
                                    ${isSelected
                                        ? (isBonus ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20' : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20')
                                        : 'bg-white border-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                    ${isSelected
                                        ? (isBonus ? 'border-purple-500 bg-purple-500 text-white' : 'border-blue-500 bg-blue-500 text-white')
                                        : 'border-gray-300 dark:border-gray-500 group-hover:border-gray-400'
                                    }
                                `}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="text-right mt-8">
                    <button
                        onClick={nextQuestion}
                        disabled={userAnswers[currentQuestionIndex] === undefined}
                        className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                            ${isBonus ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}
                        `}
                    >
                        {currentQuestionIndex === (isBonus ? activeQuestions.length - 1 : 4) ? 'Finish & Review' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DigitalPrivacyPage = () => {
    const [activeTab, setActiveTab] = useState('advisor');

    const TabButton = ({ tabName, children }) => (<button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{children}</button>);

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Digital Privacy</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your online footprint and test your security awareness.</p>
            </header>
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <TabButton tabName="advisor">Social Media Advisor</TabButton>
                    <TabButton tabName="quiz">Awareness Quiz</TabButton>
                </div>
            </div>
            <div>
                {activeTab === 'advisor' ? <SocialMediaPrivacyAdvisor /> : <QuizModule />}
            </div>
        </>
    );
};

export default DigitalPrivacyPage;
