import os
from rasterstats import zonal_stats
import rasterio as rio
import geopandas as gpd
import fiona
from shapely.ops import nearest_points
import multiprocessing as mp
import numpy as np
import pandas as pd
import math
from fiona.crs import from_epsg


# Method that calculate risk of deforestation by plot
# (string) inputs: Path where inputs files should be located
# (array) years: Array of ints with all years that should be processed
# (array) types_analysis: Array of strings with the types of
def deforestation_plot(inputs, years, types_analysis, pixel_size):
    
    in_buffer_root = os.path.join(inputs,"plot","fixed","buffer")
    # Create output folder
    outputs_folder = os.path.join(inputs,"plot","fixed","def")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)

    file_bu = os.path.join(in_buffer_root,"buffer.shp")
    print("Opening shp: " + file_bu)    
    with fiona.open(file_bu, 'r') as shp:
        # Loop for type of analysis, they can be detail or summary
        for ta in types_analysis:
            print("Type of analysis: " + ta)
            # Loop for years which want to be analyzed
            for y in years:    
                print("Processing: " + str(y))

                in_def_root = os.path.join(inputs,"def","fixed","raster_" + ta)

                # Setting the path for files: shapefile and raster            
                file_de = os.path.join(in_def_root, str(y) + ".tif")

                print("Opening raster: " + file_de)
                with rio.open(file_de, 'r') as de:            

                    print("Calculating zonal stats")
                    stats = zonal_stats(shp, file_de, all_touched=True, geojson_out=True)

                    print("Parsing to Geopandas")
                    gdf  = gpd.GeoDataFrame.from_features(stats,crs = de.crs.data)
                    gdf["def_area"] = gdf["count"] * (pixel_size*pixel_size)
                    gdf["def_prop"] = (gdf["def_area"] / gdf["area"]) * 100

                    f_folder = os.path.join(outputs_folder, ta)
                    if not os.path.exists(f_folder):
                        os.mkdir(f_folder)
                        
                    f_folder = os.path.join(f_folder, str(y))
                    if not os.path.exists(f_folder):
                        os.mkdir(f_folder)
                    output_file = os.path.join(f_folder, "areas.shp")
                    print("Saving: " + output_file)
                    gdf.to_file(output_file)
                    
# Method that calculates distance between a point and shapes.
# It just calculates distance for the near shape
# (geometry) point: Point which should be compare with polygons
# (list(geometry)) pts: List of polygons which should be compared
def near_distance(point, pts):
    # find the nearest point and return the corresponding value
    nearest = nearest_points(point, pts)[1]
    # Calculate the distance
    distance = point.distance(nearest)
    return distance


def neighbour_distance(gdf_chunk, pts):    
    for index, row in gdf_chunk.iterrows(): # Iterate over the chunk
        gdf_chunk.at[index,'distance'] = near_distance(row.centroid, pts)
    return gdf_chunk

# Method which calculate the distance between centroid of buffer of each plot with the near deforestation point
# (string) inputs: Path where inputs files should be located
# (array) years: Array of ints with all years that should be processed
# (array) types_analysis: Array of strings with the types of
def distance_plot(inputs, years, types_analysis):
    in_areas_root = os.path.join(inputs,"plot","fixed","def")
    in_def_root = os.path.join(inputs,"def","fixed")
    # Create output folder
    outputs_folder = os.path.join(inputs,"plot","fixed","dis")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    
    # CPUS to use
    cpus = mp.cpu_count() - 1 
    pool = mp.Pool(processes=cpus)

    # Loop for type of analysis, they can be detail or summary
    for ta in types_analysis:
        print("Processing type: " + ta)
        
        # Loop for years which want to be analyzed
        for y in years:    
            print("Processing year: " + str(y))
            
            file_areas = os.path.join(in_areas_root,ta,str(y),"areas.shp")
            print("Opening areas shp: " + file_areas)    
            shp_areas = gpd.read_file(file_areas)
            
            file_def = os.path.join(in_def_root,"shp_" + ta, str(y), "shapefile.shp")
            print("Opening deforestation shp: " + file_def)    
            shp_def = gpd.read_file(file_def)
            
            print("Fixing fields")
            # Creating centroids for buffer areas
            shp_areas['centroid'] = shp_areas.centroid
            # Extracting geometries of deforestation
            pts = shp_def.geometry.unary_union

            print("Starting process parallel")
            shp_areas_chunks = np.array_split(shp_areas, cpus)
            chunk_processes = [pool.apply_async(neighbour_distance, args=(chunk, pts)) for chunk in shp_areas_chunks]
            shp_areas_results = [chunk.get() for chunk in chunk_processes]
            print("Joining results")
            shp_areas = gpd.GeoDataFrame(pd.concat(shp_areas_results), crs=shp_areas.crs)
            shp_areas = shp_areas.drop('centroid', 1)
            
            f_folder = os.path.join(outputs_folder, ta)
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
                        
            f_folder = os.path.join(f_folder, str(y))
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
            output_file = os.path.join(f_folder, "areas_distance.shp")
            print("Saving: " + output_file)
            shp_areas.to_file(output_file)


def calculate_risk_direct(gdf_chunk, param):    
    for index, row in gdf_chunk.iterrows(): # Iterate over the chunk
        # Calculate DP
        def_prop =  (row.def_area / row.area) * 100.0
        gdf_chunk.at[index,'def_prop'] = def_prop        
        dp = 0
        if def_prop > 2.0:
            dp = 4
        elif (def_prop > 1.0) & (def_prop <= 2.0): 
            dp = 3
        elif (def_prop > .5) & (def_prop <= 1.0): 
            dp = 2
        elif (def_prop > 0.0) & (def_prop <= .5): 
            dp = 1
        gdf_chunk.at[index,'dp'] = dp
        # Calculate DD
        dd = 0
        if row.distance <= 1000.0:
            dd = 4
        elif (row.distance > 1000.0) & (row.distance <= 2000.0): 
            dp = 3
        elif (row.distance > 2000.0) & (row.distance <= 3000.0): 
            dp = 2
        elif (row.distance > 3000.0) & (row.distance <= 5000.0): 
            dp = 1
        gdf_chunk.at[index,'dd'] = dd
        gdf_chunk.at[index,'rd'] = math.ceil((dd * 0.5) + (dp * 0.5))

    return gdf_chunk

def risk_direct(inputs, years, types_analysis, dst_crs):
    in_dis_root = os.path.join(inputs,"plot","fixed","dis")
    # Create output folder
    outputs_folder = os.path.join(inputs,"plot","fixed","risk")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    
    # CPUS to use
    cpus = mp.cpu_count() - 1 
    pool = mp.Pool(processes=cpus)

    # Loop for type of analysis, they can be detail or summary
    for ta in types_analysis:
        print("Processing type: " + ta)
        
        # Loop for years which want to be analyzed
        for y in years:    
            print("Processing year: " + str(y))

            file_dis = os.path.join(in_dis_root,ta,str(y),"areas_distance.shp")
            print("Opening areas shp: " + file_dis)    
            shp_dis = gpd.read_file(file_dis)

            print("Reprojecting to: " + str(from_epsg(dst_crs)))
            shp_dis = shp_dis.to_crs(crs = from_epsg(dst_crs))

            print("Starting process parallel")
            shp_dis_chunks = np.array_split(shp_dis, cpus)            
            chunk_processes = [pool.apply_async(calculate_risk_direct, args=(chunk, "")) for chunk in shp_dis_chunks]
            shp_dis_results = [chunk.get() for chunk in chunk_processes]
            print("Joining results")
            shp_dis = gpd.GeoDataFrame(pd.concat(shp_dis_results), crs=shp_dis.crs)

            f_folder = os.path.join(outputs_folder, ta)
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
                        
            f_folder = os.path.join(f_folder, str(y))
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
            output_file = os.path.join(f_folder, "rd.shp")
            print("Saving: " + output_file)
            shp_dis.to_file(output_file)





            
            

            
            
            
            
        
        
        
        
        
        
    