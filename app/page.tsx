import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight, Blocks, Activity, Fuel, Clock } from "lucide-react"
import { getLatestEVVMBlocks, getLatestEVVMTransactions, getEVVMStats } from "@/lib/api/amp"
import { formatRelativeTime, formatAddress, formatEVVMValue, formatNumber } from "@/lib/utils/format"
import { BASE_CHAIN } from "@/lib/config"

export default async function HomePage() {
  // Obtener datos de Amp
  const [latestBlocks, latestTransactions, stats] = await Promise.all([
    getLatestEVVMBlocks(5),
    getLatestEVVMTransactions(5),
    getEVVMStats(),
  ])
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Stats Section */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Blocks</p>
                      <p className="text-2xl font-bold text-primary">{formatNumber(stats.totalBlocks)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Bloques virtuales EVVM</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Latest Block</p>
                      <p className="text-2xl font-bold text-primary">{formatNumber(stats.latestBlock)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {latestBlocks[0] ? formatRelativeTime(latestBlocks[0].timestamp) : "N/A"}
                      </p>
                    </div>
                    <Blocks className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Network</p>
                      <p className="text-2xl font-bold text-primary">{BASE_CHAIN.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Cadena base</p>
                    </div>
                    <Fuel className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Transactions (24h)</p>
                      <p className="text-2xl font-bold text-primary">{formatNumber(stats.totalTransactions24h)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stats.tps.toFixed(2)} TPS</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Latest Blocks and Transactions */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Blocks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Latest Blocks</span>
                  <Link
                    href="/blocks"
                    className="text-sm font-normal text-primary hover:underline flex items-center gap-1"
                  >
                    View all blocks
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestBlocks.length > 0 ? (
                    latestBlocks.map((block) => (
                      <div key={block.blockId} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <Blocks className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Link
                              href={`/block/${block.blockId}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                              {formatNumber(block.blockId)}
                          </Link>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(block.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                          {block.executor && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Executor:{" "}
                              <Link
                                href={`/address/${block.executor}`}
                                className="font-mono text-primary hover:underline"
                              >
                                {formatAddress(block.executor)}
                          </Link>
                        </p>
                          )}
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <Badge variant="secondary" className="text-xs">
                              {block.transactionCount} txns
                            </Badge>
                            <Badge variant={block.status === "finalized" ? "default" : "outline"} className="text-xs">
                              {block.status}
                          </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay bloques disponibles</p>
                      <p className="text-xs mt-2">Configura tu endpoint de Amp para ver datos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Latest Transactions</span>
                  <Link
                    href="/txs"
                    className="text-sm font-normal text-primary hover:underline flex items-center gap-1"
                  >
                    View all transactions
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestTransactions.length > 0 ? (
                    latestTransactions.map((tx) => (
                      <div key={tx.transactionId} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Link
                              href={`/tx/${tx.transactionId}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                              {formatAddress(tx.hash, 8, 6)}
                          </Link>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">
                          From{" "}
                          <Link href={`/address/${tx.from}`} className="font-mono text-primary hover:underline">
                              {formatAddress(tx.from)}
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          To{" "}
                          <Link href={`/address/${tx.to}`} className="font-mono text-primary hover:underline">
                              {formatAddress(tx.to)}
                          </Link>
                        </p>
                          <p className="text-sm text-primary font-medium mt-1">
                            {formatEVVMValue(tx.value)} EVVM
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay transacciones disponibles</p>
                      <p className="text-xs mt-2">Configura tu endpoint de Amp para ver datos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
