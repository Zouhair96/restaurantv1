import React from 'react'

const Pricing = () => {
    return (
        <section id="pricing" className="py-20 bg-yum-dark text-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tarifs simples et transparents</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Choisissez le plan adapté à la taille de votre établissement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-yum-primary transition-colors flex flex-col">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-gray-400 text-sm mb-6">Pour petits cafés et bars</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">29€</span>
                            <span className="text-gray-500">/mois</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Menu digital (QR code illimité)
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Hébergement photos
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Support par email
                            </li>
                        </ul>
                        <button className="w-full bg-transparent border border-white hover:bg-white hover:text-yum-dark text-white font-bold py-3 rounded-xl transition-all">
                            Choisir Starter
                        </button>
                    </div>

                    {/* Pro */}
                    <div className="bg-white text-yum-dark rounded-2xl p-8 border-2 border-yum-primary relative transform scale-105 shadow-2xl flex flex-col z-10">
                        <div className="absolute top-0 right-0 bg-yum-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                            LE PLUS POPULAIRE
                        </div>
                        <h3 className="text-xl font-bold mb-2">Pro</h3>
                        <p className="text-gray-500 text-sm mb-6">Pour restaurants moyens & brasseries</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">59€</span>
                            <span className="text-gray-500">/mois</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Tout du plan Starter
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Prise de commande & Paiement
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Statistiques avancées
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Multi-langues auto
                            </li>
                        </ul>
                        <button className="w-full bg-yum-primary text-white font-bold py-3 rounded-xl hover:bg-red-500 transition-all shadow-lg">
                            Choisir Pro
                        </button>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-yum-primary transition-colors flex flex-col">
                        <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                        <p className="text-gray-400 text-sm mb-6">Chaînes et groupes</p>
                        <div className="mb-6">
                            <span className="text-3xl font-bold">Sur devis</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Tout du plan Pro
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Multi-établissements
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Intégration POS / Caisse
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Support prioritaire 24/7
                            </li>
                        </ul>
                        <button className="w-full bg-transparent border border-white hover:bg-white hover:text-yum-dark text-white font-bold py-3 rounded-xl transition-all">
                            Nous contacter
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Pricing
