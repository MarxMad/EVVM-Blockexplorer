/**
 * Funciones de utilidad para formatear datos de la EVVM
 */

import { formatDistanceToNow } from "date-fns"

/**
 * Formatea un timestamp Unix a una fecha legible
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }) + " UTC"
}

/**
 * Formatea un timestamp a tiempo relativo (ej: "hace 5 minutos")
 */
export function formatRelativeTime(timestamp: number): string {
  try {
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true, locale: require("date-fns/locale/es") })
  } catch {
    // Fallback si no hay locale
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })
  }
}

/**
 * Formatea un valor en wei a EVVM (asumiendo 18 decimales)
 */
export function formatEVVMValue(value: string): string {
  try {
    const bigIntValue = BigInt(value)
    const divisor = BigInt(10 ** 18)
    const whole = bigIntValue / divisor
    const remainder = bigIntValue % divisor
    const decimals = remainder.toString().padStart(18, "0")
    const trimmedDecimals = decimals.replace(/\.?0+$/, "")
    return `${whole.toString()}.${trimmedDecimals}`
  } catch {
    return value
  }
}

/**
 * Formatea una dirección acortándola
 */
export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) {
    return address
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Formatea un hash acortándolo
 */
export function formatHash(hash: string, startLength: number = 10, endLength: number = 8): string {
  if (!hash || hash.length < startLength + endLength) {
    return hash
  }
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`
}

/**
 * Convierte un valor a formato de número con comas
 */
export function formatNumber(value: number | string): string {
  return Number(value).toLocaleString("es-ES")
}

/**
 * Formatea el tipo de nonce
 */
export function formatNonceType(nonceType: "sync" | "async"): string {
  return nonceType === "sync" ? "Síncrono" : "Asíncrono"
}

