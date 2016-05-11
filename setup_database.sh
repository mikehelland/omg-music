#installs postgresql-9.5

#sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
#wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
#sudo apt-get update
#sudo apt-get install postgresql postgresql-contrib


sudo -u postgres psql postgres -c "CREATE DATABASE omusic_db"
sudo -u postgres psql omusic_db -c "CREATE USER omusic_db WITH PASSWORD 'Ursa5830'"

