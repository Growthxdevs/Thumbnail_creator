"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentSuccessProps {
  open: boolean;
  onClose: () => void;
  paymentId?: string;
}

export default function PaymentSuccess({
  open,
  onClose,
  paymentId,
}: PaymentSuccessProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your subscription has been activated successfully. You now have
            access to all premium features.
            {paymentId && (
              <div className="mt-2 text-xs text-gray-500">
                Payment ID: {paymentId}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
