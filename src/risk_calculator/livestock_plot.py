# Import libraries
import os
import glob
import math
import numpy as np
import pandas as pd
import geopandas as gpd
from fiona.crs import from_epsg

# Method which compiles in just one file all data sources of animals stock for all years.
# It also clear data with coordinates validated and creates a log of wrong places
# (string) inputs: Path where inputs files should be located
# (string) character_file: Character which separates fields into files
# (string) ext_id: Field name for extern id into the source
# (string) lat: Field name for latitude into the source
# (string) lon: Field name for longitude into the source
# (string) animals: Field name for amount of animals into the source
# (double) lat_low: Latitude lower limit for validating coordinates
# (double) lat_upp: Latitude upper limit for validating coordinates
# (double) lon_low: Longitude lower limit for validating coordinates
# (double) lon_upp: Longitude upper limit for validating coordinates
# (bool) has_adm: Set if the file has administrative fields. By default is False. 
#                 If it is True, the source should have 3 administrative levels
# (string) adm1: Field name for administrative level 1 into the source. By default is empty
# (string) adm2: Field name for administrative level 2 into the source. By default is empty
# (string) adm3: Field name for administrative level 3 into the source. By default is empty
def processing_raw_data(inputs, character_file, ext_id, lat, lon, animals, lat_low, lat_upp, lon_low, lon_upp, has_adm = False, adm1="", adm2="", adm3=""):
    # Create folders to download data and extract content
    download_folder = os.path.join(inputs,"download")
    content_folder = os.path.join(inputs,"content")
    log_folder = os.path.join(inputs,"log")
    if not os.path.exists(download_folder):
        os.mkdir(download_folder)
    if not os.path.exists(content_folder):
        os.mkdir(content_folder)
    if not os.path.exists(log_folder):
        os.mkdir(log_folder)
    # Load all csv files
    pattern = download_folder + os.path.sep + '*.csv'
    files = glob.glob(pattern, recursive=True)
    df_plots = pd.DataFrame()
    # Loop to compile all datasources
    for file in files:
        print("Reading: " + file)
        df_t = pd.read_csv(file, encoding = "ISO-8859-1", sep=character_file)
        # Extracting year from file name
        file_full_name = file.split(os.path.sep)
        year = file_full_name[len(file_full_name)-1].replace(".csv","")
        df_t["year"] = year
        # Acumulating records in data frame
        df_plots = df_plots.append(df_t, ignore_index=True)
        
    print("Fixing columns")    
    df_final = pd.DataFrame()
    df_final["ext_id"] = df_plots[ext_id].astype(str)
    df_final["lat"] = df_plots[lat] 
    df_final["lon"] = df_plots[lon]
    df_final["animals"] = df_plots[animals]
    df_final["year"] = df_plots["year"]
    if has_adm:
        df_final["adm1"] =  df_plots[adm1]
        df_final["adm2"] =  df_plots[adm2]
        df_final["adm3"] =  df_plots[adm3]  
    
    df_original_fin = df_final
    print("Cleaning records")
    df_final = df_final.loc[(df_final["lat"] > lat_low) & (df_final["lat"] < lat_upp), :]    
    df_final = df_final.loc[(df_final["lon"] > lon_low) & (df_final["lon"] < lon_upp), :]
    print(df_final.head())

    log_file = os.path.join(log_folder,"err-data-bad_plots.csv")
    print("Logging: " + log_file)
    df_bad_records = df_original_fin.isin(df_final)
    df_records = df_bad_records["ext_id"]
    bad_plots = df_original_fin[df_records == False]
    bad_plots.to_csv(log_file, index = False, encoding = "ISO-8859-1")

    print("Goruping and filtering max")
    df_final['animals_max'] = df_final.groupby(['ext_id'])['animals'].transform(max)
    df_final = df_final.sort_values('animals_max', ascending=False).drop_duplicates(['ext_id'])

    output = content_folder + os.path.sep + 'plots.csv'
    print("Saving: " + output)
    df_final.to_csv(output, index = False, encoding = "ISO-8859-1")

# Method that creates a layer (shapefile) with locations of farmers where livestock is located
# (string) inputs: Path where inputs files should be located
# (string) path_shp_adm: Path where the shapefile of reference is located
# (int) src_crs: Current system CRS of coordinates of plots
# (int) dst_crs: New system CRS of destination
def create_data(inputs, path_shp_adm, src_crs, dst_crs):
    content_folder = os.path.join(inputs,"content")
    # Creates output folder
    outputs_folder = os.path.join(inputs,"fixed")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    plots_folder = os.path.join(outputs_folder,"plots")
    if not os.path.exists(plots_folder):
        os.mkdir(plots_folder)
        
    file_src = os.path.join(content_folder, "plots.csv")
    print("Opening: " + file_src)
    df_plots = pd.read_csv(file_src, encoding = "ISO-8859-1")
    df_plots["ext_id"] = df_plots["ext_id"].astype(str)

    print("Transforming to points")
    gdf_plots = gpd.GeoDataFrame(df_plots, geometry=gpd.points_from_xy(df_plots.lon, df_plots.lat), crs=from_epsg(src_crs))
    print("Reprojecting")
    gdf_plots = gdf_plots.to_crs(crs = from_epsg(dst_crs))

    print("Opening shp reference: " + path_shp_adm)
    gdf_adm = gpd.read_file(path_shp_adm)
    gdf_adm = gdf_adm.to_crs(crs = from_epsg(dst_crs))

    print("Joining spatial")
    gdf_join = gpd.sjoin(gdf_plots, gdf_adm, how="inner", op='intersects')
    print(gdf_join.head())

    # Create a folder for each shapefile with the year name    
    output_file = os.path.join(plots_folder,"plots.shp")
    print("Saving: " + output_file)
    gdf_join.to_file(output_file)

# Method that creates a buffer for plots
# (string) inputs: Path where inputs files should be located
# (DataFrame) size_regions: DataFrame with the field capacity for all regions
# (int) dst_crs: New system CRS of destination
def create_buffer(inputs, size_regions, dst_crs):
    content_folder = os.path.join(inputs,"content")
    outputs_folder = os.path.join(inputs,"fixed")
    plots_folder = os.path.join(outputs_folder,"plots")
    buffer_folder = os.path.join(outputs_folder,"buffer")
    if not os.path.exists(buffer_folder):
        os.mkdir(buffer_folder)
    
    plots_file = os.path.join(plots_folder,"plots.shp")
    print("Opening plots shape file: " + plots_file)
    gdf_plots = gpd.read_file(plots_file)
    gdf_plots = gdf_plots.to_crs(crs = from_epsg(dst_crs))

    print("Mergin with field capacity")
    gdf_plots["adm1_id"] = gdf_plots["adm1_id"].astype('str')
    size_regions["region_id"] = size_regions["region_id"].astype('str')
    gdf_plots_buf = gdf_plots.merge(size_regions, left_on = "adm1_id", right_on = "region_id", how = "inner")

    print("Creating buffer")
    buffered = gdf_plots_buf.copy()

    buffered['area_ha'] = buffered['animals'] / buffered['field_capacity']
    buffered['area_m'] = buffered['area_ha'] * 10000
    buffered["buffer_radio"] = math.sqrt(buffered['area_m'].area / math.pi)
    buffered['geometry'] = buffered.apply(lambda x: x.geometry.buffer(x.buffer_radio), axis=1)    
    buffered['area'] = buffered['geometry'].area
    
    

    print("Reprojecting")
    buffered = buffered.to_crs(crs = from_epsg(dst_crs))
   
    output_file = os.path.join(buffer_folder,"buffer.shp")
    print("Saving: " + output_file)
    buffered.to_file(output_file)
    
    
    
    
    
    
    
    