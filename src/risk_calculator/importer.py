import os
import geopandas as gpd
import multiprocessing as mp
import numpy as np
import pandas as pd
import math
import networkx as nx
import sys
sys.path.insert(1, "D:\\CIAT\\Code\\BID\\dci_fauno\\src\\orm")
from mongoengine import *
from fauno_entities import *
import datetime

def print_progress(shape,current):
    done = int(50 * current / shape)
    print("[%s%s]" % ('=' * done, ' ' * (50-done)), end="\r", flush=True )

def extract_master_data(data, fields, file, key):
    print("Extracting administrative levels")
    df = pd.DataFrame()
    # validate if a file exists
    if os.path.exists(file):
        df = pd.read_csv(file, encoding = "ISO-8859-1")
    # add new records
    df = df.append(data[fields], ignore_index=True)
    print("Removing duplicates")
    print("Shape: " + str(df.shape))
    df = df.drop_duplicates()
    print("Shape: " + str(df.shape))
    print("Saving: " + file)    
    df.to_csv(file, index = False, encoding = "ISO-8859-1")

# Method that creates output files, which can be imported to database

def generate_outputs(inputs, outputs, years, types_analysis, type_plot):
    in_risk = os.path.join(inputs,"plot","fixed","total")
    in_mob = os.path.join(inputs,"mob","fixed")
    out_mob_log = os.path.join(inputs, "mob", "log")
    # Create output folder    
    if not os.path.exists(outputs):
        os.mkdir(outputs)
    if not os.path.exists(out_mob_log):
        os.mkdir(out_mob_log)
    
    # Loop for type of analysis, they can be detail or summary
    for ta in types_analysis:
        print("Processing type: " + ta)
        
        # Loop for years which want to be analyzed
        for y in years:    
            print("Processing year: " + str(y))

            file_shp = os.path.join(in_risk,ta,str(y),"total.shp")
            print("Opening areas shp: " + file_shp)
            shp = gpd.read_file(file_shp)
            shp["ext_id"] = shp["ext_id"].astype(str).str.split('.', expand = True)[0]
            #shp["buffer_radio"] = math.sqrt(shp['geometry'].area/math.pi)
            
            # Administrative level
            extract_master_data(shp, ["adm1_id","adm2_id","adm2_name"], os.path.join(outputs,"administrative_level.csv"), ["adm2_id"])

            # Localities
            extract_master_data(shp, ["adm2_id","adm3_id","adm3_name"], os.path.join(outputs,"localities.csv"), ["adm3_id"])
            
            # Cattle rancher
            extract_master_data(shp, ["adm3_id","ext_id","lat","lon", "buffer_radio"], os.path.join(outputs,"cattle_rancher.csv"), ["ext_id"])

            print("Starting analysis")
            outputs_folder = os.path.join(outputs,ta)
            if not os.path.exists(outputs_folder):
                os.mkdir(outputs_folder)
            outputs_folder = os.path.join(outputs_folder,str(y))
            if not os.path.exists(outputs_folder):
                os.mkdir(outputs_folder)
            
            print("Processing Cattle Rancher Risk")
            df_ct = shp[["adm3_id","ext_id","def_prop","dp","dd","rd","ri","ro","rt","animals","area","field_capa","def_area","distance", "buffer_radio","lat","lon"]]
            ct_file = os.path.join(outputs_folder,"cattle_rancher_risk.csv")
            print("Saving: " + ct_file)
            df_ct.to_csv(ct_file, index = False, encoding = "ISO-8859-1")

            # mobilization
            print("Processing mobilization")
            file_mob = os.path.join(in_mob,str(y) + ".csv")
            print("Opening mobilization: " + file_mob)    
            df_mob = pd.read_csv(file_mob, encoding = "ISO-8859-1")
            df_mob["id_source"] = df_mob["id_source"].astype(str).str.split('.', expand = True)[0]
            df_mob["id_destination"] = df_mob["id_destination"].astype(str).str.split('.', expand = True)[0]
            df_mob = df_mob[df_mob["type_destination"] == type_plot]

            print("Merging localities source")
            df_mob = pd.merge(df_mob, shp[["ext_id","adm3_id"]], left_on="id_source", right_on='ext_id', how='left')
            df_mob = df_mob.rename(columns={"adm3_id":"adm3_source"})    
            df_mob = df_mob.drop(columns=["ext_id"], axis=0)
            print("Merging localities destination")
            df_mob = pd.merge(df_mob, shp[["ext_id","adm3_id"]], left_on="id_destination", right_on='ext_id', how='left')
            df_mob = df_mob.rename(columns={"adm3_id":"adm3_destination"})    
            df_mob = df_mob.drop(columns=["ext_id"], axis=0)
            
            print("Filtering mobilization")
            ids = shp["ext_id"].unique()
            mob_bad = df_mob.loc[(df_mob["adm3_source"].isna()) | (df_mob["adm3_source"] == "") | (df_mob["adm3_destination"].isna()) | (df_mob["adm3_destination"] == ""),:]
            mob_records = df_mob.isin(mob_bad)
            new_mob = df_mob[mob_records == False]
            ctm_file = os.path.join(outputs_folder,"cattle_rancher_network.csv") 
            ctm_log = os.path.join(out_mob_log,"cattle_rancher_network.csv")
            print("Saving: " + ctm_file)
            print("Shape: " + str(new_mob.shape))
            new_mob.to_csv(ctm_file, index = False, encoding = "ISO-8859-1")
            print("Saving:" + ctm_log)
            print("Shape: " + str(mob_bad.shape))
            mob_bad.to_csv(ctm_log, index = False, encoding = "ISO-8859-1")

            print("Summarizing network for locality")
            new_mob = new_mob.drop(columns=["id_source", "id_destination"], axis=0)
            mob_net_col = ["adm3_source","adm3_destination","type_destination"]
            mob_net = pd.pivot_table(new_mob, values=new_mob.columns.drop(mob_net_col), index=mob_net_col, aggfunc=np.sum,fill_value=0.0)
            mob_net.reset_index(inplace=True)
            loc_file = os.path.join(outputs_folder,"locality_network.csv") 
            print("Saving: " + loc_file)
            print("Shape: " + str(mob_net.shape))
            print(mob_net.head())
            mob_net.to_csv(loc_file, index = False, encoding = "ISO-8859-1")

            print("Calculating centralities indicators")
            print(mob_net.head())
            G = nx.from_pandas_edgelist(mob_net, 'adm3_source', 'adm3_destination', edge_attr='total', create_using=nx.DiGraph())
            print("Calculating degree")
            g_c_d = nx.degree_centrality(G)
            print("Calculating centrdegreeality in")
            g_c_d_in = nx.in_degree_centrality(G)
            print("Calculating degree out")
            g_c_d_out = nx.out_degree_centrality(G)
            print("Calculating closeness")
            g_c_c = nx.closeness_centrality(G)
            print("Calculating betweennes")
            g_c_b = nx.betweenness_centrality(G, normalized = False, endpoints=False, k=4)


            print("Merging indicators")
            g_indicators = pd.DataFrame()
            g_indicators_tmp = pd.DataFrame(g_c_d.items())
            g_indicators_tmp.columns = ["adm3_id","cd"]
            g_indicators = g_indicators.append(g_indicators_tmp, ignore_index=True)

            g_indicators_tmp = pd.DataFrame(g_c_d_in.items())
            g_indicators_tmp.columns = ["adm3_id","cdi"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            g_indicators_tmp = pd.DataFrame(g_c_d_out.items())
            g_indicators_tmp.columns = ["adm3_id","cdo"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            g_indicators_tmp = pd.DataFrame(g_c_c.items())
            g_indicators_tmp.columns = ["adm3_id","cc"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            g_indicators_tmp = pd.DataFrame(g_c_b.items())
            g_indicators_tmp.columns = ["adm3_id","cb"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            print("Pivoting localities risk")
            loc_col = ["rt","animals","area","def_area"]
            print(df_ct.head())
            loc_risk = pd.pivot_table(df_ct, values=loc_col, index=["adm3_id"], aggfunc=[np.sum, np.mean, lambda x: len(x.unique())],fill_value=0.0)
            print(loc_risk.head())
            loc_risk.reset_index(inplace=True)

            print("Merging with centrality indicators")
            l_r = pd.merge(loc_risk, g_indicators, left_on = "adm3_id",right_on="adm3_id",how='inner')
            l_r.columns = ["adm3_id","adm3_id","animals_sum","area_sum","def_area_sum","rt_sum","animals_mean","area_mean","def_area_mean","rt_mean","cd","cdi","cdo","cc","cb"]

            loc_r_file = os.path.join(outputs_folder,"locality_risk.csv")
            print("Saving: " + loc_r_file)
            l_r.to_csv(loc_r_file, index = False, encoding = "ISO-8859-1")

def save_database(outputs, years, type_analysis, db_user, db_pwd, db_name, db_server, db_port):
    log_folder = os.path.join(outputs,"log")
    # Create output folder    
    if not os.path.exists(log_folder):
        os.mkdir(log_folder)

    date = datetime.datetime.now()
    connect(db_name,username=db_user, password=db_pwd, authentication_source='admin', host=db_server, port=db_port)
    
    # Administrative level
    adm_file = os.path.join(outputs,"administrative_level.csv")
    print("Reading: " + adm_file)
    df_adm = pd.read_csv(adm_file, encoding = "ISO-8859-1")
    df_adm["adm1_id"] = df_adm["adm1_id"].astype(str)
    df_adm["adm2_id"] = df_adm["adm2_id"].astype(str)
    df_adm["id"] = ""
    print("Getting current records from database")
    db_administrative = AdministrativeLevel.objects()
    print("Importing: " + str(df_adm.shape[0]))    
    for index, row in df_adm.iterrows():
        adm = None
        adm_tmp = [x for x in db_administrative if x.ext_id ==  row['adm2_id']]
        if len(adm_tmp) <= 0:
            adm = adm_tmp[0]
        else:
            adm = AdministrativeLevel(name = row['adm2_name'], adm = row['adm1_id'], ext_id = row['adm2_id'], enable = True, created = date, updated = date)
            adm.save()
        row["id"] = adm.id
        print_progress(df_adm.shape[0],index)
    
    # Locality
    loc_file = os.path.join(outputs,"localities.csv")
    print("Reading: " + loc_file)
    df_loc = pd.read_csv(loc_file, encoding = "ISO-8859-1")
    df_loc["adm2_id"] = df_loc["adm2_id"].astype(str)
    df_loc["adm3_id"] = df_loc["adm3_id"].astype(str)
    print("Merging with administrative level")
    df_loc = pd.merge(df_loc, df_adm[["id","adm2_id"]], left_on="adm2_id", right_on='adm2_id', how='inner')
    df_loc = df_loc.rename(columns={"id":"adm_id"})    
    df_loc["id"] = ""
    print("Getting current records from database")
    db_locality = Locality.objects()
    print("Importing: " + str(df_loc.shape[0]))
    for index, row in df_loc.iterrows():
        loc = None
        loc_tmp = [x for x in db_locality if x.ext_id ==  row['adm3_id']]
        if len(adm_tmp) <= 0:
            loc = loc_tmp[0]
        else:
            loc = Locality(adm_level = row['adm_id'], name = row['adm3_name'], ext_id = row['adm3_id'], enable = True, created = date, updated = date)
            loc.save()
        row["id"] = loc.id
        print_progress(df_loc.shape[0],index)
    
    # Cattle Rancher
    ran_file = os.path.join(outputs,"cattle_rancher.csv")
    print("Reading: " + ran_file)
    df_ran = pd.read_csv(ran_file, encoding = "ISO-8859-1")
    df_ran["adm3_id"] = df_ran["adm3_id"].astype(str)
    df_ran["ext_id"] = df_ran["ext_id"].astype(str)
    print("Merging with localities")
    df_ran = pd.merge(df_ran, df_loc[["id","adm3_id"]], left_on="adm3_id", right_on='adm3_id', how='inner')
    df_ran = df_ran.rename(columns={"id":"adm_id"})    
    dc_ran = []
    print("Getting current records from database")
    db_cr = CattleRancher.objects()    
    print("Importing: " + str(df_ran.shape[0]))
    for index, row in df_ran.iterrows():
        ran = None
        ran_tmp = [x for x in db_cr if x.ext_id ==  row['ext_id']]
        if len(ran_tmp) <= 0:
            ran = ran_tmp[0]
        else:
            ran = CattleRancher(locality = row['adm_id'], ext_id = row['ext_id'], 
                            type_plot = "PREDIO", 
                            lat = row['lat'], lon =  row['lon'], buffer_radio = row['buffer_radio'], 
                            enable = True, created = date, updated = date)
            ran.save()
        dc_ran.append((ran.id,ran.ext_id))
        print_progress(df_ran.shape[0],index)
    df_ran = pd.DataFrame(dc_ran, columns=["id","ext_id"])
    
    # Analysis
    for y in years:
        print("Year: " + str(y))
        print("Types of analysis: ",type_analysis)
        for ta in type_analysis:
            print("Starting analysis: " + str(y) + "-" + ta)
            analysis = Analysis(year_start = int(y), year_end = int(y), type_analysis = ta)
            analysis.save()

            # Risk Cattle Rancher
            print("Cattle Rancher Risk")
            ct_file = os.path.join(outputs,ta,str(y),"cattle_rancher_risk.csv")
            print("Reading: " + ct_file)
            df_ctr = pd.read_csv(ct_file, encoding = "ISO-8859-1")            
            df_ctr["ext_id"] = df_ctr["ext_id"].astype(str)

            print("Merging with cattle rancher")            
            df_ctr = pd.merge(df_ctr, df_ran[["id","ext_id"]], left_on="ext_id", right_on='ext_id', how='inner')                        
            print("Importing: " + str(df_ctr.shape[0]))

            for index, row in df_ctr.iterrows():                
                ctr = CattleRancherRisk(cattle_rancher = row['id'], analysis = analysis.id, 
                                        buffer_radio =  row['buffer_radio'],
                                        lat =  row['lat'], lon =  row['lon'],
                                        def_prop = row['def_prop'], def_distance_m =  row['distance'], def_distance_prop =  row['dp'],
                                        risk_direct = row['rd'], risk_input = row['ri'], risk_output = row['ro'], risk_total = row['rt'],
                                        animals_amount = row['animals'], buffer_size = row['area'], 
                                        field_capacity = row['field_capa'], def_ha = row['def_area'], 
                                        def_distance = row['dd'])
                ctr.save()
                print_progress(df_ctr.shape[0],index)
            
            # Network Cattle Rancher
            print("Cattle Rancher Network")
            cn_file = os.path.join(outputs,ta,str(y),"cattle_rancher_network.csv")
            print("Reading: " + cn_file)
            df_ctn = pd.read_csv(cn_file,dtype={"id_source": "string", "id_destination": "string"}, encoding = "ISO-8859-1")

            print("Merging with cattle rancher source")
            df_ctn = pd.merge(df_ctn, df_ran[["id","ext_id"]], left_on="id_source", right_on='ext_id', how='inner')
            df_ctn = df_ctn.rename(columns={"id":"source"})
            print("Shape: " + str(df_ctn.shape[0]))

            print("Merging with cattle rancher destination")
            df_ctn = pd.merge(df_ctn, df_ran[["id","ext_id"]], left_on="id_destination", right_on='ext_id', how='inner')
            df_ctn = df_ctn.rename(columns={"id":"destination"})
            print("Shape: " + str(df_ctn.shape[0]))

            print("Importing: " + str(df_ctn.shape[0]))
            cols_animals = df_ctn.columns.drop(["id_source","id_destination","type_destination","total","adm3_source","adm3_destination","source","destination","ext_id_x","ext_id_y"])
            for index, row in df_ctn.iterrows():
                animals = [Animals(label = c, amount = row[c]) for c in cols_animals if row[c] > 0]
                ctn = CattleRancherNetwork(analysis = analysis.id,source = row['source'], destination = row['destination'], mobilization = animals, total = row['total'])
                ctn.save()
                print_progress(df_ctr.shape[0],index)

            # Localities Network
            print("Localities Network")
            ln_file = os.path.join(outputs,ta,str(y),"locality_network.csv")
            print("Reading: " + ln_file)
            df_lon = pd.read_csv(ln_file, encoding = "ISO-8859-1")            
            df_lon["adm3_source"] = df_lon["adm3_source"].astype(str)
            df_lon["adm3_destination"] = df_lon["adm3_destination"].astype(str)

            print("Merging with cattle rancher source")
            df_lon = pd.merge(df_lon, df_loc[["id","adm3_id"]], left_on="adm3_source", right_on='adm3_id', how='inner')
            df_lon = df_lon.rename(columns={"id":"source"})
            print("Merging with cattle rancher destination")
            df_lon = pd.merge(df_lon, df_loc[["id","adm3_id"]], left_on="adm3_destination", right_on='adm3_id', how='inner')
            df_lon = df_lon.rename(columns={"id":"destination"})

            print("Importing: " + str(df_lon.shape[0]))
            cols_animals = df_lon.columns.drop(["adm3_source","adm3_destination","type_destination","total","source","destination","adm3_id_x","adm3_id_y"])
            print(cols_animals)
            for index, row in df_lon.iterrows():
                animals = [Animals(label = c, amount = row[c]) for c in cols_animals  if int(row[c]) > 0]
                lon = LocalityNetwork(analysis = analysis.id, source = row['source'], destination = row['destination'], mobilization = animals, total = row['total'])
                lon.save()



            
                









    

    

