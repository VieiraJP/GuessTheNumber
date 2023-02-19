output "load_balancer_ip" {
  value = azurerm_public_ip.load_balancer.ip_address
}

output "kube_config" {
  value = data.azurerm_kubernetes_cluster.k8s.kube_config_raw
}

output "sender_service_ip" {
  value = kubernetes_service.sender_service.status.load_balancer.ingress[0].ip
}

output "receiver_service_ip" {
  value = kubernetes_service.receiver_service.status.load_balancer.ingress[0].ip
}
