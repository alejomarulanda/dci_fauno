import requests
import datetime
from flask import Flask, request

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return '<h1>Running Fauno API</h1>'

# Adds support for GET requests to our webhook
@app.route('/webhook',methods=['GET','POST'])
def webhook():
    if request.method == 'GET':
        verify_token = request.args.get("hub.verify_token") 
        if verify_token == TOKEN:
            # Responds with the challenge token from the request
            return request.args.get("hub.challenge")
        return 'Unable to authorise.'
    else:
        data = request.get_json()


if __name__ == "__main__":
    
    #app.run(threaded=True, port=5000)
    app.run(host='0.0.0.0', port=5000)

# Run in background
# nohup python3.8 melisa.py > melisa.log 2>&1 &