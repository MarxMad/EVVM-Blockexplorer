import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { CheckCircle2, AlertCircle, ExternalLink, Copy, ArrowLeft, ArrowRight } from "lucide-react"
import { getEVVMTransactionById } from "@/lib/api/amp"
import { formatTimestamp, formatRelativeTime, formatAddress, formatEVVMValue, formatHash, formatNonceType } from "@/lib/utils/format"
import { BASE_CHAIN } from "@/lib/config"
import { notFound } from "next/navigation"
import { CopyButton } from "@/components/copy-button"

export default async function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const transactionData = await getEVVMTransactionById(id)

  if (!transactionData) {
    notFound()
  }

  const isSuccess = transactionData.status === "success"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Transaction Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Detalles de Transacción</h1>
              {isSuccess ? (
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Éxito
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Fallida
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/block/${transactionData.blockId}`}
                className="p-2 hover:bg-muted rounded-md"
                title="Ver bloque anterior"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`/block/${transactionData.blockId + 1}`}
                className="p-2 hover:bg-muted rounded-md"
                title="Ver bloque siguiente"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground font-mono text-sm break-all">{transactionData.hash}</p>
            <CopyButton text={transactionData.hash} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Transaction Information Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
              {/* Transaction Hash */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground flex items-center gap-2">Hash de Transacción:</div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="font-mono text-xs break-all text-primary">{transactionData.hash}</span>
                  <CopyButton text={transactionData.hash} />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Estado:</div>
                <div className="md:col-span-2">
                  {isSuccess ? (
                    <Badge className="bg-green-500 text-white flex items-center gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" />
                      Éxito
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <AlertCircle className="h-3 w-3" />
                      Fallida
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Bloque EVVM:</div>
                <div className="md:col-span-2">
                  <Link
                    href={`/block/${transactionData.blockId}`}
                    className="text-primary hover:underline font-mono font-medium"
                  >
                    #{transactionData.blockId}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Timestamp:</div>
                <div className="md:col-span-2 font-mono text-sm">
                  {formatTimestamp(transactionData.timestamp)} ({formatRelativeTime(transactionData.timestamp)})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Tipo de Nonce:</div>
                <div className="md:col-span-2">
                  <Badge variant="outline">{formatNonceType(transactionData.nonceType)}</Badge>
                </div>
              </div>

              {transactionData.executor && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                  <div className="text-sm text-muted-foreground">Executor:</div>
                  <div className="md:col-span-2 font-mono text-sm">
                    <Link href={`/address/${transactionData.executor}`} className="text-primary hover:underline">
                      {transactionData.executor}
                    </Link>
                  </div>
                </div>
              )}

              {/* Separator */}
              <div className="py-2"></div>

              {/* From/To */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">De:</div>
                <div className="md:col-span-2 font-mono text-sm break-all">
                  <Link href={`/address/${transactionData.from}`} className="text-primary hover:underline">
                    {transactionData.from}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Para:</div>
                <div className="md:col-span-2 font-mono text-sm break-all">
                  <Link href={`/address/${transactionData.to}`} className="text-primary hover:underline">
                    {transactionData.to}
                  </Link>
                </div>
              </div>

              {/* Separator */}
              <div className="py-2"></div>

              {/* Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Valor:</div>
                <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                  {formatEVVMValue(transactionData.value)} EVVM
                </div>
              </div>

              {transactionData.fee && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                  <div className="text-sm text-muted-foreground">Fee:</div>
                  <div className="md:col-span-2 font-mono text-sm">{formatEVVMValue(transactionData.fee)} EVVM</div>
                </div>
              )}

              {transactionData.gasUsed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                  <div className="text-sm text-muted-foreground">Gas Usado:</div>
                  <div className="md:col-span-2 font-mono text-sm">{transactionData.gasUsed}</div>
                </div>
              )}

              {/* Separator */}
              <div className="py-2"></div>

              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Nonce:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.nonce}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Transacción L1:</div>
                <div className="md:col-span-2 font-mono text-xs break-all">
                  <a
                    href={`${BASE_CHAIN.explorerUrl}/tx/${transactionData.l1TransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {formatHash(transactionData.l1TransactionHash)}
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </div>
              </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Información Técnica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Tipo de Nonce:</div>
                    <div className="md:col-span-2">
                      <Badge variant="outline">{formatNonceType(transactionData.nonceType)}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Nonce:</div>
                    <div className="md:col-span-2 font-mono text-sm">{transactionData.nonce}</div>
                  </div>

                  {transactionData.executor && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                      <div className="text-sm text-muted-foreground">Executor:</div>
                      <div className="md:col-span-2 font-mono text-sm">
                        <Link href={`/address/${transactionData.executor}`} className="text-primary hover:underline">
                          {formatAddress(transactionData.executor)}
                        </Link>
                      </div>
                    </div>
                  )}

                  {transactionData.fee && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                      <div className="text-sm text-muted-foreground">Fee:</div>
                      <div className="md:col-span-2 font-mono text-sm">{formatEVVMValue(transactionData.fee)} EVVM</div>
                    </div>
                  )}

                  {transactionData.gasUsed && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                      <div className="text-sm text-muted-foreground">Gas Usado:</div>
                      <div className="md:col-span-2 font-mono text-sm">{transactionData.gasUsed}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Transacción L1:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">
                      <a
                        href={`${BASE_CHAIN.explorerUrl}/tx/${transactionData.l1TransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {formatHash(transactionData.l1TransactionHash)}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>

                  {transactionData.inputData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                      <div className="text-sm text-muted-foreground">Input Data:</div>
                      <div className="md:col-span-2">
                        <div className="bg-muted p-3 rounded-md">
                          <code className="font-mono text-xs break-all">{transactionData.inputData}</code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Los datos de entrada para esta transacción</p>
                      </div>
                    </div>
                  )}
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
