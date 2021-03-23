from mongoengine import *

class AdministrativeLevel(Document):
    name = StringField(required=True)
    adm = StringField(required=True)
    ext_id = StringField(required=True)
    enable = BooleanField(required=True)
    created = DateTimeField(required=True)
    updated = DateTimeField(required=True)

class Locality(Document):
    adm_level =  ReferenceField(AdministrativeLevel)
    name = StringField(required=True)    
    ext_id = StringField(required=True)
    enable = BooleanField(required=True)
    created = DateTimeField(required=True)
    updated = DateTimeField(required=True)

class CattleRancher(Document):
    locality = ReferenceField(Locality)
    ext_id = StringField(required=True)
    enable = BooleanField(required=True)
    created = DateTimeField(required=True)
    updated = DateTimeField(required=True)

class Analysis(Document):
    locality = ReferenceField(Locality)
    year_start = IntField(required=True)
    year_end = IntField(required=True)
    type_analysis = StringField(required=True)
    version = IntField(required=True)

class Risk(EmbeddedDocument):
    def_prop = FloatField(required=True)
    def_distance_m = FloatField(required=True)
    def_distance_prop = FloatField(required=True)
    risk_direct = FloatField(required=True)
    risk_input = FloatField(required=True)
    risk_output = FloatField(required=True)
    risk_total = FloatField(required=True)

class Parameters(EmbeddedDocument):
    animals_amount = LongField(required=True)
    buffer_size = FloatField(required=True)
    buffer_radio = FloatField(required=True)
    field_capacity = FloatField(required=True)
    def_ha = FloatField(required=True)
    def_distance = FloatField(required=True)

class CattleRancherRisk(Document):
    cattle_rancher = ReferenceField(CattleRancher)
    analysis = ReferenceField(Analysis)
    latitud = FloatField(required=True)
    longitud = FloatField(required=True)
    risk = ReferenceField(Risk)
    parameters = ReferenceField(Parameters)

class Animals(EmbeddedDocument):
    label = StringField(required=True)
    amount = IntField(required=True)

class CattleRancherNetwork(Document):
    analysis = ReferenceField(Analysis)
    source = ReferenceField(CattleRancher)
    destination = ReferenceField(CattleRancher)
    mobilization = ListField(EmbeddedDocumentField(Animals))

class LocalityRisk(Document):
    locality = ReferenceField(Locality)
    analysis = ReferenceField(Analysis)
    def_ha = FloatField(required=True)
    cattle_rancher_amount = LongField(required=True)
    risk_total = FloatField(required=True)
    degree = FloatField(required=True)
    degree_in = FloatField(required=True)
    degree_out = FloatField(required=True)
    betweenness = FloatField(required=True)
    closeness = FloatField(required=True)

class LocalityNetwork(Document):    
    analysis = ReferenceField(Analysis)
    source = ReferenceField(Locality)
    destination = ReferenceField(Locality)
    mobilization = ListField(EmbeddedDocumentField(Animals))

class User(Document):    
    public_id = StringField(required=True)
    name = StringField(required=True)
    password = StringField(required=True)
    admin = BooleanField(required=True)

class Log(Document):
    user = StringField()
    date = DateTimeField(required=True)
    action = StringField(required=True)
    comments = StringField(required=True)
