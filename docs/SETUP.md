# Guía de Setup - EVVM Block Explorer con Amp

Guía práctica paso a paso para configurar y ejecutar Amp para indexar la EVVM, basada en el [repositorio demo oficial de Amp](https://github.com/edgeandnode/amp-demo).

> **🚀 ¿Quieres empezar rápido?** Ver [QUICK_START.md](./QUICK_START.md) para una guía paso a paso simplificada.

## ⚠️ Importante: EVVM No Emite Eventos

La EVVM **no emite eventos tradicionales**. Indexamos las **transacciones L1** de Sepolia que interactúan con el contrato EVVM.

## 📋 Prerrequisitos

1. **Node.js** (v22+) y **npm** o **pnpm**
2. **Docker** para PostgreSQL
3. **Amp** instalado (`ampup` CLI)

## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Instalar Amp

```bash
# Instalar ampup CLI
curl --proto '=https' --tlsv1.2 -sSf https://ampup.sh/install | sh

# Reiniciar terminal o ejecutar:
source ~/.zshrc  # o ~/.bashrc según tu shell

# Verificar instalación
amp --version
```

### 3. Iniciar Infraestructura (PostgreSQL)

```bash
# Iniciar PostgreSQL con Docker
npm run docker:up

# O manualmente:
docker-compose up -d
```

Esto iniciará PostgreSQL en `postgresql://postgres:postgres@localhost:5432/amp`.

### 4. Configurar Amp para Sepolia

Copia el archivo de ejemplo y configura tu RPC:

```bash
# Copiar el archivo de ejemplo
cp amp.toml.example amp.toml

# Editar con tu configuración
nano amp.toml  # o usa tu editor favorito
```

Edita `amp.toml` y configura:

```toml
[metadata_db]
url = "postgresql://postgres:postgres@localhost:5432/amp"

[providers.sepolia]
rpc = "https://sepolia.infura.io/v3/YOUR_KEY"
# O usa un RPC público (más lento, sin API key)
# rpc = "https://rpc.sepolia.org"
```

**Obtener RPC de Sepolia:**
- **Infura**: https://infura.io (gratis, requiere cuenta)
- **Alchemy**: https://alchemy.com (gratis, requiere cuenta)
- **Público**: `https://rpc.sepolia.org` (sin API key, más lento pero funciona)

### 5. Iniciar Amp

```bash
# Iniciar servidor de Amp
amp server --config amp.toml
```

Esto iniciará el servidor en `http://localhost:1603` por defecto.

### 6. Verificar que Funciona

En otra terminal:

```bash
# Ver tablas disponibles
amp query 'SHOW TABLES'

# Consultar transacciones EVVM
amp query 'SELECT * FROM "_/evvm_explorer@dev".evvm_transactions LIMIT 5'
```

### 7. Iniciar el Frontend

```bash
# En otra terminal
npm run dev
```

El frontend estará en `http://localhost:3000`

## 📊 Estructura de Datos

Una vez corriendo, Amp creará estas tablas:

- `evvm_transactions` - Transacciones L1 que llaman al contrato EVVM
- `evvm_blocks` - Agrupación de transacciones por bloque L1
- `evvm_logs` - Logs relacionados con el contrato

## 🔧 Configuración del Proyecto

### Variables de Entorno

Copia el archivo de ejemplo y configura:

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tu configuración
nano .env.local  # o usa tu editor favorito
```

Configuración mínima para desarrollo local:

```env
# URL de Amp (local)
NEXT_PUBLIC_AMP_QUERY_URL="http://localhost:1603"

# Red por defecto
NEXT_PUBLIC_AMP_NETWORK="sepolia"

# Namespace del dataset
NEXT_PUBLIC_AMP_NAMESPACE="evvm"
```

**Variables importantes:**
- `NEXT_PUBLIC_AMP_QUERY_URL` - URL donde Amp está corriendo (local: `http://localhost:1603`)
- `NEXT_PUBLIC_AMP_NETWORK` - Red por defecto (`sepolia` para Sepolia testnet)
- `NEXT_PUBLIC_AMP_QUERY_TOKEN` - Solo necesario para datasets publicados (dejar vacío para local)
- `NEXT_PUBLIC_AMP_RPC_DATASET` - Dataset RPC de dependencia (dejar vacío si usas `amp.toml` con provider)

### Estructura de Comandos

El proyecto incluye scripts npm para facilitar el uso:

- `npm run docker:up` - Iniciar PostgreSQL
- `npm run docker:down` - Detener PostgreSQL
- `npm run docker:logs` - Ver logs de Docker
- `npm run amp:query 'SQL'` - Ejecutar query SQL
- `npm run amp:studio` - Abrir Amp Studio (interfaz web)

## 🐛 Troubleshooting

### Error: "Connection refused"

**Problema**: Amp no está corriendo o PostgreSQL no está disponible.

**Solución**:
```bash
# Verificar que Docker está corriendo
docker ps

# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Iniciar PostgreSQL si no está corriendo
npm run docker:up

# Verificar que Amp está corriendo
curl http://localhost:1603
```

### Error: "Table does not exist"

**Problema**: El dataset no se ha creado aún o Amp no ha indexado Sepolia.

**Solución**:
1. Verifica que `amp.config.ts` está en la raíz
2. Verifica que el servidor de Amp está corriendo
3. Espera unos minutos para que Amp indexe los datos

### Error: "Provider not configured"

**Problema**: No hay RPC configurado para Sepolia.

**Solución**: Crea `amp.toml` con la configuración del provider (ver paso 4).

### Las consultas no devuelven datos

**Problema**: No hay transacciones al contrato EVVM o Amp no ha indexado aún.

**Solución**:
1. Verifica que hay transacciones en Etherscan: https://sepolia.etherscan.io/address/0x9902984d86059234c3B6e11D5eAEC55f9627dD0f
2. Espera a que Amp indexe (puede tardar varios minutos)
3. Verifica los logs de `ampd` para errores

## 📚 Comandos Útiles

```bash
# Consultar desde CLI
amp query 'SELECT COUNT(*) FROM "_/evvm_explorer@dev".evvm_transactions'

# Más ejemplos
amp query 'SELECT * FROM "_/evvm_explorer@dev".evvm_transactions LIMIT 10'

# Abrir Amp Studio (interfaz web para queries)
npm run amp:studio
# O: amp studio

# Ver logs de Docker
npm run docker:logs

# Detener infraestructura
npm run docker:down

# Reiniciar Amp
# Ctrl+C para detener, luego vuelve a iniciar
amp server --config amp.toml
```

## 🔗 Recursos

- **Repositorio Demo Oficial**: https://github.com/edgeandnode/amp-demo
- **Contrato EVVM**: https://sepolia.etherscan.io/address/0x9902984d86059234c3B6e11D5eAEC55f9627dD0f
- **Documentación Amp**: https://ampup.sh/docs
- **RPC Sepolia**: https://chainlist.org/chain/11155111

## 📝 Notas

- **Sin eventos**: La EVVM no emite eventos, por lo que indexamos transacciones L1
- **Indexación lenta**: La primera indexación puede tardar varios minutos
- **Datos limitados**: Solo tenemos acceso a datos de transacciones L1, no datos internos de EVVM

