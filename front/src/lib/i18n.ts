import 'server-only'
import type { Locale } from '@/config/i18n.config'

// We are defining a type for our dictionary based on the structure of en.json
export type Dictionary = typeof import('@/i18n/en.json')

// This object now dynamically imports the correct dictionary based on the locale
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/i18n/en.json').then((module) => module.default),
  fa: () => import('@/i18n/fa.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]()
}