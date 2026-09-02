'use client';

import { Settings, Mail, Bell, Shield, Database } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Parametres() {
  const t = useTranslations('admin.settings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#523A28]/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#523A28]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('general.title')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('general.platformName')}
              </label>
              <input
                type="text"
                defaultValue="Mey Beauty B2B"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('general.contactEmail')}
              </label>
              <input
                type="email"
                defaultValue="contact@meybeauty.fr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('general.phone')}
              </label>
              <input
                type="tel"
                defaultValue="+33 1 23 45 67 89"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('emailNotifications.title')}</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('emailNotifications.newOrders')}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#523A28] rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('emailNotifications.newProfessionals')}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#523A28] rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('emailNotifications.lowStock')}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#523A28] rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('emailNotifications.weeklyReports')}</span>
              <input type="checkbox" className="w-5 h-5 text-[#523A28] rounded" />
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('systemAlerts.title')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('systemAlerts.lowStockThreshold')}
              </label>
              <input
                type="number"
                defaultValue="50"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('systemAlerts.validationDelay')}
              </label>
              <input
                type="number"
                defaultValue="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('security.title')}</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('security.twoFactor')}</span>
              <input type="checkbox" className="w-5 h-5 text-[#523A28] rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('security.activityLogs')}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#523A28] rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{t('security.manualValidation')}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#523A28] rounded" />
            </label>
          </div>
        </div>
      </div>

      {/* Database Backup */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t('backup.title')}</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 mb-1">{t('backup.lastBackup')}</p>
            <p className="text-xs text-gray-500">05/01/2026 à 03:00</p>
          </div>
          <button className="px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors">
            {t('backup.backupNow')}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors font-medium">
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
}
