import React, { useState } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const ConsultationRoom = () => {
    const [messages, setMessages] = useState([
        { sender: 'system', text: 'Session started' }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { sender: 'me', text: input }]);
        setInput('');
        // Simulate reply
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'patient', text: 'I hear you.' }]);
        }, 1000);
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <RoleBasedSidebar userRole="counsellor" />
                <main className="main-content">
                    <BreadcrumbTrail />
                    <h1 className="text-3xl font-bold mb-6">Consultation Room</h1>
                    <div className="grid grid-cols-3 gap-6 h-[600px]">
                        <div className="col-span-2 bg-black rounded-lg flex items-center justify-center text-white">
                            {/* Video Placeholder */}
                            <div className="text-center">
                                <p className="text-xl">Video Feed</p>
                                <p className="text-sm text-gray-400">Camera is off</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow flex flex-col">
                            <div className="p-4 border-b font-semibold">Chat</div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`p-2 rounded max-w-[80%] ${msg.sender === 'me' ? 'bg-indigo-100 ml-auto' : 'bg-gray-100'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    className="flex-1 border rounded px-2 py-1"
                                    placeholder="Type a message..."
                                />
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded">Send</button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default ConsultationRoom;
