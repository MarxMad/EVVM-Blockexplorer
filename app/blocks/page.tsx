import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Blocks, ArrowUpRight } from "lucide-react"
import { getEVVMBlocksPaginated } from "@/lib/api/amp"
import { formatRelativeTime, formatAddress, formatNumber } from "@/lib/utils/format"

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number.parseInt(pageParam || "1", 10)
  const limit = 20
  const offset = (page - 1) * limit

  const blocks = await getEVVMBlocksPaginated(limit, offset)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Bloques EVVM</h1>
          <p className="text-muted-foreground">Explora todos los bloques de la red EVVM</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Bloques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blocks.length > 0 ? (
                blocks.map((block) => (
                  <div
                    key={block.blockId}
                    className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-muted/50 rounded-md px-3 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Blocks className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <Link
                          href={`/block/${block.blockId}`}
                          className="font-mono text-lg font-medium text-primary hover:underline"
                        >
                          #{formatNumber(block.blockId)}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(block.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(block.transactionCount)} txns
                        </Badge>
                        <Badge
                          variant={block.status === "finalized" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {block.status === "finalized" ? "Finalizado" : "Pendiente"}
                        </Badge>
                      </div>
                      {block.executor && (
                        <p className="text-xs text-muted-foreground">
                          Executor:{" "}
                          <Link
                            href={`/address/${block.executor}`}
                            className="font-mono text-primary hover:underline"
                          >
                            {formatAddress(block.executor)}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay bloques disponibles</p>
                  <p className="text-xs mt-2">Los bloques aparecerán cuando haya transacciones en la red</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {blocks.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {offset + 1}-{offset + blocks.length} de bloques
                </div>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/blocks?page=${page - 1}`}
                      className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                    >
                      Anterior
                    </Link>
                  )}
                  {blocks.length === limit && (
                    <Link
                      href={`/blocks?page=${page + 1}`}
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

