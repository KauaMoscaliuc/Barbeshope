document.getElementById('agendamentoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const mensagem = document.getElementById('mensagem-agendamento');

    if (!nome || !telefone || !email || !data || !horario) {
        mensagem.style.color = '#ff5252';
        mensagem.textContent = 'Preencha todos os campos.';
        return;
    }

    try {
        
        const respostaCliente = await fetch('http://localhost:5000/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, email })
        });
        const resultadoCliente = await respostaCliente.json();
        if (!respostaCliente.ok) {
            mensagem.style.color = '#ff5252';
            mensagem.textContent = resultadoCliente.erro || 'Erro ao cadastrar cliente.';
            return;
        }

        
        const clienteId = await buscarClienteIdPorEmail(email);
        if (!clienteId) {
            mensagem.style.color = '#ff5252';
            mensagem.textContent = 'Erro ao localizar cliente cadastrado.';
            return;
        }

        
        const barbeiroId = localStorage.getItem('barbeiro_id');
        const respostaAgendamento = await fetch('http://localhost:5000/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barbeiro_id: barbeiroId, cliente_id: clienteId, data, horario })
        });
        const resultadoAgendamento = await respostaAgendamento.json();
        if (respostaAgendamento.ok) {
            mensagem.style.color = '#4caf50';
            mensagem.textContent = resultadoAgendamento.mensagem;
            document.getElementById('agendamentoForm').reset();
        } else {
            mensagem.style.color = '#ff5252';
            mensagem.textContent = resultadoAgendamento.erro || 'Erro ao agendar.';
        }
    } catch (err) {
        mensagem.style.color = '#ff5252';
        mensagem.textContent = 'Erro de conexão com o servidor.';
    }
});


async function buscarClienteIdPorEmail(email) {
    try {
        const resposta = await fetch('http://localhost:5000/api/clientes_todos');
        const clientes = await resposta.json();
        const cliente = clientes.find(c => c.email === email);
        return cliente ? cliente.id : null;
    } catch {
        return null;
    }
}


const btnLupa = document.getElementById('btn-lupa');
const modal = document.getElementById('modal-agendamentos');
const fecharModal = document.getElementById('fechar-modal');
const listaAgendamentos = document.getElementById('lista-agendamentos');


if (!document.getElementById('filtro-data')) {
    const label = document.createElement('label');
    label.setAttribute('for', 'filtro-data');
    label.textContent = 'Filtrar por data:';
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    const inputData = document.createElement('input');
    inputData.type = 'date';
    inputData.id = 'filtro-data';
    inputData.style.marginBottom = '15px';
    inputData.style.display = 'block';
    const lista = document.getElementById('lista-agendamentos');
    lista.parentNode.insertBefore(label, lista);
    lista.parentNode.insertBefore(inputData, lista);
}


async function carregarAgendamentosBarbeiro() {
    const barbeiroId = localStorage.getItem('barbeiro_id');
    const filtroData = document.getElementById('filtro-data').value; 

    if (!barbeiroId) {
        console.log('Barbeiro não identificado');
        const listaAgendamentos = document.getElementById('lista-agendamentos');
        listaAgendamentos.innerHTML = '<li class="erro">Por favor, faça login primeiro.</li>';
        return;
    }

    try {
        let url = `http://localhost:5000/api/agendamentos_barbeiro/${barbeiroId}`;
        if (filtroData) {
            url = `http://localhost:5000/api/agendamentos_barbeiro_data/${barbeiroId}?data=${filtroData}`;
        }
        console.log('Buscando agendamentos...', url); 
        const resposta = await fetch(url);
        console.log('Resposta recebida:', resposta); 
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const agendamentos = await resposta.json();
        console.log('Agendamentos:', agendamentos); 
        
        const listaAgendamentos = document.getElementById('lista-agendamentos');
        listaAgendamentos.innerHTML = '';
        
        if (agendamentos.length === 0) {
            listaAgendamentos.innerHTML = '<li class="sem-agendamentos">Nenhum agendamento encontrado.</li>';
        } else {
            agendamentos.forEach(a => {
                listaAgendamentos.innerHTML += `
                    <li class="agendamento-item" data-id="${a.id}" style="position: relative;">
                        <span class="cancelar-agendamento" title="Cancelar agendamento">&times;</span>
                        <div class="agendamento-info" style="color: #fff;">
                            <strong>Cliente:</strong> ${a.cliente_nome}<br>
                            <strong>Telefone:</strong> ${a.cliente_telefone}<br>
                            <strong>E-mail:</strong> ${a.cliente_email}<br>
                            <strong>Data:</strong> ${a.data}<br>
                            <strong>Horário:</strong> ${a.horario}
                        </div>
                    </li>`;
            });
        }

        
        document.querySelectorAll('.cancelar-agendamento').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                const li = e.target.closest('.agendamento-item');
                const agendamentoId = li.getAttribute('data-id');
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    try {
                        const resp = await fetch(`http://localhost:5000/api/agendamentos/${agendamentoId}`, { method: 'DELETE' });
                        const resultado = await resp.json();
                        if (resp.ok) {
                            alert('Agendamento cancelado com sucesso!');
                            carregarAgendamentosBarbeiro();
                        } else {
                            alert(resultado.erro || 'Erro ao cancelar agendamento.');
                        }
                    } catch {
                        alert('Erro de conexão com o servidor.');
                    }
                }
            });
        });
    } catch (erro) {
        console.error('Erro ao carregar agendamentos:', erro);
        const listaAgendamentos = document.getElementById('lista-agendamentos');
        listaAgendamentos.innerHTML = `<li class="erro">Erro ao carregar agendamentos: ${erro.message}</li>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, verificando login...'); 
    const barbeiroId = localStorage.getItem('barbeiro_id');
    if (barbeiroId) {
        console.log('Barbeiro logado, carregando agendamentos...'); 
        carregarAgendamentosBarbeiro();
    } else {
        console.log('Nenhum barbeiro logado'); 
    }
});


btnLupa.addEventListener('click', function() {
    carregarAgendamentosBarbeiro();
    modal.style.display = 'flex';
});


const filtroDataInput = document.getElementById('filtro-data');
filtroDataInput.addEventListener('change', carregarAgendamentosBarbeiro);

fecharModal.addEventListener('click', function() {
    modal.style.display = 'none';
});


modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});


const style = document.createElement('style');
style.textContent = `
    .agendamento-item {
        background-color: #f5f5f5;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .agendamento-info {
        color: #333;
        line-height: 1.6;
    }

    .sem-agendamentos {
        color: #666;
        text-align: center;
        padding: 20px;
        font-style: italic;
    }

    .erro {
        color: #ff5252;
        text-align: center;
        padding: 20px;
    }

    #lista-agendamentos {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 400px;
        overflow-y: auto;
    }

    .cancelar-agendamento {
        color: #ffb300;
        font-size: 1.5em;
        position: absolute;
        top: 10px;
        right: 12px;
        cursor: pointer;
        transition: color 0.2s;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        z-index: 2;
    }
    .cancelar-agendamento:hover {
        color: #ff5252;
    }
`;
document.head.appendChild(style); 