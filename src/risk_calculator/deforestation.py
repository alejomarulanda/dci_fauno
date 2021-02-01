import requests

# Method which download data from url
# (string) inputs: Path where inputs files should be located
# (string) url_base: URL base where files are located
# (string) file_name_base: File name with wildcard character to rename. The wildcard character is *
# (array) years: String array with all periods that should be downloaded
def download_deforestation(inputs, url_base, file_name_base, years):
    #url_base = conf.loc[conf["parameter"] == "def_src_base_url","value"][0]
    #file_name_base = conf.loc[conf["parameter"] == "def_src_file_name","value"][0]
    for y in years:
        file_name = file_name_base.replace("*",y)
        url = url_base + file_name        
        with open(inputs + file_name, 'wb') as f:
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
                    sys.stdout.write("\r[%s%s]" % ('=' * done, ' ' * (50-done)) )    
                    sys.stdout.flush()
 