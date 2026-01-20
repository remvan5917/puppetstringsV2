// Ce fichier s'exécute uniquement sur le serveur (Node.js)
// Vos clés API sont ici, invisibles pour l'utilisateur.

export default async function handler(req, res) {
    // 1. Récupérer les clés depuis les variables d'environnement de Vercel
    // Assurez-vous d'ajouter DEEPSEEK_API_KEY et NEWS_API_KEY dans les paramètres de Vercel
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const NEWS_KEY = process.env.NEWS_API_KEY;

    // Route pour les News (GET)
    if (req.method === 'GET') {
        try {
            const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?category=general&apiKey=${NEWS_KEY}`);
            const data = await newsRes.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération des news" });
        }
    }

    // Route pour l'Analyse IA (POST)
    if (req.method === 'POST') {
        const { country } = req.body || {};
        
        try {
            const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${DEEPSEEK_KEY}` 
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { 
                            role: "system", 
                            content: "Tu es une IA de renseignement stratégique. Réponse froide et directe en français, maximum 3 phrases. N'utilise JAMAIS d'astérisques." 
                        },
                        { 
                            role: "user", 
                            content: `Analyse stratégique sur ${country}. Risques actuels ?` 
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.5
                })
            });

            const data = await aiRes.json();
            const analysis = data.choices?.[0]?.message?.content || "Analyse indisponible.";
            
            return res.status(200).json({ analysis });
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de l'analyse DeepSeek" });
        }
    }

    // Gestion des autres méthodes
    return res.status(405).json({ error: "Méthode non autorisée" });
}
