import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const improveText = async (text: string, type: 'actions' | 'results'): Promise<string | null> => {
    const ai = getClient();
    if (!ai) {
        console.warn("API Key missing for Gemini");
        return null;
    }

    try {
        const systemInstruction = `Você é um especialista em relatórios governamentais e técnicos de TI. 
        Sua tarefa é melhorar a redação de um texto para um relatório oficial de prestação de contas (Relatório de Gestão).
        Use uma linguagem formal, impessoal, clara e objetiva. Corrija erros gramaticais.
        Mantenha os fatos, mas melhore a fluidez e o profissionalismo.`;

        const prompt = type === 'actions' 
            ? `Melhore a seguinte descrição de 'Ações Realizadas':\n\n${text}`
            : `Melhore a seguinte descrição de 'Resultados Alcançados' (focando em impacto e benefícios):\n\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, 
            }
        });

        return response.text?.trim() || null;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return null;
    }
};