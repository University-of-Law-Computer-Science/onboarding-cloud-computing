export const LABS = [
  { id: "01-virtualisation", title: "Lab 1: Virtualisation" },
  { id: "02-containers", title: "Lab 2: Containers" },
  { id: "03-cloud-models", title: "Lab 3: Cloud Models" },
  { id: "04-architecture", title: "Lab 4: Architecture" },
  { id: "05-distributed-systems", title: "Lab 5: Distributed Systems" },
  { id: "06-consistency", title: "Lab 6: Consistency" },
  { id: "07-microservices", title: "Lab 7: Microservices" },
  { id: "08-kubernetes", title: "Lab 8: Kubernetes" },
  { id: "09-cicd", title: "Lab 9: CI/CD" },
  { id: "10-observability", title: "Lab 10: Observability" },
];

export type LabId = typeof LABS[number]["id"];
