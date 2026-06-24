import { Shield, GitBranch, Zap } from "lucide-react";

const trustPoints = [
  {
    id: "privacy-first",
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data never leaves your control. Built on Supabase with full encryption. No ads, no tracking, no selling your information.",
  },
  {
    id: "open-source",
    icon: GitBranch,
    title: "Open Source",
    description:
      "Every line of code is available on GitHub. Audit it yourself, contribute, or self-host. Complete transparency.",
  },
  {
    id: "lightweight",
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed. Minimal dependencies, zero bloat. Enjoy a responsive experience that respects your time.",
  },
];

export function TrustSection() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.id}
              className="p-6 rounded-lg bg-gradient-to-br from-primary-500/10 to-primary-500/5 border border-primary-700/50 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary-500/20">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
              <p className="text-sm text-primary-300">{point.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
