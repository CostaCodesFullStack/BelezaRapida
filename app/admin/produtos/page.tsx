import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { prisma } from "@/prisma/client";
import { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const categoryLabels: Record<ProductCategory, string> = {
  SKINCARE: "Cuidados com a Pele",
  HAIRCARE: "Cuidados com o Cabelo",
  MAKEUP: "Maquiagem",
  SUPPLEMENTS: "Suplementos",
  BODY: "Corpo",
  FRAGRANCE: "Fragrâncias",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerenciar catálogo de produtos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="mr-2 h-5 w-5" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} categoryLabels={categoryLabels} />
        </CardContent>
      </Card>
    </div>
  );
}
