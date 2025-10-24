"use client"

import { Users } from "lucide-react";
import { ConnectMenu } from "./ConnectMenu";

interface TopBarProps {
  participantCount: number;
}

export default function TopBar({ participantCount }: TopBarProps) {
  return (
    <header className="h-14 bg-[#1A0329] border-b-2 border-black flex items-center justify-between px-4">
      <h1 className="text-white font-bold text-lg tracking-tight" data-testid="text-app-title">
        SELF BINGO
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" data-testid="container-participant-count">
          <div className="w-2 h-2 bg-[#B2EBA1] animate-pulse" />
          <Users className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm" data-testid="text-participant-count">
            {participantCount}
          </span>
        </div>
        <ConnectMenu />
      </div>
    </header>
  );
}
