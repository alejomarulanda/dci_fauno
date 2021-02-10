# Import libraries
import os
import glob
import numpy as np
import pandas as pd

# Method which compiles in just one file all data sources of animals invetory for all years
# (string) inputs: Path where inputs files should be located
# (string) character_file: Character which separates fields into files
def fix_data(inputs, character_file):
    # Create folders to download data and extract content
    download_folder = os.path.join(inputs,"download")
    content_folder = os.path.join(inputs,"content")
    if not os.path.exists(download_folder):
        os.mkdir(download_folder)
    if not os.path.exists(content_folder):
        os.mkdir(content_folder)
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
    output = content_folder + os.path.sep +'plots.csv'
    print("Saving: " + output)
    df_plots.to_csv(output, index = False, encoding = "ISO-8859-1")
    
def load_data(inputs):
    # Creates output folder
    outputs_folder = os.path.join(inputs,"fixed")
    if not os.path.exists(outputs_folder):
        os.mkdir(outputs_folder)
    pattern = inputs + os.path.sep + '**' + os.path.sep + '**.csv'
    files = glob.glob(pattern, recursive=True)
    df_plots = pd.read_csv(file_plot, encoding = "ISO-8859-1")