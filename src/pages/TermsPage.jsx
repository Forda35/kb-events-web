export default function TermsPage() {
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>Conditions Générales d'Utilisation</h1>
      <p className="section-sub" style={{ marginBottom: "2.5rem" }}>Dernière mise à jour : 2026</p>

      {[
        {
          title: "1. Objet",
          text: "KB Events est une plateforme de réservation de billets pour des événements culturels et festifs à Madagascar. Les présentes CGU régissent l'utilisation du site web et de l'application mobile."
        },
        {
          title: "2. Compte utilisateur",
          text: "Pour acheter un billet, vous devez créer un compte avec une adresse email valide. Votre compte est personnel et non transférable. Vous êtes responsable de la confidentialité de vos identifiants. Un même compte est utilisable sur le site web et l'application mobile."
        },
        {
          title: "3. Billets",
          text: "Chaque billet est unique, lié à votre compte et représenté par un QR code personnel. Le billet n'est pas transférable. En cas de perte, vol ou capture d'écran, KB Events décline toute responsabilité. Toute tentative de falsification ou de duplication engage votre responsabilité légale."
        },
        {
          title: "4. Paiement",
          text: "Les paiements sont effectués exclusivement via Orange Money. KB Events ne stocke aucune information bancaire ou de paiement. Les transactions sont directement gérées par l'opérateur Mobile Money."
        },
        {
          title: "5. Délai de paiement",
          text: "Vous disposez de 30 minutes pour finaliser votre paiement. Passé ce délai, la commande sera automatiquement annulée et vous devrez recommencer un nouvel achat. Tout transfert effectué après l'expiration du délai ne pourra pas être pris en charge par l'application."
        },
        {
          title: "6. Remboursements",
          text: "Les billets achetés ne sont pas remboursables sauf annulation de l'événement par l'organisateur. En cas d'annulation, les modalités de remboursement seront communiquées directement aux acheteurs."
        },
        {
          title: "7. Données personnelles",
          text: "Vos données (email, historique d'achat) sont utilisées uniquement pour la gestion de vos billets. Elles ne sont jamais vendues ni partagées avec des tiers à des fins commerciales."
        },
        {
          title: "8. Responsabilité",
          text: "KB Events n'est pas responsable des modifications ou annulations d'événements par les organisateurs. La plateforme assure uniquement la billetterie et la vérification des paiements."
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>{section.title}</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>{section.text}</p>
          {i < 7 && <div className="divider" />}
        </div>
      ))}
    </div>
  );
}
