'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  Download,
  Printer,
  Shield,
  Droplets,
  FlaskConical,
  Beaker,
} from 'lucide-react';
import { useFicheB2B } from '../hooks/useProtocolesB2B';

export default function FicheTechnique() {
  const t = useTranslations('b2b.technical_sheet');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fiche, loading, error } = useFicheB2B(id);

  if (loading) {
    return <p className="text-gray-600">{t('loading') || 'Chargement...'}</p>;
  }

  if (error || !fiche) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Fiche introuvable'}</p>
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
            src={fiche.image}
            alt={fiche.title}
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
              <h1 className="text-2xl md:text-3xl text-[#1A1410] mb-2" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{fiche.title}</h1>
              <p className="text-sm text-gray-600 max-w-2xl">{fiche.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fiche.image;
                  link.download = `${fiche.slug}.jpg`;
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
              <Shield className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.reference')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{fiche.reference}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <Droplets className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.volume')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{fiche.volume}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <FlaskConical className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.category')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{fiche.category}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <Clock className="w-5 h-5 text-[#523A28] mb-2" />
              <p className="text-xs text-gray-500 mb-0.5">{t('stats.duration')}</p>
              <p className="text-sm text-[#1A1410] font-semibold">{fiche.utilisation.temps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Actifs & Propriétés */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actifs */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
            <h3 className="text-lg text-[#1A1410] mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>
              <Beaker className="w-5 h-5 text-[#523A28]" />
              {t('assets.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fiche.actifs.map((actif, index) => (
                <div key={index} className="p-4 bg-[#FDF8F3] rounded-xl border border-[#E8E0D8]">
                  <h4 className="text-[#523A28] font-medium mb-1 text-sm">{actif.nom}</h4>
                  <p className="text-xs text-gray-600">{actif.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Propriétés */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
            <h3 className="text-lg text-[#1A1410] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>
              <Sparkles className="w-5 h-5 text-[#523A28]" />
              {t('properties.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fiche.proprietes.map((prop, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700 bg-[#F5EDE4]/50 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#523A28] flex-shrink-0" />
                  <span className="text-sm">{prop}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Utilisation */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
            <h3 className="text-lg text-[#1A1410] mb-6" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('usage.title')}</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#523A28]/10 text-[#523A28] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm text-[#1A1410] font-medium mb-0.5">{t('usage.frequency')}</h4>
                  <p className="text-sm text-gray-600">{fiche.utilisation.frequence}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#523A28]/10 text-[#523A28] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm text-[#1A1410] font-medium mb-0.5">{t('usage.method')}</h4>
                  <p className="text-sm text-gray-600">{fiche.utilisation.methode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Caractéristiques & Avis */}
        <div className="space-y-6">
          {/* Caractéristiques */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm">
            <h3 className="text-lg text-[#1A1410] mb-6" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('specs.title')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#E8E0D8]">
                <span className="text-sm text-gray-500">{t('specs.texture')}</span>
                <span className="text-sm font-medium text-[#1A1410]">{fiche.caracteristiques.texture}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E8E0D8]">
                <span className="text-sm text-gray-500">{t('specs.smell')}</span>
                <span className="text-sm font-medium text-[#1A1410]">{fiche.caracteristiques.odeur}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E8E0D8]">
                <span className="text-sm text-gray-500">{t('specs.ph')}</span>
                <span className="text-sm font-medium text-[#1A1410]">{fiche.caracteristiques.ph}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">{t('specs.paot')}</span>
                <span className="text-sm font-medium text-[#1A1410]">{fiche.caracteristiques.conservation}</span>
              </div>
            </div>
          </div>

          {/* Expert Note */}
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #523A28 0%, #3A2819 100%)' }}>
            <Sparkles className="w-8 h-8 mb-4 text-[#C4A35A]" />
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-cormorant-garamond), serif' }}>{t('expert.title')}</h3>
            <p className="text-[#F5EDE4] text-sm leading-relaxed italic">
              &quot;{fiche.avis_experts}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force SSR pour éviter les erreurs de build
export async function getServerSideProps() {
  return { props: {} };
}
