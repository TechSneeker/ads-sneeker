const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

let supabase = null

function getClient() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY não configurados no .env')
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabase
}

async function signIn(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password })
  if (error) return { error: translateError(error.message) }
  return { user: data.user, session: data.session }
}

async function signUp(email, password) {
  const { data, error } = await getClient().auth.signUp({ email, password })
  if (error) return { error: translateError(error.message) }
  return { user: data.user }
}

async function signOut() {
  await getClient().auth.signOut()
}

async function getSession() {
  const { data } = await getClient().auth.getSession()
  return data.session
}

function translateError(msg) {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email')) return 'E-mail inválido.'
  return msg
}

module.exports = { signIn, signUp, signOut, getSession }
