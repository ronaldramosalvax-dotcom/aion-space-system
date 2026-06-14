export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    
    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Falta la API Key en el servidor Vercel' });
    }

    try {
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: query }] }],
                systemInstruction: {
                    parts: [{ text: "Eres el asistente de IA oficial de la plataforma educativa AION SPACE SYSTEM para alumnos de la UTP. Te especializas en guiar y explicar temas de Introducción a las TIC, Principios de Algoritmos (PSeInt, pseudocódigo) y Matemática II (Matrices, cálculo integral y sistemas de ecuaciones lineales). Responde siempre usando un tono amigable, claro, didáctico y con léxico tecnológico/espacial alineado a la interfaz de la plataforma." }]
                }
            }) // <-- AQUÍ SE CERRABA EL JSON.stringify
        }); // <-- AQUÍ SE CERRABA EL fetch

        const data = await googleResponse.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error("Error en backend:", error);
        return res.status(500).json({ error: 'Error en el servidor backend', detalles: error.message });
    }
}
