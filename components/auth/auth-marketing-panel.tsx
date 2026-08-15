import { Brain, Network, Cpu } from "lucide-react";

export default function AuthMarketingPanel() {
  return (
    <div className="hidden lg:flex flex-col px-16 py-10 w-1/2 shrink-0 bg-surface border-r border-surface-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center">
          <span className="text-brand text-base font-bold">τ</span>
        </div>
        <span className="text-copy-primary font-semibold text-sm tracking-tight">
          TasksFor AI
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-semibold text-copy-primary leading-snug mb-4">
          AI Platform for Energy Engineering.
        </h1>
        <p className="text-copy-muted text-sm leading-relaxed mb-10">
          Build your energy system in an AI-native engineering workspace. 
          AI designs, analyzes, optimizes, and maintains a live digital twin of your energy system.
        </p>

        <ul className="space-y-6">
          <li className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="h-3.5 w-3.5 text-brand" />
            </div>
            <div>
              <div className="text-copy-primary text-sm font-medium">
                AI-native Engineering
              </div>
              <div className="text-copy-muted text-xs mt-0.5 leading-relaxed">
                Instantly turn system requirements into visual energy architectures, analyze system performance, and iterate with AI assistance.
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
                Collaborate in a shared AI-native engineering workspace with live updates and shared engineering context.
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
                Keep your digital twin automatically synchronized with every design change, ensuring your virtual model always reflects the latest system.
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="text-copy-faint text-xs">
        © 2026 TasksFor AI. All rights reserved.
      </div>
    </div>
  );
}
