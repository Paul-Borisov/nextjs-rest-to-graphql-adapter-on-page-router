#!/bin/bash
# Git Bash
export instance=<your-azure-container-registry>
export azuresubscription=<your-azure-subscription>
export resourcegroup=<your-resource-group>
export appname=nextjs-rest-to-graphql-adapter
export image=$instance.azurecr.io/$appname-on-page-router:latest
export environment=$instance-ca

docker build -t $instance.azurecr.io/$appname-on-page-router:latest .

docker run --name nextjs-rest-to-graphql -p 3000:3000 -d $instance.azurecr.io/$appname-on-page-router:latest

docker login

az acr login --name $instance # use username and password for your existing Azure Container registry

docker push $instance.azurecr.io/$appname-on-page-router:latest

: ' # login to Azure as an admin to create your Azure Container App
az login

az containerapp delete --name $appname --subscription $azuresubscription --resource-group $resourcegroup --yes

az containerapp create --name $appname --subscription $azuresubscription --resource-group $resourcegroup \
  --image $image --environment $environment --registry-server $instance.azurecr.io \
  --ingress external --transport auto --target-port 3000 --cpu 2 --memory 4 --min-replicas 1 --max-replicas 1

myip=$(curl https://ipinfo.io/ip)
az containerapp ingress access-restriction set -n $appname -g $resourcegroup --rule-name myip --ip-address $myip/32 --description "IP restriction" --action Allow
'
