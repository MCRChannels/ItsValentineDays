import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nflbgnjdzfeelhfuttlx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbGJnbmpkemZlZWxoZnV0dGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTg0MjYsImV4cCI6MjA4NDgzNDQyNn0.uhZz0vDmnBlx7qDJpysd3yadXu5Qcl4dRGakK9FVmqw'

export const supabase = createClient(supabaseUrl, supabaseKey)
