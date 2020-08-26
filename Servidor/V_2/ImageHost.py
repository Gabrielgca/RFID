from flask import Flask,redirect,url_for
from flask_ngrok import run_with_ngrok
import os

#print(os.getcwd().replace("\\","/"))
app = Flask (__name__)
run_with_ngrok(app)
@app.route('/')
def renderImage ():
    return url_for('static',filename = 'images/Python.png',_external = True)
    #return redirect(url_for('static',filename = 'Python.png'))

if __name__ == '__main__':
  app.run ()