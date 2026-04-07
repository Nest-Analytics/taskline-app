variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "learn-rg"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "aks-taskline-learn"
}

variable "node_count" {
  description = "Number of AKS nodes"
  type        = number
  default     = 2
}

variable "acr_name" {
  description = "Azure Container Registry name (leave empty if not using ACR)"
  type        = string
  default     = ""
}

variable "key_vault_name" {
  description = "Azure Key Vault name (must be globally unique across Azure)"
  type        = string
  default     = "kv-tasklineapp"
}

variable "app_password" {
  description = "User password for Taskline"
  type        = string
  sensitive   = true
}

variable "app_username" {
  description = "User username for Taskline"
  type        = string
  sensitive   = true
}

variable "api_key" {
  description = "API key for Taskline"
  type        = string
  sensitive   = true
}