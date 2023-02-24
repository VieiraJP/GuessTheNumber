# Guess the Number Microservices

This project demonstrates how to deploy two microservices, to a Kubernetes cluster running on Azure using Terraform. The microservices are exposed through an Azure Load Balancer.

## Prerequisites

To use this project, you'll need the following:

- A Docker Hub account to build and store the Docker images for the microservices
- An Azure account to deploy the Kubernetes cluster and the microservices
- The Azure CLI to interact with your Azure resources
- `kubectl` to interact with your Kubernetes cluster
- `terraform` to deploy the Kubernetes cluster

## Building the Docker Images

The microservices are built using Docker. To build the images, run the following commands:

```bash
cd ClientService
docker build -t your-registry/ClientService:latest .
docker push your-registry/ClientService:latest
```
Repeat the above steps for the host service

## Create a Kubernetes Cluster using Terraform (iAC)

Assuming you have an azure subscription and terraform installed
```bash
cd terraform
terraform init
terraform apply
```
Wait .... it will take time to create the cluster

## Deploy the Microservices to the Kubernetes Cluster
```bash
cd K8s
kubectl apply -f deployment.yml
kubectl apply -f service.yml
kubectl apply -f ingress.yml
````

