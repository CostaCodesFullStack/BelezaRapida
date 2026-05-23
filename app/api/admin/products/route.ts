import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).optional(),
  description: z.string().min(10),
  category: z.enum([
    "SKINCARE",
    "HAIRCARE",
    "MAKEUP",
    "SUPPLEMENTS",
    "BODY",
    "FRAGRANCE",
  ]),
  price: z.number().positive(),
  compare_at_price: z.number().positive().optional(),
  stock: z.number().int().min(0),
  is_featured: z.boolean().optional(),
  is_buy_one_get_two: z.boolean().optional(),
  is_active: z.boolean().optional(),
  weight: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  images: z.array(z.string()).optional(),
});

// GET - Listar produtos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;

    const where: any = {
      is_active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { message: "Erro ao buscar produtos" },
      { status: 500 },
    );
  }
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Gerar slug a partir do nome se não fornecido
    const slug =
      validatedData.slug ||
      validatedData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // Verificar se slug já existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Produto com este slug já existe" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        compare_at_price: validatedData.compare_at_price,
        stock: validatedData.stock,
        is_featured: validatedData.is_featured || false,
        is_buy_one_get_two: validatedData.is_buy_one_get_two || false,
        is_active: validatedData.is_active !== false,
        weight: validatedData.weight,
        width: validatedData.width,
        height: validatedData.height,
        depth: validatedData.depth,
        images: validatedData.images || [],
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Erro ao criar produto" },
      { status: 500 },
    );
  }
}
