# Import libraries
import os
import glob
import pandas as pd
import geopandas as gpd
import numpy as np

os.environ['GDAL_DATA'] = '/usr/local/lib/python3.9/site-packages/fiona/gdal_data/'
os.chdir('/dapadfs/workspace_cluster_9/Aichi13/BID/risk_calculator/script')

#root_folder = "D:\\CIAT\\Code\\BID\\dci_fauno"
root_folder = "/dapadfs/workspace_cluster_9/Aichi13/BID/risk_calculator/"
#data_folder = os.path.join(root_folder, "data","risk_calculator")
data_folder = os.path.join(root_folder, "data")
inputs = os.path.join(data_folder,"inputs")
outputs = os.path.join(data_folder,"outputs")
conf_folder = os.path.join(data_folder,"conf")

years = [2017,2018]
columns_rm = ["NOMBRE_OFICINA","ESTADO","NUMERO_GUIA","TIPO_ORIGEN","NOMBRE_DESTINO"]

f_raw = os.path.join(inputs,"mob", "download", "mobilization.csv")

df_raw = pd.read_csv(f_raw, encoding = "ISO-8859-1")
print("Mobilization  loaded")

# Creating a SIT field for origin
df_raw["ID_ORIGEN"] = df_raw["DEPARTAMENTO_ORIGEN"] + "_" + df_raw["MUNICIPIO_ORIGEN"] + "_" + df_raw["VEREDA_ORIGEN"]
df_raw["ID_DESTINO"] = df_raw["DEPARTAMENTO_DESTINO"] + "_" + df_raw["MUNICIPIO_DESTINO"] + "_" + df_raw["VEREDA_DESTINO"]

f_plots = os.path.join(inputs,"plot", "fixed", "plots", "plots.shp")
gdf_p = gpd.read_file(f_plots)
print("Plots loaded")

gdf_p["ID_SITIO"] = gdf_p["adm1_name"] + "_" + gdf_p["adm2_name"] + "_" + gdf_p["adm3_name"]
gdf_p.to_csv(os.path.join(inputs,"mob", "download", "plots.csv"), index = False, encoding = "ISO-8859-1")
gdf_p.head()

df_plots = pd.read_csv( os.path.join(inputs,"mob", "download", "plots.csv"), encoding = "ISO-8859-1")


for y in [2017.0, 2018.0]:    
    df_y = df_raw[df_raw["AÑO"] == y]
    print(df_y.columns)     
    columns_exclude = ["ID_ORIGEN", "ID_DESTINO", "TIPO_DESTINO", "AÑO"]
    df_y = pd.pivot_table(df_y, values=df_y.columns.drop(columns_exclude), index=columns_exclude, aggfunc=np.sum,fill_value=0.0)    
    df_y.reset_index(inplace=True)
    print(df_y.head())
    print("Original: " + str(df_raw.shape[0]) + " Nuevo: " + str(df_y.shape[0]))
    #types_col = dict(gdf_p.dtypes)
    types_col = dict(df_plots.dtypes)
    
    df_new = pd.merge(df_y, df_plots[["ext_id","ID_SITIO"]], left_on="ID_ORIGEN", right_on='ID_SITIO', how='left')    
    print("Join origen: " + str(df_new.shape[0]))
    #df_new["ext_id"] = df_new["ext_id"].astype(types_col["ext_id"])
    #df_new["ext_id"] = df_new["ext_id"].astype(str).str.split('.', expand = True)[0]
    
    df_new = df_new[df_new["ext_id"].notnull()]
    df_new["ext_id"] = df_new["ext_id"].astype(str).str.split('.', expand = True)[0]
    df_new = df_new.rename(columns={"ext_id":"SIT_ORIGEN"})    
    df_new = df_new.drop(['ID_SITIO'], axis=1)
    print("Filtrado not nulls: " + str(df_new.shape[0]))
    
    #df_new = df_new.sample(n = int(df_new.shape[0]*0.2))
    print("Muestra: " + str(df_new.shape[0]))
    
    df_new = pd.merge(df_new, df_plots[["ext_id","ID_SITIO"]], left_on="ID_DESTINO", right_on='ID_SITIO', how='left')
    print("Join destino: " + str(df_new.shape[0]))
    #df_new["ext_id"] = df_new["ext_id"].astype(types_col["ext_id"])
    #df_new["ext_id"] = df_new["ext_id"].astype(int)    
    
        
    df_new["ext_id"] = df_new["ext_id"].astype(str).str.split('.', expand = True)[0]
    print("Changed ext_id")
    #df_new = df_new[df_new["ext_id"].notnull()]
    #print("Filtered nulls: " + str(df_new.shape[0]))
    
    df_new = df_new.rename(columns={"ext_id":"SIT_DESTINO"})    
    print("Rename ext_id")
    df_new = df_new.drop(['ID_SITIO'], axis=1)
    print("Drop id sitio")
    print("Filtrado not nulls: " + str(df_new.shape[0]))
    
    df_new = df_new[df_new["SIT_DESTINO"].notnull()]
    print("Filtered nulls: " + str(df_new.shape[0]))

    #df_new = df_new.sample(n = int(df_new.shape[0]*0.15))
    print("Muestra: " + str(df_new.shape[0]))
    
    
    #df_new["SIT_DESTINO"] = df_new["SIT_DESTINO"].astype(str)
    
    print("Guardando")
    print(df_new.head())
    df_new.to_csv(os.path.join(inputs,"mob", "content", str(y) + ".csv"), index = False, encoding = "ISO-8859-1")