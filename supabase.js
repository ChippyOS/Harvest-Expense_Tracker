import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jtjmzzjtfflcfjgednit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0am16emp0ZmZsY2ZqZ2Vkbml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTI1NTksImV4cCI6MjA2ODE2ODU1OX0.fu0lXUIFWacsMgK8LHUaH3Y0QMpSriYDJ5bpmnQQVpg'

export const supabase = createClient(supabaseUrl, supabaseKey)
