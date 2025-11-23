# 🚀 Quick Start - Ejecutar Amp Paso a Paso

Guía rápida para ejecutar Amp y tener tu base de datos funcionando, basada en el [repositorio demo oficial de Amp](https://github.com/edgeandnode/amp-demo).

## ✅ Paso 1: Verificar Prerrequisitos

Este proyecto usa **pnpm** como gestor de paquetes (como el [demo oficial de Amp](https://github.com/edgeandnode/amp-demo)).

```bash
# Verificar Node.js (necesitas v22+)
node --version

# Verificar pnpm (necesitas v10+)
pnpm --version

# Si no tienes pnpm, instálalo:
npm install -g pnpm
# o con Homebrew (macOS):
# brew install pnpm

# Verificar Docker (para PostgreSQL)
docker --version
```

Si no tienes algo instalado, instálalo primero.

## ✅ Paso 2: Instalar Amp

```bash
# Instalar ampup (gestor de versiones de Amp)
curl --proto '=https' --tlsv1.2 -sSf https://ampup.sh/install | sh

# Reiniciar terminal o ejecutar:
source ~/.zshrc  # o ~/.bashrc según tu shell

# Verificar instalación
ampup --version
ampd --version
ampctl --version
```

Deberías ver las versiones de los comandos. **Nota**: Los comandos son:
- `ampup` - Gestor de versiones
- `ampd` - Servidor de Amp
- `ampctl` - Cliente CLI para queries

## ✅ Paso 3: Configurar PostgreSQL

Tienes **dos opciones**:

### Opción A: PostgreSQL con Docker (Recomendado para empezar rápido)

```bash
# Desde la raíz del proyecto
pnpm run docker:up

# O manualmente:
docker-compose up -d

# Verificar que está corriendo
docker ps | grep postgres
```

### Opción B: PostgreSQL Instalado Localmente

Si ya tienes PostgreSQL instalado en tu sistema:

```bash
# macOS con Homebrew
brew install postgresql@16
brew services start postgresql@16

# Verificar que está corriendo
psql postgres -c "SELECT version();"

# Crear base de datos para Amp
# Si createdb no funciona, usa la ruta completa:
/opt/homebrew/opt/postgresql@16/bin/createdb amp
# O con psql:
/opt/homebrew/opt/postgresql@16/bin/psql postgres -c "CREATE DATABASE amp;"

# Agregar PostgreSQL al PATH (opcional, para usar comandos directamente)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Nota**: Si usas PostgreSQL local, ajusta la URL en `amp.toml`:
```toml
[metadata_db]
url = "postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/amp"
# O si no tienes contraseña:
url = "postgresql://localhost:5432/amp"
```

## ✅ Paso 4: Configurar Amp (Basado en el Demo Oficial)

**Estructura**: Siguiendo el patrón del [demo oficial de Amp](https://github.com/edgeandnode/amp-demo), la configuración está en `infra/amp/`.

```bash
# Verificar que existe la estructura
ls -la infra/amp/
ls -la infra/amp/providers/
```

**Archivos de configuración**:
- `infra/amp/config.toml` - Configuración del servidor Amp
- `infra/amp/providers/sepolia.toml` - Provider RPC de Sepolia

**Si usas Docker**: La configuración ya está lista en `infra/amp/config.toml`.

**Si usas PostgreSQL local**: Edita `infra/amp/config.toml`:

```toml
# Cambiar esta línea:
metadata_db_url = "postgresql://gerryp@localhost:5432/amp?sslmode=disable"
```

**Configurar RPC de Sepolia**: Edita `infra/amp/providers/sepolia.toml`:

```toml
kind = "evm-rpc"
url = "https://rpc.sepolia.org"  # RPC público (sin API key)
network = "sepolia"

# Para mejor rendimiento, usa un RPC con API key:
# url = "https://sepolia.infura.io/v3/TU_API_KEY"
# url = "https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY"
```

**💡 Tip**: Empieza con el RPC público (`https://rpc.sepolia.org`) para probar. Luego puedes usar Infura o Alchemy para mejor rendimiento.

## ✅ Paso 5: Iniciar el Servidor de Amp

```bash
# Iniciar Amp en modo dev (con watch automático)
ampd --config infra/amp/config.toml dev

# O usando el script pnpm
pnpm run amp:server
```

**Nota**: El comando `dev` (no `server`) permite que Amp detecte cambios automáticamente y reconstruya datasets.

Deberías ver algo como:
```
INFO ampd::server_cmd: Arrow Flight RPC server running at 0.0.0.0:1602
INFO ampd::server_cmd: JSON Lines server running at 0.0.0.0:1603
```

**⚠️ Importante**: Deja esta terminal abierta. Amp debe estar corriendo para que funcione.

## ✅ Paso 7: Verificar que Funciona

Abre **otra terminal** y prueba:

```bash
# Ver tablas disponibles (vía HTTP)
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SHOW TABLES'

# Probar una query simple
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT 1 as test'

# Ver datasets disponibles
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SHOW DATASETS'
```

**Nota**: `ampctl` no tiene comando `query`. Las queries se hacen vía HTTP POST al servidor.

Si ves resultados, ¡Amp está funcionando! 🎉

**⚠️ Nota**: Si ves errores sobre "unknown dataset", es normal. Necesitas desplegar los datasets primero (ver Paso 8).

## ✅ Paso 6: Construir y Desplegar Datasets

El servidor está corriendo, pero los datasets aún no están construidos ni desplegados. Sigue estos pasos:

### Opción A: Setup Automático (Recomendado)

```bash
# En una nueva terminal (el servidor debe seguir corriendo)
pnpm run amp:setup
```

Este comando hace todo automáticamente:
1. Construye el manifest del dataset base de Sepolia
2. Registra el dataset base
3. Despliega el dataset base
4. Construye el manifest del dataset EVVM
5. Registra el dataset EVVM
6. Despliega el dataset EVVM

### Opción B: Setup Manual (Paso a Paso)

```bash
# 1. Construir manifest del dataset base
pnpm run amp:build:base

# 2. Registrarlo
pnpm run amp:register:base

# 3. Desplegarlo
pnpm run amp:deploy:base

# 4. Construir manifest del dataset EVVM
pnpm run amp:build

# 5. Registrarlo
pnpm run amp:register

# 6. Desplegarlo
pnpm run amp:deploy
```

**📖 Guía Completa**: Ver [docs/DEPLOY_DATASET.md](./DEPLOY_DATASET.md) para más detalles.

## ✅ Paso 7: Verificar el Dataset EVVM

```bash
# Ver si el dataset EVVM está disponible (vía HTTP)
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT * FROM "evvm/evvm_explorer@dev".evvm_transactions LIMIT 5'
```

**Nota**: 
- Si ves un error de "table does not exist", es normal. Amp necesita tiempo para indexar desde Sepolia.
- Si ves un error de "unknown dataset", verifica que los datasets estén desplegados con `ampctl dataset list`.
- Espera unos minutos para que Amp indexe datos desde Sepolia y vuelve a intentar.

## ✅ Paso 8: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar
nano .env.local
```

Configuración mínima:

```env
NEXT_PUBLIC_AMP_QUERY_URL="http://localhost:1603"
NEXT_PUBLIC_AMP_NETWORK="sepolia"
NEXT_PUBLIC_AMP_NAMESPACE="evvm"
```

## ✅ Paso 9: Iniciar el Frontend

En otra terminal:

```bash
# Instalar dependencias (si no lo has hecho)
pnpm install

# Iniciar Next.js
pnpm run dev
```

Abre http://localhost:3000 en tu navegador.

## 🎯 Comandos Útiles

```bash
# Si usas Docker:
# Ver logs de PostgreSQL
pnpm run docker:logs

# Detener PostgreSQL
pnpm run docker:down

# Si usas PostgreSQL local:
# Ver logs
brew services list | grep postgresql

# Detener PostgreSQL
brew services stop postgresql@16

# Reiniciar Amp
# Ctrl+C en la terminal de Amp, luego:
ampd --config infra/amp/config.toml dev
# O: AMP_CONFIG=infra/amp/config.toml ampd dev

# Abrir Amp Studio (interfaz web)
pnpm run amp:studio
# O: ampctl studio
```

## 🐛 Problemas Comunes

### Error: "ampd: command not found" o "ampctl: command not found"

**Solución**:
```bash
# Agregar al PATH (si no está)
echo 'export PATH="$HOME/.amp/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verificar que funciona
ampup --version
ampd --version
ampctl --version
```

### Error: "Connection refused" al iniciar Amp

**Solución**:

**Si usas Docker**:
```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Si no está, iniciarlo
pnpm run docker:up

# Verificar que la base de datos existe
docker exec -it amp-postgres psql -U postgres -c "\l" | grep amp
```

**Si usas PostgreSQL local**:
```bash
# Verificar que PostgreSQL está corriendo
brew services list | grep postgresql
# O: ps aux | grep postgres

# Si no está, iniciarlo
brew services start postgresql@16

# Verificar que la base de datos existe
psql postgres -c "\l" | grep amp
```

### Error: "Table does not exist"

**Solución**:
- Es normal al principio. Amp necesita tiempo para indexar.
- Espera 2-5 minutos después de iniciar Amp.
- Verifica que `amp.config.ts` está en la raíz del proyecto.
- Verifica los logs de Amp para errores.

### Error: "Provider not configured"

**Solución**:
- Verifica que `amp.toml` existe y tiene la sección `[providers.sepolia]`
- Verifica que el RPC es válido (prueba con `curl https://rpc.sepolia.org`)

## 📚 Próximos Pasos

Una vez que Amp esté corriendo:

1. **Revisar el plan de implementación**: [docs/IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
2. **Probar queries**: Experimenta con diferentes queries SQL
3. **Ver datos indexados**: Espera a que Amp indexe transacciones de Sepolia
4. **Personalizar**: Modifica `amp.config.ts` según tus necesidades

## 🔗 Recursos

- [Repositorio Demo de Amp](https://github.com/edgeandnode/amp-demo)
- [Documentación de Amp](https://ampup.sh/docs)
- [Guía de Setup Completa](./SETUP.md)

