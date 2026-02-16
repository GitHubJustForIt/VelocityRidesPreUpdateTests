// ============================================
// VELOCITY RIDES - TEMPLATE DATA
// ============================================
// Hier kannst du einfach neue Templates hinzufügen oder bestehende bearbeiten
// Jedes Template braucht: id, title, description, price, gamepass, image, purchased, buyer, tags

// Discord Webhook URL - Hier wird die Pending Notification hingeschickt
const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1472624952917364998/dLUkhFwa2ZyEhrNbOHfwyRe3ufr8BtwzgH_kcni2fgtugwfaABMOq3vwdPTzfqJ9Q2OE';

// Template-Datenbank
const templates = [
    {
        id: '1',
        title: 'Boomerang',
        description: 'A family-friendly ride with a unique layout.',
        price: 80000,
        gamepass: 'Non-Collision (optional), Ride Operation (optional)',
        image: 'https://media.discordapp.net/attachments/1472624902153703567/1472661652922044710/fed14bd3-0711-4e73-9bd1-90ce3513b5e8.jpg?ex=6993628a&is=6992110a&hm=3e3cb4bfcb0732fe66b77eae99bfd6f4e90cefda2c5599a877be172ec3034e0e&=&format=webp&width=1446&height=800', 
        purchased: false,
        buyer: null,
        tags: ['Family', 'Attraction', 'Boomerang']
    }
];

// ============================================
// HELPER FUNCTIONS - Nicht bearbeiten
// ============================================

// Gibt alle Templates zurück
function getAllTemplates() {
    return templates;
}

// Gibt ein Template anhand der ID zurück
function getTemplateById(id) {
    return templates.find(t => t.id === id);
}

// Gibt den Discord Webhook URL zurück
function getWebhookUrl() {
    return DISCORD_WEBHOOK_URL;
}

// Markiere ein Template als gekauft
function markTemplateAsPurchased(templateId, buyerUsername) {
    const template = getTemplateById(templateId);
    if (template) {
        template.purchased = true;
        template.buyer = buyerUsername;
        
        // Remove pending status for all other users
        removePendingForOtherUsers(templateId, buyerUsername);
        
        // Remove pending status for the buyer (they own it now)
        removePendingForUser(templateId, buyerUsername);
        
        // Remove from wishlist for all users (including buyer)
        removeFromWishlistIfOwned(templateId, buyerUsername);
        
        // Also remove from all users' wishlists since it's sold
        const wishlist = getWishlist();
        const filtered = wishlist.filter(w => w.templateId !== templateId);
        localStorage.setItem('velocity_rides_wishlist', JSON.stringify(filtered));
        
        return true;
    }
    return false;
}

// Send Report to Discord Webhook
async function sendReportWebhook(template, username, issueDescription) {
    const webhookUrl = getWebhookUrl();
    
    if (!webhookUrl || webhookUrl.includes("HIER_EINFÜGEN")) {
        console.error("❌ Webhook URL fehlt oder ist ungültig!");
        return false;
    }

    const embed = {
        title: '🚩 Template Issue Report - Velocity Rides',
        color: 15158332, // Red color for reports
        fields: [
            {
                name: '👤 Reported by',
                value: username || "Unknown User",
                inline: true
            },
            {
                name: '🆔 Template ID',
                value: String(template.id),
                inline: true
            },
            {
                name: '📦 Template',
                value: template.title,
                inline: false
            },
            {
                name: '❗ Issue Description',
                value: issueDescription,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Velocity Rides Dashboard - Issue Report'
        }
    };

    if (template.image) {
        embed.thumbnail = { url: template.image };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `🚨 **Neuer Issue Report von ${username}!**`,
                embeds: [embed]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Discord API Error:', errorData);
            throw new Error(`Webhook request failed with status ${response.status}`);
        }

        console.log('✅ Report sent to Discord successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to send report to Discord:', error);
        return false;
    }
}
