from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Barbeiro(db.Model):
    __tablename__ = 'barbeiros'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    endereco = db.Column(db.String(200), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), nullable=False, default='Barbeiro')
    agendamentos = db.relationship('Agendamento', backref='barbeiro', cascade="all, delete-orphan")

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    agendamentos = db.relationship('Agendamento', backref='cliente', cascade="all, delete-orphan")

class Agendamento(db.Model):
    __tablename__ = 'agendamentos'
    id = db.Column(db.Integer, primary_key=True)
    barbeiro_id = db.Column(db.Integer, db.ForeignKey('barbeiros.id'), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    horario = db.Column(db.Time, nullable=False)
    __table_args__ = (db.UniqueConstraint('barbeiro_id', 'data', 'horario', name='unique_agendamento'),) 