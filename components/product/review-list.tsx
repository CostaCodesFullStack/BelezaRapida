import type { Review } from "@/types/database";
import { Star, User } from "lucide-react";
import { formatRelativeDate } from "@/lib/format";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Este produto ainda não possui avaliações. Seja o primeiro a avaliar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {reviews.length} {reviews.length === 1 ? "Avaliação" : "Avaliações"}
      </h3>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Usuário Anônimo</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(review.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h4 className="mt-3 font-medium">{review.title}</h4>
            )}

            {review.content && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {review.content}
              </p>
            )}

            {!review.approved && (
              <p className="mt-3 text-xs text-warning-foreground bg-warning/10 rounded px-2 py-1 inline-block">
                Aguardando aprovação
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
