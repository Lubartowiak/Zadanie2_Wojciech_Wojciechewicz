# Zadanie2_Wojciech_Wojciechewwwicz

## Opis projektu
Projekt przedstawia przykładową aplikację full-stack zrealizowaną w stacku MEAN
(MongoDB, Express, Angular, Node.js) i uruchomioną w środowisku
Kubernetes (Minikube).

Aplikacja nosi nazwę BrilliantTasks i jest prostą aplikacją typu TODO:
- frontend (Angular) umożliwia dodawanie, usuwanie oraz oznaczanie zadań jako wykonane,
- backend (Node.js + Express) udostępnia REST API pod ścieżką `/api`,
- MongoDB przechowuje dane zadań w bazie danych.

Aplikacja jest dostępna z zewnątrz klastra pod adresem:
http://brilliantapp.zad/

Dostęp zrealizowany jest przy użyciu **Ingress Controller (nginx)**.

---

## Wybrany stack
Wybrany stack z Popular Stacks:
- MongoDB – baza danych (StatefulSet + PersistentVolumeClaim)
- Express + Node.js – backend REST API
- Angular – frontend SPA
- Nginx Ingress – wystawienie aplikacji na zewnątrz klastra

---

## Architektura rozwiązania
Aplikacja została wdrożona jako zestaw mikro-usług w klastrze Kubernetes:

- MongoDB uruchomione jako **StatefulSet** z trwałym wolumenem (PVC),
- Backend (`brilliant-api`) uruchomiony jako **Deployment**,
- Frontend (`brilliant-web`) uruchomiony jako **Deployment**,
- Komunikacja wewnętrzna realizowana przez **Service (ClusterIP)**,
- Dostęp zewnętrzny przez **Ingress** z hostem `brilliantapp.zad`,
- Konfiguracja backendu przekazywana przez **ConfigMap**,
- Dane wrażliwe (hasło do MongoDB) przechowywane w **Secret**.
