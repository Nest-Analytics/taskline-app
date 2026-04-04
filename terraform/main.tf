terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
    backend "azurerm" {
    resource_group_name  = "learnn-storerg"
    storage_account_name = "learnstoragestorage1"
    container_name       = "tfstate"
    key                  = "tasklineapp.terraform.tfstate"
  }

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

# ACR — only created if acr_name variable is provided
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

# Grant AKS permission to pull from ACR (only if ACR is being used)
resource "azurerm_role_assignment" "aks_acr_pull" {
  count                            = var.acr_name != "" ? 1 : 0
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main[0].id
  skip_service_principal_aad_check = true
}


resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-tasklineapp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = var.key_vault_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Soft delete: deleted secrets recoverable for 7 days
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  # Enable RBAC for access control (recommended over access policies)
  rbac_authorization_enabled = true
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "app_password" {
  name         = "APP-PASSWORD"
  value        = var.app_password
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.kv_sp_secrets_officer]
}

resource "azurerm_key_vault_secret" "api_key" {
  name         = "API-KEY"
  value        = var.api_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.kv_sp_secrets_officer]
}

resource "azurerm_key_vault_secret" "app_username" {
  name         = "APP-USERNAME"
  value        = var.app_username
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.kv_sp_secrets_officer]
  
}

# Grant the deployment service principal permission to manage secrets
# (so Terraform and the pipeline can create secrets in Key Vault)
resource "azurerm_role_assignment" "kv_sp_secrets_officer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Grant AKS managed identity permission to READ secrets
resource "azurerm_role_assignment" "kv_aks_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
}
