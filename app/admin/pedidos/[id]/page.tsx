import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";
import { prisma } from "@/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusForm } from "./order-status-form";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: { items: { include: { product: true } }, profile: true },
  });

  if (!order) {
    notFound();
  }

  // Parses address from JSON if stored as stringified JSON in DB
  let addressInfo: any = {};
  try {
    addressInfo = JSON.parse(order.shippingAddress);
  } catch (e) {
    // If not JSON, we'll just display the raw string
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/pedidos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Pedido{" "}
            <span className="text-muted-foreground text-xl">
              #{order.id.slice(-8).toUpperCase()}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Realizado em {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span>R$ {order.shippingCost.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>- R$ {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm
                orderId={order.id}
                initialStatus={order.status}
                initialTrackingCode={order.trackingCode}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              <p className="text-muted-foreground">{order.customerPhone}</p>
              {order.customerCpf && (
                <p className="text-muted-foreground">
                  CPF: {order.customerCpf}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {addressInfo.street ? (
                <>
                  <p>
                    {addressInfo.street}, {addressInfo.number}{" "}
                    {addressInfo.complement
                      ? ` - ${addressInfo.complement}`
                      : ""}
                  </p>
                  <p>{addressInfo.neighborhood}</p>
                  <p>
                    {addressInfo.city} - {addressInfo.state}
                  </p>
                  <p>CEP: {addressInfo.zipCode}</p>
                </>
              ) : (
                <p>{order.shippingAddress}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
