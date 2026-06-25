'use client';

import { useEffect } from 'react';
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
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; position: relative; }
        #reader video { object-fit: cover; border-radius: 0.75rem; }
        #reader button { background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; margin: 8px; border: none; font-weight: 600; cursor: pointer; }
        #reader button:hover { background: #1d4ed8; }
        #reader__dashboard_section_csr span { color: #475569 !important; font-weight: 500; }
        #reader__scan_region { position: relative; overflow: hidden; border-radius: 0.75rem; }
      `}} />
      <div className="relative rounded-xl overflow-hidden group border border-slate-200">
        <div id="reader" className="w-full bg-slate-50"></div>
        {/* Clean Viewfinder Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 border-[2px] border-blue-500/30 rounded-xl" />
        
        {/* Simple Corner Markers */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-600 rounded-tl-lg pointer-events-none z-20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-600 rounded-tr-lg pointer-events-none z-20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-600 rounded-bl-lg pointer-events-none z-20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-600 rounded-br-lg pointer-events-none z-20" />
      </div>
    </div>
  );
}
