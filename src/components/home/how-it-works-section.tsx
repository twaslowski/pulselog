const steps = [
  {
    number: 1,
    title: "Sign Up in Seconds",
    description:
      "Create your account with email or OAuth. No credit card required.",
  },
  {
    number: 2,
    title: "Define Your Metrics",
    description:
      "Choose what to track. Mood? Energy? Projects? Anything goes. Takes 2 minutes.",
  },
  {
    number: 3,
    title: "Start Logging",
    description:
      "Daily snapshots of what matters. One tap, one entry. That's it.",
  },
  {
    number: 4,
    title: "Watch Patterns Emerge",
    description: "After a few weeks, trends appear. See what drives your days.",
  },
];

export function HowItWorksSection() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connection line (hidden on mobile) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
            )}

            {/* Step card */}
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-primary-300">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
