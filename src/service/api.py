import sys
sys.path.insert(1, "D:\\CIAT\\Code\\BID\\dci_fauno\\src\\orm")

from functools import wraps
import requests
import datetime
from flask import Flask, request, jsonify, make_response
import uuid
import jwt
from app_conf import config
from werkzeug.security import generate_password_hash, check_password_hash
from mongoengine import *
from fauno_entities import *
from mongoengine.queryset.visitor import Q
from flask_cors import cross_origin#CORS

app = Flask(__name__)

app.config['SECRET_KEY'] = config['SECRET_KEY']
app.config['MONGO_USER'] = config['MONGO_USER']
app.config['MONGO_PWD'] = config['MONGO_PWD']
app.config['MONGO_DB'] = config['MONGO_DB']

#cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
#CORS(app)

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        print(request)
        token = None

        if 'x-access-tokens' in request.headers:
            token = request.headers['x-access-tokens']

        if not token:
            return jsonify({'message': 'a valid token is missing'})

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"])
            current_user = User.objects.get(public_id=data['public_id'])
        except:
            return jsonify({'message': 'token is invalid'})

        return f(current_user, *args, **kwargs)
    
    return decorator

@app.route('/', methods=['GET'])
def home():
    return '<h1>Running Fauno API</h1>'

@app.route('/api/v1/register', methods=['GET', 'POST'])
@token_required
def signup_user():  
    data = request.get_json()  

    hashed_password = generate_password_hash(data['password'], method='sha256')

    public_id = str(uuid.uuid4())
    user = User(public_id = public_id, email = data['email'], password=hashed_password, admin=False)
    user.save()
    
    return jsonify({'user_id': public_id})

@app.route('/api/v1/login', methods=['POST'])  
@cross_origin()
def login_user(): 
    auth = request.get_json()

    if not auth or not auth.get("email") or not auth.get("password"):  
        return make_response('could not verify', 401, {'WWW.Authentication': 'Basic realm: "login required"'})    

    user = User.objects.get(email=auth.get("email"))

    if not user:
        # returns 401 if user does not exist
        return make_response('Could not verify',401,{'WWW-Authenticate' : 'Basic realm ="User does not exist !!"'})
     
    if check_password_hash(user.password, auth.get("password")):  
        token = jwt.encode({'public_id': user.public_id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(days=1)}, app.config['SECRET_KEY'])        
        return jsonify({'token' : token}) 

    return make_response('could not verify',  401, {'WWW.Authentication': 'Basic realm: "login required"'})

@app.route('/api/v1/locality',methods=['GET'])
def get_all_locality():
    adms = AdministrativeLevel.objects()
    localities = Locality.objects(enable=True)
    
    result = []
    
    for adm in adms:   
        a_data = {}           
        a_data['id'] = adm.id 
        a_data['name'] = adm.name 
        a_data['ext_id'] = adm.ext_id
        a_data['adm'] = adm.adm

        a_data['localities'] = [{'id':x.id, 'name':x.name, 'ext_id': x.ext_id } for x in localities if x.adm_level is adm.id]

        if len(a_data['localities']) > 0:
            result.append(a_data)   

    return jsonify({'regions': result})


@app.route('/api/v1/analysis/periods',methods=['GET'])
def get_analysis_periods():
    analysis = Analysis.objects()
    
    result = []

    for a in analysis:
        a_data = {}
        a_data['period'] = str(a.year_start) + "-" + str(a.year_end)

        result.append(a_data) 

    return jsonify({'periods': result})

@app.route('/api/v1/analysis/locality_risk',methods=['GET'])
def get_analysis_locality_risk():

    period = request.args.get("period").split("-")
    year_start = int(period[0])
    year_end = int(period[1])
    type_a = request.args.get("type")

    analysis = Analysis.objects.get(year_start = year_start, year_end = year_end)
    
    localities = Locality.objects()
    adms = AdministrativeLevel.objects()
    localities_risk = LocalityRisk.objects(analysis = analysis.id)

    result = []
    for lr in localities_risk:
        lr_data = {}

        l = [x for x in localities if x.id is lr.locality][0]
        a = [x for x in adms if x.id is l.adm_level][0]        
        
        #lr_data['locality'] = { id: l.id, name: l.name, ext_id: l.ext_id, 
        #                        adm_id: a.id, adm_ext_id: a.ext_id, adm_name: a.name, adm_adm:a.adm } 
        #lr_data['indicators'] = { def_ha: lr.def_ha, cattle_rancher: lr.cattle_rancher_amount, 
        #                        risk_total: lr.risk_total, 
        #                        d:lr.degree, d_in : lr.degree_in, d_out:lr.degree_out, b : lr.betweenness, c : lr.closeness }        
        result.append(lr_data) 

    return jsonify({'risk': result})

@app.route('/api/v1/analysis/locality_network',methods=['GET'])
def get_analysis_locality_network():

    period = request.args.get("period").split("-")
    year_start = int(period[0])
    year_end = int(period[1])
    type_a = request.args.get("type")
    locality = request.args.get("locality")

    analysis = Analysis.objects.get(year_start = year_start, year_end = year_end)
    
    localities = Locality.objects()
    adms = AdministrativeLevel.objects()    
    network = LocalityNetwork.objects(Q(analysis = analysis.id) & (Q(source = locality) | Q(destination = locality)))
   
    #n_out = [{id:x.destination, mobilization:x.mobilization} for x in network if x.source is lr.locality]
    #n_in = [{id:x.source, mobilization:x.mobilization} for x in network if x.destination is lr.locality]
    
    return jsonify({'network': {'in': n_in, 'out': n_out}})

@app.route('/api/v1/analysis/plots',methods=['GET'])
@token_required
def get_analysis_plot():
    ids = request.args.get("plots").split(',')

    plots = CattleRancher.objects(ext_id__in = ids)
    if not plots:
        return jsonify({'message': "plots were not found"})

    all_plots = CattleRancher.objects()

    result = []

    #for p in plots:
    #    p_data = {}

    #    risk = CattleRancherRisk.objects(cattle_rancher = p.id)
    #    m_out = CattleRancherNetwork.objects(destination = p.id)
    #    m_in = CattleRancherNetwork.objects(source = p.id)
        
    #    p_data["plot"] = {id:p.id, ext_id:p.ext_id}

    #    analysis:{ year_start:

    #    }}
    #    result.append(p_data) 

    return jsonify({'risk': result})
    

if __name__ == "__main__":
    
    connect('fauno_db',username=app.config['MONGO_USER'], password=app.config['MONGO_PWD'], authentication_source='admin', host='localhost', port=27017)
    app.run(threaded=True, port=5000, debug=True)
    #app.run(host='0.0.0.0', port=5000)

# Run in background
# nohup python3.8 melisa.py > melisa.log 2>&1 &