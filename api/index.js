export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Cible non identifiée." });
        }

        try {
            // 1. COLLECTE DES VECTEURS D'INFLUENCE (RestCountries)
            const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
            if (!countryRes.ok) throw new Error("Accès base de données pays impossible.");
            const countryData = (await countryRes.json())[0];

            // 2. EXTRACTION DES DONNÉES DE PUISSANCE
            const pop = countryData.population;
            const borders = countryData.borders || [];
            const area = countryData.area;
            const region = countryData.region;
            const subregion = countryData.subregion;
            const languages = countryData.languages ? Object.values(countryData.languages) : [];
            
            // 3. ALGORITHME DE SCORING GÉOPOLITIQUE (Puppet Master v4.0 Professional)
            
            // A. Classification Rigoureuse des Blocs
            let influenceBloc = "AUTONOME / NON-ALIGNÉ";
            let powerColor = "⚪";
            
            const westernSubregions = ["Western Europe", "Northern Europe", "Southern Europe", "Northern America"];
            const bricsMembers = ["Russia", "China", "India", "Brazil", "South Africa", "Iran", "Egypt", "Ethiopia", "United Arab Emirates"];
            
            if (westernSubregions.includes(subregion) || ["Australia", "New Zealand", "Japan", "South Korea"].includes(country)) {
                influenceBloc = "BLOC OCCIDENTAL (OTAN/PARTENAIRES)";
                powerColor = "🔵";
            } else if (bricsMembers.includes(country) || ["Belarus", "Central Asia"].includes(subregion)) {
                influenceBloc = "ALLIANCE EURASIENNE / BRICS+";
                powerColor = "🔴";
            } else if (["Middle Africa", "Western Africa", "Eastern Africa"].includes(subregion)) {
                influenceBloc = "SUD GLOBAL (INFLUENCE MULTIPOLAIRE)";
                powerColor = "🟡";
            } else if (["South America", "Central America"].includes(subregion)) {
                influenceBloc = "ZONE D'INFLUENCE AMÉRICAINE / SUD GLOBAL";
                powerColor = "🟠";
            }

            // B. Analyse de la Profondeur Stratégique
            const density = pop / area;
            const powerIndex = (Math.log10(pop) * 0.4 + Math.log10(area) * 0.6).toFixed(2);
            
            // C. Évaluation de la Menace Frontalière (Friction Systémique)
            const borderFriction = borders.length * 2.5;
            
            // D. Détermination du Risque Géopolitique
            let conflictRisk = "STABLE";
            let strategyNote = "Maintien du statu quo.";
            
            if (borders.length >= 7 || (borders.length >= 4 && density > 200)) {
                conflictRisk = "HAUTE FRAGILITÉ (ENCLAVEMENT)";
                strategyNote = "Risque élevé de débordement transfrontalier.";
            } else if (powerIndex > 7.5) {
                conflictRisk = "PUISSANCE RÉGIONALE / HÉGÉMON";
                strategyNote = "Capacité de projection et d'influence majeure sur les voisins.";
            }

            // 4. RÉDACTION DU RAPPORT TECHNIQUE
            const analysis = `
╔════════════════════════════════════════════════════════╗
  DOSSIER DE RENSEIGNEMENT STRATÉGIQUE : UNITÉ PUPPET
╚════════════════════════════════════════════════════════╝
[CIBLE] : ${country.toUpperCase()}
[POLARITÉ] : ${powerColor} ${influenceBloc}
[RISQUE SYSTÉMIQUE] : ${conflictRisk}

[1. PARAMÈTRES DE PUISSANCE ÉTATIQUE]
> Indice de Profondeur Stratégique : ${powerIndex} / 10
> Démographie Active : ${(pop / 1000000).toFixed(2)}M d'unités
> Contrôle Spatial : ${area.toLocaleString()} km²
> Densité de Pression : ${density.toFixed(1)} hab/km²

[2. VECTEURS D'INTERACTION]
> Axes de friction (Frontières) : ${borders.length} points de contact
> Voisinage immédiat : ${borders.length > 0 ? borders.join(', ') : 'ISOLEMENT GÉOGRAPHIQUE'}
> Sphère d'influence : ${subregion.toUpperCase()}

[3. ANALYSE DE LA DOCTRINE]
${strategyNote}
L'analyse structurale indique que ${country} possède une ${area > 1000000 ? 'profondeur stratégique majeure' : 'profondeur limitée, vulnérable aux frappes rapides'}. 
La position ${borders.length > 5 ? 'est au cœur de tensions multilatérales' : 'est relativement préservée des pressions directes'}.
L'influence linguistique (${languages.slice(0, 2).join(', ')}) facilite des ponts diplomatiques vers d'autres zones d'intérêt.

[STATUS] : ANALYSE VALIDÉE PAR L'ALGORITHME V4.0
[SIGNATURE : SECTION_R_STRAT]
            `.trim();

            return res.status(200).json({ analysis });

        } catch (error) {
            return res.status(500).json({ 
                error: "Défaut de liaison", 
                analysis: `[ERREUR] : Interception impossible. La cible ${country} est hors réseau.` 
            });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
