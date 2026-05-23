import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <DataTable
            columns={[
              {
                key: "images",
                label: "Foto",
                render: (value) => (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {value && value.length > 0 ? (
                      <img src={value[0]} alt="Produto" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem foto</span>
                    )}
                  </div>
                ),
              },
              {
                key: "name",
                label: "Nome",
              },
              {
                key: "category",
                label: "Categoria",
                render: (value: ProductCategory) => categoryLabels[value] || value,
              },
              {
                key: "price",
                label: "Preço",
                render: (value: number) => `R$ ${value.toFixed(2)}`,
              },
              {
                key: "stock",
                label: "Estoque",
                render: (value: number) => (
                  <Badge variant={value > 0 ? "default" : "destructive"}>
                    {value} unidades
                  </Badge>
                ),
              },
              {
                key: "is_active",
                label: "Status",
                render: (value: boolean) => (
                  <Badge variant={value ? "default" : "outline"}>
                    {value ? "Ativo" : "Inativo"}
                  </Badge>
                ),
              },
            ]}
            data={products}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
