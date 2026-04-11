output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "resource_group_name" {
  description = "Resource group containing the AKS cluster"
  value       = azurerm_resource_group.main.name
}

output "acr_login_server" {
  description = "ACR login server (N/A if not using ACR)"
  value       = var.acr_name != "" ? azurerm_container_registry.main[0].login_server : "N/A"
}

output "application_insights_connection_string" {
  description = "Application Insights connection string for app telemetry"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}
