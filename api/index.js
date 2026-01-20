export default async function handler(req, res) {
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_KEY) {
        return res.status(500).json({ 
            error: "Configuration Incomplète", 
            analysis: "Erreur : La clé DEEPSEEK_API_KEY est manquante sur Vercel." 
        });
    }

    if (req.method === 'POST') {
        const { country } = req.body;
        
        if (!country) {
            return res.status(400).json({ error: "Requête invalide", analysis: "Aucun pays spécifié." });
        }

        try {
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
                            content: "Tu es un terminal de renseignement géopolitique froid. Donne une analyse flash en français. Max 3 phrases. Pas de politesse." 
                        },
                        { role: "user", content: `Rapport pour : ${country}` }
                    ],
                    max_tokens: 250,
                    temperature: 0.7
                })
            });

            const text = await response.text();

            if (!response.ok) {
                return res.status(response.status).json({
                    error: "Erreur API DeepSeek",
                    analysis: text
                });
            }

            const data = JSON.parse(text);

            if (data?.choices?.[0]?.message?.content) {
                return res.status(200).json({ analysis: data.choices[0].message.content });
            }

            return res.status(502).json({ 
                error: "Données invalides", 
                analysis: "Le serveur a renvoyé un format de données illisible." 
            });

        } catch (error) {
            console.error("Erreur Proxy DeepSeek:", error);
            return res.status(500).json({ 
                error: "Échec serveur", 
                analysis: "Erreur de liaison proxy : impossible de contacter l'IA." 
            });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
