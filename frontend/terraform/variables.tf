variable "resource_group_name" {
  description = "Azure resource group name hosting the shared AKS cluster"
  type        = string
  default     = "learn-rg"
}

variable "aks_cluster_name" {
  description = "Shared AKS cluster name"
  type        = string
  default     = "aks-taskline-learn"
}

variable "frontend_deployment_name" {
  description = "Frontend Kubernetes deployment name"
  type        = string
  default     = "taskline-frontend"
}

variable "frontend_service_name" {
  description = "Frontend Kubernetes service name"
  type        = string
  default     = "taskline-frontend-service"
}
