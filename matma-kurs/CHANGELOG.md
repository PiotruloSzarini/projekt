# Dziennik zmian (Changelog)

## Dodano
### 2026-07-09 - 2026-07-12
### Nowe serwisy (helpery) dla api, które mają na celu optymalizacje zapytań - z moich wstępnych obserwacji nastąpiła poprawa o okolo 50% tzn. treści ładują sie o połowę szybciej(w przypadku statusu mathdle jest to poprawa z 900ms-1100ms na 250ms-350ms więc jest nieźle)
- dodano services/courses.js(przeniesiona logika kursow tu, teraz api jest bardziej intuicyjne to jest chyba ta abstrakcja w programowaniu), services/mathdle.js (przeniesienie kilku funkcji do osobnego pliku i wywolywanie ich kiedy potrzeba zamiast wywolywania calego endpointa znacząco poprawilo czasy wczytywania)
- podobny case dla helperów avatar i session, pozbycie sie konieczności posiadania w kazdym pliku zbędnych linijek kodu tylko wywoływanie najwazniejszych funkcji
- uszczuplono API mathdle, courses, full-course-data, ranking, user, tasks

## Nadstepne kroki to
- wydzielić tasks service do osobnych helperów bo cala logika skladania zadan jest w kilku miejscach 

- route'y powininny tylko walidować requesty i wywoływać service.


---

## Dodano
### 2026-07-12 - 2026-07-18
### 
- usunięto funkcje "ensureTaskSortOrderColumn","ensureDailyCompletionTable" z kazdego API, przy kazdym zapytaniu dodatkowo i niepotrzebnie wywolywane byly ciezkie zapytania do bazy(tabela w bazie danych nie ma prawa sie zmienic w zaden sposob wiec po co to sprawdzac ciagle)
- zabezpieczenie wszystkich tras admina + przeniesienie api mathdle do prawidloewj lokalizacji (submit i today byly pod adminem)
- wspolne helpery dla taskow - ciag dalszy optymalizacji

---

## Dodano
### 2026-07-18 - 2026-07-18
### 

- teraz kursy sa pobierane tylko po sesji(cookie) a bylo po urlu, tak samo w profile
- dodany modul ratelimiter dla do send-code(limit po ip) i verify-code(limit po userid)
- w tych usatwieniach cookies brakowalo secure: true i  sameSite: 'lax', czyli byl brak https w produkcjiter i brak blokowaia cross site requests
- naprawiono w kazdym api wycieki dokladnych bledow, teraz tylko ogolnie 


## Dodano
### 2026-07-18 - 2026-07-...
### 
## teraz middleware.js czyli jeden z wazniejszych plikow, teraz jest bardzo ubogi i slabo zabezpieczony 
- 