import { supabase } from './supabase'

export async function logAudit(action, entityType, entityId, details = null) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_log').insert({
    actor_id: user?.id || null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  })
}
