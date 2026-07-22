// Vercel 서버리스 함수: 한국수출입은행 현재환율 API (매매기준율)
// 앱은 같은 도메인의 /api/fx 만 호출 → CORS 없음, 인증키는 서버에만 존재.
//
// [필수 설정] Vercel 프로젝트 → Settings → Environment Variables 에
//   Key: EXIM_KEY   Value: 발급받은 인증키(vRXZ...로 시작하는 값)
// 를 추가한 뒤 재배포하세요.

const ENDPOINT = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";

function ymd(d) {
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0")
  );
}

// "JPY(100)" -> {code:"JPY", div:100}, "USD" -> {code:"USD", div:1}, "CNH" -> {code:"CNY"}
function baseCode(curUnit) {
  let div = 1;
  let code = (curUnit || "").trim();
  const m = code.match(/\((\d+)\)/);
  if (m) { div = parseInt(m[1], 10) || 1; code = code.replace(/\(\d+\)/, ""); }
  if (code === "CNH") code = "CNY"; // 위안화는 CNH로 고시됨 → 앱에서는 CNY로 사용
  return { code, div };
}

module.exports = async (req, res) => {
  const KEY = process.env.EXIM_KEY;
  if (!KEY) {
    res.status(500).json({ error: "EXIM_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인하세요." });
    return;
  }
  try {
    let rows = [];
    let usedDate = "";
    // 오늘부터 최대 7일 뒤로 가며 최근 영업일 데이터 탐색(주말·공휴일·개장 전 대응)
    for (let i = 0; i < 7; i++) {
      const sd = ymd(new Date(Date.now() - i * 86400000));
      const url = `${ENDPOINT}?authkey=${encodeURIComponent(KEY)}&searchdate=${sd}&data=AP01`;
      let arr;
      try {
        const r = await fetch(url);
        arr = await r.json();
      } catch (e) { arr = null; }
      if (Array.isArray(arr) && arr.some((x) => x.result === 1)) {
        rows = arr.filter((x) => x.result === 1);
        usedDate = sd;
        break;
      }
    }
    if (!rows.length) {
      res.status(502).json({ error: "환율 데이터를 찾지 못했습니다. 인증키/도메인/일일 호출한도(1,000회)를 확인하세요." });
      return;
    }
    const rates = {}; // 통화코드 -> 1단위당 원(KRW)
    for (const row of rows) {
      const { code, div } = baseCode(row.cur_unit);
      const v = parseFloat(String(row.deal_bas_r || "").replace(/,/g, ""));
      if (code && !isNaN(v)) rates[code] = v / div;
    }
    if (!rates.USD) {
      res.status(502).json({ error: "USD 항목을 찾지 못했습니다.", sample: rows.slice(0, 2) });
      return;
    }
    const dfmt =
      usedDate.length === 8
        ? `${usedDate.slice(0, 4)}-${usedDate.slice(4, 6)}-${usedDate.slice(6, 8)}`
        : usedDate;
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
    res.status(200).json({ source: "한국수출입은행 매매기준율", date: dfmt, rates });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
