import { convertToLocale } from "@/lib/util/money"

describe("convertToLocale", () => {
  it("formats an amount as localized currency", () => {
    expect(convertToLocale({ amount: 1234.5, currency_code: "usd" })).toBe(
      "$1,234.50"
    )
  })

  it("formats EUR (the store's default currency)", () => {
    expect(convertToLocale({ amount: 52, currency_code: "eur" })).toBe(
      "€52.00"
    )
  })

  it("respects an explicit locale", () => {
    // Intl uses a narrow no-break space before the symbol in de-DE; normalize
    // all Unicode spaces to a plain space so the assertion isn't ICU-fragile.
    const formatted = convertToLocale({
      amount: 1234.5,
      currency_code: "eur",
      locale: "de-DE",
    }).replace(/\s/g, " ")
    expect(formatted).toBe("1.234,50 €")
  })

  it("honors fraction-digit overrides", () => {
    expect(
      convertToLocale({
        amount: 52,
        currency_code: "usd",
        maximumFractionDigits: 0,
      })
    ).toBe("$52")
  })

  it("falls back to the raw amount when currency is missing", () => {
    expect(convertToLocale({ amount: 42, currency_code: "" })).toBe("42")
  })
})
