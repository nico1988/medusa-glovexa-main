/**
 * Single source of truth for the static content pages and how they are grouped
 * in the footer. Referenced by the footer (and can be reused by a sitemap or
 * mobile menu) so page slugs are never duplicated as magic strings.
 */

export type SiteLink = {
  label: string
  href: string
}

export type SiteLinkGroup = {
  heading: string
  links: SiteLink[]
}

/**
 * High-intent links surfaced in the primary (top) navigation, next to the
 * Products mega-menu. Kept focused on the pages B2B buyers look for first.
 */
export const PRIMARY_NAV_LINKS: SiteLink[] = [
  { label: "Wholesale", href: "/wholesale" },
  { label: "Custom & OEM", href: "/custom-oem" },
  { label: "Our Story", href: "/our-story" },
  { label: "Support", href: "/faqs" },
]

export const SITE_LINK_GROUPS: SiteLinkGroup[] = [
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping", href: "/shipping" },
      { label: "Sizing Guide", href: "/sizing-guide" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Care & Repair", href: "/care-repair" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Wholesale", href: "/wholesale" },
      { label: "Custom & OEM", href: "/custom-oem" },
      { label: "Materials & Certifications", href: "/materials-certifications" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-conditions" },
    ],
  },
]
