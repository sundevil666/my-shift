import type { BusRoute } from 'src/models/app';

export const DHL_SCHEDULE_VALID_FROM = '2025-06-16';

export const dhlBusRoutes: BusRoute[] = [
  {
    "id": "route-1-a",
    "code": "1/A",
    "name": "Linka č. 1/A - Nitra -Čermáň - Klokočina - JLR",
    "stops": [
      {
        "id": "route-1-a-stop-1",
        "name": "Čermáň Kostolná",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-1-a-stop-2",
        "name": "Golianova gymnázium",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-1-a-stop-3",
        "name": "Edisonova",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      }
    ]
  },
  {
    "id": "route-1-a-1",
    "code": "1/A(1)",
    "name": "Linka č. 1/A (1) - Ubytovňa Prima - JLR",
    "stops": [
      {
        "id": "route-1-a-1-stop-1",
        "name": "Lidl Prima",
        "times": {
          "shift-1": "05:08",
          "shift-2": "13:08",
          "shift-3": "21:08"
        }
      }
    ]
  },
  {
    "id": "route-1-a-2",
    "code": "1/A(2)",
    "name": "Linka č. 1/A (2) - Výpomocný spoj - ubytovňa Prima - JLR",
    "stops": [
      {
        "id": "route-1-a-2-stop-1",
        "name": "Lidl Prima",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-1-a-3",
    "code": "1/A(3)",
    "name": "Linka č. 1/A (3) - Ubytovňa Prima - Párovce - Pod Zoborom - JLR",
    "stops": [
      {
        "id": "route-1-a-3-stop-1",
        "name": "Lidl Prima",
        "times": {
          "shift-1": "05:12",
          "shift-2": "13:12",
          "shift-3": "21:12"
        }
      },
      {
        "id": "route-1-a-3-stop-2",
        "name": "Predmostie",
        "times": {
          "shift-1": "05:19",
          "shift-2": "13:19",
          "shift-3": "21:19"
        }
      },
      {
        "id": "route-1-a-3-stop-3",
        "name": "Pod Zoborom",
        "times": {
          "shift-1": "05:21",
          "shift-2": "13:21",
          "shift-3": "21:21"
        }
      }
    ]
  },
  {
    "id": "route-1-a-4",
    "code": "1/A(4)",
    "name": "Linka č. 1/A (4) - VBC - Ďurkova - DAB - JLR",
    "stops": [
      {
        "id": "route-1-a-4-stop-1",
        "name": "VBC",
        "times": {
          "shift-1": "05:13",
          "shift-2": "13:13",
          "shift-3": "21:13"
        }
      },
      {
        "id": "route-1-a-4-stop-2",
        "name": "Ďurkova",
        "times": {
          "shift-1": "05:15",
          "shift-2": "13:15",
          "shift-3": "21:15"
        }
      },
      {
        "id": "route-1-a-4-stop-3",
        "name": "DAB",
        "times": {
          "shift-1": "05:17",
          "shift-2": "13:17",
          "shift-3": "21:17"
        }
      }
    ]
  },
  {
    "id": "route-1-b",
    "code": "1/B",
    "name": "Linka č.1/B - Chrenová Nitra - JLR",
    "stops": [
      {
        "id": "route-1-b-stop-1",
        "name": "OC Centro",
        "times": {
          "shift-1": "05:16",
          "shift-2": "13:16",
          "shift-3": "21:16"
        }
      },
      {
        "id": "route-1-b-stop-2",
        "name": "Chrenovská - cintorín",
        "times": {
          "shift-1": "05:18",
          "shift-2": "13:18",
          "shift-3": "21:18"
        }
      }
    ]
  },
  {
    "id": "route-1-c",
    "code": "1/C",
    "name": "Linka č.1/C - Nitra, želez.stanica - OC Mlyny - JLR",
    "stops": [
      {
        "id": "route-1-c-stop-1",
        "name": "Železničná stanica",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      },
      {
        "id": "route-1-c-stop-2",
        "name": "OC Mlyny",
        "times": {
          "shift-1": "05:13",
          "shift-2": "13:13",
          "shift-3": "21:13"
        }
      }
    ]
  },
  {
    "id": "route-1-d",
    "code": "1/D",
    "name": "Linka č.1/D - Murániho- Kmeťova - Bizetova - JLR",
    "stops": [
      {
        "id": "route-1-d-stop-1",
        "name": "Murániho",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-1-d-stop-2",
        "name": "Kmeťova",
        "times": {
          "shift-1": "05:08",
          "shift-2": "13:08",
          "shift-3": "21:08"
        }
      },
      {
        "id": "route-1-d-stop-3",
        "name": "Bizetova",
        "times": {
          "shift-1": "05:09",
          "shift-2": "13:09",
          "shift-3": "21:09"
        }
      }
    ]
  },
  {
    "id": "route-1-e",
    "code": "1/E",
    "name": "Linka č. 1/E - Jarok - Párovské Háje - Jarocká - Lukov Dvor - JLR",
    "stops": [
      {
        "id": "route-1-e-stop-1",
        "name": "Jarok - Cigánka",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-1-e-stop-2",
        "name": "Jarok- Obecný úrad",
        "times": {
          "shift-1": "04:53",
          "shift-2": "12:53",
          "shift-3": "20:53"
        }
      },
      {
        "id": "route-1-e-stop-3",
        "name": "Jarok- ZŠ",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      },
      {
        "id": "route-1-e-stop-4",
        "name": "Jarok-Kandeliska",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-1-e-stop-5",
        "name": "Jarok-Pod lesom",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-1-e-stop-6",
        "name": "Jarocká cesta",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-1-e-stop-7",
        "name": "Lukov dvor",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-1-e-stop-8",
        "name": "Nitra -Čajkovského",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      },
      {
        "id": "route-1-e-stop-9",
        "name": "Lidl Prima",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-1-e-stop-10",
        "name": "Nitra -Štúrova ul. A odvoz z JLR zast.Braneckého",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-2",
    "code": "2",
    "name": "Linka č. 2 - Trnava - Vlčkovce - Dolná Streda - Sereď - Šintava - Šoporňa - JLR",
    "stops": [
      {
        "id": "route-2-stop-1",
        "name": "Trnava- Prednádražná II-Botanická",
        "times": {
          "shift-1": "04:17",
          "shift-2": "12:17",
          "shift-3": "20:17"
        }
      },
      {
        "id": "route-2-stop-2",
        "name": "Trnava-Študentská-ZŠ",
        "times": {
          "shift-1": "04:19",
          "shift-2": "12:19",
          "shift-3": "20:19"
        }
      },
      {
        "id": "route-2-stop-3",
        "name": "Trnava Train station",
        "times": {
          "shift-1": "04:21",
          "shift-2": "12:21",
          "shift-3": "20:21"
        }
      },
      {
        "id": "route-2-stop-4",
        "name": "Trnava Arena shopping city",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:26",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-2-stop-5",
        "name": "Modranka-pošta",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-2-stop-6",
        "name": "Vlčkovce otoč autobusov",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-2-stop-7",
        "name": "Vlčkovce cukrovar",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:42",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-2-stop-8",
        "name": "Dolná Streda - pošta",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-2-stop-9",
        "name": "Sereď Progres",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-2-stop-10",
        "name": "Sereď AS",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-2-stop-11",
        "name": "Šintava mlyn",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-2-stop-12",
        "name": "Šoporňa Dipex",
        "times": {
          "shift-1": "05:06",
          "shift-2": "13:06",
          "shift-3": "21:06"
        }
      },
      {
        "id": "route-2-stop-13",
        "name": "Šoporňa námestie",
        "times": {
          "shift-1": "05:08",
          "shift-2": "13:08",
          "shift-3": "21:08"
        }
      }
    ]
  },
  {
    "id": "route-3-a",
    "code": "3/A",
    "name": "Linka č. 3/A - Drahovce - Madunice - Červeník - Leopoldov - Hlohovec - Sasinkovo - Kľačany - Rišňovce -Alekšince - JLR",
    "stops": [
      {
        "id": "route-3-a-stop-1",
        "name": "Drahovce, ZŠ",
        "times": {
          "shift-1": "04:05",
          "shift-2": "12:05",
          "shift-3": "20:05"
        }
      },
      {
        "id": "route-3-a-stop-2",
        "name": "Madunice, obec",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:10",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-3-a-stop-3",
        "name": "Červeník, rázc. nadjazd",
        "times": {
          "shift-1": "04:14",
          "shift-2": "12:14",
          "shift-3": "20:14"
        }
      },
      {
        "id": "route-3-a-stop-4",
        "name": "Žlkovce, obec",
        "times": {
          "shift-1": "04:18",
          "shift-2": "12:18",
          "shift-3": "20:18"
        }
      },
      {
        "id": "route-3-a-stop-5",
        "name": "Trakovice, čakáreň",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-3-a-stop-6",
        "name": "Leopoldov, Gojdičova ul. žel.st.",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-3-a-stop-7",
        "name": "Hlohovec, Šulekovo, ihrisko",
        "times": {
          "shift-1": "04:34",
          "shift-2": "12:34",
          "shift-3": "20:34"
        }
      },
      {
        "id": "route-3-a-stop-8",
        "name": "Hlohovec, SNP",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:41",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-3-a-stop-9",
        "name": "Sasinkovo, obchod",
        "times": {
          "shift-1": "04:51",
          "shift-2": "12:51",
          "shift-3": "20:51"
        }
      },
      {
        "id": "route-3-a-stop-10",
        "name": "Kľačany, žel.zast",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-3-a-stop-11",
        "name": "Rišňovce, rázc.Rumanová",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-3-a-stop-12",
        "name": "Rišňovce, domovina",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-3-a-stop-13",
        "name": "Alekšince, rázc.",
        "times": {
          "shift-1": "05:04",
          "shift-2": "13:04",
          "shift-3": "21:04"
        }
      },
      {
        "id": "route-3-a-stop-14",
        "name": "Lužianky, Xawax",
        "times": {
          "shift-1": "05:12",
          "shift-2": "13:12",
          "shift-3": "21:12"
        }
      },
      {
        "id": "route-3-a-stop-15",
        "name": "Nitra, Rastislavova, VONA",
        "times": {
          "shift-1": "05:15",
          "shift-2": "13:15",
          "shift-3": "21:15"
        }
      }
    ]
  },
  {
    "id": "route-3-b",
    "code": "3/B",
    "name": "Linka č. 3/B -Piešťany -Sokolovce - Koplotovce - Pastuchov - Lukáčovce - Alekšince -Lužianky -JLR",
    "stops": [
      {
        "id": "route-3-b-stop-1",
        "name": "Piešťany, AS",
        "times": {
          "shift-1": "04:05",
          "shift-2": "12:05",
          "shift-3": "20:05"
        }
      },
      {
        "id": "route-3-b-stop-2",
        "name": "Piešťany, nákup.str. Kocka",
        "times": {
          "shift-1": "04:07",
          "shift-2": "12:07",
          "shift-3": "20:07"
        }
      },
      {
        "id": "route-3-b-stop-3",
        "name": "Piešťany, Adam Trajan čerp.st.",
        "times": {
          "shift-1": "04:09",
          "shift-2": "12:09",
          "shift-3": "20:09"
        }
      },
      {
        "id": "route-3-b-stop-4",
        "name": "Piešťany, ObÚ Juh",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:10",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-3-b-stop-5",
        "name": "Piešťany, Vajanského nám",
        "times": {
          "shift-1": "04:12",
          "shift-2": "12:12",
          "shift-3": "20:12"
        }
      },
      {
        "id": "route-3-b-stop-6",
        "name": "Sokolovce, OcÚ",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-3-b-stop-7",
        "name": "Jalšové, obec",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-3-b-stop-8",
        "name": "Koplotovce, horný koniec",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:27",
          "shift-3": "20:27"
        }
      },
      {
        "id": "route-3-b-stop-9",
        "name": "Koplotovce, obec",
        "times": {
          "shift-1": "04:28",
          "shift-2": "12:28",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-3-b-stop-10",
        "name": "Pastuchov, cintorín",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-3-b-stop-11",
        "name": "Pastuchov, obchod",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:41",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-3-b-stop-12",
        "name": "Lukáčovce, kaštiel",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-3-b-stop-13",
        "name": "Lukáčovce, OcÚ",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:50",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-3-b-stop-14",
        "name": "Alekšince, kostol",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-3-b-stop-15",
        "name": "Alekšince, obchod",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-3-b-stop-16",
        "name": "Zbehy, Ťapušík",
        "times": {
          "shift-1": "05:04",
          "shift-2": "13:04",
          "shift-3": "21:04"
        }
      },
      {
        "id": "route-3-b-stop-17",
        "name": "Lužianky, žel.st.",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-3-b-stop-18",
        "name": "Lužianky, ZŠ",
        "times": {
          "shift-1": "05:08",
          "shift-2": "13:08",
          "shift-3": "21:08"
        }
      },
      {
        "id": "route-3-b-stop-19",
        "name": "Lužianky, Korytovská",
        "times": {
          "shift-1": "05:09",
          "shift-2": "13:09",
          "shift-3": "21:09"
        }
      },
      {
        "id": "route-3-b-stop-20",
        "name": "Lužianky, Rastislavova",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      },
      {
        "id": "route-3-b-stop-21",
        "name": "Lužianky, Vinárska",
        "times": {
          "shift-1": "05:12",
          "shift-2": "13:12",
          "shift-3": "21:12"
        }
      },
      {
        "id": "route-3-b-stop-22",
        "name": "Lužianky, Xawax",
        "times": {
          "shift-1": "05:13",
          "shift-2": "13:13",
          "shift-3": "21:13"
        }
      }
    ]
  },
  {
    "id": "route-4-a",
    "code": "4/A",
    "name": "Linka č. 4/A - Ješková Ves - Klátova N.Ves - Bošany - Krnča - Solčany - N.Streda - Čeľadince - Kovarce - Oponice - H.Lefantovce - D.Lefantovce - Bádice - Dražovce - JLR",
    "stops": [
      {
        "id": "route-4-a-stop-1",
        "name": "Ješková Ves",
        "times": {
          "shift-1": "04:19",
          "shift-2": "12:19",
          "shift-3": "20:19"
        }
      },
      {
        "id": "route-4-a-stop-2",
        "name": "Klátova Nová Ves-križovatka",
        "times": {
          "shift-1": "04:23",
          "shift-2": "12:23",
          "shift-3": "20:23"
        }
      },
      {
        "id": "route-4-a-stop-3",
        "name": "Klatová Ves-Orim",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-4-a-stop-4",
        "name": "Bošany - DOVAL",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-4-a-stop-5",
        "name": "Bošany -Š.M.",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:31",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-4-a-stop-6",
        "name": "Bošany -Baštín",
        "times": {
          "shift-1": "04:33",
          "shift-2": "12:33",
          "shift-3": "20:33"
        }
      },
      {
        "id": "route-4-a-stop-7",
        "name": "Krnča-polesie",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-4-a-stop-8",
        "name": "Krnča-kult.dom",
        "times": {
          "shift-1": "04:37",
          "shift-2": "12:37",
          "shift-3": "20:37"
        }
      },
      {
        "id": "route-4-a-stop-9",
        "name": "Krnča - námestie",
        "times": {
          "shift-1": "04:38",
          "shift-2": "12:38",
          "shift-3": "20:38"
        }
      },
      {
        "id": "route-4-a-stop-10",
        "name": "Solčany - kostol",
        "times": {
          "shift-1": "04:44",
          "shift-2": "12:44",
          "shift-3": "20:44"
        }
      },
      {
        "id": "route-4-a-stop-11",
        "name": "Solčany - ZŠ",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-4-a-stop-12",
        "name": "Solčany-Lišňa",
        "times": {
          "shift-1": "04:46",
          "shift-2": "12:46",
          "shift-3": "20:46"
        }
      },
      {
        "id": "route-4-a-stop-13",
        "name": "Nitrianska Streda - rázc.",
        "times": {
          "shift-1": "04:47",
          "shift-2": "12:47",
          "shift-3": "20:47"
        }
      },
      {
        "id": "route-4-a-stop-14",
        "name": "Nitrianska Streda - Ivanič",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-4-a-stop-15",
        "name": "Čeľadince-krčma",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-4-a-stop-16",
        "name": "Kovarce -pizzeria",
        "times": {
          "shift-1": "04:51",
          "shift-2": "12:51",
          "shift-3": "20:51"
        }
      },
      {
        "id": "route-4-a-stop-17",
        "name": "Kovarce -Domovina",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-4-a-stop-18",
        "name": "Oponice- rázcestie",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      },
      {
        "id": "route-4-a-stop-19",
        "name": "Súlovce - obecný úrad",
        "times": {
          "shift-1": "04:57",
          "shift-2": "12:57",
          "shift-3": "20:57"
        }
      },
      {
        "id": "route-4-a-stop-20",
        "name": "Oponice- kostol",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-4-a-stop-21",
        "name": "H.Lefantovce-Park",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-4-a-stop-22",
        "name": "D.Lefantovce - obecný úrad",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      },
      {
        "id": "route-4-a-stop-23",
        "name": "Bádice - rázcestie",
        "times": {
          "shift-1": "05:15",
          "shift-2": "13:15",
          "shift-3": "21:15"
        }
      },
      {
        "id": "route-4-a-stop-24",
        "name": "Dražovce - pri kríži",
        "times": {
          "shift-1": "05:25",
          "shift-2": "13:25",
          "shift-3": "21:25"
        }
      }
    ]
  },
  {
    "id": "route-4-b",
    "code": "4/B",
    "name": "Linka č. 4/B - Šípok - Partizánske - Žabokreky - Chynorany - Rajčany - Horné Chlebany - Krušovce - JLR",
    "stops": [
      {
        "id": "route-4-b-stop-1",
        "name": "Šípok - Jednota",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-4-b-stop-2",
        "name": "Partizánske - OMV",
        "times": {
          "shift-1": "04:23",
          "shift-2": "12:23",
          "shift-3": "20:23"
        }
      },
      {
        "id": "route-4-b-stop-3",
        "name": "Partizánske - Tesco",
        "times": {
          "shift-1": "04:28",
          "shift-2": "12:28",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-4-b-stop-4",
        "name": "Žabokreky-kostol",
        "times": {
          "shift-1": "04:33",
          "shift-2": "12:33",
          "shift-3": "20:33"
        }
      },
      {
        "id": "route-4-b-stop-5",
        "name": "Chynorany-pekáreň",
        "times": {
          "shift-1": "04:37",
          "shift-2": "12:37",
          "shift-3": "20:37"
        }
      },
      {
        "id": "route-4-b-stop-6",
        "name": "Chynorany - Železničná stanica",
        "times": {
          "shift-1": "04:38",
          "shift-2": "12:38",
          "shift-3": "20:38"
        }
      },
      {
        "id": "route-4-b-stop-7",
        "name": "Rajčany - Jednota",
        "times": {
          "shift-1": "04:44",
          "shift-2": "12:44",
          "shift-3": "20:44"
        }
      },
      {
        "id": "route-4-b-stop-8",
        "name": "Horné Chlebany-Kultúrny dom",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-4-b-stop-9",
        "name": "Krušovce -ZŠ",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-4-b-stop-10",
        "name": "Krušovce-rod.dom 305",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      }
    ]
  },
  {
    "id": "route-4-c",
    "code": "4/C",
    "name": "Linka č. 4/C - Topoľčany - Preseľany - Hrušovany- Koniarovce - Čakajovce - JLR",
    "stops": [
      {
        "id": "route-4-c-stop-1",
        "name": "Topoľčany - daňový úrad",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-4-c-stop-2",
        "name": "Topoľčany - Nemocnica",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-4-c-stop-3",
        "name": "Preselany -RD",
        "times": {
          "shift-1": "05:01",
          "shift-2": "13:01",
          "shift-3": "21:01"
        }
      },
      {
        "id": "route-4-c-stop-4",
        "name": "Preselany-ZŠ",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-4-c-stop-5",
        "name": "Hrušovany-Topolčianska",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-4-c-stop-6",
        "name": "Koniarovce-RD",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      },
      {
        "id": "route-4-c-stop-7",
        "name": "Výčapy Opatovce I.",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-4-c-stop-8",
        "name": "Výčapy Opatovce IV.",
        "times": {
          "shift-1": "05:09",
          "shift-2": "13:09",
          "shift-3": "21:09"
        }
      },
      {
        "id": "route-4-c-stop-9",
        "name": "Jelšovce-Pohostinstvo",
        "times": {
          "shift-1": "05:12",
          "shift-2": "13:12",
          "shift-3": "21:12"
        }
      },
      {
        "id": "route-4-c-stop-10",
        "name": "Čakajovce -RD",
        "times": {
          "shift-1": "05:14",
          "shift-2": "13:14",
          "shift-3": "21:14"
        }
      }
    ]
  },
  {
    "id": "route-4-d",
    "code": "4/D",
    "name": "Linka č. 4/D - Topoľčany - Chrabrany - Ludanice - Dvorany - Mýtna N.Ves - Kamanová - JLR",
    "stops": [
      {
        "id": "route-4-d-stop-1",
        "name": "Topoľčany - Lidl,sídlisko východ",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-4-d-stop-2",
        "name": "Topoľčany- dom kultúry",
        "times": {
          "shift-1": "04:46",
          "shift-2": "12:46",
          "shift-3": "20:46"
        }
      },
      {
        "id": "route-4-d-stop-3",
        "name": "Topolčany-Továrnícká",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-4-d-stop-4",
        "name": "Topolčany-Baránok",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-4-d-stop-5",
        "name": "Chrabrany-jednota",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-4-d-stop-6",
        "name": "Ludanice-rázcestiek železnici",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:58",
          "shift-3": "20:58"
        }
      },
      {
        "id": "route-4-d-stop-7",
        "name": "Ludanice ZŠ",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-4-d-stop-8",
        "name": "Dvorany nad Nitrou-rázcestie",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-4-d-stop-9",
        "name": "Mýtna nová Ves-Dolinky",
        "times": {
          "shift-1": "05:01",
          "shift-2": "13:01",
          "shift-3": "21:01"
        }
      },
      {
        "id": "route-4-d-stop-10",
        "name": "Kamanová - Obecný úrad",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-4-d-stop-11",
        "name": "Kamanová - rázcestie k žel. Stanici",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      }
    ]
  },
  {
    "id": "route-5-a",
    "code": "5/A",
    "name": "Linka č. 5/A - V.Kozmálovce - Tlmače - Kozárovce - H.Beňadik - T.Nemce - Čaradice - Volkovce - Čierne Kľačany - Zl.Moravce - JLR",
    "stops": [
      {
        "id": "route-5-a-stop-1",
        "name": "Velké Kozmálovce,horný koniec",
        "times": {
          "shift-1": "04:00",
          "shift-2": "12:00",
          "shift-3": "20:00"
        }
      },
      {
        "id": "route-5-a-stop-2",
        "name": "Tlmače, MsKS",
        "times": {
          "shift-1": "04:02",
          "shift-2": "12:02",
          "shift-3": "20:02"
        }
      },
      {
        "id": "route-5-a-stop-3",
        "name": "Tlmače, Lipník",
        "times": {
          "shift-1": "04:05",
          "shift-2": "12:05",
          "shift-3": "20:05"
        }
      },
      {
        "id": "route-5-a-stop-4",
        "name": "Kozárovce,žel.stanica",
        "times": {
          "shift-1": "04:08",
          "shift-2": "12:08",
          "shift-3": "20:08"
        }
      },
      {
        "id": "route-5-a-stop-5",
        "name": "Hronský Beňadik, nám.",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-5-a-stop-6",
        "name": "Hronský Beňadik, Skokan",
        "times": {
          "shift-1": "04:16",
          "shift-2": "12:16",
          "shift-3": "20:16"
        }
      },
      {
        "id": "route-5-a-stop-7",
        "name": "Tek. Nemce, Maňúch",
        "times": {
          "shift-1": "04:19",
          "shift-2": "12:19",
          "shift-3": "20:19"
        }
      },
      {
        "id": "route-5-a-stop-8",
        "name": "Čaradice,OcÚ",
        "times": {
          "shift-1": "04:21",
          "shift-2": "12:21",
          "shift-3": "20:21"
        }
      },
      {
        "id": "route-5-a-stop-9",
        "name": "Volkovce,osada (smer Volkovce)",
        "times": {
          "shift-1": "04:23",
          "shift-2": "12:23",
          "shift-3": "20:23"
        }
      },
      {
        "id": "route-5-a-stop-10",
        "name": "Čierne Kľačany, rázc.Volkovce",
        "times": {
          "shift-1": "04:28",
          "shift-2": "12:28",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-5-a-stop-11",
        "name": "Čierne Kľačany, Jednota",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-5-a-stop-12",
        "name": "Prílepy, Jednota MHD",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-5-a-stop-13",
        "name": "Zlaté Moravce,MsÚ",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-5-a-stop-14",
        "name": "Zlaté Moravce, AS",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      }
    ]
  },
  {
    "id": "route-5-b",
    "code": "5/B",
    "name": "Linka č. 5/B - Nová Ves n/Ž - Slepčany - Tes.Mlyňany - Choča - V.Chrášťany - Beladice - Čeladice - Hosťová - Dolné Obdokovce - Pohranice - Štitáre II - Nitrianske Hrnčiarovce - Nitra Moskovská - JLR",
    "stops": [
      {
        "id": "route-5-b-stop-1",
        "name": "Nová Ves nad Žitavou, ZŠ.",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:10",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-5-b-stop-2",
        "name": "Slepčany, kult.dom (KOSTOL)",
        "times": {
          "shift-1": "04:18",
          "shift-2": "12:13",
          "shift-3": "20:13"
        }
      },
      {
        "id": "route-5-b-stop-3",
        "name": "Slepčany, funduše",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-5-b-stop-4",
        "name": "Tes.Mlyňany, kostol",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-5-b-stop-5",
        "name": "Choča, kult.dom",
        "times": {
          "shift-1": "04:33",
          "shift-2": "12:28",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-5-b-stop-6",
        "name": "Veľké Chrášťany, rázcestie",
        "times": {
          "shift-1": "04:37",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-5-b-stop-7",
        "name": "Beladice, SOUP",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:35",
          "shift-3": "20:35"
        }
      },
      {
        "id": "route-5-b-stop-8",
        "name": "Čeladice, Jednota",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:43",
          "shift-3": "20:43"
        }
      },
      {
        "id": "route-5-b-stop-9",
        "name": "Hosťová",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:47",
          "shift-3": "20:47"
        }
      },
      {
        "id": "route-5-b-stop-10",
        "name": "Dolné Obdokovce",
        "times": {
          "shift-1": "05:00",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-5-b-stop-11",
        "name": "Pohranice, Jednota",
        "times": {
          "shift-1": "05:04",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-5-b-stop-12",
        "name": "Štitáre II",
        "times": {
          "shift-1": "05:08",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-5-b-stop-13",
        "name": "Nitrianske Hrnčiarovce, ZŠ",
        "times": {
          "shift-1": "05:13",
          "shift-2": "13:08",
          "shift-3": "21:08"
        }
      },
      {
        "id": "route-5-b-stop-14",
        "name": "Nitra, Moskovská",
        "times": {
          "shift-1": "05:15",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-5-c",
    "code": "5/C",
    "name": "Linka č. 5/C Lovce - Žikava - Machulince - Žitavany - Zlaté Moravce - Hosťovce - Martin n.Žitavou - Sľažany - Neverice - Jelenec - Žirany - Kolíňany - JLR",
    "stops": [
      {
        "id": "route-5-c-stop-1",
        "name": "Lovce,Jednota",
        "times": {
          "shift-1": "03:55",
          "shift-2": "11:50",
          "shift-3": "19:55"
        }
      },
      {
        "id": "route-5-c-stop-2",
        "name": "Žikava,Ocú",
        "times": {
          "shift-1": "03:58",
          "shift-2": "11:53",
          "shift-3": "19:58"
        }
      },
      {
        "id": "route-5-c-stop-3",
        "name": "Topolčianky-drogéria JASA",
        "times": {
          "shift-1": "04:05",
          "shift-2": "12:00",
          "shift-3": "20:05"
        }
      },
      {
        "id": "route-5-c-stop-4",
        "name": "Machulince,Jednota",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:05",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-5-c-stop-5",
        "name": "Žitavany, Jednota",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:10",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-5-c-stop-6",
        "name": "Zlaté Moravce,žel.stanica mesto/Vion/",
        "times": {
          "shift-1": "04:18",
          "shift-2": "12:13",
          "shift-3": "20:17"
        }
      },
      {
        "id": "route-5-c-stop-7",
        "name": "Zlaté Moravce, Danfoss (na znamenie)",
        "times": {
          "shift-1": "04:19",
          "shift-2": "12:14",
          "shift-3": "20:18"
        }
      },
      {
        "id": "route-5-c-stop-8",
        "name": "Zlaté Moravce,Továrenská ul.",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:15",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-5-c-stop-9",
        "name": "Zlaté Moravce,Centrum Žitava",
        "times": {
          "shift-1": "04:21",
          "shift-2": "12:16",
          "shift-3": "20:21"
        }
      },
      {
        "id": "route-5-c-stop-10",
        "name": "Zlaté Moravce,rázc.k žel.stanici",
        "times": {
          "shift-1": "04:22",
          "shift-2": "12:17",
          "shift-3": "20:22"
        }
      },
      {
        "id": "route-5-c-stop-11",
        "name": "Hosťovce, Oú",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:25",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-5-c-stop-12",
        "name": "Martin n.Žit., most",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:27",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-5-c-stop-13",
        "name": "Martin n.Žit., č.d. 70",
        "times": {
          "shift-1": "04:33",
          "shift-2": "12:28",
          "shift-3": "20:33"
        }
      },
      {
        "id": "route-5-c-stop-14",
        "name": "Sľažany, OcÚ",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:35",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-5-c-stop-15",
        "name": "Sľažany, RD",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:36",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-5-c-stop-16",
        "name": "Neverice, Jednota",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:40",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-5-c-stop-17",
        "name": "Jelenec,ZŠ",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:43",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-5-c-stop-18",
        "name": "Jelenec, Jednota",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:45",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-5-c-stop-19",
        "name": "Kolíňany, ZŠ",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:50",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-5-c-stop-20",
        "name": "ŽIRANY,č.d.280",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:53",
          "shift-3": "20:58"
        }
      },
      {
        "id": "route-5-c-stop-21",
        "name": "ŽIRANY,kostol",
        "times": {
          "shift-1": "05:00",
          "shift-2": "12:55",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-5-c-stop-22",
        "name": "Kolíňany, nadcestie",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:00",
          "shift-3": "21:03"
        }
      }
    ]
  },
  {
    "id": "route-6",
    "code": "6",
    "name": "Linka č. 6 - Levice - Horná Seč - Kalná n.Hronom - Čifáre - Telince - Vráble - Klasov - Babindol - Golianovo - Veľký Lapáš - JLR",
    "stops": [
      {
        "id": "route-6-stop-1",
        "name": "Levice, AS, nást.č.19",
        "times": {
          "shift-1": "04:00",
          "shift-2": "12:00",
          "shift-3": "20:00"
        }
      },
      {
        "id": "route-6-stop-2",
        "name": "Levice, Ku Bratke, Billa",
        "times": {
          "shift-1": "04:02",
          "shift-2": "12:02",
          "shift-3": "20:02"
        }
      },
      {
        "id": "route-6-stop-3",
        "name": "Levice, Saratovská,Rybníky II.",
        "times": {
          "shift-1": "04:03",
          "shift-2": "12:03",
          "shift-3": "20:03"
        }
      },
      {
        "id": "route-6-stop-4",
        "name": "Levice, sidl. Vinohrady",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:10",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-6-stop-5",
        "name": "Levice,Pri Podlužianke",
        "times": {
          "shift-1": "04:14",
          "shift-2": "12:14",
          "shift-3": "20:14"
        }
      },
      {
        "id": "route-6-stop-6",
        "name": "Levice,Tabaková",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-6-stop-7",
        "name": "Horná Seč, Jednota",
        "times": {
          "shift-1": "04:18",
          "shift-2": "12:18",
          "shift-3": "20:18"
        }
      },
      {
        "id": "route-6-stop-8",
        "name": "Kalná n Hronom,Jednota",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-6-stop-9",
        "name": "Velký Ďur,Rohožnica",
        "times": {
          "shift-1": "04:23",
          "shift-2": "12:23",
          "shift-3": "20:23"
        }
      },
      {
        "id": "route-6-stop-10",
        "name": "Velký Ďur,Horný Ďur",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-6-stop-11",
        "name": "Čifáre, Jednota",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-6-stop-12",
        "name": "Telince, Jednota",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-6-stop-13",
        "name": "Vráble, AS",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:42",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-6-stop-14",
        "name": "Vráble, Jednota",
        "times": {
          "shift-1": "04:44",
          "shift-2": "12:44",
          "shift-3": "20:44"
        }
      },
      {
        "id": "route-6-stop-15",
        "name": "Klasov, rázc.",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-6-stop-16",
        "name": "Klasov, Jednota",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:50",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-6-stop-17",
        "name": "Babindol, rázc.",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      },
      {
        "id": "route-6-stop-18",
        "name": "Golianovo, ZŠ",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-6-stop-19",
        "name": "Veľký Lapáš, RD",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-6-stop-20",
        "name": "Veľký Lapáš, Jednota",
        "times": {
          "shift-1": "05:01",
          "shift-2": "13:01",
          "shift-3": "21:01"
        }
      }
    ]
  },
  {
    "id": "route-7-b",
    "code": "7/B",
    "name": "Linka č. 7/B - Žiharec - Tešedíkovo - Diakovce - Šaľa - JLR",
    "stops": [
      {
        "id": "route-7-b-stop-1",
        "name": "Žiharec, OcÚ",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-7-b-stop-2",
        "name": "Žiharec, rázc.",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:26",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-7-b-stop-3",
        "name": "Tešedíkovo, rázc.",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-7-b-stop-4",
        "name": "Tešedíkovo, kostol",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:31",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-7-b-stop-5",
        "name": "Tešedíkovo, cint",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-7-b-stop-6",
        "name": "Diakovce, OcÚ",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-7-b-stop-7",
        "name": "Diakovce, cintorín",
        "times": {
          "shift-1": "04:37",
          "shift-2": "12:37",
          "shift-3": "20:37"
        }
      },
      {
        "id": "route-7-b-stop-8",
        "name": "Šaľa, Olympia",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:41",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-7-b-stop-9",
        "name": "Šaľa, Vlčianska",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:42",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-7-b-stop-10",
        "name": "Močenok, Hotel",
        "times": {
          "shift-1": "04:53",
          "shift-2": "12:53",
          "shift-3": "20:53"
        }
      },
      {
        "id": "route-7-b-stop-11",
        "name": "Močenok, Nitrianska",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      }
    ]
  },
  {
    "id": "route-8-a",
    "code": "8/A",
    "name": "Linka č. 8/A (8/1) - Kolárovo - Dedina Mládeže - Neded - Vlčany - Šaľa - JLR",
    "stops": [
      {
        "id": "route-8-a-stop-1",
        "name": "Kolárovo, a.s.",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:05",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-8-a-stop-2",
        "name": "Dedina Mládeže",
        "times": {
          "shift-1": "04:16",
          "shift-2": "12:11",
          "shift-3": "20:16"
        }
      },
      {
        "id": "route-8-a-stop-3",
        "name": "Neded OcÚ",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:19",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-8-a-stop-4",
        "name": "Neded, ZŠ",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:20",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-8-a-stop-5",
        "name": "Neded, obchod",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:21",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-8-a-stop-6",
        "name": "Vlčany,ZŠ",
        "times": {
          "shift-1": "04:28",
          "shift-2": "12:23",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-8-a-stop-7",
        "name": "Vlčany, Vináreň",
        "times": {
          "shift-1": "04:29",
          "shift-2": "12:24",
          "shift-3": "20:29"
        }
      },
      {
        "id": "route-8-a-stop-8",
        "name": "Vlčany, Rigó",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:25",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-8-a-stop-9",
        "name": "Vlčany Somola",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:26",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-8-a-stop-10",
        "name": "Šaľa, Pohotovostné sídl.",
        "times": {
          "shift-1": "04:46",
          "shift-2": "12:41",
          "shift-3": "20:46"
        }
      }
    ]
  },
  {
    "id": "route-8-b",
    "code": "8/B",
    "name": "Linka č. 8/B (8/2) - Bešeňov - Veľké Lovce - Radava - Hul - Úľany n/Ž - Mojzesovo - Černík - Nitra - JLR",
    "stops": [
      {
        "id": "route-8-b-stop-1",
        "name": "Bešeňov, Jednota",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-8-b-stop-2",
        "name": "Bešeňov, Kolónia",
        "times": {
          "shift-1": "04:16",
          "shift-2": "12:16",
          "shift-3": "20:16"
        }
      },
      {
        "id": "route-8-b-stop-3",
        "name": "Veľké Lovce, Jednota",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-8-b-stop-4",
        "name": "Veľké Lovce, nám.",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:26",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-8-b-stop-5",
        "name": "Radava, Jednota",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-8-b-stop-6",
        "name": "Úľany n/Žitavou, ZŠ",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-8-b-stop-7",
        "name": "Úľany n/Žitavou, č.d. 28",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-8-b-stop-8",
        "name": "Mojzesovo, OcÚ",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-8-b-stop-9",
        "name": "Černík Pošta",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-8-b-stop-10",
        "name": "Nitra, Gorazdova",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-8-c",
    "code": "8/C",
    "name": "Linka č. 8/C (8/3) -Ľudovítov - Palárikovo - Selice - Trnovec n/Váhom - Cabaj-Čápor - JLR",
    "stops": [
      {
        "id": "route-8-c-stop-1",
        "name": "Palárikovo, križovatka na Ľudovítov",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-8-c-stop-2",
        "name": "Palárikovo, Slahor kaštieľ",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:26",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-8-c-stop-3",
        "name": "Palárikovo, cint.",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:27",
          "shift-3": "20:27"
        }
      },
      {
        "id": "route-8-c-stop-4",
        "name": "Selice, Jednota",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-8-c-stop-5",
        "name": "Selice, kult. dom",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-8-c-stop-6",
        "name": "Selice, rybník",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:41",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-8-c-stop-7",
        "name": "Trnovec n/V, Jednota",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:50",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-8-c-stop-8",
        "name": "Trnovec n/V Pošta",
        "times": {
          "shift-1": "04:51",
          "shift-2": "12:51",
          "shift-3": "20:51"
        }
      },
      {
        "id": "route-8-c-stop-9",
        "name": "Trnovec n/V, Nitrianska",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-8-c-stop-10",
        "name": "Cabaj - Čápor, Riegler",
        "times": {
          "shift-1": "05:00",
          "shift-2": "13:00",
          "shift-3": "21:00"
        }
      },
      {
        "id": "route-8-c-stop-11",
        "name": "Cabaj Čápor, Pereš",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-8-c-stop-12",
        "name": "Cabaj Čápor, rázc.",
        "times": {
          "shift-1": "05:07",
          "shift-2": "13:07",
          "shift-3": "21:07"
        }
      },
      {
        "id": "route-8-c-stop-13",
        "name": "Cabaj Čápor, Nový Cabaj",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-8-d",
    "code": "8/D",
    "name": "Linka č. 8/D (8/4) - Nové Zámky (pri Kríži) - Tvrdošovce - Jatov - Rastislavice - Poľný Kesov - V.Dolina - Mojmírovce - Svätoplukovo - Cabaj-Čápor - JLR",
    "stops": [
      {
        "id": "route-8-d-stop-1",
        "name": "Nové Zámky, Pri Kríži",
        "times": {
          "shift-1": "04:00",
          "shift-2": "12:00",
          "shift-3": "20:00"
        }
      },
      {
        "id": "route-8-d-stop-2",
        "name": "Tvrdošovce, Novozámocká",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-8-d-stop-3",
        "name": "Tvrdošovce, žel.st",
        "times": {
          "shift-1": "04:19",
          "shift-2": "12:19",
          "shift-3": "20:19"
        }
      },
      {
        "id": "route-8-d-stop-4",
        "name": "Tvrdošovce, VÚB",
        "times": {
          "shift-1": "04:22",
          "shift-2": "12:22",
          "shift-3": "20:22"
        }
      },
      {
        "id": "route-8-d-stop-5",
        "name": "Tvrdošovce,kamený most",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-8-d-stop-6",
        "name": "Jatov, rázc.",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:27",
          "shift-3": "20:27"
        }
      },
      {
        "id": "route-8-d-stop-7",
        "name": "Rastislavice, Jednota",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:31",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-8-d-stop-8",
        "name": "Rastislavice, ihrisko",
        "times": {
          "shift-1": "04:32",
          "shift-2": "12:32",
          "shift-3": "20:32"
        }
      },
      {
        "id": "route-8-d-stop-9",
        "name": "Poľný Kesov",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-8-d-stop-10",
        "name": "Veľká Dolina, bytovky",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-8-d-stop-11",
        "name": "Mojmírovce, OcÚ",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:50",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-8-d-stop-12",
        "name": "Svätoplukovo, Jednota",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-8-d-stop-13",
        "name": "Cabaj - Čápor, Domovina",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      }
    ]
  },
  {
    "id": "route-8-e",
    "code": "8/E",
    "name": "Linka č. 8/E (8/5) -Svätý Peter - Pribeta - Dvory n/Ž. - Dolný Ohaj - Veľký Cetín - Nitra (Bohúňova) - JLR",
    "stops": [
      {
        "id": "route-8-e-stop-1",
        "name": "Svätý Peter, Mlyn",
        "times": {
          "shift-1": "03:55",
          "shift-2": "11:55",
          "shift-3": "19:55"
        }
      },
      {
        "id": "route-8-e-stop-2",
        "name": "Dulovce, cintorín",
        "times": {
          "shift-1": "03:58",
          "shift-2": "11:58",
          "shift-3": "19:58"
        }
      },
      {
        "id": "route-8-e-stop-3",
        "name": "Pribeta, reformovaný kostol",
        "times": {
          "shift-1": "04:05",
          "shift-2": "12:05",
          "shift-3": "20:05"
        }
      },
      {
        "id": "route-8-e-stop-4",
        "name": "Pribeta, Kultúrny dom",
        "times": {
          "shift-1": "04:06",
          "shift-2": "12:06",
          "shift-3": "20:06"
        }
      },
      {
        "id": "route-8-e-stop-5",
        "name": "Pribeta, katolícky kostol",
        "times": {
          "shift-1": "04:07",
          "shift-2": "12:07",
          "shift-3": "20:07"
        }
      },
      {
        "id": "route-8-e-stop-6",
        "name": "Chrasť, ŠM rázc.",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:10",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-8-e-stop-7",
        "name": "Dvory nad Žitavou, Mlynské námestie",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-8-e-stop-8",
        "name": "Dvory nad Žitavou, OcÚ",
        "times": {
          "shift-1": "04:23",
          "shift-2": "12:23",
          "shift-3": "20:23"
        }
      },
      {
        "id": "route-8-e-stop-9",
        "name": "Dvory nad Žitavou, st. cint.",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-8-e-stop-10",
        "name": "Dvory nad Žitavou, Dolný koniec",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:27",
          "shift-3": "20:27"
        }
      },
      {
        "id": "route-8-e-stop-11",
        "name": "Dolný Ohaj, Vrštek",
        "times": {
          "shift-1": "04:34",
          "shift-2": "12:34",
          "shift-3": "20:34"
        }
      },
      {
        "id": "route-8-e-stop-12",
        "name": "Dolný Ohaj, Centrum",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-8-e-stop-13",
        "name": "Dolný Ohaj, rázc.",
        "times": {
          "shift-1": "04:38",
          "shift-2": "12:38",
          "shift-3": "20:38"
        }
      },
      {
        "id": "route-8-e-stop-14",
        "name": "Veľký Cetín, rázc.",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-8-e-stop-15",
        "name": "Veľký Cetín, Mlyn",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:58",
          "shift-3": "20:58"
        }
      },
      {
        "id": "route-8-e-stop-16",
        "name": "Nitra, Bohúňova",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-8-f",
    "code": "8/F",
    "name": "Linka č. 8/F (8/6) - Nesvady - Nové Zámky - Branč - Dolné Krškany - JLR",
    "stops": [
      {
        "id": "route-8-f-stop-1",
        "name": "Nesvady, ZŠ",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:10",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-8-f-stop-2",
        "name": "Nové Zámky, Stará nemocnica",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:20",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-8-f-stop-3",
        "name": "Nové Zámky, A.S.",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:25",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-8-f-stop-4",
        "name": "Branč, kult. dom",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:50",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-8-f-stop-5",
        "name": "Branč, cintorín",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:51",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-8-f-stop-6",
        "name": "Branč, Arkuš",
        "times": {
          "shift-1": "04:57",
          "shift-2": "12:52",
          "shift-3": "20:57"
        }
      },
      {
        "id": "route-8-f-stop-7",
        "name": "Dolné Krškany, ZŠ",
        "times": {
          "shift-1": "05:03",
          "shift-2": "12:57",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-8-f-stop-8",
        "name": "Dolné Krškany,Nitra Frost",
        "times": {
          "shift-1": "05:05",
          "shift-2": "12:59",
          "shift-3": "21:05"
        }
      }
    ]
  },
  {
    "id": "route-8-g",
    "code": "8/G",
    "name": "Linka č. 8/G (8/7) - Bánov - N.Hrádok - Kostolný Sek -Šurany - Lipová - Ondrochov - Ivanka p/N - JLR",
    "stops": [
      {
        "id": "route-8-g-stop-1",
        "name": "Bánov, RD",
        "times": {
          "shift-1": "04:17",
          "shift-2": "12:17",
          "shift-3": "20:17"
        }
      },
      {
        "id": "route-8-g-stop-2",
        "name": "Bánov, Jednota",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-8-g-stop-3",
        "name": "Bánov, osada",
        "times": {
          "shift-1": "04:21",
          "shift-2": "12:21",
          "shift-3": "20:21"
        }
      },
      {
        "id": "route-8-g-stop-4",
        "name": "Nitriansky Hrádok, Hlavná",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-8-g-stop-5",
        "name": "Šurany, VUB",
        "times": {
          "shift-1": "04:29",
          "shift-2": "12:29",
          "shift-3": "20:29"
        }
      },
      {
        "id": "route-8-g-stop-6",
        "name": "Šurany, MDZ",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-8-g-stop-7",
        "name": "Kostolný Sek, Kult. Dom",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:31",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-8-g-stop-8",
        "name": "Lipová, Kult. Dom",
        "times": {
          "shift-1": "04:34",
          "shift-2": "12:34",
          "shift-3": "20:34"
        }
      },
      {
        "id": "route-8-g-stop-9",
        "name": "Ondrochov, zast. v dedine",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-8-g-stop-10",
        "name": "Ivánka pri Nitre, Luk",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      },
      {
        "id": "route-8-g-stop-11",
        "name": "Ivánka pri Nitre, Kult. Dom",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-8-g-stop-12",
        "name": "Dol. Krškany, zast. Záborského pri ubyt. Jasplastik",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      }
    ]
  },
  {
    "id": "route-8-i",
    "code": "8/I",
    "name": "Linka č. 8/I (8/9) - Komjatice - Veľký Kýr - Dolné Krškany - JLR",
    "stops": [
      {
        "id": "route-8-i-stop-1",
        "name": "Komjatice, Hotel",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:35",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-8-i-stop-2",
        "name": "Komjatice, Nám. A. Cabana",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:36",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-8-i-stop-3",
        "name": "Komjatice, Nitrianska",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:37",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-8-i-stop-4",
        "name": "Komjatice, Fučíkova",
        "times": {
          "shift-1": "04:43",
          "shift-2": "12:38",
          "shift-3": "20:43"
        }
      },
      {
        "id": "route-8-i-stop-5",
        "name": "Veľký Kýr, č domu 600",
        "times": {
          "shift-1": "04:44",
          "shift-2": "12:39",
          "shift-3": "20:44"
        }
      },
      {
        "id": "route-8-i-stop-6",
        "name": "Veľký Kýr, rázc.",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:40",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-8-i-stop-7",
        "name": "Dolné Krškany,Nitra Frost",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:53",
          "shift-3": "20:58"
        }
      }
    ]
  },
  {
    "id": "route-8-j",
    "code": "8/J",
    "name": "Linka č. 8/J (8/10) - Komjatice - Černík - Vinodol - M.Cetín - Čechynce - Janíkovce -Chrenovský cint. - JLR",
    "stops": [
      {
        "id": "route-8-j-stop-1",
        "name": "Komjatice, Tesco",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-8-j-stop-2",
        "name": "Komjatice, osada",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:42",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-8-j-stop-3",
        "name": "Černík, Vrštek",
        "times": {
          "shift-1": "04:47",
          "shift-2": "12:47",
          "shift-3": "20:47"
        }
      },
      {
        "id": "route-8-j-stop-4",
        "name": "Černík, Zdravot. Stredisko",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-8-j-stop-5",
        "name": "Vinodol, Dolný Vinodol, dol. koniec",
        "times": {
          "shift-1": "04:51",
          "shift-2": "12:51",
          "shift-3": "20:51"
        }
      },
      {
        "id": "route-8-j-stop-6",
        "name": "Vinodol, Dolný Vinodol, na Vršku",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-8-j-stop-7",
        "name": "Malý Cetín, RD",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-8-j-stop-8",
        "name": "Čechynce, ZŠ",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-8-j-stop-9",
        "name": "Čechynce, Osada",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-8-j-stop-10",
        "name": "Janíkovce, Mototechna",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      },
      {
        "id": "route-8-j-stop-11",
        "name": "Janíkovce, Slamkova",
        "times": {
          "shift-1": "05:06",
          "shift-2": "13:06",
          "shift-3": "21:06"
        }
      },
      {
        "id": "route-8-j-stop-12",
        "name": "Nitra Durčianskeho, Chrenová",
        "times": {
          "shift-1": "05:09",
          "shift-2": "13:09",
          "shift-3": "21:09"
        }
      },
      {
        "id": "route-8-j-stop-13",
        "name": "Nitra , Chrenovský cint.",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-8-k",
    "code": "8/K",
    "name": "Linka č. 8/K (8/11) - Bátorove Kosihy - Svodín - Gbelce - Strekov - Jasová - Šurany - Dolné Krškany - JLR",
    "stops": [
      {
        "id": "route-8-k-stop-1",
        "name": "Bátorove Kosihy, Pumpa",
        "times": {
          "shift-1": "03:25",
          "shift-2": "11:25",
          "shift-3": "19:25"
        }
      },
      {
        "id": "route-8-k-stop-2",
        "name": "Bátorove Kosihy, Hl. nám",
        "times": {
          "shift-1": "03:26",
          "shift-2": "11:26",
          "shift-3": "19:26"
        }
      },
      {
        "id": "route-8-k-stop-3",
        "name": "Bátorove Kosihy, Töröttö",
        "times": {
          "shift-1": "03:27",
          "shift-2": "11:27",
          "shift-3": "19:27"
        }
      },
      {
        "id": "route-8-k-stop-4",
        "name": "Bátorove Kosihy, Mikulášov sad",
        "times": {
          "shift-1": "03:29",
          "shift-2": "11:29",
          "shift-3": "19:29"
        }
      },
      {
        "id": "route-8-k-stop-5",
        "name": "Svodín, kostol",
        "times": {
          "shift-1": "03:45",
          "shift-2": "11:45",
          "shift-3": "19:45"
        }
      },
      {
        "id": "route-8-k-stop-6",
        "name": "Svodín, Maďarskosvodínska",
        "times": {
          "shift-1": "03:46",
          "shift-2": "11:46",
          "shift-3": "19:46"
        }
      },
      {
        "id": "route-8-k-stop-7",
        "name": "Gbelce, rázc. k žel. st.",
        "times": {
          "shift-1": "03:53",
          "shift-2": "11:53",
          "shift-3": "19:53"
        }
      },
      {
        "id": "route-8-k-stop-8",
        "name": "Strekov, rázc. k žel. st",
        "times": {
          "shift-1": "04:02",
          "shift-2": "12:02",
          "shift-3": "20:02"
        }
      },
      {
        "id": "route-8-k-stop-9",
        "name": "Strekov, kostol",
        "times": {
          "shift-1": "04:03",
          "shift-2": "12:03",
          "shift-3": "20:03"
        }
      },
      {
        "id": "route-8-k-stop-10",
        "name": "Jasová, rázcestie",
        "times": {
          "shift-1": "04:13",
          "shift-2": "12:13",
          "shift-3": "20:13"
        }
      },
      {
        "id": "route-8-k-stop-11",
        "name": "Strekov - Červený Majer - na znamenie",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-8-k-stop-12",
        "name": "Šurany, PTŠ",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-8-k-stop-13",
        "name": "Šurany, SEHWA",
        "times": {
          "shift-1": "04:42",
          "shift-2": "12:42",
          "shift-3": "20:42"
        }
      },
      {
        "id": "route-8-k-stop-14",
        "name": "Šurany, A.S.",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-8-k-stop-15",
        "name": "Dol. Krškany, zast. Záborského pri ubyt. Jasplastik",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      }
    ]
  },
  {
    "id": "route-9-a",
    "code": "9/A",
    "name": "Linka č. 9/A (9/1) - Kajal - Galanta - Váhovce - Pata - Báb - V.Zálužie - Lehota - Kynek - JLR",
    "stops": [
      {
        "id": "route-9-a-stop-1",
        "name": "Kajal, Požiarna zbrojnica",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-9-a-stop-2",
        "name": "Galanta, Kolónia II",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-9-a-stop-3",
        "name": "Váhovce, OcÚ",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-9-a-stop-4",
        "name": "Pata, nám.",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-9-a-stop-5",
        "name": "Báb, rázc.",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-9-a-stop-6",
        "name": "Veľké Zálužie, Horný Koniec",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      },
      {
        "id": "route-9-a-stop-7",
        "name": "Veľké Zálužie, OcÚ",
        "times": {
          "shift-1": "04:57",
          "shift-2": "12:57",
          "shift-3": "20:57"
        }
      },
      {
        "id": "route-9-a-stop-8",
        "name": "Veľké Zálužie, RD",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:58",
          "shift-3": "20:58"
        }
      },
      {
        "id": "route-9-a-stop-9",
        "name": "Lehota, RD",
        "times": {
          "shift-1": "05:02",
          "shift-2": "13:02",
          "shift-3": "21:02"
        }
      },
      {
        "id": "route-9-a-stop-10",
        "name": "Lehota, centrum",
        "times": {
          "shift-1": "05:03",
          "shift-2": "13:03",
          "shift-3": "21:03"
        }
      },
      {
        "id": "route-9-a-stop-11",
        "name": "Kynek, Potočná",
        "times": {
          "shift-1": "05:10",
          "shift-2": "13:10",
          "shift-3": "21:10"
        }
      }
    ]
  },
  {
    "id": "route-9-b",
    "code": "9/B",
    "name": "Linka č. 9/B (9/2) - Vozokany - Horné Saliby - Galanta - JLR",
    "stops": [
      {
        "id": "route-9-b-stop-1",
        "name": "Vozokany, Pri Kríži",
        "times": {
          "shift-1": "04:15",
          "shift-2": "12:15",
          "shift-3": "20:15"
        }
      },
      {
        "id": "route-9-b-stop-2",
        "name": "Horné Saliby, ubytovňa",
        "times": {
          "shift-1": "04:21",
          "shift-2": "12:21",
          "shift-3": "20:21"
        }
      },
      {
        "id": "route-9-b-stop-3",
        "name": "Horné Saliby, nám.",
        "times": {
          "shift-1": "04:24",
          "shift-2": "12:24",
          "shift-3": "20:24"
        }
      },
      {
        "id": "route-9-b-stop-4",
        "name": "Matúškovo, OcÚ",
        "times": {
          "shift-1": "04:31",
          "shift-2": "12:31",
          "shift-3": "20:31"
        }
      },
      {
        "id": "route-9-b-stop-5",
        "name": "Galanta, Vajanského (oproti Shell)",
        "times": {
          "shift-1": "04:35",
          "shift-2": "12:35",
          "shift-3": "20:35"
        }
      },
      {
        "id": "route-9-b-stop-6",
        "name": "Galanta, námestie",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-9-b-stop-7",
        "name": "Galanta, Sever I, trafostanica",
        "times": {
          "shift-1": "04:38",
          "shift-2": "12:38",
          "shift-3": "20:38"
        }
      },
      {
        "id": "route-9-b-stop-8",
        "name": "Galanta, Sever I, blok G2",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-9-b-stop-9",
        "name": "Galanta, dom dôchodcov",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-9-b-stop-10",
        "name": "Galanta, Sociálna poisťovňa",
        "times": {
          "shift-1": "04:43",
          "shift-2": "12:43",
          "shift-3": "20:43"
        }
      },
      {
        "id": "route-9-b-stop-11",
        "name": "Galanta, kaštiel",
        "times": {
          "shift-1": "04:44",
          "shift-2": "12:44",
          "shift-3": "20:44"
        }
      },
      {
        "id": "route-9-b-stop-12",
        "name": "Galanta, Kaufland",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      }
    ]
  },
  {
    "id": "route-10",
    "code": "10",
    "name": "Linka č. 10 - Komárno - Hurbanovo - Bajč - Nové Zámky - JLR",
    "stops": [
      {
        "id": "route-10-stop-1",
        "name": "Komárno, AS, nást. č. 5",
        "times": {
          "shift-1": "03:50",
          "shift-2": "11:45",
          "shift-3": "19:50"
        }
      },
      {
        "id": "route-10-stop-2",
        "name": "Hurbanovo - časť Holanovo",
        "times": {
          "shift-1": "04:03",
          "shift-2": "12:02",
          "shift-3": "20:03"
        }
      },
      {
        "id": "route-10-stop-3",
        "name": "Hurbanovo, Twins",
        "times": {
          "shift-1": "04:07",
          "shift-2": "12:05",
          "shift-3": "20:07"
        }
      },
      {
        "id": "route-10-stop-4",
        "name": "Hurbanovo Hvezdáreň",
        "times": {
          "shift-1": "04:08",
          "shift-2": "12:06",
          "shift-3": "20:08"
        }
      },
      {
        "id": "route-10-stop-5",
        "name": "Hurbanovo, pivovar",
        "times": {
          "shift-1": "04:10",
          "shift-2": "12:08",
          "shift-3": "20:10"
        }
      },
      {
        "id": "route-10-stop-6",
        "name": "Bajč, Kult.dom",
        "times": {
          "shift-1": "04:16",
          "shift-2": "12:13",
          "shift-3": "20:16"
        }
      },
      {
        "id": "route-10-stop-7",
        "name": "Nové Zámky, Osram",
        "times": {
          "shift-1": "04:22",
          "shift-2": "12:19",
          "shift-3": "20:22"
        }
      },
      {
        "id": "route-10-stop-8",
        "name": "Nové Zámky, Nábrežná 93",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:22",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-10-stop-9",
        "name": "Nové Zámky, Nábrežná 11",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:23",
          "shift-3": "20:27"
        }
      },
      {
        "id": "route-10-stop-10",
        "name": "Nové Zámky, Vajanského (Billa)",
        "times": {
          "shift-1": "04:28",
          "shift-2": "12:24",
          "shift-3": "20:28"
        }
      },
      {
        "id": "route-10-stop-11",
        "name": "Nové Zámky, Pri Kríži",
        "times": {
          "shift-1": "04:29",
          "shift-2": "12:25",
          "shift-3": "20:29"
        }
      }
    ]
  },
  {
    "id": "route-11",
    "code": "11",
    "name": "Linka č.11 - Šúrovce - Modranka - Linka č.2 - JLR",
    "stops": [
      {
        "id": "route-11-stop-1",
        "name": "Šúrovce, obecný úrad",
        "times": {
          "shift-1": "04:17",
          "shift-2": "12:17",
          "shift-3": "20:17"
        }
      },
      {
        "id": "route-11-stop-2",
        "name": "Modranka, pošta",
        "times": {
          "shift-1": "04:27",
          "shift-2": "12:27",
          "shift-3": "20:27"
        }
      }
    ]
  },
  {
    "id": "route-12",
    "code": "12",
    "name": "Linka č.12 - Dlhá nad Váhom - Šaľa - Močenok - Horná Kráľová - Hájske - JLR",
    "stops": [
      {
        "id": "route-12-stop-1",
        "name": "Dlhá N/Váhom-požiarna zbrojnica",
        "times": {
          "shift-1": "04:34",
          "shift-2": "12:34",
          "shift-3": "20:34"
        }
      },
      {
        "id": "route-12-stop-2",
        "name": "Veča - Cintorín",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-12-stop-3",
        "name": "Močenok - Benková",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-12-stop-4",
        "name": "Horná Kráľová -Potraviny",
        "times": {
          "shift-1": "04:51",
          "shift-2": "12:51",
          "shift-3": "20:51"
        }
      },
      {
        "id": "route-12-stop-5",
        "name": "Horná Kráľová -Družstvo",
        "times": {
          "shift-1": "04:53",
          "shift-2": "12:53",
          "shift-3": "20:53"
        }
      },
      {
        "id": "route-12-stop-6",
        "name": "Hájske -Obecný úrad",
        "times": {
          "shift-1": "04:56",
          "shift-2": "12:56",
          "shift-3": "20:56"
        }
      }
    ]
  },
  {
    "id": "route-13-a",
    "code": "13/A",
    "name": "Linka č.13/A - Nemečky - Prašice - Velušovce - Jacovce - Urmince - Horné Štitáre - Hajná N.V - Krtovce - M.Ripňany - Biskupová -Hruboňovo - Šurianky - JLR",
    "stops": [
      {
        "id": "route-13-a-stop-1",
        "name": "Nemečky-obecný úrad",
        "times": {
          "shift-1": "04:20",
          "shift-2": "12:20",
          "shift-3": "20:20"
        }
      },
      {
        "id": "route-13-a-stop-2",
        "name": "Prašice-ZŠ",
        "times": {
          "shift-1": "04:25",
          "shift-2": "12:25",
          "shift-3": "20:25"
        }
      },
      {
        "id": "route-13-a-stop-3",
        "name": "Prašice -RD",
        "times": {
          "shift-1": "04:26",
          "shift-2": "12:26",
          "shift-3": "20:26"
        }
      },
      {
        "id": "route-13-a-stop-4",
        "name": "Velušovce - Kostol",
        "times": {
          "shift-1": "04:30",
          "shift-2": "12:30",
          "shift-3": "20:30"
        }
      },
      {
        "id": "route-13-a-stop-5",
        "name": "Jacovce družstvo",
        "times": {
          "shift-1": "04:35",
          "shift-2": "12:35",
          "shift-3": "20:35"
        }
      },
      {
        "id": "route-13-a-stop-6",
        "name": "Jacovce záplotie",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-13-a-stop-7",
        "name": "Nemčice-Vinohrady",
        "times": {
          "shift-1": "04:40",
          "shift-2": "12:40",
          "shift-3": "20:40"
        }
      },
      {
        "id": "route-13-a-stop-8",
        "name": "Urmince-centrum",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-13-a-stop-9",
        "name": "Horné štitáre-centrum",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-13-a-stop-10",
        "name": "Hajna Nová Ves-Jednota",
        "times": {
          "shift-1": "04:52",
          "shift-2": "12:52",
          "shift-3": "20:52"
        }
      },
      {
        "id": "route-13-a-stop-11",
        "name": "Hajná Nová Ves-č.d. 103",
        "times": {
          "shift-1": "04:53",
          "shift-2": "12:53",
          "shift-3": "20:53"
        }
      },
      {
        "id": "route-13-a-stop-12",
        "name": "Krtovce-centrum",
        "times": {
          "shift-1": "04:55",
          "shift-2": "12:55",
          "shift-3": "20:55"
        }
      },
      {
        "id": "route-13-a-stop-13",
        "name": "Malé Ripňany-cintorín",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      },
      {
        "id": "route-13-a-stop-14",
        "name": "Biskupová -kostol",
        "times": {
          "shift-1": "05:06",
          "shift-2": "13:06",
          "shift-3": "21:06"
        }
      },
      {
        "id": "route-13-a-stop-15",
        "name": "Čermany-Jednota",
        "times": {
          "shift-1": "05:11",
          "shift-2": "13:11",
          "shift-3": "21:11"
        }
      },
      {
        "id": "route-13-a-stop-16",
        "name": "Hruboňovo-Výčapky",
        "times": {
          "shift-1": "05:14",
          "shift-2": "13:14",
          "shift-3": "21:14"
        }
      },
      {
        "id": "route-13-a-stop-17",
        "name": "Hruboňovo-Suľany",
        "times": {
          "shift-1": "05:15",
          "shift-2": "13:15",
          "shift-3": "21:15"
        }
      },
      {
        "id": "route-13-a-stop-18",
        "name": "Šurianky",
        "times": {
          "shift-1": "05:16",
          "shift-2": "13:16",
          "shift-3": "21:16"
        }
      }
    ]
  },
  {
    "id": "route-13-b",
    "code": "13/B",
    "name": "Linka č. 13/B - Bojná - Lipovník - Vozokany - Nitr.Blatnica - Radošina - Behynce - V.Ripňany - Merašice - Nové Sady - JLR",
    "stops": [
      {
        "id": "route-13-b-stop-1",
        "name": "Bojná -škola",
        "times": {
          "shift-1": "04:35",
          "shift-2": "12:35",
          "shift-3": "20:35"
        }
      },
      {
        "id": "route-13-b-stop-2",
        "name": "Bojná - kaplnka",
        "times": {
          "shift-1": "04:36",
          "shift-2": "12:36",
          "shift-3": "20:36"
        }
      },
      {
        "id": "route-13-b-stop-3",
        "name": "Lipovník - Domovina",
        "times": {
          "shift-1": "04:39",
          "shift-2": "12:39",
          "shift-3": "20:39"
        }
      },
      {
        "id": "route-13-b-stop-4",
        "name": "Lipovník - kostol",
        "times": {
          "shift-1": "04:41",
          "shift-2": "12:41",
          "shift-3": "20:41"
        }
      },
      {
        "id": "route-13-b-stop-5",
        "name": "Vozokany - hlavná cesta",
        "times": {
          "shift-1": "04:43",
          "shift-2": "12:43",
          "shift-3": "20:43"
        }
      },
      {
        "id": "route-13-b-stop-6",
        "name": "Nitrianska Blatnica - Námestie",
        "times": {
          "shift-1": "04:45",
          "shift-2": "12:45",
          "shift-3": "20:45"
        }
      },
      {
        "id": "route-13-b-stop-7",
        "name": "Nitrianska Blatnica - Domovina",
        "times": {
          "shift-1": "04:46",
          "shift-2": "12:46",
          "shift-3": "20:46"
        }
      },
      {
        "id": "route-13-b-stop-8",
        "name": "Radošina -rázcestie k železnici",
        "times": {
          "shift-1": "04:48",
          "shift-2": "12:48",
          "shift-3": "20:48"
        }
      },
      {
        "id": "route-13-b-stop-9",
        "name": "Radošina-rázcetie",
        "times": {
          "shift-1": "04:49",
          "shift-2": "12:49",
          "shift-3": "20:49"
        }
      },
      {
        "id": "route-13-b-stop-10",
        "name": "Radošina-Domovina",
        "times": {
          "shift-1": "04:50",
          "shift-2": "12:50",
          "shift-3": "20:50"
        }
      },
      {
        "id": "route-13-b-stop-11",
        "name": "Behynce - Domovina",
        "times": {
          "shift-1": "04:53",
          "shift-2": "12:53",
          "shift-3": "20:53"
        }
      },
      {
        "id": "route-13-b-stop-12",
        "name": "Behynce -Mlyn",
        "times": {
          "shift-1": "04:54",
          "shift-2": "12:54",
          "shift-3": "20:54"
        }
      },
      {
        "id": "route-13-b-stop-13",
        "name": "Veľké Ripňany -Jednota",
        "times": {
          "shift-1": "04:57",
          "shift-2": "12:57",
          "shift-3": "20:57"
        }
      },
      {
        "id": "route-13-b-stop-14",
        "name": "Velké Ripňany-Stavebniny",
        "times": {
          "shift-1": "04:58",
          "shift-2": "12:58",
          "shift-3": "20:58"
        }
      },
      {
        "id": "route-13-b-stop-15",
        "name": "Veľké Ripňany-Vieska",
        "times": {
          "shift-1": "04:59",
          "shift-2": "12:59",
          "shift-3": "20:59"
        }
      },
      {
        "id": "route-13-b-stop-16",
        "name": "Merašice-ihrisko",
        "times": {
          "shift-1": "05:04",
          "shift-2": "13:04",
          "shift-3": "21:04"
        }
      },
      {
        "id": "route-13-b-stop-17",
        "name": "Merašice-kostol",
        "times": {
          "shift-1": "05:05",
          "shift-2": "13:05",
          "shift-3": "21:05"
        }
      },
      {
        "id": "route-13-b-stop-18",
        "name": "Malé Zálužie-OÚ",
        "times": {
          "shift-1": "05:11",
          "shift-2": "13:11",
          "shift-3": "21:11"
        }
      },
      {
        "id": "route-13-b-stop-19",
        "name": "Nové Sady-domovina",
        "times": {
          "shift-1": "05:13",
          "shift-2": "13:13",
          "shift-3": "21:13"
        }
      },
      {
        "id": "route-13-b-stop-20",
        "name": "Nové Sady-ZŠ",
        "times": {
          "shift-1": "05:14",
          "shift-2": "13:14",
          "shift-3": "21:14"
        }
      }
    ]
  }
];
