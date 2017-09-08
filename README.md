# A webapp to create polls, and vote on them

# Environment variables, should be in a .env file
APP_URL=(must ends with a "/")
PORT=
MONGO_URI=
ANON_USER_ID=

#Note:
APP_URL must end with a trailing slash /
ANON_USER_ID : An anonymous userID from type ObjectId is needed to enable anonymous login. Use mongoose to create a dedicated user account for this purpose. 
