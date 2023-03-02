terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "3.0.0"
    }
  }
}
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  location = "westeurope"
  name     = "t-brauliotftest-we-rg-1"
}

resource "azurerm_kubernetes_cluster" "cluster"{
    name                = "t-brauliotftest-we-aks-1"
    location            = azurerm_resource_group.rg.location
    resource_group_name = azurerm_resource_group.rg.name
    dns_prefix          = "t-brauliotftest-we-aks-1"
    kubernetes_version  = "1.26.0"

    default_node_pool {
        name       = "default"
        node_count = 2
        vm_size    = "Standard_D2_v2"
    }
    identity {
        type = "SystemAssigned"
    }
  addon_profile {
    http_application_routing {
      enabled = true
    }
  }
}



