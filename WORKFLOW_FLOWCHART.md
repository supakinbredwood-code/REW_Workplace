# REW Workplace — Cross-Functional Flowchart (Mermaid.js)

> เวอร์ชัน Mermaid ของ `WORKFLOW_FLOWCHART.txt` แปลงเพื่อดูใน VS Code
> วิธีดู: ติดตั้ง extension **Markdown Preview Mermaid Support** (bierner.markdown-mermaid)
> แล้วเปิดไฟล์นี้ กด `Ctrl+Shift+V` (Open Preview)

**Legend (lanes):** Employee = พนักงาน · Approver = ผู้อนุมัติ · Admin = ผู้ดูแลระบบ ·
Device = Browser API · UI = Component layer (`js/components/*.js`) ·
Service = Business logic (`js/services/*.js`) · Data = Data layer (`js/data/*.js` + localStorage)

สถาปัตยกรรม: client-side ล้วน ไม่มี backend, ข้อมูลส่วนใหญ่เป็น in-memory
(หายเมื่อ refresh) ยกเว้น session ที่ persist ผ่าน `localStorage["rewworkplace_session"]`

---

## 1. App Bootstrap & Session Restore

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["เปิดเบราว์เซอร์เข้า index.html"]
        r1["เห็นหน้า Sign in"]
        r2["เข้าหน้า Clock-in ทันที (ข้าม login)"]
    end
    subgraph UI["UI"]
        u1["main.js: DOMContentLoaded → init ทุกโมดูล<br/>(initNavigation, initClockInPanel,<br/>initApprovalPanel, initChatPanel,<br/>initProfilePanel, initLoginScreen)"]
        u2["main.js: showLogin()<br/>แสดง #loginScreen"]
        u3["main.js: onAuthReady()<br/>refreshClockInPanel + refreshApprovalPanel<br/>+ refreshProfilePanel + showApp()"]
    end
    subgraph SVC["Service"]
        s1["authService.js: restoreSession()"]
    end
    subgraph DAT["Data"]
        d1["localStorage: อ่าน key rewworkplace_session"]
    end

    e1 --> u1 --> s1 --> d1
    d1 --> dec1{"พบ session ที่ถูกต้องหรือไม่?<br/>(user.id ตรงกับ users[])"}
    dec1 -->|"ไม่พบ / ไม่มี"| u2 --> r1
    dec1 -->|"พบ"| u3 --> r2
```

---

## 2. Login

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["กรอก Username / Password ใน #loginForm<br/>กด Log In"]
        e2["แก้ไขแล้วลองใหม่"]
        e3["เข้าสู่หน้า Clock-in (หน้าแรกของแอป)"]
    end
    subgraph UI["UI"]
        u1["loginScreen.js: submit handler<br/>e.preventDefault(), อ่าน #loginUsername/#loginPassword"]
        u2["loginScreen.js: แสดง 'Invalid username or password.'<br/>ใน #loginError"]
        u3["loginScreen.js: form.reset() → onSuccess()"]
        u4["main.js: onAuthReady()<br/>refresh 3 panel + showApp()"]
    end
    subgraph SVC["Service: authService.js"]
        s1["login(username, password)"]
        s2["เก็บ currentUser (in-memory)<br/>localStorage.setItem('rewworkplace_session', user.id)"]
    end
    subgraph DAT["Data: orgData.js → users[]"]
        d1["หา user ที่ username/password ตรงกัน<br/>(exact match, plain text — demo data)"]
    end

    e1 --> u1 --> s1 --> d1
    d1 --> dec1{"พบผู้ใช้ที่ตรงกันหรือไม่?"}
    dec1 -->|"ไม่พบ"| u2 --> e2 --> e1
    dec1 -->|"พบ"| s2 --> u3 --> u4 --> e3
```

> หมายเหตุ: บัญชีทดสอบ (password: `1234` ทุกบัญชี) — aran, suda, kittipong, siriporn, pranee, somchai, anan

---

## 3. Clock In / Clock Out (พร้อมตรวจสอบพิกัด GPS)

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["กดปุ่ม #clockinActionBtn (Clock In / Clock Out)"]
        e2["เห็นสถานะอัปเดตทันทีบนหน้าจอ"]
    end
    subgraph UI["UI: clockInPanel.js"]
        u0["หลัง login: renderUserInfo, renderStatus,<br/>renderHistory, tick() ทุก 1 วิ"]
        u1["ตรวจสอบ getCurrentUser() ต้องไม่ null"]
        u2["แสดง 'Geolocation is not supported<br/>on this device.' → จบ"]
        u3["แสดง 'Checking location...'<br/>เรียก getCurrentPosition()"]
        u4["แสดง 'Location permission denied.<br/>Cannot clock in/out.' → จบ"]
        u5["แสดง 'No clock-in zone configured<br/>for your warehouse yet.' → จบ"]
        u6["แสดง 'Outside the allowed area (Xm away).' → จบ"]
        u7["แสดง 'Within the allowed area<br/>(Xm from center).'"]
        u8["renderStatus() + renderHistory()<br/>อัปเดต badge/ปุ่ม/Working Hours/History"]
    end
    subgraph DEV["Device"]
        dv1["Browser Geolocation API<br/>getCurrentPosition (enableHighAccuracy, timeout 10s)"]
    end
    subgraph SVC["Service"]
        s1["clockInService.js: checkZone(lat, lng)<br/>→ getZone(user.warehouse)"]
        s2["geo.js: distanceMeters(lat1,lng1,lat2,lng2)<br/>(Haversine formula)"]
        s3["clockInService.js: clockIn()<br/>status='working', clockInAt=now"]
        s4["clockInService.js: clockOut()<br/>status='clocked-out', clockOutAt=now"]
    end
    subgraph DAT["Data"]
        d1["warehouseZoneData.js:<br/>{lat, lng, radiusMeters} ของคลัง"]
        d2["statesByUser{}: เก็บ state แยกตาม user.id<br/>(in-memory, หายเมื่อ refresh)"]
    end

    u0 --> e1 --> u1 --> dec1{"navigator.geolocation รองรับหรือไม่?"}
    dec1 -->|"ไม่รองรับ"| u2
    dec1 -->|"รองรับ"| u3 --> dv1
    dv1 --> dec2{"ผลลัพธ์การขอสิทธิ์?"}
    dec2 -->|"ปฏิเสธ / timeout"| u4
    dec2 -->|"ได้พิกัดสำเร็จ"| s1 --> d1
    d1 --> dec3{"มี zone ตั้งค่าไว้หรือไม่?"}
    dec3 -->|"ไม่มี"| u5
    dec3 -->|"มี"| s2 --> dec4{"ระยะทาง ≤ radiusMeters?"}
    dec4 -->|"นอกรัศมี"| u6
    dec4 -->|"อยู่ในรัศมี"| u7 --> dec5{"สถานะปัจจุบันของผู้ใช้?"}
    dec5 -->|"not-clocked-in"| s3 --> d2
    dec5 -->|"working"| s4 --> d2
    d2 --> u8 --> e2
```

> หมายเหตุ: ปุ่ม Clock Out กดซ้ำไม่ได้เมื่อสถานะเป็น `clocked-out` (disabled) —
> ไม่มี flow ให้ Clock In ซ้ำในวันเดียวกันในโค้ดปัจจุบัน

---

## 4. Chat — เปิดแชทและส่งข้อความ

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e0["เข้าแท็บ Chat"]
        e1["(ทางเลือก) พิมพ์คำค้นใน #chatSearchInput"]
        e2["คลิกเลือกผู้ติดต่อ (li.chat-contact-item)"]
        e3["เห็นหน้าสนทนาเต็ม พร้อมข้อความเก่าทั้งหมด"]
        e4["พิมพ์ข้อความใน #chatMessageInput แล้วกดส่ง/Enter"]
        e5["เห็นข้อความของตัวเองปรากฏใน bubble ทันที"]
    end
    subgraph UI["UI: chatPanel.js"]
        u0["initChatPanel() → renderContactList()"]
        u1["event input → searchContacts(term)<br/>กรองด้วย toLowerCase().includes()"]
        u2["openChat(chatId): set activeChatId,<br/>contact.unread=0, เปิด input/ปุ่มส่ง,<br/>renderHeader, renderMessages, showConversationScreen"]
        u3["handleSend(): ตรวจสอบ text ไม่ว่าง<br/>และมี activeChatId"]
        u4["เคลียร์ input, renderMessages() (auto-scroll),<br/>renderContactList()"]
    end
    subgraph SVC["Service: chatService.js"]
        s1["filter contacts ตาม name"]
        s2["getMessages(chatId)"]
        s3["sendMessage(chatId, text):<br/>สร้าง timestamp, push {sender:'me',text,time},<br/>อัปเดต lastMessage/lastTime"]
    end
    subgraph DAT["Data: chatData.js"]
        d1["chatContacts[]"]
        d2["chatMessages{} (in-memory)"]
    end

    e0 --> u0 --> d1
    e1 --> u1 --> s1 --> d1
    e2 --> u2 --> s2 --> d2 --> e3
    e4 --> u3 --> s3 --> d2 --> u4 --> e5
```

> หมายเหตุ: demo ฝั่งเดียว — ไม่มีฝั่งคู่สนทนาโต้ตอบกลับจริง (ข้อความ "them" มีอยู่แล้วล่วงหน้าใน chatData.js เท่านั้น)

---

## 5. Approval — พนักงานสร้างคำขอ (Request OT / Request Item)

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["อยู่หน้า Approval (My Requests) กดปุ่ม FAB (+)"]
        e2["เลือกประเภทคำขอ: Request OT / Request Item"]
        e3a["กรอกฟอร์ม OT ครบ (Date, Hours, Reason)<br/>กด Submit Request"]
        e3b["กรอกฟอร์ม Item ครบ (Item Name, Quantity, Reason)<br/>กด Submit Request"]
        e4["กลับหน้า My Requests เห็นคำขอใหม่สถานะ pending"]
    end
    subgraph UI["UI: approvalPanel.js"]
        u1["showApprovalScreen('approvalChooserScreen')"]
        u2a["เปิดฟอร์ม approvalOtFormScreen"]
        u2b["เปิดฟอร์ม approvalItemFormScreen"]
        u3a["submitOtForm(e): e.preventDefault(),<br/>อ่าน otDate/otHours/otReason"]
        u3b["submitItemForm(e): e.preventDefault(),<br/>อ่าน itemName/itemQty/itemReason"]
        u4["form.reset() → setMode('myRequests')<br/>→ showApprovalScreen('approvalListScreen')<br/>→ renderList()"]
    end
    subgraph SVC["Service: approvalService.js"]
        s1["createRequest({typeKey, requesterId: user.id,<br/>approverId: user.approverId, details})"]
        s2["สร้าง object คำขอใหม่:<br/>id=AP-1000+seq, dateRequested=วันนี้, status='pending'"]
    end
    subgraph DAT["Data: approvalData.js"]
        d1["approvalRequests[]: push คำขอใหม่ (in-memory)"]
    end
    subgraph APR["Approver"]
        a1["(แยกเซสชัน) ล็อกอิน + เข้าโหมด 'To Approve'<br/>เห็นคำขอนี้รออยู่ → ต่อ Flow 6"]
    end

    e1 --> u1 --> e2
    e2 --> u2a --> e3a --> u3a --> s1
    e2 --> u2b --> e3b --> u3b --> s1
    s1 --> s2 --> d1 --> u4 --> e4 --> a1
```

> หมายเหตุ: `approverId` มาจาก `user.approverId` ที่ตั้งไว้ล่วงหน้าใน Admin > Organization (Flow 8) — ระบบไม่ได้ให้ผู้ใช้เลือกผู้อนุมัติเอง

---

## 6. Approval — ผู้อนุมัติพิจารณาคำขอ (Approve / Reject)

```mermaid
flowchart TD
    subgraph APR["Approver"]
        a1["ล็อกอินด้วยบัญชีที่มี role='approver'"]
        a2["คลิกแท็บโหมด 'To Approve'"]
        a3["คลิกที่แถวคำขอ → toggle 'expanded' ดูรายละเอียด"]
        a4["ดูรายละเอียดจบ (อ่านอย่างเดียว)"]
        a5["กดปุ่ม Approve หรือ Reject"]
        a6["เห็นผลการอนุมัติอัปเดตทันที"]
    end
    subgraph UI["UI: approvalPanel.js"]
        u1["refreshApprovalPanel(): ตรวจ user.role==='approver'<br/>→ เปิดใช้งาน #toApproveModeBtn"]
        u2["setMode('toApprove') → renderList()"]
        u3["(ทางเลือก) filterByStatus():<br/>All/Pending/Approved/Rejected"]
        u4["ไม่มีปุ่ม Approve/Reject ให้กด"]
        u5["แสดงปุ่ม Approve/Reject<br/>ใน approval-row-actions"]
        u6["e.stopPropagation(), อ่าน request id + action"]
        u7["renderList() ใหม่ → badge เปลี่ยน,<br/>ปุ่ม Approve/Reject หายไป"]
    end
    subgraph SVC["Service: approvalService.js"]
        s1["getRequestsForApprover(user.id)"]
        s2["updateStatus(requestId, 'approved'/'rejected')"]
    end
    subgraph DAT["Data: approvalData.js"]
        d1["filter approvalRequests ตาม approverId"]
        d2["หา request ตาม id → เปลี่ยน r.status<br/>(mutate in-memory)"]
    end
    subgraph EMP["Employee"]
        e1["(กลับมาเช็คโหมด My Requests)<br/>เห็นสถานะคำขอเปลี่ยนตามที่ผู้อนุมัติกด"]
    end

    a1 --> u1 --> a2 --> u2 --> s1 --> d1
    d1 --> u3 --> a3 --> dec1{"สถานะคำขอเป็น 'pending' หรือไม่?"}
    dec1 -->|"ไม่ใช่"| u4 --> a4
    dec1 -->|"ใช่"| u5 --> a5 --> u6 --> s2 --> d2 --> u7 --> a6 --> e1
```

> หมายเหตุสำคัญ: mutate array ใน memory ของแท็บเบราว์เซอร์เดียวกันเท่านั้น ไม่มีการซิงค์ข้ามอุปกรณ์/ผู้ใช้จริง (ไม่มี backend)

---

## 7. Profile — ดูและแก้ไขโปรไฟล์ (รวมเปลี่ยนรูป)

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["กดปุ่ม Edit Profile"]
        e2["(ทางเลือก) กด Change Photo → เลือกไฟล์รูป"]
        e3["แก้ไขช่องอื่น ๆ (Name/Email/Phone/Address)"]
        e4["กด Save Changes"]
        e5["กลับมาหน้าโปรไฟล์หลัก เห็นข้อมูลที่แก้ไขแล้ว"]
    end
    subgraph UI["UI: profilePanel.js"]
        u0["refreshProfilePanel() → renderProfile()<br/>(ปุ่ม Admin Settings ซ่อนถ้า !isAdmin)"]
        u1["openEditScreen(): เติมค่าฟอร์ม, renderAvatar(),<br/>showProfileScreen('profileEditScreen')"]
        u2["handlePhotoChange(e)"]
        u3["reader.onload → user.photo=dataURL<br/>→ renderAvatar() preview ทันที"]
        u4["handleEditSubmit(e): e.preventDefault(),<br/>เขียนค่าใหม่ทับ currentUser<br/>(name ว่าง = ไม่เขียนทับ)"]
        u5["renderProfile() ใหม่<br/>→ showProfileScreen('profileViewScreen')"]
    end
    subgraph DEV["Device"]
        dv1["FileReader API: readAsDataURL(file) → Base64"]
    end
    subgraph DAT["Data: orgData.js → users[]"]
        d1["mutate user object โดยตรง<br/>(currentUser = reference เดียวกับ users[] item)"]
    end

    u0 --> e1 --> u1
    u1 --> e2 --> u2 --> dv1 --> u3
    u3 --> e3 --> e4 --> u4 --> d1 --> u5 --> e5
```

---

## 8. Admin — ตั้งค่า Organization (ตำแหน่ง / คลัง / สายอนุมัติ)

```mermaid
flowchart TD
    subgraph ADM["Admin"]
        a1["จากหน้า Profile กดปุ่ม Admin Settings<br/>(เฉพาะ isAdmin — ค่าตั้งต้น: kittipong)"]
        a2["เปลี่ยนค่าใน dropdown (Position/Warehouse/Approver)"]
        a3["เห็นการเปลี่ยนแปลงมีผลทันที (auto-save ทุก change)"]
    end
    subgraph UI["UI: profilePanel.js"]
        u1["openAdminScreen(): guard isAdmin,<br/>renderOrgTable() + renderZoneTable(),<br/>showProfileScreen('profileAdminScreen')"]
        u2["render org-row ต่อพนักงาน:<br/>dropdown Position/Warehouse/Approver"]
        u3["event change บน select →<br/>อ่าน data-user-id, data-field"]
        u4["ถ้า userId ตรงกับ currentUser<br/>→ renderProfile() ใหม่ทันที"]
    end
    subgraph SVC["Service: orgService.js"]
        s1["getAllUsers() + getApprovers()<br/>(role==='approver')"]
        s2a["setPosition(userId, value)"]
        s2b["setWarehouse(userId, value)"]
        s2c["setApprover(userId, value||null)"]
    end
    subgraph DAT["Data: orgData.js → users[]"]
        d1["mutate field ที่เกี่ยวข้องโดยตรง (in-memory)<br/>→ ผลกับ Flow 5 (approverId) และ Flow 3 (warehouse)"]
    end

    a1 --> u1 --> s1 --> u2 --> a2 --> u3
    u3 --> dec1{"field คือช่องไหน?"}
    dec1 -->|"position"| s2a --> d1
    dec1 -->|"warehouse"| s2b --> d1
    dec1 -->|"approver"| s2c --> d1
    d1 --> u4 --> a3
```

---

## 9. Admin — ตั้งค่า Clock-in Zone (พิกัด GPS และรัศมี)

```mermaid
flowchart TD
    subgraph ADM["Admin"]
        a1["อยู่หน้า Admin Settings ส่วน 'Clock-In Zones'"]
        a2["แก้ไขค่าพิกัด/รัศมี ในช่อง input<br/>แล้วออกจากช่อง (blur/change)"]
        a3["ค่าใหม่มีผลทันที"]
    end
    subgraph UI["UI: profilePanel.js"]
        u1["renderZoneTable()"]
        u2["render การ์ดต่อคลัง:<br/>Latitude, Longitude, Radius (meters)"]
        u3["event change → อ่าน lat/lng/radiusMeters<br/>แปลงเป็น parseFloat()"]
        u4["return ทันที ไม่บันทึกอะไร<br/>(ป้องกันค่าพิกัดเพี้ยน)"]
    end
    subgraph SVC["Service: warehouseZoneService.js"]
        s1["getZone(code) สำหรับแต่ละ WAREHOUSES"]
        s2["setZone(code, {lat,lng,radiusMeters})"]
    end
    subgraph DAT["Data: warehouseZoneData.js"]
        d1["{lat,lng,radiusMeters} ปัจจุบัน<br/>(ว่างถ้ายังไม่ตั้ง)"]
        d2["เขียนทับ object ของคลังนั้นทั้งชุด (in-memory)"]
    end
    subgraph EMP["Employee"]
        e1["(ทุกคนที่สังกัดคลังนี้) ครั้งถัดไปที่ Clock In/Out<br/>ถูกตรวจสอบด้วยพิกัด/รัศมีใหม่ทันที (Flow 3: checkZone)"]
    end

    a1 --> u1 --> s1 --> d1 --> u2 --> a2 --> u3
    u3 --> dec1{"ค่าที่ได้เป็น NaN ตัวใดตัวหนึ่งหรือไม่?"}
    dec1 -->|"ใช่ (NaN)"| u4
    dec1 -->|"ไม่ใช่"| s2 --> d2 --> a3 --> e1
```

---

## 10. Logout

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["อยู่หน้า Profile กดปุ่ม Log Out"]
        e2["กลับมาที่หน้า Sign in (ต้อง login ใหม่)"]
    end
    subgraph UI["UI"]
        u1["profilePanel.js: click handler → logout()<br/>→ onLogout callback"]
        u2["main.js: showLogin()<br/>#appShell เอา class active ออก,<br/>#loginScreen ใส่ active"]
    end
    subgraph SVC["Service: authService.js"]
        s1["logout(): currentUser=null,<br/>localStorage.removeItem('rewworkplace_session')"]
    end
    subgraph DAT["Data: localStorage"]
        d1["ลบ session key ออก → ครั้งหน้าไม่ auto-login"]
    end

    e1 --> u1 --> s1 --> d1 --> u2 --> e2
```

> หมายเหตุ: state อื่น ๆ ที่เป็น in-memory (clock-in status, ข้อความแชท, คำขออนุมัติใหม่) ยังคงอยู่จนกว่าจะ refresh หน้า — ไม่ถูกล้างตอน logout

---

## 11. Bottom Navigation (การสลับหน้าจอหลัก)

```mermaid
flowchart TD
    subgraph EMP["Employee"]
        e1["คลิกไอคอนแถบล่าง: Clock / Approval / Chat / Profile"]
        e2["เห็นหน้าจอที่เลือกแสดงผลทันที<br/>(สลับด้วย CSS class เท่านั้น ไม่โหลดหน้าใหม่)"]
    end
    subgraph UI["UI: navigation.js"]
        u1["click handler บน .bottom-nav-link:<br/>e.preventDefault(), หา target = view-${data-view}"]
        u2["ลบ class active จากทุก .view/ลิงก์<br/>→ ใส่ active ให้ section เป้าหมาย + ลิงก์ที่คลิก"]
    end

    e1 --> u1 --> u2 --> e2
```

---

## สรุปความสัมพันธ์ระหว่าง Flow (Cross-Flow Dependencies)

```mermaid
flowchart LR
    F2["Flow 2<br/>Login"] -->|"currentUser"| ALL["ทุก Flow อื่น ๆ<br/>(ต้อง login ก่อนเสมอ)"]
    F8a["Flow 8<br/>Admin ตั้งค่า Approver"] -->|"user.approverId"| F5["Flow 5<br/>สร้างคำขอ"]
    F8b["Flow 8<br/>Admin ตั้งค่า Warehouse"] -->|"user.warehouse"| F3["Flow 3<br/>Clock In/Out"]
    F9["Flow 9<br/>Admin ตั้งค่า Zone<br/>(lat/lng/radius)"] -->|"checkZone()"| F3
    F5 -->|"approvalRequests[]<br/>(อ่าน/เขียนร่วมกัน)"| F6["Flow 6<br/>อนุมัติ / ปฏิเสธ"]
```
