import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react"
import { getEVVMTransactionsPaginated } from "@/lib/api/amp"
import { formatRelativeTime, formatAddress, formatEVVMValue, formatHash } from "@/lib/utils/format"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number.parseInt(pageParam || "1", 10)
  const limit = 20
  const offset = (page - 1) * limit

  const transactions = await getEVVMTransactionsPaginated(limit, offset)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transacciones EVVM</h1>
          <p className="text-muted-foreground">Explora todas las transacciones de la red EVVM</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b last:border-0 hover:bg-muted/50 rounded-md px-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {tx.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/tx/${tx.transactionId}`}
                          className="font-mono text-sm font-medium text-primary hover:underline block"
                        >
                          {formatHash(tx.hash)}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>De:</span>
                            <Link
                              href={`/address/${tx.from}`}
                              className="font-mono text-primary hover:underline"
                            >
                              {formatAddress(tx.from)}
                            </Link>
                            <ArrowUpRight className="h-3 w-3" />
                            <span>Para:</span>
                            <Link
                              href={`/address/${tx.to}`}
                              className="font-mono text-primary hover:underline"
                            >
                              {formatAddress(tx.to)}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Bloque:</span>
                            <Link
                              href={`/block/${tx.blockId}`}
                              className="font-mono text-primary hover:underline"
                            >
                              #{tx.blockId}
                            </Link>
                            <span className="mx-2">•</span>
                            <span>{formatRelativeTime(tx.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary mb-1">
                          {formatEVVMValue(tx.value)} EVVM
                        </div>
                        <Badge
                          variant={tx.status === "success" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {tx.status === "success" ? "Éxito" : "Fallida"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowUpRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay transacciones disponibles</p>
                  <p className="text-xs mt-2">Las transacciones aparecerán cuando haya actividad en la red</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {offset + 1}-{offset + transactions.length} de transacciones
                </div>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/txs?page=${page - 1}`}
                      className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                    >
                      Anterior
                    </Link>
                  )}
                  {transactions.length === limit && (
                    <Link
                      href={`/txs?page=${page + 1}`}
                      className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                    >
                      Siguiente
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

