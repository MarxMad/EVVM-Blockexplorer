import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

// Mock data - in a real app, this would come from your blockchain API
const blockData = {
  number: 18234567,
  timestamp: "2024-01-15 14:32:45 UTC",
  transactions: 234,
  miner: "0x1234567890abcdef1234567890abcdef12345678",
  reward: "2.5",
  difficulty: "58,750,003,716,598,352,816,469",
  totalDifficulty: "58,750,003,716,598,352,816,469,123",
  size: "89,456 bytes",
  gasUsed: "29,832,456",
  gasLimit: "30,000,000",
  baseFeePerGas: "23.5 Gwei",
  burntFees: "0.701 EVVM",
  extraData: "0x476574682f76312e302e302f6c696e75782f676f312e31362e33",
  hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  parentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  stateRoot: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
  nonce: "0x0000000000000000",
}

const blockTransactions = [
  { hash: "0xabcd...ef12", from: "0x1111...2222", to: "0x3333...4444", value: "0.5", fee: "0.002" },
  { hash: "0x1234...5678", from: "0x5555...6666", to: "0x7777...8888", value: "1.2", fee: "0.003" },
  { hash: "0x9876...5432", from: "0x9999...aaaa", to: "0xbbbb...cccc", value: "0.3", fee: "0.001" },
  { hash: "0xfedc...ba98", from: "0xdddd...eeee", to: "0xffff...0000", value: "2.1", fee: "0.004" },
  { hash: "0x2468...1357", from: "0x1357...2468", to: "0x9876...5432", value: "0.8", fee: "0.002" },
]

export default function BlockDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Block Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Block <span className="text-primary">#{blockData.number}</span>
          </h1>
          <p className="text-muted-foreground">Block details and transactions</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="consensus">Consensus Info</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Block Information Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Block Height:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">{blockData.number}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Status:</div>
                    <div className="md:col-span-2">
                      <Badge className="bg-primary text-primary-foreground">Finalized</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Timestamp:</div>
                    <div className="md:col-span-2 font-mono text-sm">{blockData.timestamp} (12 secs ago)</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Transactions:</div>
                    <div className="md:col-span-2">
                      <Link href="#transactions" className="text-primary hover:underline font-medium">
                        {blockData.transactions} transactions
                      </Link>{" "}
                      in this block
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Fee Recipient:</div>
                    <div className="md:col-span-2 font-mono text-sm">
                      <Link href={`/address/${blockData.miner}`} className="text-primary hover:underline">
                        {blockData.miner}
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Block Reward:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                      {blockData.reward} EVVM
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Total Difficulty:</div>
                    <div className="md:col-span-2 font-mono text-sm">{blockData.totalDifficulty}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Size:</div>
                    <div className="md:col-span-2 font-mono text-sm">{blockData.size}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Gas Used:</div>
                    <div className="md:col-span-2 font-mono text-sm">
                      {blockData.gasUsed} (
                      {(
                        (Number.parseFloat(blockData.gasUsed.replace(/,/g, "")) /
                          Number.parseFloat(blockData.gasLimit.replace(/,/g, ""))) *
                        100
                      ).toFixed(2)}
                      %)
                      <div className="w-full bg-secondary h-2 rounded-full mt-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(Number.parseFloat(blockData.gasUsed.replace(/,/g, "")) / Number.parseFloat(blockData.gasLimit.replace(/,/g, ""))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Gas Limit:</div>
                    <div className="md:col-span-2 font-mono text-sm">{blockData.gasLimit}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Base Fee Per Gas:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                      {blockData.baseFeePerGas}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Burnt Fees:</div>
                    <div className="md:col-span-2 font-mono text-sm text-destructive">🔥 {blockData.burntFees}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Extra Data:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">{blockData.extraData}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Hash:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all text-primary">{blockData.hash}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Parent Hash:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">
                      <Link href={`/block/${blockData.number - 1}`} className="text-primary hover:underline">
                        {blockData.parentHash}
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                    <div className="text-sm text-muted-foreground">State Root:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all">{blockData.stateRoot}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card id="transactions">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Transactions
                  <span className="text-muted-foreground text-sm font-normal ml-2">
                    ({blockData.transactions} transactions)
                  </span>
                </h2>
                <div className="space-y-3">
                  {blockTransactions.map((tx, idx) => (
                    <div
                      key={tx.hash}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/tx/${tx.hash}`}
                            className="font-mono text-sm font-medium text-primary hover:underline block"
                          >
                            {tx.hash}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <span>From:</span>
                              <Link href={`/address/${tx.from}`} className="font-mono text-primary hover:underline">
                                {tx.from}
                              </Link>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>To:</span>
                              <Link href={`/address/${tx.to}`} className="font-mono text-primary hover:underline">
                                {tx.to}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">{tx.value} EVVM</div>
                          <div className="text-xs text-muted-foreground">Fee: {tx.fee} EVVM</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consensus">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Slot:</div>
                    <div className="md:col-span-2 font-mono text-sm font-medium text-primary">
                      {blockData.number + 1000}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Epoch:</div>
                    <div className="md:col-span-2 font-mono text-sm">{Math.floor(blockData.number / 32)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b">
                    <div className="text-sm text-muted-foreground">Proposer Index:</div>
                    <div className="md:col-span-2 font-mono text-sm text-primary">123456</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
                    <div className="text-sm text-muted-foreground">Block Root:</div>
                    <div className="md:col-span-2 font-mono text-xs break-all text-primary">{blockData.hash}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No withdrawals in this block</p>
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
