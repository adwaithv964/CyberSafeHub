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

## 6. Access & Navigation
*   **Sidebar**: Persistent navigation bar (collapsible on mobile) providing access to all modules.
*   **Flat Routing**: "Tools" section uses flat routing for URL-friendliness (e.g., `/tools/wifi-radar`).

## 7. Future Roadmap (Implied)
*   Integration of real Nmap scanning for WiFi Radar.
*   Expansion of Academy modules.
*   Enhanced persistent storage for user progress in Academy.
