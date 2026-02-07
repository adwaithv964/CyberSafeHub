import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ConversionDashboard } from './ConversionDashboard';
import { MergePDF } from './tools/MergePDF';
import { SplitPDF } from './tools/SplitPDF';
import { ImageToPDF } from './tools/ImageToPDF';
import { RotatePDF } from './tools/RotatePDF';
import { ProtectPDF } from './tools/ProtectPDF';
import { UnlockPDF } from './tools/UnlockPDF';
import { RemovePages } from './tools/RemovePages';
import { ExtractPages } from './tools/ExtractPages';
import { OrganizePDF } from './tools/OrganizePDF';
import { ScanToPDF } from './tools/ScanToPDF';
import { CompressPDF } from './tools/CompressPDF';
import { RepairPDF } from './tools/RepairPDF';
import { WatermarkPDF } from './tools/WatermarkPDF';
import { PageNumbersPDF } from './tools/PageNumbersPDF';
import { SignPDF } from './tools/SignPDF';
import { RedactPDF } from './tools/RedactPDF';
import { OCRPDF } from './tools/OCRPDF';
import { EditPDF } from './tools/EditPDF';
import { PDFToImage } from './tools/PDFToImage';
import { OfficeToPDF } from './tools/OfficeToPDF';
import { PDFToOffice } from './tools/PDFToOffice';
import { FlattenPDF } from './tools/FlattenPDF';
import { ComparePDF } from './tools/ComparePDF';
import { HTMLToPDF } from './tools/HTMLToPDF';
import { UniversalConverter } from './tools/UniversalConverter';
import { PDFToPDFA } from './tools/PDFToPDFA';

export default function ConversionSystem() {
    const navigate = useNavigate();
    const [activeTool, setActiveTool] = useState('dashboard');

    const renderTool = () => {
        switch (activeTool) {
            case 'dashboard':
                return <ConversionDashboard onSelectTool={setActiveTool} onBack={() => navigate('/tools')} />;
            case 'merge-pdf': return <MergePDF onBack={() => setActiveTool('dashboard')} />;
            case 'split-pdf': return <SplitPDF onBack={() => setActiveTool('dashboard')} />;
            case 'jpg-to-pdf': return <ImageToPDF onBack={() => setActiveTool('dashboard')} />;
            case 'rotate-pdf': return <RotatePDF onBack={() => setActiveTool('dashboard')} />;
            case 'protect-pdf': return <ProtectPDF onBack={() => setActiveTool('dashboard')} />;
            case 'unlock-pdf': return <UnlockPDF onBack={() => setActiveTool('dashboard')} />;
            case 'remove-pages': return <RemovePages onBack={() => setActiveTool('dashboard')} />;
            case 'extract-pages': return <ExtractPages onBack={() => setActiveTool('dashboard')} />;
            case 'organize-pdf': return <OrganizePDF onBack={() => setActiveTool('dashboard')} />;
            case 'scan-pdf': return <ScanToPDF onBack={() => setActiveTool('dashboard')} />;
            case 'compress-pdf': return <CompressPDF onBack={() => setActiveTool('dashboard')} />;
            case 'repair-pdf': return <RepairPDF onBack={() => setActiveTool('dashboard')} />;
            case 'watermark-pdf': return <WatermarkPDF onBack={() => setActiveTool('dashboard')} />;
            case 'page-numbers-pdf': return <PageNumbersPDF onBack={() => setActiveTool('dashboard')} />;
            case 'sign-pdf': return <SignPDF onBack={() => setActiveTool('dashboard')} />;
            case 'redact-pdf': return <RedactPDF onBack={() => setActiveTool('dashboard')} />;
            case 'ocr-pdf': return <OCRPDF onBack={() => setActiveTool('dashboard')} />;
            case 'edit-pdf': return <EditPDF onBack={() => setActiveTool('dashboard')} />;
            case 'pdf-to-jpg': return <PDFToImage onBack={() => setActiveTool('dashboard')} />;
            case 'office-to-pdf': return <OfficeToPDF onBack={() => setActiveTool('dashboard')} />;
            case 'pdf-to-office': return <PDFToOffice onBack={() => setActiveTool('dashboard')} />;
            case 'flatten-pdf': return <FlattenPDF onBack={() => setActiveTool('dashboard')} />;
            case 'compare-pdf': return <ComparePDF onBack={() => setActiveTool('dashboard')} />;
            case 'html-to-pdf': return <HTMLToPDF onBack={() => setActiveTool('dashboard')} />;
            case 'universal': return <UniversalConverter onBack={() => setActiveTool('dashboard')} />;

            // Fixed Valid Mappings
            case 'word-to-pdf':
            case 'powerpoint-to-pdf':
            case 'excel-to-pdf':
                return <OfficeToPDF onBack={() => setActiveTool('dashboard')} />;

            case 'pdf-to-word':
            case 'pdf-to-powerpoint':
            case 'pdf-to-excel':
                return <PDFToOffice onBack={() => setActiveTool('dashboard')} />;

            case 'pdf-to-pdfa': return <PDFToPDFA onBack={() => setActiveTool('dashboard')} />;

            default:
                return <ConversionDashboard onSelectTool={setActiveTool} onBack={() => navigate('/tools')} />;
        }
    };

    return (
        <div className="min-h-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    {renderTool()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
