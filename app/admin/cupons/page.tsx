import { prisma } from "@/prisma/client";
import { CouponsTable } from "@/components/admin/coupons-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewCouponDialog } from "./new-coupon-dialog";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cupons</h1>
          <p className="text-muted-foreground">Gerenciar cupons de desconto</p>
        </div>
        <NewCouponDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponsTable coupons={coupons} />
        </CardContent>
      </Card>
    </div>
  );
}
