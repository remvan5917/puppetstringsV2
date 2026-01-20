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
            
            // 3. ALGORITHME DE SCORING GÉOPOLITIQUE (Puppet Master v3.0)
            
            // A. Détection des Blocs d'Influence (Estimation basée sur la région et l'histoire)
            let influenceBloc = "NEUTRE / NON-ALIGNÉ";
            let powerColor = "⚪";
            
            if (["Western Europe", "Northern Europe", "Northern America"].includes(subregion)) {
                influenceBloc = "BLOC OCCIDENTAL (OTAN/UE)";
                powerColor = "🔵";
            } else if (["Eastern Europe", "Central Asia"].includes(subregion) || country === "Russia" || country === "China") {
                influenceBloc = "BLOC EURASIEN / BRICS+";
                powerColor = "🔴";
            } else if (region === "Africa" || region === "Americas") {
                influenceBloc = "SUD GLOBAL / INFLUENCE DISPUTÉE";
                powerColor = "🟡";
            }

            // B. Calcul du Coefficient de Militarisation (Basé sur la densité et le voisinage)
            // Plus un pays a de voisins, plus sa frontière est une zone de friction.
            const frictionScore = borders.length * 1.8;
            
            // C. Indice de Puissance Projective (IPP)
            // Combine masse critique (pop) et contrôle spatial (area)
            const ipp = (Math.log10(pop) * 1.5 + Math.log10(area)).toFixed(1);

            // D. Analyse des Points Chauds (Hotspots)
            let conflictRisk = "STABLE";
            let warning = "Surveillance de routine.";
            
            if (borders.length >= 6) {
                conflictRisk = "ÉLEVÉ (ENCLAVEMENT STRATÉGIQUE)";
                warning = "Multiplicité des théâtres d'opérations frontaliers.";
            } else if (ipp > 15) {
                conflictRisk = "HEGEMON RÉGIONAL";
                warning = "Capacité de projection de force majeure.";
            }

            // 4. RÉDACTION DU RAPPORT DE RENSEIGNEMENT
            const analysis = `
╔════════════════════════════════════════════════════════╗
  TERMINAL DE RENSEIGNEMENT GÉOPOLITIQUE : PUPPET STRINGS
╚════════════════════════════════════════════════════════╝
[CIBLE] : ${country.toUpperCase()}
[BLOC D'INFLUENCE] : ${powerColor} ${influenceBloc}
[RISQUE DE CONFLIT] : ${conflictRisk}

[1. ANALYSE DE LA PUISSANCE ÉTATIQUE]
> Indice de Puissance Projective : ${ipp} / 25
> Masse Critique : ${(pop / 1000000).toFixed(1)}M d'unités de population.
> Rayon d'action terrestre : ${borders.length} axes de pénétration possibles.

[2. CARTOGRAPHIE DES INFLUENCES]
> Sphère régionale : ${subregion.toUpperCase()}
> Statut frontalier : ${borders.length > 0 ? borders.join(', ') : 'ISOLEMENT MARITIME'}
> Dynamique : ${ipp > 12 ? 'ACTEUR DE DOMINATION' : 'ZONE D\'INFLUENCE SUBIE'}

[3. NOTE DE SYNTHÈSE GÉOSTRATÉGIQUE]
${warning}
L'analyse des vecteurs indique que ${country} occupe une position ${borders.length > 4 ? 'centrale et vulnérable' : 'périphérique sécurisée'}. 
Le poids démographique suggère une capacité de mobilisation ${pop > 50000000 ? 'massive' : 'limitée'}. 
Alignement tactique estimé : ${influenceBloc === "BLOC OCCIDENTAL (OTAN/UE)" ? "Priorité à la défense collective." : "Recherche d'autonomie ou alignement multipolaire."}

[ALERTES ACTIVES] : ${borders.length > 5 ? 'FRICTION FRONTALIÈRE DÉTECTÉE' : 'AUCUNE ANOMALIE MAJEURE'}
[SIGNATURE NUMÉRIQUE : OP_PUPPET_MASTER]
            `.trim();

            return res.status(200).json({ analysis });

        } catch (error) {
            return res.status(500).json({ 
                error: "Signal Interrompu", 
                analysis: `[ERREUR] : Impossible d'établir le profil géopolitique pour ${country}.` 
            });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
