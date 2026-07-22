const { useState, useEffect, useMemo } = React;
const RATE_TABLE = {
  \uCD08\uD2B9\uAE09\uC9C0: {
    currency: "USD",
    perDiem: { \uC0AC\uC7A5: 150, \uBD80\uC0AC\uC7A5\uC804\uBB34: 120, \uC0C1\uBB34: 110, \uC9C1\uC6D0: 90 },
    lodging: { \uC0AC\uC7A5: "\uC2E4\uBE44", \uBD80\uC0AC\uC7A5\uC804\uBB34: 200, \uC0C1\uBB34: 200, \uC9C1\uC6D0: 170 }
  },
  \uD2B9\uAE09\uC9C0: {
    currency: "USD",
    perDiem: { \uC0AC\uC7A5: 140, \uBD80\uC0AC\uC7A5\uC804\uBB34: 110, \uC0C1\uBB34: 100, \uC9C1\uC6D0: 85 },
    lodging: { \uC0AC\uC7A5: "\uC2E4\uBE44", \uBD80\uC0AC\uC7A5\uC804\uBB34: 180, \uC0C1\uBB34: 180, \uC9C1\uC6D0: 160 }
  },
  "1\uAE09\uC9C0": {
    currency: "USD",
    perDiem: { \uC0AC\uC7A5: 130, \uBD80\uC0AC\uC7A5\uC804\uBB34: 100, \uC0C1\uBB34: 90, \uC9C1\uC6D0: 80 },
    lodging: { \uC0AC\uC7A5: "\uC2E4\uBE44", \uBD80\uC0AC\uC7A5\uC804\uBB34: 160, \uC0C1\uBB34: 160, \uC9C1\uC6D0: 145 }
  },
  "2\uAE09\uC9C0": {
    currency: "USD",
    perDiem: { \uC0AC\uC7A5: 120, \uBD80\uC0AC\uC7A5\uC804\uBB34: 90, \uC0C1\uBB34: 80, \uC9C1\uC6D0: 75 },
    lodging: { \uC0AC\uC7A5: "\uC2E4\uBE44", \uBD80\uC0AC\uC7A5\uC804\uBB34: 125, \uC0C1\uBB34: 125, \uC9C1\uC6D0: 110 }
  },
  \uC77C\uBCF8: {
    currency: "JPY",
    perDiem: { \uC0AC\uC7A5: 21e3, \uBD80\uC0AC\uC7A5\uC804\uBB34: 18e3, \uC0C1\uBB34: 15e3, \uC9C1\uC6D0: 14e3 },
    lodging: { \uC0AC\uC7A5: "\uC2E4\uBE44", \uBD80\uC0AC\uC7A5\uC804\uBB34: 22200, \uC0C1\uBB34: 19100, \uC9C1\uC6D0: 16e3 }
  }
};
const POSITIONS = [
  { key: "\uC0AC\uC7A5", label: "\uC0AC\uC7A5" },
  { key: "\uBD80\uC0AC\uC7A5\uC804\uBB34", label: "\uBD80\uC0AC\uC7A5\xB7\uC804\uBB34" },
  { key: "\uC0C1\uBB34", label: "\uC0C1\uBB34\xB7\uC0C1\uBB34\uBCF4\xB7\uAC10\uC0AC" },
  { key: "\uC9C1\uC6D0", label: "\uC9C1\uC6D0" }
];
const DESTINATIONS = [
  // 아시아·오세아니아
  { name: "\uB3C4\uCFC4", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544", japan: true },
  { name: "\uD64D\uCF69", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC77C\uBCF8(\uB3C4\uCFC4 \uC678)", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544", japan: true },
  { name: "\uD0C0\uC774\uC644", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBCA0\uC774\uC9D5", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC2F1\uAC00\uD3EC\uB974", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC6B0\uC988\uBCA0\uD0A4\uC2A4\uD0C4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC778\uB3C4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uCE74\uC790\uD750\uC2A4\uD0C4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD30C\uD478\uC544\uB274\uAE30\uB2C8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uB274\uC9C8\uB79C\uB4DC", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uB9C8\uC15C\uAD70\uB3C4", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uB9D0\uB808\uC774\uC2DC\uC544", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBC29\uAE00\uB77C\uB370\uC2DC", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBCA0\uD2B8\uB0A8", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBE0C\uB8E8\uB098\uC774", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC544\uC81C\uB974\uBC14\uC774\uC794", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC624\uC2A4\uD2B8\uB808\uC77C\uB9AC\uC544", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC778\uB3C4\uB124\uC2DC\uC544", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC911\uAD6D", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD0A4\uB974\uAE30\uC2A4\uC2A4\uD0C4", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD0C0\uC774", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD130\uD0A4", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD30C\uD0A4\uC2A4\uD0C4", grade: "1\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uB124\uD314", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uB77C\uC624\uC2A4", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBBF8\uD06C\uB85C\uB124\uC2DC\uC544", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBABD\uACE8", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uBBF8\uC580\uB9C8", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uC2A4\uB9AC\uB791\uCE74", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uCE84\uBCF4\uB514\uC544", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD53C\uC9C0", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  { name: "\uD544\uB9AC\uD540", grade: "2\uAE09\uC9C0", region: "\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544" },
  // 아메리카
  { name: "\uB274\uC695", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC6CC\uC2F1\uD134", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uB85C\uC2A4\uC564\uC824\uB808\uC2A4", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC0CC\uD504\uB780\uC2DC\uC2A4\uCF54", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBA55\uC2DC\uCF54", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBBF8\uAD6D(\uADF8 \uC678)", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBE0C\uB77C\uC9C8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC138\uC774\uC178", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC138\uC778\uD2B8\uB8E8\uC2DC\uC544", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC138\uC778\uD2B8\uD0A4\uCE20\uB124\uBE44\uC2A4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC544\uB974\uD5E8\uD2F0\uB098", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC544\uC774\uD2F0", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC790\uBA54\uC774\uCE74", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uCE90\uB098\uB2E4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uAC00\uC774\uC544\uB098", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uB2C8\uCE74\uB77C\uACFC", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uB3C4\uBBF8\uB2C8\uCE74\uACF5\uD654\uAD6D", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBC14\uBCA0\uC774\uB3C4\uC2A4", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBCA0\uB124\uC218\uC5D8\uB77C", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBCA8\uB9AC\uC988", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC138\uC778\uD2B8\uBE48\uC13C\uD2B8\uADF8\uB808\uB098\uB518", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC564\uD2F0\uAC00\uBC14\uBD80\uB2E4", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC6B0\uB8E8\uACFC\uC774", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uCE60\uB808", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uCF54\uC2A4\uD0C0\uB9AC\uCE74", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uD2B8\uB9AC\uB2C8\uB2E4\uB4DC\uD1A0\uBC14\uACE0", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uD30C\uB098\uB9C8", grade: "1\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uACFC\uD14C\uB9D0\uB77C", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uBCFC\uB9AC\uBE44\uC544", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC218\uB9AC\uB0A8", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC5D0\uCF70\uB3C4\uB974", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uC5D8\uC0B4\uBC14\uB3C4\uB974", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uCF5C\uB86C\uBE44\uC544", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uD30C\uB77C\uACFC\uC774", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  { name: "\uD398\uB8E8", grade: "2\uAE09\uC9C0", region: "\uC544\uBA54\uB9AC\uCE74" },
  // 유럽
  { name: "\uB7F0\uB358", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD30C\uB9AC", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uBAA8\uC2A4\uD06C\uBC14", grade: "\uCD08\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uADF8\uB9AC\uC2A4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB124\uB35C\uB780\uB4DC", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB178\uB974\uC6E8\uC774", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB374\uB9C8\uD06C", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB3C5\uC77C", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB7EC\uC2DC\uC544", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB8E9\uC148\uBD80\uB974\uD06C", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uBCA8\uAE30\uC5D0", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC2A4\uC6E8\uB374", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC2A4\uC704\uC2A4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC2A4\uD398\uC778", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC544\uC774\uC2AC\uB780\uB4DC", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC601\uAD6D(\uB7F0\uB358 \uC678)", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC624\uC2A4\uD2B8\uB9AC\uC544", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC6B0\uD06C\uB77C\uC774\uB098", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC774\uD0C8\uB9AC\uC544", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD3EC\uB974\uD22C\uAC08", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD504\uB791\uC2A4(\uD30C\uB9AC \uC678)", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD540\uB780\uB4DC", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD5DD\uAC00\uB9AC", grade: "\uD2B9\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB8E8\uB9C8\uB2C8\uC544", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uB9AC\uD22C\uC544\uB2C8\uC544", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uBD88\uAC00\uB9AC\uC544", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC544\uC77C\uB79C\uB4DC", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC720\uACE0\uC2AC\uB77C\uBE44\uC544", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uCCB4\uCF54", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD3F4\uB780\uB4DC", grade: "1\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uBAB0\uB3C4\uBC14", grade: "2\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uBCF4\uC2A4\uB2C8\uC544\uD5E4\uB974\uCCB4\uACE0\uBE44\uB098", grade: "2\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC54C\uBC14\uB2C8\uC544", grade: "2\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uC5D0\uC2A4\uD1A0\uB2C8\uC544", grade: "2\uAE09\uC9C0", region: "\uC720\uB7FD" },
  { name: "\uD06C\uB85C\uC544\uD2F0\uC544", grade: "2\uAE09\uC9C0", region: "\uC720\uB7FD" },
  // 중동·아프리카
  { name: "\uAC00\uBD09", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB0A8\uC544\uD504\uB9AC\uCE74\uACF5\uD654\uAD6D", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB9AC\uBE44\uC544", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC218\uB2E8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC544\uB78D\uC5D0\uBBF8\uB9AC\uD2B8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC624\uB9CC", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC6B0\uAC04\uB2E4", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC774\uC2A4\uB77C\uC5D8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC774\uC9D1\uD2B8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCE74\uD0C0\uB974", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCF54\uD2B8\uB514\uBD80\uC544\uB974", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCF69\uACE0\uBBFC\uC8FC\uACF5\uD654\uAD6D", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCFE0\uC6E8\uC774\uD2B8", grade: "\uD2B9\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uAC00\uB098", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB098\uC774\uC9C0\uB9AC\uC544", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB2C8\uC81C\uB974", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB77C\uC774\uBCA0\uB9AC\uC544", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBAA8\uB85C\uCF54", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBAA8\uB9AC\uC154\uC2A4", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBAA8\uC7A0\uBE44\uD06C", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBC14\uB808\uC778", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBCF4\uCE20\uC640\uB098", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBD80\uB974\uD0A4\uB098\uD30C\uC18C", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC0AC\uC6B0\uB514\uC544\uB77C\uBE44\uC544", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC0C1\uD22C\uBA54\uD504\uB9B0\uC2DC\uD398", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC138\uB124\uAC08", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC2A4\uC640\uC9C8\uB780\uB4DC", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC2DC\uC5D0\uB77C\uB9AC\uC628", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC5D0\uD2F0\uC624\uD53C\uC544", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC694\uB974\uB2E8", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC911\uC559\uC544\uD504\uB9AC\uCE74\uACF5\uD654\uAD6D", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCE74\uBA54\uB8EC", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uCF00\uB0D0", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uD0C4\uC790\uB2C8\uC544", grade: "1\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uAC10\uBE44\uC544", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uAE30\uB2C8\uBE44\uC0AC\uC6B0", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uAE30\uB2C8", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB098\uBBF8\uBE44\uC544", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB808\uBC14\uB17C", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB808\uC18C\uD1A0", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB974\uC644\uB2E4", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB9C8\uB2E4\uAC00\uC2A4\uCE74\uB974", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB9D0\uB77C\uC704", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uB9D0\uB9AC", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uBAA8\uB9AC\uD0C0\uB2C8", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC18C\uB9D0\uB9AC\uC544", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC54C\uC81C\uB9AC", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC608\uBA58", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC774\uB77C\uD06C", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC774\uB780", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC7A0\uBE44\uC544", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uC9D0\uBC14\uBE0C\uC6E8", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" },
  { name: "\uD280\uB2C8\uC9C0", grade: "2\uAE09\uC9C0", region: "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74" }
];
const REGIONS = ["\uC544\uC2DC\uC544\xB7\uC624\uC138\uC544\uB2C8\uC544", "\uC544\uBA54\uB9AC\uCE74", "\uC720\uB7FD", "\uC911\uB3D9\xB7\uC544\uD504\uB9AC\uCE74"];
const MANUAL_CURRENCIES = ["KRW", "USD", "JPY", "EUR", "GBP", "CNY", "HKD", "TWD", "SGD", "THB", "VND", "AUD", "CAD", "CHF"];
const FIXED_MANUAL_CUR = ["USD", "JPY", "EUR"];
function DestinationPicker({ value, onChange, inpClass }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const boxRef = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const query = q.trim().toLowerCase();
  const matches = DESTINATIONS.filter(
    (d) => !query || d.name.toLowerCase().includes(query) || d.region.toLowerCase().includes(query) || d.grade.includes(query)
  );
  return /* @__PURE__ */ React.createElement("div", { className: "relative", ref: boxRef }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: inpClass,
      value: open ? q : value,
      placeholder: "\uCD9C\uC7A5\uC9C0 \uAC80\uC0C9 (\uC608: \uD0C0\uC774\uC644, \uBBF8\uAD6D, \uC720\uB7FD)",
      onFocus: () => {
        setQ("");
        setOpen(true);
      },
      onChange: (e) => {
        setQ(e.target.value);
        setOpen(true);
      }
    }
  ), open && /* @__PURE__ */ React.createElement("div", { className: "absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg" }, matches.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 text-xs text-slate-400" }, "\uAC80\uC0C9 \uACB0\uACFC \uC5C6\uC74C"), matches.map((d) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: d.name,
      type: "button",
      onMouseDown: (e) => {
        e.preventDefault();
        onChange(d.name);
        setOpen(false);
      },
      className: "w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 flex items-center justify-between gap-2"
    },
    /* @__PURE__ */ React.createElement("span", { className: "truncate" }, d.name),
    /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400 whitespace-nowrap" }, d.region, " \xB7 ", d.grade)
  ))));
}
const COMMS_DAILY_CAP = 2e4;
const BUFFER_MULT = 1.2;
const won = (n) => n == null || isNaN(n) ? "-" : Math.round(n).toLocaleString("ko-KR") + " \uC6D0";
const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};
function daysBetween(start, end) {
  if (!start || !end) return { days: 0, nights: 0, valid: false };
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || e < s) return { days: 0, nights: 0, valid: false };
  const diff = Math.round((e - s) / 864e5);
  return { days: diff + 1, nights: diff, valid: true };
}
let seq = 1;
const newTraveler = () => ({
  id: seq++,
  name: "",
  position: "\uC9C1\uC6D0",
  sameAsFirst: false,
  destination: "\uD0C0\uC774\uC644",
  gradeOverride: "",
  start: "",
  end: "",
  dayOverride: "",
  nightOverride: "",
  inflightNights: 0,
  // 기내숙박 0/1/2
  lodgingActual: { amount: "", currency: "USD" },
  // 사장 실비용
  registration: { amount: "", currency: "USD", buffer: false },
  airfare: { amount: "", currency: "USD", buffer: false },
  ticketFee: { amount: "", currency: "USD", buffer: false }
});
const STORAGE_KEY = "travelExpenseSavedTrips_v1";
const MAX_SAVED = 20;
const SB_URL = typeof window !== "undefined" && window.SUPABASE_URL || "";
const SB_KEY = typeof window !== "undefined" && window.SUPABASE_ANON_KEY || "";
const SB_TABLE = "travel_expense_trips";
const dbClient = SB_URL && SB_KEY && typeof supabase !== "undefined" && !SB_URL.includes("YOUR_") ? supabase.createClient(SB_URL, SB_KEY) : null;
const rowToEntry = (r) => ({
  id: r.id,
  savedAt: r.created_at,
  tripName: r.trip_name,
  count: r.count,
  total: Number(r.total),
  travelers: r.travelers
});
function App() {
  const [rates, setRates] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [euroForEurope, setEuroForEurope] = useState(true);
  const [manualRates, setManualRates] = useState({ USD: "", JPY: "", EUR: "" });
  const [tripName, setTripName] = useState("");
  const [travelers, setTravelers] = useState([newTraveler()]);
  const [saved, setSaved] = useState([]);
  const [mode] = useState(dbClient ? "db" : "local");
  const [notice, setNotice] = useState("");
  const fetchRates = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/fx");
      if (res.ok) {
        const d = await res.json();
        if (d && d.rates && d.rates.USD) {
          const kp = d.rates;
          const obj = { USD: 1, KRW: kp.USD };
          Object.keys(kp).forEach((c) => {
            if (c !== "USD" && kp[c]) obj[c] = kp.USD / kp[c];
          });
          setRates(obj);
          setUpdatedAt(`${d.source || "\uB9E4\uB9E4\uAE30\uC900\uC728"} \xB7 ${d.date || ""}`);
          setStatus("ok");
          return;
        }
      }
    } catch (e) {
    }
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
  useEffect(() => {
    fetchRates();
  }, []);
  const refreshList = async () => {
    if (dbClient) {
      const { data, error } = await dbClient.from(SB_TABLE).select("*").order("created_at", { ascending: false }).limit(MAX_SAVED);
      if (!error && data) setSaved(data.map(rowToEntry));
    } else {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setSaved(JSON.parse(raw));
      } catch (e) {
      }
    }
  };
  useEffect(() => {
    refreshList();
    if (dbClient) {
      const ch = dbClient.channel("trips-changes").on("postgres_changes", { event: "*", schema: "public", table: SB_TABLE }, () => refreshList()).subscribe();
      return () => {
        try {
          dbClient.removeChannel(ch);
        } catch (e) {
        }
      };
    }
  }, []);
  const persistLocal = (list) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
    }
  };
  const autoUnitKRW = (cur) => {
    if (cur === "KRW") return 1;
    if (status === "ok" && rates && rates.KRW && rates[cur]) return rates.KRW / rates[cur];
    return null;
  };
  const manualUnitKRW = (cur) => {
    if (cur === "KRW") return 1;
    const v = manualRates[cur];
    return v !== void 0 && v !== "" ? num(v) : null;
  };
  const unitKRW = (cur) => {
    if (cur === "KRW") return 1;
    if (manualMode) return manualUnitKRW(cur);
    const a = autoUnitKRW(cur);
    return a != null ? a : manualUnitKRW(cur);
  };
  const enableManual = () => {
    setManualRates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((c) => {
        if (!next[c]) {
          const a = autoUnitKRW(c);
          if (a != null) next[c] = String(Number(a.toFixed(4)));
        }
      });
      return next;
    });
    setManualMode(true);
  };
  const addManualCurrency = (cur) => {
    if (!cur) return;
    setManualRates((prev) => {
      if (prev[cur] !== void 0) return prev;
      const a = autoUnitKRW(cur);
      return { ...prev, [cur]: a != null ? String(Number(a.toFixed(4))) : "" };
    });
  };
  const update = (id, patch) => setTravelers((ts) => ts.map((t) => t.id === id ? { ...t, ...patch } : t));
  const addTraveler = () => setTravelers((ts) => [...ts, newTraveler()]);
  const removeTraveler = (id) => setTravelers((ts) => ts.length > 1 ? ts.filter((x) => x.id !== id) : ts);
  const first = travelers[0];
  const effDest = (t) => t.sameAsFirst && first ? first.destination : t.destination;
  const effStart = (t) => t.sameAsFirst && first ? first.start : t.start;
  const effEnd = (t) => t.sameAsFirst && first ? first.end : t.end;
  const effGradeOv = (t) => t.sameAsFirst && first ? first.gradeOverride : t.gradeOverride;
  const calc = (t) => {
    const dest = effDest(t);
    const destObj = DESTINATIONS.find((d) => d.name === dest);
    const isJapan = destObj == null ? void 0 : destObj.japan;
    const grade = isJapan ? "\uC77C\uBCF8" : effGradeOv(t) || (destObj == null ? void 0 : destObj.grade);
    const sched = grade ? RATE_TABLE[grade] : null;
    let cur = (sched == null ? void 0 : sched.currency) || "USD";
    if (euroForEurope && !isJapan && (destObj == null ? void 0 : destObj.region) === "\uC720\uB7FD") cur = "EUR";
    const auto = daysBetween(effStart(t), effEnd(t));
    const days = t.dayOverride !== "" ? num(t.dayOverride) : auto.days;
    const rawNights = t.nightOverride !== "" ? num(t.nightOverride) : auto.nights;
    const inflight = num(t.inflightNights);
    const paidNights = Math.max(0, rawNights - inflight);
    const perDiemFx = sched ? sched.perDiem[t.position] : 0;
    const lodgingFx = sched ? sched.lodging[t.position] : 0;
    const rate = unitKRW(cur);
    const perDiemKRW = rate != null ? perDiemFx * days * rate : null;
    const lodgingIsActual = lodgingFx === "\uC2E4\uBE44";
    let lodgingKRW = null;
    if (lodgingIsActual) {
      const r = unitKRW(t.lodgingActual.currency);
      lodgingKRW = r != null ? num(t.lodgingActual.amount) * r : null;
    } else if (rate != null && sched) {
      lodgingKRW = lodgingFx * paidNights * rate;
    }
    const conv = (f) => {
      const r = unitKRW(f.currency);
      if (r == null) return null;
      const base = num(f.amount) * r;
      return f.buffer ? base * BUFFER_MULT : base;
    };
    const regKRW = conv(t.registration);
    const airKRW = conv(t.airfare);
    const tkKRW = conv(t.ticketFee);
    const commsKRW = COMMS_DAILY_CAP * days;
    const parts = [perDiemKRW, lodgingKRW, regKRW, airKRW, tkKRW, commsKRW];
    const hasMissing = parts.some((p) => p == null);
    const total = parts.reduce((s, p) => s + (p || 0), 0);
    return {
      dest,
      destObj,
      isJapan,
      grade,
      cur,
      days,
      rawNights,
      inflight,
      paidNights,
      perDiemFx,
      lodgingFx,
      lodgingIsActual,
      perDiemKRW,
      lodgingKRW,
      regKRW,
      airKRW,
      tkKRW,
      commsKRW,
      total,
      hasMissing
    };
  };
  const results = useMemo(
    () => travelers.map((t) => ({ t, r: calc(t) })),
    [travelers, rates, status, manualMode, manualRates, euroForEurope]
  );
  const grandTotal = results.reduce((s, { r }) => s + r.total, 0);
  const anyMissing = results.some(({ r }) => r.hasMissing);
  const saveTrip = async () => {
    if (saved.length >= MAX_SAVED) {
      setNotice(`\uC800\uC7A5\uC740 \uCD5C\uB300 ${MAX_SAVED}\uAC1C\uAE4C\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4. \uAE30\uC874 \uD56D\uBAA9\uC744 \uC0AD\uC81C\uD55C \uB4A4 \uC800\uC7A5\uD558\uC138\uC694.`);
      return;
    }
    const payload = {
      trip_name: tripName || "\uC774\uB984\uC5C6\uB294 \uCD9C\uC7A5",
      count: travelers.length,
      total: Math.round(grandTotal),
      travelers: JSON.parse(JSON.stringify(travelers))
    };
    if (dbClient) {
      const { error } = await dbClient.from(SB_TABLE).insert(payload);
      if (error) {
        setNotice("\uC800\uC7A5 \uC2E4\uD328: " + error.message);
        return;
      }
      setNotice("\uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4 (\uD300 \uACF5\uC720).");
      refreshList();
    } else {
      const entry = {
        id: Date.now(),
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        tripName: payload.trip_name,
        count: payload.count,
        total: payload.total,
        travelers: payload.travelers
      };
      const list = [entry, ...saved];
      setSaved(list);
      persistLocal(list);
      setNotice("\uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    }
  };
  const deleteSaved = async (id) => {
    if (dbClient) {
      const { error } = await dbClient.from(SB_TABLE).delete().eq("id", id);
      if (error) {
        setNotice("\uC0AD\uC81C \uC2E4\uD328: " + error.message);
        return;
      }
      refreshList();
    } else {
      const list = saved.filter((s) => s.id !== id);
      setSaved(list);
      persistLocal(list);
    }
  };
  const loadSaved = (entry) => {
    setTripName(entry.tripName === "\uC774\uB984\uC5C6\uB294 \uCD9C\uC7A5" ? "" : entry.tripName);
    setTravelers(entry.travelers.map((t) => ({ ...t, id: seq++ })));
    setNotice(`'${entry.tripName}' \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const exportExcel = () => {
    if (typeof XLSX === "undefined") {
      setNotice("\uC5D1\uC140 \uBAA8\uB4C8 \uB85C\uB4DC \uC2E4\uD328 \xB7 \uC0C8\uB85C\uACE0\uCE68 \uD6C4 \uC7AC\uC2DC\uB3C4");
      return;
    }
    const header = ["\uCD9C\uC7A5\uC790", "\uC9C1\uAE09", "\uCD9C\uC7A5\uC9C0", "\uAE09\uC9C0", "\uD1B5\uD654", "\uCD9C\uBC1C\uC77C", "\uADC0\uAD6D\uC77C", "\uC77C\uC218", "\uBC15\uC218", "\uAE30\uB0B4\uC219\uBC15", "\uC77C\uB2F9(\uC6D0)", "\uC219\uBC15\uBE44(\uC6D0)", "\uD1B5\uC2E0\uBE44(\uC6D0)", "\uB4F1\uB85D\uBE44(\uC6D0)", "\uD56D\uACF5\uB8CC(\uC6D0)", "\uBC1C\uAD8C\uC218\uC218\uB8CC(\uC6D0)", "\uC18C\uACC4(\uC6D0)"];
    const rows = results.map(({ t, r }, i) => [
      t.name || `\uCD9C\uC7A5\uC790 ${i + 1}`,
      (POSITIONS.find((p) => p.key === t.position) || {}).label || t.position,
      r.dest,
      r.grade || "",
      r.cur,
      effStart(t) || "",
      effEnd(t) || "",
      r.days,
      r.rawNights,
      r.inflight,
      Math.round(r.perDiemKRW || 0),
      Math.round(r.lodgingKRW || 0),
      Math.round(r.commsKRW || 0),
      Math.round(r.regKRW || 0),
      Math.round(r.airKRW || 0),
      Math.round(r.tkKRW || 0),
      Math.round(r.total || 0)
    ]);
    const totalRow = ["\uD569\uACC4", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", Math.round(grandTotal)];
    const meta = [
      [`\uCD9C\uC7A5\uBA85: ${tripName || "(\uBBF8\uC785\uB825)"}`],
      [`\uD658\uC728: USD\u2192KRW ${usdKRW ? usdKRW.toFixed(2) : "-"}, JPY\u2192KRW ${jpyKRW ? jpyKRW.toFixed(4) : "-"}, EUR\u2192KRW ${eurKRW ? eurKRW.toFixed(2) : "-"}${manualMode ? " (\uC218\uB3D9)" : ""}`],
      [`\uC0DD\uC131\uC77C: ${(/* @__PURE__ */ new Date()).toLocaleString("ko-KR")}`],
      []
    ];
    const ws = XLSX.utils.aoa_to_sheet([...meta, header, ...rows, totalRow]);
    ws["!cols"] = header.map((h) => ({ wch: Math.max(9, h.length + 2) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "\uCD9C\uC7A5\uBE44");
    const fname = `\uCD9C\uC7A5\uBE44_${(tripName || "\uACC4\uC0B0").replace(/[^\w가-힣]/g, "_")}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fname);
  };
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);
  const usdKRW = unitKRW("USD");
  const jpyKRW = unitKRW("JPY");
  const eurKRW = unitKRW("EUR");
  const label = "block text-[11px] font-medium text-slate-500 mb-1";
  const inp = "w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-slate-100 disabled:text-slate-400";
  const money = "text-right tabular-nums";
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6", style: { fontFamily: "'Pretendard', system-ui, sans-serif" } }, /* @__PURE__ */ React.createElement("div", { className: "max-w-full mx-auto" }, /* @__PURE__ */ React.createElement("header", { className: "mb-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl md:text-2xl font-bold text-slate-900" }, "\uCD9C\uC7A5\uBE44 \uACC4\uC0B0\uAE30"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "\uC5EC\uBE44\uADDC\uC815 2024.07.01 \uAE30\uC900 \xB7 \uCD9C\uC7A5 1\uAC74\uC5D0 \uCD9C\uC7A5\uC790 \uC5EC\uB7EC \uBA85\uC744 \uB123\uACE0 \uACC4\uC0B0\xB7\uC800\uC7A5\uD558\uC138\uC694")), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-slate-700" }, "\uD658\uC728"), status === "loading" && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026"), status === "ok" && !manualMode && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" }, "\uC790\uB3D9 \uC870\uD68C\uB428"), manualMode && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200" }, "\uC218\uB3D9 \uC785\uB825 \uC0AC\uC6A9 \uC911"), status === "error" && !manualMode && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" }, "\uC790\uB3D9 \uC870\uD68C \uC2E4\uD328")), /* @__PURE__ */ React.createElement("div", { className: "text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "USD\u2192KRW "), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, usdKRW ? usdKRW.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "-")), /* @__PURE__ */ React.createElement("div", { className: "text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "JPY\u2192KRW "), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, jpyKRW ? jpyKRW.toLocaleString("ko-KR", { maximumFractionDigits: 4 }) : "-")), /* @__PURE__ */ React.createElement("div", { className: "text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "EUR\u2192KRW "), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, eurKRW ? eurKRW.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "-")), updatedAt && !manualMode && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uAE30\uC900: ", updatedAt), /* @__PURE__ */ React.createElement("button", { onClick: fetchRates, className: "text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 transition" }, "\uC0C8\uB85C\uACE0\uCE68"), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: manualMode, onChange: (e) => e.target.checked ? enableManual() : setManualMode(false) }), "\uD658\uC728 \uC218\uB3D9 \uC785\uB825"), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: euroForEurope, onChange: (e) => setEuroForEurope(e.target.checked) }), "\uC720\uB7FD \uC720\uB85C\uD654(EUR) \uC801\uC6A9")), (manualMode || status === "error") && /* @__PURE__ */ React.createElement("div", { className: "mt-3 border-t border-slate-100 pt-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-3 items-end" }, Object.keys(manualRates).map((cu) => /* @__PURE__ */ React.createElement("div", { key: cu }, /* @__PURE__ */ React.createElement("label", { className: label }, cu, " 1\uB2E8\uC704 = ? \uC6D0"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: inp + " " + money + " w-28",
      placeholder: "0",
      value: manualRates[cu],
      onChange: (e) => setManualRates((m) => ({ ...m, [cu]: e.target.value }))
    }
  ), !FIXED_MANUAL_CUR.includes(cu) && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "text-slate-300 hover:text-red-500 text-sm px-1",
      title: "\uD1B5\uD654 \uC0AD\uC81C",
      onClick: () => setManualRates((m) => {
        const n = { ...m };
        delete n[cu];
        return n;
      })
    },
    "\xD7"
  )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uD1B5\uD654 \uCD94\uAC00"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: inp + " w-28",
      value: "",
      onChange: (e) => {
        addManualCurrency(e.target.value);
        e.target.value = "";
      }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "\uFF0B \uC120\uD0DD"),
    MANUAL_CURRENCIES.filter((c) => c !== "KRW" && manualRates[c] === void 0).map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))
  ))), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-2" }, "\uC218\uB3D9 \uC785\uB825\uC744 \uCF1C\uBA74 \uC790\uB3D9 \uD658\uC728 \uB300\uC2E0 \uC704 \uAC12\uC774 \uC0AC\uC6A9\uB429\uB2C8\uB2E4. \uC815\uC0B0 \uAE30\uC900\uD658\uC728(\uC608: \uCD9C\uBC1C\uC77C \uCD5C\uCD08\uACE0\uC2DC \uB9E4\uB9E4\uAE30\uC900\uC728)\uC744 \uC9C1\uC811 \uB123\uC744 \uB54C \uC0AC\uC6A9\uD558\uC138\uC694."))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement("label", { className: "text-sm font-semibold text-slate-700 whitespace-nowrap" }, "\uCD9C\uC7A5\uBA85"), /* @__PURE__ */ React.createElement("input", { className: inp + " max-w-md", placeholder: "\uC608: Bio Asia Taiwan 2026 \uCD9C\uC7A5", value: tripName, onChange: (e) => setTripName(e.target.value) }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "\uCD9C\uC7A5\uC790 ", travelers.length, "\uBA85")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 overflow-x-auto pb-4" }, results.map(({ t, r }, idx) => {
    var _a, _b;
    const locked = t.sameAsFirst && idx > 0;
    return /* @__PURE__ */ React.createElement("div", { key: t.id, className: "shrink-0 w-[320px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 rounded-t-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-indigo-600 whitespace-nowrap" }, "\uCD9C\uC7A5\uC790 ", idx + 1), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "bg-transparent text-sm font-semibold text-slate-800 focus:outline-none w-full",
        placeholder: "\uC774\uB984",
        value: t.name,
        onChange: (e) => update(t.id, { name: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("button", { onClick: () => removeTraveler(t.id), className: "text-slate-300 hover:text-red-500 text-lg leading-none px-1", title: "\uC774 \uCD9C\uC7A5\uC790 \uC0AD\uC81C" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { className: "p-4 space-y-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uC9C1\uAE09"), /* @__PURE__ */ React.createElement("select", { className: inp, value: t.position, onChange: (e) => update(t.id, { position: e.target.value }) }, POSITIONS.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.key, value: p.key }, p.label)))), idx > 0 && /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-xs text-slate-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1.5 cursor-pointer" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: t.sameAsFirst, onChange: (e) => update(t.id, { sameAsFirst: e.target.checked }) }), "\uCD9C\uC7A5\uC790 1\uACFC \uB3D9\uC77C (\uCD9C\uC7A5\uC9C0\xB7\uC77C\uC815)"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uCD9C\uC7A5\uC9C0"), locked ? /* @__PURE__ */ React.createElement("div", { className: inp + " bg-slate-100 text-slate-500" }, effDest(t)) : /* @__PURE__ */ React.createElement(
      DestinationPicker,
      {
        inpClass: inp,
        value: t.destination,
        onChange: (name) => update(t.id, { destination: name, gradeOverride: "" })
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "mt-1 flex items-center gap-1 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100" }, r.grade || "\uAE09\uC9C0 \uBBF8\uC815"), r.isJapan && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100" }, "\uC5D4\uD654(JPY) \uC815\uC561"), !r.isJapan && r.cur === "EUR" && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100" }, "\uC720\uB85C\uD654(EUR)"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uCD9C\uBC1C\uC77C"), locked ? /* @__PURE__ */ React.createElement("div", { className: inp + " bg-slate-100 text-slate-500" }, effStart(t) || "-") : /* @__PURE__ */ React.createElement("input", { type: "date", className: inp, value: t.start, onChange: (e) => update(t.id, { start: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uADC0\uAD6D\uC77C"), locked ? /* @__PURE__ */ React.createElement("div", { className: inp + " bg-slate-100 text-slate-500" }, effEnd(t) || "-") : /* @__PURE__ */ React.createElement("input", { type: "date", className: inp, value: t.end, onChange: (e) => update(t.id, { end: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uC77C\uC218(\uC77C\uB2F9)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        className: inp + " " + money,
        value: t.dayOverride === "" ? r.days : t.dayOverride,
        onChange: (e) => update(t.id, { dayOverride: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uBC15\uC218(\uC804\uCCB4)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        className: inp + " " + money,
        value: t.nightOverride === "" ? r.rawNights : t.nightOverride,
        onChange: (e) => update(t.id, { nightOverride: e.target.value })
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-100 pt-3 space-y-3" }, /* @__PURE__ */ React.createElement(Row, { title: "\uC77C\uB2F9 (\uC790\uB3D9)", sub: `${((_a = r.perDiemFx) == null ? void 0 : _a.toLocaleString()) || "-"} ${r.cur} \xD7 ${r.days}\uC77C`, value: won(r.perDiemKRW) }), r.lodgingIsActual ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: label }, "\uC219\uBC15\uBE44 (\uC2E4\uBE44 \xB7 \uC0AC\uC7A5)"), /* @__PURE__ */ React.createElement(CurAmount, { inpClass: inp + " " + money, field: t.lodgingActual, onChange: (f) => update(t.id, { lodgingActual: f }) }), /* @__PURE__ */ React.createElement("div", { className: "text-right text-xs text-slate-500 mt-1" }, won(r.lodgingKRW))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-slate-700" }, "\uC219\uBC15\uBE44 (\uC790\uB3D9)"), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, ((_b = r.lodgingFx) == null ? void 0 : _b.toLocaleString()) || "-", " ", r.cur, " \xD7 ", r.paidNights, "\uBC15")), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-semibold text-slate-900 tabular-nums text-right" }, won(r.lodgingKRW))), /* @__PURE__ */ React.createElement("div", { className: "mt-1.5 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-500 whitespace-nowrap" }, "\uAE30\uB0B4\uC219\uBC15"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "px-1.5 py-1 text-xs rounded-md border border-slate-300 bg-white",
        value: t.inflightNights,
        onChange: (e) => update(t.id, { inflightNights: parseInt(e.target.value) })
      },
      /* @__PURE__ */ React.createElement("option", { value: 0 }, "\uC5C6\uC74C"),
      /* @__PURE__ */ React.createElement("option", { value: 1 }, "1\uC77C"),
      /* @__PURE__ */ React.createElement("option", { value: 2 }, "2\uC77C")
    ), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, "\uC219\uBC15\uC77C\uC5D0\uC11C \uCC28\uAC10"))), /* @__PURE__ */ React.createElement(Row, { title: "\uD1B5\uC2E0\uBE44 (\uC790\uB3D9)", sub: `${COMMS_DAILY_CAP.toLocaleString()}\uC6D0/\uC77C \xD7 ${r.days}\uC77C`, value: won(r.commsKRW) })), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-100 pt-3 space-y-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-semibold text-slate-400" }, "\uC9C1\uC811 \uC785\uB825 (\uC678\uD654 \u2192 \uC6D0 \uD658\uC0B0)"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(BufferLabel, { text: "\uB4F1\uB85D\uBE44", field: t.registration, onChange: (f) => update(t.id, { registration: f }) }), /* @__PURE__ */ React.createElement(CurAmount, { inpClass: inp + " " + money, field: t.registration, onChange: (f) => update(t.id, { registration: f }) }), /* @__PURE__ */ React.createElement("div", { className: "text-right text-xs text-slate-500 mt-1" }, won(r.regKRW))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(BufferLabel, { text: "\uD56D\uACF5\uB8CC", field: t.airfare, onChange: (f) => update(t.id, { airfare: f }) }), /* @__PURE__ */ React.createElement(CurAmount, { inpClass: inp + " " + money, field: t.airfare, onChange: (f) => update(t.id, { airfare: f }) }), /* @__PURE__ */ React.createElement("div", { className: "text-right text-xs text-slate-500 mt-1" }, won(r.airKRW))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(BufferLabel, { text: "\uBC1C\uAD8C\uC218\uC218\uB8CC", field: t.ticketFee, onChange: (f) => update(t.id, { ticketFee: f }) }), /* @__PURE__ */ React.createElement(CurAmount, { inpClass: inp + " " + money, field: t.ticketFee, onChange: (f) => update(t.id, { ticketFee: f }) }), /* @__PURE__ */ React.createElement("div", { className: "text-right text-xs text-slate-500 mt-1" }, won(r.tkKRW))))), /* @__PURE__ */ React.createElement("div", { className: "mt-auto px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-slate-500" }, "\uCD9C\uC7A5\uC790 \uC18C\uACC4"), /* @__PURE__ */ React.createElement("span", { className: "text-base font-bold text-slate-900 tabular-nums" }, won(r.total))), r.hasMissing && /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-amber-600 mt-1" }, "\uC77C\uBD80 \uD56D\uBAA9 \uD658\uC728 \uBBF8\uD655\uBCF4 \xB7 \uD655\uC778 \uD544\uC694")));
  }), /* @__PURE__ */ React.createElement("button", { onClick: addTraveler, className: "shrink-0 w-[120px] rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition flex flex-col items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl leading-none" }, "+"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, "\uCD9C\uC7A5\uC790 \uCD94\uAC00"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-slate-300" }, "\uC774 \uCD9C\uC7A5 \uD569\uACC4 (\uCD9C\uC7A5\uC790 ", travelers.length, "\uBA85)"), anyMissing && /* @__PURE__ */ React.createElement("span", { className: "ml-2 text-xs text-amber-300" }, "\xB7 \uC77C\uBD80 \uD658\uC728 \uBBF8\uD655\uBCF4")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold tabular-nums" }, won(grandTotal)), /* @__PURE__ */ React.createElement("button", { onClick: exportExcel, className: "text-sm px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 font-medium transition" }, "\uC5D1\uC140 \uB0B4\uBCF4\uB0B4\uAE30"), /* @__PURE__ */ React.createElement("button", { onClick: saveTrip, className: "text-sm px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 font-medium transition" }, "\uC800\uC7A5"))), notice && /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-xs text-indigo-600" }, notice), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-bold text-slate-700" }, "\uC800\uC7A5\uB41C \uCD9C\uC7A5 ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-normal" }, "(", saved.length, "/", MAX_SAVED, ")")), mode === "db" ? /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-emerald-600" }, "\uD300 \uACF5\uC720 \uC800\uC7A5 (Supabase) \xB7 \uC2E4\uC2DC\uAC04 \uBC18\uC601") : /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-amber-600" }, "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4 \xB7 \uACF5\uC720\uD558\uB824\uBA74 Supabase \uC124\uC815 \uD544\uC694")), saved.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center" }, "\uC800\uC7A5\uB41C \uCD9C\uC7A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC704\uC5D0\uC11C \uACC4\uC0B0 \uD6C4 \uC800\uC7A5\uC744 \uB20C\uB7EC\uBCF4\uC138\uC694.") : /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, saved.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.id, className: "bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-semibold text-slate-800 truncate" }, s.tripName), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, "\uCD9C\uC7A5\uC790 ", s.count, "\uBA85 \xB7 \uC800\uC7A5 ", new Date(s.savedAt).toLocaleString("ko-KR"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-900 tabular-nums" }, won(s.total)), /* @__PURE__ */ React.createElement("button", { onClick: () => loadSaved(s), className: "text-xs px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50" }, "\uBD88\uB7EC\uC624\uAE30"), /* @__PURE__ */ React.createElement("button", { onClick: () => deleteSaved(s.id), className: "text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50" }, "\uC0AD\uC81C")))))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-[11px] text-slate-500 space-y-1 leading-relaxed" }, /* @__PURE__ */ React.createElement("p", null, "\xB7 \uC77C\uB2F9 = \uC815\uC561 \xD7 \uC77C\uC218, \uC219\uBC15\uBE44 = \uC815\uC561 \xD7 (\uBC15\uC218 \u2212 \uAE30\uB0B4\uC219\uBC15\uC77C). \uD1B5\uC2E0\uBE44\uB294 20,000\uC6D0/\uC77C \xD7 \uC77C\uC218\uB85C \uC790\uB3D9 \uACC4\uC0B0\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\xB7 \uC0AC\uC7A5 \uC219\uBC15\uBE44\uB294 \uC2E4\uBE44\uC774\uBBC0\uB85C \uC9C1\uC811 \uC785\uB825\uD569\uB2C8\uB2E4. \uAE30\uB0B4\uC219\uBC15 \uCC28\uAC10\uC740 \uC815\uC561 \uC219\uBC15\uBE44\uC5D0\uB9CC \uC801\uC6A9\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\xB7 \uC77C\uBCF8(\uB3C4\uCFC4\xB7\uC77C\uBCF8)\uC740 \uC5D4\uD654 \uC815\uC561\uD45C\uB97C \uC801\uC6A9\uD569\uB2C8\uB2E4. \uADDC\uC815\uC0C1 \uB3C4\uCFC4=\uCD08\uD2B9\uAE09\uC9C0, \uC77C\uBCF8=\uD2B9\uAE09\uC9C0\uC774\uB098 \uC5D4\uD654 \uC815\uC561\uC740 \uD558\uB098\uBFD0\uC774\uB77C \uB3D9\uC77C \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4(\uD655\uC778 \uD544\uC694)."), /* @__PURE__ */ React.createElement("p", null, '\xB7 "\uC720\uB7FD \uC720\uB85C\uD654(EUR) \uC801\uC6A9"\uC744 \uCF1C\uBA74 \uC720\uB7FD \uC9C0\uC5ED \uC815\uC561\uC744 USD\uAC00 \uC544\uB2CC EUR\uB85C \uAC04\uC8FC\uD574 \uD658\uC0B0\uD569\uB2C8\uB2E4. \uADDC\uC815 \uC6D0\uD45C \uB2E8\uC704\uB294 $\uC774\uBBC0\uB85C, \uC720\uB7FD\uC744 \uC720\uB85C\uB85C \uC815\uC0B0\uD558\uB294 \uAC8C \uB9DE\uB294\uC9C0 \uADDC\uC815 \uD655\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.'), /* @__PURE__ */ React.createElement("p", null, '\xB7 \uD658\uC728\uC740 open.er-api.com \uC2DC\uC7A5 \uC911\uAC04\uD658\uC728(\uCC38\uACE0\uC6A9)\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC815\uC0B0 \uAE30\uC900\uD658\uC728\uC740 "\uD658\uC728 \uC218\uB3D9 \uC785\uB825"\uC73C\uB85C \uC9C1\uC811 \uB123\uC5B4 \uB9DE\uCD9C \uC218 \uC788\uC2B5\uB2C8\uB2E4.'))));
}
function CurAmount({ field, onChange, inpClass }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      inputMode: "decimal",
      className: inpClass,
      placeholder: "0",
      value: field.amount,
      onChange: (e) => onChange({ ...field, amount: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "px-1.5 py-1.5 text-sm rounded-md border border-slate-300 bg-white",
      value: field.currency,
      onChange: (e) => onChange({ ...field, currency: e.target.value })
    },
    MANUAL_CURRENCIES.map((cu) => /* @__PURE__ */ React.createElement("option", { key: cu, value: cu }, cu))
  ));
}
function BufferLabel({ text, field, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, text), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: !!field.buffer,
      onChange: (e) => onChange({ ...field, buffer: e.target.checked })
    }
  ), "\xD7", BUFFER_MULT, " \uBC84\uD37C"));
}
function Row({ title, sub, value }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-slate-700" }, title), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, sub)), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-semibold text-slate-900 tabular-nums text-right" }, value));
}
(async function boot() {
  try {
    if (typeof microsoftTeams !== "undefined" && microsoftTeams.app) {
      await microsoftTeams.app.initialize();
      const applyTheme = (theme) => {
        document.documentElement.dataset.teamsTheme = theme || "default";
      };
      try {
        const ctx = await microsoftTeams.app.getContext();
        applyTheme(ctx && ctx.app && ctx.app.theme);
      } catch (e) {
      }
      try {
        microsoftTeams.app.registerOnThemeChangeHandler(applyTheme);
      } catch (e) {
      }
      try {
        microsoftTeams.app.notifySuccess();
      } catch (e) {
      }
    }
  } catch (e) {
    console.info("Not running inside Teams, rendering standalone.");
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(App, null));
})();
