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
        #reader { border: none !important; }
        #reader button { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 8px; margin: 8px; }
        #reader__dashboard_section_csr span { color: white !important; }
      `}} />
      <div id="reader" className="w-full bg-white rounded-xl overflow-hidden"></div>
    </div>
  );
}
