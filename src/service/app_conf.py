import os

config = {}

if os.getenv('DEBUG', "true").lower() == "true":
    config['SECRET_KEY']='Loc@lS3cr3t'
    config['MONGO_USER']='mongoadmin'
    config['MONGO_PWD']='secret'
    config['MONGO_DB']='fauno_db'
    config['MONGO_PORT']=27017
    config['MONGO_SERVER']='localhost'
    config['DEBUG']=True
    config['ORM_PATH']="D:\\CIAT\\Code\\BID\\dci_fauno\\src\\orm"
    config['PORT']=5000
else:
    config['SECRET_KEY']=os.getenv('SECRET_KEY')
    config['MONGO_USER']=os.getenv('MONGO_USER')
    config['MONGO_PWD']=os.getenv('MONGO_PWD')
    config['MONGO_DB']=os.getenv('MONGO_DB')
    config['MONGO_PORT']=os.getenv('MONGO_PORT')
    config['MONGO_SERVER']=os.getenv('MONGO_SERVER')
    config['DEBUG']=False
    config['ORM_PATH']=os.getenv('ORM_PATH')
    config['PORT']=80

