'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { signupB2C, signupB2B } from '@meybeauty/firebase';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import {
  User,
  Mail,
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import Image from 'next/image';

export default function InscriptionPro() {
  const t = useTranslations('b2b.auth.register');
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b'>('b2c');
  const [formB2B, setFormB2B] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    societe: '',
    siret: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    typeActivite: '',
  });
  const [formB2C, setFormB2C] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptConditionsB2B, setAcceptConditionsB2B] = useState(false);
  const [acceptConditionsB2C, setAcceptConditionsB2C] = useState(false);
  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const [pieceIdentiteFile, setPieceIdentiteFile] = useState<File | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

  const renderConditions = useMemo(
    () => {
      const template = t('conditions', { cgv: '{CGV}', privacy: '{PRIVACY}' });
      return template.split(/(\{CGV\}|\{PRIVACY\})/).map((part, index) => {
        if (part === '{CGV}') {
          return (
            <a key={`cgv-${index}`} href="/conditions" className="hover:underline" style={{ color: '#523A28' }}>
              {t('cgv')}
            </a>
          );
        }
        if (part === '{PRIVACY}') {
          return (
            <a key={`privacy-${index}`} href="/confidentialite" className="hover:underline" style={{ color: '#523A28' }}>
              {t('privacy')}
            </a>
          );
        }
        return <span key={`txt-${index}`}>{part}</span>;
      });
    },
    [t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormB2B({ ...formB2B, [e.target.name]: e.target.value });
  };

  const handleChangeB2C = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormB2C({ ...formB2C, [e.target.name]: e.target.value });
  };

  const handleKbisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert('Fichier trop volumineux (max 10 Mo).');
        return;
      }
      setKbisFile(file);
    }
  };

  const handlePieceIdentiteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert('Fichier trop volumineux (max 10 Mo).');
        return;
      }
      setPieceIdentiteFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (activeTab === 'b2c') {
      e.preventDefault();
      if (formB2C.password !== formB2C.confirmPassword) {
        alert(t('errors.password_mismatch'));
        return;
      }
      if (!acceptConditionsB2C) {
        alert(t('errors.accept_conditions'));
        return;
      }
      setIsLoading(true);
      try {
        await signupB2C({
          email: formB2C.email,
          password: formB2C.password,
          firstName: formB2C.prenom,
          lastName: formB2C.nom,
          phone: formB2C.telephone,
          address: formB2C.adresse,
          postalCode: formB2C.codePostal,
          city: formB2C.ville,
        });
        router.push(redirect);
      } catch {
        alert(t('errors.general_error'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    e.preventDefault();
    if (formB2B.password !== formB2B.confirmPassword) {
      alert(t('errors.password_mismatch'));
      return;
    }
    if (!acceptConditionsB2B) {
      alert(t('errors.accept_conditions'));
      return;
    }
    if (!kbisFile) {
      alert(t('errors.missing_kbis'));
      return;
    }
    if (!pieceIdentiteFile) {
      alert(t('errors.missing_id'));
      return;
    }

    setIsLoading(true);
    try {
      const [kbisUrl, idUrl] = await Promise.all([
        uploadToCloudinary(kbisFile, { folder: 'b2b-docs' }),
        uploadToCloudinary(pieceIdentiteFile, { folder: 'b2b-docs' }),
      ]);

      await signupB2B({
        email: formB2B.email,
        password: formB2B.password,
        company: formB2B.societe,
        siret: formB2B.siret,
        contactName: `${formB2B.prenom} ${formB2B.nom}`.trim(),
        firstName: formB2B.prenom,
        lastName: formB2B.nom,
        phone: formB2B.telephone,
        address: formB2B.adresse,
        postalCode: formB2B.codePostal,
        city: formB2B.ville,
        activityType: formB2B.typeActivite,
        kbisUrl,
        idUrl,
      });
      router.push('/pro/validation');
    } catch {
      alert(t('errors.general_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-2 px-6 py-4 rounded-xl" style={{ backgroundColor: '#523A28' }}>
            <Image
              src="/b2b/images/logo-mey-beauty.png"
              alt="Mey Beauty B2B"
              width={140}
              height={50}
              className="object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-gray-900 mb-2">
            {activeTab === 'b2c' ? t('title_b2c') : t('title')}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'b2c' ? t('subtitle_b2c') : t('subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('b2c')}
            className={`flex-1 py-3 rounded-lg border ${activeTab === 'b2c' ? 'bg-[#523A28] text-white border-[#523A28]' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {t('tabs.b2c')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('b2b')}
            className={`flex-1 py-3 rounded-lg border ${activeTab === 'b2b' ? 'bg-[#523A28] text-white border-[#523A28]' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {t('tabs.b2b')}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {activeTab === 'b2c' && (
              <>
                {/* B2C: informations personnelles */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.personal')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.first_name')}</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formB2C.prenom}
                        onChange={handleChangeB2C}
                        placeholder={t('placeholders.first_name')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.last_name')}</label>
                      <input
                        type="text"
                        name="nom"
                        value={formB2C.nom}
                        onChange={handleChangeB2C}
                        placeholder={t('placeholders.last_name')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* B2C: connexion */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.connection')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.email')}</label>
                      <input
                        type="email"
                        name="email"
                        value={formB2C.email}
                        onChange={handleChangeB2C}
                        placeholder={t('placeholders.email')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.password')}</label>
                        <input
                          type="password"
                          name="password"
                          value={formB2C.password}
                          onChange={handleChangeB2C}
                          placeholder={t('placeholders.password')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.confirm_password')}</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formB2C.confirmPassword}
                          onChange={handleChangeB2C}
                          placeholder={t('placeholders.password')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* B2C: adresse */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.address')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.phone')}</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formB2C.telephone}
                        onChange={handleChangeB2C}
                        placeholder={t('placeholders.phone')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.address')}</label>
                      <input
                        type="text"
                        name="adresse"
                        value={formB2C.adresse}
                        onChange={handleChangeB2C}
                        placeholder={t('placeholders.address')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.zip_code')}</label>
                        <input
                          type="text"
                          name="codePostal"
                          value={formB2C.codePostal}
                          onChange={handleChangeB2C}
                          placeholder={t('placeholders.zip_code')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.city')}</label>
                        <input
                          type="text"
                          name="ville"
                          value={formB2C.ville}
                          onChange={handleChangeB2C}
                          placeholder={t('placeholders.city')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* B2C: conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptConditionsB2C}
                      onChange={(e) => setAcceptConditionsB2C(e.target.checked)}
                      className="w-5 h-5 border-gray-300 rounded mt-0.5 flex-shrink-0"
                      style={{ accentColor: '#523A28' }}
                      required
                    />
                    <span className="text-sm text-gray-600">{renderConditions}</span>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'b2b' && (
              <>
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.personal')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.first_name')}</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formB2B.prenom}
                        onChange={handleChange}
                        placeholder={t('placeholders.first_name')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.last_name')}</label>
                      <input
                        type="text"
                        name="nom"
                        value={formB2B.nom}
                        onChange={handleChange}
                        placeholder={t('placeholders.last_name')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Informations de connexion */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.connection')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.email')}</label>
                      <input
                        type="email"
                        name="email"
                        value={formB2B.email}
                        onChange={handleChange}
                        placeholder={t('placeholders.email')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.password')}</label>
                        <input
                          type="password"
                          name="password"
                          value={formB2B.password}
                          onChange={handleChange}
                          placeholder={t('placeholders.password')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.confirm_password')}</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formB2B.confirmPassword}
                          onChange={handleChange}
                          placeholder={t('placeholders.password')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations entreprise */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex itemscenter gap-2">
                    <Building2 className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.company')}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.company_name')}</label>
                        <input
                          type="text"
                          name="societe"
                          value={formB2B.societe}
                          onChange={handleChange}
                          placeholder={t('placeholders.company_name')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.siret')}</label>
                        <input
                          type="text"
                          name="siret"
                          value={formB2B.siret}
                          onChange={handleChange}
                          placeholder={t('placeholders.siret')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.activity_type')}</label>
                        <select
                          name="typeActivite"
                          value={formB2B.typeActivite}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
                          required
                        >
                          <option value="">{t('placeholders.select')}</option>
                          <option value="spa">{t('activities.spa')}</option>
                          <option value="institut">{t('activities.institute')}</option>
                          <option value="salon">{t('activities.salon')}</option>
                          <option value="centre">{t('activities.center')}</option>
                          <option value="autre">{t('activities.other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.phone')}</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formB2B.telephone}
                          onChange={handleChange}
                          placeholder={t('placeholders.phone')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">{t('fields.address')}</label>
                      <input
                        type="text"
                        name="adresse"
                        value={formB2B.adresse}
                        onChange={handleChange}
                        placeholder={t('placeholders.address')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.zip_code')}</label>
                        <input
                          type="text"
                          name="codePostal"
                          value={formB2B.codePostal}
                          onChange={handleChange}
                          placeholder={t('placeholders.zip_code')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('fields.city')}</label>
                        <input
                          type="text"
                          name="ville"
                          value={formB2B.ville}
                          onChange={handleChange}
                          placeholder={t('placeholders.city')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: '#523A28' }} />
                    {t('sections.documents')}
                  </h3>

                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 space-y-5">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <Upload className="w-5 h-5 mt-0.5 text-[#523A28]" />
                      <div>
                        <p className="font-medium">Formats acceptés : PDF, JPG, JPEG, PNG</p>
                        <p className="text-xs text-gray-500">Taille max : 10 Mo par fichier</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="kbis-upload" className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          {t('fields.kbis')}
                          <span className="text-xs bg-[#523A28]/10 text-[#523A28] px-2 py-0.5 rounded-full">Obligatoire</span>
                        </label>
                        <label
                          htmlFor="kbis-upload"
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#523A28] hover:bg-white/50 rounded-lg py-4 px-3 text-center cursor-pointer transition-colors"
                        >
                          <Upload className="w-5 h-5 text-[#523A28]" />
                          <div className="text-sm text-gray-700">
                            Glissez-déposez ou <span className="text-[#523A28] font-semibold">cliquez pour importer</span>
                          </div>
                          <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG · max 10 Mo</p>
                          <input
                            id="kbis-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleKbisUpload}
                            className="hidden"
                            required
                          />
                        </label>
                        {kbisFile && (
                          <p className="text-xs text-[#523A28] bg-[#523A28]/5 rounded px-2 py-1 text-left">
                            Fichier sélectionné : {kbisFile.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="id-upload" className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          {t('fields.id_card')}
                          <span className="text-xs bg-[#523A28]/10 text-[#523A28] px-2 py-0.5 rounded-full">Obligatoire</span>
                        </label>
                        <label
                          htmlFor="id-upload"
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#523A28] hover:bg-white/50 rounded-lg py-4 px-3 text-center cursor-pointer transition-colors"
                        >
                          <Upload className="w-5 h-5 text-[#523A28]" />
                          <div className="text-sm text-gray-700">
                            Glissez-déposez ou <span className="text-[#523A28] font-semibold">cliquez pour importer</span>
                          </div>
                          <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG · max 10 Mo</p>
                          <input
                            id="id-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handlePieceIdentiteUpload}
                            className="hidden"
                            required
                          />
                        </label>
                        {pieceIdentiteFile && (
                          <p className="text-xs text-[#523A28] bg-[#523A28]/5 rounded px-2 py-1 text-left">
                            Fichier sélectionné : {pieceIdentiteFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avantages B2B */}
                <div className="bg-gradient-to-br from-[#F5EDE4] to-[#EDE0D3] rounded-lg p-6">
                  <h4 className="text-gray-900 mb-4">{t('advantages.title')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.prices')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.discounts')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.tools')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.auto_reassort')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.marketing')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {t('advantages.support')}
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptConditionsB2B}
                      onChange={(e) => setAcceptConditionsB2B(e.target.checked)}
                      className="w-5 h-5 border-gray-300 rounded mt-0.5 flex-shrink-0"
                      style={{ accentColor: '#523A28' }}
                      required
                    />
                    <span className="text-sm text-gray-600">{renderConditions}</span>
                  </label>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-white py-3 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: '#523A28' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#3A2819')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#523A28')}
              >
                {isLoading
                  ? t('btn_submitting')
                  : activeTab === 'b2c'
                    ? t('btn_submit_b2c')
                    : t('btn_submit')}
              </button>
              <Link
                href="/login"
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                {t('btn_cancel')}
              </Link>
            </div>
          </form>
        </div>

        {activeTab === 'b2b' && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{t('footer_info')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Force SSR pour éviter les erreurs de build avec useAuth
export async function getServerSideProps() {
  return { props: {} };
}
