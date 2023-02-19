# Define the provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "my_resource_group" {
  name     = var.resource_group_name
  location = var.resource_group_location
}

# Create a Kubernetes cluster
module "aks" {
  source              = "Azure/aks/azurerm"
  resource_group_name = azurerm_resource_group.my_resource_group.name
  dns_prefix          = var.dns_prefix
  agent_count         = var.agent_count
  agent_vm_size       = var.agent_vm_size
  service_principal   = var.service_principal
  client_secret       = var.client_secret
  ssh_public_key      = var.ssh_public_key
}

# Deploy the Node.js microservice
module "node_microservice" {
  source                = "./modules/node_microservice"
  resource_group_name   = azurerm_resource_group.my_resource_group.name
  acr_server_name       = azurerm_container_registry.acr.name
  aks_cluster_name      = module.aks.aks_name
  aks_resource_group    = azurerm_resource_group.my_resource_group.name
  aks_nodepool_name     = module.aks.nodepool_name
  docker_image_name     = var.node_docker_image_name
  docker_image_tag      = var.node_docker_image_tag
  docker_registry_login = azurerm_container_registry.acr.login_server
}

# Deploy the Python microservice
module "python_microservice" {
  source                = "./modules/python_microservice"
  resource_group_name   = azurerm_resource_group.my_resource_group.name
  acr_server_name       = azurerm_container_registry.acr.name
  aks_cluster_name      = module.aks.aks_name
  aks_resource_group    = azurerm_resource_group.my_resource_group.name
  aks_nodepool_name     = module.aks.nodepool_name
  docker_image_name     = var.python_docker_image_name
  docker_image_tag      = var.python_docker_image_tag
  docker_registry_login = azurerm_container_registry.acr.login_server
}

# Create an ingress controller
module "ingress" {
  source              = "Azure/ingress-nginx/azurerm"
  resource_group_name = azurerm_resource_group.my_resource_group.name
  cluster_name        = module.aks.aks_name
}

# Create a DNS record for the ingress controller
resource "azurerm_dns_cname_record" "ingress_cname" {
  name                = var.dns_prefix
  zone_name           = var.dns_zone_name
  resource_group_name = azurerm_resource_group.my_resource_group.name
  ttl                 = 300
  cname               = module.ingress.ip_address
}

# Create an output variable to display the Kubernetes dashboard URL
output "dashboard_url" {
  value = "https://${azurerm_kubernetes_cluster.main.kube_admin_config.0.host}/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
}
