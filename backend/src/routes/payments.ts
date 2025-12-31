import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Map Gumroad Product IDs to Credit Amounts
const PRODUCT_CREDITS: Record<string, number> = {
    'fpnbfj': 1, 
};

// POST /api/webhooks/gumroad
router.post('/gumroad', async (req: Request, res: Response) => {
    try {
        // Gumroad sends data as form-urlencoded by default
        const data = req.body;
        
        console.log("Gumroad Webhook Received:", data);

        // Verify Seller ID for security (re-added as requested)
        const SELLER_ID = process.env.GUMROAD_SELLER_ID;
        if (data.seller_id !== SELLER_ID) {
            console.warn(`Unauthorized Gumroad Webhook: Expected ${SELLER_ID}, got ${data.seller_id}`);
            return res.status(401).send('Unauthorized');
        }

        const { product_id, email, sale_id } = data;
        
        // We expect user_id to be passed as a custom field
        // Support both user_id and UserID (case insensitive)
        const userId = data['custom_fields[user_id]'] || data.user_id || data.UserID || data['custom_fields[UserID]'];

        if (sale_id && userId) {
            const creditsToAdd = PRODUCT_CREDITS[product_id] || 10;

            console.log(`Gumroad: Payment success for user ${userId}, adding ${creditsToAdd} credits`);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: {
                        increment: creditsToAdd
                    }
                }
            });
        }

        return res.status(200).send('OK');
    } catch (err: any) {
        console.error("Gumroad Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// POST /api/payments/webhook - RevenueCat Webhook Listener
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const { event } = req.body;
        
        // Basic check - In production, you would verify the REVENUECAT_WEBHOOK_SECRET header
        if (!event) {
            console.warn("Received empty webhook body");
            return res.status(400).send("No event provided");
        }

        const { type, app_user_id, product_id } = event;

        console.log(`Payment Webhook: Received ${type} for user ${app_user_id} (Product: ${product_id})`);

        // We only care about success purchases (INITIAL_PURCHASE or NON_RENEWING_PURCHASE)
        const isPurchase = type === 'INITIAL_PURCHASE' || type === 'NON_RENEWING_PURCHASE' || type === 'RENEWAL';
        
        if (isPurchase && product_id in PRODUCT_CREDITS) {
            const creditsToAdd = PRODUCT_CREDITS[product_id];
            
            // Increment the user's credits in the database
            await prisma.user.update({
                where: { id: app_user_id },
                data: {
                    credits: {
                        increment: creditsToAdd
                    }
                }
            });

            console.log(`✅ Success: Added ${creditsToAdd} credits to user ${app_user_id}`);
        } else {
            console.log(`ℹ️ Ignored: Event type ${type} or product ${product_id} not handled.`);
        }

        // Always return 200 to RevenueCat to acknowledge receipt
        return res.status(200).send({ received: true });

    } catch (error) {
        console.error("❌ Payment Webhook Error:", error);
        // We still return 200 to avoid RevenueCat retrying indefinitely if it's a code error, 
        // but log it for debugging.
        return res.status(200).send({ error: "Internal processing error" });
    }
});

export default router;
