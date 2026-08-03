import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInsights(products: any[], changes: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an e-commerce intelligence expert. Analyze competitor data and provide actionable insights in Polish. Keep responses concise and practical."
        },
        {
          role: "user",
          content: `Analyze these competitor changes and provide insights:\n\nNew products: ${changes.newProducts.length}\nPrice changes: ${changes.priceChanges.length}\nStock changes: ${changes.stockChanges.length}\n\nProducts data: ${JSON.stringify(products.slice(0, 10))}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    return response.choices[0].message.content || "No insights generated";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "AI analysis temporarily unavailable";
  }
}

export async function generateRecommendations(insights: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an e-commerce strategy expert. Based on competitor analysis, provide 3-5 specific actionable recommendations. Respond in Polish."
        },
        {
          role: "user",
          content: `Based on these insights: ${insights}\n\nProvide 3-5 specific recommendations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });
    return response.choices[0].message.content || "No recommendations generated";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "Recommendations temporarily unavailable";
  }
}
