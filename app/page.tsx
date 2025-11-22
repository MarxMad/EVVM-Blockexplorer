import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight, Blocks, Activity, Fuel, Clock } from "lucide-react"

// Mock data - in a real app, this would come from your blockchain API
const latestBlocks = [
  { number: 18234567, miner: "0x1234...5678", txCount: 234, reward: "2.5", time: "12 secs ago" },
  { number: 18234566, miner: "0x8765...4321", txCount: 189, reward: "2.5", time: "24 secs ago" },
  { number: 18234565, miner: "0x2468...1357", txCount: 156, reward: "2.5", time: "36 secs ago" },
  { number: 18234564, miner: "0x9753...8642", txCount: 203, reward: "2.5", time: "48 secs ago" },
  { number: 18234563, miner: "0x3691...2580", txCount: 178, reward: "2.5", time: "1 min ago" },
]

const latestTransactions = [
  { hash: "0xabcd...ef12", from: "0x1111...2222", to: "0x3333...4444", value: "0.5", time: "5 secs ago" },
  { hash: "0x1234...5678", from: "0x5555...6666", to: "0x7777...8888", value: "1.2", time: "8 secs ago" },
  { hash: "0x9876...5432", from: "0x9999...aaaa", to: "0xbbbb...cccc", value: "0.3", time: "12 secs ago" },
  { hash: "0xfedc...ba98", from: "0xdddd...eeee", to: "0xffff...0000", value: "2.1", time: "15 secs ago" },
  { hash: "0x2468...1357", from: "0x1357...2468", to: "0x9876...5432", value: "0.8", time: "18 secs ago" },
]

export default function HomePage() {
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
                      <p className="text-sm text-muted-foreground mb-1">EVVM Price</p>
                      <p className="text-2xl font-bold text-primary">$2,845.32</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-primary">+2.3%</span> (24h)
                      </p>
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
                      <p className="text-2xl font-bold text-primary">18,234,567</p>
                      <p className="text-xs text-muted-foreground mt-1">12 secs ago</p>
                    </div>
                    <Blocks className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg. Gas Price</p>
                      <p className="text-2xl font-bold text-primary">23 Gwei</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-destructive">-5.2%</span> vs yesterday
                      </p>
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
                      <p className="text-2xl font-bold text-primary">1.2M</p>
                      <p className="text-xs text-muted-foreground mt-1">14.3 TPS</p>
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
                  {latestBlocks.map((block) => (
                    <div key={block.number} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <Blocks className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Link
                            href={`/block/${block.number}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                            {block.number}
                          </Link>
                          <p className="text-xs text-muted-foreground">{block.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Miner:{" "}
                          <Link href={`/address/${block.miner}`} className="font-mono text-primary hover:underline">
                            {block.miner}
                          </Link>
                        </p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {block.txCount} txns
                          </Badge>
                          <span className="text-xs text-primary font-medium">{block.reward} EVVM</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {latestTransactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Link
                            href={`/tx/${tx.hash}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                            {tx.hash}
                          </Link>
                          <p className="text-xs text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">
                          From{" "}
                          <Link href={`/address/${tx.from}`} className="font-mono text-primary hover:underline">
                            {tx.from}
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          To{" "}
                          <Link href={`/address/${tx.to}`} className="font-mono text-primary hover:underline">
                            {tx.to}
                          </Link>
                        </p>
                        <p className="text-sm text-primary font-medium mt-1">{tx.value} EVVM</p>
                      </div>
                    </div>
                  ))}
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
