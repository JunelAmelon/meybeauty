"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type LoginFormProps = {
  onLogin: (email: string, password: string) => Promise<{ role?: string; validated?: boolean } | void>;
  redirectUrl?: string;
  logoSrc: string;
  title: string;
  subtitle?: string;
  showB2BInfo?: boolean;
  primaryColor?: string;
  backgroundColor?: string;
  labels?: {
    email?: string;
    password?: string;
    loginButton?: string;
    loggingIn?: string;
    errorFailed?: string;
    b2bInfoTitle?: string;
    b2bInfoDesc?: string;
  };
};

export function LoginForm({
  onLogin,
  redirectUrl,
  logoSrc,
  title,
  subtitle,
  showB2BInfo = false,
  primaryColor = "#523A28",
  backgroundColor = "#F5EDE4",
  labels = {},
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await onLogin(email, password);
      const role = (user as { role?: string } | undefined)?.role;
      const validated = (user as { validated?: boolean } | undefined)?.validated;
      if (role === "b2b") {
        const target = validated ? "/pro/accueil" : "/pro/validation";
        router.replace(target);
      } else {
        const target = redirectUrl ?? "/";
        router.replace(target);
      }
    } catch (err) {
      console.error("Login error", err);
      setError(labels.errorFailed || "Échec de la connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logoSrc} alt="Mey Beauty" className="h-14 object-contain" />
          <div>
            <h1 className="text-2xl font-semibold text-[#3A2819]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#4b5563] mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2937]" htmlFor="email">
              {labels.email || "Email professionnel"}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2"
              style={{
                outlineColor: primaryColor,
                boxShadow: `0 0 0 1px transparent` as const,
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2937]" htmlFor="password">
              {labels.password || "Mot de passe"}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2"
              style={{
                outlineColor: primaryColor,
                boxShadow: `0 0 0 1px transparent` as const,
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 10px 30px -15px ${primaryColor}`,
            }}
          >
            {loading ? (labels.loggingIn || "Connexion...") : (labels.loginButton || "Se connecter")}
          </button>
        </form>

        {showB2BInfo && (
          <div className="text-sm text-[#374151] bg-[#f8fafc] border border-[#e5e7eb] rounded-lg p-4 space-y-2">
            <p className="font-semibold text-[#1f2937]">{labels.b2bInfoTitle || "Espace Professionnel"}</p>
            <p>
              {labels.b2bInfoDesc || "Accédez aux tarifs pros, commandes rapides et protocoles dédiés aux partenaires Mey Beauty."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
