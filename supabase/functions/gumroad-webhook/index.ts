
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
        const email = formData.get('email')
        const saleId = formData.get('sale_id')
        const productId = formData.get('product_id')
        const refunded = formData.get('refunded') // "true" or "false"

        console.log(`Received webhook for email: ${email}, product: ${productId}, sale: ${saleId}, refunded: ${refunded}`)

        if (!email) {
            throw new Error('No email found in wedding payload')
        }

        // 2. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 3. Update the user's metadata
        // We search for the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) throw listError

        const user = users.find(u => u.email === email)

        if (!user) {
            console.log(`User with email ${email} not found in Supabase Auth. They might need to sign up first.`)
            // We still return 200 to Gumroad so it doesn't retry infinitely, 
            // but we log that the user needs to exist.
            return new Response(JSON.stringify({ message: 'User not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Determine the plan based on refunded status
        const newPlan = (refunded === 'true') ? 'free' : 'pro'

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, plan: newPlan } }
        )

        if (updateError) throw updateError

        console.log(`Successfully updated user ${email} to plan: ${newPlan}`)

        return new Response(JSON.stringify({ message: `Plan updated to ${newPlan}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
