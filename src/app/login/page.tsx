"use client";

import * as React from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { EmailCodeFactor } from "@clerk/types";
import { AuthCarousel } from "@/components/shared/AuthCarousel";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const carouselImages = [
  "/assets/background.jpg",
  "/assets/backgroundtwo.jpg",
  "/assets/backgroundthree.jpg",
];

const carouselTexts = [
  {
    title: "Trouvez votre espace sécurisé",
    subtitle: "Partagez en quelques clics, accédez en quelques clics.",
  },
  {
    title: "Contrôle total",
    subtitle: "Gérez vos partages avec précision et simplicité.",
  },
  {
    title: "Sécurité avant tout",
    subtitle: "Vos données sont protégées et chiffrées.",
  },
];

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.height = "unset";
      document.documentElement.style.height = "unset";
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Erreur lors de la connexion Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/dashboard");
        return;
      }

      if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (f): f is EmailCodeFactor => f.strategy === "email_code"
        );
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
          setIsLoading(false);
          return;
        }
      }

      setError("Étape supplémentaire requise (MFA / trust / etc.)");
      setIsLoading(false);
    } catch (err: any) {
      if (err?.errors?.[0]?.code === "form_identifier_not_found") {
        try {
          if (signUp) {
            await signUp.create({
              emailAddress: email,
              password,
            });
            await signUp.prepareEmailAddressVerification({
              strategy: "email_code",
            });
            setShowEmailCode(true);
            setIsLoading(false);
            return;
          }
        } catch (e: any) {
          setError(
            e?.errors?.[0]?.message ?? "Erreur lors de la création du compte"
          );
          setIsLoading(false);
          return;
        }
      }
      setError(err?.errors?.[0]?.message ?? "Erreur de connexion");
      setIsLoading(false);
    }
  };

  const handleEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    if (signUp) {
      try {
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code,
        });
        if (signUpAttempt.status === "complete") {
          await setActive({ session: signUpAttempt.createdSessionId });
          router.push("/dashboard");
          return;
        }
      } catch (e: any) {
        setError(e?.errors?.[0]?.message ?? "Code invalide");
        setIsLoading(false);
        return;
      }
    }

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/dashboard");
        return;
      }
      setError("Vérification incomplète");
      setIsLoading(false);
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? "Code invalide");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden fixed inset-0 bg-white">
      {/* Left side - Carousel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AuthCarousel images={carouselImages} texts={carouselTexts} />
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold text-black tracking-tight">Airlock</span>
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-medium text-black/60 hover:text-black transition-colors"
          >
            S'inscrire
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 sm:py-6 md:py-8 overflow-hidden">
          <div className="w-full max-w-md space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            {/* Title */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-[68px] font-medium text-black tracking-tight leading-[1.05]">
                Bienvenue sur Airlock !
              </h1>
              <p className="text-[15px] sm:text-[17px] text-black/50 font-medium leading-relaxed">
                Connectez-vous à votre compte.
              </p>
            </div>

            {!showEmailCode ? (
              <>
                {/* Google Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={!isLoaded || isLoading}
                  className="w-full h-12 bg-white border border-black/10 text-black rounded-full font-medium text-[17px] hover:bg-black/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuer avec Google
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-black/50 font-medium tracking-wider">ou</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4 md:space-y-5">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Adresse email"
                      required
                      className="w-full h-12 px-4 rounded-full border border-black/10 focus:border-black/20 focus:ring-0 outline-none text-[17px] font-medium transition-all bg-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      required
                      className="w-full h-12 px-4 pr-12 rounded-full border border-black/10 focus:border-black/20 focus:ring-0 outline-none text-[17px] font-medium transition-all bg-white"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/50 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-full bg-red-50 border border-red-200">
                      <p className="text-[13px] font-medium text-red-600 text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !isLoaded}
                    className="w-full h-12 bg-black text-white rounded-full font-medium text-[17px] hover:bg-black/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      "Chargement..."
                    ) : (
                      <>
                        Continuer
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleEmailCode} className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[17px] text-black/50 font-medium">
                    Un code a été envoyé à <span className="text-black font-semibold">{email}</span>.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full h-14 px-6 rounded-full border border-black/10 focus:border-black/20 focus:ring-0 outline-none text-[20px] font-semibold transition-all bg-white text-center tracking-[0.3em]"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-full bg-red-50 border border-red-200">
                    <p className="text-[13px] font-medium text-red-600 text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isLoaded}
                  className="w-full h-12 bg-black text-white rounded-full font-medium text-[17px] hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Vérification..." : "Vérifier"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailCode(false);
                    setCode("");
                    setError(null);
                  }}
                  className="w-full text-[13px] font-medium text-black/50 hover:text-black transition-colors"
                >
                  Retour
                </button>
              </form>
            )}

            {/* Footer Link */}
            <div className="pt-4">
              <p className="text-center text-[13px] text-black/50 font-medium">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-black font-semibold hover:underline transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
