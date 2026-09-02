'use client';

import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '@meybeauty/shared';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const t = useTranslations('b2b.auth.login');
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.role === 'b2b') {
      router.replace(user.validated ? '/pro/accueil' : '/pro/validation');
    }
  }, [isLoading, user, router]);

  return (
    <LoginForm
      onLogin={login}
      redirectUrl='/'
      logoSrc="/b2b/images/logo-mey-beauty.png"
      title={t('title')}
      subtitle={t('subtitle')}
      showB2BInfo={true}
      primaryColor="#523A28"
      backgroundColor="#F5EDE4"
      labels={{
        email: t('fields.email'),
        password: t('fields.password'),
        loginButton: t('btns.login'),
        loggingIn: t('btns.logging_in'),
        errorFailed: t('errors.failed'),
        b2bInfoTitle: t('info.title'),
        b2bInfoDesc: t('info.desc')
      }}
    />
  );
}
