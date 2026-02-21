
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Gumroad sends data as application/x-www-form-urlencoded
        const { email, sale_id, product_id, refunded } = req.body;

        console.log(`Webhook received: email=${email}, product=${product_id}, sale=${sale_id}, refunded=${refunded}`);

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Initialize Supabase Admin
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables');
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Find user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) throw listError;

        const user = users.find(u => u.email === email);

        if (!user) {
            console.log(`User ${email} not found in Auth. Upgrade pending signup.`);
            return res.status(200).json({ message: 'User not found, but logged' });
        }

        // 2. Update Plan
        const newPlan = (refunded === 'true' || refunded === true) ? 'free' : 'pro';

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, plan: newPlan } }
        );

        if (updateError) throw updateError;

        console.log(`User ${email} successfully upgraded to ${newPlan}`);
        return res.status(200).json({ message: `Success: Plan updated to ${newPlan}` });

    } catch (error) {
        console.error('Webhook processing failed:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
