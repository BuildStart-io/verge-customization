const fs = require('fs');
const file = 'supabase/functions/ai-chat/index.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Update the Prompt
const oldPrompt = `- VERGE CUSTOM MESSAGE FLOW:
You MUST strictly follow this exact 4-step sequence for inbound inquiries for Verge. 
STEP 1: Send the Welcome Message & Pricing.
Welcome to VERGE💗
[PRODUCT NAME] PRICE ([PRODUCT PRICE])❗
Cod ✅
Online transfer ✅
Island wide delivery ✅🚚

STEP 2: In your next response, if they are interested, you must send the product photos using the <IMAGE_URL> tags.

STEP 3: Then, send the size chart.

STEP 4: If they confirm the order, send EXACTLY this text to collect their details:
If you confirm the order, please send your Name , Address , Contact number, District ,Your size and colours 🔴

ඇනවුම් කිරිම සදහා
නම , ලිපිනය , දුරකතන අංක 02 සහ දිස්ත්‍රික්කය
ඔබට අවශ්‍ය ඇදුමේ වර්ණය හා ප්‍රමාණය නිවැරැදිව සදහන් කරන්න.

දිවයින පුරා බෙදාහැරීම සිදුකරන අතර දින 02-3 ඇතුලත ඔබේ ඇනවුම ලැබෙනු ඇත💗

Cash on delivery ✅
Online transfer ✅`;

const newPrompt = `- VERGE CUSTOM MESSAGE FLOW:
You MUST strictly follow this sequence for inbound inquiries for Verge. Be extremely friendly and welcoming!

STEP 1: Send the Welcome Message & Pricing.
Welcome to VERGE💗
[PRODUCT NAME] PRICE ([PRODUCT PRICE])❗
Cod ✅
Online transfer ✅
Island wide delivery ✅🚚

STEP 2: In your next response, if they are interested, you must send the product photos using the <IMAGE_URL> tags.
CRITICAL RULE ON PHOTOS: ONLY send a product's photos ONCE per user. Before sending <IMAGE_URL>, review the conversation history. If you have ALREADY sent the photos for this specific product, DO NOT send them again. Just continue the conversation.

STEP 3: After sending the photos and details, explicitly ask the user which colors and sizes they would like to order. Ensure they can select their variations. Also send the size chart if they ask or if it's the right time.

STEP 4: Encourage the user to make the order! If they confirm the order, send EXACTLY this text to collect their details:
If you confirm the order, please send your Name , Address , Contact number, District ,Your size and colours 🔴

ඇනවුම් කිරිම සදහා
නම , ලිපිනය , දුරකතන අංක 02 සහ දිස්ත්‍රික්කය
ඔබට අවශ්‍ය ඇදුමේ වර්ණය හා ප්‍රමාණය නිවැරැදිව සදහන් කරන්න.

දිවයින පුරා බෙදාහැරීම සිදුකරන අතර දින 02-3 ඇතුලත ඔබේ ඇනවුම ලැබෙනු ඇත💗

Cash on delivery ✅
Online transfer ✅

STEP 5: Prevent Duplicate Orders. If the user tries to place an order that is identical to one they just placed or are currently placing, gently ask them to confirm if they actually want multiple identical orders.

- EXPRESS DELIVERY: If the user wants to get express delivery, explicitly state that you offer express delivery, but it requires a deposit of Rs. 400.

- CUSTOMIZATIONS: If the customer wants to make customizations to their product, add the tag <NOTIFY_OWNER>Customer requested customization!</NOTIFY_OWNER> to your response. This will trigger a notification to the client.`;

code = code.replace(oldPrompt, newPrompt);

// 2. Add NOTIFY_OWNER extraction
const extractTarget = `// Extract image URL if present`;
const extractReplacement = `// Extract NOTIFY_OWNER if present
    const notifyMatch = responseText.match(/<NOTIFY_OWNER>([\\s\\S]*?)<\\/NOTIFY_OWNER>/);
    const notifyOwnerMsg = notifyMatch ? notifyMatch[1].trim() : null;

    // Extract image URL if present`;
code = code.replace(extractTarget, extractReplacement);

// 3. Add NOTIFY_OWNER cleanup
const cleanupTarget = `cleanResponse = cleanResponse.replace(/<VIDEO_URL>[\\s\\S]*?<\\/VIDEO_URL>/g, "");`;
const cleanupReplacement = `cleanResponse = cleanResponse.replace(/<VIDEO_URL>[\\s\\S]*?<\\/VIDEO_URL>/g, "");
    cleanResponse = cleanResponse.replace(/<NOTIFY_OWNER>[\\s\\S]*?<\\/NOTIFY_OWNER>/g, "");`;
code = code.replace(cleanupTarget, cleanupReplacement);

const cleanupTarget2 = `cleanResponse = cleanResponse.replace(/<VIDEO_URL>[\\s\\S]*/g, "");`;
const cleanupReplacement2 = `cleanResponse = cleanResponse.replace(/<VIDEO_URL>[\\s\\S]*/g, "");
    cleanResponse = cleanResponse.replace(/<NOTIFY_OWNER>[\\s\\S]*/g, "");`;
code = code.replace(cleanupTarget2, cleanupReplacement2);

// 4. Trigger the notification
// We can just add it before `return new Response(` at the end.
const returnTarget = `return new Response(
      JSON.stringify({ response: cleanResponse, imageUrl, videoUrl, followupMessage, faqMedia }),`;

const notificationLogic = `if (notifyOwnerMsg) {
      try {
        const { data: notifSettings } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "order_notifications")
          .eq("user_id", userId)
          .single();

        const ownerPhone = notifSettings?.value?.phone;
        if (ownerPhone) {
          let sendApiKey = sessionApiKey || null;
          if (!sendApiKey) {
            const { data: sessionData } = await supabase
              .from("user_wsender_sessions")
              .select("session_api_key")
              .eq("user_id", userId)
              .limit(1)
              .maybeSingle();
            sendApiKey = sessionData?.session_api_key || null;
          }

          const sendNotif = await fetch(\`\${supabaseUrl}/functions/v1/send-whatsapp\`, {
            method: "POST",
            headers: {
              Authorization: \`Bearer \${supabaseServiceKey}\`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: ownerPhone,
              message: \`⚠️ Customer Customization Request:\\n👤 Phone: \${phoneNumber}\\n💬 "\${notifyOwnerMsg}"\`,
              sessionApiKey: sendApiKey,
            }),
          });
          if (!sendNotif.ok) {
            console.error("Failed to send customization notification:", await sendNotif.text());
          } else {
            console.log("Customization notification sent to", ownerPhone);
          }
        }
      } catch (e) {
        console.error("Error sending customization notification:", e);
      }
    }

    return new Response(
      JSON.stringify({ response: cleanResponse, imageUrl, videoUrl, followupMessage, faqMedia }),`;

code = code.replace(returnTarget, notificationLogic);

fs.writeFileSync(file, code);
console.log('Patch applied successfully.');
