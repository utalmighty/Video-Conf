from flask import Flask, render_template, request, redirect, url_for, flash
from flask_socketio import SocketIO, emit, send
#import json5 as json
#import psycopg2 as postgres

database = []
connections = []

con = Flask(__name__)

con.secretKey = 'HelloWorld.secretkey'
socket = SocketIO(con)

@con.route('/')
def home():
    return render_template('Home.html')

@socket.on('Credentials', namespace = '/private')
def Credentials(credential_json):
    if(credential_json['creator'] == True):
        sid = request.sid
        database.append({'username': credential_json['username'],
                        'password': credential_json['password'], 'sessionid': sid})
        print(credential_json['username'], 'User Added. Session ID: ', sid)
    else:
        print("joiner")
        for i in database:
            if i['username'] == credential_json['username']:
                if i['password'] == credential_json['password']:
                    whom = i['sessionid']
                    emit('Credentials', whom, namespace='/private')
                    print('allowed meeting')
                    break
        else:
            print('No Such Concurrent Meeting')

@socket.on('videofromjs', namespace ='/video')
def video(image):# image contain whom to send and image data
    emit('videofromflask', image['img'], room = image['to'], namespace='/video')# add room = image['to']


if __name__ == '__main__':
    #con.run()
    con.run()