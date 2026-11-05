// How doctors reach the Olive team. WhatsApp first: it is where doctors in Bangladesh
// already talk, and a chat link opens straight into the conversation.
export const CONTACT_WHATSAPP_DISPLAY = "01307-297677";
export const CONTACT_EMAIL = "asifazad@oliveai.life";

export function whatsappContactUrl(message: string): string {
    return `https://wa.me/8801307297677?text=${encodeURIComponent(message)}`;
}
