import { isArray, isEmpty, isObject } from "@/lib/util/isEmpty"

describe("isEmpty", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty object", {}],
    ["empty array", []],
    ["empty string", ""],
    ["whitespace string", "   "],
  ])("treats %s as empty", (_label, value) => {
    expect(isEmpty(value)).toBe(true)
  })

  it.each([
    ["non-empty object", { a: 1 }],
    ["non-empty array", [1]],
    ["non-empty string", "x"],
    ["zero", 0],
  ])("treats %s as non-empty", (_label, value) => {
    expect(isEmpty(value)).toBe(false)
  })
})

describe("isObject / isArray", () => {
  it("distinguishes objects and arrays", () => {
    expect(isObject({})).toBe(true)
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
  })
})
