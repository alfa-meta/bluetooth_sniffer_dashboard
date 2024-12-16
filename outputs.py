import os
from datetime import date

def ensure_directory_exists(name_of_directory: str):
    """
        ensure_directory_exists function checks if a directory with provided name
        exists. If it doesn't it will be created.

        :param name_of_directory: the name of the directory to be checked/created 
    """    
    # Check if the directory exists
    if not os.path.exists(name_of_directory):
        # Create the directory
        os.makedirs(name_of_directory)
        print(f"Folder '{name_of_directory}' created.")
    else:
        print(f"Folder '{name_of_directory}' already exists.")

def create_todays_directory():
    """
        create_todays_directory - gets todays datetime in dd-mm-yyyy
        formate and creates a directory in outputs directory with the same name.
    """

    today = get_current_date()
    directory = f"outputs\\{today}"
    ensure_directory_exists(directory)

def get_current_date():
    """
        get_current_date is a function that returns the current date in
        dd-mm-yyyy format
    """
    today = date.today().strftime("%d-%m-%Y")
    return today