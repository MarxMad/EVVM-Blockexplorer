import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { getEVVMBlockById, getEVVMBlockTransactions } from "@/lib/api/amp"
import { formatTimestamp, formatRelativeTime, formatAddress, formatEVVMValue, formatHash } from "@/lib/utils/format"
import { BASE_CHAIN } from "@/lib/config"
import { notFound } from "next/navigation"

export default async function BlockDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blockId = Number.parseInt(id, 10)

  if (Number.isNaN(blockId)) {
    notFound()
  }

  const [blockData, blockTransactions] = await Promise.all([
    getEVVMBlockById(blockId),
    getEVVMBlockTransactions(blockId),
  ])

  if (!blockData) {
    notFound()
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Block Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Bloque EVVM <span className="text-primary">#{blockData.blockId}</span>
          </h1>
          <p className="text-muted-foreground">Detalles del bloque virtual y transacciones</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="l1">Transacción L1</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Block Information Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">ID del Bloque:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                      {blockData.blockId}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Estado:</div>
                    <div className="md:col-span-2">
                      <Badge
                        className={
                          blockData.status === "finalized"
                            ? "bg-primary text-primary-foreground"
                            : "bg-yellow-500 text-white"
                        }
                      >
                        {blockData.status === "finalized" ? "Finalizado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Timestamp:</div>
                    <div className="md:col-span-2 font-mono text-sm">
                      {formatTimestamp(blockData.timestamp)} ({formatRelativeTime(blockData.timestamp)})
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Transacciones:</div>
                    <div className="md:col-span-2">
                      <Link href="#transactions" className="text-primary hover:underline font-medium">
                        {blockData.transactionCount} transacciones
                      </Link>{" "}
                      en este bloque
                    </div>
                  </div>

                  {blockData.executor && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                      <div className="text-sm text-muted-foreground">Executor:</div>
                    <div className="md:col-span-2 font-mono text-sm">
                        <Link href={`/address/${blockData.executor}`} className="text-primary hover:underline">
                          {blockData.executor}
                      </Link>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Hash del Bloque:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all text-primary">{blockData.hash}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Hash del Bloque Padre:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">
                      {blockData.parentHash ? (
                        <Link
                          href={`/block/${blockData.blockId - 1}`}
                          className="text-primary hover:underline"
                        >
                          {formatHash(blockData.parentHash)}
                      </Link>
                      ) : (
                        <span className="text-muted-foreground">Bloque génesis</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                    <div className="text-sm text-muted-foreground">Transacción L1:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">
                      <a
                        href={`${BASE_CHAIN.explorerUrl}/tx/${blockData.l1TransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {formatHash(blockData.l1TransactionHash)}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card id="transactions">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Transacciones
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                      ({blockTransactions.length} de {blockData.transactionCount} transacciones)
                    </span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {blockTransactions.length > 0 ? (
                    blockTransactions.map((tx, index) => (
                    <div
                        key={tx.transactionId || index}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b last:border-0 hover:bg-muted/50 rounded-md px-3 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          {tx.transactionId ? (
                            <Link
                              href={`/tx/${tx.transactionId}`}
                              className="font-mono text-sm font-medium text-primary hover:underline block"
                            >
                              {formatHash(tx.hash)}
                            </Link>
                          ) : (
                            <span className="font-mono text-sm font-medium text-muted-foreground block">
                              {formatHash(tx.hash)}
                            </span>
                          )}
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <span>De:</span>
                              {tx.from !== "0x0000000000000000000000000000000000000000" ? (
                                <Link href={`/address/${tx.from}`} className="font-mono text-primary hover:underline">
                                  {formatAddress(tx.from)}
                                </Link>
                              ) : (
                                <span className="font-mono text-muted-foreground">Sistema</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Para:</span>
                              <Link href={`/address/${tx.to}`} className="font-mono text-primary hover:underline">
                                {formatAddress(tx.to)}
                              </Link>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatRelativeTime(tx.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:flex-shrink-0">
                        <div className="text-right">
                            <div className="text-sm font-medium text-primary">
                              {formatEVVMValue(tx.value)} EVVM
                            </div>
                            {tx.fee && (
                              <div className="text-xs text-muted-foreground">Fee: {formatEVVMValue(tx.fee)} EVVM</div>
                            )}
                            <Badge
                              variant={tx.status === "success" ? "default" : "destructive"}
                              className="text-xs mt-1"
                            >
                              {tx.status === "success" ? "Éxito" : "Fallida"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay transacciones en este bloque</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="l1">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Hash de Transacción L1:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">
                      <a
                        href={`${BASE_CHAIN.explorerUrl}/tx/${blockData.l1TransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {blockData.l1TransactionHash}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Red Base:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                      {BASE_CHAIN.name} (Chain ID: {BASE_CHAIN.chainId})
                  </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                    <div className="text-sm text-muted-foreground">Explorador L1:</div>
                    <div className="md:col-span-2">
                      <a
                        href={`${BASE_CHAIN.explorerUrl}/tx/${blockData.l1TransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Ver en {BASE_CHAIN.explorerUrl}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
