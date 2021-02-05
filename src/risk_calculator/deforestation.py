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
from fiona.crs import from_epsg
import geopandas as gpd
import json

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
    print("Done!")

# Function to parse features from GeoDataFrame in such a manner that rasterio wants them
def getFeatures(gdf):    
    return [json.loads(gdf.to_json())['features'][0]['geometry']]

# Method which extracts deforestation pixels for all raster files.
# It crops and resamples all raster files to same dimention based on the small area of all rasters.
# (string) inputs: Path where inputs files should be located
# (int) def_value: It is the value for deforestation pixels
# (float) pixel_size: Define the value for pixels dimension for all new rasters
def extract_deforestation(inputs, def_value, pixel_size):
    # Creates output folder
    outputs_folder = os.path.join(inputs,"fixed")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    # Listing files
    pattern = inputs + os.path.sep + '**' + os.path.sep + '**.tif'
    files = glob.glob(pattern, recursive=True)    
    # Parameters
    meta_ref = None
    minx, miny, maxx, maxy = 0, 0, 0, 0
    crs = None
    epsg_code = None
        
    # loop for getting parameters of all raster files (*.tif)
    print("Calculating parameters for new files")
    for idx,rf in enumerate(files):
        with rio.open(rf) as raster:
            raster_meta = raster.meta.copy()
            # Copying the first metadata
            if idx == 0:
                meta_ref = raster.meta.copy()
                crs = raster.crs
                minx, miny, maxx, maxy = raster.bounds[0], raster.bounds[1], raster.bounds[2], raster.bounds[3]                
            # Checking which is the min left corner 
            if raster.bounds[0] > minx and raster.bounds[1] > miny:
                minx = raster.bounds[0]
                miny = raster.bounds[1]             
            # Checking which is the min right corner 
            if raster.bounds[2] < maxx and raster.bounds[3] < maxy:
                maxx = raster.bounds[2]
                maxy = raster.bounds[3]
    
    print("Outputs paramaters for rasters files:")
    bbox = box(minx, miny, maxx, maxy)
    print("Bounds: " + str(bbox))
    print("CSR: " + str(crs))
    
    # Creating polygon to crop the rasters files
    geo = gpd.GeoDataFrame({'geometry': bbox}, index=[0], crs=from_epsg(4326))
    geo = geo.to_crs(crs=crs.data)
    coords = getFeatures(geo)
    meta_ref['nodata'] = 0
    
    # loop for extracting, cropping and resampling raster files (*.tif)
    for rf in files:
        print("Opening: " + rf)
        with rio.open(rf) as raster:
            # Extract values deforestation
            array = raster.read()
            array[ array != def_value] = 0
            
            print("Cropping raster")
            out_img, out_transform = mask(dataset=raster, shapes=coords, crop=True)
            
            print("Resampling raster")
            transform = Affine(pixel_size, out_transform.b, out_transform.c, out_transform.d, pixel_size, out_transform.f)
            meta_ref.update({"driver": "GTiff",
                 "height": out_img.shape[1],
                 "width": out_img.shape[2],
                 "transform": transform,
                 #"crs": pycrs.parse.from_epsg_code(epsg_code).to_proj4()})
                 "crs": crs})
            
            rf_paths = rf.split(os.path.sep)
            dest_file = os.path.join(outputs_folder, rf_paths[len(rf_paths)-1])            
            print("Saving: " + dest_file)
            with rio.open(dest_file, "w", **meta_ref) as dest:
                dest.write(array)

# Method which summarize all deforestation raster in just one
# (string) inputs: Path where inputs files should be located
def summary_deforestation(inputs):
    outputs_folder = os.path.join(inputs, "fixed")
    files = glob.glob(outputs_folder + os.path.sep + "*.tif")
    summary = None
    meta_ref = None
    # Loop to compile all deforestation rasters
    print("Compiling rasters files")
    for idx, rf in enumerate(files):
        print(rf)
        with rio.open(rf) as raster:
            # Extract values deforestation
            array = raster.read()        
            if idx == 0:
                summary = array
                meta_ref = raster.meta.copy()
            summary = summary + array
    summary[summary != 0] = 2
    dest_file = os.path.join(outputs_folder,"summary.tif")            
    print("Saving: " + dest_file)
    with rio.open(dest_file, "w", **meta_ref) as dest:
        dest.write(summary)
    
    
                    
 