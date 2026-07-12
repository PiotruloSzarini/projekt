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


