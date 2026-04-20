import { companies } from '../../fixtures/companies.js'
import { currencies } from '../../fixtures/currencies.js'
import { references } from '../../fixtures/references.js'
import { roomTypes } from '../../fixtures/roomTypes.js'
import { mealPlans } from '../../fixtures/mealPlans.js'
import { marketSegments } from '../../fixtures/marketSegments.js'
import { guestSources } from '../../fixtures/guestSources.js'
import { services } from '../../fixtures/services.js'
import { complimentaryItems } from '../../fixtures/complimentaryItems.js'
import { airlines } from '../../fixtures/airlines.js'
import { professions } from '../../fixtures/professions.js'
import { countries } from '../../fixtures/countries.js'

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchCompanies() {
  await delay()
  return companies
}

export async function fetchCurrencies() {
  await delay()
  return currencies
}

export async function fetchReferences() {
  await delay()
  return references
}

export async function fetchRoomTypes() {
  await delay()
  return roomTypes
}

export async function fetchMealPlans() {
  await delay()
  return mealPlans
}

export async function fetchMarketSegments() {
  await delay()
  return marketSegments
}

export async function fetchGuestSources() {
  await delay()
  return guestSources
}

export async function fetchServices() {
  await delay()
  return services
}

export async function fetchComplimentaryItems() {
  await delay()
  return complimentaryItems.filter((i) => i.is_active)
}

export async function fetchAirlines() {
  await delay()
  return airlines
}

export async function fetchProfessions() {
  await delay()
  return professions
}

export async function fetchCountries() {
  await delay()
  return countries
}
