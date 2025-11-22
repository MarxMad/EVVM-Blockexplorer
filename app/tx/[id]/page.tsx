import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"

// Mock data - in a real app, this would come from your blockchain API
const transactionData = {
  hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  status: "Success",
  block: 18234567,
  timestamp: "2024-01-15 14:32:45 UTC",
  from: "0x1111222233334444555566667777888899990000",
  to: "0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj",
  value: "0.5",
  transactionFee: "0.002156",
  gasPrice: "23.5 Gwei",
  gasLimit: "21000",
  gasUsed: "21000",
  gasUsedPercentage: "100",
  baseFee: "22.1 Gwei",
  maxFee: "30 Gwei",
  maxPriorityFee: "2 Gwei",
  burntFees: "0.000464",
  nonce: 456,
  position: 42,
  inputData: "0x",
}

export default function TransactionDetailsPage({ params }: { params: { id: string } }) {
  const isSuccess = transactionData.status === "Success"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Transaction Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
          <p className="text-muted-foreground font-mono text-sm break-all">{transactionData.hash}</p>
        </div>

        {/* Transaction Information Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground flex items-center gap-2">Transaction Hash:</div>
                <div className="md:col-span-2 font-mono text-xs break-all text-primary">{transactionData.hash}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Status:</div>
                <div className="md:col-span-2">
                  {isSuccess ? (
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <AlertCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Block:</div>
                <div className="md:col-span-2">
                  <Link href={`/block/${transactionData.block}`} className="text-primary hover:underline font-mono">
                    {transactionData.block}
                  </Link>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {Math.floor(Math.random() * 100) + 12} Block Confirmations
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Timestamp:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.timestamp} (2 mins ago)</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Transaction Action:</div>
                <div className="md:col-span-2">
                  <Badge variant="outline">Transfer</Badge>
                </div>
              </div>

              {/* Separator */}
              <div className="py-2"></div>

              {/* From/To */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">From:</div>
                <div className="md:col-span-2 font-mono text-sm break-all">
                  <Link href={`/address/${transactionData.from}`} className="text-primary hover:underline">
                    {transactionData.from}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">To:</div>
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
                <div className="text-sm text-muted-foreground">Value:</div>
                <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                  {transactionData.value} EVVM
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Transaction Fee:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.transactionFee} EVVM</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Gas Price:</div>
                <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                  {transactionData.gasPrice}
                </div>
              </div>

              {/* Separator */}
              <div className="py-2"></div>

              {/* Gas Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Gas Limit:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.gasLimit}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Gas Used:</div>
                <div className="md:col-span-2 font-mono text-sm">
                  {transactionData.gasUsed} ({transactionData.gasUsedPercentage}%)
                  <div className="w-full bg-secondary h-2 rounded-full mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${transactionData.gasUsedPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Base Fee:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.baseFee}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Max Fee Per Gas:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.maxFee}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Max Priority Fee:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.maxPriorityFee}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Burnt Fees:</div>
                <div className="md:col-span-2 font-mono text-sm text-destructive">
                  🔥 {transactionData.burntFees} EVVM
                </div>
              </div>

              {/* Separator */}
              <div className="py-2"></div>

              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Nonce:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.nonce}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                <div className="text-sm text-muted-foreground">Position in Block:</div>
                <div className="md:col-span-2 font-mono text-sm">{transactionData.position}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                <div className="text-sm text-muted-foreground">Input Data:</div>
                <div className="md:col-span-2">
                  <div className="bg-muted p-3 rounded-md">
                    <code className="font-mono text-xs break-all">{transactionData.inputData}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">The input data for this transaction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
