terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "shared" {
  name = var.resource_group_name
}

data "azurerm_kubernetes_cluster" "shared" {
  name                = var.aks_cluster_name
  resource_group_name = data.azurerm_resource_group.shared.name
}

locals {
  frontend_deployment_name = var.frontend_deployment_name
  frontend_service_name    = var.frontend_service_name
}
