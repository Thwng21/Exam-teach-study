'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Hệ Thống Thi Online',
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileUploadSize: 10, // MB
    sessionTimeout: 60, // minutes
    enableNotifications: true,
    maintenanceMode: false,
    defaultExamDuration: 60, // minutes
    maxRetakeAttempts: 3,
    autoGrading: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Lưu cài đặt vào localStorage hoặc gửi API
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      siteName: 'Hệ Thống Thi Online',
      allowRegistration: true,
      requireEmailVerification: true,
      maxFileUploadSize: 10,
      sessionTimeout: 60,
      enableNotifications: true,
      maintenanceMode: false,
      defaultExamDuration: 60,
      maxRetakeAttempts: 3,
      autoGrading: true
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài Đặt Hệ Thống</h1>
        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Đã lưu cài đặt thành công!
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Cài đặt chung */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cài Đặt Chung</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên hệ thống
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian hết phiên (phút)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kích thước tối đa file upload (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileUploadSize}
                onChange={(e) => setSettings({...settings, maxFileUploadSize: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRegistration"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                Cho phép đăng ký tài khoản mới
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                Yêu cầu xác thực email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableNotifications"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                Bật thông báo hệ thống
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                <span className="text-red-600 font-medium">Chế độ bảo trì</span>
                <span className="text-gray-500 text-xs block">Hệ thống sẽ không cho phép truy cập</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cài đặt bài thi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cài Đặt Bài Thi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian thi mặc định (phút)
              </label>
              <input
                type="number"
                value={settings.defaultExamDuration}
                onChange={(e) => setSettings({...settings, defaultExamDuration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần thi lại tối đa
              </label>
              <input
                type="number"
                value={settings.maxRetakeAttempts}
                onChange={(e) => setSettings({...settings, maxRetakeAttempts: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoGrading"
                checked={settings.autoGrading}
                onChange={(e) => setSettings({...settings, autoGrading: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoGrading" className="ml-2 block text-sm text-gray-900">
                Tự động chấm điểm cho câu hỏi trắc nghiệm
              </label>
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông Tin Hệ Thống</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Phiên bản:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium">MongoDB</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Framework:</span>
                <span className="font-medium">Next.js 15</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Node.js:</span>
                <span className="font-medium">v18+</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">Đang chạy</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Last Update:</span>
                <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đặt lại mặc định
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
