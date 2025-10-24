import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  challenge: string;
}

export default function VerificationModal({ open, onClose, challenge }: VerificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0329] border-4 border-primary max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-black uppercase text-center" data-testid="text-modal-title">
            VERIFY WITH SELF
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-white text-center text-sm" data-testid="text-modal-challenge">
            Challenge: <span className="font-bold">{challenge}</span>
          </p>
          <div className="bg-white p-6 flex items-center justify-center border-2 border-primary" data-testid="container-qr-code">
            <QrCode className="w-32 h-32 text-black" />
            <div className="absolute text-xs text-center">
              <p className="font-bold">Scan with</p>
              <p className="font-bold">Self App</p>
            </div>
          </div>
          <p className="text-white text-xs text-center uppercase font-black tracking-wide" data-testid="text-modal-instruction">
            Open your Self app and scan to verify
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
