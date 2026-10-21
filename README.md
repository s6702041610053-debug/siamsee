# เขย่าเสี่ยงเซียมซี 🎋

แอปเสี่ยงเซียมซีด้วยการเขย่ามือถือจริง — Expo SDK 58 (React Native + TypeScript) รันบน iPhone ผ่าน Expo Go

## วิธีรันบน iPhone (จากเครื่อง Windows)

1. ติดตั้ง **Expo Go** จาก App Store บน iPhone
2. ให้คอมกับ iPhone อยู่ **Wi-Fi วงเดียวกัน**
3. ในโฟลเดอร์โปรเจกต์ รัน
   ```bash
   npm install
   npx expo start
   ```
4. เปิดแอป **กล้อง** ของ iPhone สแกน QR code ในเทอร์มินัล → แตะลิงก์ที่ขึ้นมา → เปิดใน Expo Go
5. ถ้าครั้งแรก Windows Firewall ถาม ให้กด **Allow** ให้ Node.js (Private network)

**ถ้าสแกนแล้วต่อไม่ติด** (Wi-Fi ที่มหาลัย/ออฟฟิศมักบล็อก) ใช้โหมด tunnel แทน:
```bash
npx expo start --tunnel
```

> Expo Go บน App Store ต้องรองรับ SDK 58 — ถ้าขึ้นว่า SDK ไม่ตรง ให้อัปเดต Expo Go เป็นเวอร์ชันล่าสุด

## วิธีเล่น

1. เลือกหมวด: ความรัก / การเรียน / การงาน / การเงิน
2. เขย่ามือถือจนแถบพลังเต็ม (เกณฑ์สุ่มใหม่ทุกรอบ 55–95%)
3. **เอียงหัวเครื่องลง** ต่ำกว่าแนวนอนประมาณ 10° → ไม้หล่น
4. อ่านใบทำนาย — บันทึกลงประวัติอัตโนมัติ

แตะปุ่ม **DEBUG** มุมขวาบนเพื่อดูกราฟเซนเซอร์แบบเรียลไทม์ (เหมาะตอนพรีเซนต์ ต่อจอ iPhone ขึ้นโปรเจกเตอร์ได้ด้วย Screen Mirroring)

## หลักการทำงานของเซนเซอร์

| เรื่อง | วิธีคำนวณ | ไฟล์ |
|---|---|---|
| แรงเขย่า | `force = |√(x²+y²+z²) − 1|` หน่วย g (Accelerometer 50 Hz) | `src/lib/useShakeEngine.ts` |
| นับการเขย่า | `force > 0.7g` และห่างจากครั้งก่อน ≥ 150 ms | 〃 |
| พลัง | +3% + 4%×force ต่อครั้ง (สูงสุด 12%) · หยุดเขย่า 350 ms แล้วลด 18%/วินาที | 〃 |
| พลังเต็ม | ถึงเกณฑ์สุ่ม → ค้างพลังไว้ 2.5 วินาทีให้มีเวลาเอียง | 〃 |
| มุมเอียง | low-pass filter หาทิศแรงโน้มถ่วง → `elevation = asin(−gy)` (ตั้งตรง = 90°, วางราบ = 0°, หัวชี้ลง < 0°) | 〃 |
| กระบอกสั่น | ใช้ความเร่งเชิงเส้น (ค่าดิบ − แรงโน้มถ่วง) ขยับ/โยกภาพตามแรงจริง | `src/components/Cylinder.tsx` |
| Gyroscope | แสดงความเร็วเชิงมุมในกราฟ Debug | `src/lib/useShakeEngine.ts` |

ปรับค่าทั้งหมดได้ที่ `SHAKE_CONFIG` ในไฟล์ `src/lib/useShakeEngine.ts`

## โครงสร้างไฟล์

```
src/
  app/                  หน้าจอ (Expo Router)
    _layout.tsx         Stack + ธีมแถบหัว
    index.tsx           หน้าเลือกหมวด
    shake.tsx           หน้าเขย่า + แอนิเมชันไม้หล่น + Debug
    result.tsx          หน้าใบทำนาย
    history.tsx         หน้าประวัติ
  components/           Cylinder, Stick, SensorGraph, Ornament
  data/fortunes.json    คำทำนาย 28 ใบ (ระดับดวง + คำแนะนำ 4 หมวด)
  lib/
    useShakeEngine.ts   ตรรกะเซนเซอร์ทั้งหมด
    feedback.ts         เสียง (expo-audio) + สั่น (expo-haptics)
    history.ts          AsyncStorage
assets/sounds/          เสียงไม้กระทบ (สังเคราะห์ขึ้นเอง)
```

## ทดสอบบนคอม (ไม่มีเซนเซอร์)

```bash
npx expo start --web
```
บนเว็บไม่มีเซนเซอร์ แอปจะสลับเป็นโหมด "แตะกระบอกเพื่อจำลองการเขย่า" ให้อัตโนมัติ
