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
        try {
            const response = await fetch("https://api.deepseek.com/chat/completions", {
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
                    max_tokens: 200
                })
            });

            const data = await response.json();
            const analysis = data.choices?.[0]?.message?.content || "Données indisponibles.";
            return res.status(200).json({ analysis });
        } catch (error) {
            return res.status(500).json({ error: "Échec serveur", analysis: "Erreur de liaison proxy." });
        }
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
}
