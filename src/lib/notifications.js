import { supabase } from './supabase'

export async function notifyAdmin(type, message, link = null) {
  await supabase.from('notifications').insert({
    for_admin: true,
    recipient_id: null,
    type,
    message,
    link,
  })
}

export async function notifyClient(clientId, type, message, link = null) {
  await supabase.from('notifications').insert({
    for_admin: false,
    recipient_id: clientId,
    type,
    message,
    link,
  })
}
