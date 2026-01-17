import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config';

export const useJobPolling = () => {
    const [job, setJob] = useState(null);
    const [error, setError] = useState(null);
    const pollTimer = useRef(null);

    const poll = async (jobId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/convert/job/${jobId}`);
            const data = res.data;

            setJob(data);

            if (data.status === 'completed' || data.status === 'failed') {
                // Stop polling
                return;
            }

            // Continue polling
            pollTimer.current = setTimeout(() => poll(jobId), 1000);

        } catch (err) {
            console.error("Polling Error:", err);
            setError(err.message);
            setJob(prev => ({ ...prev, status: 'failed' }));
        }
    };

    const stopPolling = () => {
        if (pollTimer.current) clearTimeout(pollTimer.current);
    };

    // Cleanup
    useEffect(() => {
        return () => stopPolling();
    }, []);

    return {
        job,
        error,
        startPolling,
        stopPolling
    };
};
