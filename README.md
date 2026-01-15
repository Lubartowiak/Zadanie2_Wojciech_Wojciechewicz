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

Dostęp zrealizowany jest przy użyciu Ingress Controller (nginx).

## Wybrany stack
Wybrany stack z Popular Stacks:
- MongoDB – baza danych
- Express + Node.js – backend REST API
- Angular – frontend SPA
- Nginx Ingress – wystawienie aplikacji na zewnątrz klastra

## Architektura rozwiązania
Aplikacja została wdrożona jako zestaw mikro-usług w klastrze Kubernetes:

- MongoDB uruchomione jako **StatefulSet** z trwałym wolumenem (PVC),
- Backend (`brilliant-api`) uruchomiony jako **Deployment**,
- Frontend (`brilliant-web`) uruchomiony jako **Deployment**,
- Komunikacja wewnętrzna realizowana przez **Service (ClusterIP)**,
- Dostęp zewnętrzny przez **Ingress** z hostem `brilliantapp.zad`,
- Konfiguracja backendu przekazywana przez **ConfigMap**,
- Dane wrażliwe (hasło do MongoDB) przechowywane w **Secret**.

#Uruchomienie

---

## Uruchomienie aplikacji (Minikube)

## 1. Uruchomienie Minikube i Ingress
```
minikube start
minikube addons enable ingress
```
<img width="941" height="373" alt="Zrzut ekranu 2026-01-14 174441" src="https://github.com/user-attachments/assets/4c642ba4-1598-4c73-919d-4328c419165d" />

## 2. Konfiguracja DNS (plik hosts)
```
sudo sh -c 'echo "$(minikube ip) brilliantapp.zad" >> /etc/hosts'
```
## 3. Budowa obrazów Docker w środowisku Minikube
eval $(minikube docker-env)
```
docker build -t brilliant-api:1.0 ./api
docker build -t brilliant-web:1.0 ./web
```
<img width="947" height="138" alt="Zrzut ekranu 2026-01-14 174236" src="https://github.com/user-attachments/assets/e3c264a4-6364-4f7e-b091-7252d9092fe9" />

## 4. Wdrożenie do klastra Kubernetes
```
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/
```
<img width="716" height="334" alt="Zrzut ekranu 2026-01-14 174510" src="https://github.com/user-attachments/assets/d5e9af60-cbbe-4fb8-9e66-202c2d208bdf" />

## 5. Sprawdzenie stanu wdrożenia
```
kubectl get pods -n brilliant
kubectl get svc -n brilliant
kubectl get ingress -n brilliant
```
<img width="965" height="505" alt="Zrzut ekranu 2026-01-14 181920" src="https://github.com/user-attachments/assets/5719c485-3b5f-463c-bfe6-2e37f9fee9f7" />

## 6.Testy poprawności działania
Test API
```
curl http://brilliantapp.zad/api/health

curl -X POST http://brilliantapp.zad/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Testowe zadanie"}'

curl http://brilliantapp.zad/api/tasks
```
<img width="1349" height="708" alt="Zrzut ekranu 2026-01-14 181958" src="https://github.com/user-attachments/assets/742e3843-be41-4b29-a8f6-7f1838955e83" />

## 7.Test interfejsu użytkownika

W przeglądarce internetowej:
```
http://brilliantapp.zad
```
<img width="855" height="401" alt="Zrzut ekranu 2026-01-14 181420" src="https://github.com/user-attachments/assets/be187ca8-df59-4024-9a15-01c0da50e833" />

