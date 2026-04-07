terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Backend block is intentionally empty here.
  # Connection details are passed via -backend-config flags at terraform init.
  # See Part 4 (local) and the pipeline workflow (Exercise 3) for how this works.
  backend "azurerm" {}
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-tasklineapp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_registry" "main" {
  count               = var.acr_name != "" ? 1 : 0
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = var.aks_cluster_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.aks_cluster_name

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = "standard_b2ls_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  oms_agent {
    log_analytics_workspace_id      = azurerm_log_analytics_workspace.main.id
    msi_auth_for_monitoring_enabled = true
  }
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  count                            = var.acr_name != "" ? 1 : 0
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main[0].id
  skip_service_principal_aad_check = true
}