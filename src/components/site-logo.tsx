"use client";

import Image from "next/image";

import darkLogo from "@/img/black bc.png";
import lightLogo from "@/img/Group 8 white bc.png";
import { cn } from "@/src/lib/utils";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
};

export function SiteLogo({ className, priority = false }: SiteLogoProps) {
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <Image
        src={lightLogo}
        alt="Viremo"
        priority={priority}
        className="theme-logo-light h-auto max-w-full"
      />
      <Image
        src={darkLogo}
        alt="Viremo"
        priority={priority}
        className="theme-logo-dark h-auto max-w-full"
      />
    </span>
  );
}
