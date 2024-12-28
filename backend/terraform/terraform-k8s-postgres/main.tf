# Kubernetes provider (connection to the cluster)
provider "kubernetes" {
  config_path = "~/.kube/config" # Path to the kubeconfig file
}

# Referencing an existing Persistent Volume Claim (PVC) for PostgreSQL
resource "kubernetes_persistent_volume_claim" "postgres_pvc" {
  metadata {
    name = "postgres-storage" # Ensure this matches your existing PVC name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "10Gi"
      }
    }
  }

  # Ignore changes to PVC spec to avoid recreation of existing PVC
  lifecycle {
    ignore_changes = [
      spec # Ignore changes to PVC spec
    ]
  }
}

# PostgreSQL Deployment (using existing PVC)
resource "kubernetes_deployment" "postgres" {
  metadata {
    name = "postgres"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:latest"

          port {
            container_port = 5432
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgres_secrets.metadata[0].name
                key  = "PG_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgres_secrets.metadata[0].name
                key  = "PG_PASS"
              }
            }
          }

          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgres_secrets.metadata[0].name
                key  = "PG_DB"
              }
            }
          }

          volume_mount {
            mount_path = "/var/lib/postgresql/data"
            name       = "postgres-storage"
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = "postgres-storage" # Reference the existing PVC here
          }
        }
      }
    }
  }
}

# Service for PostgreSQL
resource "kubernetes_service" "postgres" {
  metadata {
    name = "postgres"
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}
