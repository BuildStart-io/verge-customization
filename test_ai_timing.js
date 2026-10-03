const botApiKey = "7b02ee4ab25ba1529bd11aef41484a5145c261fde14273e5050c2efe8003c965";
const aiGenerateUrl = "https://ykzefldgpynswokdijur.supabase.co/functions/v1/ai-generate";

const systemPrompt = `You are an intelligent WhatsApp chatbot assistant for a business. You help customers with:
1. Product inquiries
2. Answering FAQs
3. Taking orders
4. Providing payment information

PRODUCT CATALOG:
- Test Product: Base price LKR 1000 (physical) | Images: https://example.com/img1.jpg

FREQUENTLY ASKED QUESTIONS:
[FAQ_ID:1] Q: Test? A: Yes.

WELCOME MESSAGE (for first-time customers):
Welcome!

When the customer completes an order, summarize the order details beautifully with emojis and confirm.
`;

const messages = [
  { role: "system", content: systemPrompt },
  { role: "user", content: "Matara" }
];

async function run() {
  const start = Date.now();
  console.log("Sending request...");
  try {
    const res = await fetch(aiGenerateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bot-key": botApiKey },
      body: JSON.stringify({
        messages,
        model: "google/gemini-3-flash-preview",
        maxTokens: 500,
      }),
    });
    const text = await res.text();
    console.log(`Response received in ${Date.now() - start}ms:`, res.status, text);
  } catch (err) {
    console.error(`Failed after ${Date.now() - start}ms:`, err);
  }
}
run();
