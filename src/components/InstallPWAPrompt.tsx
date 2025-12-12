import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

export function InstallPWAPrompt() {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show prompt after 5 seconds if can install
    const timer = setTimeout(() => {
      if (canInstall && !dismissed) {
        setShow(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [canInstall, dismissed]);

  if (!show || dismissed) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-foreground">Instal AntarRasa</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Akses lebih cepat langsung dari home screen Anda
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Nanti Saja
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Instal
          </Button>
        </div>
      </div>
    </div>
  );
}