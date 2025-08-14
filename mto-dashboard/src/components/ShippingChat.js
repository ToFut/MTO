import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const ShippingChat = ({ 
  shipmentData = [], 
  onUpdateShipment, 
  userRole = 'brand', 
  onOpenChat,
  activeShipment = null 
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(activeShipment);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample shipping chat messages
  const [shippingChats, setShippingChats] = useState({
    'AWB123456': [
      { id: 1, sender: 'brand', message: 'When will PO125 Line 8 be shipped?', time: '10:30 AM', type: 'question' },
      { id: 2, sender: 'factory', message: 'Scheduled for July 24th. Will provide tracking number.', time: '10:35 AM', type: 'update' },
      { id: 3, sender: 'factory', message: 'Shipped! Tracking: 1Z1234567890', time: '2:15 PM', type: 'shipped' },
      { id: 4, sender: 'brand', message: 'Received. ETA July 26th confirmed.', time: '2:20 PM', type: 'confirmation' }
    ],
    'AWB789012': [
      { id: 1, sender: 'factory', message: 'PO123 Line 6 - Missing 2 items from carton MC002', time: '9:00 AM', type: 'issue' },
      { id: 2, sender: 'brand', message: 'Please check inventory and provide replacement timeline', time: '9:15 AM', type: 'question' },
      { id: 3, sender: 'factory', message: 'Replacement items ready. New carton MC002-R will ship tomorrow', time: '11:30 AM', type: 'resolution' }
    ]
  });

  useEffect(() => {
    if (selectedShipment && shippingChats[selectedShipment.awb]) {
      setMessages(shippingChats[selectedShipment.awb]);
    }
  }, [selectedShipment, shippingChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedShipment) return;

    const message = {
      id: Date.now(),
      sender: userRole,
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message'
    };

    const updatedChats = { ...shippingChats };
    if (!updatedChats[selectedShipment.awb]) {
      updatedChats[selectedShipment.awb] = [];
    }
    updatedChats[selectedShipment.awb] = [...updatedChats[selectedShipment.awb], message];
    
    setShippingChats(updatedChats);
    setMessages(updatedChats[selectedShipment.awb]);
    setNewMessage('');

    // Auto-update shipment status based on message content
    if (newMessage.toLowerCase().includes('shipped') || newMessage.toLowerCase().includes('tracking')) {
      onUpdateShipment && onUpdateShipment(selectedShipment.id, { status: 'Shipped' });
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'shipped': return '🚚';
      case 'issue': return '⚠️';
      case 'question': return '❓';
      case 'update': return '📝';
      case 'confirmation': return '✅';
      case 'resolution': return '🔧';
      default: return '💬';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'shipped': return 'bg-green-100 border-green-300';
      case 'issue': return 'bg-red-100 border-red-300';
      case 'question': return 'bg-blue-100 border-blue-300';
      case 'update': return 'bg-yellow-100 border-yellow-300';
      case 'confirmation': return 'bg-green-100 border-green-300';
      case 'resolution': return 'bg-purple-100 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const quickActions = [
    { label: 'Request Tracking', message: 'Please provide tracking number for this shipment' },
    { label: 'Report Missing Items', message: 'Missing items detected in carton. Please investigate.' },
    { label: 'Confirm Delivery', message: 'Shipment received. Delivery confirmed.' },
    { label: 'Request ETA Update', message: 'Please provide updated ETA for this shipment' },
    { label: 'Report Damage', message: 'Items damaged during shipping. Need replacement.' }
  ];

  const handleQuickAction = (action) => {
    setNewMessage(action.message);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              {t('shipping.chat', 'Shipping Chat')}
            </h3>
            <p className="text-sm opacity-90">
              {selectedShipment ? `${selectedShipment.po} - ${selectedShipment.awb}` : t('shipping.selectShipment', 'Select a shipment')}
            </p>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
          >
            {showChat ? '−' : '+'}
          </button>
        </div>
      </div>

      {showChat && (
        <div className="p-4">
          {/* Shipment Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shipping.selectShipment', 'Select Shipment')}
            </label>
            <select
              value={selectedShipment?.awb || ''}
              onChange={(e) => {
                const shipment = shipmentData.find(s => s.awb === e.target.value);
                setSelectedShipment(shipment);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('shipping.chooseShipment', 'Choose a shipment...')}</option>
              {shipmentData.map((shipment) => (
                <option key={shipment.awb} value={shipment.awb}>
                  {shipment.po} - {shipment.awb} ({shipment.status})
                </option>
              ))}
            </select>
          </div>

          {/* Shipment Info */}
          {selectedShipment && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('shipping.po', 'PO')}:</span> {selectedShipment.po}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.awb', 'AWB')}:</span> {selectedShipment.awb}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.carton', 'Carton')}:</span> {selectedShipment.masterCarton}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.eta', 'ETA')}:</span> {selectedShipment.eta}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.carrier', 'Carrier')}:</span> {selectedShipment.carrier}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.status', 'Status')}:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    selectedShipment.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                    selectedShipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedShipment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shipping.quickActions', 'Quick Actions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-gray-50 rounded-lg p-3 h-64 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t('shipping.noMessages', 'No messages yet. Start the conversation!')}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === userRole ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg border ${
                      msg.sender === userRole 
                        ? 'bg-blue-500 text-white' 
                        : getMessageTypeColor(msg.type)
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{getMessageTypeIcon(msg.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === userRole ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('shipping.typeMessage', 'Type your message...')}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedShipment}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !selectedShipment}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('shipping.send', 'Send')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingChat;
