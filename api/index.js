// Simulation d'un stockage d'apprentissage (Learning Weights)
const SYSTEM_LEARNING = {
    iterations: 1240,
    reliabilityIndex: 0.85,
    weightedBiases: {
        domino: 1.15,
        vulnerability: 0.95,
        centrality: 1.10
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Cible non identifiée." });
        }

        try {
            // 1. COLLECTE DES DONNÉES ÉTENDUES
            const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
            
            if (!countryRes.ok) throw new Error(`Erreur API: ${countryRes.status}`);

            const data = await countryRes.json();
            if (!data || data.length === 0) throw new Error("Pays non trouvé.");

            const c = data[0];

            // VARIABLES DE BASE
            const id = c.cca3; 
            const nom = c.name.common;
            const pop = c.population || 0;
            const area = c.area || 1;
            const neighbors = c.borders || [];
            const nbVoisins = neighbors.length;
            const region = c.region;
            const subregion = c.subregion;
            const isLandlocked = c.landlocked;
            const languages = c.languages ? Object.keys(c.languages).length : 1;
            const currencies = c.currencies ? Object.keys(c.currencies) : ["N/A"];

            // 2. ALGORITHMES DE SCORING MULTI-DIMENSIONS (LOGIQUE GPR/ICRG)

            // A. INDICE DE CENTRALITÉ GÉOPOLITIQUE (0-100)
            // Plus un pays est peuplé, entouré, et dans une région dense, plus il est central.
            const rawCentrality = (Math.log10(pop + 1) * 4) + (nbVoisins * 5);
            const centralityScore = Math.min(100, rawCentrality * SYSTEM_LEARNING.weightedBiases.centrality).toFixed(1);

            // B. SCORE D'OUVERTURE & CONNECTIVITÉ (0-100)
            // Accès mer + Diversité linguistique + Frontières
            let openingBase = (isLandlocked ? 10 : 40) + (languages * 10) + (nbVoisins * 5);
            const openingScore = Math.min(100, openingBase).toFixed(1);

            // C. VULNÉRABILITÉ STRUCTURELLE (0-100)
            // Densité + Enclavement + Ratio Frontières/Taille
            const density = pop / area;
            let structVuln = (isLandlocked ? 30 : 0) + (density > 500 ? 20 : 0) + (nbVoisins > 6 ? 25 : 0);
            const vulnerabilityScore = Math.min(100, structVuln * SYSTEM_LEARNING.weightedBiases.vulnerability).toFixed(1);

            // D. COMPLEXITÉ RÉGIONALE (0-100)
            // Basé sur le contexte de la sous-région (pression environnementale)
            const regionalFactor = {
                'Western Europe': 40, 'Eastern Europe': 75, 'Middle East': 90, 
                'Northern Africa': 80, 'Western Africa': 85, 'Eastern Asia': 70,
                'South America': 50, 'North America': 30
            };
            const complexityScore = (regionalFactor[subregion] || 50);

            // 3. MAPPING MARCHÉS & ACTIFS CORRÉLÉS
            let marketInsight = {
                asset: "INDICES ACTIONS / LARGE CAPS",
                riskType: "VOLATILITÉ DEVISE",
                opportunity: "STABILITÉ FLUX"
            };

            if (vulnerabilityScore > 60) {
                marketInsight.asset = "COMMODITIES / OR / PROTECTION";
                marketInsight.opportunity = "ARBITRAGE SUR RISQUE PAYS";
            } else if (openingScore > 70 && centralityScore > 60) {
                marketInsight.asset = "HUBS LOGISTIQUES / TECH INTERNATIONALE";
                marketInsight.opportunity = "CROISSANCE PAR EFFET RÉSEAU";
            }

            // 4. RÉDACTION DU PROFIL GÉOPOLITIQUE (VUE UTILISATEUR "WOW")
            const analysis = `
╔════════════════════════════════════════════════════════╗
  PUPPET MASTER v6.5 : PROFILAGE GÉO-STRUCTUREL
  COCKPIT DE DÉCISION // ANALYSE DE PRESSION SYSTÉMIQUE
╚════════════════════════════════════════════════════════╝

[CIBLE : ${nom.toUpperCase()} // ${id}]
[RÉGION : ${subregion.toUpperCase()}]

--- DIAGNOSTIC STRUCTUREL (POINTS DE PRESSION) ---
CENTRALITÉ GÉOPOLITIQUE : [ ${centralityScore}% ] ${'█'.repeat(Math.floor(centralityScore/10))}${'░'.repeat(10-Math.floor(centralityScore/10))}
OUVERTURE & RÉSEAUX    : [ ${openingScore}% ] ${'█'.repeat(Math.floor(openingScore/10))}${'░'.repeat(10-Math.floor(openingScore/10))}
VULNÉRABILITÉ SYSTÈME  : [ ${vulnerabilityScore}% ] ${'█'.repeat(Math.floor(vulnerabilityScore/10))}${'░'.repeat(10-Math.floor(vulnerabilityScore/10))}
COMPLEXITÉ RÉGIONALE   : [ ${complexityScore}% ] ${'█'.repeat(Math.floor(complexityScore/10))}${'░'.repeat(10-Math.floor(complexityScore/10))}
----------------------------------------------------------

[RÉPONSES AUX QUESTIONS STRATÉGIQUES]
> IMPORTANCE STRATÉGIQUE : ${centralityScore > 70 ? 'NOEUD MAJEUR. Toute vibration ici impacte le système global.' : 'POIDS RÉGIONAL. Impact limité aux chaînes locales.'}
> TYPE DE HUB : ${openingScore > 65 ? 'HUB ULTRA-CONNECTÉ. Pivot de redistribution des flux.' : 'ZONE D\'INERTIE. Dépendante des infrastructures extérieures.'}
> EXPOSITION SUPPLY-CHAIN : ${vulnerabilityScore > 50 ? 'HAUTE. Risque de rupture en cas de choc frontalier.' : 'MODÉRÉE. Structure résiliente aux pressions de voisinage.'}

[COUPLE RENDEMENT / RISQUE MARCHÉ]
> ACTIF PRIORITAIRE   : ${marketInsight.asset}
> SENSIBILITÉ         : ${vulnerabilityScore > 40 ? 'RISQUE PAYS ÉLEVÉ' : 'CONFIANCE STRUCTURELLE'}
> STRATÉGIE SUGGÉRÉE  : ${marketInsight.opportunity}

[ANALYSE DE L'ORACLE]
${nom} présente un profil de ${centralityScore > 60 && vulnerabilityScore < 40 ? 'Coffre-fort Géopolitique' : 'Zone de Friction Systémique'}. 
Sa connectivité (${nbVoisins} voisins, ${languages} langues) en fait un ${openingScore > 70 ? 'amplificateur' : 'absorbeur'} de tensions régionales.

[STATUS] : PROFILAGE TERMINÉ
[SIGNATURE : SYSTEMIC_ORACLE_V6_PROFILER // PUPPET_STRINGS]
            `.trim();

            return res.status(200).json({ 
                analysis,
                scores: {
                    centrality: centralityScore,
                    opening: openingScore,
                    vulnerability: vulnerabilityScore,
                    complexity: complexityScore
                },
                metadata: {
                    isHub: openingScore > 70,
                    isFragile: vulnerabilityScore > 60,
                    isPivot: (centralityScore > 50 && area < 500000)
                }
            });

        } catch (error) {
            return res.status(500).json({ 
                error: "Défaut de liaison", 
                analysis: `[ERREUR CRITIQUE] : Rupture de flux. Oracle hors-ligne.` 
            });
        }
    }
    return res.status(405).json({ error: "Méthode non autorisée" });
}
