import os
from rasterstats import zonal_stats
import rasterio as rio
import geopandas as gpd
import fiona
from shapely.ops import nearest_points

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
                    gdf["def_prop"] = (gdf["area"] / gdf["def_area"]) * 100

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

#
def distance_plot(inputs, years, types_analysis):
    in_areas_root = os.path.join(inputs,"plot","fixed","def")
    in_def_root = os.path.join(inputs,"def","fixed")
    # Create output folder
    outputs_folder = os.path.join(inputs,"plot","fixed","dis")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    
    # Loop for years which want to be analyzed
    for y in years:    
        print("Processing year: " + str(y))
        
        # Loop for type of analysis, they can be detail or summary
        for ta in types_analysis:
            
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
            
            print("Calculating distances")
            shp_areas['def_distance'] = shp_areas.apply(lambda row: near_distance(row.centroid, pts), axis=1)
            
            f_folder = os.path.join(outputs_folder, ta)
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
                        
            f_folder = os.path.join(f_folder, str(y))
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
            output_file = os.path.join(f_folder, "areas_distance.shp")
            print("Saving: " + output_file)
            shp_areas.to_file(output_file)
            
            
            
            

            
            
            
            
        
        
        
        
        
        
    