import { describe, it, expect } from 'vitest'
import {
  fetchCompanies,
  fetchCurrencies,
  fetchReferences,
  fetchRoomTypes,
  fetchMealPlans,
  fetchMarketSegments,
  fetchGuestSources,
  fetchServices,
} from './masters.mock.js'

describe('masters.mock fetchers', () => {
  it('fetchCompanies returns non-empty array with id + name', async () => {
    const data = await fetchCompanies()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
  })

  it('fetchCurrencies includes BDT with conversionRate 1', async () => {
    const data = await fetchCurrencies()
    const bdt = data.find((c) => c.code === 'BDT')
    expect(bdt).toBeDefined()
    expect(bdt.conversionRate).toBe(1)
  })

  it('fetchReferences returns 29+ options (FR-005)', async () => {
    const data = await fetchReferences()
    expect(data.length).toBeGreaterThanOrEqual(29)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
  })

  it('fetchRoomTypes returns rate-carded entries with sc/vat', async () => {
    const data = await fetchRoomTypes()
    expect(data.length).toBeGreaterThanOrEqual(8)
    const first = data[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('rackRate')
    expect(first.scPct).toBe(10)
    expect(first.vatPct).toBe(15)
  })

  it('fetchMealPlans returns 9+ plans', async () => {
    const data = await fetchMealPlans()
    expect(data.length).toBeGreaterThanOrEqual(9)
  })

  it('fetchMarketSegments returns the two BRD offices', async () => {
    const data = await fetchMarketSegments()
    const names = data.map((m) => m.name)
    expect(names).toContain('Dhaka Office')
    expect(names).toContain("Cox's Office")
  })

  it('fetchGuestSources returns the 4 BRD options', async () => {
    const data = await fetchGuestSources()
    expect(data.length).toBe(4)
  })

  it('fetchServices returns 25 entries', async () => {
    const data = await fetchServices()
    expect(data.length).toBe(25)
    expect(data[0]).toHaveProperty('unitRate')
  })
})
