export default function ModelOpsPage() {
  return (
    <div className="min-h-screen bg-green-50 text-gray-900" style={{ fontFamily: "var(--font-body, 'Hind', sans-serif)" }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-green-700" style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}>
            ModelOps
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fonctionnalites" className="hover:text-green-700 transition-colors">Fonctionnalités</a>
            <a href="#stats" className="hover:text-green-700 transition-colors">Résultats</a>
            <a href="#cta" className="hover:text-green-700 transition-colors">Contact</a>
          </div>
          <a
            href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer"
            className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            Demander une démo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              MLOps · IA Opérationnelle
            </span>
            <h1
              className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5"
              style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}
            >
              Fine-tuning, versioning,<br />
              <span className="text-green-700">déploiement de modèles IA</span><br />
              en 48h
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              ModelOps prend en charge tout le cycle de vie de vos modèles de langage — de l'entraînement sur vos données à la mise en production — sans data scientist dédié.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer"
                className="bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors text-center"
              >
                Déployer mon premier modèle
              </a>
              <a
                href="#fonctionnalites"
                className="border border-green-700 text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                Voir comment ça marche
              </a>
            </div>
          </div>

          {/* Pipeline diagram mockup */}
          <div className="flex-1 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-green-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Pipeline d'entraînement — Modèle v2.4</p>
            <div className="space-y-4">
              {[
                { label: "Données brutes", status: "✓ Terminé", statusColor: "#15803d", bg: "#dcfce7", progress: 100 },
                { label: "Fine-tuning", status: "En cours...", statusColor: "#b45309", bg: "#fef3c7", progress: 63 },
                { label: "Évaluation", status: "En attente", statusColor: "#6b7280", bg: "#f3f4f6", progress: 0 },
                { label: "Production", status: "En attente", statusColor: "#6b7280", bg: "#f3f4f6", progress: 0 },
              ].map((stage, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: stage.bg, color: stage.statusColor }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{stage.label}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: stage.bg, color: stage.statusColor }}
                      >
                        {stage.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${stage.progress}%`, background: "#15803d" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
              <span>⏱ Temps restant : ~6h</span>
              <span>·</span>
              <span>📦 Base : Llama 3.1 8B</span>
              <span>·</span>
              <span>🗂 Dataset : 42 k lignes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 bg-green-700">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          {[
            { value: "48h", label: "pour passer de vos données à la production" },
            { value: "0", label: "data scientist dédié requis" },
            { value: "3×", label: "meilleures performances vs modèle de base" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-5xl font-bold mb-2" style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}>
                {stat.value}
              </p>
              <p className="text-green-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-center text-gray-900 mb-14"
            style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}
          >
            Tout ce dont vous avez besoin, <span className="text-green-700">sans la complexité</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🧠",
                title: "Fine-tuning automatisé",
                desc: "Importez votre dataset, choisissez un modèle de base parmi notre catalogue (Llama, Mistral, Falcon…) et lancez l'entraînement en un clic. ModelOps gère l'infrastructure, les hyperparamètres et les optimisations GPU.",
                bullets: ["Upload CSV, JSON ou PDF", "Sélection guidée du modèle de base", "Résultats lisibles sans expertise ML"],
              },
              {
                icon: "🗃️",
                title: "Versioning & registre",
                desc: "Chaque version de votre modèle est sauvegardée, comparée et documentée automatiquement. Revenez à n'importe quelle version en un clic, sans perdre aucune donnée.",
                bullets: ["Historique complet des versions", "Rollback instantané", "Comparaison des métriques inter-versions"],
              },
              {
                icon: "📡",
                title: "Monitoring en production",
                desc: "Suivez les performances de vos modèles après déploiement. Détectez les dérives (data drift, concept drift) avant qu'elles n'impactent vos utilisateurs et recevez des alertes automatiques.",
                bullets: ["Détection de drift en temps réel", "Alertes email & Slack", "Dashboard de qualité des réponses"],
              },
            ].map((feat, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3
                  className="text-lg font-bold text-gray-900 mb-3"
                  style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}
                >
                  {feat.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feat.desc}</p>
                <ul className="space-y-1.5">
                  {feat.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-600 font-bold">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}
          >
            Prêt à déployer votre premier modèle sur mesure ?
          </h2>
          <p className="text-gray-600 mb-8">
            Obtenez un modèle fine-tuné sur vos données et déployé en production en moins de 48 heures. Nos ingénieurs vous accompagnent à chaque étape.
          </p>
          <a
            href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer"
            className="inline-block bg-green-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-800 transition-colors text-lg"
          >
            Déployer mon premier modèle →
          </a>
          <p className="text-xs text-gray-400 mt-4">Réponse sous 24h · Sans engagement</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-green-100 bg-green-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span
            className="font-bold text-green-700"
            style={{ fontFamily: "var(--font-display, 'Josefin Sans', sans-serif)" }}
          >
            ModelOps
          </span>
          <span>© 2025 ModelOps — Un produit Wikolabs</span>
          <a href="mailto:team@wikolabs.com" className="hover:text-green-700 transition-colors">
            team@wikolabs.com
          </a>
        </div>
      </footer>

    </div>
  );
}
