'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, Mail, Phone } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ValidationAttente() {
  const t = useTranslations('b2b.auth.waiting_validation');
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.validated) {
      router.replace('/pro/accueil');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5EDE4' }}>
        <div className="text-gray-700">Vérification de votre session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 px-8 py-4 rounded-xl" style={{ backgroundColor: '#523A28' }}>
            <span className="text-white text-2xl md:text-3xl font-bold">Mey Beauty B2B</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-gray-900 mb-4">{t('title')}</h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('welcome', { name: user?.prenom ?? '' })}
            <br />
            {t('desc')}
          </p>

          {/* Timeline */}
          <div className="bg-gradient-to-br from-[#F5EDE4] to-[#EDE0D3] rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
            <h3 className="text-gray-900 mb-4">{t('steps_title')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-900">{t('step1_title')}</p>
                  <p className="text-sm text-gray-600">{t('step1_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-900">{t('step2_title')}</p>
                  <p className="text-sm text-gray-600">{t('step2_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">3</span>
                </div>
                <div>
                  <p className="text-gray-900">{t('step3_title')}</p>
                  <p className="text-sm text-gray-600">{t('step3_desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5" style={{ color: '#523A28' }} />
                <h4 className="text-gray-900">{t('cards.email_title')}</h4>
              </div>
              <p className="text-sm text-gray-600">
                {t('cards.email_desc')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5" style={{ color: '#523A28' }} />
                <h4 className="text-gray-900">{t('cards.help_title')}</h4>
              </div>
              <p className="text-sm text-gray-600">
                {t('cards.help_desc')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={logout}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('btn_logout')}
            </button>
            <Link
              href="/login"
              className="px-6 py-3 text-white rounded-lg transition-all"
              style={{ backgroundColor: '#523A28' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3A2819')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#523A28')}
            >
              {t('btn_back')}
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t('footer.email')} <span className="text-gray-700">{user?.email}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t('footer.company')} <span className="text-gray-700">{user?.societe}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Page purement client (App Router) : pas de getServerSideProps nécessaire
