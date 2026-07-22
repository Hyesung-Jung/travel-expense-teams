const { useState, useEffect, useMemo } = React;

/*
  출장비 계산기 (프로토타입)
  - 여비규정 2024.07.01 기준 (단위: $, 일본만 ¥)
  - 오늘자 환율 자동 조회(open.er-api.com) + 실패 시 수동 입력
  - 출장별 열(칸) 추가 가능, 칸마다 직급 선택
*/

// ── 급지별 정액표 (일당 / 숙박비) ─────────────────────────────
// position key: 사장 / 부사장전무 / 상무 / 직원
const RATE_TABLE = {
  초특급지: {
    currency: "USD",
    perDiem: { 사장: 150, 부사장전무: 120, 상무: 110, 직원: 90 },
    lodging: { 사장: "실비", 부사장전무: 200, 상무: 200, 직원: 170 },
  },
  특급지: {
    currency: "USD",
    perDiem: { 사장: 140, 부사장전무: 110, 상무: 100, 직원: 85 },
    lodging: { 사장: "실비", 부사장전무: 180, 상무: 180, 직원: 160 },
  },
  "1급지": {
    currency: "USD",
    perDiem: { 사장: 130, 부사장전무: 100, 상무: 90, 직원: 80 },
    lodging: { 사장: "실비", 부사장전무: 160, 상무: 160, 직원: 145 },
  },
  "2급지": {
    currency: "USD",
    perDiem: { 사장: 120, 부사장전무: 90, 상무: 80, 직원: 75 },
    lodging: { 사장: "실비", 부사장전무: 125, 상무: 125, 직원: 110 },
  },
  일본: {
    currency: "JPY",
    perDiem: { 사장: 21000, 부사장전무: 18000, 상무: 15000, 직원: 14000 },
    lodging: { 사장: "실비", 부사장전무: 22200, 상무: 19100, 직원: 16000 },
  },
};

const POSITIONS = [
  { key: "사장", label: "사장" },
  { key: "부사장전무", label: "부사장·전무" },
  { key: "상무", label: "상무·상무보·감사" },
  { key: "직원", label: "직원" },
];

// ── 출장지 → 급지 데이터 (여비규정 지역표) ─────────────────────
// 일본(도쿄·일본)은 엔화 별도 정액표 적용 → japan: true
const DESTINATIONS = [
  // 아시아·오세아니아
  { name: "도쿄", grade: "초특급지", region: "아시아·오세아니아", japan: true },
  { name: "홍콩", grade: "초특급지", region: "아시아·오세아니아" },
  { name: "일본(도쿄 외)", grade: "특급지", region: "아시아·오세아니아", japan: true },
  { name: "타이완", grade: "특급지", region: "아시아·오세아니아" },
  { name: "베이징", grade: "특급지", region: "아시아·오세아니아" },
  { name: "싱가포르", grade: "특급지", region: "아시아·오세아니아" },
  { name: "우즈베키스탄", grade: "특급지", region: "아시아·오세아니아" },
  { name: "인도", grade: "특급지", region: "아시아·오세아니아" },
  { name: "카자흐스탄", grade: "특급지", region: "아시아·오세아니아" },
  { name: "파푸아뉴기니", grade: "특급지", region: "아시아·오세아니아" },
  { name: "뉴질랜드", grade: "1급지", region: "아시아·오세아니아" },
  { name: "마셜군도", grade: "1급지", region: "아시아·오세아니아" },
  { name: "말레이시아", grade: "1급지", region: "아시아·오세아니아" },
  { name: "방글라데시", grade: "1급지", region: "아시아·오세아니아" },
  { name: "베트남", grade: "1급지", region: "아시아·오세아니아" },
  { name: "브루나이", grade: "1급지", region: "아시아·오세아니아" },
  { name: "아제르바이잔", grade: "1급지", region: "아시아·오세아니아" },
  { name: "오스트레일리아", grade: "1급지", region: "아시아·오세아니아" },
  { name: "인도네시아", grade: "1급지", region: "아시아·오세아니아" },
  { name: "중국", grade: "1급지", region: "아시아·오세아니아" },
  { name: "키르기스스탄", grade: "1급지", region: "아시아·오세아니아" },
  { name: "타이", grade: "1급지", region: "아시아·오세아니아" },
  { name: "터키", grade: "1급지", region: "아시아·오세아니아" },
  { name: "파키스탄", grade: "1급지", region: "아시아·오세아니아" },
  { name: "네팔", grade: "2급지", region: "아시아·오세아니아" },
  { name: "라오스", grade: "2급지", region: "아시아·오세아니아" },
  { name: "미크로네시아", grade: "2급지", region: "아시아·오세아니아" },
  { name: "몽골", grade: "2급지", region: "아시아·오세아니아" },
  { name: "미얀마", grade: "2급지", region: "아시아·오세아니아" },
  { name: "스리랑카", grade: "2급지", region: "아시아·오세아니아" },
  { name: "캄보디아", grade: "2급지", region: "아시아·오세아니아" },
  { name: "피지", grade: "2급지", region: "아시아·오세아니아" },
  { name: "필리핀", grade: "2급지", region: "아시아·오세아니아" },
  // 아메리카
  { name: "뉴욕", grade: "초특급지", region: "아메리카" },
  { name: "워싱턴", grade: "초특급지", region: "아메리카" },
  { name: "로스앤젤레스", grade: "초특급지", region: "아메리카" },
  { name: "샌프란시스코", grade: "초특급지", region: "아메리카" },
  { name: "멕시코", grade: "특급지", region: "아메리카" },
  { name: "미국(그 외)", grade: "특급지", region: "아메리카" },
  { name: "브라질", grade: "특급지", region: "아메리카" },
  { name: "세이셸", grade: "특급지", region: "아메리카" },
  { name: "세인트루시아", grade: "특급지", region: "아메리카" },
  { name: "세인트키츠네비스", grade: "특급지", region: "아메리카" },
  { name: "아르헨티나", grade: "특급지", region: "아메리카" },
  { name: "아이티", grade: "특급지", region: "아메리카" },
  { name: "자메이카", grade: "특급지", region: "아메리카" },
  { name: "캐나다", grade: "특급지", region: "아메리카" },
  { name: "가이아나", grade: "1급지", region: "아메리카" },
  { name: "니카라과", grade: "1급지", region: "아메리카" },
  { name: "도미니카공화국", grade: "1급지", region: "아메리카" },
  { name: "바베이도스", grade: "1급지", region: "아메리카" },
  { name: "베네수엘라", grade: "1급지", region: "아메리카" },
  { name: "벨리즈", grade: "1급지", region: "아메리카" },
  { name: "세인트빈센트그레나딘", grade: "1급지", region: "아메리카" },
  { name: "앤티가바부다", grade: "1급지", region: "아메리카" },
  { name: "우루과이", grade: "1급지", region: "아메리카" },
  { name: "칠레", grade: "1급지", region: "아메리카" },
  { name: "코스타리카", grade: "1급지", region: "아메리카" },
  { name: "트리니다드토바고", grade: "1급지", region: "아메리카" },
  { name: "파나마", grade: "1급지", region: "아메리카" },
  { name: "과테말라", grade: "2급지", region: "아메리카" },
  { name: "볼리비아", grade: "2급지", region: "아메리카" },
  { name: "수리남", grade: "2급지", region: "아메리카" },
  { name: "에콰도르", grade: "2급지", region: "아메리카" },
  { name: "엘살바도르", grade: "2급지", region: "아메리카" },
  { name: "콜롬비아", grade: "2급지", region: "아메리카" },
  { name: "파라과이", grade: "2급지", region: "아메리카" },
  { name: "페루", grade: "2급지", region: "아메리카" },
  // 유럽
  { name: "런던", grade: "초특급지", region: "유럽" },
  { name: "파리", grade: "초특급지", region: "유럽" },
  { name: "모스크바", grade: "초특급지", region: "유럽" },
  { name: "그리스", grade: "특급지", region: "유럽" },
  { name: "네덜란드", grade: "특급지", region: "유럽" },
  { name: "노르웨이", grade: "특급지", region: "유럽" },
  { name: "덴마크", grade: "특급지", region: "유럽" },
  { name: "독일", grade: "특급지", region: "유럽" },
  { name: "러시아", grade: "특급지", region: "유럽" },
  { name: "룩셈부르크", grade: "특급지", region: "유럽" },
  { name: "벨기에", grade: "특급지", region: "유럽" },
  { name: "스웨덴", grade: "특급지", region: "유럽" },
  { name: "스위스", grade: "특급지", region: "유럽" },
  { name: "스페인", grade: "특급지", region: "유럽" },
  { name: "아이슬란드", grade: "특급지", region: "유럽" },
  { name: "영국(런던 외)", grade: "특급지", region: "유럽" },
  { name: "오스트리아", grade: "특급지", region: "유럽" },
  { name: "우크라이나", grade: "특급지", region: "유럽" },
  { name: "이탈리아", grade: "특급지", region: "유럽" },
  { name: "포르투갈", grade: "특급지", region: "유럽" },
  { name: "프랑스(파리 외)", grade: "특급지", region: "유럽" },
  { name: "핀란드", grade: "특급지", region: "유럽" },
  { name: "헝가리", grade: "특급지", region: "유럽" },
  { name: "루마니아", grade: "1급지", region: "유럽" },
  { name: "리투아니아", grade: "1급지", region: "유럽" },
  { name: "불가리아", grade: "1급지", region: "유럽" },
  { name: "아일랜드", grade: "1급지", region: "유럽" },
  { name: "유고슬라비아", grade: "1급지", region: "유럽" },
  { name: "체코", grade: "1급지", region: "유럽" },
  { name: "폴란드", grade: "1급지", region: "유럽" },
  { name: "몰도바", grade: "2급지", region: "유럽" },
  { name: "보스니아헤르체고비나", grade: "2급지", region: "유럽" },
  { name: "알바니아", grade: "2급지", region: "유럽" },
  { name: "에스토니아", grade: "2급지", region: "유럽" },
  { name: "크로아티아", grade: "2급지", region: "유럽" },
  // 중동·아프리카
  { name: "가봉", grade: "특급지", region: "중동·아프리카" },
  { name: "남아프리카공화국", grade: "특급지", region: "중동·아프리카" },
  { name: "리비아", grade: "특급지", region: "중동·아프리카" },
  { name: "수단", grade: "특급지", region: "중동·아프리카" },
  { name: "아랍에미리트", grade: "특급지", region: "중동·아프리카" },
  { name: "오만", grade: "특급지", region: "중동·아프리카" },
  { name: "우간다", grade: "특급지", region: "중동·아프리카" },
  { name: "이스라엘", grade: "특급지", region: "중동·아프리카" },
  { name: "이집트", grade: "특급지", region: "중동·아프리카" },
  { name: "카타르", grade: "특급지", region: "중동·아프리카" },
  { name: "코트디부아르", grade: "특급지", region: "중동·아프리카" },
  { name: "콩고민주공화국", grade: "특급지", region: "중동·아프리카" },
  { name: "쿠웨이트", grade: "특급지", region: "중동·아프리카" },
  { name: "가나", grade: "1급지", region: "중동·아프리카" },
  { name: "나이지리아", grade: "1급지", region: "중동·아프리카" },
  { name: "니제르", grade: "1급지", region: "중동·아프리카" },
  { name: "라이베리아", grade: "1급지", region: "중동·아프리카" },
  { name: "모로코", grade: "1급지", region: "중동·아프리카" },
  { name: "모리셔스", grade: "1급지", region: "중동·아프리카" },
  { name: "모잠비크", grade: "1급지", region: "중동·아프리카" },
  { name: "바레인", grade: "1급지", region: "중동·아프리카" },
  { name: "보츠와나", grade: "1급지", region: "중동·아프리카" },
  { name: "부르키나파소", grade: "1급지", region: "중동·아프리카" },
  { name: "사우디아라비아", grade: "1급지", region: "중동·아프리카" },
  { name: "상투메프린시페", grade: "1급지", region: "중동·아프리카" },
  { name: "세네갈", grade: "1급지", region: "중동·아프리카" },
  { name: "스와질란드", grade: "1급지", region: "중동·아프리카" },
  { name: "시에라리온", grade: "1급지", region: "중동·아프리카" },
  { name: "에티오피아", grade: "1급지", region: "중동·아프리카" },
  { name: "요르단", grade: "1급지", region: "중동·아프리카" },
  { name: "중앙아프리카공화국", grade: "1급지", region: "중동·아프리카" },
  { name: "카메룬", grade: "1급지", region: "중동·아프리카" },
  { name: "케냐", grade: "1급지", region: "중동·아프리카" },
  { name: "탄자니아", grade: "1급지", region: "중동·아프리카" },
  { name: "감비아", grade: "2급지", region: "중동·아프리카" },
  { name: "기니비사우", grade: "2급지", region: "중동·아프리카" },
  { name: "기니", grade: "2급지", region: "중동·아프리카" },
  { name: "나미비아", grade: "2급지", region: "중동·아프리카" },
  { name: "레바논", grade: "2급지", region: "중동·아프리카" },
  { name: "레소토", grade: "2급지", region: "중동·아프리카" },
  { name: "르완다", grade: "2급지", region: "중동·아프리카" },
  { name: "마다가스카르", grade: "2급지", region: "중동·아프리카" },
  { name: "말라위", grade: "2급지", region: "중동·아프리카" },
  { name: "말리", grade: "2급지", region: "중동·아프리카" },
  { name: "모리타니", grade: "2급지", region: "중동·아프리카" },
  { name: "소말리아", grade: "2급지", region: "중동·아프리카" },
  { name: "알제리", grade: "2급지", region: "중동·아프리카" },
  { name: "예멘", grade: "2급지", region: "중동·아프리카" },
  { name: "이라크", grade: "2급지", region: "중동·아프리카" },
  { name: "이란", grade: "2급지", region: "중동·아프리카" },
  { name: "잠비아", grade: "2급지", region: "중동·아프리카" },
  { name: "짐바브웨", grade: "2급지", region: "중동·아프리카" },
  { name: "튀니지", grade: "2급지", region: "중동·아프리카" },
];

const REGIONS = ["아시아·오세아니아", "아메리카", "유럽", "중동·아프리카"];
const MANUAL_CURRENCIES = ["KRW", "USD", "JPY", "EUR", "GBP", "CNY", "HKD", "TWD", "SGD", "THB", "VND", "AUD", "CAD", "CHF"];
const COMMS_DAILY_CAP = 20000; // 통신비 일 한도(원)

// ── 유틸 ──────────────────────────────────────────────────────
const won = (n) =>
  n == null || isNaN(n) ? "-" : Math.round(n).toLocaleString("ko-KR") + " 원";
const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};
function daysBetween(start, end) {
  if (!start || !end) return { days: 0, nights: 0, valid: false };
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || e < s) return { days: 0, nights: 0, valid: false };
  const diff = Math.round((e - s) / 86400000);
  return { days: diff + 1, nights: diff, valid: true };
}

let seq = 1;
const newTraveler = () => ({
  id: seq++,
  name: "",
  position: "직원",
  sameAsFirst: false,
  destination: "타이완",
  gradeOverride: "",
  start: "",
  end: "",
  dayOverride: "",
  nightOverride: "",
  inflightNights: 0, // 기내숙박 0/1/2
  lodgingActual: { amount: "", currency: "USD" }, // 사장 실비용
  registration: { amount: "", currency: "USD" },
  airfare: { amount: "", currency: "USD" },
  ticketFee: { amount: "", currency: "USD" },
});

const STORAGE_KEY = "travelExpenseSavedTrips_v1";
const MAX_SAVED = 20;

function App() {
  const [rates, setRates] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState("");
  const [manual, setManual] = useState({ USD: "", JPY: "" });

  const [tripName, setTripName] = useState("");
  const [travelers, setTravelers] = useState([newTraveler()]);

  const [saved, setSaved] = useState([]);
  const [storageOn, setStorageOn] = useState(false);
  const [notice, setNotice] = useState("");

  // ── 환율 ────────────────────────────────────────────────
  const fetchRates = async () => {
    setStatus("loading");
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data && data.result === "success" && data.rates) {
        setRates(data.rates);
        setUpdatedAt(data.time_last_update_utc || "");
        setStatus("ok");
      } else setStatus("error");
    } catch (e) {
      setStatus("error");
    }
  };
  useEffect(() => { fetchRates(); }, []);

  // ── 저장 리스트 로드 (localStorage) ─────────────────────
  useEffect(() => {
    const ok = typeof window !== "undefined" && !!window.localStorage;
    setStorageOn(ok);
    if (ok) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setSaved(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

  const persist = (list) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  };

  const unitKRW = (cur) => {
    if (cur === "KRW") return 1;
    if (status === "ok" && rates && rates.KRW && rates[cur]) return rates.KRW / rates[cur];
    if (cur === "USD" && manual.USD) return num(manual.USD);
    if (cur === "JPY" && manual.JPY) return num(manual.JPY);
    return null;
  };

  const update = (id, patch) =>
    setTravelers((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const addTraveler = () => setTravelers((ts) => [...ts, newTraveler()]);
  const removeTraveler = (id) =>
    setTravelers((ts) => (ts.length > 1 ? ts.filter((x) => x.id !== id) : ts));

  const first = travelers[0];
  const effDest = (t) => (t.sameAsFirst && first ? first.destination : t.destination);
  const effStart = (t) => (t.sameAsFirst && first ? first.start : t.start);
  const effEnd = (t) => (t.sameAsFirst && first ? first.end : t.end);
  const effGradeOv = (t) => (t.sameAsFirst && first ? first.gradeOverride : t.gradeOverride);

  const calc = (t) => {
    const dest = effDest(t);
    const destObj = DESTINATIONS.find((d) => d.name === dest);
    const isJapan = destObj?.japan;
    const grade = isJapan ? "일본" : effGradeOv(t) || destObj?.grade;
    const sched = grade ? RATE_TABLE[grade] : null;
    const cur = sched?.currency || "USD";

    const auto = daysBetween(effStart(t), effEnd(t));
    const days = t.dayOverride !== "" ? num(t.dayOverride) : auto.days;
    const rawNights = t.nightOverride !== "" ? num(t.nightOverride) : auto.nights;
    const inflight = num(t.inflightNights);
    const paidNights = Math.max(0, rawNights - inflight);

    const perDiemFx = sched ? sched.perDiem[t.position] : 0;
    const lodgingFx = sched ? sched.lodging[t.position] : 0;
    const rate = unitKRW(cur);

    const perDiemKRW = rate != null ? perDiemFx * days * rate : null;

    const lodgingIsActual = lodgingFx === "실비";
    let lodgingKRW = null;
    if (lodgingIsActual) {
      const r = unitKRW(t.lodgingActual.currency);
      lodgingKRW = r != null ? num(t.lodgingActual.amount) * r : null;
    } else if (rate != null && sched) {
      lodgingKRW = lodgingFx * paidNights * rate;
    }

    const conv = (f) => {
      const r = unitKRW(f.currency);
      return r != null ? num(f.amount) * r : null;
    };
    const regKRW = conv(t.registration);
    const airKRW = conv(t.airfare);
    const tkKRW = conv(t.ticketFee);
    const commsKRW = COMMS_DAILY_CAP * days; // 통신비 자동(일 한도 × 일수)

    const parts = [perDiemKRW, lodgingKRW, regKRW, airKRW, tkKRW, commsKRW];
    const hasMissing = parts.some((p) => p == null);
    const total = parts.reduce((s, p) => s + (p || 0), 0);

    return {
      dest, destObj, isJapan, grade, cur, days, rawNights, inflight, paidNights,
      perDiemFx, lodgingFx, lodgingIsActual,
      perDiemKRW, lodgingKRW, regKRW, airKRW, tkKRW, commsKRW,
      total, hasMissing,
    };
  };

  const results = useMemo(
    () => travelers.map((t) => ({ t, r: calc(t) })),
    [travelers, rates, status, manual]
  );
  const grandTotal = results.reduce((s, { r }) => s + r.total, 0);
  const anyMissing = results.some(({ r }) => r.hasMissing);

  // ── 저장/불러오기/삭제 ─────────────────────────────────
  const saveTrip = () => {
    if (saved.length >= MAX_SAVED) {
      setNotice(`저장은 최대 ${MAX_SAVED}개까지 가능합니다. 기존 항목을 삭제한 뒤 저장하세요.`);
      return;
    }
    const entry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      tripName: tripName || "이름없는 출장",
      count: travelers.length,
      total: grandTotal,
      travelers: JSON.parse(JSON.stringify(travelers)),
    };
    const list = [entry, ...saved];
    setSaved(list);
    persist(list);
    setNotice("저장되었습니다.");
  };
  const deleteSaved = (id) => {
    const list = saved.filter((s) => s.id !== id);
    setSaved(list);
    persist(list);
  };
  const loadSaved = (entry) => {
    setTripName(entry.tripName === "이름없는 출장" ? "" : entry.tripName);
    setTravelers(entry.travelers.map((t) => ({ ...t, id: seq++ })));
    setNotice(`'${entry.tripName}' 불러왔습니다.`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const usdKRW = unitKRW("USD");
  const jpyKRW = unitKRW("JPY");

  // ── 스타일 ──────────────────────────────────────────────
  const label = "block text-[11px] font-medium text-slate-500 mb-1";
  const inp = "w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-slate-100 disabled:text-slate-400";
  const money = "text-right tabular-nums";

  const CurAmount = ({ field, onChange }) => (
    <div className="flex gap-1">
      <input type="text" inputMode="decimal" className={inp + " " + money} placeholder="0"
        value={field.amount} onChange={(e) => onChange({ ...field, amount: e.target.value })} />
      <select className="px-1.5 py-1.5 text-sm rounded-md border border-slate-300 bg-white"
        value={field.currency} onChange={(e) => onChange({ ...field, currency: e.target.value })}>
        {MANUAL_CURRENCIES.map((cu) => <option key={cu} value={cu}>{cu}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6" style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}>
      <div className="max-w-full mx-auto">
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">출장비 계산기</h1>
          <p className="text-xs text-slate-500 mt-1">여비규정 2024.07.01 기준 · 출장 1건에 출장자 여러 명을 넣고 계산·저장하세요</p>
        </header>

        {/* 환율 패널 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">오늘자 환율</span>
              {status === "loading" && <span className="text-xs text-slate-400">불러오는 중…</span>}
              {status === "ok" && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">자동 조회됨</span>}
              {status === "error" && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">자동 조회 실패 · 수동 입력</span>}
            </div>
            <div className="text-sm"><span className="text-slate-500">USD→KRW </span><span className="font-semibold tabular-nums">{usdKRW ? usdKRW.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "-"}</span></div>
            <div className="text-sm"><span className="text-slate-500">JPY→KRW </span><span className="font-semibold tabular-nums">{jpyKRW ? jpyKRW.toLocaleString("ko-KR", { maximumFractionDigits: 4 }) : "-"}</span></div>
            {updatedAt && <div className="text-[11px] text-slate-400">기준: {updatedAt}</div>}
            <button onClick={fetchRates} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 transition">환율 새로고침</button>
          </div>
          {status === "error" && (
            <div className="mt-3 flex flex-wrap gap-4 items-end border-t border-slate-100 pt-3">
              <div><label className={label}>USD 1달러 = ? 원</label><input className={inp + " " + money + " w-32"} placeholder="예: 1380" value={manual.USD} onChange={(e) => setManual((m) => ({ ...m, USD: e.target.value }))} /></div>
              <div><label className={label}>JPY 1엔 = ? 원</label><input className={inp + " " + money + " w-32"} placeholder="예: 9.1" value={manual.JPY} onChange={(e) => setManual((m) => ({ ...m, JPY: e.target.value }))} /></div>
              <p className="text-[11px] text-slate-400 max-w-xs">기타 통화 환산에는 자동 환율이 필요합니다. 네트워크 복구 후 새로고침하세요.</p>
            </div>
          )}
        </div>

        {/* 출장명 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">출장명</label>
          <input className={inp + " max-w-md"} placeholder="예: Bio Asia Taiwan 2026 출장" value={tripName} onChange={(e) => setTripName(e.target.value)} />
          <span className="text-xs text-slate-400">출장자 {travelers.length}명</span>
        </div>

        {/* 출장자 칸 */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {results.map(({ t, r }, idx) => {
            const locked = t.sameAsFirst && idx > 0;
            return (
              <div key={t.id} className="shrink-0 w-[320px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-[11px] font-bold text-indigo-600 whitespace-nowrap">출장자 {idx + 1}</span>
                    <input className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none w-full" placeholder="이름"
                      value={t.name} onChange={(e) => update(t.id, { name: e.target.value })} />
                  </div>
                  <button onClick={() => removeTraveler(t.id)} className="text-slate-300 hover:text-red-500 text-lg leading-none px-1" title="이 출장자 삭제">×</button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <label className={label}>직급</label>
                    <select className={inp} value={t.position} onChange={(e) => update(t.id, { position: e.target.value })}>
                      {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>

                  {idx > 0 && (
                    <label className="flex items-center gap-2 text-xs text-slate-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1.5 cursor-pointer">
                      <input type="checkbox" checked={t.sameAsFirst} onChange={(e) => update(t.id, { sameAsFirst: e.target.checked })} />
                      출장자 1과 동일 (출장지·일정)
                    </label>
                  )}

                  {/* 출장지 */}
                  <div>
                    <label className={label}>출장지</label>
                    {locked ? (
                      <div className={inp + " bg-slate-100 text-slate-500"}>{effDest(t)}</div>
                    ) : (
                      <select className={inp} value={t.destination} onChange={(e) => update(t.id, { destination: e.target.value, gradeOverride: "" })}>
                        {REGIONS.map((rg) => (
                          <optgroup key={rg} label={rg}>
                            {DESTINATIONS.filter((d) => d.region === rg).map((d) => (
                              <option key={d.name} value={d.name}>{d.name} · {d.grade}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">{r.grade || "급지 미정"}</span>
                      {r.isJapan && <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">엔화(JPY) 정액</span>}
                    </div>
                  </div>

                  {/* 일정 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={label}>출발일</label>
                      {locked ? <div className={inp + " bg-slate-100 text-slate-500"}>{effStart(t) || "-"}</div>
                        : <input type="date" className={inp} value={t.start} onChange={(e) => update(t.id, { start: e.target.value })} />}
                    </div>
                    <div>
                      <label className={label}>귀국일</label>
                      {locked ? <div className={inp + " bg-slate-100 text-slate-500"}>{effEnd(t) || "-"}</div>
                        : <input type="date" className={inp} value={t.end} onChange={(e) => update(t.id, { end: e.target.value })} />}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={label}>일수(일당)</label>
                      <input type="text" inputMode="numeric" className={inp + " " + money}
                        value={t.dayOverride === "" ? r.days : t.dayOverride}
                        onChange={(e) => update(t.id, { dayOverride: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>박수(전체)</label>
                      <input type="text" inputMode="numeric" className={inp + " " + money}
                        value={t.nightOverride === "" ? r.rawNights : t.nightOverride}
                        onChange={(e) => update(t.id, { nightOverride: e.target.value })} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <Row title="일당 (자동)" sub={`${r.perDiemFx?.toLocaleString() || "-"} ${r.cur} × ${r.days}일`} value={won(r.perDiemKRW)} />

                    {/* 숙박비 + 기내숙박 */}
                    {r.lodgingIsActual ? (
                      <div>
                        <label className={label}>숙박비 (실비 · 사장)</label>
                        <CurAmount field={t.lodgingActual} onChange={(f) => update(t.id, { lodgingActual: f })} />
                        <div className="text-right text-xs text-slate-500 mt-1">{won(r.lodgingKRW)}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-slate-700">숙박비 (자동)</div>
                            <div className="text-[11px] text-slate-400">{r.lodgingFx?.toLocaleString() || "-"} {r.cur} × {r.paidNights}박</div>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 tabular-nums text-right">{won(r.lodgingKRW)}</div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">기내숙박</span>
                          <select className="px-1.5 py-1 text-xs rounded-md border border-slate-300 bg-white"
                            value={t.inflightNights} onChange={(e) => update(t.id, { inflightNights: parseInt(e.target.value) })}>
                            <option value={0}>없음</option>
                            <option value={1}>1일</option>
                            <option value={2}>2일</option>
                          </select>
                          <span className="text-[11px] text-slate-400">숙박일에서 차감</span>
                        </div>
                      </div>
                    )}

                    <Row title="통신비 (자동)" sub={`${COMMS_DAILY_CAP.toLocaleString()}원/일 × ${r.days}일`} value={won(r.commsKRW)} />
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-[11px] font-semibold text-slate-400">직접 입력 (외화 → 원 환산)</p>
                    <div><label className={label}>등록비</label><CurAmount field={t.registration} onChange={(f) => update(t.id, { registration: f })} /><div className="text-right text-xs text-slate-500 mt-1">{won(r.regKRW)}</div></div>
                    <div><label className={label}>항공료</label><CurAmount field={t.airfare} onChange={(f) => update(t.id, { airfare: f })} /><div className="text-right text-xs text-slate-500 mt-1">{won(r.airKRW)}</div></div>
                    <div><label className={label}>발권수수료</label><CurAmount field={t.ticketFee} onChange={(f) => update(t.id, { ticketFee: f })} /><div className="text-right text-xs text-slate-500 mt-1">{won(r.tkKRW)}</div></div>
                  </div>
                </div>

                <div className="mt-auto px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">출장자 소계</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{won(r.total)}</span>
                  </div>
                  {r.hasMissing && <p className="text-[11px] text-amber-600 mt-1">일부 항목 환율 미확보 · 확인 필요</p>}
                </div>
              </div>
            );
          })}

          <button onClick={addTraveler} className="shrink-0 w-[120px] rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition flex flex-col items-center justify-center gap-1">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-medium">출장자 추가</span>
          </button>
        </div>

        {/* 총계 + 저장 */}
        <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div>
            <span className="text-sm text-slate-300">이 출장 합계 (출장자 {travelers.length}명)</span>
            {anyMissing && <span className="ml-2 text-xs text-amber-300">· 일부 환율 미확보</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold tabular-nums">{won(grandTotal)}</span>
            <button onClick={saveTrip} className="text-sm px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 font-medium transition">저장</button>
          </div>
        </div>
        {notice && <div className="mt-2 text-xs text-indigo-600">{notice}</div>}

        {/* 저장 리스트 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-700">저장된 출장 <span className="text-slate-400 font-normal">({saved.length}/{MAX_SAVED})</span></h2>
            {!storageOn && <span className="text-[11px] text-amber-600">이 브라우저에 저장됩니다</span>}
          </div>
          {saved.length === 0 ? (
            <div className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center">저장된 출장이 없습니다. 위에서 계산 후 저장을 눌러보세요.</div>
          ) : (
            <div className="space-y-2">
              {saved.map((s) => (
                <div key={s.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{s.tripName}</div>
                    <div className="text-[11px] text-slate-400">출장자 {s.count}명 · 저장 {new Date(s.savedAt).toLocaleString("ko-KR")}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{won(s.total)}</span>
                    <button onClick={() => loadSaved(s)} className="text-xs px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50">불러오기</button>
                    <button onClick={() => deleteSaved(s.id)} className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="mt-6 text-[11px] text-slate-500 space-y-1 leading-relaxed">
          <p>· 일당 = 정액 × 일수, 숙박비 = 정액 × (박수 − 기내숙박일). 통신비는 20,000원/일 × 일수로 자동 계산됩니다.</p>
          <p>· 사장 숙박비는 실비이므로 직접 입력합니다. 기내숙박 차감은 정액 숙박비에만 적용됩니다.</p>
          <p>· 일본(도쿄·일본)은 엔화 정액표를 적용합니다. 규정상 도쿄=초특급지, 일본=특급지이나 엔화 정액은 하나뿐이라 동일 적용했습니다(확인 필요).</p>
          <p>· 환율은 open.er-api.com 시장 중간환율(참고용)입니다. 실제 정산 기준환율은 사내 규정에 맞춰 조정이 필요합니다.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ title, sub, value }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-700">{title}</div>
        <div className="text-[11px] text-slate-400">{sub}</div>
      </div>
      <div className="text-sm font-semibold text-slate-900 tabular-nums text-right">{value}</div>
    </div>
  );
}


// ── Microsoft Teams 초기화 + 마운트 ─────────────────────────
(async function boot() {
  try {
    if (typeof microsoftTeams !== "undefined" && microsoftTeams.app) {
      await microsoftTeams.app.initialize();
      // 테마 반영(선택): Teams 다크 모드일 때 바깥 배경만 맞춤
      const applyTheme = (theme) => {
        document.documentElement.dataset.teamsTheme = theme || "default";
      };
      try {
        const ctx = await microsoftTeams.app.getContext();
        applyTheme(ctx && ctx.app && ctx.app.theme);
      } catch (e) {}
      try { microsoftTeams.app.registerOnThemeChangeHandler(applyTheme); } catch (e) {}
      try { microsoftTeams.app.notifySuccess(); } catch (e) {}
    }
  } catch (e) {
    // Teams 밖(일반 브라우저)에서 실행 시: 그냥 단독 앱으로 동작
    console.info("Not running inside Teams, rendering standalone.");
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
})();
