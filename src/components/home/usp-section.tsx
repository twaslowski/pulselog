import { RocketIcon, Zap, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

const usps = [
  {
    id: "track-what-matters",
    icon: RocketIcon,
    title: "Track Only What Matters",
    description:
      "Choose your own metrics and skip the noise. Your tracking, your rules.",
  },
  {
    id: "track-in-seconds",
    icon: Zap,
    title: "Track in Seconds",
    description:
      "Log your day instantly. No friction, no forms. Just quick snapshots of what matters.",
  },
  {
    id: "own-your-data",
    icon: Lock,
    title: "Own Your Data",
    description:
      "Complete ownership and control. Your data stays yours, always.",
  },
];

export function USPSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl">
      {usps.map((usp) => {
        const Icon = usp.icon;
        return (
          <Card
            key={usp.id}
            className="flex flex-col p-4 md:p-6 bg-white/10 border-none shadow-none"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-primary-500 rounded-full shrink-0">
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-left">
                {usp.title}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-primary-400">
              {usp.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
