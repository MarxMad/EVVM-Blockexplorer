import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { getEVVMAddress, getEVVMAddressTransactions } from "@/lib/api/amp"
import { formatRelativeTime, formatAddress, formatEVVMValue, formatHash, formatNumber } from "@/lib/utils/format"
import { notFound } from "next/navigation"

export default async function AddressDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const address = id.toLowerCase()

  const [addressData, addressTransactions] = await Promise.all([
    getEVVMAddress(address),
    getEVVMAddressTransactions(address, 20, 0),
  ])

  if (!addressData) {
    notFound()
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Address Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Dirección EVVM</h1>
            <Badge variant="secondary">Cuenta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground font-mono text-sm break-all">{addressData.address}</p>
            <CopyButton text={addressData.address} />
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatEVVMValue(addressData.balance)} EVVM
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Balance de la dirección</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Transacciones</p>
                <p className="text-2xl font-bold text-primary">{formatNumber(addressData.totalTransactions)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transacciones Entrantes</p>
                <p className="text-2xl font-bold text-primary">{formatNumber(addressData.incomingTransactions)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(addressData.outgoingTransactions)} salientes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Últimas {addressTransactions.length} transacciones de un total de{" "}
                    {formatNumber(addressData.totalTransactions)} transacciones
                  </p>
                </div>
                <div className="space-y-3">
                  {addressTransactions.length > 0 ? (
                    addressTransactions.map((tx) => {
                      const isIncoming = tx.to.toLowerCase() === address.toLowerCase()
                      return (
                    <div
                          key={tx.transactionId}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ArrowUpRight
                                className={`h-5 w-5 ${isIncoming ? "text-primary rotate-180" : "text-primary"}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                                  href={`/tx/${tx.transactionId}`}
                              className="font-mono text-sm font-medium text-primary hover:underline"
                            >
                                  {formatHash(tx.hash)}
                            </Link>
                                <Badge variant={isIncoming ? "default" : "secondary"} className="text-xs">
                                  {isIncoming ? "ENTRANTE" : "SALIENTE"}
                                </Badge>
                                <Badge
                                  variant={tx.status === "success" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {tx.status === "success" ? "Éxito" : "Fallida"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                                  Bloque:{" "}
                                  <Link
                                    href={`/block/${tx.blockId}`}
                                    className="text-primary hover:underline font-mono"
                                  >
                                    {tx.blockId}
                              </Link>
                            </div>
                                <div>{formatRelativeTime(tx.timestamp)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 lg:flex-shrink-0">
                        <div className="min-w-0">
                              <div className="text-xs text-muted-foreground mb-1">De</div>
                          <Link
                            href={`/address/${tx.from}`}
                            className="font-mono text-xs text-primary hover:underline block truncate max-w-[120px]"
                          >
                                {formatAddress(tx.from)}
                          </Link>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="min-w-0">
                              <div className="text-xs text-muted-foreground mb-1">Para</div>
                          <Link
                            href={`/address/${tx.to}`}
                            className="font-mono text-xs text-primary hover:underline block truncate max-w-[120px]"
                          >
                                {formatAddress(tx.to)}
                          </Link>
                        </div>
                        <div className="text-right">
                              <div className="text-sm font-medium text-primary">
                                {formatEVVMValue(tx.value)} EVVM
                        </div>
                              {tx.fee && (
                                <div className="text-xs text-muted-foreground">Fee: {formatEVVMValue(tx.fee)}</div>
                              )}
                      </div>
                    </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay transacciones para esta dirección</p>
                    </div>
                  )}
                </div>
                {addressTransactions.length > 0 && addressData.totalTransactions > addressTransactions.length && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline">Cargar Más</Button>
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
