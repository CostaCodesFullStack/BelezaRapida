import { prisma } from "@/prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ReviewActionButtons } from "./review-action-buttons";

export const dynamic = "force-dynamic";

// Tipo auxiliar para inferir a resposta do Prisma
type ReviewWithRelations = {
  id: string;
  productId: string;
  profileId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
  product: { name: string };
  profile: { name: string | null; email: string };
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      profile: { select: { name: true, email: true } },
    },
  }) as unknown as ReviewWithRelations[];

  const pendingCount = reviews.filter((r: ReviewWithRelations) => r.approved === false).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground">
            Moderar avaliações de clientes nos produtos
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.map((review: ReviewWithRelations) => (
          <Card key={review.id} className={review.approved ? "border-muted" : "border-primary/50"}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {review.product.name}
                </CardTitle>
                <CardDescription>
                  Por {review.profile?.name || review.profile?.email} em {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </div>
              <Badge variant={review.approved ? "outline" : "secondary"}>
                {review.approved ? "Aprovado" : "Pendente/Rejeitado"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => {
                  const StarIcon = Star as any;
                  return (
                    <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "stroke-muted-foreground opacity-30"}`} />
                  )
                })}
              </div>
              <div>
                <h4 className="font-medium text-sm">{review.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{review.content}</p>
              </div>
              <div className="pt-4 flex justify-end border-t mt-4">
                <ReviewActionButtons reviewId={review.id} currentStatus={review.approved} />
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            Nenhuma avaliação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
