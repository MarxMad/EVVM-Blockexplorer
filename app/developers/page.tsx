import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AMP_CONFIG, BASE_CHAIN, EVVM_CONTRACT_ADDRESS } from "@/lib/config"

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Documentación para Desarrolladores</h1>
          <p className="text-muted-foreground">API y recursos para integrar con EVVM</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amp API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Amp SQL API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Endpoint:</p>
                <code className="block bg-muted p-2 rounded text-xs break-all">
                  {AMP_CONFIG.endpoint || "http://localhost:1603"}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ejemplo de Query:</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`curl -X POST ${AMP_CONFIG.endpoint || "http://localhost:1603"} \\
  -H "Content-Type: text/plain" \\
  -d 'SELECT * FROM "evvm/evvm_explorer@dev".balance_updated LIMIT 10'`}
                </pre>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tablas disponibles:</p>
                <ul className="text-sm space-y-1">
                  <li>• <code className="bg-muted px-1 rounded">balance_updated</code></li>
                  <li>• <code className="bg-muted px-1 rounded">pay_executed</code></li>
                  <li>• <code className="bg-muted px-1 rounded">staker_status_updated</code></li>
                  <li>• <code className="bg-muted px-1 rounded">reward_given</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Contrato EVVM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Dirección del Contrato:</p>
                <code className="block bg-muted p-2 rounded text-xs break-all">
                  {EVVM_CONTRACT_ADDRESS}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Red:</p>
                <Badge variant="secondary">{BASE_CHAIN.name}</Badge>
                <span className="text-sm text-muted-foreground ml-2">
                  (Chain ID: {BASE_CHAIN.chainId})
                </span>
              </div>
              <div>
                <Link
                  href={`${BASE_CHAIN.explorerUrl}/address/${EVVM_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver en {BASE_CHAIN.explorerUrl}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recursos Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Documentación</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <Link href="/docs/QUICK_START.md" className="text-primary hover:underline">Guía de Inicio Rápido</Link></li>
                    <li>• <Link href="/docs/DEMO_COMMANDS.md" className="text-primary hover:underline">Comandos para Demo</Link></li>
                    <li>• <Link href="/docs/HOW_TO_VIEW_DATABASES.md" className="text-primary hover:underline">Ver Bases de Datos</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Enlaces Útiles</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <a href="https://ampup.sh/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Documentación de Amp</a></li>
                    <li>• <a href="https://github.com/edgeandnode/amp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Amp en GitHub</a></li>
                    <li>• <a href="https://www.evvm.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EVVM Official</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}


