# دليل التثبيت والتشغيل - ELWAKEL-SPORT

## 📋 قائمة المتطلبات

قبل البدء، تأكد من تثبيت:
- ✅ Python 3.8 أو أحدث
- ✅ Node.js 14 أو أحدث  
- ✅ npm (يأتي مع Node.js)
- ✅ Git (اختياري)

---

## 🖥️ الطريقة الأولى: الشروع السريع (تلقائي)

### على Windows:
```bash
# ملف دفعي يشغل كل شيء تلقائياً
double-click start.bat

# أو من Command Prompt:
start.bat
```

### على macOS/Linux:
```bash
# بحول البرنامج نصي قابل للتنفيذ أولاً
chmod +x start.sh

# ثم شغله
./start.sh
```

هذا سيقوم بـ:
1. إنشاء بيئة Python الافتراضية
2. تثبيت جميع المكتبات
3. تشغيل Backend على port 8000
4. تشغيل Frontend على port 3000

---

## 🛠️ الطريقة الثانية: التثبيت اليدوي

### الخطوة 1: تثبيت Backend

```bash
# الانتقال إلى مجلد Backend
cd backend

# إنشاء بيئة افتراضية (Virtual Environment)
python -m venv venv

# تفعيل البيئة الافتراضية:

# على Windows:
venv\Scripts\activate

# على macOS/Linux:
source venv/bin/activate

# تثبيت المكتبات المطلوبة
pip install -r requirements.txt

# تشغيل السيرفر
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### الخطوة 2: تثبيت Frontend

في نافذة Command Prompt/Terminal جديدة:

```bash
# الانتقال إلى مجلد Frontend
cd frontend

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

---

## 🌐 الوصول إلى التطبيق

بعد تشغيل كلا الخادمين، افتح المتصفح:

- **الموقع الرئيسي**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Docs**: http://localhost:8000/redoc

---

## 🎯 أول خطواتك

### 1. قم بإنشاء حساب جديد
- انتقل إلى http://localhost:3000
- اضغط على "Join Club"
- ملء البيانات:
  - Username: اختر اسم المستخدم
  - Email: بريدك الإلكتروني
  - Password: كلمة مرور قوية
  - Phone: رقم الهاتف (اختياري)

### 2. قم بتسجيل الدخول
- استخدم البيانات التي أنشأتها للتو

### 3. احجز ملعب
- اضغط على "Book Now" أو "Book New Slot"
- اختر التاريخ والوقت والمدة
- أكد الحجز

### 4. أدر حجوزاتك
- شاهد جميع حجوزاتك في "My Bookings"
- ألغِ الحجز إذا لزم الأمر

---

## 👨‍💼 كيفية أصبح مسؤول

للوصول إلى لوحة تحكم الإدارة:

### الطريقة 1: عبر SQLite Browser
1. حمل SQLite Browser من sqlite.org
2. افتح ملف `backend/elwakel.db`
3. اذهب إلى جدول `users`
4. اجد حسابك وعدّل قيمة `is_admin` إلى `1`

### الطريقة 2: عبر Python
```bash
cd backend

# تفعيل البيئة الافتراضية أولاً ثم:
python

# في Python shell:
from database import SessionLocal
from models import User

db = SessionLocal()
user = db.query(User).filter(User.username == "your_username").first()
if user:
    user.is_admin = True
    db.commit()
    print("تم ترقية المستخدم إلى مسؤول!")
db.close()
exit()
```

بعدها، اذهب إلى: http://localhost:3000/dashboard/admin

---

## 🔧 استكشاف الأخطاء

### المشكلة: Port 3000 مستخدم بالفعل
```bash
# على Windows:
netstat -ano | findstr :3000

# على macOS/Linux:
lsof -i :3000

# ثم قتل العملية
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

### المشكلة: متطلبات Python غير مثبتة
```bash
# تأكد من تفعيل البيئة الافتراضية ثم:
pip install -r requirements.txt
```

### المشكلة: لا توجد بيانات في النموذج
```bash
# احذف قاعدة البيانات وتعيد إنشاء جداولها
cd backend
rm elwakel.db  # على Windows: del elwakel.db
# ثم أعد تشغيل البرنامج
```

### المشكلة: خطأ CORS
تأكد من أن:
- Backend يعمل على `http://localhost:8000`
- Frontend يعمل على `http://localhost:3000`
- لا توجد تضاربات في الـ ports

---

## 📦 تحديث المكتبات

### تحديث Backend:
```bash
pip install -r requirements.txt --upgrade
```

### تحديث Frontend:
```bash
npm update
```

---

## 🚀 نصائح للأداء الأفضل

1. **استخدم أحدث إصدار من المتصفح**
2. **امسح ذاكرة التخزين المؤقت**: Ctrl+Shift+Delete
3. **استخدم الوضع الخاص** (Incognito) لتجنب مشاكل Cookies
4. **تأكد من سرعة الإنترنت**

---

## 📝 ملفات التكوين المهمة

- `backend/database.py` - إعدادات قاعدة البيانات
- `backend/auth.py` - إعدادات المصادقة والـ JWT
- `frontend/src/api/index.js` - إعدادات الـ API URL
- `frontend/next.config.mjs` - إعدادات Next.js

---

## 🧹 التنظيف والإعادة

### لإعادة تعيين النظام بالكامل:
```bash
# احذف ملفات قاعدة البيانات
rm backend/elwakel.db

# احذف المكتبات المثبتة (Backend)
rm -rf backend/venv

# احذف المكتبات المثبتة (Frontend)
rm -rf frontend/node_modules
rm frontend/package-lock.json

# ثم أعد التثبيت من جديد
```

---

## 🔐 ملاحظات الأمان

- ⚠️ **غيّر SECRET_KEY**: عدّل القيم في `backend/auth.py` قبل النشر
- ⚠️ **استخدم HTTPS**: في الإنتاج، استخدم اتصالات مشفرة
- ⚠️ **حماية قاعدة البيانات**: انسخ احتياطياً من ملف `.db`

---

## 📞 الدعم الإضافي

إذا واجهت مشاكل:

1. **تحقق من الـ console**: اضغط F12 لفتح أدوات المطور
2. **اقرأ الأخطاء**: غالباً تحتوي على تلميحات الحل
3. **أعد التشغيل**: أحياناً إعادة التشغيل تحل المشكلة
4. **امسح الـ Cache**: Ctrl+Shift+Delete

---

## ✅ قائمة التحقق من البدء

- [ ] Python 3.8+ مثبت
- [ ] Node.js 14+ مثبت
- [ ] Backend يعمل (http://localhost:8000)
- [ ] Frontend يعمل (http://localhost:3000)
- [ ] المتصفح يفتح الصفحة الرئيسية
- [ ] تم إنشاء حساب جديد
- [ ] تم تسجيل الدخول بنجاح
- [ ] تم حجز ملعب
- [ ] تم عرض الحجوزات

---

## 🎉 تم!

مبروك! أنت الآن جاهز للاستمتاع بـ ELWAKEL-SPORT!

Happy Booking! ⚽
