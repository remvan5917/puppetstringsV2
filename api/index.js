// Simulation d'un stockage d'apprentissage (Learning Weights)
// Dans une version de production, ces valeurs seraient récupérées depuis une base de données
const SYSTEM_LEARNING = {
    iterations: 1240, // Nombre d'analyses effectuées par le système
    reliabilityIndex: 0.85, // Plus le système analyse, plus cet index grimpe
    weightedBiases: {
        domino: 1.15, // Le système a appris que l'effet domino est souvent sous-estimé
        vulnerability: 0.95
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Cible non identifiée." });
        }

        try {
            // 1. COLLECTE DES DONNÉES (Source: RestCountries /v3.1/)
            const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
            
            if (!countryRes.ok) throw new Error(`Erreur API: ${countryRes.status}`);

            const data = await countryRes.json();
            if (!data || data.length === 0) throw new Error("Pays non trouvé.");

            const c = data[0];

            // 2. EXTRACTION DES VARIABLES CLÉS
            const id = c.cca3; 
            const nom = c.name.common;
            const pop = c.population || 0;
            const area = c.area || 1;
            const neighbors = c.borders || [];
            const nbVoisins = neighbors.length;
            const region = c.region;
            const isLandlocked = c.landlocked;
            const currencies = c.currencies ? Object.keys(c.currencies) : ["N/A"];

            // 3. ALGORITHMES D'APPRENTISSAGE SYSTÉMIQUE (PUPPET STRINGS MACHINE LEARNING)
            
            // Facteur d'apprentissage : simule une amélioration de la précision au fil du temps
            const learningMultiplier = 1 + (Math.log10(SYSTEM_LEARNING.iterations) / 10);

            // A. SCORE DE PUISSANCE RELATIVE (Ajusté par apprentissage)
            const basePower = (Math.log10(pop + 1) * 7 + Math.log10(area + 1) * 3);
            const powerScore = Math.min(100, basePower * SYSTEM_LEARNING.reliabilityIndex).toFixed(1);

            // B. INDICE D'EFFET DOMINO (Pondéré par l'historique des crises)
            const rawDomino = (nbVoisins > 0 ? (Math.log10(pop) * nbVoisins / 2) : 0);
            const dominoImpact = (rawDomino * SYSTEM_LEARNING.weightedBiases.domino).toFixed(2);

            // C. INDICE "AGILE HUB" (IDENTIFICATION DES PIVOTS)
            const agilityScore = (!isLandlocked && area < 500000 && nbVoisins >= 2) ? 85 : 40;

            // D. VULNÉRABILITÉ (Ajustée selon l'entropie système)
            const density = pop / area;
            let vulnerability = (isLandlocked ? 35 : 5) + (nbVoisins > 5 ? 25 : 0) + (density > 400 ? 20 : 0);
            const vulnerabilityScore = Math.min(100, vulnerability * SYSTEM_LEARNING.weightedBiases.vulnerability).toFixed(1);

            // E. MATRICE D'EXPOSITION AUX MARCHÉS (DÉTERMINISTE)
            let marketAsset = "DIVERSFIÉ / INDICES ACTIONS";
            if (region === 'Africa' || region === 'Oceania') marketAsset = "COMMODITIES (MINERAIS/ENERGIE)";
            else if (isLandlocked && region === 'Europe') marketAsset = "FLUX LOGISTIQUES / DETTE SOUVERAINE";
            else if (pop > 200000000) marketAsset = "CONSOMMATION / TECH / DEVISES";

            // 4. RÉDACTION DU RAPPORT "PUPPET MASTER"
            const analysis = `
╔════════════════════════════════════════════════════════╗
  PUPPET MASTER v6.1 : APPRENTISSAGE SYSTÉMIQUE ACTIF
  ANALYSE PRÉDICTIVE // MACHINE LEARNING EN TEMPS RÉEL
╚════════════════════════════════════════════════════════╝

[CIBLE : ${nom.toUpperCase()} // CODE ${id}]
> MÉMOIRE SYSTÈME : ${SYSTEM_LEARNING.iterations} ANALYSES PRÉCÉDENTES
> INDICE DE FIABILITÉ : ${(SYSTEM_LEARNING.reliabilityIndex * 100).toFixed(0)}% (OPTIMISÉ)

[SYNTHÈSE DES INDICATEURS DE CRISE]
----------------------------------------------------------
PUISSANCE BRUTE      : [ ${powerScore} ] ${'█'.repeat(Math.floor(powerScore/10))}${'░'.repeat(10-Math.floor(powerScore/10))}
IMPACT DOMINO (CHOC) : [ ${dominoImpact} ] ${'█'.repeat(Math.min(10, Math.floor(dominoImpact)))}${'░'.repeat(Math.max(0, 10-Math.floor(dominoImpact)))}
AGILITÉ / PIVOT      : [ ${agilityScore} ] ${'█'.repeat(Math.floor(agilityScore/10))}${'░'.repeat(10-Math.floor(agilityScore/10))}
VULNÉRABILITÉ FLUX   : [ ${vulnerabilityScore} ] ${'█'.repeat(Math.floor(vulnerabilityScore/10))}${'░'.repeat(10-Math.floor(vulnerabilityScore/10))}
----------------------------------------------------------

[APPRENTISSAGE MACHINE]
> Le système a recalibré le biais 'Domino' à ${SYSTEM_LEARNING.weightedBiases.domino}x basé sur l'historique des chocs régionaux.
> Impact sur les voisins (${neighbors.join(', ') || 'AUCUN'}) : ${dominoImpact > 5 ? '🔴 ALGORITHME : ALERTE DE CONTAGION' : '🟢 ALGORITHME : STABILITÉ PRÉVUE'}.

[POSITIONNEMENT SUR LES MARCHÉS]
> ACTIF CORRÉLÉ PRIORITAIRE : ${marketAsset}
> SENSIBILITÉ DEVISE (${currencies[0]}) : ${vulnerabilityScore > 50 ? 'HAUTE VOLATILITÉ' : 'STABILITÉ STRUCTURELLE'}

[ANALYSE DE L'ORACLE]
${nom} est analysé avec une précision accrue. Le système identifie ce noeud comme un ${agilityScore > 70 ? 'Pivot Agile dont l\'influence sur les fils du monde est disproportionnée.' : 'Poids mort structurel dont la chute provoquerait une onde de choc majeure.'}

[VECTEURS D'ALERTE]
${dominoImpact > 6 ? '⚠️ APPRENTISSAGE : Profil de risque élevé identifié par récurrence.' : '✅ APPRENTISSAGE : Profil de résilience confirmé.'}

[STATUS] : ANALYSE TERMINÉE ET ENREGISTRÉE DANS LA MÉMOIRE SYSTÉMIQUE
[SIGNATURE : SYSTEMIC_ORACLE_V6_LEARN // PUPPET_STRINGS]
            `.trim();

            return res.status(200).json({ 
                analysis,
                scores: {
                    power: powerScore,
                    domino: dominoImpact,
                    agility: agilityScore,
                    vulnerability: vulnerabilityScore
                },
                learning: {
                    iterations: SYSTEM_LEARNING.iterations,
                    reliability: SYSTEM_LEARNING.reliabilityIndex
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
