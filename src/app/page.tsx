"use client";

import Image from "next/image";
import { RocketIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TrustSection } from "@/components/home/trust-section";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DotLoader } from "react-spinners";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // The below code is currently used to handle the auth callback from Supabase when using OAuth providers
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for hash fragments (implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken) {
        // Set the session from the hash fragments
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        console.error(error);

        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
          router.push("/protected");
          return;
        }
      }

      // Check if user is already signed in
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        router.push("/protected");
      } else {
        setIsLoading(false);
      }
    };

    void handleAuthCallback();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/protected");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <DotLoader loading={true} size={32} color="currentColor" />
        <span className={`ml-3`}>Loading</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center flex-1 px-4 py-16 md:py-24">
        <div className="w-full max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex flex-col items-center gap-4 mb-8 md:mb-12">
            <div className="bg-white/20 rounded-full p-2">
              <Image
                src="/images/pulselog.png"
                alt="pulselog logo"
                width={180}
                height={72}
              />
            </div>
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-primary-500 mb-4">
                Pulselog
              </h1>
              <p className="text-xl md:text-2xl text-primary-300 max-w-2xl mx-auto mb-6">
                Track your life your way
              </p>
              <p className="text-base md:text-lg text-primary-400 max-w-2xl mx-auto mb-8">
                The simple tracking app that respects your data. Create custom
                metrics, log in seconds, and discover patterns that matter to
                you.
              </p>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16">
            <Link href="/protected" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full">
                <RocketIcon className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link href="#features" className="flex-1 sm:flex-none">
              <Button size="lg" variant="outline" className="w-full">
                <span>Learn More</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-primary-300 max-w-2xl mx-auto">
              Packed with features designed to make tracking effortless and
              insights actionable.
            </p>
          </div>
          <FeaturesSection />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-primary-300 max-w-2xl mx-auto">
              Pulselog is designed for speed. From signup to your first log,
              just 4 simple steps.
            </p>
          </div>
          <HowItWorksSection />
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built with Privacy First
            </h2>
            <p className="text-lg text-primary-300 max-w-2xl mx-auto">
              Your data is your own. Complete control, complete transparency.
            </p>
          </div>
          <TrustSection />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start tracking?
          </h2>
          <p className="text-lg text-primary-300 mb-8 max-w-2xl mx-auto">
            Join others who are taking control of their data and gaining
            insights into what drives their days.
          </p>
          <Link href="/protected">
            <Button size="lg" className="gap-2">
              <RocketIcon className="w-5 h-5" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
