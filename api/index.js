export default async function handler(req, res) {
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

    // 1. Vérification de la clé
    if (!DEEPSEEK_KEY) {
        return res.status(500).json({ 
            error: "Configuration Incomplète", 
            analysis: "ERREUR : La clé DEEPSEEK_API_KEY n'est pas détectée dans les variables d'environnement Vercel." 
        });
    }

    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Requête invalide", analysis: "Aucun pays spécifié." });
        }

        try {
            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${DEEPSEEK_KEY.trim()}` 
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { 
                            role: "system", 
                            content: "Tu es un terminal de renseignement géopolitique froid. Donne une analyse flash en français. Max 3 phrases. Pas de politesse, pas d'astérisques." 
                        },
                        { role: "user", content: `Rapport stratégique : ${country}` }
                    ],
                    max_tokens: 250,
                    temperature: 0.6
                })
            });

            const data = await response.json();

            // 2. Gestion des erreurs spécifiques de l'API DeepSeek
            if (!response.ok) {
                let errorMsg = "Erreur API DeepSeek";
                if (response.status === 401) errorMsg = "Clé API invalide ou expirée.";
                if (response.status === 402) errorMsg = "Crédits DeepSeek insuffisants (Solde à 0).";
                if (response.status === 429) errorMsg = "Trop de requêtes (Limite atteinte).";
                
                return res.status(response.status).json({ 
                    error: errorMsg, 
                    analysis: `Statut ${response.status} : ${data.message || errorMsg}` 
                });
            }

            // 3. Extraction du contenu
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
                const analysis = data.choices[0].message.content;
                return res.status(200).json({ analysis });
            } else {
                return res.status(502).json({ 
                    error: "Format de données invalide", 
                    analysis: "Réponse reçue mais contenu illisible (Structure JSON inconnue)." 
                });
            }

        } catch (error) {
            return res.status(500).json({ 
                error: "Échec de connexion", 
                analysis: "Impossible de joindre les serveurs DeepSeek. Vérifiez la connexion réseau du proxy." 
            });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
