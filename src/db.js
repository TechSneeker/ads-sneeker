const { createClient } = require('@supabase/supabase-js')
const { encrypt, decrypt } = require('./crypto')

let supabase = null
let currentUserId = null
let cachedGeminiKey = null

function getClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY não configurados')
    supabase = createClient(url, key)
  }
  return supabase
}

function setSession(session, userId) {
  currentUserId = userId
  cachedGeminiKey = null
  if (session) getClient().auth.setSession(session)
}

function getUserId() { return currentUserId }
function getUserGeminiKey() { return cachedGeminiKey }
function setCachedGeminiKey(key) { cachedGeminiKey = key }

// ── Operações ──

async function listOperations() {
  const { data, error } = await getClient()
    .from('operations')
    .select('id, slug, name, content')
    .order('name')
  if (error) throw error
  return data
}

async function saveOperation({ id, slug, name, content }) {
  const client = getClient()
  if (id) {
    const { error } = await client
      .from('operations')
      .update({ name, content, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return id
  }
  const safeSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data, error } = await client
    .from('operations')
    .insert({ user_id: currentUserId, slug: safeSlug, name, content })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function deleteOperation(id) {
  const { error } = await getClient()
    .from('operations')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

async function getOperation(slug) {
  const { data, error } = await getClient()
    .from('operations')
    .select('content')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data.content
}

async function getOperationById(id) {
  const { data, error } = await getClient()
    .from('operations')
    .select('id, name, content')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

// ── Configurações do usuário ──

async function getSettings() {
  const { data } = await getClient()
    .from('user_settings')
    .select('gemini_key')
    .eq('user_id', currentUserId)
    .single()
  if (!data) return {}
  const key = data.gemini_key ? decrypt(data.gemini_key, currentUserId) : ''
  if (key) cachedGeminiKey = key
  return { gemini_key: key }
}

async function saveSettings({ geminiKey }) {
  const encrypted = geminiKey ? encrypt(geminiKey, currentUserId) : null
  const { error } = await getClient()
    .from('user_settings')
    .upsert({
      user_id: currentUserId,
      gemini_key: encrypted,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
  if (error) throw error
  cachedGeminiKey = geminiKey || null
  return true
}

// ── Chats ──

async function listChats() {
  const { data, error } = await getClient()
    .from('chats')
    .select('id, title, updated_at')
    .eq('user_id', currentUserId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data || []).map(chat => ({
    ...chat,
    updatedAt: chat.updated_at || new Date().toISOString()
  }))
}

async function loadChat(id) {
  const { data, error } = await getClient()
    .from('chats')
    .select('id, title, messages')
    .eq('id', id)
    .eq('user_id', currentUserId)
    .single()
  if (error) return null
  return data
}

async function saveChat({ id, title, messages, platform, operation_id }) {
  const client = getClient()
  if (id) {
    const { error } = await client
      .from('chats')
      .update({
        title,
        messages,
        platform: platform || 'geral',
        operation_id: operation_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', currentUserId)
    if (error) throw error
    return id
  }
  const { data, error } = await client
    .from('chats')
    .insert({
      user_id: currentUserId,
      title,
      messages,
      platform: platform || 'geral',
      operation_id: operation_id || null
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function deleteChat(id) {
  const { error } = await getClient()
    .from('chats')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUserId)
  if (error) throw error
  return true
}

module.exports = { getClient, setSession, getUserId, getUserGeminiKey, setCachedGeminiKey, listOperations, saveOperation, deleteOperation, getOperation, getOperationById, getSettings, saveSettings, listChats, loadChat, saveChat, deleteChat }
