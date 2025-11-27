import * as Localization from "expo-localization"

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "BRL" | "MXN" | "CAD" | "AUD"
export type DistanceUnit = "miles" | "kilometers"
export type WeightUnit = "lbs" | "kg"

export interface GlobalSettings {
  currency: Currency
  distanceUnit: DistanceUnit
  weightUnit: WeightUnit
  locale: string
  timezone: string
}

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  BRL: "R$",
  MXN: "$",
  CAD: "C$",
  AUD: "A$",
}

const defaultSettings: GlobalSettings = {
  currency: "USD",
  distanceUnit: "miles",
  weightUnit: "lbs",
  locale: Localization.locale,
  timezone: Localization.timezone || "UTC",
}

let userSettings: GlobalSettings = { ...defaultSettings }

export function setGlobalSettings(settings: Partial<GlobalSettings>) {
  userSettings = { ...userSettings, ...settings }
}

export function getGlobalSettings(): GlobalSettings {
  return userSettings
}

export function formatCurrency(amount: number, currency?: Currency): string {
  const curr = currency || userSettings.currency
  const symbol = currencySymbols[curr]

  return new Intl.NumberFormat(userSettings.locale, {
    style: "currency",
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDistance(distanceInMiles: number, unit?: DistanceUnit): string {
  const preferredUnit = unit || userSettings.distanceUnit

  if (preferredUnit === "kilometers") {
    const km = distanceInMiles * 1.60934
    return `${km.toFixed(1)} km`
  }

  return `${distanceInMiles.toFixed(1)} mi`
}

export function formatWeight(weightInLbs: number, unit?: WeightUnit): string {
  const preferredUnit = unit || userSettings.weightUnit

  if (preferredUnit === "kg") {
    const kg = weightInLbs * 0.453592
    return `${kg.toFixed(1)} kg`
  }

  return `${weightInLbs.toFixed(1)} lbs`
}

export function formatDate(date: Date | string, style: "short" | "medium" | "long" = "medium"): string {
  const d = typeof date === "string" ? new Date(date) : date

  const options: Intl.DateTimeFormatOptions = {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
  }[style]

  return new Intl.DateTimeFormat(userSettings.locale, options).format(d)
}

export function formatTime(date: Date | string, includeSeconds = false): string {
  const d = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat(userSettings.locale, {
    hour: "numeric",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" }),
  }).format(d)
}

export function formatPhoneNumber(phone: string, countryCode?: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // If it starts with country code, format accordingly
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    // US/Canada: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Default international format: +XX XXX XXX XXXX
  if (countryCode) {
    return `+${countryCode} ${cleaned}`
  }

  return phone
}

export function detectCurrencyFromLocale(locale: string): Currency {
  const currencyMap: Record<string, Currency> = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    JP: "JPY",
    CN: "CNY",
    IN: "INR",
    BR: "BRL",
    MX: "MXN",
    CA: "CAD",
    AU: "AUD",
  }

  const country = locale.split("-")[1] || locale.split("_")[1]
  return currencyMap[country] || "USD"
}

export function detectDistanceUnitFromLocale(locale: string): DistanceUnit {
  const milesCountries = ["US", "GB", "LR", "MM"] // USA, UK, Liberia, Myanmar
  const country = locale.split("-")[1] || locale.split("_")[1]

  return milesCountries.includes(country) ? "miles" : "kilometers"
}

// Initialize settings based on device locale
const detectedCurrency = detectCurrencyFromLocale(Localization.locale)
const detectedDistanceUnit = detectDistanceUnitFromLocale(Localization.locale)

setGlobalSettings({
  currency: detectedCurrency,
  distanceUnit: detectedDistanceUnit,
  weightUnit: detectedDistanceUnit === "miles" ? "lbs" : "kg",
})
