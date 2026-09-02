'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, Download, Printer } from 'lucide-react';
import { useRituelB2B } from '../hooks/useProtocolesB2B';

export default function RituelCabine() {
  const t = useTranslations('b2b.cabinet_ritual');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { rituel, loading, error } = useRituelB2B(id);

  if (loading) {
    return <p className="text-gray-600">{t('loading') || 'Chargement...'}</p>;
  }

  if (error || !rituel) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Rituel introuvable'}</p>
        <button
          onClick={() => router.push('/pro/protocoles')}
          className="px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#523A28' }}
        >
          {t('back_btn')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/pro/protocoles"
        className="inline-flex items-center gap-2 text-[#523A28] hover:text-[#3A2819] transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_btn')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden shadow-sm">
        <div className="aspect-[21/9] bg-gray-100 overflow-hidden">
          <Image
            src={rituel.image}
            alt={rituel.title}
            width={1200}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 100%)' }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-[#523A28] text-white text-xs rounded-full mb-3 font-medium">
                {t('badge')}
              </span>
              <h1 className="text-2xl md:text-3xl text-[#1A1410] mb-2" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{rituel.title}</h1>
              <p className="text-sm text-gray-600 max-w-2xl">{rituel.introduction}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = rituel.image;
                  link.download = `${rituel.slug}.jpg`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition-colors whitespace-nowrap text-sm font-medium"
                style={{ backgroundColor: '#523A28' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3A2819')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#523A28')}
              >
                <Download className="w-4 h-4" />
                {t('btn_download')}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#523A28] border border-[#523A28]/20 rounded-lg hover:bg-[#523A28]/5 transition-colors whitespace-nowrap text-sm font-medium"
              >
                <Printer className="w-4 h-4" />
                {t('btn_print')}
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <Clock className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.duration')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{rituel.duration}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <Sparkles className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.theme')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{rituel.theme}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <Sparkles className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.ambiance')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{rituel.ambiance}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <CheckCircle2 className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.category')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{rituel.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Préparation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
          <h3 className="text-lg text-[#1A1410] mb-4" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('prep.cabine')}</h3>
          <ul className="space-y-2">
            {rituel.preparation.cabine.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#523A28] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
          <h3 className="text-lg text-[#1A1410] mb-4" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('prep.materiel')}</h3>
          <ul className="space-y-2">
            {rituel.preparation.materiel.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#523A28] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
          <h3 className="text-lg text-[#1A1410] mb-4" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('prep.produits')}</h3>
          <ul className="space-y-2">
            {rituel.preparation.produits.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#523A28] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Déroulement */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
        <h2 className="text-xl text-[#1A1410] mb-6" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('steps.title')}</h2>
        <div className="space-y-8">
          {rituel.deroulement.map((phase, index) => (
            <div key={index} className="relative">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-semibold" style={{ background: 'linear-gradient(135deg, #523A28 0%, #3A2819 100%)' }}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base text-[#1A1410] font-medium" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{phase.phase}</h3>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap ml-4">
                      <Clock className="w-4 h-4" />
                      {phase.duree}
                    </span>
                  </div>
                  <div className="bg-[#FDF8F3] rounded-xl p-4 mt-3 border border-[#E8E0D8]">
                    <ul className="space-y-2">
                      {phase.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Sparkles className="w-4 h-4 text-[#523A28] mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {index < rituel.deroulement.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-[#523A28]/30 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Retail & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#523A28]/20 p-6" style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #EDE0D3 100%)' }}>
          <h3 className="text-lg text-[#1A1410] mb-4" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('footer.retail_title')}</h3>
          <ul className="space-y-2">
            {rituel.retail.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#523A28] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #523A28 0%, #3A2819 100%)' }}>
          <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('footer.notes_title')}</h3>
          <ul className="space-y-2">
            {rituel.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-[#F5EDE4]">
                <CheckCircle2 className="w-4 h-4 text-[#C4A35A] mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Force SSR pour éviter les erreurs de build
export async function getServerSideProps() {
  return { props: {} };
}
