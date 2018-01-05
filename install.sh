
## IMPORANT! Set the password for the database in this environment variable
## It is used by the app and by the ./create_database.sh

export OMG_DB_PW=password_here

## IMPORTANT! This requires Postgresql 9.4 or later!
## This will install Postgresql if there isn't a version installed
## But you should check to see if it's 9.4 or later

which psql
if [ "$?" -gt "0" ]; then
  ./install_database.sh
else
  echo "Postgresql is installed. Hopefully 9.4 or later!"
fi

# Now we can create our database with the password in OMG_DB_PW

./create_database.sh

# This will install all the node modules for the project

npm init

# And now we're good to go!

node main.js