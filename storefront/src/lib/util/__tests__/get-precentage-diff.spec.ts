import { getPercentageDiff } from "@/lib/util/get-precentage-diff"

describe("getPercentageDiff", () => {
  it("computes a positive discount percentage", () => {
    // original 100 -> calculated 80 == 20% off
    expect(getPercentageDiff(100, 80)).toBe("20")
  })

  it("returns 0 when there is no difference", () => {
    expect(getPercentageDiff(100, 100)).toBe("0")
  })

  it("rounds to a whole-number string", () => {
    // (10 - 7) / 10 * 100 = 30
    expect(getPercentageDiff(10, 7)).toBe("30")
  })

  it("returns a negative percentage when the price increased", () => {
    expect(getPercentageDiff(100, 120)).toBe("-20")
  })
})
