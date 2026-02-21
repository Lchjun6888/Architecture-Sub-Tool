

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Get the payload from Gumroad
        // Gumroad sends data as application/x-www-form-urlencoded
        const formData = await req.formData()
        const email = formData.get('email')?.toString()
        const saleId = formData.get('sale_id')?.toString()
        const productId = formData.get('product_id')?.toString()
        const refunded = formData.get('refunded')?.toString() // "true" or "false"

        console.log(`Received webhook: Email=${email}, Product=${productId}, Refunded=${refunded}`)

        if (!email) {
            throw new Error('No email found in payload')
        }

        // 2. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 3. Find the user ID from the profiles table using email
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profileError || !profile) {
            console.log(`No profile found for email ${email}. They may need to sign up first.`)
            return new Response(JSON.stringify({ message: 'User profile not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 so Gumroad stops retrying
            })
        }

        const userId = profile.id
        const newPlan = (refunded === 'true') ? 'free' : 'pro'

        // 4. Update the profiles table
        const { error: dbUpdateError } = await supabaseAdmin
            .from('profiles')
            .update({ plan: newPlan, updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (dbUpdateError) throw dbUpdateError

        // 5. Update user_metadata in Auth (so the frontend gets the update immediately on next session/refresh)
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { plan: newPlan } }
        )

        if (authUpdateError) {
            console.warn(`Auth metadata update failed for ${userId}:`, authUpdateError.message)
            // We don't throw here because the DB update succeeded
        }

        console.log(`SUCCESS: User ${email} (${userId}) set to plan: ${newPlan}`)

        return new Response(JSON.stringify({ message: `Successfully updated to ${newPlan}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook processing failed:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

