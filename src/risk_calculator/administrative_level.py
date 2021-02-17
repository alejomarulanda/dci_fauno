import os
import requests
import zipfile
import glob
from fiona.crs import from_epsg
import geopandas as gpd

# Method which download data from url. It creates a set of subfolders to downloaded files and other
# for unzipped files
# (string) inputs: Path where inputs files should be located
# (string) url_base: URL base where files are located
def download_data(inputs, url):
    # Create folders to download data and extract content
    download_folder = os.path.join(inputs,"download")
    content_folder = os.path.join(inputs,"content")
    if not os.path.exists(download_folder):
        os.mkdir(download_folder)
    if not os.path.exists(content_folder):
        os.mkdir(content_folder)
    file_name = "administrative.zip"
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

# Method that reprojects 
# (string) inputs: Path where inputs files should be located
# (int) dst_crs: New system CRS of destination
def reproject_source(inputs, dst_crs, adm1_name, adm1_id, adm2_name, adm2_id, adm3_name, adm3_id, area, geometry):
    content_folder = os.path.join(inputs,"content")
    # Creates output folder
    outputs_folder = os.path.join(inputs,"fixed")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    
    pattern = inputs + os.path.sep + "content" + os.path.sep + '**' + os.path.sep + '**.shp'
    files = glob.glob(pattern, recursive=True)
    print("Opening the first file: " + files[0])
    data = gpd.read_file(files[0])
    print("Reprojecting")
    data = data.to_crs(crs = from_epsg(dst_crs))
    data = data[[adm1_id,adm1_name,adm2_id,adm2_name,adm3_id,adm3_name,area,geometry]]
    data.columns = ["adm1_id","adm1_name","adm2_id","adm2_name","adm3_id","adm3_name","area","geometry"]
    print(data.head())
    
    output_file = os.path.join(outputs_folder,"adm.shp")
    print("Saving: " + output_file)
    data.to_file(output_file)