import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="font-bold">EVVM Explorer</span>
            </div>
            <p className="text-sm text-muted-foreground">Explore and analyze the EVVM blockchain network</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Blockchain</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blocks" className="text-muted-foreground hover:text-primary transition-colors">
                  View Blocks
                </Link>
              </li>
              <li>
                <Link href="/txs" className="text-muted-foreground hover:text-primary transition-colors">
                  View Transactions
                </Link>
              </li>
              <li>
                <Link href="/validators" className="text-muted-foreground hover:text-primary transition-colors">
                  Top Validators
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-muted-foreground hover:text-primary transition-colors">
                  Verify Contract
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EVVM Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
