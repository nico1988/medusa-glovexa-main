import {
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use and protect personal data when you use our website and place orders.",
}

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      // TODO: set the real effective date and have this reviewed by legal counsel.
      meta="Last updated: [DATE]"
      lead="This policy explains what personal data we collect, why we collect it, and the choices you have. It is a template starting point and should be reviewed by qualified legal counsel before you publish it."
    >
      <ContentSection heading="Information we collect">
        <p>
          We collect information you provide directly (such as name, company,
          email, phone, billing and shipping details) and information collected
          automatically (such as device data, IP address and usage via cookies
          and similar technologies).
        </p>
      </ContentSection>

      <ContentSection heading="How we use your information">
        <p>
          To process orders and quotes, provide customer support, manage your
          account, communicate about your orders, improve our products and
          website, and comply with legal obligations.
        </p>
      </ContentSection>

      <ContentSection heading="Sharing your information">
        <p>
          We share data with service providers who help us operate (e.g.
          payment processors, shipping carriers, IT providers) and where
          required by law. We do not sell your personal data.
        </p>
      </ContentSection>

      <ContentSection heading="Cookies">
        <p>
          We use cookies to keep the site working, remember your preferences and
          understand usage. You can control cookies through your browser
          settings.
        </p>
      </ContentSection>

      <ContentSection heading="Your rights">
        <p>
          {/* TODO: tailor to the jurisdictions you operate in (GDPR, CCPA, etc.). */}
          Depending on where you live, you may have rights to access, correct,
          delete or restrict the processing of your personal data. To exercise
          these rights, contact us using the details below.
        </p>
      </ContentSection>

      <ContentSection heading="Data retention & security">
        <p>
          We retain personal data only as long as necessary for the purposes
          described above and apply appropriate technical and organisational
          measures to protect it.
        </p>
      </ContentSection>

      <ContentSection heading="Contact">
        <p>
          {/* TODO: replace with your real privacy contact and legal entity. */}
          Questions about this policy or your data? Email{" "}
          <a
            className="text-ui-fg-interactive hover:underline"
            href="mailto:privacy@example.com"
          >
            privacy@example.com
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  )
}
