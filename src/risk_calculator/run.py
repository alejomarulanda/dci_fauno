# Import libraries
import os
import glob
import pandas as pd

os.environ['GDAL_DATA'] = '/usr/local/lib/python3.9/site-packages/fiona/gdal_data/'
os.chdir('/dapadfs/workspace_cluster_9/Aichi13/BID/risk_calculator/script')
#sys.path.insert(1, "/dapadfs/workspace_cluster_9/Aichi13/BID/risk_calculator/script/")

# Import modules
import deforestation as defo
import administrative_level as adle
import livestock_plot as plot
import risk as risk
import mobilization as mobi
import importer as impo
print("Done!")

# Global folders
root_folder = "/dapadfs/workspace_cluster_9/Aichi13/BID/risk_calculator/"
#data_folder = os.path.join(root_folder, "data","risk_calculator")
data_folder = os.path.join(root_folder, "data")
inputs = os.path.join(data_folder,"inputs")
outputs = os.path.join(data_folder,"outputs")
conf_folder = os.path.join(data_folder,"conf")
# Deforestation folders
def_folder = os.path.join(inputs,"def")
# Administrative level folders
adm_folder = os.path.join(inputs,"adm")
# Livestock plots
plot_folder = os.path.join(inputs,"plot")
# Mobilization
mob_folder = os.path.join(inputs,"mob")

# Parameters file
conf_xls = pd.ExcelFile(os.path.join(conf_folder,"conf.xlsx"))
conf = conf_xls.parse("conf")
buffer = conf_xls.parse("buffer")

# Global parameters from conf.xlsx file
glo_crs = int(conf.loc[conf["parameter"] == "glo_crs","value"].values[0])
glo_crs_wgs84 = int(conf.loc[conf["parameter"] == "glo_crs_wgs84","value"].values[0])

# Creating folders
# Create folder for deforestation files
if not os.path.exists(def_folder):    
    os.mkdir(def_folder)
# Create folder for administrative level files
if not os.path.exists(adm_folder):    
    os.mkdir(adm_folder)
# Create folder for livestock plot files
if not os.path.exists(plot_folder):    
    os.mkdir(plot_folder)
# Create folder for mobilization files
if not os.path.exists(mob_folder):    
    os.mkdir(mob_folder)

print("Done!")

# Getting parameters for processing data
ris_years = map(str.strip, conf.loc[conf["parameter"] == "ris_years","value"].values[0].split(","))
ris_types_analysis =  map(str.strip, conf.loc[conf["parameter"] == "ris_types_analysis","value"].values[0].split(","))
ris_type_plot = conf.loc[conf["parameter"] == "ris_type_plot","value"].values[0]

#risk.total_risk(inputs, ris_years, ris_types_analysis)
risk.total_risk(inputs, ["2017","2018"], ris_types_analysis, ris_type_plot)
print("Done!")