import { Download } from "lucide-react";
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
      toast({
        title: "Tidak Dapat Diinstal",
        description: "Buka di browser dan coba lagi",
        variant: "destructive",
      });
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
      className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-10 px-4 text-sm gap-2"
      onClick={handleInstall}
      title="Install Aplikasi"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install</span>
    </Button>
  );
};

export default InstallPWAButton;
