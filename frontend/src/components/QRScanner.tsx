'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess }: { onScanSuccess: (decodedText: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (err) => {
        // Handle scan failure silently to prevent spam
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; position: relative; }
        #reader video { object-fit: cover; }
        #reader button { background: #06b6d4; color: white; padding: 8px 16px; border-radius: 8px; margin: 8px; border: 1px solid rgba(59,130,246,0.3); font-family: monospace; font-weight: bold; }
        #reader__dashboard_section_csr span { color: white !important; font-family: monospace; }
        #reader__scan_region { position: relative; overflow: hidden; }
      `}} />
      <div className="relative rounded-xl overflow-hidden group">
        <div id="reader" className="w-full bg-black"></div>
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 border-[4px] border-blue-500/20 rounded-xl" />
        
        {/* Corner Reticles */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-blue-400 rounded-tl-xl pointer-events-none z-20" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-blue-400 rounded-tr-xl pointer-events-none z-20" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-blue-400 rounded-bl-xl pointer-events-none z-20" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-blue-400 rounded-br-xl pointer-events-none z-20" />
        
        {/* Laser Sweep */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_20px_4px_rgba(59,130,246,0.8)] pointer-events-none z-30 animate-scan-sweep" />
      </div>
    </div>
  );
}
