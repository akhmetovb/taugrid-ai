import { SignUp } from "@clerk/nextjs";
import { Brain, Network, Cpu } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex bg-base">
      <div className="hidden lg:flex flex-col px-16 py-10 w-1/2 shrink-0 bg-surface border-r border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center">
            <span className="text-brand text-base font-bold">τ</span>
          </div>
          <span className="text-copy-primary font-semibold text-sm tracking-tight">
            TauGrid AI
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold text-copy-primary leading-snug mb-4">
            AI-Native Digital Twin Platform for Smart Energy Grids.
          </h1>
          <p className="text-copy-muted text-sm leading-relaxed mb-10">
            Describe your energy system in plain English. TauGrid AI transforms
            it into a shared visual model, enabling your team to collaborate,
            refine the design, and instantly generate a living digital twin.
          </p>

          <ul className="space-y-6">
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="h-3.5 w-3.5 text-brand" />
              </div>
              <div>
                <div className="text-copy-primary text-sm font-medium">
                  AI-native Development
                </div>
                <div className="text-copy-muted text-xs mt-0.5 leading-relaxed">
                  Instantly convert system requirements into visual energy
                  layouts.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center shrink-0 mt-0.5">
                <Network className="h-3.5 w-3.5 text-brand" />
              </div>
              <div>
                <div className="text-copy-primary text-sm font-medium">
                  Real-time Collaboration
                </div>
                <div className="text-copy-muted text-xs mt-0.5 leading-relaxed">
                  Work together on a shared canvas with live updates and
                  synchronized changes.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="h-3.5 w-3.5 text-brand" />
              </div>
              <div>
                <div className="text-copy-primary text-sm font-medium">
                  Live Digital Twin
                </div>
                <div className="text-copy-muted text-xs mt-0.5 leading-relaxed">
                  Automatically keep your digital twin synchronized as your
                  energy system evolves.
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="text-copy-faint text-xs">
          © 2026 TauGrid AI. All rights reserved.
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-8">
        <SignUp />
      </div>
    </div>
  );
}
