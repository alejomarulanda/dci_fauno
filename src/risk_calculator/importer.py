import os
import geopandas as gpd
import multiprocessing as mp
import numpy as np
import pandas as pd
import math
import networkx as nx

sys.path.insert(1, "D:\\CIAT\\Code\\BID\\dci_fauno\\src\\orm")
from mongoengine import *
from fauno_entities import *
import datetime


def extract_master_data(data, fields, file):
    print("Extracting administrative levels")
    df = pd.DataFrame()
    # validate if a file exists
    if os.path.exists(file):
        df = pd.read_csv(file, encoding = "ISO-8859-1")
    df_tmp = data[fields].drop_duplicates()
    # add new records
    df = df.append(df_tmp, ignore_index=True)
    df = df.drop_duplicates()
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

            # Administrative level
            extract_master_data(shp, ["adm1_id","adm2_id","adm2_name"], os.path.join(outputs,"administrative_level.csv"))

            # Localities
            extract_master_data(shp, ["adm2_id","adm3_id","adm3_name"], os.path.join(outputs,"localities.csv"))
            
            # Cattle rancher
            extract_master_data(shp, ["adm3_id","ext_id"], os.path.join(outputs,"cattle_rancher.csv"))

            print("Starting analysis")
            outputs_folder = os.path.join(outputs,ta)
            if not os.path.exists(outputs_folder):
                os.mkdir(outputs_folder)
            outputs_folder = os.path.join(outputs_folder,str(y))
            if not os.path.exists(outputs_folder):
                os.mkdir(outputs_folder)
            
            print("Processing Cattle Rancher Risk")
            df_ct = shp[["adm3_id","ext_id","lat","lon","geometry","def_prop","dp","dd","rd","ri","ro","rt","animals","area","field_capa","def_area","distance"]]
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
            print(df_mob.head())
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
            new_mob.to_csv(ct_file, index = False, encoding = "ISO-8859-1")
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

            g_indicators_tmp = pd.DataFrame(g_c_c.items())
            g_indicators_tmp.columns = ["adm3_id","cc"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            g_indicators_tmp = pd.DataFrame(g_c_c.items())
            g_indicators_tmp.columns = ["adm3_id","cc"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            g_indicators_tmp = pd.DataFrame(g_c_b.items())
            g_indicators_tmp.columns = ["adm3_id","cb"]
            g_indicators = pd.merge(g_indicators, g_indicators_tmp, left_on = "adm3_id",right_on="adm3_id",how='inner')

            print("Pivoting localities risk")
            loc_col = ["rt","animals","area","def_area"]
            loc_risk = pd.pivot_table(df_ct, values=loc_col, index=["adm3_id"], aggfunc=[np.sum, np.mean],fill_value=0.0)
            loc_risk.reset_index(inplace=True)

            print("Merging with centrality indicators")
            l_r = pd.merge(loc_risk, g_indicators, left_on = "adm3_id",right_on="adm3_id",how='inner')

            loc_r_file = os.path.join(outputs_folder,"locality_risk.csv")
            print("Saving: " + loc_r_file)
            l_r.to_csv(loc_r_file, index = False, encoding = "ISO-8859-1")

def save_database(outputs):
    log_folder = os.path.join(outputs,"log")
    # Create output folder    
    if not os.path.exists(log_folder):
        os.mkdir(log_folder)

    date = datetime.datetime.now()
    
    # Administrative level
    adm_file = os.path.join(outputs,"administrative_level.csv")
    print("Reading: " + adm_file)
    df_adm = pd.read_csv(adm_file, encoding = "ISO-8859-1")
    df_adm["id"] = ""
    print("Importing")
    for index, row in df_adm.iterrows():
        adm = AdministrativeLevel(name = row['adm2_name'], adm = row['adm1_id'], ext_id = row['adm2_id'], enable = True, created = date, updated = date)
        adm.save()
        row["id"] = adm.id
    
    # Locality
    loc_file = os.path.join(outputs,"localities.csv")
    print("Reading: " + loc_file)
    df_loc = pd.read_csv(loc_file, encoding = "ISO-8859-1")
    df_loc["id"] = ""
    print("Importing")
    for index, row in df_loc.iterrows():
        loc = Locality(name = row['adm2_name'], adm = row['adm1_id'], ext_id = row['adm2_id'], enable = True, created = date, updated = date)
        loc.save()
        row["id"] = loc.id

    

