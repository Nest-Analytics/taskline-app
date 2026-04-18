output "frontend_deployment_name" {
  description = "Frontend deployment name applied into AKS"
  value       = local.frontend_deployment_name
}

output "frontend_service_name" {
  description = "Frontend service name applied into AKS"
  value       = local.frontend_service_name
}

output "shared_aks_cluster_name" {
  description = "AKS cluster used by the frontend workload"
  value       = data.azurerm_kubernetes_cluster.shared.name
}
