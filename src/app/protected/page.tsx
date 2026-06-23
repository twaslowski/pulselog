import React from "react";
import { BarChart3, Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SuccessToast from "@/components/entry/creation/success-toast";
import Image from "next/image";
import { ActionCard } from "@/components/action-card";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ success: string | undefined }>;
}) {
  const [isLoggedIn, displaySuccess] = await Promise.all([
    createClient()
      .then(async (sb) => {
        const { data } = await sb.auth.getUser();
        return !!data.user;
      })
      .catch(() => false),
    searchParams.then((params) => params.success === "true"),
  ]);

  if (!isLoggedIn) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center h-full gap-y-6 px-4 md:justify-center">
      {displaySuccess && <SuccessToast message="Entry created successfully!" />}
      <div className="flex flex-row gap-4 items-center pt-8">
        <Image
          src="/images/moody-greeting-no-text.png"
          alt="moody is happy to see you!"
          height={150}
          width={200}
          className="w-32 h-24 sm:w-48 sm:h-36"
        />
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-center mb-2">Welcome back!</h1>
        </div>
      </div>
      <div className="w-full max-w-4xl px-4 py-8 md:px-8 space-y-4">
        {/* Primary Action */}
        <ActionCard
          href="/protected/new-entry"
          title="Create New Entry"
          aria-label="create-new-record"
          description="Log your mood, sleep, and other metrics"
          icon={Plus}
          iconSize="lg"
          variant="primary"
        />

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ActionCard
            href="/protected/metrics"
            title="Manage Metrics"
            aria-label="manage-metrics"
            description="Create and configure the metrics you want to track"
            icon={Settings}
          />

          <ActionCard
            href="/protected/insights"
            title="View Insights"
            description="Explore your data with interactive graphs and charts"
            icon={BarChart3}
          />
        </div>
      </div>
    </div>
  );
}
