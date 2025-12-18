
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', number: '', type: 'Support' });

    useEffect(() => {
        const saved = localStorage.getItem('emergencyContacts');
        if (saved) {
            try {
                setContacts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse contacts", e);
            }
        } else {
            // Defaults
            setContacts([
                { id: 1, name: 'IT Support', number: '555-0123', type: 'Work' },
                { id: 2, name: 'Bank Fraud Dept', number: '1-800-555-0199', type: 'Finance' }
            ]);
        }
    }, []);

    const saveContacts = (updatedContacts) => {
        setContacts(updatedContacts);
        localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    };

    const addContact = (e) => {
        e.preventDefault();
        if (!newContact.name || !newContact.number) return;

        const updated = [...contacts, { ...newContact, id: Date.now() }];
        saveContacts(updated);
        setNewContact({ name: '', number: '', type: 'Support' });
        setIsEditing(false);
    };

    const removeContact = (id) => {
        const updated = contacts.filter(c => c.id !== id);
        saveContacts(updated);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Icon name="user" className="w-5 h-5 text-blue-500" />
                    Trusted Contacts
                </h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {isEditing ? 'Cancel' : 'Add New'}
                </button>
            </div>

            {isEditing && (
                <form onSubmit={addContact} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3">
                    <input
                        type="text"
                        placeholder="Name (e.g. IT Desk)"
                        value={newContact.name}
                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                    />
                    <input
                        type="tel"
                        placeholder="Number"
                        value={newContact.number}
                        onChange={e => setNewContact({ ...newContact, number: e.target.value })}
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                    />
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700">
                        Save Contact
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {contacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/50">
                        <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{contact.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{contact.number}</div>
                        </div>
                        <button onClick={() => removeContact(contact.id)} className="text-gray-400 hover:text-red-500">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {contacts.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-2">No contacts saved.</p>
                )}
            </div>
        </div>
    );
};

export default EmergencyContacts;
