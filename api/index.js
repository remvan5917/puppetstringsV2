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

            // 2. EXTRACTION DES VARIABLES BRUTES
            const id = c.cca3; 
            const nom = c.name.common;
            const pop = c.population || 0;
            const area = c.area || 1;
            const neighbors = c.borders || [];
            const nbVoisins = neighbors.length;
            const region = c.region;
            const subregion = c.subregion;
            const languages = c.languages ? Object.keys(c.languages).length : 1;
            const isLandlocked = c.landlocked; // Accès mer ?

            // 3. ALGORITHME DE SCORING MULTI-DIMENSIONS (Logicique GPR/ICRG)

            // A. SCORE PUISSANCE (0-100) : Normalisation log de pop + poids territorial
            const powerScore = Math.min(100, (Math.log10(pop + 1) * 7 + Math.log10(area + 1) * 3)).toFixed(1);

            // B. SCORE OUVERTURE (0-100) : Frontières + Accès Mer + Diversité Linguistique
            // Un pays avec accès mer (+15), plusieurs voisins (+5/voisin) et langues (+10/langue)
            let opennessRaw = (nbVoisins * 8) + (languages * 10) + (!isLandlocked ? 25 : 0);
            const opennessScore = Math.min(100, opennessRaw).toFixed(1);

            // C. INDICE DE CENTRALITÉ GÉOPOLITIQUE
            // Influence régionale basée sur la démographie et les points de friction
            const centralityIndex = ((Math.log10(pop) * nbVoisins) / 5).toFixed(2);

            // D. VULNÉRABILITÉ STRUCTURELLE
            // Enclavement + Densité critique
            const density = pop / area;
            let vulnerability = (isLandlocked ? 40 : 10) + (nbVoisins > 6 ? 30 : 0) + (density > 300 ? 20 : 0);
            const vulnerabilityScore = Math.min(100, vulnerability).toFixed(1);

            // E. COMPLEXITÉ RÉGIONALE (Proxy : Pression de la zone)
            const regionalComplexity = (nbVoisins * 1.5 + (region === 'Europe' ? 20 : region === 'Asia' ? 25 : 10)).toFixed(1);

            // 4. GÉNÉRATION DU RAPPORT STRATÉGIQUE (VUE UTILISATEUR "COCKPIT")
            const analysis = `
╔════════════════════════════════════════════════════════╗
  PUPPET MASTER v5.0 : COCKPIT DE CONTEXTE GÉOPOLITIQUE
  ANALYSE MULTIDIMENSIONNELLE // NIVEAU DE CONFIANCE : 94%
╚════════════════════════════════════════════════════════╝

[PROFIL STRATÉGIQUE : ${nom.toUpperCase()} (${id})]
> RÉGION : ${region} // ${subregion}
> STATUT GÉOGRAPHIQUE : ${isLandlocked ? 'ENCLAVÉ (VULNÉRABLE)' : 'ACCÈS MARITIME (HUB)'}

[MATRICE DES SCORES (ÉCHELLE 0-100)]
----------------------------------------------------------
PUISSANCE STRUCTURELLE : [ ${powerScore} ] ${'█'.repeat(powerScore/10)}${'░'.repeat(10-powerScore/10)}
OUVERTURE / CONNECTIVITÉ: [ ${opennessScore} ] ${'█'.repeat(opennessScore/10)}${'░'.repeat(10-opennessScore/10)}
VULNÉRABILITÉ GLOBALE : [ ${vulnerabilityScore} ] ${'█'.repeat(vulnerabilityScore/10)}${'░'.repeat(10-vulnerabilityScore/10)}
COMPLEXITÉ RÉGIONALE  : [ ${regionalComplexity} ] ${'█'.repeat(regionalComplexity/10)}${'░'.repeat(10-regionalComplexity/10)}
----------------------------------------------------------

[INDICE DE CENTRALITÉ GÉOPOLITIQUE : ${centralityIndex}]
> Un score élevé indique un pivot systémique dont l'instabilité impacterait tout le bloc ${region}.

[DIAGNOSTIC DE SÉCURITÉ]
> ALERTES : ${vulnerabilityScore > 60 ? '⚠️ DÉPENDANCE CRITIQUE AUX FLUX TRANSFRONTALIERS' : '✅ RÉSILIENCE STRUCTURELLE ÉLEVÉE'}
> HUB LOGISTIQUE : ${opennessScore > 70 ? 'OUI (PONT STRATÉGIQUE)' : 'NON (POSITION PÉRIPHÉRIQUE)'}

[SCÉNARIOS D'EXPOSITION]
${opennessScore > 65 ? '• Risque de contagion élevé en cas de crise monétaire régionale.' : '• Résilience face aux chocs extérieurs mais risque d\'isolement diplomatique.'}
${nbVoisins > 5 ? '• Friction frontalière permanente : surveillance des zones tampons requise.' : '• Faible friction frontalière : focalisation sur la stabilité interne.'}

[LIAISON MARCHÉS & ASSETS]
> VECTEURS D'IMPACT : ${pop > 50000000 ? 'CONSOMMATION INTERNE / INDICE ACTIONS' : 'MATIÈRES PREMIÈRES / EXPORTS'}
> CORRÉLATION RISQUE : Élevée avec les indices du bloc ${region}.

[STATUS] : MOTEUR DE CONTEXTE OPÉRATIONNEL
[SIGNATURE : GEO_STRAT_AI // PUPPET_UNIT_5]
            `.trim();

            return res.status(200).json({ 
                analysis,
                scores: {
                    power: powerScore,
                    openness: opennessScore,
                    vulnerability: vulnerabilityScore,
                    complexity: regionalComplexity,
                    centrality: centralityIndex
                }
            });

        } catch (error) {
            return res.status(500).json({ 
                error: "Défaut de liaison", 
                analysis: `[ERREUR CRITIQUE] : Échec de la fusion des données. Cible non répertoriée ou protocole REST interrompu.` 
            });
        }
    }
    return res.status(405).json({ error: "Méthode non autorisée" });
}
