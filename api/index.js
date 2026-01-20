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

            // 3. ALGORITHMES DE PROSPECTIVE AVANCÉE (PUPPET STRINGS LOGIC)

            // A. SCORE DE PUISSANCE RELATIVE (0-100)
            const powerScore = Math.min(100, (Math.log10(pop + 1) * 7 + Math.log10(area + 1) * 3)).toFixed(1);

            // B. INDICE D'EFFET DOMINO (CHOC SYSTÉMIQUE)
            // Évalue l'impact sur le voisinage en cas d'instabilité
            const dominoImpact = (nbVoisins > 0 ? (Math.log10(pop) * nbVoisins / 2) : 0).toFixed(2);

            // C. INDICE "AGILE HUB" (PIVOT DE PUISSANCE)
            // Identifie les pays pivots avec haute connectivité
            const agilityScore = (!isLandlocked && area < 500000 && nbVoisins >= 2) ? 85 : 40;

            // D. VULNÉRABILITÉ AUX FLUX EXTERNES
            const density = pop / area;
            let vulnerability = (isLandlocked ? 35 : 5) + (nbVoisins > 5 ? 25 : 0) + (density > 400 ? 20 : 0);
            const vulnerabilityScore = Math.min(100, vulnerability).toFixed(1);

            // E. MATRICE D'EXPOSITION AUX MARCHÉS (DÉTERMINISTE)
            let marketAsset = "DIVERSFIÉ / INDICES ACTIONS";
            if (region === 'Africa' || region === 'Oceania') marketAsset = "COMMODITIES (MINERAIS/ENERGIE)";
            else if (isLandlocked && region === 'Europe') marketAsset = "FLUX LOGISTIQUES / DETTE SOUVERAINE";
            else if (pop > 200000000) marketAsset = "CONSOMMATION / TECH / DEVISES";

            // 4. RÉDACTION DU RAPPORT "PUPPET MASTER"
            const analysis = `
╔════════════════════════════════════════════════════════╗
  PUPPET MASTER v6.0 : ORACLE DE PROSPECTIVE SYSTÉMIQUE
  ANALYSE PRÉDICTIVE // FUSION DE CONTEXTE EN TEMPS RÉEL
╚════════════════════════════════════════════════════════╝

[CIBLE : ${nom.toUpperCase()} // CODE ${id}]
> POLARITÉ RÉGIONALE : ${region.toUpperCase()}
> VECTEUR DE COMMERCE : ${isLandlocked ? 'TRANSIT TERRESTRE' : 'HUB MARITIME GLOBAL'}

[SYNTHÈSE DES INDICATEURS DE CRISE]
----------------------------------------------------------
PUISSANCE BRUTE      : [ ${powerScore} ] ${'█'.repeat(Math.floor(powerScore/10))}${'░'.repeat(10-Math.floor(powerScore/10))}
IMPACT DOMINO (CHOC) : [ ${dominoImpact} ] ${'█'.repeat(Math.min(10, Math.floor(dominoImpact)))}${'░'.repeat(Math.max(0, 10-Math.floor(dominoImpact)))}
AGILITÉ / PIVOT      : [ ${agilityScore} ] ${'█'.repeat(Math.floor(agilityScore/10))}${'░'.repeat(10-Math.floor(agilityScore/10))}
VULNÉRABILITÉ FLUX   : [ ${vulnerabilityScore} ] ${'█'.repeat(Math.floor(vulnerabilityScore/10))}${'░'.repeat(10-Math.floor(vulnerabilityScore/10))}
----------------------------------------------------------

[PRÉDICTION D'EFFET DOMINO]
> En cas de rupture de la chaîne d'approvisionnement ou d'instabilité interne, l'impact sur les pays limitrophes (${neighbors.join(', ') || 'AUCUN'}) est classé : ${dominoImpact > 5 ? '🔴 CRITIQUE - RISQUE DE CONTAGION RÉGIONALE' : '🟢 MODÉRÉ - ABSORPTION LOCALE POSSIBLE'}.

[POSITIONNEMENT SUR LES MARCHÉS]
> ACTIF CORRÉLÉ PRIORITAIRE : ${marketAsset}
> SENSIBILITÉ DEVISE (${currencies[0]}) : ${vulnerabilityScore > 50 ? 'HAUTE VOLATILITÉ' : 'STABILITÉ STRUCTURELLE'}

[NOTE DE CONTEXTE GÉOPOLITIQUE]
${nom} agit comme un ${agilityScore > 70 ? 'Pivot Agile capable de rediriger les flux globaux.' : 'Poids lourd dont l\'inertie stabilise sa zone géographique.'}
La structure frontalière suggère que ${nbVoisins > 5 ? 'toute tension locale devient immédiatement une crise multilatérale.' : 'le pays dispose d\'une autonomie stratégique protégée par sa géographie.'}

[VECTEURS D'ALERTE]
${dominoImpact > 6 ? '⚠️ SURVEILLANCE : Point de rupture systémique détecté.' : '✅ STABILITÉ : Ancre régionale confirmée.'}
${isLandlocked ? '⚠️ LOGISTIQUE : Dépendance totale envers les infrastructures tierces.' : '⚓ OPPORTUNITÉ : Capacité de projection navale et commerciale.'}

[STATUS] : ANALYSE PRÉDICTIVE TERMINÉE
[SIGNATURE : SYSTEMIC_ORACLE_V6 // PUPPET_STRINGS]
            `.trim();

            return res.status(200).json({ 
                analysis,
                scores: {
                    power: powerScore,
                    domino: dominoImpact,
                    agility: agilityScore,
                    vulnerability: vulnerabilityScore
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
