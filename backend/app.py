from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Barbeiro, Cliente, Agendamento
from datetime import datetime
from sqlalchemy import func

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# Inicializa o banco de dados
with app.app_context():
    db.create_all()

# Rota para cadastro de barbeiro
@app.route('/api/barbeiros', methods=['POST'])
def cadastrar_barbeiro():
    data = request.json
    try:
        barbeiro = Barbeiro(
            nome=data['nome'],
            email=data['email'],
            endereco=data['endereco'],
            idade=data['idade'],
            senha=data['senha']
        )
        db.session.add(barbeiro)
        db.session.commit()
        return jsonify({'mensagem': 'Barbeiro cadastrado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

# Rota para cadastro de cliente
@app.route('/api/clientes', methods=['POST'])
def cadastrar_cliente():
    data = request.json
    try:
        cliente = Cliente(
            nome=data['nome'],
            telefone=data['telefone'],
            email=data['email']
        )
        db.session.add(cliente)
        db.session.commit()
        return jsonify({'mensagem': 'Cliente cadastrado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

# Rota para agendamento
@app.route('/api/agendamentos', methods=['POST'])
def agendar():
    data = request.json
    try:
        agendamento = Agendamento(
            barbeiro_id=data['barbeiro_id'],
            cliente_id=data['cliente_id'],
            data=datetime.strptime(data['data'], '%Y-%m-%d').date(),
            horario=datetime.strptime(data['horario'], '%H:%M').time()
        )
        db.session.add(agendamento)
        db.session.commit()
        return jsonify({'mensagem': 'Agendamento realizado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

# Rota de login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email').strip().lower()
    senha = data.get('senha')
    barbeiro = Barbeiro.query.filter(func.lower(Barbeiro.email) == email, Barbeiro.senha == senha).first()
    if barbeiro:
        return jsonify({'mensagem': 'Login realizado com sucesso!', 'barbeiro_id': barbeiro.id}), 200
    else:
        return jsonify({'erro': 'Login ou senha inválidos.'}), 401

# Rota para listar todos os clientes (auxiliar para agendamento)
@app.route('/api/clientes_todos', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([
        {'id': c.id, 'nome': c.nome, 'telefone': c.telefone, 'email': c.email}
        for c in clientes
    ])

# Rota para listar agendamentos de um barbeiro
@app.route('/api/agendamentos_barbeiro/<int:barbeiro_id>', methods=['GET'])
def agendamentos_barbeiro(barbeiro_id):
    agendamentos = Agendamento.query.filter_by(barbeiro_id=barbeiro_id).all()
    resultado = []
    for a in agendamentos:
        cliente = Cliente.query.get(a.cliente_id)
        resultado.append({
            'id': a.id,
            'cliente_nome': cliente.nome if cliente else 'Desconhecido',
            'cliente_telefone': cliente.telefone if cliente else '',
            'cliente_email': cliente.email if cliente else '',
            'data': a.data.strftime('%d/%m/%Y') if a.data else '',
            'horario': a.horario.strftime('%H:%M') if a.horario else ''
        })
    return jsonify(resultado)

# Rota para listar agendamentos de um barbeiro em uma data específica
@app.route('/api/agendamentos_barbeiro_data/<int:barbeiro_id>', methods=['GET'])
def agendamentos_barbeiro_data(barbeiro_id):
    data_str = request.args.get('data')  # espera yyyy-mm-dd
    if not data_str:
        return jsonify({'erro': 'Data não informada'}), 400
    try:
        data_obj = datetime.strptime(data_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'erro': 'Formato de data inválido'}), 400
    agendamentos = Agendamento.query.filter_by(barbeiro_id=barbeiro_id, data=data_obj).all()
    resultado = []
    for a in agendamentos:
        cliente = Cliente.query.get(a.cliente_id)
        resultado.append({
            'id': a.id,
            'cliente_nome': cliente.nome if cliente else 'Desconhecido',
            'cliente_telefone': cliente.telefone if cliente else '',
            'cliente_email': cliente.email if cliente else '',
            'data': a.data.strftime('%d/%m/%Y') if a.data else '',
            'horario': a.horario.strftime('%H:%M') if a.horario else ''
        })
    return jsonify(resultado)

# Rota para deletar (cancelar) agendamento
@app.route('/api/agendamentos/<int:agendamento_id>', methods=['DELETE'])
def deletar_agendamento(agendamento_id):
    agendamento = Agendamento.query.get(agendamento_id)
    if not agendamento:
        return jsonify({'erro': 'Agendamento não encontrado'}), 404
    try:
        db.session.delete(agendamento)
        db.session.commit()
        return jsonify({'mensagem': 'Agendamento cancelado com sucesso!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True) 