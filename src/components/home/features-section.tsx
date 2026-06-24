import { BarChart3, Zap, Lock, Share2, Calendar, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    id: "custom-metrics",
    icon: Settings,
    title: "Build Your Own Metrics",
    description:
      "Don't be limited by preset tracking options. Create custom metrics for anything that matters to you—mood, energy, sleep, productivity, or personal projects. Mix quantitative and qualitative data.",
  },
  {
    id: "quick-logging",
    icon: Zap,
    title: "Log in Seconds, Not Minutes",
    description:
      "Our distraction-free interface gets out of your way. One tap to log your daily snapshot. No complex forms, no unnecessary fields—just what you care about.",
  },
  {
    id: "instant-insights",
    icon: BarChart3,
    title: "See Patterns at a Glance",
    description:
      "Visual charts and trends help you spot patterns in your behavior. Understand correlations between metrics and make data-driven decisions about your life.",
  },
  {
    id: "data-ownership",
    icon: Lock,
    title: "Your Data Stays Yours",
    description:
      "No ads, no selling your data, no lock-in. Your information lives in your own Supabase instance. Export, delete, or migrate whenever you want.",
  },
  {
    id: "flexible-sharing",
    icon: Share2,
    title: "Share (or Don't)",
    description:
      "Keep your data completely private, or share specific metrics with friends, coaches, or therapists. You control what's visible and to whom.",
  },
  {
    id: "always-available",
    icon: Calendar,
    title: "Available Anywhere, Anytime",
    description:
      "Web app that works on desktop and mobile. Track from your phone, analyze on your computer. No app store required.",
  },
];

export function FeaturesSection() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.id}
              className="p-6 bg-white/5 border border-primary-700/50 hover:border-primary-500/50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-500/20">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
