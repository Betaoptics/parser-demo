# parser-demo

### Welcome to the parser-demo

Pre-requisets: <br>
Node: ```v22.9.0```.<br>
npm: ```11.0.0```, or other package manager.


The concept of the project was to create a code sample project for a company for the following challenges:

- Fetch a list of users from API and save the data to a file.
- If the file is already found within the project, then new request to the API is not performed. Goal is to limit unnecessary API requests.
- From the data, pick following fields:
    name, email, street, city, zipcode, phone, website

- Save the data into excel in the consequent columns. One row for each person.
    - lastname, firstname, email, street, city, zipcode, phone, website
    - We can assume, that the first field of name is is firstname and the second field is lastname
    - Order the users (rows) based on lastname and firstname in ascending order
    - You can change the save location of the excel by changing the parameters
    - Running the file will always create a new excel in the format of employees_yyyymmddhhMMss.xlsx, where timeformat is the current time of running the file.

### How to run

```
git clone https://github.com/Betaoptics/parser-demo.git
npm install
```

Then create a ```.env``` file by copying the file contents from ```env.example``` and then contact the author for the API_URL address to finalize the configuration of the project.
After that you can run the code from console by running:

```
node employees.js
or simply:
node .
```

This will automatically create a ```users.json``` to the root of the project and dynamically create a data folder with the excel contents going within the folder.
If you want to change the location of the folders: navigate to lines ```59-60 to``` in ```employees.js``` change the location of the ```users.json``` file save location, and if you want to change the ```employees_yyyymmddhhMMss.xlsx``` excel file save location, you can navigate to lines ```107-108```. To change the saving locations parameters, please add new parameters after ```__dirname``` (current diretory), by adding ```', <nexpath>'``` after it.