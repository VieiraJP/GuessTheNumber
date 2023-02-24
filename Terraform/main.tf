terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "3.0.0"
    }
  }
}
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "r" {
  location = "westeurope"
  name     = "t-brauliotftest-we-rg-1"
}


