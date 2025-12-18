
export const emergencyGuides = [
    {
        id: 'phished',
        title: "I've Been Phished",
        description: "You clicked a suspicious link or provided details on a fake site.",
        severity: 'high',
        icon: 'alertTriangle',
        color: 'red',
        steps: [
            { id: 'p1', title: "Disconnect Immediately", content: "Turn off Wi-Fi and unplug your ethernet cable to prevent data theft or malware spread." },
            { id: 'p2', title: "Change Passwords", content: "Use a different device to change the password for the compromised account. Update other accounts if you reused that password." },
            { id: 'p3', title: "Enable 2FA", content: "Turn on Two-Factor Authentication immediately for the affected account and your email." },
            { id: 'p4', title: "Scan for Malware", content: "Run a full system scan using your antivirus software." },
            { id: 'p5', title: "Report It", content: "Mark the email as spam/phishing and notify your IT department or the impersonated company." }
        ]
    },
    {
        id: 'hacked',
        title: "Account Hacked",
        description: "Unauthorized activity or locked out of your account.",
        severity: 'critical',
        icon: 'lock',
        color: 'purple',
        steps: [
            { id: 'h1', title: "Recover Account", content: "Use the 'Forgot Password' or account recovery options immediately." },
            { id: 'h2', title: "Secure Email", content: "Check your email account for forwarding rules or unauthorized access. Your email is the key to all other accounts." },
            { id: 'h3', title: "Log Out All Sessions", content: "Find the 'Log out of all devices' option in security settings to kick out the intruder." },
            { id: 'h4', title: "Notify Contacts", content: "Warn friends and family not to click links sent from your account." }
        ]
    },
    {
        id: 'ransomware',
        title: "Ransomware Attack",
        description: "Files are encrypted and a ransom is demanded.",
        severity: 'critical',
        icon: 'shieldOff',
        color: 'orange',
        steps: [
            { id: 'r1', title: "Isolate Device", content: "Disconnect from strict network immediately! Do not plug in external drives." },
            { id: 'r2', title: "Do NOT Pay", content: "Paying encourages attackers and doesn't guarantee data recovery." },
            { id: 'r3', title: "Take Photo of Note", content: "Photograph the ransom note for evidence before turning off the machine if necessary." },
            { id: 'r4', title: "Consult Experts", content: "Visit NoMoreRansom.org from a clean device to check for decryption tools." }
        ]
    },
    {
        id: 'device_stolen',
        title: "Device Stolen",
        description: "Laptop or phone has been lost or stolen.",
        severity: 'high',
        icon: 'smartphone',
        color: 'yellow',
        steps: [
            { id: 'd1', title: "Remote Lock/Wipe", content: "Use 'Find My Device' (Android) or 'Find My' (iOS/Mac) to lock or remotely wipe the device." },
            { id: 'd2', title: "Log Out Remotely", content: "Go to Google/Apple/Microsoft account security pages and sign out the stolen device." },
            { id: 'd3', title: "Change Passwords", content: "Change passwords for email, banking, and social media apps that were logged in." },
            { id: 'd4', title: "Call Carrier", content: "If it's a phone, call your carrier to block the SIM card and IMEI." },
            { id: 'd5', title: "File Police Report", content: "File a report for insurance purposes and potential recovery." }
        ]
    },
    {
        id: 'identity_theft',
        title: "Identity Theft",
        description: "Suspicious credit inquiries or tax filings found.",
        severity: 'medium',
        icon: 'userX',
        color: 'blue',
        steps: [
            { id: 'i1', title: "Freeze Credit", content: "Contact Equifax, Experian, and TransUnion to freeze your credit reports immediately." },
            { id: 'i2', title: "Review Statements", content: "Comb through bank and credit card statements for unauthorized charges." },
            { id: 'i3', title: "Report to Govt", content: "File a report at IdentityTheft.gov (US) or your local equivalent." },
            { id: 'i4', title: "Fraud Alert", content: "Place a fraud alert on your credit file (free and lasts 1 year)." }
        ]
    },
    {
        id: 'suspicious_payment',
        title: "Fraudulent Payment",
        description: "You sent money to a scammer or see a fake charge.",
        severity: 'high',
        icon: 'creditCard',
        color: 'red',
        steps: [
            { id: 's1', title: "Contact Bank", content: "Call your bank/card issuer immediately to reverse the charge or block the card." },
            { id: 's2', title: "Report Transaction", content: "If used an app (PayPal/Venmo), report the specific transaction as fraud within the app." },
            { id: 's3', title: "Monitor Activity", content: "Watch for small 'test' charges that often precede larger thefts." }
        ]
    },
    {
        id: 'sim_swap',
        title: "SIM Swapping",
        description: "Your phone has lost signal completely/you can't make calls.",
        severity: 'high',
        icon: 'phoneOff',
        color: 'purple',
        steps: [
            { id: 'ss1', title: "Call Carrier", content: "Use another phone to call your mobile carrier immediately. Authenticate and ask to lock the SIM." },
            { id: 'ss2', title: "Secure Email", content: "Your email is the first target. Change that password immediately and ensure no recovery numbers were changed." },
            { id: 'ss3', title: "Remove SMS 2FA", content: "Switch your 2-Factor Authentication from SMS to an Authenticator App (like Google Auth or Authy) wherever possible." },
            { id: 'ss4', title: "Check Bank", content: "Attackers often target bank accounts next. Monitor closely for transactions." }
        ]
    },
    {
        id: 'doxxing',
        title: "I've Been Doxxed",
        description: "Your private address, phone, or info was posted publicly.",
        severity: 'medium',
        icon: 'eye',
        color: 'orange',
        steps: [
            { id: 'dx1', title: "Document Evidence", content: "Take screenshots of the posts immediately before they are deleted. You may need this for law enforcement." },
            { id: 'dx2', title: "Report to Platform", content: "Report the content/user to the social media platform or website hosting it as a Terms of Service violation." },
            { id: 'dx3', title: "Lock Down Socials", content: "Make your social media accounts private. Remove personal info from bios." },
            { id: 'dx4', title: "Alert Employer/Family", content: "Depending on severity, let your workplace or family know so they don't react to malicious calls." }
        ]
    },
    {
        id: 'tech_scam',
        title: "Tech Support Scam",
        description: "You let a 'support agent' remotely access your computer.",
        severity: 'high',
        icon: 'users',
        color: 'red',
        steps: [
            { id: 'ts1', title: "Disconnect Internet", content: "Turn off Wi-Fi or unplug immediately to cut their connection." },
            { id: 'ts2', title: "Uninstall Software", content: "Remove any software they asked you to install (e.g., TeamViewer, AnyDesk) if you don't use it." },
            { id: 'ts3', title: "Scan for Malware", content: "Run a deep scan to ensure they didn't leave a backdoor." },
            { id: 'ts4', title: "Call Your Bank", content: "If you paid them or logged into banking while they were connected, alert your bank immediately." }
        ]
    }
];
