# CyberSafeHub Project Summary

## INTRODUCTION
In today's interconnected world, the digital landscape is evolving at an unprecedented pace, bringing with it a host of sophisticated security threats. From phishing scams to ransomware, individuals and small businesses often lack the resources to protect themselves. **CyberSafeHub** is a comprehensive cybersecurity platform designed to bridge this gap. It aims to democratize cybersecurity by integrating essential security tools into a single, cohesive, and user-friendly platform, transforming it from a complex subject into a manageable aspect of daily digital life.

## EXISTING SYSTEM
Current personal cybersecurity solutions are often fragmented. Users rely on separate antivirus programs, password managers, and VPNs from different providers. This disjointed approach is costly and difficult to manage, leaving gaps in the user's overall security posture. There is a lack of a single, integrated platform that provides a holistic view of an individual's digital safety.

## PROPOSED SYSTEM
CyberSafeHub is an integrated web platform offering a robust suite of tools for cybersecurity management, incident response, and education. It features a secure authentication system, an encrypted vault, and real-time analysis tools.

### Key Advantages
1.  **Centralised Security Hub**: Consolidates multiple effective tools onto one dashboard.
2.  **Proactive Threat Detection**: Includes malware scanning, WiFi network monitoring, and phishing detection.
3.  **AI-Powered Guidance**: Features a "Cyber Assistant" for personalized security advice.
4.  **Practical Privacy & Emergency Plans**: Actionable guides for compromised accounts and privacy checklists.
5.  **Engaging Education**: Fosters security awareness through interactive modules and quizzes.

## MODULE DESCRIPTION

### Sidebar Features (User Module)
The platform offers a comprehensive set of modules accessible via the sidebar navigation:

1.  **Dashboard**
    *   Central command center displaying the user's overall "Security Score".
    *   Shows "Recent Activity" logs (e.g., last login, scan history).
    *   Features a "Tips of the Day" widget for daily security awareness.

2.  **IP & DNS Checker**
    *   **Network Intelligence**: Displays the user's public IP address and ISP details.
    *   **DNS Leak Test**: Analyzes DNS requests to ensure the user's privacy is not compromised by their ISP or malicious resolvers.

3.  **Scanners**
    *   **Malware Scanner**: Allows users to drag and drop files (up to 50MB) for scanning against the ClamAV virus database.
    *   **Phishing Scanner**: Users can check suspicious URLs against Google's Safe Browsing API to detect phishing or malicious sites.
    *   **Breach Detector**: Checks email addresses against known data breaches (e.g., Have I Been Pwned) and provides an action plan if compromised.

4.  **Password Vault**
    *   **Encrypted Storage**: Securely stores passwords, notes, and sensitive credentials using AES-256 encryption.
    *   **Zero-Knowledge Architecture**: Ensures that even the system administrators cannot access user data without the master key (implied security model).

5.  **Cyber Assistant**
    *   **AI Chatbot**: A conversational interface powered by large language models (Gemini API) to answer cybersecurity questions.
    *   **Personalized Advice**: Provides context-aware recommendations for improving digital safety.

6.  **Health Check**
    *   **Security Audit**: A comprehensive interactive questionnaire and system check.
    *   **Scoring**: Generates a "Security Health Score" (0-100) and identifies specific weaknesses with actionable remediation steps.

7.  **Cyber Tools**
    *   **Metadata Washer**: Removes hidden metadata (EXIF, GPS, timestamps) from images to protect privacy before sharing.
    *   **Username Detective**: OSINT tool that searches for a username across 50+ social media platforms to determine footprint.
    *   **WiFi Radar**: Scans the local network to detect connected devices and identify potential "promiscuous mode" spying activity.

8.  **Cyber Academy**
    *   **Educational Hub**: Structured learning modules covering topics like Phishing, Password Security, and Encryption.
    *   **Interactive Simulations**: Hands-on training tools (e.g., Phishing Trainer) to practice defense skills.

9.  **Cyber News**
    *   **Threat Intelligence Feed**: Aggregates the latest cybersecurity news and threat alerts from trusted global sources.

10. **Digital Privacy**
    *   **Social Media Advisors**: Step-by-step privacy checklists for major platforms (Facebook, Instagram, LinkedIn, etc.) to lock down personal data.

11. **Emergency Guides**
    *   **Crisis Response**: "What to Do If..." guides for critical scenarios like "I've been hacked," "Stolen Device," or "Ransomware Infection."
    *   **Panic Button**: Quick access to isolation protocols.

12. **Settings**
    *   **User Preferences**: Manage profile details, change passwords, and configure app themes (Dark/Light mode).
    *   **Data Management**: Options to export or delete account data.

### Admin Module (System/Backend)
*   **User Management**: Backend oversight of user accounts and authentication.
*   **Threat Engine Management**: Integration and updates for ClamAV and Threat Intelligence feeds.
*   **System Analytics**: Monitoring of system load, scan activity, and general usage trends.

## SOFTWARE SPECIFICATION
*   **Operating System**: Cross-platform (Windows, macOS, Linux) via Web Browser.
*   **Front End**: React.js 18 (Vite), Tailwind CSS, Framer Motion (Animations).
*   **Back End**: Node.js (Express) with RESTful APIs.
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: Firebase Auth (supports Email/Password, Google).
*   **External APIs**: Google Safe Browsing, Gemini AI, Have I Been Pwned (integration).
*   **Tools**: ClamAV (Server-side scanning), Custom Network Scripts (WiFi Radar).
