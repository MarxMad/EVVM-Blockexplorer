import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight, Wallet, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data - in a real app, this would come from your blockchain API
const addressData = {
  address: "0x1111222233334444555566667777888899990000",
  balance: "125.4567",
  balanceUSD: "356,789.23",
  totalTransactions: 1234,
}

const addressTransactions = [
  {
    hash: "0xabcd...ef12",
    block: 18234567,
    age: "5 mins ago",
    from: "0x1111...2222",
    to: "0x3333...4444",
    value: "0.5",
    fee: "0.002",
    type: "IN",
  },
  {
    hash: "0x1234...5678",
    block: 18234556,
    age: "12 mins ago",
    from: "0x5555...6666",
    to: "0x7777...8888",
    value: "1.2",
    fee: "0.003",
    type: "OUT",
  },
  {
    hash: "0x9876...5432",
    block: 18234543,
    age: "25 mins ago",
    from: "0x9999...aaaa",
    to: "0xbbbb...cccc",
    value: "0.3",
    fee: "0.001",
    type: "IN",
  },
  {
    hash: "0xfedc...ba98",
    block: 18234532,
    age: "1 hr ago",
    from: "0xdddd...eeee",
    to: "0xffff...0000",
    value: "2.1",
    fee: "0.004",
    type: "OUT",
  },
  {
    hash: "0x2468...1357",
    block: 18234521,
    age: "2 hrs ago",
    from: "0x1357...2468",
    to: "0x9876...5432",
    value: "0.8",
    fee: "0.002",
    type: "IN",
  },
]

const erc20Tokens = [
  { name: "USD Coin", symbol: "USDC", balance: "10,000", value: "$10,000" },
  { name: "Wrapped EVVM", symbol: "WEVVM", balance: "5.5", value: "$15,648" },
  { name: "Tether USD", symbol: "USDT", balance: "25,000", value: "$25,000" },
]

export default function AddressDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Address Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Address</h1>
            <Badge variant="secondary">Account</Badge>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground font-mono text-sm break-all">{addressData.address}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance</p>
                  <p className="text-2xl font-bold text-primary">{addressData.balance} EVVM</p>
                  <p className="text-xs text-muted-foreground mt-1">${addressData.balanceUSD}</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-primary">{addressData.totalTransactions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tokens</p>
                <p className="text-2xl font-bold text-primary">{erc20Tokens.length}</p>
                <p className="text-xs text-muted-foreground mt-1">ERC-20 Tokens</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="erc20">ERC-20 Token Txns</TabsTrigger>
            <TabsTrigger value="erc721">ERC-721 Token Txns</TabsTrigger>
            <TabsTrigger value="internal">Internal Txns</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Latest {addressTransactions.length} transactions from a total of {addressData.totalTransactions}{" "}
                    transactions
                  </p>
                </div>
                <div className="space-y-3">
                  {addressTransactions.map((tx) => (
                    <div
                      key={tx.hash}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ArrowUpRight
                            className={`h-5 w-5 ${tx.type === "IN" ? "text-primary rotate-180" : "text-primary"}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/tx/${tx.hash}`}
                              className="font-mono text-sm font-medium text-primary hover:underline"
                            >
                              {tx.hash}
                            </Link>
                            <Badge variant={tx.type === "IN" ? "default" : "secondary"} className="text-xs">
                              {tx.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              Block:{" "}
                              <Link href={`/block/${tx.block}`} className="text-primary hover:underline font-mono">
                                {tx.block}
                              </Link>
                            </div>
                            <div>{tx.age}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 lg:flex-shrink-0">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">From</div>
                          <Link
                            href={`/address/${tx.from}`}
                            className="font-mono text-xs text-primary hover:underline block truncate max-w-[120px]"
                          >
                            {tx.from}
                          </Link>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">To</div>
                          <Link
                            href={`/address/${tx.to}`}
                            className="font-mono text-xs text-primary hover:underline block truncate max-w-[120px]"
                          >
                            {tx.to}
                          </Link>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">{tx.value} EVVM</div>
                          <div className="text-xs text-muted-foreground">Fee: {tx.fee}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button variant="outline">Load More</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="erc20">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">ERC-20 token holdings for this address</p>
                </div>
                <div className="space-y-4">
                  {erc20Tokens.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between py-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{token.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {token.balance} {token.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">{token.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="erc721">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ERC-721 token transfers found for this address</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internal">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No internal transactions found for this address</p>
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
