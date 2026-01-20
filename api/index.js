export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Pays manquant." });
        }

        try {
            // Étape 1 : Récupération de données réelles et gratuites (RestCountries API)
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
            
            if (!response.ok) throw new Error("Données géopolitiques introuvables.");
            
            const data = await response.json();
            const countryData = data[0];

            // Étape 2 : Extraction des variables pour notre algorithme
            const pop = countryData.population;
            const region = countryData.region;
            const subregion = countryData.subregion;
            const area = countryData.area;
            const borders = countryData.borders ? countryData.borders.length : 0;

            // Étape 3 : L'Algorithme de Traitement (Simulation de Renseignement)
            // On calcule un "Indice de Complexité" basé sur la population et les frontières
            const complexityIndex = ((pop / 1000000) * (borders + 1)).toFixed(2);
            
            let status = "STABLE";
            if (borders > 5) status = "VOLATIL (MULTIPLE FRONTIÈRES)";
            if (pop > 50000000) status = "ALERTE : DENSITÉ CRITIQUE";

            // Étape 4 : Génération du rapport formaté
            const analysis = `
                [DONNÉES BRUTES RÉCUPÉRÉES]
                Région : ${region} (${subregion})
                Population : ${(pop / 1000000).toFixed(1)}M d'unités.
                Frontières Actives : ${borders} zones de contact.
                
                [ANALYSE ALGORITHMIQUE]
                Indice de complexité : ${complexityIndex}
                Statut système : ${status}
                
                Note stratégique : L'étendue de ${area.toLocaleString()} km² nécessite une surveillance satellite accrue. Flux de données ${pop > 10000000 ? 'haute intensité' : 'basse intensité'}.
            `.trim();

            return res.status(200).json({ analysis });

        } catch (error) {
            return res.status(500).json({ 
                error: "Erreur de traitement", 
                analysis: `Échec de l'interception des données pour ${country}. Le cryptage local a échoué.` 
            });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
