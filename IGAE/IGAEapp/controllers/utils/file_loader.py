import json
import csv

def load_json(json_file):
    try:
        data = json.load(json_file)
        return data
    except Exception as e:
        print(e)
        return None

def load_csv(csv_file):
    try:
        data = csv.reader(csv_file, delimiter=',')
        return data
    except Exception as e:
        print(e)
        return None
