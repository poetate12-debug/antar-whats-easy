import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DriverRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  driverId: string;
  customerName: string;
  onSuccess?: () => void;
}

export default function DriverRatingModal({
  open,
  onOpenChange,
  orderId,
  driverId,
  customerName,
  onSuccess,
}: DriverRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Pilih rating',
        description: 'Silakan pilih rating terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('driver_ratings').insert({
      order_id: orderId,
      driver_id: driverId,
      customer_name: customerName,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      toast({
        title: 'Gagal mengirim rating',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Terima kasih!',
        description: 'Rating Anda telah dikirim',
      });
      onSuccess?.();
      onOpenChange(false);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beri Rating Driver</DialogTitle>
          <DialogDescription>
            Bagaimana pengalaman Anda dengan pengantaran kali ini?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0 && 'Ketuk bintang untuk memberi rating'}
            {rating === 1 && 'Sangat Buruk'}
            {rating === 2 && 'Buruk'}
            {rating === 3 && 'Cukup'}
            {rating === 4 && 'Baik'}
            {rating === 5 && 'Sangat Baik'}
          </p>

          {/* Comment */}
          <Textarea
            placeholder="Tulis komentar (opsional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
