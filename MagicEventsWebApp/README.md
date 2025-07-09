# How to run services:
Before running the services make sure you generate a certificate.

You can find a simple certificate generator in `MagicEventsWebApp/Backend/KeysGenerator.bat`.

The certificate must be placed in the resources folder along with the file `application.properties`.

# Step for running docker-componse

Go in folder Backend (run ``` cd Backend```) and run:
1) ```bash 
   docker-compose down
   ```
2) ```bash 
   docker-compose build
   ```
3) ```bash 
   docker-compose up
   ```
