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
Be sure to edit the hosts file mapping localhost as follows:

```
  127.0.0.1 italiamagicevents.it
```

For modify hosts file run:
```bash
  sudo nano /etc/hosts
```
In Windows open file in path: `C:\Windows\System32\drivers\etc\hosts`.