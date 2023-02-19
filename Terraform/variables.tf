variable "resource_group_name" {
  description = "Name of the resource group to deploy to"
}

variable "cluster_name" {
  description = "Name of the Kubernetes cluster to deploy to"
}

variable "docker_image" {
  description = "Docker image to deploy"
}

variable "docker_tag" {
  description = "Docker image tag to use"
  default     = "latest"
}

variable "app_name" {
  description = "Name of the application being deployed"
}

variable "service_port" {
  description = "Port the service will listen on"
  default     = 80
}

variable "replica_count" {
  description = "Number of replicas to run"
  default     = 2
}

variable "namespace" {
  description = "Namespace in which to deploy resources"
  default     = "default"
}
