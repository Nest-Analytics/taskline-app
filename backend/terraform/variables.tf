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

variable "log_analytics_workspace_name" {
  description = "Log Analytics workspace name"
  type        = string
  default     = "law-tasklineapp"
}

variable "application_insights_name" {
  description = "Application Insights resource name"
  type        = string
  default     = "appi-tasklineapp"
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

variable "api_key" {
  description = "API key for Taskline"
  type        = string
  sensitive   = true
}

variable "postgres_server_name" {
  description = "Azure Database for PostgreSQL Flexible Server name"
  type        = string
  default     = "psql-taskline-learn"
}

variable "postgres_database_name" {
  description = "Primary PostgreSQL database name"
  type        = string
  default     = "taskline"
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "tasklineadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "postgres_firewall_rule_name" {
  description = "PostgreSQL firewall rule name for Azure services access"
  type        = string
  default     = "allow-azure-services"
}

variable "aks_dns_prefix" {
  description = "AKS DNS prefix; defaults to the AKS cluster name when empty"
  type        = string
  default     = ""
}

variable "aks_default_node_pool_name" {
  description = "AKS default node pool name"
  type        = string
  default     = "default"
}

variable "app_title" {
  description = "Human-readable app name shown in the frontend header (stored in Key Vault and surfaced via CSI)"
  type        = string
  default     = "Taskline"
}

variable "app_version" {
  description = "App version string (stored in Key Vault and surfaced via CSI)"
  type        = string
  default     = "0.1.0"
}
