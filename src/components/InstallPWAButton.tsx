import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { useToast } from "@/hooks/use-toast";

const InstallPWAButton = () => {
  const { canInstall, isInstalled, promptInstall } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    if (isInstalled) {
      toast({
        title: "Sudah Terinstal",
        description: "Aplikasi sudah terinstal di perangkat Anda",
      });
      return;
    }

    if (!canInstall) {
      // Provide helpful instructions based on browser/device
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      if (isStandalone) {
        toast({
          title: "Sudah Terinstal",
          description: "Untuk menghapus, tekan lama ikon aplikasi di home screen lalu pilih 'Hapus'",
        });
      } else if (isIOS || isSafari) {
        toast({
          title: "Cara Install di Safari",
          description: "Tap tombol Share (kotak dengan panah) lalu pilih 'Add to Home Screen'",
        });
      } else {
        toast({
          title: "Cara Install",
          description: "Buka menu browser (⋮) lalu pilih 'Install app' atau 'Add to Home Screen'",
        });
      }
      return;
    }

    const success = await promptInstall();
    if (success) {
      toast({
        title: "Berhasil!",
        description: "Aplikasi berhasil diinstal",
      });
    }
  };

  if (isInstalled) return null;

  return (
    <Button
      variant="outline"
      className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-10 px-3 sm:px-4 text-xs sm:text-sm gap-1.5 sm:gap-2 whitespace-nowrap"
      onClick={handleInstall}
      title="Install Aplikasi"
    >
      <Smartphone className="w-4 h-4 flex-shrink-0" />
      <span>Install</span>
    </Button>
  );
};

export default InstallPWAButton;
