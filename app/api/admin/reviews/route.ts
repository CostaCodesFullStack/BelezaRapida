import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const approved = searchParams.get("approved");

    const where: any = {};

    if (approved !== null) {
      where.approved = approved === "true";
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: { name: true },
        },
        profile: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      productName: review.product.name,
      profileName: review.profile.name,
      rating: review.rating,
      title: review.title,
      content: review.content,
      approved: review.approved,
      createdAt: review.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { message: "Erro ao buscar avaliações" },
      { status: 500 },
    );
  }
}
