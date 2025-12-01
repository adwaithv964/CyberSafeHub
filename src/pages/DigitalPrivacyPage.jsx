import React, { useState } from 'react';

const SocialMediaPrivacyAdvisor = () => {
    const [platform, setPlatform] = useState('facebook');
    const privacyData = {
        facebook: [
            "Review who can see your future posts.",
            "Limit the audience for past posts.",
            "Turn on two-factor authentication (2FA).",
            "Control who can send you friend requests.",
            "Review and remove unwanted app permissions."
        ],
        instagram: [
            "Set your account to Private.",
            "Turn on two-factor authentication (2FA).",
            "Control who can reply to your stories.",
            "Limit who can tag you in photos.",
            "Block unwanted accounts."
        ],
        twitter: [
            "Protect your posts (make your account private).",
            "Turn on two-factor authentication (2FA).",
            "Control who can tag you in photos.",
            "Disable location sharing in your posts.",
            "Review and remove connected apps."
        ]
    };

    const PlatformButton = ({ platformName, children }) => (
        <button onClick={() => setPlatform(platformName)} className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm ${platform === platformName ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {children}
        </button>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Social Media Privacy Advisor</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Select a platform to see a checklist of recommended privacy settings.</p>
            <div className="flex gap-3 mb-6">
                <PlatformButton platformName="facebook">Facebook</PlatformButton>
                <PlatformButton platformName="instagram">Instagram</PlatformButton>
                <PlatformButton platformName="twitter">X (Twitter)</PlatformButton>
            </div>
            <div>
                <h4 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-100 mb-4">{platform} Privacy Checklist</h4>
                <ul className="space-y-3">
                    {privacyData[platform].map((item, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <input type="checkbox" className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600" id={`${platform}-${index}`} />
                            <label htmlFor={`${platform}-${index}`} className="text-gray-700 dark:text-gray-300">{item}</label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const QuizModule = () => {
    const quizQuestions = [
        { question: "You receive an email from your bank asking you to click a link to verify your account details. What should you do?", options: ["Click the link and enter your details.", "Ignore the email.", "Go to your bank's website directly by typing the address in your browser.", "Reply with your account details."], answer: 2 },
        { question: "What is a common sign of a phishing website?", options: ["It uses HTTPS.", "The URL is misspelled (e.g., 'paypa1.com' instead of 'paypal.com').", "It has the company's logo.", "It loads quickly."], answer: 1 },
        { question: "An email with a subject line 'URGENT: Your Account is Suspended!' is likely:", options: ["A legitimate warning.", "A standard notification.", "A phishing attempt using urgency.", "A mistake."], answer: 2 },
        { question: "Two-factor authentication (2FA) adds a second layer of security. What does it typically require?", options: ["Two different passwords.", "A password and something you have (like your phone).", "A password and a security question.", "A fingerprint and face scan."], answer: 1 },
        { question: "Which of these is the strongest password?", options: ["Password123", "12345678", "Tr0ub4dor&3", "MyP@ssword!"], answer: 2 },
        { question: "You get a text message with a link to claim a prize. You should:", options: ["Click it to see what you won.", "Forward it to friends.", "Delete it without clicking the link.", "Reply 'STOP' to the message."], answer: 2 },
        { question: "What does the 'S' in HTTPS stand for?", options: ["Safe", "Secure", "Standard", "Special"], answer: 1 },
        { question: "If a stranger on social media offers you a great deal that seems too good to be true, it is probably:", options: ["Your lucky day.", "A legitimate business offer.", "A scam.", "A marketing test."], answer: 2 },
        { question: "You download a free game, but it asks for permission to access your contacts and messages. This could be:", options: ["A standard feature for all games.", "A way to connect with friends.", "Malware trying to steal your data.", "A bug in the app store."], answer: 2 },
        { question: "The safest way to handle an unexpected email attachment is to:", options: ["Open it to see what it is.", "Scan it with antivirus software before opening.", "Forward it to IT to check.", "Delete the email, especially if you don't know the sender."], answer: 3 }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState(Array(quizQuestions.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (optionIndex) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestion(0);
        setUserAnswers(Array(quizQuestions.length).fill(null));
        setShowResults(false);
    }

    const score = userAnswers.reduce((total, answer, index) => {
        return answer === quizQuestions[index].answer ? total + 1 : total;
    }, 0);

    if (showResults) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quiz Complete!</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">You scored:</p>
                <p className={`text-6xl font-bold my-4 ${score > 7 ? 'text-green-500' : score > 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {score} / {quizQuestions.length}
                </p>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {score > 7 ? "Excellent job! You have a strong understanding of phishing threats." : "Good effort! There are a few areas to review to strengthen your knowledge."}
                </p>
                <button onClick={restartQuiz} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Phishing Awareness Quiz</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Question {currentQuestion + 1} of {quizQuestions.length}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-6">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}></div>
            </div>

            <div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">{quizQuestions[currentQuestion].question}</p>
                <div className="space-y-4">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                        <button key={index} onClick={() => handleAnswer(index)} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${userAnswers[currentQuestion] === index ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-blue-500'}`}>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{option}</span>
                        </button>
                    ))}
                </div>
                <div className="text-right mt-8">
                    <button onClick={nextQuestion} disabled={userAnswers[currentQuestion] === null} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500">
                        {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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
