#!/bin/bash
# TODO - react better to missing args

stages=("local" "hybrid" "test" "prod")
localStages=("local" "hybrid")
if [[ ! " ${stages[*]} " =~ " ${1} " ]]; then
  echo "Invalid stage: ${1}";
  exit;
fi

# grab env file
envFile=$(<.env)
# echo "$envFile"

# set NODE_ENV
nodeEnv="NODE_ENV=$1"
envFile=$(echo "$envFile" | awk '{sub(/NODE_ENV=.*/,"'$nodeEnv'")}1')

# IF NOT LOCAL
if [[ ! " ${localStages[*]} " =~ " ${1} " ]]; then
  # find the profile name
  profileLine=$(echo "AWS_PROFILE_$1" | awk '{print toupper($0)}');
  # -F is separator
  # print $2 means print the second column (separated by separator)
  profile=$(awk -F "=" '/'$profileLine'/ {print $2 }' .env);

  # substitute the profile name
  envFile=$(echo "$envFile" | awk '{sub(/AWS_PROFILE=.*/,"AWS_PROFILE='$profile'")}1')

  # find the account id
  accountLine=$(echo "AWS_ACCOUNT_$1" | awk '{print toupper($0)}');
  # -F is separator
  # print $2 means print the second column (separated by separator)
  account=$(awk -F "=" '/'$accountLine'/ {print $2 }' .env);

  # substitute the account id
  envFile=$(echo "$envFile" | awk '{sub(/AWS_ACCOUNT=.*/,"AWS_ACCOUNT='$account'")}1')

  # set nx targets to cloud
  envFile=$(echo "$envFile" | awk '{sub(/NX_DEPLOY_TARGET=.*/,"NX_DEPLOY_TARGET=deploy")}1')
  envFile=$(echo "$envFile" | awk '{sub(/NX_DESTROY_TARGET=.*/,"NX_DESTROY_TARGET=destroy")}1')
else
  # substitute the account id
  envFile=$(echo "$envFile" | awk '{sub(/AWS_ACCOUNT=.*/,"AWS_ACCOUNT=000000000000")}1')

  # set nx targets to local
  envFile=$(echo "$envFile" | awk '{sub(/NX_DEPLOY_TARGET=.*/,"NX_DEPLOY_TARGET=deploy-local")}1')
  envFile=$(echo "$envFile" | awk '{sub(/NX_DESTROY_TARGET=.*/,"NX_DESTROY_TARGET=destroy-local")}1')
fi

# save values to file
echo "$envFile" | tee .env-tmp && mv .env-tmp .env

# add them to the current session
source ./tools/scripts/export-env.sh
