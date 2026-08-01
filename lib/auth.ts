import { supabase } from './supabase';
import { getSoulType } from './soul-engine';

export async function getOrCreateSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  // 匿名ログイン
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function saveProfile(birthday: {
  year: number;
  month: number;
  day: number;
}) {
  const session = await getOrCreateSession();
  if (!session) throw new Error('no session');

  const soul = getSoulType(birthday);
  const birthdayStr = `${birthday.year}-${String(birthday.month).padStart(2,'0')}-${String(birthday.day).padStart(2,'0')}`;

  const { error } = await supabase.from('profiles').upsert({
    id: session.user.id,
    birthday: birthdayStr,
    main_star: soul.mainStar,
    sub_star: soul.subStar,
    hidden_star: soul.hiddenStar,
    destiny_number: soul.destinyNumber,
    soul_age: soul.soulAge,
    element: soul.element,
    engine_version: 'v1',
  });

  if (error) throw error;
  return soul;
}

export async function getProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  return data;
}

export async function getCachedReading(yearMonth: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('readings')
    .select('content')
    .eq('user_id', session.user.id)
    .eq('year_month', yearMonth)
    .maybeSingle();

  return data?.content ?? null;
}

export async function saveReading(
  yearMonth: string,
  mainStar: string,
  content: object
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from('readings').upsert({
    user_id: session.user.id,
    year_month: yearMonth,
    main_star: mainStar,
    content,
  });
}