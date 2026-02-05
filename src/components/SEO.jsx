import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, pathname }) => {
    const defaultTitle = "CyberSafeHub - Ultimate Cyber Security & Utility Toolkit";
    const defaultDescription = "All-in-One Cyber Security & PDF Utility Hub. Features: IP DNS Checker, Malware Scanner, Phishing Detector, Breach Detector, Password Generator, Secure Vault, WiFi Radar, Secure Share, PDF Converter (Merge, Split, Compress, OCR), and more. Protect your digital life today.";
    const defaultKeywords = "ip dns checker, security scanners, malware scanners, phishing scanner, breach detector, password generator, password strength meter, secure vault, cyber assistant, cyber tools, metadata washer, username detective, wifi radar, secure share, file converter, universal converter, pdf converter, merge pdf, split pdf, remove pages, extract pages, organize pdf, scan to pdf, optimize pdf, compress pdf, repair pdf, ocr pdf, jpg to pdf, word to pdf, ppt to pdf, excel to pdf, html to pdf, pdf to jpg, pdf to word, pdf to ppt, pdf to excel, pdf to pdf/a, rotate pdf, page numbers, add watermark, edit pdf, unlock pdf, protect pdf, sign pdf, redact pdf, flatten pdf, compare pdf, nearby share, file transfer, open source, phishing simulation, password cracking simulation, encryption lab, steganography studio, incident response rpg, cyber news, digital privacy, emergency guide";

    const siteUrl = "https://cybersafehub.in";
    const currentUrl = pathname ? `${siteUrl}${pathname}` : siteUrl;

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{title ? `${title} | CyberSafeHub` : defaultTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={title || defaultTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={`${siteUrl}/og-image.jpg`} />

            {/* Robots */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
        </Helmet>
    );
};

export default SEO;
