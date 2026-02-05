# CyberSafeHub Project Documentation

## 1. Executive Summary
**CyberSafeHub** is a comprehensive cybersecurity awareness and utility platform designed to educate users, provide essential security tools, and assist in digital safety management. It combines educational modules ("Cyber Academy"), practical utilities (Network Scanners, Password Vaults), and AI-driven assistance to create a holistic security hub for both personal and educational use.

## 2. System Architecture & Technology Stack

### 2.1 Technology Stack
**Frontend:**
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (Dark Mode focused), PostCSS
*   **Animations:** Framer Motion
*   **Routing:** React Router (via custom state management in App.jsx)
*   **State Management:** React Context API (AuthContext)

**Backend:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Authentication:** Firebase Auth (Email/Password, Google, MFA/TOTP)
*   **Native Tools Integration:** ClamAV (Antivirus), ARP/Ping (Network Scanning)

### 2.2 Project Structure
*   `src/`: Main frontend source code.
    *   `components/`: Reusable UI components and specific tool implementations.
    *   `pages/`: Full-page views (Dashboard, Tools, Academy, etc.).
    *   `contexts/`: Global state providers (Authentication).
    *   `config/`: Configuration files (Firebase).
    *   `utils/`: Helper scripts (API wrappers, loggers).
*   `server/`: Backend API and worker scripts.
    *   `index.js`: Main Express application entry point.
    *   `clamav/`: ClamAV executable and database linkage.
    *   `models/`: MongoDB Schema definitions.

## 3. Software Requirements Specification (SRS)

### 3.1 Functional Requirements
1.  **Authentication & User Management**:
    *   Users must be able to Register, Login, and Logout.
    *   Support for Google Sign-In.
    *   Support for Multi-Factor Authentication (TOTP).
    *   Profile management (Name, Email, Password, Account Deletion).

2.  **Dashboard**:
    *   Provide a high-level overview of system status and quick access to tools.
    *   Display visual "blob" background effects for aesthetics.

3.  **Cyber Tools**:
    *   **Metadata Washer**: Remove EXIF/metadata from uploaded images.
    *   **Username Detective**: OSINT tool to check username availability across 50+ platforms.
    *   **WiFi Radar**: Scan local network for connected devices, identify vendors, and detect potential risks (promiscuous mode simulation).
    *   **Code Security Auditor**: AI-powered static code analysis tool that identifies security vulnerabilities in source code using the Gemini API.
    *   **Privacy Policy Decoder**: AI tool that translates complex legal text (Privacy Policies, Terms of Service) into plain English with risk assessments.

4.  **Security Scanners**:
    *   **Malware Scanner**: Upload and scan files using ClamAV backend.
    *   **Network Scanner**: Check public IP, DNS leak tests.

5.  **Password Management**:
    *   **Password Vault**: Securely store and retrieve encrypted credentials (MongoDB backed).
    *   **Password Cracker**: Educational tool visualizing brute-force attacks.

6.  **Education (Cyber Academy)**:
    *   Interactive modules teaching cybersecurity concepts.
    *   **Phishing Trainer**: Educational simulation of phishing attacks.
    *   **Encryption Visualizer**: Interactive demo of encryption algorithms.
    *   **Incident Response Simulator**: Interactive RPG-style game where users face realistic cyber attack scenarios and make critical decisions to contain threats and restore services.

7.  **AI Assistance**:
    *   **Cyber Assistant**: Chat interface powered by Gemini API to answer security questions.
    *   Support for context-aware responses.

8.  **Emergency & Privacy**:
    *   **Emergency Guides**: Step-by-step guides for compromised accounts/devices.
    *   **Digital Privacy**: Privacy checklists and best practices.

### 3.2 Non-Functional Requirements
*   **Security**: All user secrets (Vault) must be encrypted/handled securely. Frontend keys must be protected.
*   **Performance**: The application should load quickly; animations should be smooth (60fps).
*   **Responsiveness**: The UI must be fully responsive, supporting Desktop and Mobile views.
*   **Reliability**: Backend services (Scanning, OSINT) should handle timeouts and errors gracefully.

## 4. Feature Details & Modules

### 4.1 Core Pages
*   **Dashboard (`Dashboard.jsx`)**: Central hub with navigation cards and status summary.
*   **Cyber News (`CyberNewsPage.jsx`)**: Aggregated news feed for latest security threats.
*   **Settings (`SettingsPage.jsx`)**: User profile and application preferences.

### 4.2 Security Utilities
*   **Scanners (`ScannersPage.jsx`)**: Interface for file/URL scanning.
*   **Network Tools (`NetworkToolPage.jsx`)**: IP information, DNS analysis.
*   **Health Check (`HealthCheckPage.jsx`)**: interactive checklist for device security posture.
*   **Steganography Studio (`SteganographyPage.jsx`)**: Hide/Reveal messages inside images.

### 4.3 Interactive Tools (`src/components/tools/`)
*   **Metadata Washer**: Client/Server hybrid processing to strip image metadata.
*   **WiFi Radar**: Backend-driven network scan (ping sweep, ARP table reading) to list devices.
*   **Username Detective**: Backend proxy to check HTTP status of profile URLs on various social networks.

### 4.4 Educational Suite (`src/components/academy/`)
*   **Modules**: Structured learning paths.
*   **Simulations**:
    *   **Phishing Trainer**: Simulates email inboxes to spot fakes.
    *   **Password Cracker**: Shows time-to-crack estimates for various passwords.
    *   **Incident Response Simulator**: Terminal-style RPG game where users respond to live cyber incidents (Ransomware, DDoS, Insider Threats, etc.) and learn crisis management through hands-on decision-making.

### 4.5 Crisis Management
*   **Emergency Guides (`EmergencyGuidesPage.jsx`)**: 
    *   "Panic Mode" UI.
    *   Guides for: Stolen Device, Hacked Account, Ransomware, Identity Theft.
    *   **Emergency Contacts**: Local storage of trusted contacts.

## 5. Backend API Reference (`server/index.js`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/scan` | POST | Upload file for ClamAV malware scan. |
| `/api/vault` | POST/GET | Store/Retrieve encrypted vault items. |

| `/api/osint/check` | POST | Check username existence on a specific target URL. |
| `/api/wifi-radar/scan` | GET | Trigger network scan and return device list. |
| `/api/wifi-radar/analyze` | POST | Perform deep analysis (simulated) on a specific IP. |

## 6. Detailed Feature Analysis (New Features)

### 6.1 Code Security Auditor
● **What is it?**  
An AI-powered static code analysis tool that identifies security vulnerabilities, coding errors, and potential exploits in source code. It leverages the Gemini API to provide intelligent, context-aware security assessments similar to professional penetration testing tools.

● **How to Use:**
1. Navigate to "Cyber Tools" > "Code Security Auditor".
2. Paste your source code (JavaScript, Python, SQL, etc.) into the code editor panel.
3. Click "Audit Code" to initiate the analysis.
4. Review the AI-generated security report with identified vulnerabilities, severity ratings, and recommended fixes.

● **Working (Technical):**
   - **Frontend**: Uses a dual-panel layout with a code input textarea on the left and markdown-rendered results on the right.
   - **AI Processing**: Sends the code to the Gemini API with a specialized system prompt designed for application security analysis.
   - **Analysis Format**: The AI returns structured reports containing:
     - 🛡️ Security Status (overall assessment)
     - 🚩 Vulnerabilities Found (categorized by severity: Critical, High, Medium, Low)
     - 📝 Plain-English explanations of why the code is dangerous
     - 🔧 Fixed code blocks showing secure implementations
     - 💡 Best practices for the specific language/framework
   - **Privacy**: All analysis happens via API calls; no code is permanently stored on the server.

### 6.2 Privacy Policy Decoder
● **What is it?**  
An AI-powered legal document translator that converts complex privacy policies, terms of service, and end-user license agreements into clear, understandable language. It highlights red flags, data collection practices, and third-party sharing policies that users typically miss.

● **How to Use:**
1. Go to "Cyber Tools" > "Privacy Policy Decoder".
2. Copy and paste the legal text from any website's Privacy Policy or Terms of Service.
3. Click "Reveal Truth" to decode the document.
4. Read the simplified report showing what you're actually agreeing to.

● **Working (Technical):**
   - **Input Processing**: Accepts up to 15,000 characters of legal text to avoid excessive token usage.
   - **AI Analysis**: Uses the Gemini API with a specialized prompt that instructs the AI to:
     - Provide a one-sentence verdict in plain English
     - Identify red flags (forced arbitration, data selling, liability waivers)
     - List what data is collected and why
     - Reveal third-party data sharing practices
     - Generate a Privacy Score (X/10) with justification
   - **Output Format**: Markdown-formatted report with emojis and bold highlights for improved readability.
   - **Use Cases**: Helps users make informed decisions before signing up for services, installing apps, or sharing personal information.

### 6.3 Incident Response Simulator (RPG)
● **What is it?**  
An interactive, RPG-style educational game that simulates real-world cybersecurity incidents. Players take the role of a System Administrator facing live attacks like ransomware outbreaks, DDoS floods, insider threats, or SQL injection breaches. The game teaches crisis management through hands-on decision-making with consequences.

● **How to Use:**
1. Navigate to "Cyber Academy" > "Incident Response Simulator".
2. Type "Start" in the terminal-style interface to begin.
3. The AI Game Master presents a random cyber attack scenario with initial symptoms.
4. Make decisions by typing commands (e.g., "isolate infected host", "check firewall logs", "contact incident response team").
5. The AI responds to your actions, advancing the story or introducing complications based on your choices.
6. Continue until you achieve "VICTORY" (threat contained) or "GAME OVER" (catastrophic failure).

● **Working (Technical):**
   - **Game Engine**: Built as a terminal-style chat interface with a retro cyberpunk aesthetic (green text on black background).
   - **AI-Driven Gameplay**: Uses the Gemini API as the Game Master with dynamic scenario generation:
     - Randomly selects incident types (Ransomware, DDoS, Insider Threat, SQL Injection, etc.)
     - Evaluates player actions in real-time
     - Adjusts "Crisis Level" (Low/Medium/Critical) based on decisions
     - Provides subtle hints if the player asks for help
   - **Consequence System**:
     - Good decisions (e.g., "isolate network segment") advance the story positively
     - Bad decisions (e.g., "ignore the alert") introduce complications and escalate the crisis
     - Each action affects the outcome, teaching cause-and-effect in cybersecurity
   - **Educational Value**: Teaches incident response procedures, crisis communication, forensic investigation, and system recovery in a risk-free environment.
   - **Replayability**: Each session generates a unique scenario with different attack vectors and evolving situations.

## 7. Access & Navigation
*   **Sidebar**: Persistent navigation bar (collapsible on mobile) providing access to all modules.
*   **Flat Routing**: "Tools" section uses flat routing for URL-friendliness (e.g., `/tools/wifi-radar`, `/tools/code-auditor`, `/tools/policy-decoder`).
*   **Academy Navigation**: Educational modules accessible via `/academy` with individual tool routing.

## 8. Future Roadmap (Implied)
*   Integration of real Nmap scanning for WiFi Radar.
*   Expansion of Academy modules with more interactive simulations.
*   Enhanced persistent storage for user progress in Academy.
*   Multi-language support for Code Security Auditor.
*   Integration of more AI models for comparative analysis in security tools.
*   Leaderboards and achievements for Incident Response Simulator.

