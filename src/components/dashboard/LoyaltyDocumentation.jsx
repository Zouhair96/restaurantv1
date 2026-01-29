import React, { useState } from 'react';
import { HiArrowLeft, HiSparkles, HiArrowPath, HiClock, HiCalendarDays, HiFire, HiUserGroup, HiTag, HiCurrencyDollar } from 'react-icons/hi2';

const LoyaltyDocumentation = ({ onBack, loyalConfig }) => {
    const [lang, setLang] = useState('en');

    const loyalVal = loyalConfig?.value || '15';

    const content = {
        en: {
            title: "Loyalty System Guide",
            subtitle: "Automated customer retention & rewards",
            back: "Back to Settings",
            loyalRewardLabel: "Loyal Reward (%)",
            loyalRewardSub: "Applied after 4 visits in 30 days.",
            sections: [
                {
                    title: "1. Global Auto-Promo",
                    icon: <HiSparkles className="text-orange-500" />,
                    text: "This is the master switch for the entire system. When ON, the system recognizes returning customers and automatically applies discounts to their checkout based on their status.",
                    image: "loyalty_config.png",
                    configHighlight: true
                },
                {
                    title: "2. Recovery System",
                    icon: <HiArrowPath className="text-red-500" />,
                    text: "Targets customers who haven't visited in a while to win them back.",
                    subpoints: [
                        "Recovery Delay: How many days of inactivity before a customer is considered 'lost' (e.g., 14 days).",
                        "Max Advantage: Limits how often a customer can claim a recovery gift (e.g., once every 60 days) to prevent abuse.",
                        "Priority: If a regular customer returns after a long absence, they get the higher Recovery offer first, then return to their normal Loyalty status."
                    ]
                },
                {
                    title: "3. Loyalty Tiers",
                    icon: <HiUserGroup className="text-blue-500" />,
                    text: "Automatic rewards for your most frequent fans.",
                    subpoints: [
                        "Soft Status: First few visits. No discount yet, but the system is tracking progress.",
                        `Loyal Status: Reached after 4 visits in 30 days. Unlocks a consistent ${loyalVal}% discount.`,
                        "Safety Rule: Visits are only counted once every 4 hours to ensure fair use."
                    ]
                },
                {
                    title: "4. Interpreting Stats",
                    icon: <HiCurrencyDollar className="text-green-500" />,
                    text: "Understand your system's performance at a glance.",
                    image: "loyalty_stats.png",
                    subpoints: [
                        "Loyal Clients: Total unique users currently at 'Loyal' tier.",
                        "Offers Applied: Total number of discounts redeemed by customers.",
                        "Revenue (Loyalty): Total sales generated specifically from loyalty/recovery orders."
                    ]
                }
            ]
        },
        fr: {
            title: "Guide du Système de Fidélité",
            subtitle: "Rétention client et récompenses automatisées",
            back: "Retour aux Paramètres",
            loyalRewardLabel: "Récompense Fidèle (%)",
            loyalRewardSub: "Appliqué après 4 visites en 30 jours.",
            sections: [
                {
                    title: "1. Auto-Promo Globale",
                    icon: <HiSparkles className="text-orange-500" />,
                    text: "C'est l'interrupteur principal. Lorsqu'il est ACTIVÉ, le système reconnaît les clients fidèles et applique automatiquement des remises lors du paiement en fonction de leur statut.",
                    image: "loyalty_config.png",
                    configHighlight: true
                },
                {
                    title: "2. Système de Récupération",
                    icon: <HiArrowPath className="text-red-500" />,
                    text: "Cible les clients qui ne sont pas venus depuis un moment pour les faire revenir.",
                    subpoints: [
                        "Délai de Récupération: Nombre de jours d'inactivité avant qu'un client ne soit considéré comme 'perdu' (ex: 14 jours).",
                        "Avantage Max: Limite la fréquence à laquelle un client peut réclamer un cadeau de récupération (ex: une fois tous les 60 jours) pour éviter les abus.",
                        "Priorité: Si un client régulier revient après une longue absence, il reçoit d'abord l'offre de récupération plus élevée, puis retrouve son statut de fidélité normal."
                    ]
                },
                {
                    title: "3. Niveaux de Fidélité",
                    icon: <HiUserGroup className="text-blue-500" />,
                    text: "Récompenses automatiques pour vos fans les plus fréquents.",
                    subpoints: [
                        "Statut Soft: Premières visites. Pas encore de remise, mais le système suit la progression.",
                        `Statut Loyal: Atteint après 4 visites en 30 jours. Débloque une remise constante de ${loyalVal}%.`,
                        "Règle de Sécurité: Les visites ne sont comptées qu'une fois toutes les 4 heures pour garantir une utilisation équitable."
                    ]
                },
                {
                    title: "4. Interprétation des Stats",
                    icon: <HiCurrencyDollar className="text-green-500" />,
                    text: "Comprenez les performances de votre système en un coup d'œil.",
                    image: "loyalty_stats.png",
                    subpoints: [
                        "Clients Fidèles: Nombre total d'utilisateurs uniques actuellement au niveau 'Loyal'.",
                        "Offres Appliquées: Nombre total de remises utilisées par les clients.",
                        "Revenu (Fidélité): Ventes totales générées spécifiquement par les commandes de fidélité/récupération."
                    ]
                }
            ]
        },
        ar: {
            title: "دليل نظام الولاء",
            subtitle: "الاحتفاظ بالعملاء والمكافآت المؤتمتة",
            back: "العودة إلى الإعدادات",
            loyalRewardLabel: "مكافأة الولاء (%)",
            loyalRewardSub: "تطبق بعد 4 زيارات في 30 يوماً.",
            sections: [
                {
                    title: "1. الترويج التلقائي العام",
                    icon: <HiSparkles className="text-orange-500" />,
                    text: "هذا هو المفتاح الرئيسي للنظام بأكمله. عندما يكون قيد التشغيل (ON)، يتعرف النظام على العملاء العائدين ويطبق الخصومات تلقائياً عند الدفع بناءً على حالتهم.",
                    image: "loyalty_config.png",
                    configHighlight: true
                },
                {
                    title: "2. نظام الاستعادة",
                    icon: <HiArrowPath className="text-red-500" />,
                    text: "يستهدف العملاء الذين لم يزوروا المطعم منذ فترة لكسب ودهم مرة أخرى.",
                    subpoints: [
                        "مهلة الاستعادة: عدد أيام الخمول قبل اعتبار العميل 'ضائعاً' (مثلاً 14 يوماً).",
                        "الحد الأقصى للمنفعة: يحد من عدد المرات التي يمكن للعميل فيها الحصول على هدية استعادة (مثلاً مرة كل 60 يوماً) لمنع سوء الاستخدام.",
                        "الأولوية: إذا عاد عميل منتظم بعد غياب طويل، فإنه يحصل على عرض الاستعادة الأكبر أولاً، ثم يعود إلى حالة الولاء الطبيعية."
                    ]
                },
                {
                    title: "3. مستويات الولاء",
                    icon: <HiUserGroup className="text-blue-500" />,
                    text: "مكافآت تلقائية لمعجبيك الأكثر تردداً.",
                    subpoints: [
                        "الحالة المرنة (Soft): الزيارات القليلة الأولى. لا توجد خصومات بعد، لكن النظام يتتبع التقدم.",
                        `حالة الولاء (Loyal): يتم الوصول إليها بعد 4 زيارات في 30 يوماً. تفتح خصماً ثابتاً بنسبة ${loyalVal}%.`,
                        "قاعدة الأمان: يتم احتساب الزيارات مرة واحدة فقط كل 4 ساعات لضمان الاستخدام العادل."
                    ]
                },
                {
                    title: "4. تفسير الإحصائيات",
                    icon: <HiCurrencyDollar className="text-green-500" />,
                    text: "افهم أداء نظامك بلمحة سريعة.",
                    image: "loyalty_stats.png",
                    subpoints: [
                        "الالعملاء الأوفياء: إجمالي المستخدمين الفريدين حالياً في مستوى 'الولاء'.",
                        "العروض المطبقة: إجمالي عدد الخصومات التي تم استخدامها من قبل العملاء.",
                        "الإيرادات (الولاء): إجمالي المبيعات الناتجة تحديداً عن طلبات الولاء/الاستعادة."
                    ]
                }
            ]
        }
    };

    const current = content[lang];
    const isAr = lang === 'ar';

    return (
        <div className={`space-y-8 animate-fade-in ${isAr ? 'text-right font-arabic' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header with Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-yum-primary transition-colors mb-2 text-sm font-bold uppercase tracking-widest"
                    >
                        <HiArrowLeft className={isAr ? 'rotate-180' : ''} /> {current.back}
                    </button>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        {current.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{current.subtitle}</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    {['en', 'fr', 'ar'].map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${lang === l
                                ? 'bg-white dark:bg-yum-primary text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-8">
                {current.sections.map((section, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-[#1a1c23] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                {section.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                                    {section.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {section.text}
                                </p>
                            </div>
                        </div>

                        {section.configHighlight && (
                            <div className="mb-8 p-6 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    <HiTag className="w-4 h-4 text-yum-primary" /> {current.loyalRewardLabel}
                                </label>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="px-6 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-xl font-black text-yum-primary shadow-sm">
                                        {loyalVal} <span className="text-sm opacity-50">%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium italic">
                                        {current.loyalRewardSub}
                                    </p>
                                </div>
                            </div>
                        )}

                        {section.image && (
                            <div className="mb-8 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl bg-gray-50 dark:bg-black">
                                <img
                                    src={section.image.startsWith('http') ? section.image : `/docs/${section.image}`}
                                    alt={section.title}
                                    className="w-full h-auto block"
                                    onError={(e) => {
                                        console.error(`Failed to load documentation image: ${section.image}`);
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = `<div class="p-10 text-center text-gray-400 text-xs italic">Visualization for ${section.title} (Image missing at /docs/${section.image})</div>`;
                                    }}
                                />
                            </div>
                        )}

                        {section.subpoints && (
                            <ul className="space-y-3">
                                {section.subpoints.map((point, pIdx) => (
                                    <li key={pIdx} className="flex gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yum-primary shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            <div className="py-10 text-center">
                <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                    {current.back}
                </button>
            </div>
        </div>
    );
};

export default LoyaltyDocumentation;
