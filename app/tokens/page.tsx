import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

export default function TokensPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tokens EVVM</h1>
          <p className="text-muted-foreground">Explora los tokens disponibles en la red EVVM</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tokens ERC-20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Lista de tokens próximamente</p>
              <p className="text-xs mt-2">
                Esta funcionalidad estará disponible en una futura actualización
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}






