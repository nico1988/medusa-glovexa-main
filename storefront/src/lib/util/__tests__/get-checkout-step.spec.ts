import { getCheckoutStep } from "@/lib/util/get-checkout-step"
import { B2BCart } from "@/types/global"

// A fully-progressed cart; each test knocks out one prerequisite to assert the
// step the checkout flow should land on next.
const completeCart = (): B2BCart =>
  ({
    shipping_address: { address_1: "1 Market St" },
    billing_address: { address_1: "1 Market St" },
    shipping_methods: [{ id: "sm_1" }],
    email: "buyer@acme.com",
    payment_collection: {
      payment_sessions: [{ status: "pending" }],
    },
  } as unknown as B2BCart)

describe("getCheckoutStep", () => {
  it("asks for a shipping address first", () => {
    expect(getCheckoutStep({} as B2BCart)).toBe("shipping-address")
  })

  it("asks for a billing address once shipping is set", () => {
    const cart = completeCart()
    cart.billing_address = {} as any
    expect(getCheckoutStep(cart)).toBe("billing-address")
  })

  it("asks for delivery once addresses are set", () => {
    const cart = completeCart()
    cart.shipping_methods = []
    expect(getCheckoutStep(cart)).toBe("delivery")
  })

  it("asks for contact information when email is missing", () => {
    const cart = completeCart()
    cart.email = undefined as any
    expect(getCheckoutStep(cart)).toBe("contact-information")
  })

  it("asks for payment when no pending payment session exists", () => {
    const cart = completeCart()
    cart.payment_collection = { payment_sessions: [] } as any
    expect(getCheckoutStep(cart)).toBe("payment")
  })

  it("returns null when the cart is ready to complete", () => {
    expect(getCheckoutStep(completeCart())).toBeNull()
  })
})
