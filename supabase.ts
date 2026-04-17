import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://arxmvziepsgrsgdsshke.supabase.co'
const supabaseKey = 'sb_publishable_UiL0ev95wuX077_GrIxslA_HbtR4ZXv'



export const supabase = createClient( supabaseUrl, supabaseKey )