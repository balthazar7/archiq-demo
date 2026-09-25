// Edge Function : start-game
//
// Ouvre une session de jeu à usage unique. Son identifiant devra
// accompagner l'envoi du score. Deux effets :
//   - on ne peut pas inscrire un score sans avoir ouvert une partie
//     au préalable, ce qui rend l'envoi instantané détectable ;
//   - une partie valide ne peut pas être rejouée en boucle.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'méthode non autorisée' }, 405)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await admin
    .from('game_sessions')
    .insert({})
    .select('id')
    .single()

  if (error) {
    console.error('start-game:', error.message)
    return json({ error: 'session non créée' }, 500)
  }

  return json({ sessionId: data.id })
})
