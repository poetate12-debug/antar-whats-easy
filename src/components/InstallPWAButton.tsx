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
      size="icon"
      className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12 w-12"
      onClick={handleInstall}
      title="Install Aplikasi"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
};

export default InstallPWAButton;
