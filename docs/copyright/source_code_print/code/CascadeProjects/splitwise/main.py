from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///splitwise.db'
db = SQLAlchemy(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    expenses = db.relationship('Expense', backref='owner', lazy=True)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(username=data['username'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.get_json()
    new_expense = Expense(amount=data['amount'], description=data['description'], user_id=data['user_id'])
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({'message': 'Expense created'}), 201

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
