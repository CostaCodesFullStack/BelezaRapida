"use client";

import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ProductCategory } from "@prisma/client";

interface Product {
  id: string;
  images: string[];
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  is_active: boolean;
}

interface ProductsTableProps {
  products: Product[];
  categoryLabels: Record<ProductCategory, string>;
}

export function ProductsTable({
  products,
  categoryLabels,
}: ProductsTableProps) {
  const columns = [
    {
      key: "images",
      label: "Foto",
      render: (value: string[]) => (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {value && value.length > 0 ? (
            <img
              src={value[0]}
              alt="Produto"
              className="object-cover w-full h-full"
            />
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
  ];

  return <DataTable columns={columns} data={products} loading={false} />;
}
