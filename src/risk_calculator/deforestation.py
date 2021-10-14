import os
import requests
import zipfile
import glob
import numpy as np
import rasterio as rio
from rasterio.mask import mask
from rasterio import Affine
from rasterio.merge import merge
from shapely.geometry import box
import fiona
from fiona.crs import from_epsg
import geopandas as gpd
import json
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.features import shapes
from shapely.geometry import shape, Point
import pandas as pd

# Method which download data from url. It creates a set of subfolders to downloaded files and other
# for unzipped files
# (string) inputs: Path where inputs files should be located
# (string) url_base: URL base where files are located
# (string) file_name_base: File name with wildcard character to rename. The wildcard character is *
# (array) years: String array with all periods that should be downloaded
def download_deforestation(inputs, url_base, file_name_base, years):
    # Create folders to download data and extract content
    download_folder = os.path.join(inputs,"download")
    content_folder = os.path.join(inputs,"content")
    if not os.path.exists(download_folder):
        os.mkdir(download_folder)
    if not os.path.exists(content_folder):
        os.mkdir(content_folder)
    # Loop for all years which should be downloaded
    for y in years:
        file_name = file_name_base.replace("*",y)
        url = url_base + file_name     
        # Download process        
        with open(os.path.join(download_folder,file_name), 'wb') as f:
            print("Downloading: " + url)
            response = requests.get(url, stream=True)
            total_length = response.headers.get('content-length')

            if total_length is None: # no content length header
                f.write(response.content)
            else:
                dl = 0
                total_length = int(total_length)
                for data in response.iter_content(chunk_size=4096):
                    dl += len(data)
                    f.write(data)
                    done = int(50 * dl / total_length)
                    print("[%s%s]" % ('=' * done, ' ' * (50-done)), end="\r", flush=True )    
        # Unzip process
        with zipfile.ZipFile(os.path.join(download_folder,file_name),"r") as zip_ref:
            print("Extracting: " + download_folder + file_name)
            zip_ref.extractall(content_folder)    

# Function to parse features from GeoDataFrame in such a manner that rasterio needs.
# It returns a json with the features of the polygon
# (GeoDataFramae) dgf: GeoDataFrame with form
def getFeatures(gdf):    
    return [json.loads(gdf.to_json())['features'][0]['geometry']]

# Method which reproject a raster to specifc system and pixel size
# (string) source: Path of the source raster file
# (string) destination: Path of the destination raster file
# (string) dst_crs: New system CRS of destination
# (double) pixel_size: New pixel size
def reproject_raster(source, destination, dst_crs, pixel_size):
    with rio.open(source) as src:
        transform, width, height = calculate_default_transform(src.crs, dst_crs, src.width, src.height, *src.bounds)
        
        transform = Affine(pixel_size, transform.b, transform.c, transform.d, -pixel_size, transform.f)
        kwargs = src.meta.copy()
        kwargs.update({
            'crs': dst_crs,
            'transform': transform,
            'width': width,
            'height': height,
            'compress': 'lzw'
        })
        
        with rio.open(destination, 'w', **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                        source=rio.band(src, i),
                        destination=rio.band(dst, i),
                        src_transform=src.transform,
                        src_crs=src.crs,
                        dst_transform=transform,
                        dst_crs=dst_crs,
                        resampling=Resampling.nearest)
            
        

# Method which extracts deforestation pixels for all raster files.
# It crops and resamples all raster files to same dimention based on the small area of all rasters.
# (string) inputs: Path where inputs files should be located
# (int) def_value: It is the value for deforestation pixels
# (int) dst_crs: New system CRS of destination
# (float) pixel_size: Define the value for pixels dimension for all new rasters
def extract_deforestation(inputs, def_value, dst_crs, pixel_size):
    # Creates output folder
    outputs_folder = os.path.join(inputs,"fixed")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    detail_folder = os.path.join(outputs_folder,"raster_detail")
    if not os.path.exists(detail_folder):
        os.mkdir(detail_folder)
    # Listing files
    pattern = inputs + os.path.sep + "content" + os.path.sep + '**' + os.path.sep + '**.tif'
    files = glob.glob(pattern, recursive=True)    
    # Parameters
    minx, miny, maxx, maxy = 0, 0, 0, 0
    crs = None
    epsg_code = None
        
    # loop for getting parameters of all raster files (*.tif)
    print("Calculating parameters for new files")
    for idx,rf in enumerate(files):
        print("file: " + rf)
        with rio.open(rf) as raster:
            raster_meta = raster.meta.copy()
            # Copying the first metadata
            if idx == 0:
                crs = raster.crs
                minx, miny, maxx, maxy = raster.bounds[0], raster.bounds[1], raster.bounds[2], raster.bounds[3]
            # Checking which is the min left corner 
            if raster.bounds[0] > minx:
                minx = raster.bounds[0]
            if raster.bounds[1] > miny:
                miny = raster.bounds[1]             
            # Checking which is the min right corner 
            if raster.bounds[2] < maxx:
                maxx = raster.bounds[2]
            if raster.bounds[3] < maxy:
                maxy = raster.bounds[3]
    
    # Creating polygon to crop the rasters files.
    bbox = box(minx, miny, maxx, maxy)
    print("Bounds: " + str(bbox))
    print("CRS: " + str(crs))
    geo = gpd.GeoDataFrame({'geometry': bbox}, index=[0], crs=crs.data)
    geo = geo.to_crs(crs = from_epsg(dst_crs))
    coords = getFeatures(geo)
    
    # loop for extracting, cropping and resampling raster files (*.tif)
    for rf in files:
        print("Working: " + rf)
        
        # Reproject the original raster and creates a tmp file
        rf_paths = rf.split(os.path.sep)
        rf_tmp = rf_paths[len(rf_paths)-1].replace(".tif","_tmp.tif")  
        rf_tmp = outputs_folder + os.path.sep + rf_tmp
        print("Reprojecting: " + rf_tmp)
        
        reproject_raster(rf, rf_tmp, 'EPSG:' + str(dst_crs), pixel_size)
        
        print("Opening: " + rf_tmp)
        with rio.open(rf_tmp) as raster:
            # Copy meta data from tmp file reprojected
            meta_dst = raster.meta.copy()
            
            print("Cropping raster")
            out_img, out_transform = mask(dataset=raster, shapes=coords, crop=True)            
            print("Dimention: H=" + str(out_img.shape[1]) + " W=" + str(out_img.shape[2]))
            # Extract values deforestation
            out_img[out_img != def_value] = 0
            meta_dst.update({"driver": "GTiff",
                 "height": out_img.shape[1],
                 "width": out_img.shape[2],
                 "transform": out_transform,
                 'compress': 'lzw',
                 'nodata': 0})
            
            file_name = rf_paths[len(rf_paths)-1]
            file_len = len(file_name)
            file_name = file_name[file_len-13:file_len-9]
            dest_file = os.path.join(detail_folder, file_name + ".tif")
            print("Saving: " + dest_file)
            with rio.open(dest_file, 'w', **meta_dst) as dst:
                dst.write(out_img)
        
        # Delete the tmp file
        print("Deleting tmp: " + rf_tmp)        
        os.remove(rf_tmp)
            
            

# Method which acummulates all deforestation raster for all years
# (string) inputs: Path where inputs files should be located
def summary_deforestation(inputs):    
    outputs_folder = os.path.join(inputs, "fixed")
    detail_folder = os.path.join(outputs_folder,"raster_detail")
    # Crating output folder for summary
    summary_folder = os.path.join(outputs_folder,"raster_summary")
    if not os.path.exists(summary_folder):
        os.mkdir(summary_folder)
    files = glob.glob(detail_folder + os.path.sep + "*.tif")
    summary = None
    meta_ref = None
    # Loop to compile all deforestation rasters
    print("Compiling rasters files")
    for idx, rf in enumerate(files):
        print(rf)
        with rio.open(rf) as raster:
            # Copy medatadata
            meta_ref = raster.meta.copy()
            # Extract values deforestation
            array = raster.read()    
            # Check if it is the first raster
            if idx == 0:
                summary = array            
            # Acummulating data            
            summary = summary + array
        # Clear data for deforestation values
        summary[summary != 0] = 2
        # Compressing the output
        meta_ref.update({'compress': 'lzw'})
        
        rf_paths = rf.split(os.path.sep)
        dest_file = os.path.join(summary_folder,rf_paths[len(rf_paths) - 1])            
        print("Saving: " + dest_file)
        with rio.open(dest_file, "w", **meta_ref) as dest:
            dest.write(summary)

# Method that transforms raster files to shapefiles.
# This methods applies the transformation for detail and summary files
# (string) inputs: Path where inputs files should be located
def to_shp(inputs, encoding="utf-8"):
    outputs_folder = os.path.join(inputs, "fixed")
    folders = ["detail", "summary"]
    crs = None
    for fo in folders:
        # Creates outputs folders
        raster_folder = os.path.join(outputs_folder,"raster_" + fo) 
        shp_folder = os.path.join(outputs_folder,"shp_" + fo)
        if not os.path.exists(shp_folder):
            os.mkdir(shp_folder)

        files = glob.glob(raster_folder + os.path.sep + "*.tif")
        for rf in files:
            print("Opening: " + rf)  
            results = pd.DataFrame()      
            with rio.open(rf) as src:
                image = src.read()
                mask = None
                crs = src.crs

                print("Transforming")                      
                #results = ({'properties': {'raster_val': v}, 'geometry': s} for i, (s, v) in enumerate(shapes(image, mask=mask, transform=src.meta['transform'])))
                results = pd.DataFrame([src.xy(x,y) for x in np.arange(image.shape[1]) for y in np.arange(image.shape[2]) if int(image[0][x][y]) == 2], columns=["lon","lat"])

            print("Creating shapefile crs: " + str(crs.data))            
            gdf = gpd.GeoDataFrame(results, geometry=gpd.points_from_xy(results.lon, results.lat),crs = crs.data)
            
            rf_paths = rf.split(os.path.sep)
            # Cretae folder for the shapefile
            f_folder = os.path.join(shp_folder,rf_paths[len(rf_paths) - 1].replace(".tif",""))
            if not os.path.exists(f_folder):
                os.mkdir(f_folder)
            dest_file = os.path.join(f_folder,"shapefile.shp")
            print("Saving: " + dest_file)    
            gdf.to_file(dest_file,encoding=encoding)
