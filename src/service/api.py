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
@cross_origin()
def get_all_locality():
    
    localities = Locality.objects(enable=True)
        
    result = [{'adm_adm':x.adm_level.adm, 'adm_id':str(x.adm_level.id), 'adm_name':x.adm_level.name, 'adm_ext_id': x.adm_level.ext_id,
               'loc_id':str(x.id), 'loc_name':x.name, 'loc_ext_id': x.ext_id } for x in localities]

    return jsonify(result)

@app.route('/api/v1/locality/search',methods=['GET'])
@cross_origin()
def get_search_locality():
    term = request.args.get("term")
    localities = Locality.objects(Q(enable=True) & (Q(name__contains = term) | Q(adm_level__name__contains = term)) )
        
    result = [{'adm_adm':x.adm_level.adm, 'adm_id':str(x.adm_level.id), 'adm_name':x.adm_level.name, 'adm_ext_id': x.adm_level.ext_id,
               'loc_id':str(x.id), 'loc_name':x.name, 'loc_ext_id': x.ext_id } for x in localities]

    return jsonify(result)


@app.route('/api/v1/analysis/periods',methods=['GET'])
@cross_origin()
def get_analysis_periods():
    analysis = Analysis.objects()
    
    result = []

    for a in analysis:
        a_data = {}
        a_data['period'] = str(a.year_start) + "-" + str(a.year_end)

        result.append(a_data) 

    return jsonify({'periods': result})

@app.route('/api/v1/analysis/locality',methods=['GET'])
@cross_origin()
def get_analysis_locality():
    # Getting list of all plots requeste
    ids = request.args.get("ids").split(',')

    # Getting all_localities from databases
    localities = Locality.objects(ext_id__in = ids)
    if not localities:
        return jsonify({'message': "Localities were not found"})

    localities_list = [x.id for x in localities]
    #plots = CattleRancher.objects(id__in = plots_list)
    mob = LocalityNetwork.objects(Q(destination__in = localities_list) | Q(source__in = localities_list))
    
    # Search all all_localities data
    all_localities = localities_list + [x.source.id for x in mob] + [x.destination.id for x in mob]

    risk = LocalityRisk.objects(locality__in = all_localities)
    result = []

    for l in localities:
        l_data = {}

        l_data["locality"] = {'id':str(l.id), 'ext_id':l.ext_id, 'name':l.name }
        
        l_data["risk"] = [{'year_start':x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                            'cr_amount':x.cattle_rancher_amount, 'def_area': x.def_ha, 'rt': x.risk_total,
                            'degree': x.degree,'degree_in': x.degree_in, 'degree_out': x.degree_out,  
                            'betweenness':x.betweenness, 'closeness':x.closeness }
                            for x in risk if x.locality.id == p.id ]
                
        l_data["in"] = [{'year_start': x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                        'locality_reference': {'id': str(x.source.id), 'ext_id':x.source.ext_id, 'name':x.source.name},
                        'total':x.total, 'exchange':[ {"label": y.label, "amount": y.amount } for y in x.mobilization] } 
                        for x in mob if x.destination.id == p.id]
        
        l_data["out"] = [{'year_start': x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                        'locality_reference': {'id': str(x.destination.id), 'ext_id':x.destination.ext_id, 'name':x.destination.name},
                        'total':x.total, 'exchange':[ {"label": y.label, "amount": y.amount } for y in x.mobilization] } 
                        for x in mob if x.source.id == p.id]
        
        result.append(l_data) 

    return jsonify(result)

@app.route('/api/v1/analysis/plots',methods=['GET'])
#@token_required
@cross_origin()
def get_analysis_plot():
    # Getting list of all plots requeste
    ids = request.args.get("ids").split(',')

    # Getting plots from databases
    plots = CattleRancher.objects(ext_id__in = ids)
    if not plots:
        return jsonify({'message': "plots were not found"})

    plots_list = [x.id for x in plots]
    #plots = CattleRancher.objects(id__in = plots_list)    
    mob = CattleRancherNetwork.objects(Q(destination__in = plots_list) | Q(source__in = plots_list))
    
    # Search all plots data
    all_plots = plots_list + [x.source.id for x in mob] + [x.destination.id for x in mob]

    risk = CattleRancherRisk.objects(cattle_rancher__in = all_plots)
    result = []

    # loop just for plots which were asked by user
    for p in plots:
        p_data = {}

        p_data["plot"] = {'id':str(p.id), 'ext_id':p.ext_id, 'lat': p.lat, 'lon':p.lon, 'buffer_radio':p.buffer_radio}
        
        p_data["risk"] = [{'year_start':x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                            'lat': x.lat, 'lon':x.lon, 
                            'animals':x.animals_amount, 'buffer_radio':x.buffer_radio, 'buffer_size':x.buffer_size,
                            'def_prop_area': x.def_prop, 'def_prop_distance': x.def_distance_prop,'def_area': x.def_ha, 'def_dist': x.def_distance,  
                            'rt': x.risk_total, 'rd':x.risk_direct, 'ri':x.risk_input, 'ro':x.risk_output  }
                            for x in risk if x.cattle_rancher.id == p.id ]
        
        p_data["m_in"] = [{'year_start': x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                        'plot_reference': {'id': str(x.source.id), 'ext_id':x.source.ext_id, 'lat': x.source.lat, 'lon':x.source.lon, 'buffer_radio':x.source.buffer_radio},
                        'total':x.total, 'exchange':[ {"label": y.label, "amount": y.amount } for y in x.mobilization] } 
                        for x in mob if x.destination.id == p.id]
        
        p_data["m_out"] = [{'year_start': x.analysis.year_start, 'year_end':x.analysis.year_end, 'type':x.analysis.type_analysis,
                        'plot_reference': {'id': str(x.destination.id), 'ext_id':x.destination.ext_id, 'lat': x.destination.lat, 'lon':x.destination.lon, 'buffer_radio':x.destination.buffer_radio},
                        'total':x.total, 'exchange':[ {"label": y.label, "amount": y.amount } for y in x.mobilization] } 
                        for x in mob if x.source.id == p.id]
        
        result.append(p_data)
    
    return jsonify(result)
    

if __name__ == "__main__":
    
    connect('fauno_db',username=app.config['MONGO_USER'], password=app.config['MONGO_PWD'], authentication_source='admin', host='localhost', port=27017)
    app.run(threaded=True, port=5000, debug=True)
    #app.run(host='0.0.0.0', port=5000)

# Run in background
# nohup python3.8 api.py > api.log 2>&1 &