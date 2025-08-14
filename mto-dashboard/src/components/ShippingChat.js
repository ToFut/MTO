import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ShippingChat = ({ 
  shipmentData = [], 
  onUpdateShipment, 
  userRole = 'brand', 
  onOpenChat,
  activeShipment = null 
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(activeShipment);
  const [showChat, setShowChat] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState('general');
  const [chatTabs, setChatTabs] = useState([]);
  const messagesEndRef = useRef(null);

  // Sample shipping chat messages per shipment line
  const [shippingChats, setShippingChats] = useState({
    'AWB123456_PO125_8': [
      { id: 1, sender: 'brand', message: 'When will PO125 Line 8 be shipped?', time: '10:30 AM', type: 'question', po: 'PO125', lineId: '8' },
      { id: 2, sender: 'factory', message: 'Scheduled for July 24th. Will provide tracking number.', time: '10:35 AM', type: 'update', po: 'PO125', lineId: '8' },
      { id: 3, sender: 'factory', message: 'Shipped! Tracking: 1Z1234567890', time: '2:15 PM', type: 'shipped', po: 'PO125', lineId: '8' },
      { id: 4, sender: 'brand', message: 'Received. ETA July 26th confirmed.', time: '2:20 PM', type: 'confirmation', po: 'PO125', lineId: '8' }
    ],
    'AWB789012_PO123_6': [
      { id: 1, sender: 'factory', message: 'PO123 Line 6 - Missing 2 items from carton MC002', time: '9:00 AM', type: 'issue', po: 'PO123', lineId: '6' },
      { id: 2, sender: 'brand', message: 'Please check inventory and provide replacement timeline', time: '9:15 AM', type: 'question', po: 'PO123', lineId: '6' },
      { id: 3, sender: 'factory', message: 'Replacement items ready. New carton MC002-R will ship tomorrow', time: '11:30 AM', type: 'resolution', po: 'PO123', lineId: '6' }
    ],
    'AWB345678_PO124_12': [
      { id: 1, sender: 'brand', message: 'PO124 Line 12 - Status update needed', time: '11:00 AM', type: 'question', po: 'PO124', lineId: '12' },
      { id: 2, sender: 'factory', message: 'In production, will complete by EOD', time: '11:15 AM', type: 'update', po: 'PO124', lineId: '12' }
    ]
  });

  // Generate chat tabs from shipment data
  useEffect(() => {
    const tabs = shipmentData.map(shipment => ({
      id: `${shipment.awb}_${shipment.po}_${shipment.lineId || 'general'}`,
      title: `${shipment.po} Line ${shipment.lineId || 'General'}`,
      awb: shipment.awb,
      po: shipment.po,
      lineId: shipment.lineId,
      status: shipment.status,
      unreadCount: 0
    }));
    setChatTabs(tabs);
  }, [shipmentData]);

  useEffect(() => {
    if (activeChatTab && shippingChats[activeChatTab]) {
      setMessages(shippingChats[activeChatTab]);
    } else {
      setMessages([]);
    }
  }, [activeChatTab, shippingChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChatTab) return;

    const message = {
      id: Date.now(),
      sender: userRole,
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message',
      po: chatTabs.find(tab => tab.id === activeChatTab)?.po,
      lineId: chatTabs.find(tab => tab.id === activeChatTab)?.lineId
    };

    const updatedChats = { ...shippingChats };
    if (!updatedChats[activeChatTab]) {
      updatedChats[activeChatTab] = [];
    }
    updatedChats[activeChatTab] = [...updatedChats[activeChatTab], message];
    
    setShippingChats(updatedChats);
    setMessages(updatedChats[activeChatTab]);
    setNewMessage('');

    // Auto-update shipment status based on message content
    if (newMessage.toLowerCase().includes('shipped') || newMessage.toLowerCase().includes('tracking')) {
      const currentTab = chatTabs.find(tab => tab.id === activeChatTab);
      if (currentTab) {
        onUpdateShipment && onUpdateShipment(currentTab.awb, { status: 'Shipped' });
      }
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
          {/* Chat Navigation Options */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {/* By Month */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">By Month:</span>
                {['January', 'February', 'March', 'April', 'May', 'June'].map(month => (
                  <button
                    key={month}
                    onClick={() => setActiveChatTab(`shipping-month-${month}`)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      activeChatTab === `shipping-month-${month}`
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {/* By Day */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">By Day:</span>
                {['Today', 'Yesterday', 'Last Week', 'This Week'].map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveChatTab(`shipping-day-${day}`)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      activeChatTab === `shipping-day-${day}`
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">By Shipment:</span>
              {chatTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChatTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeChatTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.title}</span>
                    {tab.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {tab.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Shipment Info */}
          {activeChatTab && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('shipping.po', 'PO')}:</span> {chatTabs.find(tab => tab.id === activeChatTab)?.po}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.awb', 'AWB')}:</span> {chatTabs.find(tab => tab.id === activeChatTab)?.awb}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.line', 'Line')}:</span> {chatTabs.find(tab => tab.id === activeChatTab)?.lineId}
                </div>
                <div>
                  <span className="font-medium">{t('shipping.status', 'Status')}:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    chatTabs.find(tab => tab.id === activeChatTab)?.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                    chatTabs.find(tab => tab.id === activeChatTab)?.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {chatTabs.find(tab => tab.id === activeChatTab)?.status}
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
              placeholder={activeChatTab ? t('shipping.typeMessage', 'Type your message...') : t('shipping.selectChat', 'Select a chat tab first...')}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!activeChatTab}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !activeChatTab}
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
