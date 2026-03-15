export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-motion-muted">
        Lio’s Motion Finder is designed to be privacy-friendly. We do not set cookies and we do not run analytics by default.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-motion-muted">
        <li>We do not ask you to create an account.</li>
        <li>We do not store your searches in a database.</li>
        <li>
          Like any website, our hosting provider may process technical data (such as IP address) in server logs for security
          and reliability.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Booking providers</h2>
      <p className="mt-3 text-motion-muted">
        When you click “Book Best Deal” or another provider, you leave our site. The provider’s privacy policy then applies.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-3 text-motion-muted">
        If you need changes or deletion of any data you believe is stored, contact the site owner. (By default, this app
        stores nothing.)
      </p>
    </main>
  );
}
