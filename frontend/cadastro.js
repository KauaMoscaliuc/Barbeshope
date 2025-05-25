document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const idade = document.getElementById('idade').value.trim();
    const senha = document.getElementById('senha').value;
    const mensagem = document.getElementById('mensagem-cadastro');

    if (!nome || !email || !endereco || !idade || !senha) {
        mensagem.style.color = '#ff5252';
        mensagem.textContent = 'Preencha todos os campos.';
        return;
    }
    if (parseInt(idade) < 16) {
        mensagem.style.color = '#ff5252';
        mensagem.textContent = 'Idade mínima para cadastro é 16 anos.';
        return;
    }

    // Envio para o backend Flask
    try {
        const resposta = await fetch('http://localhost:5000/api/barbeiros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, endereco, idade, senha })
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            mensagem.style.color = '#4caf50';
            mensagem.textContent = resultado.mensagem;
            document.getElementById('cadastroForm').reset();
        } else {
            mensagem.style.color = '#ff5252';
            mensagem.textContent = resultado.erro || 'Erro ao cadastrar.';
        }
    } catch (err) {
        mensagem.style.color = '#ff5252';
        mensagem.textContent = 'Erro de conexão com o servidor.';
    }
});

document.getElementById('voltar-login').addEventListener('click', function(e) {
    // Apenas navega para login.html
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagem-erro');

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
            // Redirecionar para o painel do barbeiro, se desejar
        } else {
            mensagemErro.style.color = '#ff5252';
            mensagemErro.textContent = resultado.erro || 'Login ou senha inválidos.';
        }
    } catch (err) {
        mensagemErro.style.color = '#ff5252';
        mensagemErro.textContent = 'Erro de conexão com o servidor.';
    }
});