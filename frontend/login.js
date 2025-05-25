document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagem-erro');

    if (email === '' || senha === '') {
        mensagemErro.textContent = 'Preencha todos os campos.';
        mensagemErro.style.color = '#ff5252';
        return;
    }

    try {
        const resposta = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            mensagemErro.style.color = '#4caf50';
            mensagemErro.textContent = resultado.mensagem;
            // Salva o id do barbeiro logado para uso futuro
            localStorage.setItem('barbeiro_id', resultado.barbeiro_id);
            // Redireciona para a tela de agendamento após 1 segundo
            setTimeout(() => {
                window.location.href = 'agendamento.html';
            }, 1000);
        } else {
            mensagemErro.style.color = '#ff5252';
            mensagemErro.textContent = resultado.erro || 'Login ou senha inválidos.';
        }
    } catch (err) {
        mensagemErro.style.color = '#ff5252';
        mensagemErro.textContent = 'Erro de conexão com o servidor.';
    }
});

document.getElementById('cadastro-link').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'cadastro.html';
}); 