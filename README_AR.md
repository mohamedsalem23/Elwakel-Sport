# ELWAKEL-SPORT - Premium Football Pitch Booking System

## 🏟️ نظام حجز ملاعب كرة قدم 5 أفراد احترافي

نظام حجز حديث وسهل الاستخدام لتحجيز ملاعب كرة قدم 5 أفراد. بواجهة جميلة وتجربة مستخدم احترافية.

![Tech Stack](https://img.shields.io/badge/Next.js-FastAPI-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## ✨ المميزات الرئيسية

- 🏆 **حجز سهل**: نام حجز بديهي مع تقويم ديناميكي وخيارات وقت مرنة
- 👥 **إدارة المستخدمين**: نظام تسجيل وتسجيل دخول آمن
- 📊 **لوحة تحكم**: لوحة تحكم شاملة للمستخدمين والمسؤولين
- 🎨 **تصميم عصري**: واجهة جميلة مع خلفية متحركة وتأثيرات بصرية
- 📱 **Responsive**: يعمل بشكل مثالي على جميع الأجهزة
- 🔒 **أمان عالي**: مصادقة JWT وتشفير كلمات المرور
- ⚡ **أداء سريع**: API سريع مع معالجة البيانات بكفاءة

---

## 📋 المتطلبات

### Backend:
- Python 3.8+
- FastAPI
- SQLAlchemy
- JWT Authentication
- SQLite

### Frontend:
- Node.js 14+
- Next.js 13+
- React 18+
- Axios للـ HTTP requests
- JS-Cookie لإدارة الـ Tokens

---

## 🚀 التثبيت والتشغيل

### 1️⃣ تثبيت Backend

```bash
# الانتقال إلى مجلد Backend
cd backend

# إنشاء بيئة افتراضية (اختياري)
python -m venv venv

# على Windows:
venv\Scripts\activate

# على macOS/Linux:
source venv/bin/activate

# تثبيت المكتبات
pip install -r requirements.txt

# تشغيل السيرفر
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

السيرفر سيعمل على: `http://localhost:8000`

### 2️⃣ تثبيت Frontend

```bash
# الانتقال إلى مجلد Frontend
cd frontend

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: `http://localhost:3000`

---

## 📖 API Documentation

الـ API متاح على `http://localhost:8000` بعد تشغيل السيرفر.

### نقاط النهاية الرئيسية:

#### المصادقة:
- `POST /token` - تسجيل الدخول (يرجع JWT Token)
- `POST /users/` - التسجيل (مستخدم جديد)
- `GET /users/me/` - الحصول على بيانات المستخدم الحالي

#### الحجوزات:
- `POST /bookings/` - إنشاء حجز جديد
- `GET /bookings/` - الحصول على حجوزات المستخدم
- `GET /bookings/all` - الحصول على جميع الحجوزات المتاحة (عام)
- `DELETE /bookings/{id}` - إلغاء حجز

#### الإدارة (Admin Only):
- `GET /admin/bookings` - عرض جميع الحجوزات
- `DELETE /admin/bookings/{id}` - حذف حجز

---

## 🔐 بيانات الدخول (للاختبار)

بعد التسجيل، استخدم بيانات حسابك للدخول.

### لإنشاء مسؤول:
قم بتعديل قاعدة البيانات مباشرة أو استخدم:
```python
# في database shell
UPDATE users SET is_admin = 1 WHERE username = 'your_username'
```

---

## 📁 هيكل المشروع

```
Elwakel-Sport/
├── backend/
│   ├── main.py              # نقطة البداية
│   ├── database.py          # إدارة قاعدة البيانات
│   ├── models.py            # نماذج المواد
│   ├── schemas.py           # نماذج التحقق
│   ├── crud.py              # عمليات CRUD
│   ├── auth.py              # منطق المصادقة
│   ├── requirements.txt      # المكتبات المطلوبة
│   └── routers/
│       ├── auth.py          # روتر المصادقة
│       ├── bookings.py      # روتر الحجوزات
│       └── admin.py         # روتر الإدارة
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── index.js                 # الصفحة الرئيسية
    │   │   ├── login.js                 # صفحة الدخول
    │   │   ├── signup.js                # صفحة التسجيل
    │   │   ├── _app.js                  # تطبيق رئيسي
    │   │   ├── _document.js             # مستند HTML
    │   │   └── dashboard/
    │   │       ├── user.js              # لوحة تحكم المستخدم
    │   │       └── admin.js             # لوحة تحكم المسؤول
    │   │
    │   ├── components/
    │   │   ├── Navbar.js                # شريط التنقل
    │   │   ├── BookingCalendar.js       # نموذج التقويم
    │   │   └── SlotCard.js              # بطاقة الحجز
    │   │
    │   ├── styles/
    │   │   ├── globals.css              # الأنماط العامة
    │   │   ├── Home.module.css          # أنماط الصفحة الرئيسية
    │   │   ├── Dashboard.module.css     # أنماط لوحة التحكم
    │   │   ├── BookingCalendar.module.css
    │   │   └── SlotCard.module.css
    │   │
    │   └── api/
    │       └── index.js                 # عميل API
    │
    ├── package.json
    ├── next.config.mjs
    └── jsconfig.json
```

---

## 🎯 تدفق الاستخدام

### للمستخدم العادي:
1. **البداية**: زيارة الموقع الرئيسي
2. **التسجيل**: إنشاء حساب جديد
3. **تسجيل الدخول**: الدخول بـ username و password
4. **الحجز**: اختيار التاريخ والوقت والمدة
5. **التأكيد**: تأكيد الحجز
6. **الإدارة**: عرض وإلغاء الحجوزات

### للمسؤول:
1. **الدخول**: تسجيل الدخول كمسؤول
2. **اللوحة**: الدخول إلى `http://localhost:3000/dashboard/admin`
3. **المراقبة**: عرض جميع الحجوزات مع الإحصائيات
4. **التحكم**: تصفية وحذف الحجوزات حسب الحاجة

---

## 🔧 المتغيرات البيئية

### Backend (اختياري):
```env
DATABASE_URL=sqlite:///./elwakel.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (اختياري):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 الاختبار

### اختبار النقاط النهائية:
استخدم Postman أو curl:

```bash
# تسجيل
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'

# تسجيل الدخول
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=pass123"
```

---

## 🤝 المساهمة

المشروع مفتوح للمساهمات. يرجى اتباع هذه الخطوات:

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License.

---

## 👨‍💻 المطورون

تم تطويره من قبل فريق ELWAKEL-SPORT

---

## 📞 الدعم والمساعدة

عند مواجهة أي مشاكل:

1. **تحقق من الأخطاء**: اطلع على console والـ logs
2. **قواعد البيانات**: تأكد من وجود SQLite مثبتة
3. **Ports**: تأكد من عدم استخدام ports 3000 و 8000
4. **Dependencies**: أعد تثبيت المكتبات `pip install -r requirements.txt`

---

## 🎓 التعليم والموارد

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [JWT Token](https://jwt.io/)

---

## 📊 الإحصائيات

- **عدد الملفات**: 25+
- **عدد المكونات**: 3 مكونات رئيسية
- **الصفحات**: 6 صفحات داخلية
- **خطوط الأكواد**: 2000+ سطر

---

## 🎉 ملاحظة أخيرة

شكراً لاستخدامك ELWAKEL-SPORT! نأمل أن يوفر لك تجربة حجز رائعة. إذا كان لديك أي اقتراحات لتحسين النظام، فلا تتردد في التواصل معنا.

**Happy Booking! ⚽**
