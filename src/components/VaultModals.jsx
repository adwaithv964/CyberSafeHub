import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const VaultModal = ({ isOpen, onClose, onSave, initialData = null, type }) => {
    const [name, setName] = useState('');
    const [formData, setFormData] = useState({});

    // Reset or populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setFormData(initialData.data || {});
            } else {
                setName('');
                setFormData({});
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            type: initialData ? initialData.type : type, // Keep type if editing, else use new type
            data: formData
        });
        onClose();
    };

    if (!isOpen) return null;

    const renderFields = () => {
        switch (type) {
            case 'login':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username / Email</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.username || ''}
                                onChange={(e) => handleChange('username', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                            <input
                                type="url"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.url || ''}
                                onChange={(e) => handleChange('url', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'card':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cardholder Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.cardholderName || ''}
                                onChange={(e) => handleChange('cardholderName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.cardNumber || ''}
                                onChange={(e) => handleChange('cardNumber', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry (MM/YY)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.expiry || ''}
                                    onChange={(e) => handleChange('expiry', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.cvv || ''}
                                    onChange={(e) => handleChange('cvv', e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                );
            case 'identity':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.firstName || ''}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.lastName || ''}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Security / ID Number</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.idNumber || ''}
                                onChange={(e) => handleChange('idNumber', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <textarea
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'note':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Content</label>
                        <textarea
                            rows={6}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.content || ''}
                            onChange={(e) => handleChange('content', e.target.value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {initialData ? 'Edit Item' : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name / Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-accent"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Google Account, Chase Visa"
                        />
                    </div>

                    {renderFields()}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                        >
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VaultModal;
