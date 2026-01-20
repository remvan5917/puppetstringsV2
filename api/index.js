export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Cible non identifiée." });
        }

        try {
            // 1. COLLECTE DES DONNÉES (Source: RestCountries /v3.1/)
            const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
            
            if (!countryRes.ok) throw new Error(`Erreur API: ${countryRes.status}`);

            const data = await countryRes.json();
            if (!data || data.length === 0) throw new Error("Pays non trouvé.");

            const c = data[0];

            // 2. EXTRACTION DES CHAMPS CLÉS (Logique utilisateur)
            const id = c.cca3; // Code ISO3
            const nom = c.name.common;
            const pop = c.population || 0;
            const area = c.area || 1;
            const neighbors = c.borders || [];
            const nbVoisins = neighbors.length;
            const coords = c.latlng || [0, 0];
            const isUN = c.unMember;

            // 3. ALGORITHME DE CALCUL DES PROXIES (Logique Gemini enrichie)
            
            // A. Classification par Catégorie de Puissance
            let categorie = "Petit État";
            if (pop > 100000000) categorie = "Superpuissance";
            else if (pop > 10000000) categorie = "Puissance majeure / Émergent";
            
            // B. Calcul du Risque Géopolitique (Proxy Tensions)
            // Formule: (nb_voisins / (pop / 1M))
            const popInMillions = pop / 1000000;
            const risqueGeo = popInMillions > 0 ? (nbVoisins / popInMillions).toFixed(3) : "INF";
            
            // C. Détermination de la Stabilité Interne (Simulée pour fusion NewsAPI)
            const stabiliteInterne = Math.max(15, Math.min(98, 100 - (risqueGeo * 10))).toFixed(0);

            // 4. RÉDACTION DU DOSSIER DE RENSEIGNEMENT
            const analysis = `
╔════════════════════════════════════════════════════════╗
  UNITÉ PUPPET : ANALYSE DÉTERMINISTE DES FLUX
  SYSTÈME DE SURVEILLANCE // SOURCE : OPEN-SOURCE (REST)
╚════════════════════════════════════════════════════════╝

[IDENTIFICATION ISO-3]
> ID UNIQUE : ${id}
> STATUT ONU : ${isUN ? 'MEMBRE ACTIF' : 'OBSERVATEUR / NON-MEMBRE'}
> COORDONNÉES : ${coords[0].toFixed(2)}N, ${coords[1].toFixed(2)}E

[1. PARAMÈTRES DE PUISSANCE]
> CATÉGORIE : ${categorie.toUpperCase()}
> UNITÉS DÉMOGRAPHIQUES : ${pop.toLocaleString()}
> CONTRÔLE SPATIAL : ${area.toLocaleString()} KM²

[2. CALCUL DES PROXIES DE RISQUE]
> NOMBRE DE FRONTIÈRES : ${nbVoisins}
> RISQUE GÉO (VOISINS/POP) : ${risqueGeo}
> SCORE DE STABILITÉ ESTIMÉ : ${stabiliteInterne}%

[3. RÉSEAU D'INFLUENCE]
> AXES LIMITROPHES : ${nbVoisins > 0 ? neighbors.join(', ') : 'ISOLEMENT TOTAL'}
> VULNÉRABILITÉ : ${risqueGeo > 1 ? 'CRITIQUE (DÉPENDANCE/ENCLAVEMENT)' : 'MODÉRÉE (AUTONOMIE)'}

[4. ANALYSE STRUCTURELLE]
L'analyse pour ${nom} indique un profil de "${categorie}". 
Avec un ratio de friction de ${risqueGeo}, le pays présente ${risqueGeo > 5 ? 'un risque d\'asphyxie par ses voisins' : 'une résilience structurelle face aux pressions frontalières'}.
Le score de stabilité de ${stabiliteInterne}% suggère un pivot stratégique ${pop > 50000000 ? 'majeur' : 'secondaire'} dans la zone ${c.subregion.toUpperCase()}.

[STATUS] : DONNÉES SYNCHRONISÉES (UPDATE 1H)
[SIGNATURE : SECTION_R_STRAT // GEMINI_GEOPOLITICS]
            `.trim();

            return res.status(200).json({ analysis });

        } catch (error) {
            return res.status(500).json({ 
                error: "Défaut de liaison", 
                analysis: `[ERREUR CRITIQUE] : Extraction impossible. Cible protégée ou hors-champ.` 
            });
        }
    }
    return res.status(405).json({ error: "Méthode non autorisée" });
}
