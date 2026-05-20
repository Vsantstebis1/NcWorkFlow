// CONFIGURAÇÃO DO SUPABASE (Substitui com os teus dados do Passo 1)
const SUPABASE_URL = "https://rmhvzjihqnwgndhwvbwx.supabase.co";
const SUPABASE_KEY = "sb_publishable_BmTgRIwj5r48YnB5qZj35w_q3prHMd2";

// Função para extrair o ID do cliente a partir do URL (?cliente=nome_do_cliente)
function getClienteId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('cliente') || 'padrao';
}

const NCStorage = {
    clienteId: getClienteId(),

    async get(key) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/workflow_data?cliente_id=eq.${this.clienteId}&key_name=eq.${key}`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                return data[0].json_value;
            }
            return null;
        } catch (error) {
            console.error("Erro ao ler do Supabase:", error);
            return null;
        }
    },

    async set(key, val) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/workflow_data`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates' // Faz Upsert automático (insere ou atualiza)
                },
                body: JSON.stringify({
                    cliente_id: this.clienteId,
                    key_name: key,
                    json_value: val
                })
            });
        } catch (error) {
            console.error("Erro ao gravar no Supabase:", error);
        }
    }
};

// Exportar para compatibilidade global com os teus scripts antigos
window.NCStorage = NCStorage;