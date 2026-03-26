import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const MaintenanceContext = createContext();

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider = ({ children }) => {
    const [maintenanceData, setMaintenanceData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/settings/maintenance`);
                const data = await res.json();
                setMaintenanceData(data.maintenanceData || {});
            } catch (err) {
                console.error("Failed to fetch maintenance settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
        // Poll every 5 minutes in background
        const interval = setInterval(fetchSettings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const isAvailable = (featureKey) => {
        if (loading) return true; // Fail open to prevent layout shift
        if (maintenanceData[featureKey] === false) return false;
        return true;
    };

    return (
        <MaintenanceContext.Provider value={{ maintenanceData, isAvailable, loading }}>
            {children}
        </MaintenanceContext.Provider>
    );
};
