import {
  checkSpendingLimit,
  getOrderTotalInSpendWindow,
  getSpendWindow,
} from "@/lib/util/check-spending-limit"
import { ModuleCompanySpendingLimitResetFrequency } from "@/types"

describe("getSpendWindow", () => {
  it("uses the epoch as the start when the limit never resets", () => {
    const { start } = getSpendWindow({
      spending_limit_reset_frequency:
        ModuleCompanySpendingLimitResetFrequency.NEVER,
    } as any)
    expect(start.getTime()).toBe(0)
  })

  it("starts the window at the beginning of the current year (yearly)", () => {
    const { start } = getSpendWindow({
      spending_limit_reset_frequency:
        ModuleCompanySpendingLimitResetFrequency.YEARLY,
    } as any)
    expect(start.getMonth()).toBe(0)
    expect(start.getDate()).toBe(1)
  })
})

describe("getOrderTotalInSpendWindow", () => {
  const window = { start: new Date("2026-01-01"), end: new Date("2026-12-31") }

  it("sums only orders inside the window", () => {
    const orders = [
      { created_at: "2026-03-01", total: 100 },
      { created_at: "2025-12-31", total: 999 }, // before window
      { created_at: "2026-06-15", total: 50 },
    ] as any
    expect(getOrderTotalInSpendWindow(orders, window)).toBe(150)
  })

  it("returns 0 for no orders", () => {
    expect(getOrderTotalInSpendWindow([], window)).toBe(0)
  })
})

describe("checkSpendingLimit", () => {
  it("returns false when there is no cart or customer", () => {
    expect(checkSpendingLimit(null, null)).toBe(false)
  })

  it("returns false when the employee has no spending limit", () => {
    const customer = { employee: { spending_limit: 0 } } as any
    expect(checkSpendingLimit({ total: 100 } as any, customer)).toBe(false)
  })

  it("returns true when the cart total pushes spend over the limit", () => {
    const customer = {
      employee: {
        spending_limit: 100,
        company: {
          spending_limit_reset_frequency:
            ModuleCompanySpendingLimitResetFrequency.NEVER,
        },
      },
      orders: [{ created_at: "2026-01-01", total: 60 }],
    } as any
    // 60 already spent + 50 cart = 110 > 100
    expect(checkSpendingLimit({ total: 50 } as any, customer)).toBe(true)
  })

  it("returns false when spend stays within the limit", () => {
    const customer = {
      employee: {
        spending_limit: 100,
        company: {
          spending_limit_reset_frequency:
            ModuleCompanySpendingLimitResetFrequency.NEVER,
        },
      },
      orders: [{ created_at: "2026-01-01", total: 10 }],
    } as any
    expect(checkSpendingLimit({ total: 20 } as any, customer)).toBe(false)
  })
})
