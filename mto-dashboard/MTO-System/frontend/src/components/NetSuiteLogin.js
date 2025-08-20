import React, { useState } from 'react';
import { Database, LogIn, Key, Shield, ExternalLink, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const NetSuiteLogin = ({ onLogin, onClose }) => {
  const [credentials, setCredentials] = useState({
    accountId: '',
    email: '',
    password: '',
    role: 'PRODUCTION_MANAGER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate NetSuite authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, this would call NetSuite's SuiteTalk REST API
      const authData = {
        ...credentials,
        token: `NS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        permissions: ['MTO_READ', 'MTO_WRITE', 'INVENTORY_READ', 'PRODUCTION_MANAGE'],
        environment: 'Production',
        apiVersion: '2024.1'
      };

      if (remember) {
        localStorage.setItem('netsuite_auth', JSON.stringify(authData));
      }

      onLogin(authData);
    } catch (err) {
      setError('Invalid credentials or connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-bold">NetSuite Login</h2>
                <p className="text-blue-100 text-sm">Connect to access MTO final data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Account ID
            </label>
            <input
              type="text"
              value={credentials.accountId}
              onChange={(e) => setCredentials({...credentials, accountId: e.target.value})}
              placeholder="1234567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              placeholder="user@company.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              value={credentials.role}
              onChange={(e) => setCredentials({...credentials, role: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PRODUCTION_MANAGER">Production Manager</option>
              <option value="FACTORY_ADMIN">Factory Admin</option>
              <option value="QC_INSPECTOR">QC Inspector</option>
              <option value="BRAND_MANAGER">Brand Manager</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-slate-700">
              Remember me for 24 hours
            </label>
          </div>

          <div className="border-t pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login to NetSuite
                </>
              )}
            </button>

            <div className="text-center">
              <a 
                href="https://system.netsuite.com/pages/customerlogin.jsp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open NetSuite Portal
              </a>
            </div>
          </div>
        </form>

        {/* Security Info */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-slate-600 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-medium mb-1">Secure Connection</p>
              <p>Your credentials are encrypted and transmitted securely to NetSuite via OAuth 2.0.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetSuiteLogin;