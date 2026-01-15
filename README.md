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

## 6. Testy poprawności działania
Test API
```
curl http://brilliantapp.zad/api/health

curl -X POST http://brilliantapp.zad/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Testowe zadanie"}'

curl http://brilliantapp.zad/api/tasks
```
<img width="1349" height="708" alt="Zrzut ekranu 2026-01-14 181958" src="https://github.com/user-attachments/assets/742e3843-be41-4b29-a8f6-7f1838955e83" />

## 7. Test interfejsu użytkownika

W przeglądarce internetowej:
```
http://brilliantapp.zad
```
<img width="855" height="401" alt="Zrzut ekranu 2026-01-14 181420" src="https://github.com/user-attachments/assets/be187ca8-df59-4024-9a15-01c0da50e833" />

# Część nieobowiązkowa – rolling update

# 1. Zmiany widoczne po aktualizacji
W ramach aktualizacji wdrożono nową wersję aplikacji (tag obrazów `1.1`):
- Backend: dodano endpoint `GET /api/version` zwracający wersję aplikacji (`{"version":"1.1"}`).
- Frontend: w interfejsie widoczna jest wersja aplikacji (np. w tytule `BrilliantTasks v1.1`).

# Weryfikacja poprawności aktualizacji:
- `curl http://brilliantapp.zad/api/version` zwraca `{"version":"1.1"}`
- aplikacja działa pod `http://brilliantapp.zad` bez przerw.

# 2. Zmiany w konfiguracji (Kubernetes)
Aby wykonać aktualizację bez przestoju zastosowano:
- zwiększenie liczby replik: `replicas: 2` dla `brilliant-api` oraz `brilliant-web`,
- strategię `RollingUpdate` z parametrami:
  - `maxUnavailable: 0`
  - `maxSurge: 1`
- zmianę tagów obrazów na `brilliant-api:1.1` oraz `brilliant-web:1.1`.

# 3. Ilustracja procesu aktualizacji i testy
Proces aktualizacji wykonano poprzez zastosowanie nowych manifestów i obserwację przebiegu:
- `kubectl rollout status deployment/brilliant-api -n brilliant`
- `kubectl rollout status deployment/brilliant-web -n brilliant`
- `kubectl get pods -n brilliant -w`
<img width="820" height="152" alt="Zrzut ekranu 2026-01-15 123647" src="https://github.com/user-attachments/assets/cffe54dd-1deb-43eb-b2c8-83b996690571" />
<img width="811" height="195" alt="Zrzut ekranu 2026-01-15 123542" src="https://github.com/user-attachments/assets/25b5d60e-3fbe-4d46-99bc-301c64ae5b4a" />

W trakcie rolling update uruchomiono cykliczny test dostępności:
- regularne zapytania HTTP do `http://brilliantapp.zad/api/health` zwracały kod `200` (brak przerwy w działaniu),
- `http://brilliantapp.zad/api/version` potwierdza wersję `1.1`.
<img width="827" height="685" alt="Zrzut ekranu 2026-01-15 123402" src="https://github.com/user-attachments/assets/87aeb0cb-400e-4af1-8b0f-4f112e49864b" />

## Bonus – sondy Kubernetes (startup/readiness/liveness)

W deploymentach użyto sond:
- `readinessProbe` (API: `/api/health`, WEB: `/`) – pod otrzymuje ruch dopiero po uzyskaniu gotowości, co zapewnia poprawny rolling update bez kierowania ruchu do niegotowych instancji.
- `livenessProbe` (API: `/api/health`, WEB: `/`) – wykrywa zawieszony proces i powoduje restart kontenera.
- `startupProbe` (API: `/api/health`) – pozwala aplikacji wystartować bez fałszywych restartów w trakcie inicjalizacji.

<img width="1218" height="713" alt="Zrzut ekranu 2026-01-15 123748" src="https://github.com/user-attachments/assets/0dfa32fc-5671-4e07-87be-e4244215aae1" />
<img width="1326" height="691" alt="Zrzut ekranu 2026-01-15 123858" src="https://github.com/user-attachments/assets/be41d857-4109-4f00-8af1-a4fa52a9b0ce" />
<img width="821" height="465" alt="Zrzut ekranu 2026-01-15 123921" src="https://github.com/user-attachments/assets/000309bc-83c0-4a8a-b9c5-17334ad79f86" />
<img width="650" height="285" alt="Zrzut ekranu 2026-01-15 123940" src="https://github.com/user-attachments/assets/5790e06e-436b-4503-aa28-4649887f6a8c" />
