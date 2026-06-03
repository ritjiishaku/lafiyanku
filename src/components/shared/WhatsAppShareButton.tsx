"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, Copy } from "lucide-react";

interface WhatsAppShareButtonProps {
  patientFriendlyOutput: string;
  onShare?: () => void;
}

function formatForWhatsApp(source: string): string {
  const stripped = source.replace(/─{2,}/g, "").trim();
  const lines = stripped.split("\n").filter((l) => l.trim());
  const formatted: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
      }
      continue;
    }
    if (inTable && !trimmed.startsWith("|")) {
      inTable = false;
    }
    if (inTable) continue;
    formatted.push(trimmed);
  }

  let text = formatted.join("\n");

  const maxLen = 1500;
  if (text.length > maxLen) {
    const breakpoints = [
      "When to return to the hospital",
      "Your follow-up appointment",
      "Important home care instructions",
      "Your medications",
    ];
    let truncated = false;
    for (const bp of breakpoints) {
      const idx = text.indexOf(bp);
      if (idx !== -1 && idx + bp.length + 200 < maxLen) {
        text = text.slice(0, maxLen - 30) + "\n\n... continued in full print version.";
        truncated = true;
        break;
      }
    }
    if (!truncated) {
      text = text.slice(0, maxLen - 30) + "\n\n... continued in full print version.";
    }
  }

  return text;
}

export function WhatsAppShareButton({
  patientFriendlyOutput,
  onShare,
}: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const msg = formatForWhatsApp(patientFriendlyOutput);
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } else {
      navigator.clipboard.writeText(msg).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }

    onShare?.();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="touch-target-min"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="mr-1 h-4 w-4 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <MessageCircle className="mr-1 h-4 w-4" />
          WhatsApp
        </>
      )}
    </Button>
  );
}
