// Configuração do Supabase
const SUPABASE_URL = 'https://myrajldepgkpzthxluhn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cmFqbGRlcGdrcHp0aHhsdWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjcyMjAsImV4cCI6MjA1OTkwMzIyMH0.vSgFlmXoRaQXhxDNhG61J6LgBgFGxubsk0vOFZAC8kU';

// Inicializa o cliente do Supabase utilizando o objeto global
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Evento disparado quando a conexão com o Supabase é bem-sucedida
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Configuração do Supabase carregada com sucesso!');
  
  // Verifica se o objeto supabase está disponível
  if (supabase) {
    console.log('✅ Cliente Supabase inicializado com sucesso!');
    
    // Mostrar indicador de conexão bem sucedida se existir no DOM
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
        connectionStatus.style.display = 'block';
        setTimeout(() => {
            connectionStatus.style.display = 'none';
        }, 3000);
    }
  }
});