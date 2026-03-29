variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "rg-tasklineapp"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "aks-tasklineapp"
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